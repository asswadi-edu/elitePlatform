import React, { useContext, useState, useEffect } from 'react';
import { C } from '../tokens';
import { Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiCheckCircleDuotone, PiThumbsUpDuotone, PiXCircleDuotone, PiCreditCardDuotone, PiInfoDuotone, PiBellRingingDuotone } from "react-icons/pi";
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function DashNotifications({ setPage }) {
  const { t, lang } = useContext(LanguageContext);
  const [notifs, setNotifs] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchNotifs();
  }, []);

  async function fetchNotifs() {
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${getApiUrl()}/api/notifications`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setNotifs(data);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  }

  const getIcon = (type) => {
    switch(type) {
      case 'resource_approved': return { icon: <PiCheckCircleDuotone/>, color: C.green };
      case 'resource_rejected': return { icon: <PiXCircleDuotone/>, color: C.red };
      case 'resource_deleted':  return { icon: <PiXCircleDuotone/>, color: C.red };
      case 'points_earned':    return { icon: <PiThumbsUpDuotone/>, color: C.blue };
      case 'subscription':     return { icon: <PiCreditCardDuotone/>, color: C.gold };
      case 'admin_message':    return { icon: <PiBellRingingDuotone/>, color: C.orange };
      default:                 return { icon: <PiInfoDuotone/>, color: C.muted };
    }
  };

  async function markRead(uuid) {
    try {
      const token = localStorage.getItem('elite_token');
      await fetch(`${getApiUrl()}/api/notifications/${uuid}/read`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      setNotifs(prev => prev.map(n => n.uuid === uuid ? { ...n, read_at: new Date().toISOString() } : n));
    } catch (e) {}
  }

  return (
    <DashboardLayout activeSub="notifications" setPage={setPage}>
      <div style={{ marginBottom:28, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("الإشعارات")}</h1>
          <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("آخر التنبيهات والإشعارات")}</p>
        </div>
        {notifs.some(n => !n.read_at) && (
          <span 
            onClick={async () => {
              const token = localStorage.getItem('elite_token');
              await fetch(`${getApiUrl()}/api/notifications/mark-all-read`, {
                method: 'POST',
                headers: { 'Authorization': `Bearer ${token}` }
              });
              setNotifs(prev => prev.map(n => ({ ...n, read_at: new Date().toISOString() })));
            }} 
            style={{ fontSize: '0.8rem', color: C.blue, cursor: 'pointer', fontWeight: 600 }}
          >
            {t("تحديد الكل كمقروء")}
          </span>
        )}
      </div>

      <div style={{ maxWidth:640, display:'flex', flexDirection:'column', gap:12 }}>
        {loading ? (
            <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>{t("جاري التحميل...")}</div>
        ) : notifs.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: C.muted }}>{t("لا توجد إشعارات حالياً")}</div>
        ) : notifs.map((n) => {
          const { icon, color } = getIcon(n.type);
          const isRead = !!n.read_at;
          const msg = n.data?.message || t("إشعار جديد");
          const title = n.data?.title;
          
          return (
            <Card 
              key={n.uuid} 
              onClick={() => !isRead && markRead(n.uuid)}
              style={{ 
                padding:'16px 20px', 
                display:'flex', 
                gap:14, 
                alignItems:'flex-start', 
                opacity: isRead ? 0.65 : 1, 
                border: isRead ? `1px solid ${C.border}` : `1px solid ${color}25`, 
                background: isRead ? C.bg : color+'08',
                cursor: isRead ? 'default' : 'pointer'
              }}
            >
              <div style={{ width:40, height:40, borderRadius:'50%', background:color+'15', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem', color:color, flexShrink:0 }}>{icon}</div>
              <div style={{ flex:1 }}>
                {title && <div style={{ fontWeight: 800, fontSize: '0.75rem', color: color, marginBottom: 2 }}>{title}</div>}
                <div style={{ color:C.dark, fontSize:'0.88rem', fontWeight: isRead ? 400 : 600, marginBottom:4 }}>{msg}</div>
                <div style={{ color:C.muted, fontSize:'0.76rem' }}>
                  {new Date(n.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day:'numeric', month:'short' })}، {new Date(n.created_at).toLocaleTimeString(lang === 'ar' ? 'ar-EG' : 'en-US', { hour:'2-digit', minute:'2-digit' })}
                </div>
              </div>
              {!isRead && <div style={{ width:8, height:8, borderRadius:'50%', background:color, flexShrink:0, marginTop:6 }} />}
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
