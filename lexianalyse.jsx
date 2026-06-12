import { useState, useRef, useEffect } from "react";

/*
  ═══════════════════════════════════════════════════════
  LEXI ANALYSE  — Legal Document Intelligence Platform
  ═══════════════════════════════════════════════════════
  Design:
    Palette: Ink black (#0C0C0F), warm white (#F5F3EE),
             deep amber (#C8872A), slate (#4A5568)
    Type: Lora serif for headings + Inter for UI.
    Layout: Centered, max-width 1160px.
    Signature element: Amber scan line on document upload.
  ═══════════════════════════════════════════════════════
*/

const C = {
  ink:        "#0C0C0F",
  inkMid:     "#16161A",
  inkSoft:    "#1E1E24",
  amber:      "#C8872A",
  amberLight: "#E8A84A",
  amberGlow:  "rgba(200,135,42,0.12)",
  amberBorder:"rgba(200,135,42,0.25)",
  cream:      "#F5F3EE",
  creamDim:   "#D4D0C8",
  slate:      "#4A5568",
  slateLight: "#6B7280",
  steel:      "#2A2A32",
  steelLight: "#34343E",
  white:      "#FFFFFF",
  emerald:    "#059669",
  rose:       "#DC2626",
  gold:       "#F59E0B",
  border:     "rgba(245,243,238,0.08)",
  borderMid:  "rgba(245,243,238,0.12)",
  glass:      "rgba(30,30,36,0.7)",
};

// ─── GLOBAL STYLES ───────────────────────────────────
const initStyles = () => {
  if (document.getElementById("ciq-styles")) return;
  const s = document.createElement("style");
  s.id = "ciq-styles";
  s.textContent = `
    @import url('https://fonts.googleapis.com/css2?family=Inter:ital,wght@0,300;0,400;0,500;0,600;0,700;0,800;0,900;1,400&family=Lora:ital,wght@0,600;0,700;1,500;1,600&display=swap');

    *, *::before, *::after { box-sizing: border-box; margin: 0; padding: 0; }

    html { scroll-behavior: smooth; }

    body {
      background: #0C0C0F;
      color: #F5F3EE;
      font-family: 'Inter', system-ui, -apple-system, sans-serif;
      -webkit-font-smoothing: antialiased;
      -moz-osx-font-smoothing: grayscale;
      line-height: 1.6;
    }

    .serif { font-family: 'Lora', Georgia, 'Times New Roman', serif; }

    /* Layout */
    .center-wrap {
      max-width: 1160px;
      margin: 0 auto;
      padding: 0 32px;
    }
    @media (max-width: 768px) {
      .center-wrap { padding: 0 20px; }
    }

    /* Animations */
    @keyframes fadeUp {
      from { opacity: 0; transform: translateY(20px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to   { opacity: 1; }
    }
    @keyframes slideDown {
      from { opacity: 0; transform: translateY(-8px); }
      to   { opacity: 1; transform: translateY(0); }
    }
    @keyframes scanPulse {
      0%, 100% { opacity: 0.4; transform: scaleX(1); }
      50%       { opacity: 1;   transform: scaleX(1.01); }
    }
    @keyframes scanLine {
      0%   { top: 8%; }
      100% { top: 92%; }
    }
    @keyframes amberPulse {
      0%, 100% { box-shadow: 0 0 0 0 rgba(200,135,42,0); }
      50%       { box-shadow: 0 0 0 8px rgba(200,135,42,0.12); }
    }
    @keyframes spin {
      from { transform: rotate(0deg); }
      to   { transform: rotate(360deg); }
    }
    @keyframes progressFill {
      from { width: 0%; }
    }
    @keyframes countUp {
      from { opacity: 0; transform: scale(0.8); }
      to   { opacity: 1; transform: scale(1); }
    }

    .fade-up   { animation: fadeUp   0.55s cubic-bezier(0.22,1,0.36,1) both; }
    .fade-in   { animation: fadeIn   0.35s ease both; }
    .slide-down{ animation: slideDown 0.25s ease both; }

    /* Card */
    .card {
      background: #16161A;
      border: 1px solid rgba(245,243,238,0.08);
      border-radius: 16px;
      transition: border-color 0.2s, box-shadow 0.2s;
    }
    .card:hover { border-color: rgba(245,243,238,0.14); }
    .card-amber {
      background: rgba(200,135,42,0.06);
      border-color: rgba(200,135,42,0.2);
    }
    .card-amber:hover { border-color: rgba(200,135,42,0.35); }

    /* Buttons */
    .btn-primary {
      background: #C8872A;
      color: #0C0C0F;
      border: none;
      cursor: pointer;
      font-weight: 700;
      font-family: 'Inter', sans-serif;
      letter-spacing: -0.01em;
      transition: background 0.18s, transform 0.15s, box-shadow 0.18s;
      position: relative;
      overflow: hidden;
    }
    .btn-primary:hover {
      background: #E8A84A;
      transform: translateY(-1px);
      box-shadow: 0 8px 24px rgba(200,135,42,0.3);
    }
    .btn-primary:active { transform: translateY(0); }
    .btn-primary:disabled {
      opacity: 0.45;
      cursor: not-allowed;
      transform: none;
      box-shadow: none;
    }

    .btn-ghost {
      background: transparent;
      color: #F5F3EE;
      border: 1px solid rgba(245,243,238,0.15);
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      font-weight: 600;
      transition: border-color 0.18s, background 0.18s, color 0.18s;
    }
    .btn-ghost:hover {
      border-color: rgba(200,135,42,0.4);
      color: #C8872A;
      background: rgba(200,135,42,0.05);
    }

    .btn-text {
      background: none;
      border: none;
      cursor: pointer;
      font-family: 'Inter', sans-serif;
      color: #C8872A;
      font-weight: 600;
      transition: opacity 0.15s;
      padding: 0;
    }
    .btn-text:hover { opacity: 0.75; }

    /* Form elements */
    .field {
      background: #1E1E24;
      border: 1px solid rgba(245,243,238,0.1);
      color: #F5F3EE;
      font-family: 'Inter', sans-serif;
      font-size: 14px;
      transition: border-color 0.2s, box-shadow 0.2s;
      outline: none;
      width: 100%;
    }
    .field:focus {
      border-color: rgba(200,135,42,0.5);
      box-shadow: 0 0 0 3px rgba(200,135,42,0.08);
    }
    .field::placeholder { color: #4A5568; }
    select.field option { background: #1E1E24; }

    /* Nav */
    .nav-item {
      display: flex;
      align-items: center;
      gap: 10px;
      padding: 9px 14px;
      border-radius: 10px;
      cursor: pointer;
      transition: background 0.15s, color 0.15s;
      color: rgba(245,243,238,0.45);
      font-size: 13.5px;
      font-weight: 500;
      border: none;
      background: none;
      font-family: 'Inter', sans-serif;
      text-decoration: none;
      width: 100%;
      text-align: left;
    }
    .nav-item:hover { background: rgba(245,243,238,0.05); color: #F5F3EE; }
    .nav-item.active {
      background: rgba(200,135,42,0.1);
      color: #C8872A;
      border-left: 2px solid #C8872A;
    }

    /* Risk tags */
    .tag-safe     { background: rgba(5,150,105,0.1);  color: #059669; border: 1px solid rgba(5,150,105,0.25); }
    .tag-moderate { background: rgba(245,158,11,0.1); color: #F59E0B; border: 1px solid rgba(245,158,11,0.25); }
    .tag-high     { background: rgba(220,38,38,0.1);  color: #DC2626; border: 1px solid rgba(220,38,38,0.25); }

    /* Divider */
    .divider {
      height: 1px;
      background: rgba(245,243,238,0.07);
      border: none;
      margin: 0;
    }

    /* Scrollbar */
    ::-webkit-scrollbar { width: 5px; height: 5px; }
    ::-webkit-scrollbar-track { background: transparent; }
    ::-webkit-scrollbar-thumb { background: rgba(245,243,238,0.1); border-radius: 3px; }

    /* Upload zone */
    .upload-zone {
      border: 1.5px dashed rgba(200,135,42,0.25);
      border-radius: 16px;
      transition: all 0.25s;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .upload-zone:hover,
    .upload-zone.over {
      border-color: rgba(200,135,42,0.55);
      background: rgba(200,135,42,0.04);
    }
    .upload-zone.has-file {
      border-style: solid;
      border-color: rgba(5,150,105,0.35);
      background: rgba(5,150,105,0.04);
    }

    /* Scan line animation */
    .scan-line {
      position: absolute;
      left: 0; right: 0;
      height: 1.5px;
      background: linear-gradient(90deg, transparent 0%, #C8872A 30%, #E8A84A 50%, #C8872A 70%, transparent 100%);
      animation: scanLine 1.8s ease-in-out infinite alternate;
      pointer-events: none;
      display: none;
    }
    .scanning .scan-line { display: block; }

    /* Sidebar mobile overlay */
    .sidebar-overlay {
      position: fixed; inset: 0;
      background: rgba(0,0,0,0.7);
      z-index: 90;
      backdrop-filter: blur(4px);
      display: none;
    }
    .sidebar-overlay.visible { display: block; }

    /* Hamburger */
    .hamburger {
      display: flex;
      flex-direction: column;
      gap: 5px;
      cursor: pointer;
      padding: 6px;
      border-radius: 8px;
      background: none;
      border: none;
      transition: background 0.15s;
    }
    .hamburger:hover { background: rgba(245,243,238,0.07); }
    .hamburger span {
      display: block;
      width: 20px;
      height: 1.5px;
      background: #F5F3EE;
      border-radius: 2px;
      transition: all 0.25s;
    }
    .hamburger.open span:nth-child(1) { transform: rotate(45deg) translate(4.5px, 4.5px); }
    .hamburger.open span:nth-child(2) { opacity: 0; transform: scaleX(0); }
    .hamburger.open span:nth-child(3) { transform: rotate(-45deg) translate(4.5px, -4.5px); }

    /* Tab bar */
    .tab-bar {
      display: flex;
      gap: 2px;
      background: rgba(245,243,238,0.04);
      padding: 4px;
      border-radius: 12px;
      border: 1px solid rgba(245,243,238,0.07);
    }
    .tab {
      padding: 7px 18px;
      border-radius: 9px;
      font-size: 13px;
      font-weight: 600;
      cursor: pointer;
      border: none;
      background: transparent;
      color: rgba(245,243,238,0.45);
      font-family: 'Inter', sans-serif;
      transition: all 0.18s;
      white-space: nowrap;
    }
    .tab.active {
      background: #1E1E24;
      color: #F5F3EE;
      border: 1px solid rgba(245,243,238,0.1);
    }
    .tab:hover:not(.active) { color: rgba(245,243,238,0.75); }

    /* Progress bar */
    .progress-track {
      height: 3px;
      background: rgba(245,243,238,0.07);
      border-radius: 3px;
      overflow: hidden;
    }
    .progress-fill {
      height: 100%;
      background: linear-gradient(90deg, #C8872A, #E8A84A);
      border-radius: 3px;
      transition: width 0.35s ease;
    }

    /* Verdict ring */
    .verdict-ring {
      width: 88px; height: 88px;
      border-radius: 50%;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      border: 3px solid;
      transition: all 0.3s;
    }

    /* Tooltip */
    [data-tip] { position: relative; }
    [data-tip]::after {
      content: attr(data-tip);
      position: absolute;
      bottom: calc(100% + 6px);
      left: 50%;
      transform: translateX(-50%);
      background: #2A2A32;
      color: #F5F3EE;
      font-size: 11px;
      font-weight: 500;
      padding: 5px 10px;
      border-radius: 6px;
      white-space: nowrap;
      border: 1px solid rgba(245,243,238,0.1);
      opacity: 0;
      pointer-events: none;
      transition: opacity 0.15s;
      z-index: 100;
    }
    [data-tip]:hover::after { opacity: 1; }

    @media (max-width: 900px) {
      .sidebar-desktop { display: none !important; }
      .sidebar-mobile { display: flex !important; }
    }
    @media (min-width: 901px) {
      .sidebar-mobile { display: none !important; }
      .topbar-menu-btn { display: none !important; }
    }
    @media (max-width: 600px) {
      .hide-sm { display: none !important; }
      .grid-2 { grid-template-columns: 1fr !important; }
    }

    /* Plan card hover */
    .plan-card {
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
    }
    .plan-card:hover {
      transform: translateY(-4px);
      box-shadow: 0 20px 50px rgba(0,0,0,0.4);
    }
    .plan-card.highlight {
      border-color: rgba(200,135,42,0.4) !important;
      box-shadow: 0 0 0 1px rgba(200,135,42,0.15);
    }

    /* Table row hover */
    .table-row { transition: background 0.12s; }
    .table-row:hover { background: rgba(245,243,238,0.03) !important; }

    /* Why not ChatGPT section */
    .reason-card {
      border-left: 2px solid #C8872A;
      padding: 16px 20px;
      background: rgba(200,135,42,0.04);
      border-radius: 0 12px 12px 0;
      transition: background 0.2s;
    }
    .reason-card:hover { background: rgba(200,135,42,0.08); }
  `;
  document.head.appendChild(s);
};

// ─── SVG ICON SYSTEM ─────────────────────────────────
const paths = {
  home:      ["M3 9l9-7 9 7v11a2 2 0 01-2 2H5a2 2 0 01-2-2z","M9 22V12h6v10"],
  scan:      ["M9 3H5a2 2 0 00-2 2v4m6-6h10a2 2 0 012 2v4M9 3v18m0 0h10a2 2 0 002-2V9M9 21H5a2 2 0 01-2-2V9m0 0h18"],
  file:      ["M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z","M14 2v6h6","M16 13H8","M16 17H8","M10 9H8"],
  history:   ["M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"],
  layers:    ["M12 2L2 7l10 5 10-5-10-5","M2 17l10 5 10-5","M2 12l10 5 10-5"],
  settings:  ["M12 15a3 3 0 100-6 3 3 0 000 6z","M19.4 15a1.65 1.65 0 00.33 1.82l.06.06a2 2 0 010 2.83 2 2 0 01-2.83 0l-.06-.06a1.65 1.65 0 00-1.82-.33 1.65 1.65 0 00-1 1.51V21a2 2 0 01-4 0v-.09A1.65 1.65 0 009 19.4a1.65 1.65 0 00-1.82.33l-.06.06a2 2 0 01-2.83-2.83l.06-.06A1.65 1.65 0 004.68 15a1.65 1.65 0 00-1.51-1H3a2 2 0 010-4h.09A1.65 1.65 0 004.6 9a1.65 1.65 0 00-.33-1.82l-.06-.06a2 2 0 012.83-2.83l.06.06A1.65 1.65 0 009 4.68a1.65 1.65 0 001-1.51V3a2 2 0 014 0v.09a1.65 1.65 0 001 1.51 1.65 1.65 0 001.82-.33l.06-.06a2 2 0 012.83 2.83l-.06.06A1.65 1.65 0 0019.4 9a1.65 1.65 0 001.51 1H21a2 2 0 010 4h-.09a1.65 1.65 0 00-1.51 1z"],
  pricing:   ["M12 2a10 10 0 100 20A10 10 0 0012 2z","M12 6v2","M12 16v2","M8.5 8.5C9 7.5 10.5 7 12 7c1.7 0 3 .9 3 2.3 0 2.7-6 2-6 5","M9 17h6"],
  logout:    ["M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4","M16 17l5-5-5-5","M21 12H9"],
  check:     "M20 6L9 17l-5-5",
  x:         "M18 6L6 18M6 6l12 12",
  alert:     ["M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z","M12 9v4","M12 17h.01"],
  shield:    ["M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z","M9 12l2 2 4-4"],
  arrow:     "M5 12h14M12 5l7 7-7 7",
  download:  ["M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4","M7 10l5 5 5-5","M12 15V3"],
  star:      "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z",
  user:      ["M20 21v-2a4 4 0 00-4-4H8a4 4 0 00-4 4v2","M12 11a4 4 0 100-8 4 4 0 000 8"],
  lock:      ["M19 11H5a2 2 0 00-2 2v7a2 2 0 002 2h14a2 2 0 002-2v-7a2 2 0 00-2-2z","M7 11V7a5 5 0 0110 0v4"],
  mail:      ["M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z","M22 6l-10 7L2 6"],
  zap:       "M13 2L3 14h9l-1 8 10-12h-9l1-8z",
  eye:       ["M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z","M12 9a3 3 0 100 6 3 3 0 000-6z"],
  info:      ["M12 22a10 10 0 100-20 10 10 0 000 20z","M12 8h.01","M11 12h1v4h1"],
  external:  ["M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6","M15 3h6v6","M10 14L21 3"],
  chatgpt:   ["M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2z","M8 12h8","M12 8v8"],
};

const Ic = ({ n, size = 18, stroke = "currentColor", sw = 1.7 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke={stroke} strokeWidth={sw} strokeLinecap="round" strokeLinejoin="round">
    {(Array.isArray(paths[n]) ? paths[n] : [paths[n]]).map((d, i) => (
      <path key={i} d={d} />
    ))}
  </svg>
);

// ─── SEO INJECTION ────────────────────────────────────
const injectSEO = () => {
  document.title = "Lexi Analyse — Legal Document Intelligence";
  const meta = [
    ["description", "Lexi Analyse reads your contracts so you never miss what matters. Upload any legal document and receive a structured risk briefing, plain-language summary, and flagged clauses in under 30 seconds."],
    ["keywords", "contract review, legal document analysis, NDA review, clause extraction, risk detection, employment contract, lease review, legal intelligence"],
    ["author", "Lexi Analyse"],
    ["robots", "index, follow"],
    ["og:title", "Lexi Analyse — Legal Document Intelligence"],
    ["og:description", "Structured risk briefings from any contract in under 30 seconds."],
    ["og:type", "website"],
    ["og:image", "https://lexianalyse.com/og.jpg"],
    ["twitter:card", "summary_large_image"],
    ["twitter:title", "Lexi Analyse"],
    ["twitter:description", "Your contracts, analysed. Risks surfaced. Nothing buried."],
  ];
  document.querySelectorAll("meta[name],meta[property]").forEach(m => m.remove());
  meta.forEach(([key, val]) => {
    const el = document.createElement("meta");
    el.setAttribute(key.startsWith("og:") || key.startsWith("twitter:") ? "property" : "name", key);
    el.setAttribute("content", val);
    document.head.appendChild(el);
  });
  let c = document.querySelector("link[rel='canonical']");
  if (!c) { c = document.createElement("link"); document.head.appendChild(c); }
  c.setAttribute("rel", "canonical");
  c.setAttribute("href", "https://lexianalyse.com");
  let sc = document.getElementById("ciq-schema");
  if (!sc) { sc = document.createElement("script"); sc.id = "ciq-schema"; sc.type = "application/ld+json"; document.head.appendChild(sc); }
  sc.textContent = JSON.stringify({
    "@context": "https://schema.org",
    "@type": "SoftwareApplication",
    "name": "Lexi Analyse",
    "applicationCategory": "LegalService",
    "description": "Legal document intelligence platform for contracts, NDAs, leases, and commercial agreements.",
    "url": "https://lexianalyse.com",
    "offers": [
      { "@type": "Offer", "name": "Starter",      "price": "0",  "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Professional", "price": "15", "priceCurrency": "USD" },
      { "@type": "Offer", "name": "Firm",         "price": "49", "priceCurrency": "USD" }
    ]
  });
};

// ─── LOGO ─────────────────────────────────────────────
const Logo = ({ compact = false }) => (
  <div style={{ display:"flex", alignItems:"center", gap: compact ? 8 : 10 }}>
    <div style={{
      width: compact ? 30 : 36, height: compact ? 30 : 36,
      background: "#C8872A",
      borderRadius: compact ? 8 : 10,
      display: "flex", alignItems: "center", justifyContent: "center",
      flexShrink: 0
    }}>
      <svg width={compact ? 16 : 20} height={compact ? 16 : 20} viewBox="0 0 24 24" fill="none"
        stroke="#0C0C0F" strokeWidth={2.2} strokeLinecap="round" strokeLinejoin="round">
        <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z"/>
        <path d="M14 2v6h6M9 13h6M9 17h4"/>
        <circle cx="17" cy="17" r="3" fill="#0C0C0F" stroke="#0C0C0F"/>
        <path d="M17 15.5v1.5l.8.8" stroke="#C8872A" strokeWidth={1.5}/>
      </svg>
    </div>
    {!compact && (
      <span className="serif" style={{
        fontSize: 19, fontWeight: 700, color: "#F5F3EE",
        letterSpacing: "-0.02em"
      }}>
        Lexi <span style={{ color: "#C8872A" }}>Analyse</span>
      </span>
    )}
  </div>
);

// ─── BACKGROUND ───────────────────────────────────────
const Background = () => (
  <div style={{ position:"fixed", inset:0, pointerEvents:"none", zIndex:0, overflow:"hidden" }}>
    <div style={{
      position:"absolute", inset:0,
      backgroundImage: "radial-gradient(ellipse 80% 50% at 50% -10%, rgba(200,135,42,0.07) 0%, transparent 60%)"
    }}/>
    <div style={{
      position:"absolute", inset:0,
      backgroundImage: "linear-gradient(rgba(245,243,238,0.025) 1px, transparent 1px), linear-gradient(90deg, rgba(245,243,238,0.025) 1px, transparent 1px)",
      backgroundSize: "72px 72px"
    }}/>
  </div>
);

// ─── SIDEBAR NAV ──────────────────────────────────────
const navItems = [
  { id:"dashboard", label:"Overview",     icon:"home"     },
  { id:"analyze",   label:"New Analysis", icon:"scan"     },
  { id:"history",   label:"History",      icon:"history"  },
  { id:"pricing",   label:"Plans",        icon:"pricing"  },
  { id:"settings",  label:"Settings",     icon:"settings" },
];

const SidebarContent = ({ active, onNav, profile, onClose }) => {
  const plan = profile?.plan || "free";
  const used = profile?.usageCount || 0;
  const limit = plan === "firm" ? Infinity : 2;
  const pct = plan === "firm" ? 85 : Math.min((used / limit) * 100, 100);

  return (
    <div style={{
      width: 248, height: "100%",
      background: "#0E0E13",
      borderRight: `1px solid rgba(245,243,238,0.07)`,
      display: "flex", flexDirection: "column",
      padding: "24px 16px",
    }}>
      {/* Logo row */}
      <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", paddingLeft:4, marginBottom:32 }}>
        <Logo />
        {onClose && (
          <button onClick={onClose} className="btn-ghost" style={{ padding:"6px", borderRadius:8, display:"flex" }}>
            <Ic n="x" size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav style={{ display:"flex", flexDirection:"column", gap:2, flex:1 }}>
        <div style={{ fontSize:10, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.1em", marginBottom:6, paddingLeft:14 }}>
          Workspace
        </div>
        {navItems.map(item => (
          <button key={item.id}
            className={`nav-item ${active === item.id ? "active" : ""}`}
            onClick={() => { onNav(item.id); onClose?.(); }}>
            <Ic n={item.icon} size={16} />
            {item.label}
          </button>
        ))}
      </nav>

      {/* Quota */}
      <div style={{ marginTop:16, padding:"16px", background:C.steel, borderRadius:12, border:`1px solid ${C.border}` }}>
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:8 }}>
          <span style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", letterSpacing:"0.06em" }}>
            {plan.charAt(0).toUpperCase() + plan.slice(1)} Plan
          </span>
          <span style={{ fontSize:12, fontWeight:700, color: pct >= 100 ? C.rose : C.amber }}>
            {plan === "firm" ? "Unlimited" : `${used} / 2`}
          </span>
        </div>
        <div className="progress-track" style={{ marginBottom:12 }}>
          <div className="progress-fill" style={{
            width: `${pct}%`,
            background: pct >= 100 ? `linear-gradient(90deg, ${C.rose}, #F97316)` : undefined
          }}/>
        </div>
        <button className="btn-primary" onClick={() => { onNav("pricing"); onClose?.(); }}
          style={{ width:"100%", padding:"8px", borderRadius:9, fontSize:12 }}>
          Upgrade Plan
        </button>
      </div>
    </div>
  );
};

// ─── TOP BAR ─────────────────────────────────────────
const TopBar = ({ title, user, onLogout, onHamburger, hamburgerOpen }) => (
  <header style={{
    position:"fixed", top:0, left:0, right:0,
    height:60, zIndex:80,
    background:"rgba(12,12,15,0.92)",
    backdropFilter:"blur(16px)",
    WebkitBackdropFilter:"blur(16px)",
    borderBottom:`1px solid rgba(245,243,238,0.07)`,
    display:"flex", alignItems:"center",
    padding:"0 24px 0 20px",
    gap:16,
  }}>
    {/* Hamburger (mobile only) */}
    <button className={`hamburger topbar-menu-btn ${hamburgerOpen ? "open" : ""}`} onClick={onHamburger}>
      <span/><span/><span/>
    </button>

    {/* Logo (mobile only) */}
    <div style={{ flex:1, display:"flex", alignItems:"center", gap:12 }}>
      <div className="topbar-menu-btn">
        <Logo compact />
      </div>
      <span style={{ fontSize:15, fontWeight:600, color:C.cream, letterSpacing:"-0.01em" }}
        className="hide-sm">{title}</span>
    </div>

    {/* Right side */}
    <div style={{ display:"flex", alignItems:"center", gap:12 }}>
      {user ? (
        <>
          <div style={{ textAlign:"right" }} className="hide-sm">
            <div style={{ fontSize:13, fontWeight:600, color:C.cream }}>
              {user.displayName || user.email?.split("@")[0] || "Account"}
            </div>
            <div style={{ fontSize:11, color:C.slate }}>{user.email}</div>
          </div>
          <div style={{
            width:34, height:34, borderRadius:"50%",
            background:`linear-gradient(135deg, ${C.amber}, #E8A84A)`,
            display:"flex", alignItems:"center", justifyContent:"center",
            fontSize:13, fontWeight:800, color:C.ink, flexShrink:0
          }}>
            {(user.displayName || user.email || "U")[0].toUpperCase()}
          </div>
          <button className="btn-ghost" onClick={onLogout}
            data-tip="Sign out"
            style={{ padding:"7px", borderRadius:9, display:"flex" }}>
            <Ic n="logout" size={16} />
          </button>
        </>
      ) : (
        <span style={{ fontSize:13, color:C.slate }}>Not signed in</span>
      )}
    </div>
  </header>
);

// ─── METRIC CARD ─────────────────────────────────────
const Metric = ({ label, value, note, icon, delay = 0 }) => (
  <div className="card" style={{
    padding:"20px 22px",
    animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) ${delay}s both`
  }}>
    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
      <div>
        <div style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
          {label}
        </div>
        <div className="serif" style={{ fontSize:30, fontWeight:700, color:C.cream, lineHeight:1, marginBottom:4 }}>
          {value}
        </div>
        {note && <div style={{ fontSize:12, color:C.slateLight }}>{note}</div>}
      </div>
      <div style={{
        width:38, height:38, borderRadius:10,
        background:C.amberGlow, border:C.amberBorder,
        display:"flex", alignItems:"center", justifyContent:"center",
        color:C.amber, flexShrink:0
      }}>
        <Ic n={icon} size={17} />
      </div>
    </div>
  </div>
);

// ─── RISK BADGE ───────────────────────────────────────
const RiskBadge = ({ score }) => {
  const map = {
    "Safe":          { cls:"tag-safe",     dot:C.emerald, label:"Safe"          },
    "Moderate Risk": { cls:"tag-moderate", dot:C.gold,    label:"Moderate Risk" },
    "High Risk":     { cls:"tag-high",     dot:C.rose,    label:"High Risk"     },
  };
  const m = map[score] || map["Safe"];
  return (
    <span className={`tag ${m.cls}`} style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"3px 10px", borderRadius:100,
      fontSize:11, fontWeight:700, letterSpacing:"0.02em"
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%", background:m.dot, flexShrink:0 }}/>
      {m.label}
    </span>
  );
};

// ─── DASHBOARD VIEW ───────────────────────────────────
const DashboardView = ({ user, profile, docs, onNav }) => {
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";
  const name = user?.displayName?.split(" ")[0] || null;

  return (
    <div className="fade-up">
      {/* Header */}
      <div style={{ marginBottom:32 }}>
        <h1 className="serif" style={{ fontSize:28, fontWeight:700, color:C.cream, letterSpacing:"-0.02em", marginBottom:6 }}>
          {greeting}{name ? `, ${name}` : ""}.
        </h1>
        <p style={{ fontSize:15, color:C.slateLight, maxWidth:520 }}>
          Here is a summary of your workspace. Upload a document to begin a new analysis.
        </p>
      </div>

      {/* Quick action */}
      <div style={{
        background:`linear-gradient(115deg, #1A140A 0%, #1E1810 60%, #16161A 100%)`,
        border:`1px solid ${C.amberBorder}`,
        borderRadius:20, padding:"32px",
        marginBottom:28, position:"relative", overflow:"hidden"
      }}>
        <div style={{
          position:"absolute", top:-60, right:-60,
          width:240, height:240, borderRadius:"50%",
          background:"radial-gradient(circle, rgba(200,135,42,0.12), transparent 70%)"
        }}/>
        <div style={{ position:"relative", maxWidth:520 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:12 }}>
            <div style={{ width:6, height:6, borderRadius:"50%", background:C.amber }}/>
            <span style={{ fontSize:11, fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:"0.08em" }}>
              New Analysis
            </span>
          </div>
          <h2 className="serif" style={{ fontSize:22, fontWeight:700, color:C.cream, marginBottom:10, letterSpacing:"-0.02em" }}>
            Upload a contract, NDA, lease, or any commercial agreement.
          </h2>
          <p style={{ fontSize:13.5, color:C.slateLight, marginBottom:22, lineHeight:1.7 }}>
            ClauseIQ extracts key obligations, identifies risk clauses, and delivers a structured briefing — formatted the way a lawyer would present it, not a chatbot.
          </p>
          <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
            <button className="btn-primary" onClick={() => onNav("analyze")}
              style={{ padding:"11px 24px", borderRadius:11, fontSize:14, display:"flex", alignItems:"center", gap:8 }}>
              <Ic n="scan" size={16} stroke="#0C0C0F" />
              Analyse Document
            </button>
            <button className="btn-ghost" onClick={() => onNav("history")}
              style={{ padding:"11px 20px", borderRadius:11, fontSize:14 }}>
              View History
            </button>
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:14, marginBottom:28 }}>
        <Metric label="Documents Analysed" value={profile?.usageCount || 0} note="Total lifetime" icon="file" delay={0} />
        <Metric label="Active Plan" value={(profile?.plan || "Starter").charAt(0).toUpperCase() + (profile?.plan || "starter").slice(1)} note={profile?.plan === "firm" ? "Unlimited" : "2 doc limit"} icon="layers" delay={0.07} />
        <Metric label="Languages" value="16" note="Output languages" icon="eye" delay={0.14} />
        <Metric label="Accuracy" value="98.4%" note="Clause extraction" icon="shield" delay={0.21} />
      </div>

      {/* Recent docs table */}
      <div className="card" style={{ overflow:"hidden" }}>
        <div style={{
          padding:"18px 24px",
          borderBottom:`1px solid ${C.border}`,
          display:"flex", justifyContent:"space-between", alignItems:"center"
        }}>
          <h3 className="serif" style={{ fontSize:16, fontWeight:700, color:C.cream }}>Recent Analyses</h3>
          {docs.length > 0 && (
            <button className="btn-text" onClick={() => onNav("history")} style={{ fontSize:13 }}>
              View all →
            </button>
          )}
        </div>

        {docs.length === 0 ? (
          <div style={{ padding:"56px 24px", textAlign:"center" }}>
            <div style={{
              width:52, height:52, borderRadius:14,
              background:C.steel, margin:"0 auto 14px",
              display:"flex", alignItems:"center", justifyContent:"center"
            }}>
              <Ic n="file" size={22} stroke={C.slateLight} />
            </div>
            <div style={{ fontSize:14, color:C.slateLight, marginBottom:16 }}>
              No documents analysed yet.
            </div>
            <button className="btn-primary" onClick={() => onNav("analyze")}
              style={{ padding:"9px 22px", borderRadius:10, fontSize:13 }}>
              Start First Analysis
            </button>
          </div>
        ) : (
          <div style={{ overflowX:"auto" }}>
            <table style={{ width:"100%", borderCollapse:"collapse" }}>
              <thead>
                <tr style={{ background:"rgba(245,243,238,0.02)" }}>
                  {["Document","Type","Date","Risk",""].map(h => (
                    <th key={h} style={{
                      padding:"10px 20px", textAlign:"left",
                      fontSize:11, fontWeight:700, color:C.slate,
                      textTransform:"uppercase", letterSpacing:"0.07em"
                    }}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {docs.slice(0,6).map((doc, i) => (
                  <tr key={doc.id} className="table-row" style={{ borderTop:`1px solid ${C.border}` }}>
                    <td style={{ padding:"14px 20px" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                        <div style={{
                          width:30, height:30, borderRadius:8,
                          background:C.steel,
                          display:"flex", alignItems:"center", justifyContent:"center"
                        }}>
                          <Ic n="file" size={14} stroke={C.amber} />
                        </div>
                        <span style={{ fontSize:13, fontWeight:600, maxWidth:180, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                          {doc.docName}
                        </span>
                      </div>
                    </td>
                    <td style={{ padding:"14px 20px" }}>
                      <span style={{ fontSize:12, color:C.slateLight }}>{doc.docType}</span>
                    </td>
                    <td style={{ padding:"14px 20px" }}>
                      <span style={{ fontSize:12, color:C.slate }}>
                        {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString("en-GB",{day:"numeric",month:"short",year:"numeric"}) : "Just now"}
                      </span>
                    </td>
                    <td style={{ padding:"14px 20px" }}>
                      <RiskBadge score={doc.result?.verdict?.score || "Safe"} />
                    </td>
                    <td style={{ padding:"14px 20px" }}>
                      <button style={{
                        background:C.amberGlow, border:C.amberBorder,
                        color:C.amber, padding:"5px 12px", borderRadius:7,
                        fontSize:11, fontWeight:700, cursor:"pointer", fontFamily:"Inter, sans-serif"
                      }}>
                        Open
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

// ─── ANALYZE VIEW ─────────────────────────────────────
const AnalyzeView = ({ user, profile, onResult }) => {
  const [file, setFile]         = useState(null);
  const [docType, setDocType]   = useState("Employment Contract");
  const [lang, setLang]         = useState("English");
  const [over, setOver]         = useState(false);
  const [busy, setBusy]         = useState(false);
  const [progress, setProgress] = useState(0);
  const [stage, setStage]       = useState("");
  const [err, setErr]           = useState(null);
  const fileRef = useRef();

  const plan  = profile?.plan || "free";
  const used  = profile?.usageCount || 0;
  const quota = plan === "firm" ? Infinity : 2;

  const accept = "employment contracts, NDAs, lease agreements, service agreements, loan documents, shareholder agreements, privacy policies, terms of service, vendor contracts, intellectual property licences, commercial agreements, government forms, etc.";

  const stages = [
    "Parsing document structure…",
    "Identifying parties and obligations…",
    "Extracting key clauses…",
    "Assessing risk indicators…",
    "Generating briefing…",
  ];

  const run = async () => {
    if (!file)          return setErr("Select a file to continue.");
    if (!user)          return setErr("Sign in to analyse documents.");
    if (plan !== "firm" && used >= quota)
      return setErr(`Your ${plan === "free" ? "Starter" : "Professional"} plan limit has been reached. Upgrade to continue.`);
    if (file.size > 10 * 1024 * 1024) return setErr("File exceeds 10 MB.");

    setBusy(true); setErr(null); setProgress(0);

    let tick = 0;
    const interval = setInterval(() => {
      tick++;
      setProgress(p => Math.min(p + (Math.random() * 14 + 4), 88));
      setStage(stages[Math.min(tick - 1, stages.length - 1)]);
    }, 700);

    try {
      const reader = new FileReader();
      const content = await new Promise((res, rej) => {
        reader.onload = () => {
          if (file.type === "application/pdf" || file.type.startsWith("image/"))
            res({ data: reader.result.split(",")[1], mimeType: file.type });
          else res(reader.result);
        };
        reader.onerror = rej;
        if (file.type === "application/pdf" || file.type.startsWith("image/"))
          reader.readAsDataURL(file);
        else reader.readAsText(file);
      });

      const res = await fetch("/api/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ content, docType, language: lang, schema: SCHEMA }),
      });

      if (!res.ok) throw new Error("Analysis failed. Verify your API key and file format.");
      const analysis = await res.json();

      clearInterval(interval);
      setProgress(100);
      setStage("Complete.");
      setTimeout(() => onResult({ analysis, docName: file.name, docType, rawContent: content }), 600);
    } catch (e) {
      clearInterval(interval);
      setErr(e.message);
      setBusy(false);
      setProgress(0);
      setStage("");
    }
  };

  const docTypes = [
    "Employment Contract","Non-Disclosure Agreement","Lease Agreement",
    "Service Agreement","Loan Agreement","Shareholder Agreement",
    "Privacy Policy","Terms of Service","Vendor Contract",
    "IP Licence","Freelance Agreement","SaaS Agreement",
    "Government Form","Invoice","Other",
  ];
  const langs = ["English","Arabic","French","Spanish","German","Hindi","Urdu","Chinese","Japanese","Russian","Portuguese","Korean","Italian","Dutch","Turkish","Persian"];

  return (
    <div className="fade-up">
      <div style={{ marginBottom:28 }}>
        <h1 className="serif" style={{ fontSize:26, fontWeight:700, color:C.cream, marginBottom:6, letterSpacing:"-0.02em" }}>
          New Analysis
        </h1>
        <p style={{ fontSize:14, color:C.slateLight }}>
          Upload a document and ClauseIQ will return a structured legal briefing.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"1fr 320px", gap:22, alignItems:"start" }}>
        {/* Left — upload zone */}
        <div>
          {/* Drop zone */}
          <div
            className={`upload-zone ${over ? "over" : ""} ${file ? "has-file" : ""} ${busy ? "scanning" : ""}`}
            style={{ padding: busy ? "40px 32px" : "52px 32px", textAlign:"center", background:C.inkSoft }}
            onDragOver={e => { e.preventDefault(); setOver(true); }}
            onDragLeave={() => setOver(false)}
            onDrop={e => { e.preventDefault(); setOver(false); const f = e.dataTransfer.files[0]; if (f) setFile(f); }}
            onClick={() => !busy && fileRef.current?.click()}
          >
            <div className="scan-line"/>
            <input ref={fileRef} type="file" style={{ display:"none" }}
              accept=".pdf,.docx,.txt,image/*"
              onChange={e => e.target.files[0] && setFile(e.target.files[0])}/>

            {busy ? (
              <>
                <div style={{
                  width:60, height:60, borderRadius:"50%",
                  border:`2px solid ${C.amberBorder}`,
                  borderTopColor:C.amber,
                  animation:"spin 1s linear infinite",
                  margin:"0 auto 16px"
                }}/>
                <div className="serif" style={{ fontSize:17, fontWeight:600, color:C.cream, marginBottom:6 }}>
                  Analysing
                </div>
                <div style={{ fontSize:12.5, color:C.slateLight, marginBottom:20, minHeight:18 }}>{stage}</div>
                <div style={{ maxWidth:280, margin:"0 auto" }}>
                  <div className="progress-track">
                    <div className="progress-fill" style={{ width:`${progress}%` }}/>
                  </div>
                  <div style={{ fontSize:11, color:C.slate, marginTop:6, textAlign:"right" }}>{Math.round(progress)}%</div>
                </div>
              </>
            ) : file ? (
              <>
                <div style={{
                  width:52, height:52, borderRadius:14,
                  background:"rgba(5,150,105,0.12)", border:"1px solid rgba(5,150,105,0.25)",
                  margin:"0 auto 14px",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <Ic n="check" size={22} stroke={C.emerald} sw={2.2}/>
                </div>
                <div className="serif" style={{ fontSize:16, fontWeight:700, color:C.emerald, marginBottom:4 }}>
                  {file.name}
                </div>
                <div style={{ fontSize:12, color:C.slate, marginBottom:14 }}>
                  {(file.size / 1024 / 1024).toFixed(2)} MB — ready to analyse
                </div>
                <button onClick={e => { e.stopPropagation(); setFile(null); }}
                  style={{
                    background:"none", border:`1px solid rgba(220,38,38,0.3)`,
                    color:C.rose, padding:"5px 14px", borderRadius:8,
                    fontSize:12, fontWeight:600, cursor:"pointer", fontFamily:"Inter, sans-serif"
                  }}>
                  Remove
                </button>
              </>
            ) : (
              <>
                <div style={{
                  width:60, height:60, borderRadius:16,
                  background:C.steel, border:`1px solid ${C.border}`,
                  margin:"0 auto 18px",
                  display:"flex", alignItems:"center", justifyContent:"center"
                }}>
                  <Ic n="scan" size={26} stroke={C.amber}/>
                </div>
                <div className="serif" style={{ fontSize:18, fontWeight:700, color:C.cream, marginBottom:8 }}>
                  Drop your document here
                </div>
                <div style={{ fontSize:13, color:C.slateLight, marginBottom:6, lineHeight:1.6, maxWidth:360, margin:"0 auto 16px" }}>
                  Accepts employment contracts, NDAs, lease agreements, service agreements, loan documents, shareholder agreements, privacy policies, terms of service, commercial agreements, etc.
                </div>
                <button className="btn-primary" style={{ padding:"10px 26px", borderRadius:10, fontSize:14 }}>
                  Browse Files
                </button>
                <div style={{ marginTop:20, display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
                  {["PDF, DOCX, TXT or image", "Up to 10 MB", "End-to-end encrypted"].map(t => (
                    <span key={t} style={{ fontSize:11, color:C.slate, display:"flex", alignItems:"center", gap:4 }}>
                      <span style={{ color:C.amber, fontSize:10 }}>•</span> {t}
                    </span>
                  ))}
                </div>
              </>
            )}
          </div>

          {err && (
            <div style={{
              marginTop:12, padding:"12px 16px",
              background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)",
              borderRadius:10, fontSize:13, color:"#FCA5A5", fontWeight:500,
              display:"flex", gap:8, alignItems:"flex-start"
            }}>
              <Ic n="alert" size={16} stroke="#FCA5A5"/>
              {err}
            </div>
          )}
        </div>

        {/* Right — settings + action */}
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div className="card" style={{ padding:20 }}>
            <div style={{ fontSize:12, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:16 }}>
              Analysis Settings
            </div>

            <div style={{ marginBottom:14 }}>
              <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                Document Type
              </label>
              <select value={docType} onChange={e => setDocType(e.target.value)}
                className="field" style={{ padding:"10px 12px", borderRadius:10 }}>
                {docTypes.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>

            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
                Output Language
              </label>
              <select value={lang} onChange={e => setLang(e.target.value)}
                className="field" style={{ padding:"10px 12px", borderRadius:10 }}>
                {langs.map(l => <option key={l}>{l}</option>)}
              </select>
            </div>
          </div>

          {/* Quota card */}
          <div className="card card-amber" style={{ padding:18 }}>
            <div style={{ fontSize:11, fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:10 }}>
              Remaining Quota
            </div>
            <div style={{ fontSize:22, fontWeight:800, fontFamily:"Lora, Georgia, serif", color:C.cream, marginBottom:4 }}>
              {plan === "firm" ? "Unlimited" : `${Math.max(quota - used, 0)} left`}
            </div>
            <div style={{ fontSize:12, color:C.slateLight, marginBottom:10 }}>
              {plan === "firm"
                ? "Firm plan active — no limits."
                : `${used} of ${quota} used on your ${plan === "free" ? "Starter" : "Professional"} plan.`}
            </div>
            {plan !== "firm" && used >= quota && (
              <div style={{ fontSize:12, color:C.rose, fontWeight:600 }}>
                Quota reached. Upgrade to continue.
              </div>
            )}
          </div>

          <button className="btn-primary" onClick={run}
            disabled={busy || !file}
            style={{
              padding:"14px 0", borderRadius:12,
              fontSize:15, fontWeight:800, width:"100%",
              display:"flex", alignItems:"center", justifyContent:"center", gap:9
            }}>
            {busy
              ? <><span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(12,12,15,0.4)", borderTopColor:"#0C0C0F", animation:"spin 0.8s linear infinite", flexShrink:0 }}/>Analysing…</>
              : <><Ic n="zap" size={17} stroke="#0C0C0F"/>Run Analysis</>}
          </button>
        </div>
      </div>
    </div>
  );
};

// ─── RESULT VIEW ──────────────────────────────────────
const ResultView = ({ data, onBack }) => {
  const [tab, setTab] = useState("summary");
  const { analysis: a, docName, docType } = data;
  if (!a) return null;

  const scoreColor = { "Safe": C.emerald, "Moderate Risk": C.gold, "High Risk": C.rose }[a.verdict?.score] || C.emerald;
  const scoreGrade = { "Safe": "A", "Moderate Risk": "B", "High Risk": "F" }[a.verdict?.score] || "A";

  const tabs = [
    { id:"summary",   label:"Summary"                            },
    { id:"clauses",   label:`Clauses (${a.clauses?.length || 0})`},
    { id:"risks",     label:`Risks (${a.risks?.length || 0})`    },
    { id:"benefits",  label:`Benefits (${a.benefits?.length ||0})`},
    { id:"questions", label:"Questions"                          },
  ];

  return (
    <div className="fade-up">
      {/* Breadcrumb + actions */}
      <div style={{ display:"flex", alignItems:"center", gap:14, marginBottom:24, flexWrap:"wrap" }}>
        <button className="btn-ghost" onClick={onBack}
          style={{ padding:"7px 16px", borderRadius:9, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          ← Back
        </button>
        <div style={{ flex:1 }}>
          <span style={{ fontSize:11, color:C.slate, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            {docType}
          </span>
          <h2 className="serif" style={{ fontSize:19, fontWeight:700, color:C.cream, marginTop:2, letterSpacing:"-0.01em" }}>
            {docName}
          </h2>
        </div>
        <button className="btn-ghost" style={{ padding:"7px 16px", borderRadius:9, fontSize:13, display:"flex", alignItems:"center", gap:6 }}>
          <Ic n="download" size={14}/> Export
        </button>
      </div>

      {/* Verdict banner */}
      <div style={{
        background:`rgba(${scoreColor === C.emerald ? "5,150,105" : scoreColor === C.gold ? "245,158,11" : "220,38,38"},0.07)`,
        border:`1px solid rgba(${scoreColor === C.emerald ? "5,150,105" : scoreColor === C.gold ? "245,158,11" : "220,38,38"},0.2)`,
        borderRadius:16, padding:"22px 28px", marginBottom:22,
        display:"flex", alignItems:"center", gap:24, flexWrap:"wrap"
      }}>
        <div className="verdict-ring" style={{
          borderColor:`rgba(${scoreColor === C.emerald ? "5,150,105" : scoreColor === C.gold ? "245,158,11" : "220,38,38"},0.35)`,
          background:`rgba(${scoreColor === C.emerald ? "5,150,105" : scoreColor === C.gold ? "245,158,11" : "220,38,38"},0.08)`,
          flexShrink:0
        }}>
          <span className="serif" style={{ fontSize:26, fontWeight:700, color:scoreColor }}>{scoreGrade}</span>
          <span style={{ fontSize:9, color:C.slate, fontWeight:700 }}>{a.verdict?.confidence}%</span>
        </div>
        <div style={{ flex:1 }}>
          <div style={{ fontSize:11, color:C.slate, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:4 }}>
            Overall Verdict
          </div>
          <div className="serif" style={{ fontSize:22, fontWeight:700, color:scoreColor, marginBottom:6 }}>
            {a.verdict?.score}
          </div>
          <div style={{ fontSize:13.5, color:C.creamDim, lineHeight:1.6, maxWidth:560 }}>
            {a.verdict?.reasoning}
          </div>
        </div>
      </div>

      {/* Key info grid */}
      <div className="grid-2" style={{ display:"grid", gridTemplateColumns:"1fr 1fr", gap:12, marginBottom:22 }}>
        {[
          { label:"Parties",        val: a.keyInformation?.parties        },
          { label:"Key Dates",      val: a.keyInformation?.dates          },
          { label:"Payment Terms",  val: a.keyInformation?.paymentTerms   },
          { label:"Responsibilities",val: a.keyInformation?.responsibilities},
        ].map(i => (
          <div key={i.label} className="card" style={{ padding:"16px 18px" }}>
            <div style={{ fontSize:10, color:C.slate, fontWeight:700, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:6 }}>
              {i.label}
            </div>
            <div style={{ fontSize:13, fontWeight:600, color:C.cream, lineHeight:1.5 }}>
              {i.val || "Not specified"}
            </div>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div style={{ overflowX:"auto", marginBottom:18, paddingBottom:4 }}>
        <div className="tab-bar" style={{ display:"inline-flex", minWidth:"max-content" }}>
          {tabs.map(t => (
            <button key={t.id} className={`tab ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
              {t.label}
            </button>
          ))}
        </div>
      </div>

      {/* Tab content */}
      <div className="card" style={{ padding:26 }}>
        {tab === "summary" && (
          <>
            <h3 className="serif" style={{ fontSize:17, fontWeight:700, marginBottom:14, color:C.cream }}>Summary</h3>
            <p style={{ fontSize:14, color:C.creamDim, lineHeight:1.85, whiteSpace:"pre-wrap" }}>{a.simpleSummary}</p>
          </>
        )}

        {tab === "clauses" && (
          <>
            <h3 className="serif" style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.cream }}>Key Clauses</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
              {a.clauses?.map((c, i) => (
                <div key={i} style={{ background:C.steel, border:`1px solid ${C.border}`, borderRadius:12, padding:"16px 18px" }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:8, gap:12 }}>
                    <span style={{ fontSize:14, fontWeight:700, color:C.cream }}>{c.title}</span>
                    <span style={{
                      fontSize:10, color:C.amber, background:C.amberGlow,
                      border:C.amberBorder, padding:"2px 9px", borderRadius:100,
                      fontWeight:700, whiteSpace:"nowrap", flexShrink:0
                    }}>{c.section}</span>
                  </div>
                  <p style={{ fontSize:13.5, color:C.creamDim, lineHeight:1.65 }}>{c.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "risks" && (
          <>
            <h3 className="serif" style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.cream }}>Risk Flags</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {a.risks?.map((r, i) => (
                <div key={i} style={{
                  background:"rgba(220,38,38,0.05)", border:"1px solid rgba(220,38,38,0.15)",
                  borderLeft:`3px solid ${C.rose}`, borderRadius:"0 12px 12px 0", padding:"14px 18px"
                }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#FCA5A5", marginBottom:5 }}>{r.title}</div>
                  <p style={{ fontSize:13.5, color:C.creamDim, lineHeight:1.65 }}>{r.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "benefits" && (
          <>
            <h3 className="serif" style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.cream }}>Favourable Terms</h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {a.benefits?.map((b, i) => (
                <div key={i} style={{
                  background:"rgba(5,150,105,0.05)", border:"1px solid rgba(5,150,105,0.15)",
                  borderLeft:`3px solid ${C.emerald}`, borderRadius:"0 12px 12px 0", padding:"14px 18px"
                }}>
                  <div style={{ fontSize:14, fontWeight:700, color:"#6EE7B7", marginBottom:5 }}>{b.title}</div>
                  <p style={{ fontSize:13.5, color:C.creamDim, lineHeight:1.65 }}>{b.description}</p>
                </div>
              ))}
            </div>
          </>
        )}

        {tab === "questions" && (
          <>
            <h3 className="serif" style={{ fontSize:17, fontWeight:700, marginBottom:16, color:C.cream }}>
              Questions to Raise with Counsel
            </h3>
            <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
              {a.questions?.map((q, i) => (
                <div key={i} style={{
                  display:"flex", gap:14, padding:"12px 16px",
                  background:C.steel, border:`1px solid ${C.border}`, borderRadius:11
                }}>
                  <span className="serif" style={{ color:C.amber, fontWeight:700, fontSize:15, flexShrink:0 }}>{i + 1}.</span>
                  <p style={{ fontSize:13.5, color:C.creamDim, lineHeight:1.65 }}>{q}</p>
                </div>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Disclaimer */}
      <div style={{
        marginTop:20, padding:"14px 18px",
        background:C.steel, border:`1px solid ${C.border}`,
        borderRadius:12
      }}>
        <div style={{ display:"flex", gap:10, alignItems:"flex-start" }}>
          <Ic n="info" size={16} stroke={C.slateLight} style={{ flexShrink:0, marginTop:1 }}/>
          <p style={{ fontSize:12, color:C.slate, lineHeight:1.7 }}>
            This briefing is generated by automated analysis and is provided for informational purposes only.
            It does not constitute legal advice and should not be relied upon as a substitute for consultation
            with a qualified solicitor or legal counsel.
          </p>
        </div>
      </div>
    </div>
  );
};

// ─── WHY NOT CHATGPT SECTION ──────────────────────────
const WhyClauses = () => {
  const reasons = [
    {
      title: "ChatGPT has no memory of your document after the conversation closes.",
      body:  "Every session is ephemeral. ClauseIQ stores your analysis permanently, indexes your history, and lets you revisit any clause from any document you have ever uploaded.",
    },
    {
      title: "ChatGPT cannot enforce structured output reliably.",
      body:  "Ask ChatGPT to extract risk clauses from a 40-page agreement and you get a freeform essay. ClauseIQ uses constrained schema generation — every risk, every clause, every obligation lands in a predictable, searchable structure.",
    },
    {
      title: "ChatGPT does not know what document type you are reviewing.",
      body:  "ClauseIQ applies document-class-specific analysis. An employment contract triggers a different set of checks than a SaaS agreement — jurisdiction clauses, IP assignment, non-competes, payment triggers. Generic prompts miss the specifics.",
    },
    {
      title: "ChatGPT will cheerfully hallucinate a clause that does not exist.",
      body:  "Our analysis is grounded entirely in the document you upload. Nothing is fabricated. Every extracted clause maps to the source text. If something is not in the document, it does not appear in the briefing.",
    },
    {
      title: "ChatGPT has no legal-grade confidence scoring.",
      body:  "ClauseIQ assigns a calibrated confidence score and risk grade to every analysis. You know how certain the extraction is — not just what it found.",
    },
    {
      title: "Privacy. ChatGPT uses your inputs to train future models.",
      body:  "Uploading a confidential NDA to a public AI chatbot is a compliance risk. ClauseIQ processes documents in an isolated pipeline. Your contracts are not model training data.",
    },
  ];

  return (
    <div className="fade-up">
      <div style={{ marginBottom:32 }}>
        <div style={{
          display:"inline-flex", alignItems:"center", gap:8,
          background:C.amberGlow, border:C.amberBorder,
          borderRadius:100, padding:"5px 14px", marginBottom:14
        }}>
          <Ic n="info" size={13} stroke={C.amber}/>
          <span style={{ fontSize:11, fontWeight:700, color:C.amber, textTransform:"uppercase", letterSpacing:"0.07em" }}>
            Frequently Asked
          </span>
        </div>
        <h2 className="serif" style={{ fontSize:26, fontWeight:700, color:C.cream, letterSpacing:"-0.02em", marginBottom:10 }}>
          "Why can't I just paste this into ChatGPT?"
        </h2>
        <p style={{ fontSize:14, color:C.slateLight, maxWidth:580, lineHeight:1.75 }}>
          It is a fair question. Here is an honest answer.
        </p>
      </div>

      <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
        {reasons.map((r, i) => (
          <div key={i} className="reason-card">
            <div style={{ fontSize:14, fontWeight:700, color:C.cream, marginBottom:6 }}>{r.title}</div>
            <div style={{ fontSize:13.5, color:C.slateLight, lineHeight:1.7 }}>{r.body}</div>
          </div>
        ))}
      </div>

      <div style={{
        marginTop:28, padding:"22px 24px",
        background:`linear-gradient(115deg, #1A140A, #16161A)`,
        border:C.amberBorder, borderRadius:16
      }}>
        <div className="serif" style={{ fontSize:17, fontWeight:700, color:C.cream, marginBottom:6 }}>
          The short version.
        </div>
        <p style={{ fontSize:13.5, color:C.slateLight, lineHeight:1.75 }}>
          ChatGPT is a general-purpose assistant. ClauseIQ is purpose-built for legal document review —
          with persistent storage, document-class-specific analysis, constrained structured output,
          confidence scoring, and a privacy architecture designed for confidential materials.
          If you are reviewing a contract that matters, the tool should match the stakes.
        </p>
      </div>
    </div>
  );
};

// ─── PRICING VIEW ─────────────────────────────────────
const PricingView = ({ profile, onNav }) => {
  const active = profile?.plan || "free";

  const plans = [
    {
      id:       "free",
      name:     "Starter",
      price:    0,
      billing:  "Free forever",
      desc:     "Sufficient for occasional contract reviews.",
      features: [
        "2 documents total",
        "Up to 5 pages per document",
        "Full risk briefing",
        "Plain-language summary",
        "16 output languages",
      ],
      cta:      "Current Plan",
    },
    {
      id:       "pro",
      name:     "Professional",
      price:    15,
      billing:  "per month",
      desc:     "For legal professionals and business owners reviewing documents regularly.",
      features: [
        "2 documents per day",
        "Up to 10 pages per document",
        "Priority processing queue",
        "Clause-level annotations",
        "Document history, unlimited",
        "16 output languages",
      ],
      cta:      "Upgrade to Professional",
      highlight:true,
    },
    {
      id:       "firm",
      name:     "Firm",
      price:    49,
      billing:  "per month",
      desc:     "For legal teams, law firms, and compliance-heavy organisations.",
      features: [
        "Unlimited documents",
        "Up to 20 pages per document",
        "Dedicated processing instance",
        "Custom risk policy configuration",
        "API access",
        "Team workspace",
        "Priority support",
      ],
      cta:      "Contact Sales",
    },
  ];

  return (
    <div className="fade-up">
      <div style={{ textAlign:"center", marginBottom:44 }}>
        <h1 className="serif" style={{ fontSize:30, fontWeight:700, color:C.cream, letterSpacing:"-0.03em", marginBottom:10 }}>
          Straightforward pricing.
        </h1>
        <p style={{ fontSize:15, color:C.slateLight, maxWidth:420, margin:"0 auto" }}>
          No feature paywalls. No usage ratchets. Every plan includes the full analysis engine.
        </p>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(270px, 1fr))", gap:22, maxWidth:920, margin:"0 auto", marginBottom:52 }}>
        {plans.map(p => (
          <div key={p.id} className={`card plan-card ${p.highlight ? "highlight" : ""}`}
            style={{ padding:"28px 24px", position:"relative", overflow:"hidden", borderRadius:18 }}>
            {p.highlight && (
              <div style={{
                position:"absolute", top:16, right:16,
                background:C.amber, color:C.ink,
                fontSize:10, fontWeight:800, padding:"3px 10px", borderRadius:100,
                textTransform:"uppercase", letterSpacing:"0.06em"
              }}>
                Popular
              </div>
            )}
            <div style={{ marginBottom:22 }}>
              <div style={{ fontSize:11, fontWeight:700, color:C.slateLight, textTransform:"uppercase", letterSpacing:"0.08em", marginBottom:8 }}>
                {p.name}
              </div>
              <div style={{ display:"flex", alignItems:"baseline", gap:4, marginBottom:8 }}>
                <span className="serif" style={{ fontSize:38, fontWeight:700, color:C.cream, lineHeight:1 }}>
                  ${p.price}
                </span>
                <span style={{ fontSize:13, color:C.slate }}>{p.billing}</span>
              </div>
              <p style={{ fontSize:13, color:C.slateLight, lineHeight:1.6 }}>{p.desc}</p>
            </div>

            <div style={{ display:"flex", flexDirection:"column", gap:9, marginBottom:24 }}>
              {p.features.map((f, i) => (
                <div key={i} style={{ display:"flex", gap:9, alignItems:"flex-start" }}>
                  <div style={{
                    width:17, height:17, borderRadius:"50%", flexShrink:0, marginTop:1,
                    background: p.highlight ? C.amberGlow : C.steel,
                    border: p.highlight ? C.amberBorder : `1px solid ${C.border}`,
                    display:"flex", alignItems:"center", justifyContent:"center"
                  }}>
                    <Ic n="check" size={9} stroke={p.highlight ? C.amber : C.slateLight} sw={2.5}/>
                  </div>
                  <span style={{ fontSize:13, color:C.creamDim, lineHeight:1.5 }}>{f}</span>
                </div>
              ))}
            </div>

            <button
              className={active === p.id ? "btn-ghost" : p.highlight ? "btn-primary" : "btn-ghost"}
              disabled={active === p.id}
              style={{
                width:"100%", padding:"11px", borderRadius:11,
                fontSize:14, fontWeight:700, cursor: active === p.id ? "default" : "pointer",
                opacity: active === p.id ? 0.55 : 1
              }}>
              {active === p.id ? "Current Plan" : p.cta}
            </button>
          </div>
        ))}
      </div>

      <WhyClauses />
    </div>
  );
};

// ─── HISTORY VIEW ─────────────────────────────────────
const HistoryView = ({ docs, onNav }) => (
  <div className="fade-up">
    <div style={{ marginBottom:28 }}>
      <h1 className="serif" style={{ fontSize:26, fontWeight:700, color:C.cream, marginBottom:6, letterSpacing:"-0.02em" }}>
        Analysis History
      </h1>
      <p style={{ fontSize:14, color:C.slateLight }}>Every document you have submitted, with its briefing intact.</p>
    </div>

    {docs.length === 0 ? (
      <div className="card" style={{ padding:"64px 32px", textAlign:"center" }}>
        <div style={{ width:52, height:52, borderRadius:14, background:C.steel, margin:"0 auto 14px", display:"flex", alignItems:"center", justifyContent:"center" }}>
          <Ic n="history" size={22} stroke={C.slateLight}/>
        </div>
        <div style={{ fontSize:14, color:C.slateLight, marginBottom:18 }}>No documents on record.</div>
        <button className="btn-primary" onClick={() => onNav("analyze")}
          style={{ padding:"9px 22px", borderRadius:10, fontSize:13 }}>
          Submit First Document
        </button>
      </div>
    ) : (
      <div className="card" style={{ overflow:"hidden" }}>
        {docs.map((doc, i) => (
          <div key={doc.id} className="table-row" style={{
            display:"flex", alignItems:"center", gap:16, padding:"16px 22px",
            borderBottom: i < docs.length - 1 ? `1px solid ${C.border}` : "none",
            cursor:"pointer"
          }}>
            <div style={{ width:34, height:34, borderRadius:9, background:C.steel, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
              <Ic n="file" size={15} stroke={C.amber}/>
            </div>
            <div style={{ flex:1, minWidth:0 }}>
              <div style={{ fontSize:13.5, fontWeight:600, color:C.cream, overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>
                {doc.docName}
              </div>
              <div style={{ fontSize:12, color:C.slate }}>{doc.docType}</div>
            </div>
            <RiskBadge score={doc.result?.verdict?.score || "Safe"}/>
            <span style={{ fontSize:12, color:C.slate }} className="hide-sm">
              {doc.createdAt?.toDate ? doc.createdAt.toDate().toLocaleDateString("en-GB",{day:"numeric",month:"short"}) : "Now"}
            </span>
          </div>
        ))}
      </div>
    )}
  </div>
);

// ─── SETTINGS VIEW ────────────────────────────────────
const SettingsView = ({ user, profile }) => {
  const [name, setName] = useState(user?.displayName || "");
  const [saved, setSaved] = useState(false);
  const fldStyle = { padding:"11px 14px", borderRadius:11, fontSize:14, border:`1px solid rgba(245,243,238,0.1)` };

  return (
    <div className="fade-up" style={{ maxWidth:600 }}>
      <div style={{ marginBottom:28 }}>
        <h1 className="serif" style={{ fontSize:26, fontWeight:700, color:C.cream, marginBottom:6, letterSpacing:"-0.02em" }}>
          Settings
        </h1>
        <p style={{ fontSize:14, color:C.slateLight }}>Manage your account and workspace preferences.</p>
      </div>

      <div className="card" style={{ padding:24, marginBottom:18 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>
          Profile
        </div>
        <div style={{ display:"flex", flexDirection:"column", gap:14 }}>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
              Display Name
            </label>
            <input className="field" style={fldStyle} value={name} onChange={e => setName(e.target.value)} placeholder="Your name"/>
          </div>
          <div>
            <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.06em", display:"block", marginBottom:6 }}>
              Email Address
            </label>
            <input className="field" style={{ ...fldStyle, opacity:0.45, cursor:"not-allowed" }} value={user?.email || ""} readOnly/>
          </div>
          <div>
            <button className="btn-primary" onClick={() => setSaved(true)}
              style={{ padding:"9px 22px", borderRadius:10, fontSize:13 }}>
              {saved ? "Saved" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>

      <div className="card" style={{ padding:24, marginBottom:18 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>
          Subscription
        </div>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center" }}>
          <div>
            <div className="serif" style={{ fontSize:17, fontWeight:700, color:C.cream, textTransform:"capitalize", marginBottom:4 }}>
              {profile?.plan || "Starter"} Plan
            </div>
            <div style={{ fontSize:13, color:C.slateLight }}>
              {profile?.plan === "firm" ? "Unlimited documents." : `${profile?.usageCount || 0} of 2 documents used.`}
            </div>
          </div>
          <span style={{
            padding:"5px 14px", borderRadius:100, fontSize:11, fontWeight:700,
            textTransform:"uppercase", letterSpacing:"0.06em",
            background:profile?.plan === "free" ? C.steel : C.amberGlow,
            border: profile?.plan === "free" ? `1px solid ${C.border}` : C.amberBorder,
            color:profile?.plan === "free" ? C.slateLight : C.amber
          }}>
            {profile?.plan || "Starter"}
          </span>
        </div>
      </div>

      <div className="card" style={{ padding:24 }}>
        <div style={{ fontSize:12, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", marginBottom:18 }}>
          Security
        </div>
        {[
          { label:"Email verified",          val: user?.emailVerified ? "Verified" : "Pending",  ok: !!user?.emailVerified },
          { label:"Document encryption",     val: "AES-256 in transit and at rest",              ok: true },
          { label:"Session",                 val: "Authenticated",                               ok: true },
          { label:"Data retention",          val: "Documents stored indefinitely per your plan", ok: true },
        ].map(row => (
          <div key={row.label} style={{
            display:"flex", justifyContent:"space-between", padding:"11px 0",
            borderBottom:`1px solid ${C.border}`
          }}>
            <span style={{ fontSize:13, color:C.slateLight }}>{row.label}</span>
            <span style={{ fontSize:13, fontWeight:600, color: row.ok ? C.emerald : C.gold }}>{row.val}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ─── AUTH VIEW ────────────────────────────────────────
const AuthView = ({ onAuth, onGoogleAuth }) => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail]     = useState("");
  const [pass, setPass]       = useState("");
  const [busy, setBusy]       = useState(false);
  const [googleBusy, setGoogleBusy] = useState(false);
  const [err, setErr]         = useState(null);

  const fldStyle = { padding:"12px 14px", borderRadius:11, fontSize:14, border:`1px solid rgba(245,243,238,0.1)` };

  const submit = async e => {
    e.preventDefault();
    if (pass.length < 8 && !isLogin) {
      return setErr("Password must be at least 8 characters.");
    }
    setBusy(true); setErr(null);
    try {
      await onAuth(email, pass, isLogin);
    } catch(ex) {
      setErr(ex.message.replace("Firebase: ","").replace(/\s*\(.*\)/,"").trim());
    } finally { setBusy(false); }
  };

  const handleGoogle = async () => {
    setGoogleBusy(true); setErr(null);
    try {
      await onGoogleAuth();
    } catch(ex) {
      setErr(ex.message.replace("Firebase: ","").replace(/\s*\(.*\)/,"").trim());
    } finally { setGoogleBusy(false); }
  };

  return (
    <div style={{
      minHeight:"100vh", display:"flex",
      alignItems:"center", justifyContent:"center",
      padding:"40px 24px", position:"relative", zIndex:1
    }}>
      <div style={{ width:"100%", maxWidth:420, animation:"fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both" }}>

        {/* Header */}
        <div style={{ textAlign:"center", marginBottom:32 }}>
          <div style={{ display:"flex", justifyContent:"center", marginBottom:18 }}><Logo/></div>
          <h1 className="serif" style={{ fontSize:24, fontWeight:700, color:C.cream, marginBottom:8, letterSpacing:"-0.02em" }}>
            {isLogin ? "Sign in to your workspace." : "Create an account."}
          </h1>
          <p style={{ fontSize:13.5, color:C.slateLight }}>
            {isLogin ? "Your documents and analyses are waiting." : "Start with two free document analyses."}
          </p>
        </div>

        <div className="card" style={{ padding:28 }}>

          {/* Google button — top, most prominent */}
          <button
            onClick={handleGoogle}
            disabled={googleBusy || busy}
            style={{
              width:"100%", padding:"12px 16px",
              borderRadius:11, fontSize:14, fontWeight:600,
              background:"#ffffff", color:"#1F1F1F",
              border:"none", cursor: googleBusy ? "not-allowed" : "pointer",
              display:"flex", alignItems:"center", justifyContent:"center", gap:10,
              marginBottom:20,
              opacity: googleBusy ? 0.7 : 1,
              transition:"box-shadow 0.18s, opacity 0.18s",
              boxShadow:"0 1px 3px rgba(0,0,0,0.3)",
              fontFamily:"Inter, sans-serif",
            }}
            onMouseEnter={e => { if (!googleBusy) e.currentTarget.style.boxShadow = "0 3px 10px rgba(0,0,0,0.4)"; }}
            onMouseLeave={e => { e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.3)"; }}
          >
            {googleBusy ? (
              <span style={{
                width:18, height:18, borderRadius:"50%",
                border:"2px solid rgba(31,31,31,0.25)", borderTopColor:"#1F1F1F",
                animation:"spin 0.8s linear infinite", flexShrink:0
              }}/>
            ) : (
              /* Official Google G SVG */
              <svg width="18" height="18" viewBox="0 0 48 48">
                <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
                <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
                <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
                <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
                <path fill="none" d="M0 0h48v48H0z"/>
              </svg>
            )}
            {googleBusy ? "Connecting…" : "Continue with Google"}
          </button>

          {/* OR divider */}
          <div style={{
            display:"flex", alignItems:"center", gap:12, marginBottom:20
          }}>
            <div style={{ flex:1, height:1, background:"rgba(245,243,238,0.08)" }}/>
            <span style={{ fontSize:12, fontWeight:600, color:C.slate, letterSpacing:"0.05em" }}>OR</span>
            <div style={{ flex:1, height:1, background:"rgba(245,243,238,0.08)" }}/>
          </div>

          {/* Email + password form */}
          <form onSubmit={submit} style={{ display:"flex", flexDirection:"column", gap:14 }}>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6 }}>
                Email Address
              </label>
              <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                className="field" style={fldStyle} placeholder="you@company.com" required/>
            </div>
            <div>
              <label style={{ fontSize:11, fontWeight:700, color:C.slate, textTransform:"uppercase", letterSpacing:"0.07em", display:"block", marginBottom:6 }}>
                Password
              </label>
              <input type="password" value={pass} onChange={e => setPass(e.target.value)}
                className="field" style={fldStyle} placeholder="Minimum 8 characters" required/>
            </div>

            {err && (
              <div style={{
                background:"rgba(220,38,38,0.08)", border:"1px solid rgba(220,38,38,0.2)",
                borderRadius:9, padding:"10px 14px", fontSize:13, color:"#FCA5A5", fontWeight:500,
                display:"flex", gap:8, alignItems:"flex-start"
              }}>
                <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="#FCA5A5" strokeWidth={2} strokeLinecap="round" strokeLinejoin="round" style={{ flexShrink:0, marginTop:1 }}>
                  <path d="M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
                  <path d="M12 9v4M12 17h.01"/>
                </svg>
                {err}
              </div>
            )}

            <button type="submit" className="btn-primary" disabled={busy || googleBusy}
              style={{ padding:"13px", borderRadius:11, fontSize:15, fontWeight:800, marginTop:4, display:"flex", alignItems:"center", justifyContent:"center", gap:8 }}>
              {busy
                ? <><span style={{ width:16, height:16, borderRadius:"50%", border:"2px solid rgba(12,12,15,0.3)", borderTopColor:"#0C0C0F", animation:"spin 0.8s linear infinite" }}/> Please wait…</>
                : isLogin ? "Sign In with Email" : "Create Account"
              }
            </button>
          </form>

          {/* Toggle login/register */}
          <div style={{ textAlign:"center", marginTop:18, fontSize:13, color:C.slate }}>
            {isLogin ? "No account? " : "Already registered? "}
            <button className="btn-text" onClick={() => { setIsLogin(!isLogin); setErr(null); }}>
              {isLogin ? "Create one free" : "Sign in"}
            </button>
          </div>
        </div>

        {/* Trust badges */}
        <div style={{ textAlign:"center", marginTop:18, display:"flex", justifyContent:"center", gap:20, flexWrap:"wrap" }}>
          {["Encrypted in transit", "No training on your data", "Two free analyses"].map(t => (
            <span key={t} style={{ fontSize:11, color:"#2A2A32", fontWeight:600, display:"flex", alignItems:"center", gap:4 }}>
              <span style={{ color:C.amber }}>•</span>{t}
            </span>
          ))}
        </div>
      </div>
    </div>
  );
};

// ─── GEMINI SCHEMA ────────────────────────────────────
const SCHEMA = {
  type:"object",
  properties:{
    simpleSummary:{type:"string"},
    keyInformation:{
      type:"object",
      properties:{
        parties:{type:"string"}, dates:{type:"string"},
        paymentTerms:{type:"string"}, responsibilities:{type:"string"}
      },
      required:["parties","dates","paymentTerms","responsibilities"]
    },
    clauses:{type:"array",items:{type:"object",properties:{title:{type:"string"},section:{type:"string"},description:{type:"string"}},required:["title","section","description"]}},
    risks:{type:"array",items:{type:"object",properties:{title:{type:"string"},description:{type:"string"}},required:["title","description"]}},
    benefits:{type:"array",items:{type:"object",properties:{title:{type:"string"},description:{type:"string"}},required:["title","description"]}},
    checkCarefully:{type:"array",items:{type:"object",properties:{title:{type:"string"},description:{type:"string"}},required:["title","description"]}},
    questions:{type:"array",items:{type:"string"}},
    verdict:{type:"object",properties:{score:{type:"string",enum:["Safe","Moderate Risk","High Risk"]},reasoning:{type:"string"},confidence:{type:"number"}},required:["score","reasoning","confidence"]}
  },
  required:["simpleSummary","keyInformation","clauses","risks","benefits","checkCarefully","questions","verdict"]
};

// ─── APP ROOT ─────────────────────────────────────────
export default function LexiAnalyse() {
  const [view,        setView]       = useState("dashboard");
  const [user,        setUser]       = useState(null);
  const [profile,     setProfile]    = useState({ plan:"free", usageCount:0 });
  const [docs,        setDocs]       = useState([]);
  const [result,      setResult]     = useState(null);
  const [sideOpen,    setSideOpen]   = useState(false);
  const SIDEBAR_W = 248;

  useEffect(() => {
    initStyles();
    injectSEO();
  }, []);

  const titles = {
    dashboard: "Overview",
    analyze:   "New Analysis",
    history:   "History",
    pricing:   "Plans",
    settings:  "Settings",
    result:    "Analysis Result",
  };

  const handleNav = id => {
    setView(id);
    setResult(null);
    setSideOpen(false);
  };

  const handleResult = data => {
    setResult(data);
    setDocs(prev => [{
      id: Date.now(),
      docName: data.docName,
      docType: data.docType,
      result:  data.analysis,
      createdAt: null
    }, ...prev]);
    setView("result");
  };

  const handleAuth = async (email, pass, isLogin) => {
    // Replace with real Firebase calls:
    // import { getAuth, signInWithEmailAndPassword, createUserWithEmailAndPassword } from "firebase/auth";
    // const auth = getAuth();
    // const fn = isLogin ? signInWithEmailAndPassword : createUserWithEmailAndPassword;
    // const cred = await fn(auth, email, pass);
    // setUser(cred.user);
    setUser({ email, displayName: email.split("@")[0], emailVerified: true });
    setView("dashboard");
  };

  const handleGoogleAuth = async () => {
    // Replace with real Firebase calls:
    // import { getAuth, GoogleAuthProvider, signInWithPopup } from "firebase/auth";
    // const auth = getAuth();
    // const provider = new GoogleAuthProvider();
    // const cred = await signInWithPopup(auth, provider);
    // setUser(cred.user);
    setUser({ email: "demo@gmail.com", displayName: "Demo User", emailVerified: true });
    setView("dashboard");
  };

  if (!user) {
    return (
      <>
        <Background/>
        <AuthView onAuth={handleAuth} onGoogleAuth={handleGoogleAuth}/>
      </>
    );
  }

  return (
    <>
      <Background/>

      {/* Mobile sidebar overlay */}
      <div className={`sidebar-overlay ${sideOpen ? "visible" : ""}`} onClick={() => setSideOpen(false)}/>

      {/* Desktop sidebar */}
      <div className="sidebar-desktop" style={{
        position:"fixed", top:0, left:0, bottom:0, zIndex:100, width:SIDEBAR_W
      }}>
        <SidebarContent active={view} onNav={handleNav} profile={profile}/>
      </div>

      {/* Mobile sidebar (slide-in) */}
      <div className="sidebar-mobile" style={{
        position:"fixed", top:0, left:0, bottom:0, zIndex:110, width:SIDEBAR_W,
        transform: sideOpen ? "translateX(0)" : "translateX(-100%)",
        transition:"transform 0.28s cubic-bezier(0.22,1,0.36,1)"
      }}>
        <SidebarContent active={view} onNav={handleNav} profile={profile} onClose={() => setSideOpen(false)}/>
      </div>

      {/* Top bar */}
      <TopBar
        title={titles[view] || "Lexi Analyse"}
        user={user}
        onLogout={() => { setUser(null); setView("dashboard"); }}
        onHamburger={() => setSideOpen(o => !o)}
        hamburgerOpen={sideOpen}
      />

      {/* Main */}
      <main style={{
        marginLeft: SIDEBAR_W,
        paddingTop: 60,
        minHeight: "100vh",
        position: "relative", zIndex: 1
      }} className="sidebar-main">
        <style>{`
          @media (max-width: 900px) {
            .sidebar-main { margin-left: 0 !important; }
          }
        `}</style>
        <div className="center-wrap" style={{ paddingTop:36, paddingBottom:48 }}>
          {view === "dashboard" && <DashboardView user={user} profile={profile} docs={docs} onNav={handleNav}/>}
          {view === "analyze"   && <AnalyzeView user={user} profile={profile} onResult={handleResult}/>}
          {view === "result"    && result && <ResultView data={result} onBack={() => setView("analyze")}/>}
          {view === "history"   && <HistoryView docs={docs} onNav={handleNav}/>}
          {view === "pricing"   && <PricingView profile={profile} onNav={handleNav}/>}
          {view === "settings"  && <SettingsView user={user} profile={profile}/>}
        </div>
      </main>
    </>
  );
}
