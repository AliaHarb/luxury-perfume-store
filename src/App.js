import React, { useState, useMemo, useEffect } from "react";
import AdminProducts from './AdminProducts';
import { BrowserRouter as Router, Routes, Route, Link, useNavigate } from 'react-router-dom';
import ProductDetails from './ProductDetails';
import { db } from "./firebase";
import { collection, onSnapshot, addDoc } from "firebase/firestore";
import {
  ShoppingBag,
  Menu,
  X,
  ChevronDown,
  Plus,
  Minus,
  Trash2,
  CheckCircle2,
  MapPin,
  Phone,
  Lock,
  ArrowLeft,
  ArrowRight,
} from "lucide-react";

/* ------------------------------------------------------------------ */
/*  CONFIG & CONSTANTS                                                */
/* ------------------------------------------------------------------ */
const EASY_ORDERS_API_KEY = "f0bbf85e-5f26-47ad-90d3-122a2862c60f";

const Facebook = () => <span>FB</span>;
const Instagram = () => <span>IG</span>;

export const GOVERNORATES = [
  // محافظات الصعيد (الشحن: 120 ج.م)
  { name: "أسوان", isUpperEgypt: true },
  { name: "الأقصر", isUpperEgypt: true },
  { name: "قنا", isUpperEgypt: true },
  { name: "سوهاج", isUpperEgypt: true },
  { name: "أسيوط", isUpperEgypt: true },
  { name: "المنيا", isUpperEgypt: true },
  { name: "بني سويف", isUpperEgypt: true },
  { name: "الفيوم", isUpperEgypt: true },
  { name: "الوادي الجديد", isUpperEgypt: true },
  { name: "البحر الأحمر", isUpperEgypt: true },

  // باقي المحافظات (الشحن: 80 ج.م)
  { name: "القاهرة", isUpperEgypt: false },
  { name: "الجيزة", isUpperEgypt: false },
  { name: "القليوبية", isUpperEgypt: false },
  { name: "الإسكندرية", isUpperEgypt: false },
  { name: "الشرقية", isUpperEgypt: false },
  { name: "الدقهلية", isUpperEgypt: false },
  { name: "البحيرة", isUpperEgypt: false },
  { name: "الغربية", isUpperEgypt: false },
  { name: "المنوفية", isUpperEgypt: false },
  { name: "دمياط", isUpperEgypt: false },
  { name: "كفر الشيخ", isUpperEgypt: false },
  { name: "بورسعيد", isUpperEgypt: false },
  { name: "الإسماعيلية", isUpperEgypt: false },
  { name: "السويس", isUpperEgypt: false },
  { name: "مطروح", isUpperEgypt: false },
  { name: "شمال سيناء", isUpperEgypt: false },
  { name: "جنوب سيناء", isUpperEgypt: false }
];

export const C = {
  white: "#FFFFFF",
  offwhite: "#FAFAFA",
  paper: "#F2F2F2",
  line: "#E8E8E8",
  ink: "#111111",
  espresso900: "#161616",
  espresso700: "#3A3A3A",
  espresso500: "#767676",
  gold400: "#C6A16B",
  gold500: "#B8935A",
  gold600: "#9C7A45",
  gold700: "#7C5E33",
};

export const LOGO_URL = "/Logo.jpg";
export const FONT_IMPORT = `
@import url('https://fonts.googleapis.com/css2?family=Reem+Kufi:wght@400..700&family=Tajawal:wght@300;400;500;700;900&family=Cairo:wght@600;700;800;900&display=swap');
`;

export const TONE_COLORS = {
  gold: { liquid: "#C6A16B", cap: "#7C5E33" },
  silver: { liquid: "#D7CFC0", cap: "#8A7A5F" },
  dark: { liquid: "#5B4632", cap: "#2A2018" },
  rose: { liquid: "#D9B7A8", cap: "#9C7A45" },
  blue: { liquid: "#B9C4B4", cap: "#6B5A46" },
};

/* ------------------------------------------------------------------ */
/*  DEFENSIVE HELPERS                                                 */
/* ------------------------------------------------------------------ */
export function formatPrice(n) {
  const value = Number(n);
  const safeValue = Number.isFinite(value) ? value : 0;
  return `${safeValue.toLocaleString("ar-EG")} ج.م`;
}

export function normalizeBrandKey(value) {
  return (value || "").toString().trim().toLowerCase();
}

export function getProductBrandLabel(product) {
  const raw = (product && (product.brandLabel || product.brand)) || "";
  return raw.toString().trim();
}

export function getSafeSizes(product) {
  if (product && Array.isArray(product.sizes) && product.sizes.length > 0) {
    return product.sizes.filter((s) => s && (s.label || s.price !== undefined));
  }
  return [{ label: "الحجم القياسي", price: 0 }];
}

/* ------------------------------------------------------------------ */
/*  BOTTLE ILLUSTRATION (placeholder art, swap for real photography)   */
/* ------------------------------------------------------------------ */
function BottleIcon({ tone = "gold", size = 96 }) {
  const c = TONE_COLORS[tone] || TONE_COLORS.gold;
  return (
    <svg width={size} height={size * 1.15} viewBox="0 0 100 115" fill="none" xmlns="http://www.w3.org/2000/svg">
      <ellipse cx="50" cy="108" rx="28" ry="5" fill={C.espresso900} opacity="0.06" />
      <rect x="42" y="8" width="16" height="12" rx="2" fill={c.cap} />
      <rect x="45" y="2" width="10" height="8" rx="1.5" fill={c.cap} opacity="0.85" />
      <path
        d="M32 20 H68 C71 20 73 23 72 27 L69 45 C74 50 76 58 76 66 V96 C76 101 72 105 67 105 H33 C28 105 24 101 24 96 V66 C24 58 26 50 31 45 L28 27 C27 23 29 20 32 20 Z"
        fill={c.liquid}
        opacity="0.9"
      />
      <path
        d="M32 20 H68 C71 20 73 23 72 27 L69 45 C74 50 76 58 76 66 V96 C76 101 72 105 67 105 H33 C28 105 24 101 24 96 V66 C24 58 26 50 31 45 L28 27 C27 23 29 20 32 20 Z"
        stroke={C.espresso900}
        strokeOpacity="0.12"
        strokeWidth="1"
      />
      <rect x="30" y="58" width="40" height="26" rx="2" fill={C.white} opacity="0.85" />
      <rect x="34" y="64" width="32" height="2" rx="1" fill={c.cap} opacity="0.6" />
      <rect x="34" y="69" width="24" height="1.4" rx="0.7" fill={c.cap} opacity="0.4" />
      <rect x="34" y="73" width="20" height="1.4" rx="0.7" fill={c.cap} opacity="0.4" />
    </svg>
  );
}

/* Premium direct image version matched with layout variants */
function PremiumBottleSilhouette({ variant = "center", size = 128 }) {
  const images = {
    "side-left": "/header1.png", 
    "center": "/header2.png",    
    "side-right": "/header3.png" 
  };

  const currentImageUrl = images[variant] || images["center"];

  return (
    <div
      style={{
        width: "100%",
        height: "380px", 
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        overflow: "visible", 
        backgroundColor: "transparent", 
      }}
    >
      <img
        src={currentImageUrl}
        alt={`Dar Harp Premium Fragrance - ${variant}`}
        style={{
          width: "auto",
          height: "100%",
          transform: "scale(1.85)", 
          objectFit: "contain",
          backgroundColor: "transparent", 
          filter: "drop-shadow(0px 20px 40px rgba(0,0,0,0.08))",
          transition: "transform 0.3s ease", 
        }}
      />
    </div>
  );

  const gid = `glass-${variant}`;
  const gold = `gold-${variant}`;
  return (
    <svg width={size} height={h} viewBox="0 0 120 160" fill="none" xmlns="http://www.w3.org/2000/svg">
      <defs>
        <linearGradient id={gid} x1="20" y1="0" x2="100" y2="160" gradientUnits="userSpaceOnUse">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.9" />
          <stop offset="45%" stopColor={C.paper} stopOpacity="0.6" />
          <stop offset="100%" stopColor={C.espresso500} stopOpacity="0.16" />
        </linearGradient>
        <linearGradient id={gold} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor={C.gold400} />
          <stop offset="100%" stopColor={C.gold700} />
        </linearGradient>
        <filter id={`shadow-${variant}`} x="-40%" y="-10%" width="180%" height="140%">
          <feDropShadow dx="0" dy="10" stdDeviation="8" floodColor={C.espresso900} floodOpacity="0.10" />
        </filter>
      </defs>
      <g filter={`url(#shadow-${variant})`}>
        <rect x="48" y="6" width="24" height="18" rx="3" fill={`url(#${gold})`} />
        <rect x="52" y="0" width="16" height="10" rx="2" fill={`url(#${gold})`} opacity="0.9" />
        <rect x="54" y="22" width="12" height="12" fill={C.paper} opacity="0.7" />
        <path
          d="M40 34 H80 C84 34 87 38 86 43 L82 62 C90 70 94 82 94 96 V138 C94 148 86 156 76 156 H44 C34 156 26 148 26 138 V96 C26 82 30 70 38 62 L34 43 C33 38 36 34 40 34 Z"
          fill={`url(#${gid})`}
          stroke={C.gold500}
          strokeOpacity="0.35"
          strokeWidth="1"
        />
        <path d="M40 46 C34 66 32 90 32 112 V140" stroke="#FFFFFF" strokeOpacity="0.6" strokeWidth="3" strokeLinecap="round" />
        <rect x="27" y="108" width="66" height="47" rx="10" fill={C.gold400} opacity="0.14" />
        <rect x="38" y="112" width="44" height="1.4" rx="0.7" fill={C.gold700} opacity="0.55" />
        <rect x="46" y="118" width="28" height="1" rx="0.5" fill={C.gold700} opacity="0.4" />
      </g>
      <ellipse cx="60" cy="158" rx="30" ry="4" fill={C.espresso900} opacity="0.07" />
    </svg>
  );
}

/* ------------------------------------------------------------------ */
/*  SHARED UI BITS                                                     */
/* ------------------------------------------------------------------ */
function GoldButton({ children, onClick, type = "button", full = false, disabled = false, icon }) {
  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center justify-center gap-2 rounded-full px-7 py-3 text-sm font-bold tracking-wide transition-all duration-300 ${
        full ? "w-full" : ""
      } ${disabled ? "opacity-40 cursor-not-allowed" : "hover:-translate-y-0.5 hover:shadow-lg"}`}
      style={{
        background: disabled ? C.paper : `linear-gradient(135deg, ${C.gold400}, ${C.gold600})`,
        color: disabled ? C.espresso500 : C.white,
        boxShadow: disabled ? "none" : "0 8px 20px -8px rgba(124,94,51,0.45)",
      }}
    >
      {children}
      {icon}
    </button>
  );
}

function OutlineButton({ children, onClick, full = false, type = "button" }) {
  return (
    <button
      type={type}
      onClick={onClick}
      className={`inline-flex items-center justify-center gap-2 rounded-full border px-7 py-3 text-sm font-bold tracking-wide transition-colors duration-300 ${
        full ? "w-full" : ""
      }`}
      style={{ borderColor: C.gold500, color: C.gold700 }}
      onMouseEnter={(e) => (e.currentTarget.style.background = C.paper)}
      onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
    >
      {children}
    </button>
  );
}

function SectionEyebrow({ children }) {
  return (
    <div
      className="mb-3 inline-flex items-center gap-2 text-xs font-bold tracking-[0.25em]"
      style={{ color: C.gold600 }}
    >
      <span className="h-px w-6" style={{ background: C.gold500 }} />
      {children}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  NAVIGATION                                                         */
/* ------------------------------------------------------------------ */
function Nav({ page, setPage, cartCount }) {
  const [open, setOpen] = useState(false);
  const links = [{ key: "home", label: "الرئيسية" }];
  return (
    <header
      className="sticky top-0 z-50 border-b backdrop-blur-md"
      style={{ background: "rgba(255,255,255,0.92)", borderColor: C.line }}
    >
      <div className="mx-auto flex max-w-6xl items-center justify-between px-5 py-3">
        <button
          className="flex items-center"
          onClick={() => {
            setPage("home");
            setOpen(false);
          }}
        >
          <img src={LOGO_URL} alt="دار حرب" className="h-12 w-auto object-contain" />
        </button>

        <nav className="hidden items-center gap-8 md:flex">
          {links.map((l) => (
            <button
              key={l.key}
              onClick={() => setPage(l.key)}
              className="relative text-sm font-bold transition-colors"
              style={{ color: page === l.key ? C.gold700 : C.espresso700 }}
            >
              {l.label}
              {page === l.key && (
                <span className="absolute -bottom-1 right-0 left-0 h-0.5 rounded-full" style={{ background: C.gold500 }} />
              )}
            </button>
          ))}
          <button
            onClick={() => setPage("cart")}
            className="relative flex items-center gap-2 rounded-full px-4 py-2 text-sm font-bold"
            style={{ background: C.ink, color: C.white }}
          >
            <ShoppingBag size={16} />
            السلة
            {cartCount > 0 && (
              <span
                className="absolute -top-2 -left-2 flex h-5 w-5 items-center justify-center rounded-full text-[10px] font-black"
                style={{ background: C.gold500, color: C.white }}
              >
                {cartCount}
              </span>
            )}
          </button>
        </nav>

        <button className="md:hidden" onClick={() => setOpen(!open)}>
          {open ? <X size={24} color={C.espresso900} /> : <Menu size={24} color={C.espresso900} />}
        </button>
      </div>

      {open && (
        <div className="border-t px-5 py-4 md:hidden" style={{ borderColor: C.line, background: C.white }}>
          <div className="flex flex-col gap-3">
            {links.map((l) => (
              <button
                key={l.key}
                onClick={() => {
                  setPage(l.key);
                  setOpen(false);
                }}
                className="text-right text-sm font-bold"
                style={{ color: page === l.key ? C.gold700 : C.espresso700 }}
              >
                {l.label}
              </button>
            ))}
            <button
              onClick={() => {
                setPage("cart");
                setOpen(false);
              }}
              className="flex items-center justify-center gap-2 rounded-full px-4 py-2.5 text-sm font-bold"
              style={{ background: C.ink, color: C.white }}
            >
              <ShoppingBag size={16} />
              السلة {cartCount > 0 ? `(${cartCount})` : ""}
            </button>
          </div>
        </div>
      )}
    </header>
  );
}

/* ------------------------------------------------------------------ */
/*  FOOTER                                                             */
/* ------------------------------------------------------------------ */
function FooterSocialIcon({ href, children, label }) {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={label}
      className="flex h-10 w-10 items-center justify-center rounded-full border transition-all duration-300 hover:-translate-y-0.5"
      style={{ borderColor: C.line, color: C.gold700 }}
      onMouseEnter={(e) => {
        e.currentTarget.style.background = C.gold500;
        e.currentTarget.style.borderColor = C.gold500;
        e.currentTarget.style.color = C.white;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.background = "transparent";
        e.currentTarget.style.borderColor = C.line;
        e.currentTarget.style.color = C.gold700;
      }}
    >
      {children}
    </a>
  );
}

function WhatsAppIcon({ size = 16 }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
      <path d="M17.47 14.38c-.29-.15-1.7-.84-1.96-.93-.26-.1-.46-.15-.65.15-.19.29-.75.93-.92 1.12-.17.19-.34.22-.63.07-.29-.15-1.22-.45-2.32-1.43-.86-.76-1.44-1.71-1.6-2-.17-.29-.02-.45.13-.6.13-.13.29-.34.44-.51.15-.17.19-.29.29-.48.1-.19.05-.36-.02-.51-.07-.15-.65-1.57-.9-2.15-.24-.57-.48-.49-.65-.5-.17-.01-.36-.01-.55-.01-.19 0-.5.07-.77.36-.26.29-1 .98-1 2.39 0 1.41 1.03 2.77 1.17 2.96.15.19 2.03 3.1 4.92 4.35.69.3 1.22.48 1.64.61.69.22 1.32.19 1.81.11.55-.08 1.7-.7 1.94-1.37.24-.68.24-1.26.17-1.38-.07-.12-.26-.19-.55-.34Z" />
      <path d="M12.02 2C6.5 2 2.02 6.48 2.02 12c0 1.85.5 3.58 1.36 5.07L2 22l5.08-1.33A9.96 9.96 0 0 0 12.02 22C17.53 22 22 17.52 22 12S17.53 2 12.02 2Zm0 18.1c-1.66 0-3.2-.46-4.52-1.25l-.32-.19-3.02.79.8-2.94-.21-.31A8.08 8.08 0 0 1 3.92 12c0-4.47 3.64-8.1 8.1-8.1 4.47 0 8.1 3.63 8.1 8.1 0 4.47-3.63 8.1-8.1 8.1Z" />
    </svg>
  );
}

function Footer({ setPage }) {
  const navItems = [
    { label: "الرئيسية", action: () => setPage("home") },
    { label: "كل العطور", action: () => { setPage("home"); setTimeout(() => document.getElementById("grid")?.scrollIntoView({ behavior: "smooth" }), 50); } },
    { label: "سلة المشتريات", action: () => setPage("cart") },
  ];

  return (
    <footer
      className="mt-20 border-t"
      style={{ background: C.offwhite, borderColor: C.line, fontFamily: "'Tajawal', sans-serif" }}
    >
      <div className="mx-auto max-w-6xl px-5 py-16">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-3">
          {/* Column 1 — brand */}
          <div className="text-center md:text-right">
            <img
              src="/Logo.jpg"
              alt="دار حرب"
              className="mx-auto mb-4 h-16 w-auto object-contain md:mx-0"
            />
            <p
              className="text-base leading-relaxed"
              style={{ color: C.gold700, fontFamily: "'Cairo', sans-serif", fontWeight: 700 }}
            >
              أصالة الماضي.. بجودة الحاضر
            </p>
          </div>

          {/* Column 2 — quick nav */}
          <div className="text-center md:text-right">
            <div
              className="mb-5 text-xs font-bold tracking-[0.2em]"
              style={{ color: C.espresso900, fontFamily: "'Cairo', sans-serif" }}
            >
              روابط سريعة
            </div>
            <ul className="space-y-3 text-sm">
              {navItems.map((item) => (
                <li key={item.label}>
                  <button
                    onClick={item.action}
                    className="font-medium transition-colors duration-200"
                    style={{ color: C.espresso500 }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = C.gold600)}
                    onMouseLeave={(e) => (e.currentTarget.style.color = C.espresso500)}
                  >
                    {item.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3 — contact & socials */}
          <div className="flex flex-col items-center gap-5 text-center md:items-end md:text-right">
            <div
              className="text-xs font-bold tracking-[0.2em]"
              style={{ color: C.espresso900, fontFamily: "'Cairo', sans-serif" }}
            >
              تواصل معنا
            </div>

            <a href="tel:01275535351" className="flex items-center gap-2.5">
              <span
                className="flex h-9 w-9 items-center justify-center rounded-full"
                style={{ background: C.paper, color: C.gold700 }}
              >
                <Phone size={15} />
              </span>
              <span dir="ltr" className="text-sm font-bold tracking-wide" style={{ color: C.espresso900 }}>
                01275535351
              </span>
            </a>

            <div className="flex items-center gap-3">
              <a
                href="https://www.facebook.com/darharp?locale=ar_AR"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="فيسبوك"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ background: C.paper, color: C.espresso900 }}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                </svg>
              </a>

              <a
                href="https://www.instagram.com/dar_harp/"
                target="_blank"
                rel="noopener noreferrer"
                aria-label="إنستغرام"
                className="flex h-9 w-9 items-center justify-center rounded-full transition-transform hover:scale-110"
                style={{ background: C.paper, color: C.espresso900 }}
              >
                <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
                </svg>
              </a>
            </div>

            <a
              href="https://wa.me/201275535351"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-full border px-5 py-2.5 text-xs font-bold transition-all duration-300 hover:-translate-y-0.5"
              style={{ borderColor: "#B7D9C4", background: "#F3F8F5", color: "#3F7A5A" }}
            >
              <WhatsAppIcon size={14} />
              تواصل عبر الواتساب
            </a>
          </div>
        </div>

        <div className="mt-14 border-t pt-6 text-center" style={{ borderColor: C.line }}>
          <p className="text-xs" style={{ color: C.espresso500 }}>
            جميع الحقوق محفوظة لـ دار حرب © 2026
          </p>
        </div>
      </div>
    </footer>
  );
}
/* ------------------------------------------------------------------ */
/*  PRODUCT CARD — redesigned: centered image, defensive data, solid   */
/*  black full-width "Add to cart" bar fixed to the bottom of the card */
/* ------------------------------------------------------------------ */
function ProductCard({ product, onAdd }) {
  const safeSizes = useMemo(() => getSafeSizes(product), [product]);
  const [sizeIdx, setSizeIdx] = useState(0);
  const activeIndex = sizeIdx < safeSizes.length ? sizeIdx : 0;
  const size = safeSizes[activeIndex] || { label: "", price: 0 };
  const priceValue = Number(size?.price);
  const safePrice = Number.isFinite(priceValue) ? priceValue : 0;

  const name = product?.name || "منتج بدون اسم";
  const brandLabel = getProductBrandLabel(product) || "دار حرب";
  const description = product?.tone || "مزيج عطري فاخر يناسب جميع المناسبات.";
  const hasRealSizes = Array.isArray(product?.sizes) && product.sizes.length > 0;

  const handleAdd = () => {
    onAdd(product, size);
  };

  return (
    <div
      className="group flex h-full flex-col overflow-hidden rounded-2xl border bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg"
      style={{ borderColor: C.line }}
    >
      {/* Image — perfectly centered, uniform height, clean object-contain crop */}
      <div
        className="relative flex h-64 w-full items-center justify-center overflow-hidden"
        style={{ background: C.white }} // غيرناها لـ أبيض عشان تندمج مع خلفية صورك
      >
        {product?.imageUrl ? (
          <img
            src={product.imageUrl}
            alt={name}
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain",
              transform: "scale(1.1)", // التكبير الآمن هنا عشان تملى الكارت
              transition: "transform 0.5s ease"
            }}
            className="group-hover:scale-145" // أنيميشن خفيف لما تقفي عليها
            onError={(e) => {
              e.currentTarget.style.display = "none";
            }}
          />
        ) : (
          <BottleIcon tone={product?.tone} size={88} />
        )}
        {!product?.isAvailable && (
          <span
            className="absolute right-3 top-3 rounded-full px-3 py-1 text-[10px] font-bold tracking-wide"
            style={{ background: C.white, color: C.espresso700, border: `1px solid ${C.line}` }}
          >
            غير متاح حالياً
          </span>
        )}
      </div>


      {/* Content */}
      <div className="flex flex-1 flex-col px-5 pt-4">
        <div className="mb-1 text-[11px] font-bold tracking-[0.2em]" style={{ color: C.gold600 }}>
          {brandLabel}
        </div>
        <h3 className="mb-2 text-lg font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
          {name}
        </h3>

        <div className="mb-4 text-[12px] leading-relaxed" style={{ color: C.espresso500 }}>
          {description}
        </div>

        {hasRealSizes && (
          <div className="mb-4 flex items-center gap-2">
            <div className="relative flex-1">
              <select
                value={activeIndex}
                onChange={(e) => setSizeIdx(Number(e.target.value))}
                className="w-full appearance-none rounded-full border bg-white py-2.5 pl-8 pr-4 text-sm font-bold outline-none"
                style={{ borderColor: C.line, color: C.espresso900 }}
              >
                {safeSizes.map((s, i) => (
                  <option key={(s && s.label) || i} value={i}>
                    {(s && s.label) || `خيار ${i + 1}`}
                  </option>
                ))}
              </select>
              <ChevronDown
                size={15}
                className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2"
                color={C.gold600}
              />
            </div>
          </div>
        )}

        <div className="mb-4 mt-auto flex items-center justify-between">
          <span className="text-xl font-black" style={{ color: C.espresso900 }}>
            {formatPrice(safePrice)}
          </span>
          {!hasRealSizes && (
            <span className="text-[11px] font-medium" style={{ color: C.espresso500 }}>
              {safeSizes[0]?.label}
            </span>
          )}
        </div>
      </div>

      {/* Add to cart — sleek, full-width, solid black, flush with the card bottom */}
      <button
        onClick={handleAdd}
        disabled={!product?.isAvailable}
        className={`flex w-full items-center justify-center gap-2 py-3.5 text-sm font-bold tracking-wide transition-colors duration-200 ${
          product?.isAvailable ? "hover:bg-black" : "cursor-not-allowed"
        }`}
        style={{
          background: product?.isAvailable ? C.ink : C.paper,
          color: product?.isAvailable ? C.white : C.espresso500,
        }}
      >
        <ShoppingBag size={16} />
        {product?.isAvailable ? "أضف للسلة" : "غير متاح"}
      </button>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  HOME PAGE                                                          */
/* ------------------------------------------------------------------ */
function HomePage({ addToCart, setPage, productsList }) {
  const navigate = useNavigate()
  const [activeBrand, setActiveBrand] = useState("all");

  // Brand tabs are derived directly from the live Firestore data instead
  // of a hard-coded list, so tabs always match whatever string an admin
  // typed into "Brand (Filter Tag)" — trimmed and de-duplicated regardless
  // of case or extra whitespace.
  const brandOptions = useMemo(() => {
    const options = [{ key: "all", label: "الكل" }];
    if (!Array.isArray(productsList)) return options;

    const seen = new Map();
    productsList.forEach((p) => {
      const label = getProductBrandLabel(p);
      if (!label) return;
      const key = normalizeBrandKey(label);
      if (!seen.has(key)) seen.set(key, label);
    });

    seen.forEach((label, key) => options.push({ key, label }));
    return options;
  }, [productsList]);

  const filtered = useMemo(() => {
    if (!Array.isArray(productsList)) return [];
    if (activeBrand === "all") return productsList;
    return productsList.filter((p) => normalizeBrandKey(getProductBrandLabel(p)) === activeBrand);
  }, [activeBrand, productsList]);

  // If the currently-selected tab no longer exists in the live data
  // (e.g. the last product of that brand was removed), fall back to "all"
  // instead of silently showing an empty grid forever.
  useEffect(() => {
    if (activeBrand === "all") return;
    const stillExists = brandOptions.some((b) => b.key === activeBrand);
    if (!stillExists) setActiveBrand("all");
  }, [brandOptions, activeBrand]);

  return (
    <div>
      {/* HERO */}
      <section className="relative overflow-hidden" style={{ background: C.white }}>
        <div
          className="pointer-events-none absolute -left-40 -top-40 h-96 w-96 rounded-full opacity-30 blur-3xl"
          style={{ background: C.paper }}
        />
        <div className="mx-auto grid max-w-6xl grid-cols-1 items-center gap-10 px-5 py-16 md:grid-cols-2 md:py-24">
          <div className="text-center md:text-right">
            <SectionEyebrow>دار حرب للعطور الفاخرة</SectionEyebrow>
            <h1
              className="mb-5 text-4xl font-black leading-[1.3] md:text-5xl"
              style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}
            >
              عطرك <span style={{ color: C.gold600 }}>توقيعك</span>
            </h1>
            <p className="mx-auto mb-8 max-w-md text-base leading-8 md:mx-0" style={{ color: C.espresso500 }}>
              عطور فاخرة مصنوعة بعناية من أجود الزيوت والمكونات الأصلية، لتترك أثراً لا يُنسى أينما حللت.
            </p>
            <div className="mb-8 flex flex-col items-center gap-3 sm:flex-row md:justify-start">
              <GoldButton onClick={() => document.getElementById("grid")?.scrollIntoView({ behavior: "smooth" })}>
                تسوّق المجموعة
                <ArrowLeft size={16} />
              </GoldButton>
              <OutlineButton onClick={() => setPage("cart")}>عرض السلة</OutlineButton>
            </div>
            <div
              className="flex flex-wrap items-center justify-center gap-x-3 gap-y-2 text-xs font-bold tracking-wide md:justify-start"
              style={{ color: C.espresso700 }}
            >
              <span>عطور أصلية 100%</span>
              <span style={{ color: C.gold400 }}>•</span>
              <span>ثبات وضمان ممتد</span>
              <span style={{ color: C.gold400 }}>•</span>
              <span>شحن سريع لجميع المحافظات</span>
            </div>
          </div>

        <div className="relative flex items-center justify-center">
            <div
              className="absolute h-96 w-96 rounded-full opacity-50 blur-3xl"
              style={{ background: `radial-gradient(circle, ${C.gold400}40, transparent 70%)` }}
            />
          <div className="relative flex items-end justify-center gap-2 sm:gap-6 md:gap-8">
  <div className="mb-2 w-24 sm:w-32 md:w-36">
    <PremiumBottleSilhouette variant="side-left" size={120} />
  </div>
  <div className="w-32 sm:w-40 md:w-48">
    <PremiumBottleSilhouette variant="center" size={160} />
  </div>
  <div className="mb-4 w-20 sm:w-28 md:w-32">
    <PremiumBottleSilhouette variant="side-right" size={110} />
  </div>
</div>
          </div>
        </div>
      </section>
      {/* PRODUCT GRID */}
      <section id="grid" className="mx-auto max-w-6xl px-5 py-16" style={{ background: C.white }}>
        <div className="mb-10 text-center">
          <SectionEyebrow>المجموعة</SectionEyebrow>
          <h2 className="text-3xl font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
            تسوّق حسب الماركة
          </h2>
        </div>

        <div className="mb-10 flex flex-wrap justify-center gap-2.5">
          {brandOptions.map((b) => (
            <button
              key={b.key}
              onClick={() => setActiveBrand(b.key)}
              className="rounded-full border px-5 py-2 text-sm font-bold transition-colors"
              style={{
                borderColor: activeBrand === b.key ? C.ink : C.line,
                background: activeBrand === b.key ? C.ink : C.white,
                color: activeBrand === b.key ? C.white : C.espresso700,
              }}
            >
              {b.label}
            </button>
          ))}
        </div>

     {filtered.length > 0 ? (
  <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
    {filtered.map((p) => (
      <div 
        key={p.id} 
        onClick={() => navigate(`/product/${p.id}`)} 
        className="cursor-pointer transition-transform hover:scale-[1.02]"
      >
        <ProductCard product={p} onAdd={addToCart} />
      </div>
    ))}
  </div>
) : (
          <div className="rounded-2xl border py-20 text-center" style={{ borderColor: C.line, background: C.offwhite }}>
            <p className="text-sm font-medium" style={{ color: C.espresso500 }}>
              {Array.isArray(productsList) && productsList.length === 0
                ? "لا توجد منتجات متاحة حالياً، تابعونا قريباً."
                : "لا توجد منتجات لهذه الماركة حالياً."}
            </p>
          </div>
        )}
      </section>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CART PAGE                                                          */
/* ------------------------------------------------------------------ */
function CartPage({ cart, updateQty, removeItem, subtotal, setPage }) {
  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <BottleIcon tone="silver" size={90} />
        <h2 className="mb-2 mt-6 text-2xl font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
          سلة مشترياتك فارغة
        </h2>
        <p className="mb-8 text-sm" style={{ color: C.espresso500 }}>
          أضف عطرك المفضل وابدأ رحلة التسوق مع دار حرب.
        </p>
        <GoldButton onClick={() => setPage("home")}>
          تصفح العطور
          <ArrowLeft size={16} />
        </GoldButton>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="mb-8">
        <SectionEyebrow>سلة المشتريات</SectionEyebrow>
        <h1 className="text-3xl font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
          مراجعة طلبك
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-4 lg:col-span-2">
          {cart.map((item) => {
            const linePrice = Number(item?.price);
            const safeLinePrice = Number.isFinite(linePrice) ? linePrice : 0;
            const safeQty = Number(item?.qty) > 0 ? Number(item.qty) : 1;
            return (
              <div
                key={item.id}
                className="flex flex-col items-center gap-4 rounded-2xl border bg-white p-4 sm:flex-row"
                style={{ borderColor: C.line }}
              >
                <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-xl" style={{ background: C.offwhite }}>
                  <BottleIcon tone={item.tone} size={52} />
                </div>
                <div className="flex-1 text-center sm:text-right">
                  <div className="text-[11px] font-bold tracking-widest" style={{ color: C.gold600 }}>
                    {item.brandLabel || "دار حرب"}
                  </div>
                  <div className="font-black" style={{ color: C.espresso900 }}>
                    {item.name || "منتج"}
                  </div>
                  <div className="text-xs" style={{ color: C.espresso500 }}>
                    {item.sizeLabel}
                  </div>
                </div>

                <div className="flex items-center gap-3 rounded-full border px-2 py-1" style={{ borderColor: C.line }}>
                  <button onClick={() => updateQty(item.id, safeQty - 1)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: C.offwhite }}>
                    <Minus size={13} color={C.espresso900} />
                  </button>
                  <span className="w-5 text-center text-sm font-bold" style={{ color: C.espresso900 }}>
                    {safeQty}
                  </span>
                  <button onClick={() => updateQty(item.id, safeQty + 1)} className="flex h-7 w-7 items-center justify-center rounded-full" style={{ background: C.offwhite }}>
                    <Plus size={13} color={C.espresso900} />
                  </button>
                </div>

                <div className="w-24 text-center font-black sm:text-left" style={{ color: C.espresso900 }}>
                  {formatPrice(safeLinePrice * safeQty)}
                </div>

                <button onClick={() => removeItem(item.id)} className="text-red-400 transition-colors hover:text-red-600">
                  <Trash2 size={18} />
                </button>
              </div>
            );
          })}

          <button
            onClick={() => setPage("home")}
            className="mt-2 flex items-center gap-1.5 text-sm font-bold"
            style={{ color: C.gold700 }}
          >
            <ArrowRight size={15} />
            متابعة التسوق
          </button>
        </div>

        <div className="h-fit rounded-2xl border p-6" style={{ borderColor: C.line, background: C.white }}>
          <h3 className="mb-5 text-lg font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
            ملخص الطلب
          </h3>
          <div className="mb-3 flex justify-between text-sm" style={{ color: C.espresso500 }}>
            <span>عدد القطع</span>
            <span>{cart.reduce((s, i) => s + (Number(i?.qty) || 0), 0)}</span>
          </div>
          <div className="mb-3 flex justify-between text-sm" style={{ color: C.espresso500 }}>
            <span>الشحن</span>
            <span>يُحدد عند التأكيد</span>
          </div>
          <div className="my-4 h-px" style={{ background: C.line }} />
          <div className="mb-6 flex justify-between text-lg font-black" style={{ color: C.espresso900 }}>
            <span>الإجمالي</span>
            <span>{formatPrice(subtotal)}</span>
          </div>
          <GoldButton full onClick={() => setPage("checkout")}>
            إتمام الطلب
            <ArrowLeft size={16} />
          </GoldButton>
        </div>
      </div>
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CHECKOUT PAGE                                                     */
/* ------------------------------------------------------------------ */
function CheckoutPage({ cart, subtotal, onConfirm, setPage }) {
  const [form, setForm] = useState({ 
    name: "", 
    mobile1: "", 
    mobile2: "", 
    governorate: "القاهرة", // القيمة الافتراضية
    address: "" 
  });
  const [errors, setErrors] = useState({});

  // حساب سعر الشحن والإجمالي الكلي بناءً على المحافظة المختارة
  const shippingFee = useMemo(() => {
    const selectedGov = GOVERNORATES.find((g) => g.name === form.governorate);
    return selectedGov?.isUpperEgypt ? 120 : 80;
  }, [form.governorate]);

  const totalPrice = useMemo(() => subtotal + shippingFee, [subtotal, shippingFee]);

  if (cart.length === 0) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="mb-6 text-sm" style={{ color: C.espresso500 }}>
          سلتك فارغة، أضف بعض العطور أولاً.
        </p>
        <GoldButton onClick={() => setPage("home")}>تصفح العطور</GoldButton>
      </div>
    );
  }

  const handleChange = (field) => (e) => setForm({ ...form, [field]: e.target.value });

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = {};
    if (!form.name.trim()) errs.name = "الرجاء إدخال اسم العميل";
    if (!/^01[0-9]{9}$/.test(form.mobile1.trim())) errs.mobile1 = "رقم موبايل غير صحيح (مثال: 01xxxxxxxxx)";
    if (!form.governorate.trim()) errs.governorate = "الرجاء اختيار المحافظة";
    if (!form.address.trim()) errs.address = "الرجاء إدخال العنوان بالتفصيل";
    
    setErrors(errs);
    
    // إرسال البيانات شاملة تفاصيل الشحن والإجمالي النهائي
    if (Object.keys(errs).length === 0) {
      onConfirm({
        ...form,
        shippingFee,
        totalPrice
      });
    }
  };

  return (
    <div className="mx-auto max-w-5xl px-5 py-14">
      <div className="mb-8">
        <SectionEyebrow>الدفع عند الاستلام</SectionEyebrow>
        <h1 className="text-3xl font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
          بيانات التوصيل
        </h1>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <form onSubmit={handleSubmit} className="space-y-5 rounded-2xl border bg-white p-6 lg:col-span-2" style={{ borderColor: C.line }}>
          <Field label="اسم العميل" error={errors.name}>
            <input
              value={form.name}
              onChange={handleChange("name")}
              placeholder="الاسم بالكامل"
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: errors.name ? "#e07a6b" : C.line }}
            />
          </Field>

          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            <Field label="رقم الموبايل الأول" error={errors.mobile1}>
              <input
                value={form.mobile1}
                onChange={handleChange("mobile1")}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="w-full rounded-xl border px-4 py-3 text-sm text-right outline-none"
                style={{ borderColor: errors.mobile1 ? "#e07a6b" : C.line }}
              />
            </Field>
            <Field label="رقم الموبايل الثاني (اختياري)">
              <input
                value={form.mobile2}
                onChange={handleChange("mobile2")}
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="w-full rounded-xl border px-4 py-3 text-sm text-right outline-none"
                style={{ borderColor: C.line }}
              />
            </Field>
          </div>

          {/* قائمة اختيار المحافظة (Dropdown) */}
          <Field label="المحافظة" error={errors.governorate}>
            <select
              value={form.governorate}
              onChange={handleChange("governorate")}
              className="w-full rounded-xl border px-4 py-3 text-sm outline-none bg-white cursor-pointer"
              style={{ borderColor: errors.governorate ? "#e07a6b" : C.line }}
            >
              {GOVERNORATES.map((gov) => (
                <option key={gov.name} value={gov.name}>
                  {gov.name} ({gov.isUpperEgypt ? "شحن 120 ج.م" : "شحن 80 ج.م"})
                </option>
              ))}
            </select>
          </Field>

          <Field label="العنوان بالتفصيل" error={errors.address}>
            <textarea
              value={form.address}
              onChange={handleChange("address")}
              placeholder="الحي، الشارع، رقم المبنى، علامة مميزة..."
              rows={3}
              className="w-full resize-none rounded-xl border px-4 py-3 text-sm outline-none"
              style={{ borderColor: errors.address ? "#e07a6b" : C.line }}
            />
          </Field>

          <div>
            <div className="mb-2 text-sm font-bold" style={{ color: C.espresso900 }}>
              طريقة الدفع
            </div>
            <div
              className="flex items-center justify-between rounded-xl border px-4 py-3.5"
              style={{ borderColor: C.gold400, background: C.paper }}
            >
              <span className="flex items-center gap-2 text-sm font-bold" style={{ color: C.espresso900 }}>
                <Lock size={15} color={C.gold700} />
                الدفع عند الاستلام فقط
              </span>
              <span className="text-[10px] font-bold tracking-widest" style={{ color: C.gold700 }}>
                COD
              </span>
            </div>
          </div>

          <GoldButton full type="submit">
            تأكيد الطلب
            <ArrowLeft size={16} />
          </GoldButton>
        </form>

        {/* ملخص الطلب والتكاليف */}
        <div className="h-fit rounded-2xl border p-6" style={{ borderColor: C.line, background: C.white }}>
          <h3 className="mb-5 text-lg font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
            ملخص الطلب
          </h3>
          <div className="mb-4 max-h-64 space-y-3 overflow-y-auto pl-1">
            {cart.map((item) => {
              const linePrice = Number(item?.price);
              const safeLinePrice = Number.isFinite(linePrice) ? linePrice : 0;
              const safeQty = Number(item?.qty) > 0 ? Number(item.qty) : 1;
              return (
                <div key={item.id} className="flex items-center justify-between text-sm">
                  <div style={{ color: C.espresso700 }}>
                    <div className="font-bold">{item.name || "منتج"}</div>
                    <div className="text-xs" style={{ color: C.espresso500 }}>
                      {item.sizeLabel} × {safeQty}
                    </div>
                  </div>
                  <span className="font-bold" style={{ color: C.espresso900 }}>
                    {formatPrice(safeLinePrice * safeQty)}
                  </span>
                </div>
              );
            })}
          </div>
          
          <div className="my-4 h-px" style={{ background: C.line }} />
          
          <div className="space-y-2 text-sm">
            <div className="flex justify-between" style={{ color: C.espresso700 }}>
              <span>إجمالي المنتجات</span>
              <span className="font-bold">{formatPrice(subtotal)}</span>
            </div>
            <div className="flex justify-between" style={{ color: C.espresso700 }}>
              <span>تكلفة الشحن ({form.governorate})</span>
              <span className="font-bold">{formatPrice(shippingFee)}</span>
            </div>
          </div>

          <div className="my-4 h-px" style={{ background: C.line }} />

          <div className="flex justify-between text-lg font-black" style={{ color: C.espresso900 }}>
            <span>الإجمالي النهائي</span>
            <span>{formatPrice(totalPrice)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}

function Field({ label, error, children }) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-bold" style={{ color: C.espresso900 }}>
        {label}
      </label>
      {children}
      {error && <p className="mt-1 text-xs font-medium text-red-500">{error}</p>}
    </div>
  );
}

/* ------------------------------------------------------------------ */
/*  CONFIRMATION PAGE                                                 */
/* ------------------------------------------------------------------ */
function ConfirmationPage({ order, setPage }) {
  if (!order) {
    return (
      <div className="mx-auto flex max-w-xl flex-col items-center px-5 py-24 text-center">
        <p className="mb-6 text-sm" style={{ color: C.espresso500 }}>
          لا يوجد طلب حالياً.
        </p>
        <GoldButton onClick={() => setPage("home")}>العودة للرئيسية</GoldButton>
      </div>
    );
  }

  const shippingFee = order.form.shippingFee || 0;
  const finalTotal = order.form.totalPrice || order.subtotal;

  return (
    <div className="mx-auto max-w-2xl px-5 py-20 text-center">
      <div
        className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full"
        style={{ background: C.paper }}
      >
        <CheckCircle2 size={42} color={C.gold600} />
      </div>
      <SectionEyebrow>
        <span className="mx-auto">تم تأكيد الطلب</span>
      </SectionEyebrow>
      <h1 className="mb-3 text-3xl font-black" style={{ color: C.espresso900, fontFamily: "'Reem Kufi'" }}>
        تم استلام طلبك بنجاح!
      </h1>
      <p className="mb-8 text-sm leading-7" style={{ color: C.espresso500 }}>
        سيتواصل معك فريقنا خلال 24 ساعة لتأكيد التوصيل. الدفع عند الاستلام فقط.
      </p>

      <div className="mb-8 rounded-2xl border p-6 text-right" style={{ borderColor: C.line, background: C.white }}>
        <div className="mb-4 flex items-center justify-between border-b pb-4" style={{ borderColor: C.line }}>
          <span className="text-sm" style={{ color: C.espresso500 }}>
            رقم الطلب
          </span>
          <span className="font-black tracking-wide" style={{ color: C.gold700 }}>
            {order.orderNumber}
          </span>
        </div>

        <div className="mb-4 space-y-1.5 border-b pb-4 text-sm" style={{ borderColor: C.line, color: C.espresso700 }}>
          <div className="flex justify-between">
            <span style={{ color: C.espresso500 }}>الاسم</span>
            <span className="font-bold">{order.form.name}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: C.espresso500 }}>الموبايل</span>
            <span dir="ltr" className="font-bold">
              {order.form.mobile1}
            </span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: C.espresso500 }}>المافظة</span>
            <span className="font-bold">{order.form.governorate}</span>
          </div>
          <div className="flex items-start justify-between gap-3">
            <span className="shrink-0" style={{ color: C.espresso500 }}>
              <MapPin size={14} className="inline" /> العنوان
            </span>
            <span className="font-bold">{order.form.address}</span>
          </div>
        </div>

        <div className="mb-4 space-y-2 border-b pb-4" style={{ borderColor: C.line }}>
          {order.items.map((item) => {
            const linePrice = Number(item?.price);
            const safeLinePrice = Number.isFinite(linePrice) ? linePrice : 0;
            const safeQty = Number(item?.qty) > 0 ? Number(item.qty) : 1;
            return (
              <div key={item.id} className="flex justify-between text-sm">
                <span style={{ color: C.espresso700 }}>
                  {item.name} ({item.sizeLabel}) × {safeQty}
                </span>
                <span className="font-bold" style={{ color: C.espresso900 }}>
                  {formatPrice(safeLinePrice * safeQty)}
                </span>
              </div>
            );
          })}
        </div>

        {/* تفاصيل الحساب النهائي */}
        <div className="space-y-1.5 border-b pb-4 text-sm" style={{ borderColor: C.line, color: C.espresso700 }}>
          <div className="flex justify-between">
            <span style={{ color: C.espresso500 }}>المجموع الفرعي</span>
            <span className="font-bold">{formatPrice(order.subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span style={{ color: C.espresso500 }}>مصاريف الشحن</span>
            <span className="font-bold">{formatPrice(shippingFee)}</span>
          </div>
        </div>

        <div className="mt-4 flex justify-between text-lg font-black" style={{ color: C.espresso900 }}>
          <span>الإجمالي الكلي</span>
          <span>{formatPrice(finalTotal)}</span>
        </div>
      </div>

      <GoldButton onClick={() => setPage("home")}>
        متابعة التسوق
        <ArrowLeft size={16} />
      </GoldButton>
    </div>
  );
}


/* ------------------------------------------------------------------ */
/*  APP ROOT                                                          */
/* ------------------------------------------------------------------ */

export default function App() {
  const [page, setPage] = useState("home");
  const [cart, setCart] = useState([]);
  const [lastOrder, setLastOrder] = useState(null);
  const [productsList, setProductsList] = useState([]);

  // 1. تتبع التنقل بين الصفحات في Meta Pixel
  useEffect(() => {
    if (window.fbq) {
      window.fbq('track', 'PageView');
    }
  }, [page]);

  // 2. جلب المنتجات تلقائياً من Easy Orders مع Fallback لـ Firestore
  useEffect(() => {
    const fetchEasyOrdersProducts = async () => {
      try {
        const response = await fetch("https://public-api.easy-orders.net/api/v1/products", {
          method: "GET",
          headers: {
            "Authorization": `Bearer ${EASY_ORDERS_API_KEY}`,
            "api-key": EASY_ORDERS_API_KEY,
            "Accept": "application/json"
          }
        });
        const data = await response.json();
        console.log("Easy Orders Products Response:", data);

        const rawList = data?.data || data?.products || (Array.isArray(data) ? data : []);
        if (rawList.length > 0) {
          const mapped = rawList.map((item) => ({
            id: item.id?.toString() || Math.random().toString(),
            name: item.name || item.title || "منتج فاخر",
            brandLabel: item.category?.name || item.brand || "دار حرب",
            tone: item.description || "عطر مميز وثابت",
            imageUrl: item.image || item.images?.[0]?.url || item.imageUrl || "/Logo.jpg",
            isAvailable: item.status !== "inactive" && item.quantity !== 0,
            sizes: item.variants && item.variants.length > 0 ? item.variants.map(v => ({
              label: v.name || v.title || "الحجم القياسي",
              price: Number(v.price) || 0
            })) : [{ label: "100 مل", price: Number(item.price) || 0 }]
          }));
          setProductsList(mapped);
        } else {
          // جلب بديل من Firestore
          const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
            setProductsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
          });
          return () => unsubscribe();
        }
      } catch (err) {
        console.error("Error fetching from Easy Orders:", err);
        const unsubscribe = onSnapshot(collection(db, "products"), (snapshot) => {
          setProductsList(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
        });
        return () => unsubscribe();
      }
    };

    fetchEasyOrdersProducts();
  }, []);

  const addToCart = (product, size) => {
    if (!product || product.isAvailable === false) return;
    const safeSize = size && size.label ? size : { label: "الحجم القياسي", price: product.price || 0 };
    const id = `${product.id}-${safeSize.label}`;
    const productPrice = Number(safeSize.price) || Number(product.price) || 0;
    
    if (window.fbq) {
      window.fbq('track', 'AddToCart', {
        content_name: product.name || product.title || "منتج",
        content_ids: [product.id],
        value: productPrice,
        currency: 'EGP'
      });
    }

    setCart((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + 1 } : i));
      }
      return [
        ...prev,
        {
          id,
          productId: product.id,
          name: product.name || product.title || "منتج",
          brandLabel: product.brandLabel || product.brand || "",
          tone: product.tone,
          sizeLabel: safeSize.label,
          price: productPrice,
          qty: 1,
        },
      ];
    });
  };

  const updateQty = (id, qty) => {
    if (qty <= 0) {
      setCart((prev) => prev.filter((i) => i.id !== id));
      return;
    }
    setCart((prev) => prev.map((i) => (i.id === id ? { ...i, qty } : i)));
  };

  const removeItem = (id) => setCart((prev) => prev.filter((i) => i.id !== id));

  const subtotal = useMemo(() => cart.reduce((s, i) => s + (Number(i?.price) || 0) * (Number(i?.qty) || 0), 0), [cart]);
  const cartCount = useMemo(() => cart.reduce((s, i) => s + (Number(i?.qty) || 0), 0), [cart]);

  // 3. تأكيد الطلب وإرساله إلى Easy Orders + Firestore + Google Sheets + Meta Pixel
  const handleConfirmOrder = async (form) => {
    const orderNumber = `DH-${Date.now().toString().slice(-6)}`;
    const shippingFee = Number(form.shippingFee) || 80;
    const totalPrice = Number(form.totalPrice) || (subtotal + shippingFee);

    const orderData = {
      orderNumber,
      form,
      items: cart,
      subtotal,
      shippingFee,
      totalPrice,
      date: new Date().toLocaleDateString("ar-EG"),
    };

    if (window.fbq) {
      window.fbq('track', 'Purchase', {
        value: totalPrice,
        currency: 'EGP',
        content_ids: cart.map(i => i.productId || i.id),
        content_type: 'product',
        num_items: cart.reduce((s, i) => s + (i.qty || 1), 0)
      });
    }

    try {
      // إرسال الطلب لـ Easy Orders بالهيكل المعتمد
      const easyOrdersPayload = {
        full_name: form.name.trim(),
        phone: form.mobile1.trim(),
        government: form.governorate.trim(),
        address: form.mobile2 ? `${form.address.trim()} (هاتف بديل: ${form.mobile2.trim()})` : form.address.trim(),
        payment_method: "cod",
        cost: Number(subtotal),
        shipping_cost: Number(shippingFee),
        total_cost: Number(totalPrice),
        cart_items: cart.map((item) => ({
          name: `${item.name} (${item.sizeLabel})`,
          price: Number(item.price),
          quantity: Number(item.qty),
          ...(item.productId && item.productId.length > 8 ? { product_id: item.productId } : {})
        }))
      };

      fetch("https://public-api.easy-orders.net/api/v1/orders", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
          "Authorization": `Bearer ${EASY_ORDERS_API_KEY}`,
          "api-key": EASY_ORDERS_API_KEY
        },
        body: JSON.stringify(easyOrdersPayload)
      })
      .then(res => res.json())
      .then(resData => console.log("Easy Orders Order Response:", resData))
      .catch(err => console.error("Easy Orders Sync Error:", err));

      // حفظ نسخة احتياطية في Google Sheets
      const itemsSummary = cart.map(item => `${item.name} (${item.sizeLabel}) × ${item.qty}`).join(' - ');
      fetch("https://script.google.com/macros/s/AKfycbws-3KMuxub-LF8-v3dYRaotE5xAFj_WWqUJkrRDi6n5TiMRLakZw65gRdCJkPgebUS/exec", {
        method: "POST",
        mode: "no-cors", 
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          orderNumber,
          customerName: form.name.trim(),
          mobile1: form.mobile1.trim(),
          mobile2: form.mobile2 ? form.mobile2.trim() : "",
          governorate: form.governorate.trim(),
          address: form.address.trim(),
          items: itemsSummary,
          subtotal: subtotal,
          shippingFee: shippingFee,
          totalPrice: totalPrice
        })
      }).catch(err => console.error("Sheets Error:", err));

      // حفظ نسخة احتياطية في Firestore
      await addDoc(collection(db, "orders"), {
        orderNumber,
        customerName: form.name.trim(),
        mobile1: form.mobile1.trim(),
        mobile2: form.mobile2 ? form.mobile2.trim() : "",
        governorate: form.governorate.trim(),
        address: form.address.trim(),
        items: cart.map(item => ({ name: item.name, size: item.sizeLabel, qty: item.qty, price: item.price })),
        subtotal,
        shippingFee,
        totalPrice,
        status: "pending",
        createdAt: new Date().toISOString()
      });

    } catch (error) {
      console.error("Order processing error:", error);
    }

    setLastOrder(orderData);
    setCart([]);
    setPage("confirmation");
  };

  return (
    <Router>
      <div dir="rtl" className="min-h-screen" style={{ background: C.white, fontFamily: "'Tajawal', sans-serif" }}>
        <style>{FONT_IMPORT}</style>
        
        <Routes>
          <Route path="/admin" element={<AdminProducts />} />
          <Route 
            path="/product/:id" 
            element={<ProductDetails productsList={productsList} addToCart={addToCart} setPage={setPage} />} 
          />
          <Route
            path="/*"
            element={
              <>
                <Nav page={page} setPage={setPage} cartCount={cartCount} />

                {page === "home" && <HomePage addToCart={addToCart} setPage={setPage} productsList={productsList} />}
                {page === "cart" && (
                  <CartPage cart={cart} updateQty={updateQty} removeItem={removeItem} subtotal={subtotal} setPage={setPage} />
                )}
                {page === "checkout" && (
                  <CheckoutPage cart={cart} subtotal={subtotal} onConfirm={handleConfirmOrder} setPage={setPage} />
                )}
                {page === "confirmation" && <ConfirmationPage order={lastOrder} setPage={setPage} />}

                <Footer setPage={setPage} />
              </>
            }
          />
        </Routes>
      </div>
    </Router>
  );
}