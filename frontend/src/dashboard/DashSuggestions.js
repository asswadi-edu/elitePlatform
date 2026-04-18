import React, { useContext, useState, useEffect } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field, Badge, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { PiSparkleDuotone, PiClockDuotone, PiCheckCircleDuotone, PiWarningDuotone } from 'react-icons/pi';
import { getApiUrl } from '../api';

export default function DashSuggestions({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(false);
  const [suggestions, setSuggestions] = useState([]);
  const [fetching, setFetching] = useState(true);
  const [formData, setFormData] = useState({ title: '', description: '', category: 4 });
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchMySuggestions();
  }, []);

  async function fetchMySuggestions() {
    try {
      const res = await fetch(`${apiUrl}/api/suggestions`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setSuggestions(data.data || []);
      }
    } catch (err) { console.error(err); }
    finally { setFetching(false); }
  }

  function showToast(msg, color) { setToast({msg,color}); setTimeout(()=>setToast(null),3000); }

  async function handleSubmit(e) {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/suggestions`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast(t("تم إرسال اقتراحك بنجاح! شكراً لك."), C.green);
        setFormData({ title: '', description: '', category: 4 });
        fetchMySuggestions();
      } else {
        showToast(t("فشل إرسال الاقتراح، يرجى المحاولة لاحقاً."), C.red);
      }
    } catch (err) {
      showToast(t("حدث خطأ في الاتصال."), C.red);
    } finally {
      setLoading(false);
    }
  }

  return (
    <DashboardLayout activeSub="suggestions" setPage={setPage}>
      {toast && <div style={{ position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", background:C.dark, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:"0.9rem", fontWeight:600, zIndex:999, borderRight:`4px solid ${toast.color}` }}>{toast.msg}</div>}
      
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, margin: '0 0 6px' }}>
          {t("تقديم اقتراح للمنصة")}
        </h1>
        <p style={{ color: C.muted, fontSize: '0.88rem' }}>
          {t("نحن نهتم برأيك. أخبرنا عن أي ميزة تود رؤيتها في المنصة، أو أبلغنا بمشكلة واجهتك لتحسين تجربتك الدراسية.")}
        </p>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'1fr 1.2fr', gap:28, alignItems:'flex-start' }}>
        <Card style={{ padding: 28 }}>
          <form onSubmit={handleSubmit}>
            <Field label={t("عنوان الاقتراح")}>
              <input 
                required 
                value={formData.title}
                onChange={e => setFormData({...formData, title: e.target.value})}
                placeholder={t("مثال: إضافة فيديوهات شرح لكل مادة")} 
                style={inputStyle} 
              />
            </Field>
            <Field label={t("الفئة")}>
                <select 
                    style={inputStyle} 
                    value={formData.category}
                    onChange={e => setFormData({...formData, category: e.target.value})}
                >
                    <option value={1}>{t("واجهة المنصة")}</option>
                    <option value={2}>{t("ميزة جديدة")}</option>
                    <option value={3}>{t("تبليغ عن خطأ تقني")}</option>
                    <option value={4}>{t("أخرى")}</option>
                </select>
            </Field>
            <Field label={t("تفاصيل الاقتراح")}>
              <textarea 
                required 
                rows={5} 
                value={formData.description}
                onChange={e => setFormData({...formData, description: e.target.value})}
                placeholder={t("اشرح لنا اقتراحك أو المشكلة بالتفصيل...")} 
                style={{ ...inputStyle, resize: 'vertical' }} 
              />
            </Field>
            <Btn type="submit" loading={loading} style={{ marginTop: 14, width:'100%' }}>{t("إرسال الاقتراح")}</Btn>
          </form>
        </Card>

        <div>
            <h3 style={{ fontSize:'1.1rem', fontWeight:700, color:C.dark, marginBottom:16 }}>{t("اقتراحاتي السابقة")}</h3>
            <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                {fetching ? (
                    Array(3).fill(0).map((_,i) => <Skeleton key={i} height="100px" borderRadius="16px"/>)
                ) : suggestions.length === 0 ? (
                    <div style={{ padding:40, textAlign:'center', color:C.muted, background:C.bg, borderRadius:16, border:`1px dashed ${C.border}` }}>
                        {t("لم تقم بتقديم أي اقتراحات بعد.")}
                    </div>
                ) : suggestions.map(s => (
                    <Card key={s.id} style={{ padding:'16px 20px' }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:8 }}>
                            <div style={{ fontWeight:700, color:C.dark, fontSize:'0.9rem' }}>{s.title}</div>
                            <Badge color={s.status === 0 ? C.blue : C.green}>
                                {s.status === 0 ? t("قيد المراجعة") : t("تمت المراجعة")}
                            </Badge>
                        </div>
                        <p style={{ fontSize:'0.82rem', color:C.muted, margin:'0 0 12px', lineHeight:1.5 }}>{s.description}</p>
                        <div style={{ fontSize:'0.75rem', color:C.muted, display:'flex', alignItems:'center', gap:4 }}>
                            <PiClockDuotone/> {new Date(s.created_at).toLocaleDateString('ar-EG')}
                        </div>
                    </Card>
                ))}
            </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
