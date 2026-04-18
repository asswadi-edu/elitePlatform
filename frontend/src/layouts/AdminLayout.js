import React, { useState, useContext } from "react";
import { C } from "../tokens";
import {
  PiChartBarDuotone, PiUsersDuotone, PiBankDuotone,
  PiFolderOpenDuotone, PiFlagDuotone,
  PiCreditCardDuotone, PiTicketDuotone, PiGearDuotone, PiTrophyDuotone,
  PiGraduationCapDuotone, PiLightbulbDuotone, PiMoonDuotone, PiSunDuotone,
  PiShieldCheckDuotone, PiCheckCircleDuotone, PiInfoDuotone,
  PiListDuotone, PiXDuotone, PiSignOutDuotone
} from "react-icons/pi";
import { ThemeContext } from "../ThemeContext";
import { LanguageContext } from "../LanguageContext";
import { SettingsContext } from "../SettingsContext";
import { UserContext } from "../UserContext";

export default function AdminLayout({ activeSub, setPage, onLogout: propsLogout, children }) {
  const { logout: contextLogout } = useContext(UserContext);
  const onLogout = propsLogout || contextLogout;
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { lang, toggleLang, t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const menu = [
    { id:"admin",               icon:<PiChartBarDuotone size={18}/>,       label: t("لوحة الإحصائيات") },
    { id:"admin-users",         icon:<PiUsersDuotone size={18}/>,          label: t("إدارة المستخدمين") },
    { id:"admin-academic",      icon:<PiBankDuotone size={18}/>,           label: t("الأقسام الأكاديمية") },
    { id:"admin-major-details", icon:<PiInfoDuotone size={18}/>,           label: t("نبذة التخصصات") },
    { id:"admin-resources",     icon:<PiFolderOpenDuotone size={18}/>,     label: t("إدارة الموارد") },
    { id:"admin-contributors",  icon:<PiUsersDuotone size={18}/>,          label: t("إدارة المساهمين") },
    { id:"admin-reports",       icon:<PiFlagDuotone size={18}/>,           label: t("إدارة البلاغات") },
    { id:"admin-aptitude",      icon:<PiCheckCircleDuotone size={18}/>,    label: t("اختبار الميول") },
    { id:"admin-suggestions",   icon:<PiLightbulbDuotone size={18}/>,      label: t("الاقتراحات") },
    { id:"admin-subscriptions", icon:<PiCreditCardDuotone size={18}/>,     label: t("الاشتراكات") },
    { id:"admin-cards",         icon:<PiTicketDuotone size={18}/>,         label: t("بطاقات الاشتراك") },
    { id:"admin-challenges",    icon:<PiTrophyDuotone size={18}/>,         label: t("التحديات والجوائز") },
    { id:"admin-ai",            icon:<PiShieldCheckDuotone size={18}/>,    label: t("إعدادات الذكاء الاصطناعي") },
    { id:"admin-activity",      icon:<PiChartBarDuotone size={18}/>,       label: t("سجل النشاطات") },
    { id:"admin-settings",      icon:<PiGearDuotone size={18}/>,           label: t("إعدادات النظام") },
  ];

  const academicSubIds = ["admin-academic","admin-universities","admin-fields","admin-faculties","admin-majors","admin-subjects","admin-major-details"];

  function SidebarContent() {
    return (
      <>
        {menu.map(item => {
          const isActive = activeSub === item.id || (item.id === "admin-academic" && academicSubIds.includes(activeSub));
          return (
            <div key={item.id} onClick={() => { setPage("/" + item.id); setSidebarOpen(false); }}
              style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", margin:"2px 8px", borderRadius:10, cursor:"pointer", background: isActive ? C.blueLight : "transparent", color: isActive ? C.blue : C.body, fontWeight: isActive ? 700 : 400, fontSize:"0.84rem", transition:"all .2s" }}
              onMouseEnter={e => { if (!isActive) e.currentTarget.style.background = C.bg; }}
              onMouseLeave={e => { if (!isActive) e.currentTarget.style.background = "transparent"; }}>
              <span style={{ flexShrink:0 }}>{item.icon}</span>
              <span style={{ flex:1, lineHeight:1.3 }}>{item.label}</span>
            </div>
          );
        })}
        <div style={{ margin:"12px 8px 0", borderTop:`1px solid rgba(255,255,255,0.1)`, paddingTop:10 }}>
          <div onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:10, padding:"10px 16px", borderRadius:10, cursor:"pointer", color:"#ff6b6b", fontSize:"0.84rem" }}>
            <PiSignOutDuotone size={18}/>
            <span style={{ fontWeight:600 }}>{t("تسجيل الخروج")}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>
      {/* Maintenance Banner */}
      {settings.maintenance_mode === true && (
        <div style={{ background:C.orange, color:C.white, padding:"5px 20px", fontSize:"0.72rem", fontWeight:800, textAlign:'center', letterSpacing:'0.03em' }}>
          ⚠️ {t("وضع الصيانة نشط حالياً - المنصة مغلقة للجمهور")}
        </div>
      )}

      {/* ─── Top Header ─── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:C.dark, height:60, display:"flex", alignItems:"center", paddingInline:"20px", gap:14 }}>
        {/* Hamburger (mobile) */}
        <button className="admin-hamburger" onClick={() => setSidebarOpen(v => !v)} style={{
          display:"none", width:36, height:36, borderRadius:9, background:"rgba(255,255,255,0.12)",
          border:"none", alignItems:"center", justifyContent:"center", fontSize:"1.2rem",
          color:C.white, cursor:"pointer", flexShrink:0
        }}>
          {sidebarOpen ? <PiXDuotone/> : <PiListDuotone/>}
        </button>

        {/* Logo */}
        <div style={{ display:"flex", alignItems:"center", gap:10, flexShrink:0 }}>
          <div style={{ width:36, height:36, borderRadius:9, background: settings.primary_color || C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:"1.2rem", overflow:'hidden', flexShrink:0 }}>
            {settings.site_logo ? <img src={settings.site_logo} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={e => e.target.style.display='none'} alt="logo" /> : null}
            <PiGraduationCapDuotone style={{ display: settings.site_logo ? 'none' : 'block' }} />
          </div>
          <div className="admin-brand-text" style={{ display:'flex', flexDirection:'column' }}>
            <span style={{ color:C.white, fontWeight:900, fontSize:"0.95rem", lineHeight:1 }}>{settings.site_name || t("النخبة")}</span>
            <span style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.62rem", fontWeight:600, marginTop:3 }}>{settings.site_slogan || t("لوحة التحكم")}</span>
          </div>
        </div>

        {/* Right actions */}
        <div style={{ marginInlineStart:"auto", display:"flex", gap:10, alignItems:"center" }}>
          <button onClick={toggleLang} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.1)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:"0.82rem", fontWeight:800, cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
            {lang === 'ar' ? 'EN' : 'عربي'}
          </button>
          <button onClick={toggleTheme} style={{ width:32, height:32, borderRadius:8, background:"rgba(255,255,255,0.1)", border:"none", display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:"1.1rem", cursor:"pointer" }}
            onMouseEnter={e => e.currentTarget.style.background="rgba(255,255,255,0.2)"}
            onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.1)"}>
            {isDark ? <PiSunDuotone/> : <PiMoonDuotone/>}
          </button>
          <span className="admin-role-text" style={{ color:"rgba(255,255,255,0.5)", fontSize:"0.8rem" }}>{t("مدير النظام")}</span>
          <div style={{ width:32, height:32, borderRadius:"50%", background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontWeight:800, fontSize:"0.78rem", flexShrink:0 }}>A</div>
          <span onClick={onLogout} style={{ color:"rgba(255,255,255,0.65)", fontSize:"0.8rem", cursor:"pointer", whiteSpace:'nowrap' }}>{t("خروج")}</span>
        </div>
      </div>

      {/* ─── Layout Body ─── */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 60px)", position:"relative" }}>
        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} className="admin-overlay" style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.45)", zIndex:148, backdropFilter:"blur(2px)" }} />
        )}

        {/* Sidebar */}
        <aside className="admin-sidebar" style={{ zIndex:149, width:220, background:C.white, borderInlineEnd:`1px solid ${C.border}`, padding:"16px 0", flexShrink:0, position:"sticky", top:60, height:"calc(100vh - 60px)", overflowY:"auto" }}>
          <SidebarContent />
        </aside>

        {/* Main */}
        <main style={{ flex:1, padding:"24px 28px", minWidth:0 }}>{children}</main>
      </div>

      <style>{`
        @media (max-width: 900px) {
          .admin-hamburger { display: flex !important; }
          .admin-brand-text { display: none !important; }
          .admin-role-text  { display: none !important; }
          .admin-sidebar {
            position: fixed !important;
            top: 60px !important;
            ${lang === 'ar' ? 'right: 0' : 'left: 0'};
            height: calc(100vh - 60px) !important;
            transform: translateX(${lang === 'ar' ? '100%' : '-100%'});
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
          }
        }
        @media (max-width: 480px) {
          .admin-sidebar main { padding: 14px 12px !important; }
        }
        ${sidebarOpen ? `.admin-sidebar { transform: translateX(0) !important; box-shadow: 4px 0 24px rgba(0,0,0,0.15) !important; }` : ''}
      `}</style>
    </div>
  );
}
