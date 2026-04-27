import React, { useState, useContext } from "react";
import { C } from "../tokens";
import {
  PiFolderOpenDuotone, PiFlagDuotone, PiClipboardTextDuotone,
  PiGearDuotone, PiGraduationCapDuotone, PiSignOutDuotone, PiUsersDuotone,
  PiListDuotone, PiXDuotone
} from "react-icons/pi";
import { SettingsContext } from "../SettingsContext";
import { UserContext } from "../UserContext";
import { LanguageContext } from "../LanguageContext";

export default function ModeratorLayout({ activeSub, setPage, onLogout: propsLogout, children }) {
  const { logout: contextLogout, user } = useContext(UserContext);
  const onLogout = propsLogout || contextLogout;
  const { settings } = useContext(SettingsContext);
  const { t, lang } = useContext(LanguageContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { id:"mod-resources",    icon:<PiFolderOpenDuotone size={18}/>,    label: t("إدارة الموارد") },
    { id:"mod-contributors", icon:<PiUsersDuotone size={18}/>,         label: t("إدارة المساهمين") },
    { id:"mod-reported",     icon:<PiFlagDuotone size={18}/>,          label: t("البلاغات") },
    { id:"mod-log",          icon:<PiClipboardTextDuotone size={18}/>, label: t("سجل الإجراءات") },
    { id:"mod-settings",     icon:<PiGearDuotone size={18}/>,          label: t("إعدادات النظام") },
  ];

  function SidebarContent() {
    return (
      <>
        <div style={{ padding:"0 16px 14px", borderBottom:`1px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ fontSize:"0.72rem", color:C.muted, fontWeight:700, letterSpacing:"0.06em" }}>{t("لوحة المشرف")}</div>
        </div>
        {menu.map(item => (
          <div key={item.id} onClick={() => { setPage("/" + item.id); setSidebarOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", margin:"2px 8px", borderRadius:10, cursor:"pointer", background: activeSub===item.id ? C.blueLight : "transparent", color: activeSub===item.id ? C.blue : C.body, fontWeight: activeSub===item.id ? 700 : 400, fontSize:"0.88rem", transition:"all .2s" }}
            onMouseEnter={e => { if(activeSub!==item.id) e.currentTarget.style.background=C.bg; }}
            onMouseLeave={e => { if(activeSub!==item.id) e.currentTarget.style.background="transparent"; }}>
            <span>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
          </div>
        ))}
        <div style={{ margin:"16px 8px 0", borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <div onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", borderRadius:10, cursor:"pointer", color:C.red, fontSize:"0.88rem" }}>
            <PiSignOutDuotone size={18}/><span style={{ fontWeight:600 }}>{t("تسجيل الخروج")}</span>
          </div>
        </div>
      </>
    );
  }

  const primaryColor = settings.primary_color || C.blue;

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* Maintenance Banner */}
      {settings.maintenance_mode === true && (
        <div style={{ background:C.orange, color:C.white, padding:"5px 20px", fontSize:"0.72rem", fontWeight:800, textAlign:'center' }}>
          ⚠️ {t("وضع الصيانة نشط حالياً - المنصة مغلقة للجمهور")}
        </div>
      )}

      {/* ─── Top Header ─── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background: primaryColor, height:60, display:"flex", alignItems:"center", paddingInline:"20px", gap:14, boxShadow:"0 2px 10px rgba(0,0,0,0.1)" }}>
        {/* Hamburger (mobile) */}
        <button className="mod-hamburger" onClick={() => setSidebarOpen(v => !v)} style={{
          display:"none", width:36, height:36, borderRadius:9, background:"rgba(255,255,255,0.18)",
          border:"none", alignItems:"center", justifyContent:"center", fontSize:"1.2rem",
          color:"#fff", cursor:"pointer", flexShrink:0
        }}>
          {sidebarOpen ? <PiXDuotone/> : <PiListDuotone/>}
        </button>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:9, background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontSize:"1.2rem", overflow:'hidden', flexShrink:0 }}>
            {settings.site_logo ? (
              <img src={settings.site_logo} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} alt="logo" />
            ) : (
              <img src="/logo192.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
            )}
          </div>
          <div className="mod-brand-text">
            <div style={{ color:"#fff", fontWeight:900, fontSize:"0.95rem", lineHeight:1 }}>{settings.site_name || t("النخبة")}</div>
            <div style={{ color:"rgba(255,255,255,0.6)", fontSize:"0.62rem", fontWeight:600, marginTop:3 }}>{settings.site_slogan || t("لوحة المشرف")}</div>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ marginInlineStart:"auto", display:"flex", alignItems:"center", gap:12 }}>
          <div style={{ width:32, height:32, borderRadius:"50%", background:"rgba(255,255,255,0.18)", display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"0.84rem", flexShrink:0 }}>
            {user?.profile?.first_name?.[0] || "م"}
          </div>
          <div className="mod-user-info">
            <div style={{ color:"#fff", fontWeight:700, fontSize:"0.82rem" }}>{user?.profile?.first_name} {user?.profile?.last_name}</div>
            <div style={{ color:"rgba(255,255,255,0.65)", fontSize:"0.7rem" }}>{t("مشرف المحتوى")}</div>
          </div>
          <div style={{ width:1, height:28, background:"rgba(255,255,255,0.2)", margin:"0 4px" }} />
          <span onClick={onLogout} style={{ color:"rgba(255,255,255,0.75)", display:"flex", alignItems:"center", gap:6, fontSize:"0.82rem", cursor:"pointer", fontWeight:600, whiteSpace:'nowrap' }}>
            <PiSignOutDuotone size={16}/> {t("خروج")}
          </span>
        </div>
      </div>

      {/* ─── Layout Body ─── */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 60px)", position:"relative" }}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="mod-overlay" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:148, backdropFilter:"blur(2px)" }} />
        )}

        {/* Sidebar */}
        <aside className="mod-sidebar" style={{ zIndex:149, width:220, background:C.white, borderInlineEnd:`1px solid ${C.border}`, padding:"20px 0", flexShrink:0, position:"sticky", top:60, height:"calc(100vh - 60px)", overflowY:"auto" }}>
          <SidebarContent />
        </aside>

        {/* Main */}
        <main style={{ flex:1, padding:"24px 28px", minWidth:0 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .mod-hamburger   { display: flex !important; }
          .mod-brand-text  { display: none !important; }
          .mod-user-info   { display: none !important; }
          .mod-sidebar {
            position: fixed !important;
            top: 60px !important;
            ${lang === 'ar' ? 'right: 0' : 'left: 0'};
            height: calc(100vh - 60px) !important;
            transform: translateX(${lang === 'ar' ? '100%' : '-100%'});
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
        }
        @media (max-width: 480px) {
          main { padding: 14px 12px !important; }
        }
        ${sidebarOpen ? `.mod-sidebar { transform: translateX(0) !important; box-shadow: 4px 0 24px rgba(0,0,0,0.15) !important; }` : ''}
      `}</style>
    </div>
  );
}
