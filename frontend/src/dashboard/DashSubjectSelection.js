import React, { useState, useContext } from "react";
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
  const { user, isSubscribed } = useContext(UserContext);
  const perms = user?.user_permissions || user?.permissions || [];
  const canAddPaid = isSubscribed || perms.includes("manage_paid_subjects");

  const [loading, setLoading]       = useState(true);
  const [saving, setSaving]         = useState(false);
  const [subjects, setSubjects]     = useState([]);
  const [selectedIds, setSelectedIds] = useState([]);
  const [saved, setSaved]           = useState(false);
  const [errorMsg, setErrorMsg]     = useState("");
  const [searchTerm, setSearchTerm] = useState("");

  React.useEffect(() => { fetchAvailable(); }, []);

  const fetchAvailable = async () => {
    const token = localStorage.getItem("elite_token");
    try {
      const res  = await fetch(`${getApiUrl()}/api/available-courses`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      const data = await res.json();

      // New API shape: { subjects: [...], current_term_ids: [...] }
      // Fallback: if API still returns old flat array
      const list        = Array.isArray(data) ? data : (data.subjects ?? []);
      const currentTerm = Array.isArray(data) ? [] : (data.current_term_ids ?? []);

      setSubjects(list);
      // Pre-select subjects already in current term
      setSelectedIds(currentTerm.map(Number));
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const toggle = (id, isFree, alreadyEnrolled) => {
    if (alreadyEnrolled) return;            // studied before – immovable
    if (!canAddPaid && !isFree) return;     // locked for non-subscribers
    setErrorMsg("");
    setSaved(false);
    setSelectedIds(prev =>
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  const save = async () => {
    if (selectedIds.length === 0) { setErrorMsg(t("يرجى اختيار مادة واحدة على الأقل")); return; }
    const token = localStorage.getItem("elite_token");
    setSaving(true);
    try {
      const res    = await fetch(`${getApiUrl()}/api/enroll-subjects`, {
        method:  "POST",
        headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
        body:    JSON.stringify({ subject_ids: selectedIds })
      });
      const result = await res.json();
      if (res.ok) {
        setSaved(true);
        setTimeout(() => { setSaved(false); setPage("/dash-subjects"); }, 1500);
      } else {
        setErrorMsg(result.message || t("فشل حفظ المواد"));
      }
    } catch { setErrorMsg(t("حدث خطأ في الاتصال بالسيرفر")); }
    finally { setSaving(false); }
  };

  const filtered = subjects.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const freeList = filtered.filter(s => s.is_free);
  const paidList = filtered.filter(s => !s.is_free);

  if (loading && subjects.length === 0) return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
      <div style={{ marginBottom:28 }}>
        <Skeleton width="220px" height="32px" margin="0 0 10px"/>
        <Skeleton width="340px" height="18px"/>
      </div>
      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(220px,1fr))", gap:18 }}>
        {[1,2,3,4,5,6].map(i => (
          <Card key={i} style={{ padding:22 }}>
            <Skeleton width="40px" height="40px" borderRadius="11px" margin="0 0 12px"/>
            <Skeleton width="140px" height="20px" margin="0 0 8px"/>
          </Card>
        ))}
      </div>
    </DashboardLayout>
  );

  const SubjectCard = ({ s }) => {
    const isSelected      = selectedIds.includes(s.id);
    const alreadyEnrolled = s.already_enrolled && !s.in_current_term;
    const inCurrentTerm   = s.in_current_term;
    const locked          = (!canAddPaid && !s.is_free) || alreadyEnrolled;

    let borderColor = C.border;
    let bgColor     = C.white;
    let labelEl     = null;

    if (alreadyEnrolled) {
      borderColor = C.border;
      bgColor     = C.bg;
      labelEl     = <Badge color={C.muted}>{t("تمت دراستها")}</Badge>;
    } else if (inCurrentTerm) {
      borderColor = C.green;
      bgColor     = C.greenBg;
    } else if (isSelected) {
      borderColor = C.blue;
      bgColor     = C.blueLight;
    } else if (!s.is_free && !canAddPaid) {
      labelEl = (
        <span style={{ display:"inline-flex", alignItems:"center", gap:4, background:C.gold+"22", color:"#92400E", borderRadius:8, padding:"2px 9px", fontSize:"0.7rem", fontWeight:700, border:`1px solid ${C.gold}50` }}>
          <PiStarDuotone size={12}/> {t("مشتركون فقط")}
        </span>
      );
    }

    return (
      <Card
        hover={!locked}
        onClick={() => toggle(s.id, s.is_free, alreadyEnrolled)}
        style={{ padding:20, opacity: alreadyEnrolled ? 0.6 : 1, cursor: locked ? "not-allowed" : "pointer", border:`1.5px solid ${borderColor}`, background:bgColor, display:"flex", flexDirection:"column", gap:10, transition:"all .2s", position:"relative" }}
      >
        {/* Top row: icon + checkbox/status */}
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
          <div style={{ width:38, height:38, borderRadius:10, display:"flex", alignItems:"center", justifyContent:"center", background: alreadyEnrolled ? C.border : (isSelected || inCurrentTerm) ? C.blue : C.blueLight, color: (isSelected || inCurrentTerm) ? C.white : C.blue, transition:"all .2s" }}>
            {alreadyEnrolled ? <PiProhibitDuotone size={19}/> : locked && !inCurrentTerm ? <PiLockDuotone size={19}/> : <PiBookOpenDuotone size={19}/>}
          </div>
          <div style={{ width:22, height:22, borderRadius:6, border:`2px solid ${(isSelected||inCurrentTerm) ? C.blue : C.border}`, background:(isSelected||inCurrentTerm) ? C.blue : "transparent", display:"flex", alignItems:"center", justifyContent:"center", transition:"all .2s" }}>
            {(isSelected || inCurrentTerm) && <PiCheckBold size={12} color="#fff"/>}
          </div>
        </div>

        {/* Subject name only – no code */}
        <div style={{ fontWeight:700, fontSize:"0.92rem", color: alreadyEnrolled ? C.muted : C.dark, flex:1 }}>{s.name}</div>

        {/* Status badge */}
        {labelEl}
        {inCurrentTerm && !labelEl && <Badge color={C.green}>{t("مضافة للترم الحالي")}</Badge>}
      </Card>
    );
  };

  return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
      {/* Header */}
      <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:14 }}>
        <div onClick={() => setPage("/dash-subjects")} style={{ cursor:"pointer", width:40, height:40, borderRadius:12, background:C.white, border:`1px solid ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center", color:C.muted }}>
          <PiArrowLeftDuotone size={20} style={{ transform:"rotate(180deg)" }}/>
        </div>
        <div>
          <h1 style={{ fontSize:"1.3rem", fontWeight:800, color:C.dark, margin:"0 0 4px" }}>{t("اختيار مواد الترم الحالي")}</h1>
          <p style={{ color:C.muted, fontSize:"0.85rem" }}>{t("اختر المواد التي تدرسها هذا الفصل")}</p>
        </div>
      </div>

      {/* Alerts */}
      {errorMsg && (
        <div style={{ background:C.redBg, border:`1px solid ${C.red}30`, borderRadius:11, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
          <PiWarningCircleDuotone size={20} color={C.red}/>
          <span style={{ fontSize:"0.85rem", color:C.red, fontWeight:700 }}>{errorMsg}</span>
        </div>
      )}
      {saved && (
        <div style={{ background:C.greenBg, border:`1px solid ${C.green}30`, borderRadius:11, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
          <PiCheckCircleDuotone size={20} color={C.green}/>
          <span style={{ fontSize:"0.85rem", color:C.green, fontWeight:700 }}>{t("تم حفظ المواد بنجاح! جاري التوجيه...")}</span>
        </div>
      )}
      {!canAddPaid && (
        <div style={{ background:C.goldBg, border:`1px solid ${C.gold}40`, borderRadius:11, padding:"12px 16px", marginBottom:18, display:"flex", alignItems:"center", gap:10 }}>
          <PiStarDuotone size={20} color={C.gold}/>
          <span style={{ fontSize:"0.84rem", color:"#92400E" }}>
            {t("المواد التخصصية المميزة بـ")} <strong>{t("\"مشتركون فقط\"")}</strong> {t("تتطلب اشتراكاً نشطاً")}
          </span>
          <Btn onClick={() => setPage("/dash-activate")} style={{ marginInlineStart:"auto", padding:"6px 16px", fontSize:"0.8rem", background:C.gold, border:"none" }}>
            {t("اشترك الآن")}
          </Btn>
        </div>
      )}

      {/* Search */}
      <div style={{ marginBottom:20 }}>
        <input
          type="search"
          placeholder={t("ابحث عن مادة...")}
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
          style={{ ...inputStyle, maxWidth:360 }}
        />
      </div>

      {/* Free subjects */}
      {freeList.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <PiBookOpenDuotone size={18} color={C.blue}/>
            <span style={{ fontWeight:700, color:C.dark, fontSize:"0.95rem" }}>{t("المواد الأساسية")}</span>
            <span style={{ fontSize:"0.78rem", color:C.muted }}>({freeList.length})</span>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
            {freeList.map(s => <SubjectCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}

      {/* Paid subjects */}
      {paidList.length > 0 && (
        <div style={{ marginBottom:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:14 }}>
            <PiStarDuotone size={18} color={C.gold}/>
            <span style={{ fontWeight:700, color:C.dark, fontSize:"0.95rem" }}>{t("المواد التخصصية")}</span>
            <span style={{ fontSize:"0.78rem", color:C.muted }}>({paidList.length})</span>
            {!canAddPaid && <Badge color={C.gold}>{t("تتطلب اشتراكاً")}</Badge>}
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(210px,1fr))", gap:14 }}>
            {paidList.map(s => <SubjectCard key={s.id} s={s}/>)}
          </div>
        </div>
      )}

      {filtered.length === 0 && (
        <div style={{ textAlign:"center", padding:"60px 0", color:C.muted }}>
          <PiBookOpenDuotone size={44} style={{ opacity:0.3, marginBottom:10 }}/>
          <div style={{ fontWeight:700 }}>{t("لا توجد مواد")}</div>
        </div>
      )}

      {/* Save bar */}
      <div style={{ position:"sticky", bottom:0, background:C.bg, borderTop:`1px solid ${C.border}`, paddingTop:16, paddingBottom:16, display:"flex", alignItems:"center", gap:16 }}>
        <Btn onClick={save} disabled={saving || saved} variant={saved ? "success" : "primary"} style={{ minWidth:200, display:"flex", alignItems:"center", gap:8, justifyContent:"center" }}>
          {saving ? t("جاري الحفظ...") : saved ? <><PiCheckCircleDuotone size={18}/> {t("تم الحفظ")}</> : t("حفظ المواد المختارة")}
        </Btn>
        <div style={{ color:C.muted, fontSize:"0.85rem" }}>
          {t("تم اختيار")} <span style={{ color:C.blue, fontWeight:700 }}>{selectedIds.length}</span> {t("مادة")}
        </div>
      </div>
    </DashboardLayout>
  );
}
