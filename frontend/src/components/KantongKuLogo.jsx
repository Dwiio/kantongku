import React from "react";

// KantongKu logo — SVG rendition of the blue pocket wallet with teal arrow + gold coins
export const KantongKuLogo = ({ size = 72, className = "" }) => (
    <svg
        xmlns="http://www.w3.org/2000/svg"
        viewBox="0 0 200 200"
        width={size}
        height={size}
        className={className}
        aria-label="KantongKu"
    >
        <defs>
            <linearGradient id="pocket" x1="0" y1="0" x2="1" y2="1">
                <stop offset="0" stopColor="#3B7BD8" />
                <stop offset="1" stopColor="#1E4A94" />
            </linearGradient>
            <linearGradient id="coin" x1="0" y1="0" x2="0" y2="1">
                <stop offset="0" stopColor="#FCD34D" />
                <stop offset="1" stopColor="#D97706" />
            </linearGradient>
        </defs>
        {/* Pocket body */}
        <path
            d="M40 80 C40 65, 55 55, 75 55 L125 55 C145 55, 160 65, 160 80 L160 150 C160 168, 145 178, 125 178 L75 178 C55 178, 40 168, 40 150 Z"
            fill="url(#pocket)"
            stroke="#0B2E63"
            strokeWidth="3"
            strokeDasharray="4 3"
        />
        {/* Pocket top band */}
        <path
            d="M35 78 C35 70, 45 62, 60 62 L140 62 C155 62, 165 70, 165 78 C165 84, 158 88, 150 88 L50 88 C42 88, 35 84, 35 78 Z"
            fill="#14B8A6"
            stroke="#0B7566"
            strokeWidth="2.5"
        />
        {/* Pocket flap loop */}
        <path d="M55 62 C55 42, 65 30, 78 30 C86 30, 92 36, 92 46" fill="none" stroke="#0B2E63" strokeWidth="4" strokeLinecap="round" />
        {/* Arrow up */}
        <path
            d="M60 130 L88 100 L108 118 L145 78"
            fill="none"
            stroke="#14B8A6"
            strokeWidth="10"
            strokeLinecap="round"
            strokeLinejoin="round"
        />
        <path d="M132 74 L152 72 L150 92 Z" fill="#14B8A6" stroke="#0B7566" strokeWidth="2" />
        {/* Coins */}
        <circle cx="118" cy="45" r="16" fill="url(#coin)" stroke="#92400E" strokeWidth="2.5" />
        <text x="118" y="52" textAnchor="middle" fontFamily="Arial" fontSize="20" fontWeight="900" fill="#92400E">+</text>
        <circle cx="150" cy="70" r="12" fill="url(#coin)" stroke="#92400E" strokeWidth="2.5" />
        <text x="150" y="76" textAnchor="middle" fontFamily="Arial" fontSize="16" fontWeight="900" fill="#92400E">-</text>
        <circle cx="82" cy="110" r="14" fill="url(#coin)" stroke="#92400E" strokeWidth="2.5" />
        <text x="82" y="117" textAnchor="middle" fontFamily="Arial" fontSize="18" fontWeight="900" fill="#92400E">+</text>
        <circle cx="112" cy="118" r="13" fill="url(#coin)" stroke="#92400E" strokeWidth="2.5" />
        <text x="112" y="125" textAnchor="middle" fontFamily="Arial" fontSize="18" fontWeight="900" fill="#92400E">-</text>
    </svg>
);

export default KantongKuLogo;
