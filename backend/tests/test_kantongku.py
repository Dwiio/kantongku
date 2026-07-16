"""KantongKu API tests - reviewer flows, wallets, transactions, debts, budgets, premium."""
import os
import uuid
import pytest
import requests

BASE_URL = os.environ.get("REACT_APP_BACKEND_URL", "").rstrip("/")
if not BASE_URL:
    # fallback to frontend/.env
    try:
        with open("/app/frontend/.env") as f:
            for line in f:
                if line.startswith("REACT_APP_BACKEND_URL="):
                    BASE_URL = line.split("=", 1)[1].strip().rstrip("/")
    except Exception:
        pass

API = f"{BASE_URL}/api"
REVIEWER_EMAIL = "reviewer@spendly.com"
REVIEWER_PASSWORD = "ReviewerPassword123!"


@pytest.fixture(scope="module")
def reviewer_token():
    r = requests.post(f"{API}/auth/login", json={"email": REVIEWER_EMAIL, "password": REVIEWER_PASSWORD})
    assert r.status_code == 200, f"login failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "premium"
    return data["token"]


@pytest.fixture(scope="module")
def rev_headers(reviewer_token):
    return {"Authorization": f"Bearer {reviewer_token}", "Content-Type": "application/json"}


@pytest.fixture(scope="module")
def free_user():
    email = f"TEST_free_{uuid.uuid4().hex[:8]}@example.com"
    pw = "TestPass123!"
    r = requests.post(f"{API}/auth/register", json={"email": email, "password": pw, "name": "Free User"})
    assert r.status_code == 200, f"register failed: {r.status_code} {r.text}"
    data = r.json()
    assert data["user"]["role"] == "free"
    return {"email": email, "password": pw, "token": data["token"], "id": data["user"]["id"]}


@pytest.fixture(scope="module")
def free_headers(free_user):
    return {"Authorization": f"Bearer {free_user['token']}", "Content-Type": "application/json"}


# ----------------- AUTH -----------------
class TestAuth:
    def test_reviewer_login_premium(self, reviewer_token):
        assert reviewer_token

    def test_login_bad_password(self):
        r = requests.post(f"{API}/auth/login", json={"email": REVIEWER_EMAIL, "password": "wrong"})
        assert r.status_code == 401

    def test_me_requires_auth(self):
        r = requests.get(f"{API}/auth/me")
        assert r.status_code == 401

    def test_wallets_requires_auth(self):
        r = requests.get(f"{API}/wallets")
        assert r.status_code == 401

    def test_summary_requires_auth(self):
        r = requests.get(f"{API}/summary")
        assert r.status_code == 401

    def test_me_returns_user(self, rev_headers):
        r = requests.get(f"{API}/auth/me", headers=rev_headers)
        assert r.status_code == 200
        assert r.json()["user"]["email"] == REVIEWER_EMAIL


# ----------------- REVIEWER SEED DATA -----------------
class TestReviewerSeed:
    def test_summary(self, rev_headers):
        r = requests.get(f"{API}/summary", headers=rev_headers)
        assert r.status_code == 200
        d = r.json()
        for k in ("total_balance", "monthly_income", "monthly_expense"):
            assert k in d
        assert isinstance(d["total_balance"], (int, float))

    def test_wallets_5(self, rev_headers):
        r = requests.get(f"{API}/wallets", headers=rev_headers)
        assert r.status_code == 200
        d = r.json()
        assert len(d["wallets"]) == 5, f"expected 5 wallets got {len(d['wallets'])}"
        assert d["limit"] is None  # premium => no limit

    def test_transactions_15(self, rev_headers):
        r = requests.get(f"{API}/transactions", headers=rev_headers)
        assert r.status_code == 200
        txs = r.json()["transactions"]
        assert len(txs) >= 15, f"expected >=15 tx got {len(txs)}"

    def test_debts_seed(self, rev_headers):
        r = requests.get(f"{API}/debts", headers=rev_headers)
        assert r.status_code == 200
        debts = r.json()["debts"]
        assert len(debts) >= 4
        types = {d["type"] for d in debts}
        assert "payable" in types and "receivable" in types

    def test_budgets_5(self, rev_headers):
        r = requests.get(f"{API}/budgets", headers=rev_headers)
        assert r.status_code == 200
        assert len(r.json()["budgets"]) >= 5


# ----------------- FREE USER FLOWS -----------------
class TestFreeUser:
    def test_new_user_has_default_wallet(self, free_headers):
        r = requests.get(f"{API}/wallets", headers=free_headers)
        assert r.status_code == 200
        d = r.json()
        assert d["limit"] == 2
        assert len(d["wallets"]) == 1
        assert d["wallets"][0]["name"] == "Tunai"

    def test_can_create_2nd_wallet(self, free_headers):
        r = requests.post(f"{API}/wallets", headers=free_headers,
                          json={"name": "TEST_Bank", "type": "bank", "balance": 100000})
        assert r.status_code == 200, r.text

    def test_3rd_wallet_blocked_403(self, free_headers):
        r = requests.post(f"{API}/wallets", headers=free_headers,
                          json={"name": "TEST_Extra", "type": "cash"})
        assert r.status_code == 403
        detail = r.json().get("detail", "")
        assert "Pro" in detail or "upgrade" in detail.lower() or "Upgrade" in detail

    def test_simulate_payment_upgrades_to_premium(self, free_headers):
        r = requests.post(f"{API}/premium/simulate-payment", headers=free_headers, json={"method": "qris"})
        assert r.status_code == 200
        assert r.json()["user"]["role"] == "premium"

    def test_after_upgrade_can_create_more_wallets(self, free_headers):
        r = requests.post(f"{API}/wallets", headers=free_headers,
                          json={"name": "TEST_AfterPro", "type": "cash"})
        assert r.status_code == 200

    def test_wallets_limit_null_after_premium(self, free_headers):
        r = requests.get(f"{API}/wallets", headers=free_headers)
        assert r.json()["limit"] is None


# ----------------- TRANSACTION balance side-effects -----------------
class TestTransactionBalance:
    def test_income_updates_wallet_balance(self, rev_headers):
        wallets = requests.get(f"{API}/wallets", headers=rev_headers).json()["wallets"]
        w = wallets[0]
        before = w["balance"]
        r = requests.post(f"{API}/transactions", headers=rev_headers, json={
            "wallet_id": w["id"], "type": "income", "amount": 12345,
            "category": "TEST", "note": "TEST_income", "date": "2026-01-15T10:00:00"
        })
        assert r.status_code == 200
        tx_id = r.json()["id"]
        w2 = next(x for x in requests.get(f"{API}/wallets", headers=rev_headers).json()["wallets"] if x["id"] == w["id"])
        assert abs(w2["balance"] - (before + 12345)) < 0.01

        # DELETE reverts
        d = requests.delete(f"{API}/transactions/{tx_id}", headers=rev_headers)
        assert d.status_code == 200
        w3 = next(x for x in requests.get(f"{API}/wallets", headers=rev_headers).json()["wallets"] if x["id"] == w["id"])
        assert abs(w3["balance"] - before) < 0.01

    def test_expense_decreases_balance(self, rev_headers):
        wallets = requests.get(f"{API}/wallets", headers=rev_headers).json()["wallets"]
        w = wallets[0]
        before = w["balance"]
        r = requests.post(f"{API}/transactions", headers=rev_headers, json={
            "wallet_id": w["id"], "type": "expense", "amount": 5000,
            "category": "TEST", "note": "TEST_expense", "date": "2026-01-15T10:00:00"
        })
        assert r.status_code == 200
        tx_id = r.json()["id"]
        w2 = next(x for x in requests.get(f"{API}/wallets", headers=rev_headers).json()["wallets"] if x["id"] == w["id"])
        assert abs(w2["balance"] - (before - 5000)) < 0.01
        requests.delete(f"{API}/transactions/{tx_id}", headers=rev_headers)


# ----------------- DEBT + BUDGET CRUD -----------------
class TestCRUD:
    def test_debt_create_update_delete(self, rev_headers):
        r = requests.post(f"{API}/debts", headers=rev_headers, json={
            "type": "payable", "person": "TEST_Person", "amount": 10000, "note": "TEST"
        })
        assert r.status_code == 200
        did = r.json()["id"]
        u = requests.patch(f"{API}/debts/{did}", headers=rev_headers, json={"settled": True})
        assert u.status_code == 200 and u.json()["settled"] is True
        d = requests.delete(f"{API}/debts/{did}", headers=rev_headers)
        assert d.status_code == 200

    def test_budget_create_delete(self, rev_headers):
        r = requests.post(f"{API}/budgets", headers=rev_headers, json={
            "category": "TEST_Cat", "amount": 100000, "period": "monthly"
        })
        assert r.status_code == 200
        bid = r.json()["id"]
        d = requests.delete(f"{API}/budgets/{bid}", headers=rev_headers)
        assert d.status_code == 200
