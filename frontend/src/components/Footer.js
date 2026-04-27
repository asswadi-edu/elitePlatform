import React, { useContext } from "react";
import { C } from "../tokens";
import { Divider } from "./Common";
import { LanguageContext } from "../LanguageContext";
import { SettingsContext } from "../SettingsContext";

export default function Footer({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);

  const quickLinks = [
    { label: t("الرئيسية"),       path: "/" },
    { label: t("عن المنصة"),      path: "/about" },
    { label: t("اختبار الميول"),  path: "/test-intro" },
    { label: t("تواصل معنا"),     path: "/contact" },
  ];

  const supportLinks = [
    { label: t("تواصل معنا"),         path: "/contact" },
    { label: t("الأسئلة الشائعة"),    path: "/" },
    { label: t("سياسة الخصوصية"),    path: "/" },
    { label: t("شروط الاستخدام"),     path: "/" },
  ];

  return (
    <footer style={{ background: C.footerBg, padding: "56px 20px 0" }}>
      <div style={{ maxWidth: 1140, margin: "0 auto" }}>
        <div className="footer-grid" style={{ display: "grid", gridTemplateColumns: "1.6fr 1fr 1fr 1fr", gap: 40, paddingBottom: 48 }}>

          {/* Brand column */}
          <div>
            <div style={{ display: "flex", alignItems: "center", gap: 8, marginBottom: 14 }}>
              <div style={{ width: 34, height: 34, borderRadius: 9, background: settings.primary_color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", overflow: 'hidden' }}>
                {settings.site_logo ? (
                  <img src={settings.site_logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                ) : (
                  <img src="/logo192.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <span style={{ fontWeight: 800, color: C.white, fontSize: "1.05rem" }}>{settings.site_name || t("النخبة")}</span>
            </div>
            <p style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.84rem", lineHeight: 1.85, marginBottom: 20 }}>
              {settings.site_slogan || t("منصة تعليمية متكاملة تهدف إلى مساعدة الطلاب في رحلتهم الدراسية.")}
            </p>
            <div style={{ display: "flex", gap: 8, flexWrap: "wrap" }}>
              {["in", "📷", "𝕏", "f"].map((s, i) => (
                <div key={i} style={{ width: 32, height: 32, borderRadius: 8, background: "rgba(255,255,255,0.09)", display: "flex", alignItems: "center", justifyContent: "center", color: "rgba(255,255,255,0.6)", fontSize: "0.75rem", cursor: "pointer", transition: "background .2s" }}
                  onMouseEnter={e => e.currentTarget.style.background = C.blue}
                  onMouseLeave={e => e.currentTarget.style.background = "rgba(255,255,255,0.09)"}>{s}</div>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: "0.92rem" }}>{t("روابط سريعة")}</h4>
            {quickLinks.map(({ label, path }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <span onClick={() => setPage(path)} style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.84rem", cursor: "pointer", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = C.white}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>{label}</span>
              </div>
            ))}
          </div>

          {/* Support Links */}
          <div>
            <h4 style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: "0.92rem" }}>{t("الدعم والمساعدة")}</h4>
            {supportLinks.map(({ label, path }) => (
              <div key={label} style={{ marginBottom: 10 }}>
                <span onClick={() => setPage(path)} style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.84rem", cursor: "pointer", transition: "color .2s" }}
                  onMouseEnter={e => e.target.style.color = C.white}
                  onMouseLeave={e => e.target.style.color = "rgba(255,255,255,0.5)"}>{label}</span>
              </div>
            ))}
          </div>

          {/* Contact Info */}
          <div>
            <h4 style={{ color: C.white, fontWeight: 700, marginBottom: 16, fontSize: "0.92rem" }}>{t("تواصل معنا")}</h4>
            {[["📍", t("صنعاء، اليمن")], ["✉️", "support@nukhba.edu.sa"], ["📞", "967+ 71 000 0000"]].map(([ic, txt]) => (
              <div key={txt} style={{ display: "flex", gap: 10, marginBottom: 12, alignItems: "flex-start" }}>
                <span style={{ fontSize: "0.84rem", marginTop: 2 }}>{ic}</span>
                <span style={{ color: "rgba(255,255,255,0.5)", fontSize: "0.82rem", lineHeight: 1.6 }}>{txt}</span>
              </div>
            ))}
          </div>
        </div>

        <Divider />
        <div style={{ textAlign: "center", padding: "18px 0" }}>
          <span style={{ color: "rgba(255,255,255,0.3)", fontSize: "0.8rem" }}>
            {t("© 2024")} {settings.site_name || t("منصة النخبة")}. {t("جميع الحقوق محفوظة.")}
          </span>
        </div>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .footer-grid { grid-template-columns: 1fr 1fr !important; gap: 28px !important; }
        }
        @media (max-width: 560px) {
          .footer-grid { grid-template-columns: 1fr !important; gap: 24px !important; }
          footer { padding: 36px 16px 0 !important; }
        }
      `}</style>
    </footer>
  );
}
