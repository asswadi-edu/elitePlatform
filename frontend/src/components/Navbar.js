import React, { useState, useEffect, useContext, useRef } from "react";
import { C } from "../tokens";
import { Btn } from "./Common";
import { PiGraduationCapDuotone, PiMoonDuotone, PiSunDuotone, PiListDuotone, PiXDuotone } from "react-icons/pi";
import { ThemeContext } from "../ThemeContext";
import { LanguageContext } from "../LanguageContext";
import { SettingsContext } from "../SettingsContext";
import { UserContext } from "../UserContext";
import { useLocation } from "react-router-dom";
import { getApiUrl } from "../api";
import UserAvatar from "./UserAvatar";
import { RankBadge } from "../dashboard/ranking";

export default function Navbar({ setPage, loggedIn, userRole = "guest", onLogout }) {
  const { user } = useContext(UserContext);
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { lang, toggleLang, t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const location = useLocation();
  const page = location.pathname;
  const menuRef = useRef(null);

  useEffect(() => {
    const h = () => setScrolled(window.scrollY > 20);
    window.addEventListener("scroll", h);
    return () => window.removeEventListener("scroll", h);
  }, []);

  // Close mobile menu on route change
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Close on outside click
  useEffect(() => {
    function handleOutside(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setMobileOpen(false);
      }
    }
    if (mobileOpen) document.addEventListener("mousedown", handleOutside);
    return () => document.removeEventListener("mousedown", handleOutside);
  }, [mobileOpen]);

  const navLinks = [
    ["/", t("الرئيسية")],
    ["/about", t("عن المنصة")],
    ["/contact", t("تواصل معنا")],
  ];

  const dashDest = userRole === "admin" ? "/admin" : userRole === "moderator" ? "/mod-resources" : "/dashboard";

  return (
    <>
      <nav style={{
        position: "fixed", top: 0, left: 0, width: "100%", zIndex: 200,
        background: scrolled ? "rgba(255,255,255,0.97)" : C.white,
        borderBottom: `1px solid ${scrolled ? C.border : "transparent"}`,
        backdropFilter: "blur(14px)", transition: "all .3s",
        boxShadow: scrolled ? "0 2px 20px rgba(0,0,0,0.07)" : "none"
      }}>
        <div style={{ maxWidth: 1140, margin: "0 auto", padding: "0 20px", display: "flex", alignItems: "center", justifyContent: "space-between", height: 66 }}>

          {/* Logo */}
          <div style={{ display: "flex", alignItems: "center", gap: 9, cursor: "pointer", flexShrink: 0 }} onClick={() => setPage("/")}>
            <div style={{ width: 36, height: 36, borderRadius: 9, background: settings.primary_color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", color: C.white, fontSize: "1.2rem", overflow: 'hidden', flexShrink: 0 }}>
              {settings.site_logo ? <img src={settings.site_logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" /> : <PiGraduationCapDuotone />}
            </div>
            <span style={{ fontWeight: 800, fontSize: "1.1rem", color: C.dark, whiteSpace: 'nowrap' }}>{settings.site_name || t("النخبة")}</span>
          </div>

          {/* ─── Desktop Nav Links ─── */}
          <div className="nav-links-desktop" style={{ display: "flex", gap: 28 }}>
            {navLinks.map(([p, l]) => (
              <span key={p} onClick={() => setPage(p)} style={{
                color: page === p ? C.blue : C.muted,
                fontSize: "0.9rem", fontWeight: page === p ? 700 : 400,
                cursor: "pointer", transition: "color .2s",
                borderBottom: page === p ? `2px solid ${C.blue}` : "2px solid transparent",
                paddingBottom: 2
              }}>{l}</span>
            ))}
          </div>

          {/* ─── Desktop Right Actions ─── */}
          <div className="nav-actions-desktop" style={{ display: "flex", gap: 10, alignItems: "center" }}>
            <button onClick={toggleLang} style={{ width: 36, height: 36, borderRadius: 9, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontSize: "0.85rem", fontWeight: 800, cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
              onMouseLeave={e => e.currentTarget.style.background = C.bg}>
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button onClick={toggleTheme} style={{ width: 36, height: 36, borderRadius: 9, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontSize: "1.2rem", cursor: "pointer", transition: "all .2s" }}
              onMouseEnter={e => e.currentTarget.style.background = C.blueLight}
              onMouseLeave={e => e.currentTarget.style.background = C.bg}>
              {isDark ? <PiSunDuotone /> : <PiMoonDuotone />}
            </button>
            {loggedIn ? (
              <>
                <Btn variant="ghost" onClick={() => setPage(dashDest)} style={{ fontSize: "0.85rem", padding: "8px 14px" }}>{t("لوحة التحكم")}</Btn>
                <div onClick={() => setPage(dashDest)} style={{ cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 10, padding: '4px 8px', borderRadius: 10 }}>
                   <div style={{ textAlign:'end', display:'flex', flexDirection:'column', gap:2 }}>
                      <div style={{ fontWeight:800, fontSize:"0.82rem", color:C.dark, lineHeight:1.1 }}>{user?.profile?.first_name} {user?.profile?.last_name}</div>
                      <div style={{ display:'flex', alignItems:'center', gap:6, justifyContent:'flex-end' }}>
                         <RankBadge points={user?.points?.balance || 0} compact />
                         {user?.active_subscription && (
                           <span style={{ 
                             fontSize:"0.65rem", 
                             color: user.active_subscription.plan?.color_hex || C.gold, 
                             background: `${user.active_subscription.plan?.color_hex || C.gold}15`,
                             padding: '0px 6px',
                             borderRadius: 50,
                             fontWeight: 800,
                             border: `1px solid ${user.active_subscription.plan?.color_hex || C.gold}30`
                           }}>
                             {user.active_subscription.plan?.name}
                           </span>
                         )}
                      </div>
                   </div>
                   <UserAvatar user={user} size={36} />
                </div>
                <span onClick={onLogout} style={{ color: C.red, fontSize: "0.85rem", cursor: "pointer", fontWeight: 600, whiteSpace: 'nowrap' }}>{t("خروج")}</span>
              </>
            ) : (
              <>
                <span onClick={() => setPage("/login")} style={{ color: C.dark, fontSize: "0.9rem", cursor: "pointer", whiteSpace: 'nowrap' }}>{t("تسجيل الدخول")}</span>
                <Btn onClick={() => setPage("/register")} style={{ whiteSpace: 'nowrap' }}>{t("إنشاء حساب")}</Btn>
              </>
            )}
          </div>

          {/* ─── Mobile: Theme + Lang + Hamburger ─── */}
          <div className="nav-mobile-actions" style={{ display: "none", gap: 8, alignItems: "center" }}>
            <button onClick={toggleLang} style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontSize: "0.75rem", fontWeight: 800, cursor: "pointer" }}>
              {lang === 'ar' ? 'EN' : 'عربي'}
            </button>
            <button onClick={toggleTheme} style={{ width: 32, height: 32, borderRadius: 8, background: C.bg, border: `1px solid ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontSize: "1.1rem", cursor: "pointer" }}>
              {isDark ? <PiSunDuotone /> : <PiMoonDuotone />}
            </button>
            <button onClick={() => setMobileOpen(v => !v)} style={{ width: 36, height: 36, borderRadius: 9, background: mobileOpen ? C.blueLight : C.bg, border: `1px solid ${mobileOpen ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", color: C.dark, fontSize: "1.3rem", cursor: "pointer", transition: "all .2s" }}>
              {mobileOpen ? <PiXDuotone /> : <PiListDuotone />}
            </button>
          </div>
        </div>

        {/* ─── Mobile Dropdown Menu ─── */}
        {mobileOpen && (
          <div ref={menuRef} style={{
            position: "absolute", top: "100%", left: 0, right: 0,
            background: C.white, borderBottom: `1px solid ${C.border}`,
            boxShadow: "0 8px 24px rgba(0,0,0,0.1)", zIndex: 199,
            padding: "12px 20px 20px", display: "flex", flexDirection: "column", gap: 4,
            animation: "slideDown 0.2s ease"
          }}>
            {navLinks.map(([p, l]) => (
              <div key={p} onClick={() => { setPage(p); setMobileOpen(false); }} style={{
                padding: "12px 16px", borderRadius: 10,
                color: page === p ? C.blue : C.body,
                background: page === p ? C.blueLight : "transparent",
                fontWeight: page === p ? 700 : 500, fontSize: "0.95rem",
                cursor: "pointer", transition: "all .15s"
              }}>{l}</div>
            ))}
            <div style={{ borderTop: `1px solid ${C.border}`, marginTop: 8, paddingTop: 12, display: "flex", flexDirection: "column", gap: 8 }}>
              {loggedIn ? (
                <>
                  <div onClick={() => { setPage(dashDest); setMobileOpen(false); }} style={{ padding: "12px 16px", borderRadius: 10, background: C.blueLight, color: C.blue, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", textAlign: "center" }}>
                    {t("لوحة التحكم")}
                  </div>
                  <div onClick={() => { onLogout(); setMobileOpen(false); }} style={{ padding: "12px 16px", borderRadius: 10, background: "#FFF5F5", color: C.red, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", textAlign: "center" }}>
                    {t("تسجيل الخروج")}
                  </div>
                </>
              ) : (
                <>
                  <div onClick={() => { setPage("/login"); setMobileOpen(false); }} style={{ padding: "12px 16px", borderRadius: 10, background: C.bg, color: C.dark, fontWeight: 600, fontSize: "0.95rem", cursor: "pointer", textAlign: "center", border: `1px solid ${C.border}` }}>
                    {t("تسجيل الدخول")}
                  </div>
                  <div onClick={() => { setPage("/register"); setMobileOpen(false); }} style={{ padding: "12px 16px", borderRadius: 10, background: C.blue, color: C.white, fontWeight: 700, fontSize: "0.95rem", cursor: "pointer", textAlign: "center" }}>
                    {t("إنشاء حساب مجاني")}
                  </div>
                </>
              )}
            </div>
          </div>
        )}
      </nav>

      <style>{`
        @keyframes slideDown {
          from { opacity: 0; transform: translateY(-8px); }
          to   { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 768px) {
          .nav-links-desktop { display: none !important; }
          .nav-actions-desktop { display: none !important; }
          .nav-mobile-actions { display: flex !important; }
        }
        @media (min-width: 769px) {
          .nav-mobile-actions { display: none !important; }
        }
      `}</style>
    </>
  );
}
