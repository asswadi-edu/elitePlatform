import React, { useContext, useState, useEffect } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { 
  PiUsersDuotone, PiCreditCardDuotone, PiFolderOpenDuotone, 
  PiChartBarDuotone, PiShieldCheckDuotone, PiTicketDuotone,
  PiLightbulbDuotone, PiFlagDuotone, PiBankDuotone, PiTrophyDuotone,
  PiGearDuotone, PiBellRingingDuotone
} from "react-icons/pi";
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminDashboard({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [toast, setToast] = useState(null);
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({
    stats: {
      users: { total: 0, delta: '+0%', trend: 'up' },
      subscriptions: { total: 0, delta: '+0%', trend: 'up' },
      resources: { total: 0, delta: '+0%', trend: 'up' },
      reports: { total: 0, delta: '-0%', trend: 'down' }
    },
    academic: { universities: 0, colleges: 0, majors: 0, subjects: 0 },
    social: { suggestions: 0, challenges: 0 },
    activity: [],
    recentUsers: []
  });

  useEffect(() => {
    fetchStats();
  }, []);

  const fetchStats = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/admin/dashboard-stats`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const json = await response.json();
        setData(json);
      }
    } catch (e) {
      console.error("Dashboard fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  function showToast(msg, color = C.green) { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }

  const kpis = [
    { id:"admin-users", label:t("إجمالي المستخدمين"), val:data.stats.users.total, icon: <PiUsersDuotone/>, color:C.blue, delta:data.stats.users.delta, trend:data.stats.users.trend },
    { id:"admin-subscriptions", label:t("الاشتراكات النشطة"), val:data.stats.subscriptions.total, icon: <PiCreditCardDuotone/>, color:C.green, delta:data.stats.subscriptions.delta, trend:data.stats.subscriptions.trend },
    { id:"admin-resources", label:t("الموارد المقبولة"), val:data.stats.resources.total, icon: <PiFolderOpenDuotone/>, color:C.orange, delta:data.stats.resources.delta, trend:data.stats.resources.trend },
    { id:"admin-reports", label:t("البلاغات المفتوحة"), val:data.stats.reports.total, icon: <PiFlagDuotone/>, color:C.red, delta:data.stats.reports.delta, trend:data.stats.reports.trend },
  ];

  const academicStats = [
    { label: t("الجامعات"), val: data.academic.universities, icon: <PiBankDuotone/>, id: "admin-academic" },
    { label: t("الكليات"), val: data.academic.colleges, icon: <PiBankDuotone/>, id: "admin-academic" },
    { label: t("التخصصات"), val: data.academic.majors, icon: <PiBankDuotone/>, id: "admin-academic" },
    { label: t("المواد الدراسية"), val: data.academic.subjects, icon: <PiBankDuotone/>, id: "admin-academic" },
  ];

  const socialStats = [
    { label: t("الاقتراحات الجديدة"), val: data.social.suggestions, icon: <PiLightbulbDuotone/>, col: C.gold, id: "admin-suggestions" },
    { label: t("تحديات نشطة"), val: data.social.challenges, icon: <PiTrophyDuotone/>, col: C.blue, id: "admin-challenges" },
  ];

  const getActivityIcon = (type) => {
    if (type === 'created') return <PiFolderOpenDuotone/>;
    if (type === 'deleted') return <PiFlagDuotone/>;
    if (type === 'approved') return <PiShieldCheckDuotone/>;
    if (type === 'login') return <PiUsersDuotone/>;
    return <PiGearDuotone/>;
  };

  const getActivityColor = (type) => {
    if (type === 'created') return C.blue;
    if (type === 'deleted') return C.red;
    if (type === 'approved') return C.green;
    return C.muted;
  };

  const points = "0,80 40,60 80,75 120,40 160,55 200,20 240,35 280,10 320,25 360,5";

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 1001, borderRight: `4px solid ${toast.color}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}

      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("لوحة الإحصائيات")}</h1>
          <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("نظرة شاملة وموحدة لكل جوانب المنصة الإدارية والأكاديمية")}</p>
        </div>
        <div style={{ display: 'flex', gap: 10 }}>
           <Btn variant="secondary" style={{ fontSize: '0.82rem' }} onClick={() => setPage("admin-reports")}>{t("تقارير الأسبوع")}</Btn>
           <Btn style={{ fontSize: '0.82rem', display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => showToast(t("تم تفعيل إشعارات النظام الفورية"))}>
             <PiBellRingingDuotone/> {t("تفعيل الإشعارات")}
           </Btn>
        </div>
      </div>

      <div className="admin-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {kpis.map((k, i) => (
          <Card key={i} onClick={() => setPage(k.id)} style={{ padding: "20px 22px", position: 'relative', cursor: 'pointer', transition: 'transform .2s' }} onMouseEnter={e => e.currentTarget.style.transform = 'translateY(-4px)'} onMouseLeave={e => e.currentTarget.style.transform = 'none'}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start" }}>
              <div>
                <div style={{ color: C.muted, fontSize: "0.76rem", marginBottom: 6, fontWeight: 600 }}>{k.label}</div>
                <div style={{ fontSize: "1.6rem", fontWeight: 900, color: C.dark }}>{k.val}</div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: k.trend === 'up' ? C.green : C.red, fontSize: "0.76rem", marginTop: 8, fontWeight: 700 }}>
                   {k.trend === 'up' ? '↑' : '↓'} {k.delta}
                </div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${k.color}12`, color: k.color, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem" }}>{k.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div className="admin-two-col" style={{ display: "grid", gridTemplateColumns: "2fr 1fr", gap: 24, marginBottom: 28 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card style={{ padding: 24 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <h3 style={{ fontWeight: 800, color: C.dark, margin: 0, fontSize: '0.94rem' }}>{t("نمو المستخدمين الجدد")}</h3>
              <Badge color={C.blue}>{t("في صعود مستمر")}</Badge>
            </div>
            <div style={{ height: 140, width: '100%', position: 'relative' }}>
               <svg viewBox="0 0 360 100" style={{ width: '100%', height: '100%', overflow: 'visible' }}>
                 <polyline points={points} fill="none" stroke={C.blue} strokeWidth="3" strokeLinecap="round" strokeLinejoin="round" />
               </svg>
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
            <h3 style={{ fontWeight: 800, color: C.dark, margin: "0 0 16px", fontSize: '0.94rem' }}>{t("النظام الأكاديمي")}</h3>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 12 }}>
              {academicStats.map(s => (
                <div key={s.label} onClick={() => setPage(s.id)} style={{ background: C.bg, padding: 14, borderRadius: 12, cursor: 'pointer', textAlign: 'center' }}>
                  <div style={{ color: C.blue, marginBottom: 6, fontSize: '1.2rem' }}>{s.icon}</div>
                  <div style={{ fontSize: '1.1rem', fontWeight: 900, color: C.dark }}>{s.val}</div>
                  <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>{s.label}</div>
                </div>
              ))}
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontWeight: 800, color: C.dark, margin: "0 0 20px", fontSize: '0.94rem' }}>{t("توزيع الموارد")}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              {[
                { label: t("ملفات PDF"), val: "65%", col: C.blue },
                { label: t("صور وفيديو"), val: "20%", col: C.orange },
                { label: t("روابط"), val: "15%", col: C.green },
              ].map(item => (
                <div key={item.label}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.78rem', marginBottom: 6 }}>
                    <span style={{ color: C.muted }}>{item.label}</span>
                    <span style={{ color: C.dark, fontWeight: 700 }}>{item.val}</span>
                  </div>
                  <div style={{ height: 6, background: C.bg, borderRadius: 10 }}>
                    <div style={{ height: '100%', width: item.val, background: item.col, borderRadius: 10 }}></div>
                  </div>
                </div>
              ))}
            </div>
          </Card>

          <Card style={{ padding: 20 }}>
             <h3 style={{ fontWeight: 800, color: C.dark, margin: "0 0 16px", fontSize: '0.94rem' }}>{t("التفاعل الاجتماعي")}</h3>
             <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
               {socialStats.map(s => (
                 <div key={s.label} onClick={() => setPage(s.id)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: 12, background: `${s.col}08`, borderRadius: 12, cursor: 'pointer', border: `1px solid ${s.col}15` }}>
                   <div style={{ color: s.col, fontSize: '1.2rem' }}>{s.icon}</div>
                   <div>
                     <div style={{ fontSize: '1rem', fontWeight: 900, color: C.dark }}>{s.val}</div>
                     <div style={{ fontSize: '0.7rem', color: C.muted }}>{s.label}</div>
                   </div>
                 </div>
               ))}
             </div>
          </Card>
        </div>
      </div>

      <div className="admin-two-col admin-recent-users-table" style={{ display: "grid", gridTemplateColumns: "1.4fr 1fr", gap: 24 }}>
         <Card style={{ padding: 0 }}>
            <div style={{ padding: "18px 22px", display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderBottom: `1px solid ${C.border}` }}>
              <h3 style={{ fontWeight: 800, color: C.dark, margin: 0, fontSize: '0.94rem' }}>{t("أحدث الأعضاء")}</h3>
              <Btn variant="ghost" style={{ fontSize: '0.76rem' }} onClick={() => setPage("admin-users")}>{t("عرض قائمة المستخدمين")}</Btn>
            </div>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.84rem" }}>
              <tbody>
                {data.recentUsers.map((u, i) => (
                  <tr key={i} onClick={() => setPage("admin-users")} style={{ borderBottom: i === data.recentUsers.length -1 ? 'none' : `1px solid ${C.border}`, cursor: 'pointer' }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = 'transparent'}>
                    <td style={{ padding: "14px 22px" }}><div style={{ fontWeight: 700, color: C.dark }}>{u.name}</div><div style={{ fontSize: '0.7rem', color: C.muted }}>{u.email}</div></td>
                    <td style={{ padding: "14px 22px" }}><Badge color={C.blue}>{u.role}</Badge></td>
                    <td style={{ padding: "14px 22px" }}><Badge color={u.status === 'active' ? C.green : C.red}>{u.status === 'active' ? t("نشط") : t("محظور")}</Badge></td>
                    <td style={{ padding: "14px 22px", color: C.muted, fontSize: '0.7rem' }}>{u.date}</td>
                  </tr>
                ))}
              </tbody>
            </table>
         </Card>

         <Card style={{ padding: 22 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 18 }}>
              <PiChartBarDuotone size={20} color={C.blue}/>
              <h3 style={{ fontWeight: 800, color: C.dark, margin: 0, fontSize: '0.94rem' }}>{t("النشاط المباشر")}</h3>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              {data.activity.map(item => (
                <div key={item.id} style={{ display: 'flex', gap: 12 }}>
                   <div style={{ width: 32, height: 32, borderRadius: 8, background: `${getActivityColor(item.type)}12`, color: getActivityColor(item.type), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.1rem', flexShrink: 0 }}>{getActivityIcon(item.type)}</div>
                   <div>
                      <div style={{ fontSize: '0.8rem', color: C.dark, lineHeight: 1.4 }}>
                        <span style={{ fontWeight: 800 }}>{item.user}</span> {t(item.action)} <span style={{ fontWeight: 700, color: getActivityColor(item.type) }}>{item.target}</span>
                      </div>
                      <div style={{ fontSize: '0.7rem', color: C.muted, marginTop: 2 }}>{item.time}</div>
                   </div>
                </div>
              ))}
            </div>
            <Btn variant="secondary" style={{ width: '100%', marginTop: 24, fontSize: '0.8rem' }} onClick={() => setPage("admin-activity")}>{t("عرض السجل بالكامل")}</Btn>
         </Card>
      </div>
    </>
  );
}
