import React, { useState, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { UserContext } from '../UserContext';
import { PiArrowLeftDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone, PiBookOpenDuotone, PiStarDuotone, PiLockDuotone } from 'react-icons/pi';
import { getApiUrl } from '../api';

export default function DashSubjectSelection({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { user, isSubscribed } = useContext(UserContext);
  const perms = user?.user_permissions || user?.permissions || [];
  const [loading, setLoading] = useState(true);
  const [subjects, setSubjects] = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saved, setSaved] = useState(false);
  const [errorMsg, setErrorMsg] = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  const canManagePaidSubjects = isSubscribed || perms.includes('manage_paid_subjects');

  React.useEffect(() => {
    fetchAvailable();
  }, []);

  const fetchAvailable = async () => {
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/available-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      setSubjects(data);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  function toggle(id, isFree) { 
    if (!canManagePaidSubjects && !isFree) return; 
    setSelectedIds(s => {
      const isSelected = s.includes(id);
      const newSel = isSelected ? s.filter(x => x!==id) : [...s,id];
      setErrorMsg("");
      setSaved(false);
      return newSel;
    }); 
  }

  const save = async () => { 
    if (selectedIds.length === 0) {
        setErrorMsg(t("يرجى اختيار مادة واحدة على الأقل"));
        return;
    }

    const token = localStorage.getItem("elite_token");
    setLoading(true);
    try {
        const res = await fetch(`${getApiUrl()}/api/enroll-subjects`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${token}`
            },
            body: JSON.stringify({ subject_ids: selectedIds })
        });
        const result = await res.json();
        if (res.ok) {
            setSaved(true); 
            setTimeout(() => {
                setSaved(false);
                setPage('dash-subjects');
            }, 1500); 
        } else {
            setErrorMsg(result.message || t("فشل حفظ المواد"));
        }
    } catch(e) {
        setErrorMsg(t("حدث خطأ في الاتصال بالسيرفر"));
    } finally {
        setLoading(false);
    }
  };

  const filteredSubjects = subjects.filter(s => 
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
    s.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  if (loading && subjects.length === 0) return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
        <div style={{ marginBottom: 28 }}>
          <Skeleton width="220px" height="32px" margin="0 0 10px" />
          <Skeleton width="340px" height="18px" />
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 18 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <Card key={i} style={{ padding: 22 }}>
              <Skeleton width="40px" height="40px" borderRadius="11px" margin="0 0 12px" />
              <Skeleton width="140px" height="20px" margin="0 0 8px" />
              <Skeleton width="80px" height="14px" />
            </Card>
          ))}
        </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
      <div style={{ marginBottom:28, display:'flex', alignItems:'center', gap:15 }}>
        <div onClick={() => setPage('dash-subjects')} style={{ cursor:'pointer', width:40, height:40, borderRadius:12, background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', color:C.muted }} hover>
            <PiArrowLeftDuotone size={20} style={{ transform: document.dir === 'rtl' ? 'rotate(0deg)' : 'rotate(180deg)' }}/>
        </div>
        <div>
            <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("اختيار مواد الترم الحالي")}</h1>
            <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("اختر المواد التي تدرسها في هذا الفصل الدراسي (الحد الأدنى 4 مواد)")}</p>
        </div>
      </div>

      {errorMsg && (
        <div style={{ background:C.redBg, border:`1px solid color-mix(in srgb, ${C.red} 19%, transparent)`, borderRadius:12, padding:'13px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <PiWarningCircleDuotone size={20} color={C.red}/>
          <span style={{ fontSize:'0.86rem', color:C.red, fontWeight:700 }}>{errorMsg}</span>
        </div>
      )}

        {saved && (
          <div style={{ background:C.greenBg, border:`1px solid color-mix(in srgb, ${C.green} 19%, transparent)`, borderRadius:12, padding:'13px 18px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
            <PiCheckCircleDuotone size={20} color={C.green}/>
            <span style={{ fontSize:'0.86rem', color:C.green, fontWeight:700 }}>{t("تم حفظ المواد بنجاح! سيتم توجيهك للرئيسية...")}</span>
          </div>
        )}

      {!canManagePaidSubjects && (
        <div style={{ background:C.goldBg, border:`1px solid color-mix(in srgb, ${C.gold} 19%, transparent)`, borderRadius:12, padding:'13px 18px', marginBottom:28, display:'flex', alignItems:'center', gap:10 }}>
          <PiStarDuotone size={20} color={C.gold}/>
          <span style={{ fontSize:'0.86rem', color:'#92400E' }} dangerouslySetInnerHTML={{ __html: t("المواد المتخصصة تتطلب اشتراكًا مدفوعًا. <strong>اشترك الآن</strong> لفتح جميع المواد.") }} />
        </div>
      )}

      <div style={{ marginBottom:24 }}>
        <input 
            type="text" 
            placeholder={t("ابحث عن مادة...")} 
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
            style={{ ...inputStyle, maxWidth:400 }}
        />
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:18, marginBottom:28 }}>
        {filteredSubjects.map((s) => {
          const locked = !canManagePaidSubjects && !s.is_free;
          const isSelected = selectedIds.includes(s.id);
          return (
            <Card key={s.id} style={{ padding:22, opacity: locked ? 0.65 : 1, cursor: locked ? 'not-allowed' : 'pointer', border: isSelected ? `1.5px solid ${C.blue}` : `1px solid ${C.border}`, background: isSelected ? C.blueLight : C.white, display: 'flex', flexDirection: 'column' }} hover={!locked} onClick={() => toggle(s.id, s.is_free)}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:12 }}>
                <div style={{ width:40, height:40, borderRadius:11, background: locked ? C.bg : (isSelected ? C.blue : C.blueLight), display:'flex', alignItems:'center', justifyContent:'center', color: isSelected ? C.white : C.blue, transition:'all .2s' }}>
                    {locked ? <PiLockDuotone size={20}/> : <PiBookOpenDuotone size={20}/>}
                </div>
                <input type="checkbox" checked={isSelected} readOnly style={{ width:18, height:18, accentColor:C.blue }} />
              </div>
              <div style={{ fontWeight:700, fontSize:'0.95rem', color:C.dark, marginBottom:4 }}>{s.name}</div>
              <div style={{ fontSize:'0.8rem', color:C.muted, marginBottom:12, flex: 1 }}>{s.code}</div>
              {locked && (
                <Badge color={C.gold}>{t("يتطلب اشتراكًا")}</Badge>
              )}
            </Card>
          );
        })}
      </div>

      <div style={{ display:'flex', alignItems:'center', gap:16, borderTop:`1px solid ${C.border}`, paddingTop:20, position:'sticky', bottom:0, background:C.bg, paddingBottom:20 }}>
        <Btn onClick={save} variant={saved ? 'success' : 'primary'} style={{ minWidth:200, display:'flex', alignItems:'center', gap:8, justifyContent:'center' }}>
            {saved ? <><PiCheckCircleDuotone size={18}/> {t("تم الحفظ")}</> : t("حفظ المواد المختارة")}
        </Btn>
        <div style={{ color:C.muted, fontSize:'0.86rem', fontWeight:500 }}>
            {t("تم اختيار ")} <span style={{ color:C.blue, fontWeight:700 }}>{selectedIds.length}</span> {t(" مادة")}
        </div>
      </div>
    </DashboardLayout>
  );
}
