from dotenv import load_dotenv
from pathlib import Path

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

import os
import uuid
import logging
from datetime import datetime, timezone, timedelta
from typing import List, Optional, Literal

import jwt
import bcrypt
from fastapi import FastAPI, APIRouter, HTTPException, Request, Response, Depends
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
from pydantic import BaseModel, Field, EmailStr


# --------------------------------------------------------------------------
# DB & App setup
# --------------------------------------------------------------------------
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

app = FastAPI(title="KantongKu API")
api_router = APIRouter(prefix="/api")

JWT_ALGORITHM = "HS256"
JWT_SECRET = os.environ["JWT_SECRET"]
REVIEWER_EMAIL = os.environ["REVIEWER_EMAIL"]
REVIEWER_PASSWORD = os.environ["REVIEWER_PASSWORD"]


# --------------------------------------------------------------------------
# Helpers
# --------------------------------------------------------------------------
def now_iso() -> str:
    return datetime.now(timezone.utc).isoformat()


def hash_password(password: str) -> str:
    return bcrypt.hashpw(password.encode("utf-8"), bcrypt.gensalt()).decode("utf-8")


def verify_password(plain: str, hashed: str) -> bool:
    try:
        return bcrypt.checkpw(plain.encode("utf-8"), hashed.encode("utf-8"))
    except Exception:
        return False


def create_access_token(user_id: str, email: str) -> str:
    payload = {
        "sub": user_id,
        "email": email,
        "exp": datetime.now(timezone.utc) + timedelta(days=30),
        "type": "access",
    }
    return jwt.encode(payload, JWT_SECRET, algorithm=JWT_ALGORITHM)


async def get_current_user(request: Request) -> dict:
    token = request.cookies.get("access_token")
    if not token:
        auth = request.headers.get("Authorization", "")
        if auth.startswith("Bearer "):
            token = auth[7:]
    if not token:
        raise HTTPException(status_code=401, detail="Belum login")
    try:
        payload = jwt.decode(token, JWT_SECRET, algorithms=[JWT_ALGORITHM])
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Sesi kadaluarsa")
    except jwt.InvalidTokenError:
        raise HTTPException(status_code=401, detail="Token tidak valid")

    user = await db.users.find_one({"id": payload["sub"]}, {"_id": 0, "password_hash": 0})
    if not user:
        raise HTTPException(status_code=401, detail="User tidak ditemukan")
    return user


def set_auth_cookie(response: Response, token: str):
    response.set_cookie(
        key="access_token",
        value=token,
        httponly=True,
        secure=True,
        samesite="none",
        max_age=60 * 60 * 24 * 30,
        path="/",
    )


# --------------------------------------------------------------------------
# Models
# --------------------------------------------------------------------------
class RegisterRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=6)
    name: str = Field(min_length=1)


class LoginRequest(BaseModel):
    email: EmailStr
    password: str


class WalletCreate(BaseModel):
    name: str
    type: Literal["cash", "bank", "ewallet", "savings", "card", "investment", "other"] = "cash"
    balance: float = 0.0
    color: str = "#2C62B5"
    icon: str = "wallet"


class WalletUpdate(BaseModel):
    name: Optional[str] = None
    type: Optional[str] = None
    balance: Optional[float] = None
    color: Optional[str] = None
    icon: Optional[str] = None


class TransactionCreate(BaseModel):
    wallet_id: str
    type: Literal["income", "expense"]
    amount: float = Field(gt=0)
    category: str
    note: Optional[str] = ""
    date: str  # ISO date string
    photo: Optional[str] = None  # base64 data url


class TransactionUpdate(BaseModel):
    wallet_id: Optional[str] = None
    type: Optional[Literal["income", "expense"]] = None
    amount: Optional[float] = None
    category: Optional[str] = None
    note: Optional[str] = None
    date: Optional[str] = None
    photo: Optional[str] = None


class DebtCreate(BaseModel):
    type: Literal["payable", "receivable"]  # payable = Untuk Dibayar, receivable = Untuk Diterima
    person: str
    amount: float = Field(gt=0)
    note: Optional[str] = ""
    due_date: Optional[str] = None
    settled: bool = False


class DebtUpdate(BaseModel):
    person: Optional[str] = None
    amount: Optional[float] = None
    note: Optional[str] = None
    due_date: Optional[str] = None
    settled: Optional[bool] = None


class BudgetCreate(BaseModel):
    category: str
    amount: float = Field(gt=0)
    period: Literal["monthly", "yearly"] = "monthly"


class BudgetUpdate(BaseModel):
    amount: Optional[float] = None
    period: Optional[Literal["monthly", "yearly"]] = None


# --------------------------------------------------------------------------
# AUTH ROUTES
# --------------------------------------------------------------------------
def _sanitize_user(u: dict) -> dict:
    u.pop("_id", None)
    u.pop("password_hash", None)
    return u


@api_router.post("/auth/register")
async def register(body: RegisterRequest, response: Response):
    email = body.email.lower().strip()
    existing = await db.users.find_one({"email": email})
    if existing:
        raise HTTPException(status_code=400, detail="Email sudah terdaftar")

    user_id = str(uuid.uuid4())
    doc = {
        "id": user_id,
        "email": email,
        "name": body.name.strip(),
        "password_hash": hash_password(body.password),
        "role": "free",
        "created_at": now_iso(),
    }
    await db.users.insert_one(doc)

    # Seed default wallets for new user (Cash)
    await db.wallets.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user_id,
        "name": "Tunai",
        "type": "cash",
        "balance": 0.0,
        "color": "#14B8A6",
        "icon": "wallet",
        "created_at": now_iso(),
    })

    token = create_access_token(user_id, email)
    set_auth_cookie(response, token)
    return {"user": _sanitize_user(doc), "token": token}


@api_router.post("/auth/login")
async def login(body: LoginRequest, response: Response):
    email = body.email.lower().strip()
    user = await db.users.find_one({"email": email})
    if not user or not verify_password(body.password, user["password_hash"]):
        raise HTTPException(status_code=401, detail="Email atau kata sandi salah")

    token = create_access_token(user["id"], email)
    set_auth_cookie(response, token)
    return {"user": _sanitize_user(user), "token": token}


@api_router.post("/auth/logout")
async def logout(response: Response):
    response.delete_cookie("access_token", path="/")
    return {"ok": True}


@api_router.get("/auth/me")
async def me(user: dict = Depends(get_current_user)):
    return {"user": user}


# --------------------------------------------------------------------------
# WALLETS
# --------------------------------------------------------------------------
FREE_WALLET_LIMIT = 2


@api_router.get("/wallets")
async def list_wallets(user: dict = Depends(get_current_user)):
    wallets = await db.wallets.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    return {"wallets": wallets, "limit": None if user["role"] == "premium" else FREE_WALLET_LIMIT}


@api_router.post("/wallets")
async def create_wallet(body: WalletCreate, user: dict = Depends(get_current_user)):
    count = await db.wallets.count_documents({"user_id": user["id"]})
    if user["role"] != "premium" and count >= FREE_WALLET_LIMIT:
        raise HTTPException(
            status_code=403,
            detail=f"Batas dompet gratis tercapai ({FREE_WALLET_LIMIT}). Upgrade ke KantongKu Pro untuk dompet tanpa batas."
        )
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **body.model_dump(),
        "created_at": now_iso(),
    }
    await db.wallets.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/wallets/{wallet_id}")
async def update_wallet(wallet_id: str, body: WalletUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    if not updates:
        raise HTTPException(status_code=400, detail="Tidak ada perubahan")
    res = await db.wallets.update_one({"id": wallet_id, "user_id": user["id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Dompet tidak ditemukan")
    doc = await db.wallets.find_one({"id": wallet_id}, {"_id": 0})
    return doc


@api_router.delete("/wallets/{wallet_id}")
async def delete_wallet(wallet_id: str, user: dict = Depends(get_current_user)):
    res = await db.wallets.delete_one({"id": wallet_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Dompet tidak ditemukan")
    await db.transactions.delete_many({"wallet_id": wallet_id, "user_id": user["id"]})
    return {"ok": True}


# --------------------------------------------------------------------------
# TRANSACTIONS
# --------------------------------------------------------------------------
@api_router.get("/transactions")
async def list_transactions(user: dict = Depends(get_current_user), limit: int = 500):
    items = await db.transactions.find({"user_id": user["id"]}, {"_id": 0}).sort("date", -1).to_list(limit)
    return {"transactions": items}


@api_router.post("/transactions")
async def create_transaction(body: TransactionCreate, user: dict = Depends(get_current_user)):
    wallet = await db.wallets.find_one({"id": body.wallet_id, "user_id": user["id"]})
    if not wallet:
        raise HTTPException(status_code=404, detail="Dompet tidak ditemukan")
    tx = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **body.model_dump(),
        "created_at": now_iso(),
    }
    await db.transactions.insert_one(tx)
    delta = body.amount if body.type == "income" else -body.amount
    await db.wallets.update_one({"id": body.wallet_id}, {"$inc": {"balance": delta}})
    tx.pop("_id", None)
    return tx


@api_router.patch("/transactions/{tx_id}")
async def update_transaction(tx_id: str, body: TransactionUpdate, user: dict = Depends(get_current_user)):
    existing = await db.transactions.find_one({"id": tx_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")

    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    # revert old balance
    old_delta = existing["amount"] if existing["type"] == "income" else -existing["amount"]
    await db.wallets.update_one({"id": existing["wallet_id"]}, {"$inc": {"balance": -old_delta}})

    merged = {**existing, **updates}
    new_delta = merged["amount"] if merged["type"] == "income" else -merged["amount"]
    await db.wallets.update_one({"id": merged["wallet_id"]}, {"$inc": {"balance": new_delta}})

    await db.transactions.update_one({"id": tx_id}, {"$set": updates})
    doc = await db.transactions.find_one({"id": tx_id}, {"_id": 0})
    return doc


@api_router.delete("/transactions/{tx_id}")
async def delete_transaction(tx_id: str, user: dict = Depends(get_current_user)):
    existing = await db.transactions.find_one({"id": tx_id, "user_id": user["id"]})
    if not existing:
        raise HTTPException(status_code=404, detail="Transaksi tidak ditemukan")
    delta = existing["amount"] if existing["type"] == "income" else -existing["amount"]
    await db.wallets.update_one({"id": existing["wallet_id"]}, {"$inc": {"balance": -delta}})
    await db.transactions.delete_one({"id": tx_id})
    return {"ok": True}


# --------------------------------------------------------------------------
# DEBTS
# --------------------------------------------------------------------------
@api_router.get("/debts")
async def list_debts(user: dict = Depends(get_current_user)):
    items = await db.debts.find({"user_id": user["id"]}, {"_id": 0}).to_list(500)
    return {"debts": items}


@api_router.post("/debts")
async def create_debt(body: DebtCreate, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **body.model_dump(),
        "created_at": now_iso(),
    }
    await db.debts.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/debts/{debt_id}")
async def update_debt(debt_id: str, body: DebtUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db.debts.update_one({"id": debt_id, "user_id": user["id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Data hutang tidak ditemukan")
    return await db.debts.find_one({"id": debt_id}, {"_id": 0})


@api_router.delete("/debts/{debt_id}")
async def delete_debt(debt_id: str, user: dict = Depends(get_current_user)):
    res = await db.debts.delete_one({"id": debt_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Data hutang tidak ditemukan")
    return {"ok": True}


# --------------------------------------------------------------------------
# BUDGETS
# --------------------------------------------------------------------------
@api_router.get("/budgets")
async def list_budgets(user: dict = Depends(get_current_user)):
    items = await db.budgets.find({"user_id": user["id"]}, {"_id": 0}).to_list(200)
    return {"budgets": items}


@api_router.post("/budgets")
async def create_budget(body: BudgetCreate, user: dict = Depends(get_current_user)):
    doc = {
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        **body.model_dump(),
        "created_at": now_iso(),
    }
    await db.budgets.insert_one(doc)
    doc.pop("_id", None)
    return doc


@api_router.patch("/budgets/{budget_id}")
async def update_budget(budget_id: str, body: BudgetUpdate, user: dict = Depends(get_current_user)):
    updates = {k: v for k, v in body.model_dump().items() if v is not None}
    res = await db.budgets.update_one({"id": budget_id, "user_id": user["id"]}, {"$set": updates})
    if res.matched_count == 0:
        raise HTTPException(status_code=404, detail="Anggaran tidak ditemukan")
    return await db.budgets.find_one({"id": budget_id}, {"_id": 0})


@api_router.delete("/budgets/{budget_id}")
async def delete_budget(budget_id: str, user: dict = Depends(get_current_user)):
    res = await db.budgets.delete_one({"id": budget_id, "user_id": user["id"]})
    if res.deleted_count == 0:
        raise HTTPException(status_code=404, detail="Anggaran tidak ditemukan")
    return {"ok": True}


# --------------------------------------------------------------------------
# DASHBOARD SUMMARY
# --------------------------------------------------------------------------
@api_router.get("/summary")
async def summary(user: dict = Depends(get_current_user)):
    now = datetime.now(timezone.utc)
    month_prefix = f"{now.year:04d}-{now.month:02d}"

    wallets = await db.wallets.find({"user_id": user["id"]}, {"_id": 0}).to_list(1000)
    total_balance = sum(w.get("balance", 0.0) for w in wallets)

    txs = await db.transactions.find(
        {"user_id": user["id"], "date": {"$regex": f"^{month_prefix}"}},
        {"_id": 0},
    ).to_list(2000)

    income = sum(t["amount"] for t in txs if t["type"] == "income")
    expense = sum(t["amount"] for t in txs if t["type"] == "expense")

    return {
        "total_balance": total_balance,
        "monthly_income": income,
        "monthly_expense": expense,
        "month": month_prefix,
    }


# --------------------------------------------------------------------------
# PREMIUM (simulated payment)
# --------------------------------------------------------------------------
class PaymentSimulateRequest(BaseModel):
    method: Literal["qris", "bank_transfer"] = "qris"


@api_router.post("/premium/simulate-payment")
async def simulate_payment(body: PaymentSimulateRequest, user: dict = Depends(get_current_user)):
    await db.users.update_one(
        {"id": user["id"]},
        {"$set": {"role": "premium", "premium_since": now_iso(), "payment_method": body.method}},
    )
    await db.payment_logs.insert_one({
        "id": str(uuid.uuid4()),
        "user_id": user["id"],
        "method": body.method,
        "amount": 29000,
        "status": "success",
        "created_at": now_iso(),
    })
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": fresh, "status": "success"}


@api_router.post("/premium/downgrade")
async def downgrade(user: dict = Depends(get_current_user)):
    """Test-only helper — allows revert for reviewer flow if needed."""
    await db.users.update_one({"id": user["id"]}, {"$set": {"role": "free"}})
    fresh = await db.users.find_one({"id": user["id"]}, {"_id": 0, "password_hash": 0})
    return {"user": fresh}


# --------------------------------------------------------------------------
# HEALTH
# --------------------------------------------------------------------------
@api_router.get("/")
async def root():
    return {"app": "KantongKu", "status": "ok"}


# --------------------------------------------------------------------------
# STARTUP: indexes + reviewer seeding
# --------------------------------------------------------------------------
async def seed_reviewer():
    email = REVIEWER_EMAIL.lower().strip()
    existing = await db.users.find_one({"email": email})
    user_id = existing["id"] if existing else str(uuid.uuid4())

    doc = {
        "id": user_id,
        "email": email,
        "name": "Reviewer Google Play",
        "password_hash": hash_password(REVIEWER_PASSWORD),
        "role": "premium",
        "premium_since": now_iso(),
        "created_at": existing.get("created_at") if existing else now_iso(),
    }
    await db.users.update_one({"email": email}, {"$set": doc}, upsert=True)

    # Ensure sample data exists (only seed once)
    wallet_count = await db.wallets.count_documents({"user_id": user_id})
    if wallet_count > 0:
        return

    wallets_seed = [
        {"name": "Tunai", "type": "cash", "balance": 1250000, "color": "#14B8A6", "icon": "wallet"},
        {"name": "BCA", "type": "bank", "balance": 8750000, "color": "#2C62B5", "icon": "landmark"},
        {"name": "GoPay", "type": "ewallet", "balance": 425000, "color": "#F59E0B", "icon": "smartphone"},
        {"name": "Tabungan", "type": "savings", "balance": 15000000, "color": "#8B5CF6", "icon": "piggy-bank"},
        {"name": "Kartu Kredit", "type": "card", "balance": -2500000, "color": "#EF4444", "icon": "credit-card"},
    ]
    wallet_ids = []
    for w in wallets_seed:
        wid = str(uuid.uuid4())
        wallet_ids.append(wid)
        await db.wallets.insert_one({
            "id": wid, "user_id": user_id, **w, "created_at": now_iso(),
        })

    # Sample transactions across recent dates
    today = datetime.now(timezone.utc)
    sample_txs = [
        # income
        {"type": "income", "amount": 8500000, "category": "Gaji", "note": "Gaji bulanan", "wallet_idx": 1, "days_ago": 5},
        {"type": "income", "amount": 750000, "category": "Bonus", "note": "Bonus proyek", "wallet_idx": 1, "days_ago": 12},
        {"type": "income", "amount": 200000, "category": "Freelance", "note": "Desain logo", "wallet_idx": 2, "days_ago": 3},
        # expenses
        {"type": "expense", "amount": 65000, "category": "Makanan", "note": "Makan siang", "wallet_idx": 0, "days_ago": 0},
        {"type": "expense", "amount": 120000, "category": "Makanan", "note": "Belanja mingguan", "wallet_idx": 1, "days_ago": 1},
        {"type": "expense", "amount": 250000, "category": "Rental", "note": "Sewa kos", "wallet_idx": 1, "days_ago": 2},
        {"type": "expense", "amount": 85000, "category": "Hiburan", "note": "Nonton bioskop", "wallet_idx": 2, "days_ago": 2},
        {"type": "expense", "amount": 45000, "category": "Transportasi", "note": "Bensin", "wallet_idx": 0, "days_ago": 4},
        {"type": "expense", "amount": 350000, "category": "Pendidikan", "note": "Kursus online", "wallet_idx": 1, "days_ago": 6},
        {"type": "expense", "amount": 55000, "category": "Makanan", "note": "Kopi & sarapan", "wallet_idx": 2, "days_ago": 7},
        {"type": "expense", "amount": 180000, "category": "Kesehatan", "note": "Vitamin bulanan", "wallet_idx": 1, "days_ago": 8},
        {"type": "expense", "amount": 95000, "category": "Lain-lain", "note": "Kado ulang tahun", "wallet_idx": 0, "days_ago": 9},
        {"type": "expense", "amount": 220000, "category": "Hiburan", "note": "Netflix + Spotify", "wallet_idx": 1, "days_ago": 10},
        {"type": "expense", "amount": 78000, "category": "Makanan", "note": "Makan malam keluarga", "wallet_idx": 0, "days_ago": 11},
        {"type": "expense", "amount": 42000, "category": "Transportasi", "note": "Ojek online", "wallet_idx": 2, "days_ago": 13},
    ]
    for t in sample_txs:
        d = today - timedelta(days=t["days_ago"])
        await db.transactions.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            "wallet_id": wallet_ids[t["wallet_idx"]],
            "type": t["type"],
            "amount": t["amount"],
            "category": t["category"],
            "note": t["note"],
            "date": d.strftime("%Y-%m-%dT%H:%M:%S"),
            "photo": None,
            "created_at": now_iso(),
        })

    # Debts
    debts_seed = [
        {"type": "payable", "person": "Budi", "amount": 500000, "note": "Pinjaman motor", "due_date": (today + timedelta(days=15)).strftime("%Y-%m-%d")},
        {"type": "payable", "person": "Andi", "amount": 250000, "note": "Bayar patungan", "due_date": (today + timedelta(days=5)).strftime("%Y-%m-%d")},
        {"type": "receivable", "person": "Siti", "amount": 300000, "note": "Talangan makan", "due_date": (today + timedelta(days=10)).strftime("%Y-%m-%d")},
        {"type": "receivable", "person": "Rina", "amount": 150000, "note": "Traktir kopi", "due_date": None},
    ]
    for d in debts_seed:
        await db.debts.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            **d,
            "settled": False,
            "created_at": now_iso(),
        })

    # Budgets
    budgets_seed = [
        {"category": "Makanan", "amount": 1500000, "period": "monthly"},
        {"category": "Hiburan", "amount": 300000, "period": "monthly"},
        {"category": "Transportasi", "amount": 500000, "period": "monthly"},
        {"category": "Rental", "amount": 2000000, "period": "monthly"},
        {"category": "Pendidikan", "amount": 500000, "period": "monthly"},
    ]
    for b in budgets_seed:
        await db.budgets.insert_one({
            "id": str(uuid.uuid4()),
            "user_id": user_id,
            **b,
            "created_at": now_iso(),
        })


@app.on_event("startup")
async def on_startup():
    await db.users.create_index("email", unique=True)
    await db.wallets.create_index("user_id")
    await db.transactions.create_index("user_id")
    await db.transactions.create_index("date")
    await db.debts.create_index("user_id")
    await db.budgets.create_index("user_id")
    await seed_reviewer()


@app.on_event("shutdown")
async def on_shutdown():
    client.close()


# --------------------------------------------------------------------------
# App wiring
# --------------------------------------------------------------------------
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=os.environ.get('CORS_ORIGINS', '*').split(','),
    allow_methods=["*"],
    allow_headers=["*"],
)

logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)
