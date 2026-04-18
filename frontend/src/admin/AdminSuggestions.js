import React, { useState, useContext, useEffect } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import { PiSparkleDuotone, PiCheckCircleDuotone, PiUserDuotone, PiTrashDuotone, PiClockDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';
import { FadeIn } from '../utils';

export default function AdminSuggestions({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [suggestions, setSuggestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchSuggestions(1);
  }, []);

  async function fetchSuggestions(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/suggestions?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.data);
        setMeta({ current_page: data.current_page, last_page: data.last_page });
      }
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function showToast(msg, color) { setToast({msg,color}); setTimeout(()=>setToast(null),2800); }

  async function markReviewed(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/suggestions/${id}/review`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(t("تم تحديد الاقتراح كمقروء"), C.green);
        setSuggestions(prev => prev.map(s => s.id === id ? { ...s, status: 1 } : s));
      }
    } catch (err) { showToast(t("فشل الإجراء"), C.red); }
  }

  async function deleteSuggestion(id) {
    if (!window.confirm(t("هل أنت متأكد من حذف هذا الاقتراح؟"))) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/suggestions/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        showToast(t("تم حذف الاقتراح بنجاح"), C.green);
        setSuggestions(prev => prev.filter(s => s.id !== id));
      }
    } catch (err) { showToast(t("فشل الحذف"), C.red); }
  }

  const getCategoryLabel = (cat) => {
      const labels = {
          1: t("واجهة المنصة"),
          2: t("ميزة جديدة"),
          3: t("خطأ تقني"),
          4: t("أخرى")
      };
      return labels[cat] || t("أخرى");
  };

  return (
    <>
      {toast && <div style={{ position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", background:C.dark, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:"0.9rem", fontWeight:600, zIndex:999, borderRight:`4px solid ${toast.color}` }}>{toast.msg}</div>}
      
      <div style={{ marginBottom:28 }}>
         <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("إدارة الاقتراحات")}</h1>
         <p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("استعراض مقترحات الطلاب لتطوير المنصة")}</p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
        {loading ? (
            Array(4).fill(0).map((_,i) => <Skeleton key={i} height="200px" borderRadius="16px"/>)
        ) : suggestions.length === 0 ? (
            <div style={{ gridColumn:'1/-1', padding:60, textAlign:'center', color:C.muted, background:C.bg, borderRadius:24 }}>
                <PiSparkleDuotone size={48} style={{ opacity:0.3, marginBottom:12 }}/>
                <div>{t("لا توجد اقتراحات حالياً")}</div>
            </div>
        ) : suggestions.map((s, i) => (
          <FadeIn key={s.id} delay={i * 0.1}>
            <Card style={{ padding:'24px', display:'flex', flexDirection:'column', height:'100%', border: s.status === 0 ? `1px solid ${C.blue}25` : `1px solid ${C.border}`, opacity: s.status === 1 ? 0.75 : 1 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ display:'flex', gap:6 }}>
                    <Badge color={s.status === 0 ? C.blue : C.green} style={{ display:'flex', alignItems:'center', gap:4 }}>{s.status === 0 ? <><PiSparkleDuotone/> {t("جديد")}</> : <><PiCheckCircleDuotone/> {t("تمت المراجعة")}</>}</Badge>
                    <Badge color={C.muted}>{getCategoryLabel(s.category)}</Badge>
                </div>
                <div style={{ fontSize:'0.75rem', color:C.muted, display:'flex', alignItems:'center', gap:4 }}><PiClockDuotone/> {new Date(s.created_at).toLocaleDateString('ar-EG')}</div>
              </div>
              <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:'0 0 8px' }}>{s.title}</h3>
              <p style={{ color:C.muted, fontSize:'0.9rem', lineHeight:1.7, flex:1, marginBottom:16 }}>{s.description}</p>
              
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', borderTop:`1px solid ${C.border}`, paddingTop:16 }}>
                <span style={{ fontSize:'0.85rem', color:C.dark, fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><PiUserDuotone/> {t("الطالب: ")}{s.user?.profile?.first_name} {s.user?.profile?.last_name}</span>
                <div style={{ display:'flex', gap:8 }}>
                  {s.status === 0 && <Btn variant="ghost" style={{ fontSize:'0.8rem', padding:'6px 14px', display:'flex', alignItems:'center', gap:4, background:C.blue+'10', color:C.blue }} onClick={() => markReviewed(s.id)}>{t("تحديد كمقروء ")}<PiCheckCircleDuotone/></Btn>}
                  <Btn variant="danger" style={{ fontSize:'0.8rem', padding:'6px 14px', border:`1px solid color-mix(in srgb, ${C.red} 19%, transparent)` }} onClick={() => deleteSuggestion(s.id)}><PiTrashDuotone/></Btn>
                </div>
              </div>
            </Card>
          </FadeIn>
        ))}
      </div>
      
      {!loading && suggestions.length > 0 && (
          <div style={{ marginTop:28 }}>
              <Pagination meta={meta} onPageChange={fetchSuggestions} />
          </div>
      )}
    </>
  );
}
