import React, { useState, useContext, useEffect } from "react";
import { C, inputStyle } from "../tokens";
import { Btn, Badge, Card, Skeleton } from "../components/Common";
import DashboardLayout from "../layouts/DashboardLayout";
import { LanguageContext } from "../LanguageContext";
import { UserContext } from "../UserContext";
import {
  PiArrowLeftDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone,
  PiBookOpenDuotone, PiStarDuotone, PiLockDuotone, PiCheckBold,
  PiProhibitDuotone
} from "react-icons/pi";
import { getApiUrl } from "../api";

export default function DashSubjectSelection({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { user, isSubscribed, userRole } = useContext(UserContext);
  const isAdmin = userRole === "admin";
  const canAddPaid = isSubscribed || (user?.user_permissions || []).includes("manage_paid_subjects");

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [subjects, setSubjects]     = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saved, setSaved]           = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  useEffect(() => { fetchAvailable(); }, []);

  const fetchAvailable = async () => {
    const token = localStorage.getItem("elite_token");
    try {
      const res  = await fetch(`${getApiUrl()}/api/available-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();
      const list = data.subjects || [];
      const currentTerm = data.current_term_ids || [];
      setSubjects(list);
      setSelectedIds(currentTerm.map(Number));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggle = (id, isFree, alreadyStudied) => {
    if (alreadyStudied) return; // Material from a PREVIOUS term cannot be changed.
    
    // Check subscription only if ADDING a paid subject
    const isAdding = !selectedIds.includes(id);
    if (isAdding && !canAddPaid && !isFree) return;

    setErrorMsg("");
    setSaved(false);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    const token = localStorage.getItem("elite_token");
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/enroll-subjects`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ subject_ids: selectedIds })
      });
      if (res.ok) {
        setSaved(true);
        setTimeout(() => { setPage("/dashboard"); }, 1500);
      } else {
        const r = await res.json();
        setErrorMsg(r.message || t("فشل الحفظ"));
      }
    } catch { setErrorMsg(t("خطأ في الاتصال")); }
    finally { setSaving(false); }
  };

  const filtered = subjects.filter(s => s.name.toLowerCase().includes(searchTerm.toLowerCase()));

  const SubjectCard = ({ s }) => {
    const isSelected = selectedIds.includes(s.id);
    // studiedBefore = enrolled in a different level/semester in the past
    const studiedBefore = s.already_enrolled; 
    const locked = (!canAddPaid && !s.is_free && !isSelected) || studiedBefore;

    return (
      <Card
        hover={!studiedBefore}
        onClick={() => toggle(s.id, s.is_free, studiedBefore)}
        style={{ 
          padding:20, 
          opacity: studiedBefore ? 0.6 : 1, 
          cursor: studiedBefore ? "not-allowed" : "pointer", 
          border:`1.5px solid ${isSelected ? C.blue : C.border}`, 
          background: isSelected ? C.blueLight : (studiedBefore ? C.bg : C.white),
          transition:"all .2s" 
        }}
      >
        <div style={{ display:"flex", justifyContent:"space-between", marginBottom:10 }}>
          <div style={{ width:38, height:38, borderRadius:10, background: isSelected ? C.blue : C.blueLight, color: isSelected ? "#fff" : C.blue, display:"flex", alignItems:"center", justifyContent:"center" }}>
            {studiedBefore ? <PiProhibitDuotone size={19}/> : <PiBookOpenDuotone size={19}/>}
          </div>
          <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${isSelected ? C.blue : C.border}`, background: isSelected ? C.blue : "transparent", display:"flex", alignItems:"center", justifyContent:"center" }}>
            {isSelected && <PiCheckBold size={12} color="#fff"/>}
          </div>
        </div>
        <div style={{ fontWeight:700, fontSize:"0.9rem", color:C.dark }}>{s.name}</div>
        {isAdmin && <div style={{ fontSize:"0.7rem", color:C.muted }}>{s.code}</div>}
        {studiedBefore && <Badge color={C.muted} style={{marginTop:8}}>{t("تمت دراستها")}</Badge>}
        {!s.is_free && !isSubscribed && !isSelected && (
          <div style={{ fontSize:"0.7rem", color:C.gold, fontWeight:700, marginTop:8 }}><PiStarDuotone/> {t("مشتركون فقط")}</div>
        )}
      </Card>
    );
  };

  if (loading) return <DashboardLayout setPage={setPage}><div style={{padding:40}}>{t("جاري التحميل...")}</div></DashboardLayout>;

  return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
      <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:14 }}>
        <div onClick={() => setPage("/dashboard")} style={{ cursor:"pointer", width:40, height:40, borderRadius:12, background:C.white, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}><PiArrowLeftDuotone size={20} style={{transform:"rotate(180deg)"}}/></div>
        <h1 style={{ fontSize:"1.3rem", fontWeight:800, color:C.dark, margin:0 }}>{t("اختيار مواد الترم")}</h1>
      </div>
      {errorMsg && <div style={{ background:C.redBg, padding:12, borderRadius:10, color:C.red, marginBottom:15 }}>{errorMsg}</div>}
      {saved && <div style={{ background:C.greenBg, padding:12, borderRadius:10, color:C.green, marginBottom:15 }}>{t("تم الحفظ بنجاح!")}</div>}
      <div style={{ marginBottom:20 }}><input type="search" placeholder={t("ابحث...")} value={searchTerm} onChange={e=>setSearchTerm(e.target.value)} style={{...inputStyle, maxWidth:300}} /></div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:15, marginBottom:80 }}>
        {filtered.map(s => <SubjectCard key={s.id} s={s}/>)}
      </div>
      <div style={{ position:"fixed", bottom:20, left:20, right:20, maxWidth:1200, margin:"0 auto", background:C.white, padding:15, borderRadius:15, boxShadow:"0 -5px 20px rgba(0,0,0,0.05)", display:"flex", alignItems:"center", gap:20, zIndex:10 }}>
        <Btn onClick={save} disabled={saving} style={{minWidth:180}}>{saving ? t("جاري الحفظ...") : t("حفظ التغييرات")}</Btn>
        <div style={{fontWeight:700}}>{t("المواد المختارة:")} {selectedIds.length}</div>
      </div>
    </DashboardLayout>
  );
}
