import React, { useState, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Field, Skeleton, Pagination } from '../components/Common';
import { PiUsersDuotone, PiStarDuotone, PiSealCheckDuotone, PiSealWarningDuotone, PiGearDuotone, PiArrowUpRightDuotone, PiMinusCircleDuotone, PiPlusCircleDuotone, PiThumbsDownDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function ModContributors({ setPage, isAdmin = false }) {
  const { t } = useContext(LanguageContext);
  const [pointLimit, setPointLimit] = useState(500);
  const [dislikeLimit, setDislikeLimit] = useState(5);
  const [students, setStudents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  React.useEffect(() => {
    fetchStudents(1);
  }, []);

  async function fetchStudents(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/users?page=${page}&role=student`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setStudents(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function showToast(msg, color) { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); }

  async function toggleTrust(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/users/${id}/toggle-trust`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      showToast(data.is_trusted ? t("تم منح الثقة للطالب") : t("تم سحب الثقة"), data.is_trusted ? C.green : C.red);
      fetchStudents(meta.current_page);
    } catch (err) { showToast(t("فشل الإجراء"), C.red); }
  }

  return (
    <React.Fragment>
      {toast && <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 999, borderRight: `4px solid ${toast.color}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إدارة الطلاب المساهمين")}</h1>
          <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("إدارة نظام الثقة والموافقة التلقائية للمساهمين")}</p>
        </div>
        
        <Card style={{ padding: "12px 20px", display: "flex", gap:24, background: C.blueLight, border: `1px solid ${C.blue}20` }}>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:'0.72rem', fontWeight:800, color:C.blue, textTransform:'uppercase' }}>{t("حد النقاط (Auto-Trust)")}</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" value={pointLimit} onChange={e=>setPointLimit(e.target.value)} style={{ width:70, border:'none', background:'transparent', fontWeight:800, color:C.dark, fontSize:'1.1rem' }} />
              <PiStarDuotone color={C.blue}/>
            </div>
          </div>
          <div style={{ width:1, background:`${C.blue}20` }}></div>
          <div style={{ display:'flex', flexDirection:'column', gap:4 }}>
            <label style={{ fontSize:'0.72rem', fontWeight:800, color:C.red, textTransform:'uppercase' }}>{t("حد الديسلايك (Revoke)")}</label>
            <div style={{ display:'flex', alignItems:'center', gap:8 }}>
              <input type="number" value={dislikeLimit} onChange={e=>setDislikeLimit(e.target.value)} style={{ width:50, border:'none', background:'transparent', fontWeight:800, color:C.dark, fontSize:'1.1rem' }} />
              <PiThumbsDownDuotone color={C.red}/>
            </div>
          </div>
        </Card>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", gap: 20 }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <Card key={i} style={{ padding: "24px" }}>
              <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                <Skeleton width="52px" height="52px" borderRadius="14px" />
                <div>
                  <Skeleton width="140px" height="18px" margin="0 0 8px" />
                  <Skeleton width="80px" height="24px" borderRadius="12px" />
                </div>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                {[1,2,3].map(j => (
                  <div key={j} style={{ textAlign: 'center', padding: '10px', background: C.bg, borderRadius: 12 }}>
                    <Skeleton width="30px" height="12px" margin="0 auto 4px" />
                    <Skeleton width="40px" height="16px" margin="0 auto" />
                  </div>
                ))}
              </div>
              <div style={{ display: 'flex', gap: 10 }}>
                <Skeleton width="100%" height="40px" borderRadius="8px" />
                <Skeleton width="44px" height="40px" borderRadius="8px" />
              </div>
            </Card>
          ))
        ) : students.length === 0 ? (
           <Card style={{ gridColumn:"1/-1", textAlign:"center", padding:"60px 40px" }}>
            <div style={{ color:C.muted, marginBottom:12, display:'flex', justifyContent:'center' }}><PiUsersDuotone size={48}/></div>
            <div style={{ fontWeight:700, color:C.dark }}>{t("لا يوجد طلاب مساهمون حالياً")}</div>
          </Card>
        ) : (
          students.map(s => {
            const isAutoTrusted = s.points >= pointLimit && !s.is_trusted;
            const needsRevoke = s.dislikes >= dislikeLimit && s.is_trusted;
            
            return (
              <Card key={s.id} style={{ padding: "24px", position:'relative', overflow:'hidden' }}>
                {isAutoTrusted && <div style={{ position:'absolute', top:0, right:0, background:C.green, color:C.white, padding:'4px 12px', fontSize:'0.65rem', fontWeight:800, borderRadius:'0 0 0 12px' }}>{t("مؤهل للثقة التلقائية")}</div>}
                {needsRevoke && <div style={{ position:'absolute', top:0, right:0, background:C.red, color:C.white, padding:'4px 12px', fontSize:'0.65rem', fontWeight:800, borderRadius:'0 0 0 12px' }}>{t("تجاوز حد الديسلايك")}</div>}
  
                <div style={{ display: "flex", alignItems: "center", gap: 16, marginBottom: 20 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 14, background: C.bg, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.4rem", fontWeight: 800, color: C.blue }}>
                    {s.name ? s.name[0] : "?"}
                  </div>
                  <div>
                    <div style={{ fontWeight: 800, color: C.dark, fontSize: '1rem' }}>{s.name}</div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 4 }}>
                      <Badge color={s.is_trusted ? C.green : C.muted}>
                        {s.is_trusted ? <><PiSealCheckDuotone/> {t("موثوق")}</> : t("غير موثق")}
                      </Badge>
                    </div>
                  </div>
                </div>
  
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 10, marginBottom: 24 }}>
                  <div style={{ textAlign: 'center', padding: '10px', background: C.bg, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: 4 }}>{t("النقاط")}</div>
                    <div style={{ fontWeight: 800, color: C.blue }}>{s.points}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: C.bg, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: 4 }}>{t("المرفوعات")}</div>
                    <div style={{ fontWeight: 800, color: C.dark }}>{s.resources}</div>
                  </div>
                  <div style={{ textAlign: 'center', padding: '10px', background: C.bg, borderRadius: 12 }}>
                    <div style={{ fontSize: '0.7rem', color: C.muted, marginBottom: 4 }}>{t("ديسلايك")}</div>
                    <div style={{ fontWeight: 800, color: s.dislikes > 0 ? C.red : C.muted }}>{s.dislikes}</div>
                  </div>
                </div>
  
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn 
                    variant={s.is_trusted ? "danger" : "success"} 
                    style={{ flex: 1, fontSize: '0.82rem', padding: '10px' }}
                    onClick={() => toggleTrust(s.id)}
                  >
                    {s.is_trusted ? <><PiMinusCircleDuotone size={16}/> {t("سحب الثقة")}</> : <><PiPlusCircleDuotone size={16}/> {t("منح الثقة")}</>}
                  </Btn>
                  <Btn variant="secondary" style={{ padding: '10px 14px' }} onClick={() => setPage(isAdmin ? 'admin-resources' : 'mod-resources', { userFilter: s.name })} title={t("عرض سجل المرفوعات")}>
                    <PiArrowUpRightDuotone size={18}/>
                  </Btn>
                </div>
              </Card>
            );
          })
        )}
      </div>
      <div style={{ marginTop: 24 }}>
        <Pagination meta={meta} onPageChange={fetchStudents} />
      </div>

      <Card style={{ marginTop: 40, padding: 28, background: C.dark, color: C.white }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
          <div style={{ width: 60, height: 60, borderRadius: 15, background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: C.white }}>
            <PiGearDuotone size={30}/>
          </div>
          <div>
            <h3 style={{ margin: 0, fontSize: '1.2rem', fontWeight: 800 }}>{t("قواعد الثقة التلقائية")}</h3>
            <p style={{ margin: '6px 0 0', color: 'rgba(255,255,255,0.6)', fontSize: '0.9rem' }}>
              {t("الطلاب الذين يصلون لـ ")} <strong>{pointLimit} {t("نقطة")}</strong> {t("يتم منحهم الثقة تلقائياً. المرفوعات التي تحصل على ")} <strong>{dislikeLimit} {t("ديسلايك")}</strong> {t("تؤدي لسحب الثقة مؤقتاً للمراجعة.")}
            </p>
          </div>
        </div>
      </Card>
    </React.Fragment>
  );
}
