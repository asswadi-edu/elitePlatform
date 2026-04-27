import React, { useState, useRef, useEffect, useContext } from "react";
import { C, inputStyle } from "../tokens";
import { Btn } from "../components/Common";
import {
  PiCheckCircleDuotone, PiThumbsUpDuotone, PiXCircleDuotone,
  PiChartBarDuotone, PiBookOpenDuotone, PiNotePencilDuotone,
  PiFolderOpenDuotone, PiGearDuotone, PiTicketDuotone,
  PiMagnifyingGlassDuotone, PiBellDuotone, PiGraduationCapDuotone, PiSignOutDuotone,
  PiLightningDuotone, PiMoonDuotone, PiSunDuotone, PiChatCenteredTextDuotone,
  PiListDuotone, PiXDuotone
} from "react-icons/pi";
import { ThemeContext } from "../ThemeContext";
import { LanguageContext } from "../LanguageContext";
import { getRank, RankBadge } from "../dashboard/ranking";
import { PiSealCheckFill, PiCrownDuotone } from "react-icons/pi";
import { SettingsContext } from "../SettingsContext";
import { UserContext } from "../UserContext";
import { getApiUrl } from "../api";
import UserAvatar from "../components/UserAvatar";

export default function DashboardLayout({ activeSub, setPage, children, isUniversity: propIsUniversity, onLogout: propsLogout }) {
  const { user, isUniversity: contextIsUniversity, logout: contextLogout, isSubscribed } = useContext(UserContext);
  const isUniversity = propIsUniversity !== undefined ? propIsUniversity : contextIsUniversity;
  const onLogout = propsLogout || contextLogout;
  const { isDark, toggleTheme } = useContext(ThemeContext);
  const { lang, toggleLang, t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const [showNotifs, setShowNotifs] = useState(false);
  const [notifs, setNotifs] = useState([]);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeSubData, setActiveSubData] = useState(user?.active_subscription);
  const notifRef = useRef(null);

  useEffect(() => { setActiveSubData(user?.active_subscription); }, [user]);

  useEffect(() => {
    fetchNotifs();
    const interval = setInterval(fetchNotifs, 60000);
    return () => clearInterval(interval);
  }, []);

  async function fetchNotifs() {
    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      if (!token) return;
      const res = await fetch(`${apiUrl}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) { const data = await res.json(); setNotifs(data); }
    } catch (e) { console.error(e); }
  }

  async function markRead(uuid) {
    try {
      const token = localStorage.getItem('elite_token');
      await fetch(`${getApiUrl()}/api/notifications/${uuid}/read`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifs(prev => prev.map(n => n.uuid === uuid ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (e) {}
  }

  async function markAllRead() {
    try {
      const token = localStorage.getItem('elite_token');
      await fetch(`${getApiUrl()}/api/notifications/mark-all-read`, {
        method: 'POST', headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
    } catch (e) {}
  }

  const unreadCount = notifs.filter(n => !n.read_at).length;

  const getIcon = (type) => {
    switch(type) {
      case 'resource_approved': return { icon: <PiCheckCircleDuotone/>, color: C.green };
      case 'resource_rejected': return { icon: <PiXCircleDuotone/>, color: C.red };
      case 'points_earned':    return { icon: <PiThumbsUpDuotone/>, color: C.blue };
      case 'subscription':     return { icon: <PiTicketDuotone/>, color: C.gold };
      case 'admin_message':    return { icon: <PiBellDuotone/>, color: C.orange };
      default:                 return { icon: <PiBellDuotone/>, color: C.muted };
    }
  };

  useEffect(() => {
    function handleClickOutside(event) {
      if (notifRef.current && !notifRef.current.contains(event.target)) setShowNotifs(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Close sidebar on route change
  useEffect(() => { setSidebarOpen(false); }, [activeSub]);

  const fullMenu = [
    { id:"dashboard", icon: <PiChartBarDuotone size={20} />, label: t("لوحة التحكم") },
    { id:"majors",    icon: <PiGraduationCapDuotone size={20} />, label: t("التخصصات") },
    { id:"subjects",  icon: <PiBookOpenDuotone size={20} />, label: t("موادي"), academic: true },
    { id:"quizzes",   icon: <PiNotePencilDuotone size={20} />, label: t("اختباراتي"), academic: true },
    { id:"challenges",icon: <PiLightningDuotone size={20} />, label: t("التحديات"), academic: true },
    { id:"resources", icon: <PiFolderOpenDuotone size={20} />, label: t("مواردي"), academic: true },
    { id:"suggestions", icon: <PiChatCenteredTextDuotone size={20} />, label: t("اقتراحاتي") },
    { id:"settings",  icon: <PiGearDuotone size={20} />, label: t("إعدادات الحساب") },
    { id:"activate",  icon: <PiTicketDuotone size={20} />, label: t("تفعيل الاشتراك"), academic: true },
  ];

  const canAccessAcademic = isUniversity || isSubscribed || user?.roles?.some(r => r.name === 'subscriber');
  const menu = canAccessAcademic ? fullMenu : fullMenu.filter(item => !item.academic);

  /* ─── Sidebar Content (shared desktop + mobile) ─── */
  function SidebarContent() {
    return (
      <>
        <div style={{ padding:"0 16px 16px", borderBottom:`1px solid ${C.border}`, marginBottom:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10 }}>
            <div style={{ width:40, height:40, borderRadius:10, background: settings.primary_color || C.blue, display:"flex", alignItems:"center", justifyContent:"center", color:C.white, fontSize:"1.3rem", overflow:'hidden', flexShrink:0 }}>
              {settings.site_logo ? (
                <img src={settings.site_logo} style={{ width:'100%', height:'100%', objectFit:'cover' }} onError={(e) => {e.target.style.display='none';}} alt="logo" />
              ) : (
                <img src="/logo192.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
              )}
            </div>
            <div style={{ display:'flex', flexDirection:'column', overflow:'hidden' }}>
              <span style={{ fontWeight:900, color:C.dark, fontSize:'0.95rem', whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis' }}>{settings.site_name || t("النخبة")}</span>
              <span style={{ fontSize:'0.65rem', color:C.muted, fontWeight:600, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', marginTop:2 }}>{settings.site_slogan}</span>
            </div>
          </div>
        </div>
        {menu.map(item => (
          <div key={item.id} onClick={() => { setPage(item.id==="dashboard" ? "/dashboard" : `/dash-${item.id}`); setSidebarOpen(false); }}
            style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", margin:"2px 8px", borderRadius:10, cursor:"pointer", background: activeSub===item.id ? (item.id==="activate"?C.goldBg:C.blueLight) : "transparent", color: activeSub===item.id ? (item.id==="activate"?C.gold:C.blue) : C.body, fontWeight: activeSub===item.id ? 700 : 400, fontSize:"0.88rem", transition:"all .2s" }}
            onMouseEnter={e => { if (activeSub!==item.id) e.currentTarget.style.background = C.bg; }}
            onMouseLeave={e => { if (activeSub!==item.id) e.currentTarget.style.background = "transparent"; }}>
            <span>{item.icon}</span>
            <span style={{ flex:1 }}>{item.label}</span>
            {item.badge && <span style={{ background:C.red, color:C.white, borderRadius:10, padding:"1px 7px", fontSize:"0.7rem" }}>{item.badge}</span>}
          </div>
        ))}
        <div style={{ margin:"16px 8px 0", borderTop:`1px solid ${C.border}`, paddingTop:12 }}>
          <div onClick={onLogout} style={{ display:"flex", alignItems:"center", gap:12, padding:"11px 18px", borderRadius:10, cursor:"pointer", color:C.red, fontSize:"0.88rem" }}>
            <span style={{ fontSize:"1.1rem", display:"flex" }}><PiSignOutDuotone /></span>
            <span style={{ fontWeight:600 }}>{t("تسجيل الخروج")}</span>
          </div>
        </div>
      </>
    );
  }

  return (
    <div style={{ minHeight:"100vh", background:C.bg }}>

      {/* ─── Top Header ─── */}
      <div style={{ position:"sticky", top:0, zIndex:100, background:C.white, borderBottom:`1px solid ${C.border}`, height:60, display:"flex", alignItems:"center", paddingInlineEnd:20, paddingInlineStart:20, gap:12, boxShadow:"0 1px 8px rgba(0,0,0,0.05)" }}>

        {/* Hamburger (mobile only) */}
        <button className="dash-hamburger" onClick={() => setSidebarOpen(v => !v)} style={{
          display:"none", width:38, height:38, borderRadius:10, background:C.bg, border:`1px solid ${C.border}`,
          alignItems:"center", justifyContent:"center", fontSize:"1.3rem", color:C.dark, cursor:"pointer", flexShrink:0
        }}>
          {sidebarOpen ? <PiXDuotone/> : <PiListDuotone/>}
        </button>

        {/* Search */}
        <div style={{ flex:1, maxWidth:380, position:"relative" }}>
          <input placeholder={t("ابحث في المنصة...")} style={{ ...inputStyle, paddingInlineEnd:38, height:38, fontSize:"0.86rem", borderRadius:9, width:'100%' }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border} />
          <span style={{ position:"absolute", right:12, top:"50%", transform:"translateY(-50%)", color:C.muted, fontSize:"1.1rem" }}><PiMagnifyingGlassDuotone /></span>
        </div>

        {/* Right controls */}
        <div style={{ display:"flex", alignItems:"center", gap:10, marginInlineStart:"auto" }}>
          <button onClick={toggleLang} style={{ width:36, height:36, borderRadius:10, background: C.bg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.dark, fontSize:"0.85rem", fontWeight:800, cursor:"pointer", transition:"all .2s" }}>{lang === 'ar' ? 'EN' : 'عربي'}</button>
          <button onClick={toggleTheme} style={{ width:36, height:36, borderRadius:10, background: C.bg, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.dark, fontSize:"1.2rem", cursor:"pointer", transition:"all .2s" }}>
            {isDark ? <PiSunDuotone/> : <PiMoonDuotone/>}
          </button>

          {/* Notifications */}
          <div style={{ position:"relative" }} ref={notifRef}>
            <div style={{ cursor:"pointer", width:36, height:36, borderRadius:10, background: showNotifs ? C.blueLight : C.bg, border:`1px solid ${showNotifs ? C.blue : C.border}`, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", color:C.dark, transition:"all .2s" }} onClick={() => setShowNotifs(!showNotifs)}><PiBellDuotone /></div>
            {unreadCount > 0 && <div style={{ position:"absolute", top:-3, right:-3, width:16, height:16, borderRadius:"50%", background:C.red, color:C.white, fontSize:"0.65rem", fontWeight:700, display:"flex", alignItems:"center", justifyContent:"center" }}>{unreadCount}</div>}
            {showNotifs && (
              <div className="notif-dropdown" style={{ 
                position:"absolute", 
                top:50, 
                [lang === 'ar' ? 'right' : 'left']: 0, 
                width:300, 
                maxWidth:"calc(100vw - 40px)", 
                background:C.white, 
                border:`1px solid ${C.border}`, 
                borderRadius:16, 
                boxShadow:"0 20px 40px rgba(0,0,0,0.15)", 
                zIndex:1000, 
                overflow:"hidden",
                animation: "slideIn01 0.3s ease-out"
              }}>
                <div style={{ padding:"16px 20px", borderBottom:`1px solid ${C.border}`, display:"flex", justifyContent:"space-between", alignItems:"center", background:C.bg }}>
                  <span style={{ fontWeight:900, color:C.dark, fontSize:"1rem" }}>{t("الإشعارات")}</span>
                  {unreadCount > 0 && <span onClick={markAllRead} style={{ fontSize:"0.78rem", color:C.blue, cursor:"pointer", fontWeight:700 }}>{t("تحديد الكل كمقروء")}</span>}
                </div>
                <div style={{ maxHeight:400, overflowY:"auto" }}>
                  {notifs.length === 0 ? (
                    <div style={{ padding:40, textAlign:'center', color:C.muted, fontSize:'0.9rem', display:'flex', flexDirection:'column', gap:10 }}>
                       <PiBellDuotone style={{ fontSize:'2.5rem', margin:'0 auto', opacity:0.3 }} />
                       {t("لا توجد إشعارات")}
                    </div>
                  ) : notifs.slice(0,8).map((n) => {
                    const { icon, color } = getIcon(n.type);
                    const isRead = !!n.read_at;
                    const d = new Date(n.created_at);
                    const timeStr = d.toLocaleTimeString(lang==='ar'?'ar-EG':'en-US',{hour:'2-digit',minute:'2-digit'});
                    const dateStr = d.toLocaleDateString(lang==='ar'?'ar-EG':'en-US',{day:'numeric',month:'short'});
                    return (
                      <div key={n.uuid} onClick={() => !isRead && markRead(n.uuid)}
                        style={{ 
                          padding:"14px 18px", 
                          display:"flex", 
                          gap:12, 
                          alignItems:"flex-start", 
                          borderBottom:`1px solid ${C.border}`, 
                          background: isRead ? C.white : `color-mix(in srgb, ${C.blueLight} 15%, transparent)`, 
                          cursor: isRead ? "default" : "pointer",
                          transition: "background 0.2s"
                        }}
                        onMouseEnter={e => !isRead && (e.currentTarget.style.background = `color-mix(in srgb, ${C.blueLight} 25%, transparent)`)}
                        onMouseLeave={e => !isRead && (e.currentTarget.style.background = `color-mix(in srgb, ${C.blueLight} 15%, transparent)`)}>
                        <div style={{ width:36, height:36, borderRadius:10, background:color+"15", display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.2rem", flexShrink:0, color }}>{icon}</div>
                        <div style={{ flex:1 }}>
                          {n.data?.title && <div style={{ fontWeight:900, fontSize:'0.75rem', color, marginBottom:3 }}>{n.data.title}</div>}
                          <div style={{ color:C.dark, fontSize:"0.86rem", fontWeight: isRead?500:800, marginBottom:4, lineHeight:1.5 }}>{n.data?.message}</div>
                          <div style={{ color:C.muted, fontSize:'0.72rem', fontWeight:600 }}>{dateStr} • {timeStr}</div>
                        </div>
                        {!isRead && <div style={{ width:10, height:10, borderRadius:"50%", background:C.blue, flexShrink:0, marginTop:6, boxShadow:`0 0 10px ${C.blue}40` }} />}
                      </div>
                    );
                  })}
                  <div style={{ padding:"14px", textAlign:"center", cursor:"pointer", color:C.blue, fontSize:"0.86rem", fontWeight:800, borderTop:`1px solid ${C.border}`, background:C.bg }}
                    onClick={() => { setPage("/dash-notifications"); setShowNotifs(false); }}>{t("عرض جميع الإشعارات")}</div>
                </div>
              </div>
            )}
          </div>

          {/* Avatar & User Info */}
          <div className="dash-avatar" style={{ display:"flex", alignItems:"center", gap:10, cursor:"pointer", padding:"6px 10px", borderRadius:12, transition:'all .2s' }}
            onMouseEnter={e => e.currentTarget.style.background = C.bg}
            onMouseLeave={e => e.currentTarget.style.background = 'transparent'}
            onClick={() => setPage("/dash-settings")}>
            <UserAvatar user={user} size={38} />
            <div className="dash-avatar-info" style={{ textAlign:"start", display:'flex', flexDirection:'column', gap:2 }}>
              <div style={{ fontWeight:800, fontSize:"0.88rem", color:C.dark, lineHeight:1.2 }}>
                {user?.profile?.first_name} {user?.profile?.last_name}
              </div>
              <div style={{ display:'flex', alignItems:'center', gap:6, flexWrap:'wrap' }}>
                <RankBadge points={user?.points?.balance || 0} compact />
                {user?.active_subscription && (
                  <span style={{ 
                    fontSize:"0.68rem", 
                    color: user.active_subscription.plan?.color_hex || C.gold,
                    background: `${user.active_subscription.plan?.color_hex || C.gold}15`,
                    padding: '1px 8px',
                    borderRadius: 50,
                    fontWeight: 800,
                    border: `1px solid ${user.active_subscription.plan?.color_hex || C.gold}30`
                  }}>
                    {user.active_subscription.plan?.name || t("باقة النخبة")}
                  </span>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* ─── Layout Body ─── */}
      <div style={{ display:"flex", minHeight:"calc(100vh - 60px)", position:"relative" }}>

        {/* Mobile Overlay */}
        {sidebarOpen && (
          <div onClick={() => setSidebarOpen(false)} style={{ display:"none", position:"fixed", inset:0, background:"rgba(0,0,0,0.4)", zIndex:148, backdropFilter:"blur(2px)" }} className="dash-overlay" />
        )}

        {/* Sidebar */}
        <aside className="dash-sidebar" style={{ zIndex:149, width:220, background:C.white, borderInlineEnd:`1px solid ${C.border}`, padding:"20px 0", flexShrink:0, position:"sticky", top:60, height:"calc(100vh - 60px)", overflowY:"auto" }}>
          <SidebarContent />
        </aside>

        {/* Main Content */}
        <main style={{ flex:1, padding:"28px 24px", minWidth:0 }}>{children}</main>
      </div>

      <style>{`
        @keyframes slideIn01 {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        @media (max-width: 900px) {
          .dash-hamburger { display: flex !important; }
          .dash-sidebar {
            position: fixed !important;
            top: 60px !important;
            ${lang === 'ar' ? 'right' : 'left'}: 0px;
            height: calc(100vh - 60px) !important;
            transform: translateX(${lang === 'ar' ? '100%' : '-100%'});
            transition: transform 0.28s cubic-bezier(0.4,0,0.2,1);
            box-shadow: none;
          }
          .dash-overlay { display: block !important; }
          .dash-avatar-info { display: none; }
          .notif-dropdown {
             position: fixed !important;
             top: 60px !important;
             left: 10px !important;
             right: 10px !important;
             width: auto !important;
             max-width: none !important;
             border-radius: 20px !important;
          }
        }
        @media (max-width: 480px) {
          main { padding: 16px 14px !important; }
        }
      `}</style>

      {/* Sidebar open state injected via inline style override */}
      {sidebarOpen && (
        <style>{`
          .dash-sidebar {
            transform: translateX(0) !important;
            box-shadow: ${lang === 'ar' ? '-4px' : '4px'} 0 20px rgba(0,0,0,0.12) !important;
          }
        `}</style>
      )}
    </div>
  );
}
