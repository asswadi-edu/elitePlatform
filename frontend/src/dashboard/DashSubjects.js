import React, { useState, useContext } from 'react';`nimport { UserContext } from '../UserContext';
import { C } from '../tokens';
import { Btn, Badge, Card, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { PiBooksDuotone, PiCalendarDuotone, PiBookOpenDuotone } from 'react-icons/pi';
import { getApiUrl } from '../api';

export default function DashSubjects({ setPage, user: propUser }) {`n  const { user: ctxUser, userRole } = useContext(UserContext);`n  const user = propUser || ctxUser;
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  const [studiedSubjects, setStudiedSubjects] = useState([]);

  React.useEffect(() => {
    fetchEnrolled();
  }, []);

  const fetchEnrolled = async () => {
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/my-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setStudiedSubjects(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  if (loading && studiedSubjects.length === 0) return (
    <DashboardLayout activeSub="subjects" setPage={setPage} user={user}>
        <div style={{ marginBottom: 32 }}>
          <Skeleton width="180px" height="32px" margin="0 0 10px" />
          <Skeleton width="300px" height="18px" />
        </div>
        <div style={{ background: C.bg, borderRadius: 16, padding: 28, marginBottom: 40, border: `1px dashed ${C.border}` }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
            <Skeleton width="56px" height="56px" borderRadius="14px" />
            <div>
              <Skeleton width="150px" height="24px" margin="0 0 8px" />
              <Skeleton width="200px" height="16px" />
            </div>
          </div>
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 32 }}>
          {[1, 2].map(i => (
            <div key={i}>
              <Skeleton width="220px" height="24px" margin="0 0 16px" />
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
                {[1, 2, 3].map(j => (
                  <Card key={j} style={{ padding: 20 }}>
                    <Skeleton width="36px" height="36px" borderRadius="9px" margin="0 0 16px" />
                    <Skeleton width="120px" height="18px" margin="0 0 8px" />
                    <Skeleton width="60px" height="12px" />
                  </Card>
                ))}
              </div>
            </div>
          ))}
        </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeSub="subjects" setPage={setPage} user={user}>
      <div style={{ marginBottom:32 }}>
        <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("ظ…ظˆط§ط¯ظٹ ط§ظ„ط¯ط±ط§ط³ظٹط©")}</h1>
        <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("ط§ظ„ظ…ظˆط§ط¯ ط§ظ„طھظٹ ظ‚ظ…طھ ط¨ط¯ط±ط§ط³طھظ‡ط§ ظ…ط³ط¨ظ‚ط§ظ‹ ظ…ظ‚ط³ظ…ط© ط­ط³ط¨ ط§ظ„ظپطµظˆظ„ ط§ظ„ط¯ط±ط§ط³ظٹط©")}</p>
      </div>

      <div style={{ background:C.blueLight, borderRadius:16, padding:28, display:'flex', alignItems:'center', justifyContent:'space-between', border:`1px dashed ${C.blue}`, marginBottom:40 }}>
        <div style={{ display:'flex', alignItems:'center', gap:20 }}>
            <div style={{ width:56, height:56, borderRadius:14, background:C.blue, display:'flex', alignItems:'center', justifyContent:'center', color:C.white, boxShadow:`0 8px 16px ${C.blue}30` }}>
                <PiBooksDuotone size={28}/>
            </div>
            <div>
                <h4 style={{ margin:0, fontSize:'1.1rem', fontWeight:800, color:C.dark }}>{t("ظ…ظˆط§ط¯ ط§ظ„طھط±ظ… ط§ظ„ط­ط§ظ„ظٹ")}</h4>
                <p style={{ margin:'4px 0 0', color:C.muted, fontSize:'0.88rem' }}>{t("ط¥ط¶ط§ظپط© ط£ظˆ طھط¹ط¯ظٹظ„ ط§ظ„ظ…ظˆط§ط¯ ط§ظ„طھظٹ طھط¯ط±ط³ظ‡ط§ ظپظٹ ظ‡ط°ط§ ط§ظ„ظپطµظ„")}</p>
            </div>
        </div>
        <Btn onClick={() => setPage('dash-subjects-selection')} style={{ padding:'12px 28px' }}>{t("ط¥ط¶ط§ظپط© ظ…ظˆط§ط¯ ط§ظ„طھط±ظ… ط§ظ„ط­ط§ظ„ظٹ")}</Btn>
      </div>

      {studiedSubjects.length === 0 && !loading && (
        <Card style={{ padding:60, textAlign:'center', display:'flex', flexDirection:'column', alignItems:'center', gap:20, background:C.bg }}>
            <div style={{ width:80, height:80, borderRadius:'50%', background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}>
                <PiBooksDuotone size={40}/>
            </div>
            <div>
                <h2 style={{ fontSize:'1.3rem', fontWeight:800, color:C.dark, margin:'0 0 8px' }}>{t("ظ„ط§ ظٹظˆط¬ط¯ ظ…ظˆط§ط¯ ظ…ط³ط¬ظ„ط©")}</h2>
                <p style={{ color:C.muted, maxWidth:400, margin:'0 auto' }}>{t("ط£ظ†طھ ظ„ظ… طھظ‚ظ… ط¨ط¥ط¶ط§ظپط© ط£ظٹ ظ…ظˆط§ط¯ ظ„ظ‡ط°ط§ ط§ظ„ظپطµظ„ ط§ظ„ط¯ط±ط§ط³ظٹ ط¨ط¹ط¯. ظ‚ظ… ط¨ط¥ط¶ط§ظپط© ظ…ظˆط§ط¯ظƒ ط§ظ„ط¢ظ† ظ„ظ„ظˆطµظˆظ„ ط¥ظ„ظ‰ ط§ظ„ظ…طµط§ط¯ط± ظˆط§ظ„ظ…ط­ط§ط¶ط±ط§طھ.")}</p>
            </div>
            <Btn onClick={() => setPage('dash-subjects-selection')} style={{ padding:'12px 32px' }}>{t("ط¥ط¶ط§ظپط© ظ…ظˆط§ط¯ ط§ظ„طھط±ظ… ط§ظ„ط­ط§ظ„ظٹ")}</Btn>
        </Card>
      )}

      <div style={{ display:'flex', flexDirection:'column', gap:32, marginBottom:40 }}>
        {[...studiedSubjects].reverse().map((group, idx) => (
          <div key={idx}>
            <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:16 }}>
                <div style={{ width:32, height:32, borderRadius:8, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}>
                    <PiCalendarDuotone size={18}/>
                </div>
                <h3 style={{ fontSize:'1.05rem', fontWeight:700, color:C.dark, margin:0 }}>
                    {t("ط§ظ„ظ…ط³طھظˆظ‰")} {group.level} - {group.semester === 1 ? t("ط§ظ„طھط±ظ… ط§ظ„ط£ظˆظ„") : t("ط§ظ„طھط±ظ… ط§ظ„ط«ط§ظ†ظٹ")}
                </h3>
                <div style={{ flex:1, height:1, background:C.border, marginInlineStart:10 }}></div>
            </div>
            
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:18 }}>
              {group.subjects.map((sub, sIdx) => (
                <Card key={sIdx} style={{ padding:20, display:'flex', flexDirection:'column', gap:10 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start' }}>
                    <div style={{ width:36, height:36, borderRadius:9, background:C.bg, display:'flex', alignItems:'center', justifyContent:'center' }}>
                        <PiBookOpenDuotone size={18} color={C.muted}/>
                    </div>
                    <Badge color={C.green}>{t("ظ…ظƒطھظ…ظ„")}</Badge>
                  </div>
                  <div>
                    <div style={{ fontWeight:700, fontSize:'0.9rem', color:C.dark, marginBottom:4 }}>{sub.name}</div>
                    <div style={{ fontSize:'0.75rem', color:C.muted }}>{userRole === "admin" ? sub.code : ""}</div>
                  </div>
                  <Btn variant="ghost" style={{ fontSize:'0.75rem', padding:'6px 0' }} onClick={() => setPage('dash-subject-details', { subject: sub })}>{t("ط¹ط±ط¶ ط§ظ„ظ…طµط§ط¯ط± â†گ")}</Btn>
                </Card>
              ))}
            </div>
          </div>
        ))}
      </div>

    </DashboardLayout>
  );
}

