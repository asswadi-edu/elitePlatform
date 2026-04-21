import React, { useState, useContext, useEffect } from 'react';
import { C } from '../tokens';
import { Btn, Card, Pagination, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import {
  PiBankDuotone, PiGraduationCapDuotone, PiMapTrifoldDuotone,
  PiBooksDuotone, PiBookOpenDuotone, PiMonitorDuotone,
  PiFirstAidKitDuotone, PiChartBarDuotone, PiPaletteDuotone,
  PiAtomDuotone, PiFlaskDuotone, PiGavelDuotone, PiGlobeDuotone,
  PiLightbulbDuotone, PiStethoscopeDuotone, PiShapesDuotone
} from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

const AVAILABLE_ICONS = {
  Monitor: <PiMonitorDuotone />,
  Medical: <PiFirstAidKitDuotone />,
  Business: <PiChartBarDuotone />,
  Creative: <PiPaletteDuotone />,
  Science: <PiAtomDuotone />,
  Lab: <PiFlaskDuotone />,
  Law: <PiGavelDuotone />,
  Global: <PiGlobeDuotone />,
  Idea: <PiLightbulbDuotone />,
  Health: <PiStethoscopeDuotone />,
  General: <PiShapesDuotone />
};

export default function AdminMajors({ setPage, tab: initialTab = "universities" }) {
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState(initialTab);

  useEffect(() => {
    setTab(initialTab);
  }, [initialTab]);

  const [universities, setUniversities] = useState([]);
  const [fields, setFields] = useState([]);
  const [faculties, setFaculties] = useState([]); // Called Colleges in backend
  const [majors, setMajors] = useState([]);
  const [subjects, setSubjects] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [metas, setMetas] = useState({
    universities: { current_page: 1, last_page: 1 },
    fields: { current_page: 1, last_page: 1 },
    faculties: { current_page: 1, last_page: 1 },
    majors: { current_page: 1, last_page: 1 },
    subjects: { current_page: 1, last_page: 1 },
  });

  useEffect(() => {
    if (tab === "universities") fetchUniversities(1);
    if (tab === "fields") fetchFields(1);
    if (tab === "faculties") { fetchColleges(1); fetchFields(); fetchUniversities(); }
    if (tab === "majors") { fetchMajors(1); fetchColleges(); fetchFields(); }
    if (tab === "subjects") { fetchSubjects(1); fetchMajors(); }
  }, [tab]);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  async function fetchUniversities(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/universities?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setUniversities(data.data);
      setMetas(prev => ({ ...prev, universities: { current_page: data.current_page, last_page: data.last_page } }));
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }

  async function fetchFields(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/fields?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFields(data.data);
      setMetas(prev => ({ ...prev, fields: { current_page: data.current_page, last_page: data.last_page } }));
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }

  async function fetchColleges(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/colleges?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setFaculties(data.data);
      setMetas(prev => ({ ...prev, faculties: { current_page: data.current_page, last_page: data.last_page } }));
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }

  async function fetchMajors(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/majors?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setMajors(data.data);
      setMetas(prev => ({ ...prev, majors: { current_page: data.current_page, last_page: data.last_page } }));
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }
  async function fetchSubjects(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/subjects?page=${page}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubjects(data.data);
      setMetas(prev => ({ ...prev, subjects: { current_page: data.current_page, last_page: data.last_page } }));
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }

  const [showModal, setShowModal] = useState(false);
  const [modalType, setModalType] = useState("");
  const [editItem, setEditItem] = useState(null);
  const [formName, setFormName] = useState("");
  const [formField, setFormField] = useState("");
  const [formFaculty, setFormFaculty] = useState("");
  const [formCity, setFormCity] = useState("");
  const [formActive, setFormActive] = useState(true);
  const [formType, setFormType] = useState(t("جامعة"));
  const [formCode, setFormCode] = useState("");
  const [formIconKey, setFormIconKey] = useState("General");
  const [toast, setToast] = useState(null);

  function showToast(msg, color = C.green) { setToast({ msg, color }); setTimeout(() => setToast(null), 2800); }
  function openAdd(type) {
    setModalType(type);
    setEditItem(null);
    setFormName("");
    setFormField(fields[0]?.id || "");
    setFormFaculty(faculties[0]?.id || "");
    setFormCity("");
    setFormActive(true);
    setFormIconKey("General");
    setFormType(t("جامعة"));
    setFormCode("");
    if (type === "subjects") setFormFaculty(majors[0]?.id || "");
    setShowModal(true);
  }
  function openEdit(type, item) {
    setModalType(type);
    setEditItem(item);
    setFormName(item.name);
    setFormField(item.field_id || (fields.find(f => f.name === item.field)?.id) || "");
    if (type === "subjects") setFormFaculty(item.major_id || (majors.find(m => m.name === item.major)?.id) || "");
    else setFormFaculty(item.college_id || item.university_id || (faculties.find(f => f.name === item.faculty)?.id) || "");
    setFormCity(item.city || "");
    setFormActive(isActive(item));
    setFormIconKey(item.icon_key || item.iconKey || "General");
    setFormType(uType(item));
    setFormCode(item.code || "");
    setShowModal(true);
  }
  const isActive = (u) => u.is_free ?? (u.is_active ?? u.active ?? true);
  const uType = (u) => {
    if (typeof u.type === 'number') {
      return u.type === 1 ? t("جامعة") : (u.type === 2 ? t("كلية") : t("معهد"));
    }
    return u.type || t("جامعة");
  };
  async function deleteItem(type, id) {
    const apiType = type === "faculties" ? "colleges" : type;
    if (["universities", "fields", "faculties", "majors", "subjects"].includes(type)) {
      try {
        const res = await fetch(`${apiUrl}/api/admin/academic/${apiType}/${id}`, {
          method: 'DELETE',
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (!res.ok) throw new Error();
        const setters = { universities: setUniversities, fields: setFields, faculties: setFaculties, majors: setMajors, subjects: setSubjects };
        setters[type](arr => arr.filter(x => x.id !== id));
        showToast(t("تم الحذف"), C.red);
      } catch (e) {
        showToast(t("فشل الحذف"), C.red);
      }
      return;
    }
    const setters = { universities: setUniversities, faculties: setFaculties, fields: setFields, majors: setMajors, subjects: setSubjects };
    setters[type](arr => arr.filter(x => x.id !== id)); showToast(t("تم الحذف"), C.red);
  }

  async function saveModal() {
    if (!formName.trim()) return;

    if (["universities", "fields", "faculties", "majors", "subjects"].includes(modalType)) {
      setLoading(true);
      try {
        let payload = { name: formName };
        const apiType = modalType === "faculties" ? "colleges" : modalType;

        if (modalType === "universities") {
          const typeMap = { [t("جامعة")]: 1, [t("كلية")]: 2, [t("معهد")]: 3 };
          payload = { ...payload, type: typeMap[formType] || 1, city: formCity, is_active: formActive };
        } else if (modalType === "fields") {
          payload = { ...payload, icon_key: formIconKey, color_hex: "#3B5BDB" }; 
        } else if (modalType === "faculties") {
          payload = { ...payload, field_id: formField }; // field_id from formField, NO university_id
        } else if (modalType === "majors") {
          payload = { ...payload, college_id: formFaculty, field_id: formField, is_active: formActive };
        } else if (modalType === "subjects") {
          payload = { ...payload, code: formCode, major_id: formFaculty, is_free: formActive };
        }

        const url = editItem 
          ? `${apiUrl}/api/admin/academic/${apiType}/${editItem.id}`
          : `${apiUrl}/api/admin/academic/${apiType}`;
        
        const res = await fetch(url, {
          method: editItem ? 'PUT' : 'POST',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify(payload)
        });

        const data = await res.json();
        if (!res.ok) {
          if (res.status === 422 && data.errors) {
            const firstError = Object.values(data.errors)[0][0];
            let msg = t("فشل الحفظ");
            if (firstError.includes("has already been taken")) msg = t("هذا الاسم أو الكود مسجل مسبقاً لهذا النطاق");
            else if (firstError.includes("is required")) msg = t("هذا الحقل مطلوب");
            showToast(msg, C.red);
          } else {
            showToast(t("فشل الحفظ"), C.red);
          }
          return;
        }

        const setters = { universities: setUniversities, fields: setFields, faculties: setFaculties, majors: setMajors, subjects: setSubjects };
        const setter = setters[modalType];
        if (editItem) {
          setter(arr => arr.map(x => x.id === editItem.id ? data : x));
          showToast(t("تم التعديل"));
        } else {
          setter(arr => [data, ...arr]);
          showToast(t("تمت الإضافة"));
        }
        setShowModal(false);
      } catch (e) {
        showToast(t("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً"), C.red);
      } finally {
        setLoading(false);
      }
      return;
    }

    const setters = { universities: setUniversities, faculties: setFaculties, fields: setFields, majors: setMajors, subjects: setSubjects };
    if (editItem) { setters[modalType](arr => arr.map(x => x.id === editItem.id ? { ...x, name: formName, field: formField, faculty: formFaculty, city: formCity, active: formActive, iconKey: formIconKey, type: formType, code: formCode, major: formField } : x)); showToast(t("تم التعديل")); }
    else { setters[modalType](arr => [{ id: Date.now(), name: formName, field: formField, faculty: formFaculty, city: formCity, active: formActive, iconKey: formIconKey, type: formType, code: formCode, major: formField, majors: 0, faculties: 0, free: true }, ...arr]); showToast(t("تمت الإضافة")); }
    setShowModal(false);
  }

  const tabs = [
    { id: "universities", label: t("الجامعات"), singular: t("جامعة"), icon: <PiBankDuotone />, count: universities.length },
    { id: "fields", label: t("المجالات"), singular: t("مجال"), icon: <PiMapTrifoldDuotone />, count: fields.length },
    { id: "faculties", label: t("الكليات"), singular: t("كلية"), icon: <PiGraduationCapDuotone />, count: faculties.length },
    { id: "majors", label: t("التخصصات"), singular: t("تخصص"), icon: <PiBooksDuotone />, count: majors.length },
    { id: "subjects", label: t("المواد"), singular: t("مادة"), icon: <PiBookOpenDuotone />, count: subjects.length },
  ];

  const TH = ({ children }) => <th style={{ padding: "10px 16px", textAlign: "start", fontWeight: 700, color: C.muted, fontSize: "0.8rem", background: C.bg, borderBottom: `2px solid ${C.border}` }}>{children}</th>;
  const TD = ({ children, bold }) => <td style={{ padding: "13px 16px", color: bold ? C.dark : C.body, fontWeight: bold ? 600 : 400, borderBottom: `1px solid ${C.border}` }}>{children}</td>;

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 999, borderRight: `4px solid ${toast.color}` }}>{toast.msg}</div>}
      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.4)", zIndex: 500, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <div style={{ background: C.white, borderRadius: 16, padding: "32px 36px", width: 440, boxShadow: "0 24px 64px rgba(0,0,0,0.18)" }}>
            <h3 style={{ fontWeight: 700, color: C.dark, margin: "0 0 20px" }}>{editItem ? t("تعديل") : t("إضافة")} — {tabs.find(t => t.id === modalType)?.singular || tabs.find(t => t.id === modalType)?.label}</h3>
            <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("الاسم")}</label>
            <input value={formName} onChange={e => setFormName(e.target.value)} onKeyDown={e => e.key === "Enter" && saveModal()} placeholder={t("أدخل الاسم...")} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 20 }} autoFocus />

            {modalType === "universities" && (
              <>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("النوع")}</label>
                <select value={formType} onChange={e => setFormType(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", background: C.white, marginBottom: 20 }}>
                  <option value={t("جامعة")}>{t("جامعة")}</option>
                  <option value={t("كلية")}>{t("كلية")}</option>
                  <option value={t("معهد")}>{t("معهد")}</option>
                </select>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("المدينة")}</label>
                <input value={formCity} onChange={e => setFormCity(e.target.value)} placeholder={t("اسم المدينة...")} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 20 }}>
                  <input type="checkbox" checked={formActive} onChange={e => setFormActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.blue }} />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.dark }}>{t("نشطة / مفعلة")}</span>
                </label>
              </>
            )}

            {(modalType === "faculties" || modalType === "majors") && (
              <>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("المجال")}</label>
                <select value={formField} onChange={e => setFormField(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", background: C.white, marginBottom: 20 }}>
                  <option value="">{t("اختر المجال...")}</option>
                  {fields.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                </select>
                {modalType === "faculties" && <div style={{ marginBottom: 20 }}></div>}
                {modalType === "majors" && (
                  <>
                    <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("الكلية")}</label>
                    <select value={formFaculty} onChange={e => setFormFaculty(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", background: C.white, marginBottom: 20 }}>
                      <option value="">{t("اختر الكلية...")}</option>
                      {faculties.map(f => <option key={f.id} value={f.id}>{f.name}</option>)}
                    </select>
                  </>
                )}
              </>
            )}

            {modalType === "subjects" && (
              <>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("الكود")}</label>
                <input value={formCode} onChange={e => setFormCode(e.target.value)} placeholder={t("أدخل كود المادة...")} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", boxSizing: "border-box", marginBottom: 20 }} />
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("التخصص")}</label>
                <select value={formFaculty} onChange={e => setFormFaculty(e.target.value)} style={{ width: "100%", padding: "11px 14px", borderRadius: 9, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", outline: "none", background: C.white, marginBottom: 20 }}>
                  <option value="">{t("اختر التخصص...")}</option>
                  {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                </select>
                <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer", marginBottom: 8 }}>
                  <input type="checkbox" checked={formActive} onChange={e => setFormActive(e.target.checked)} style={{ width: 18, height: 18, accentColor: C.blue }} />
                  <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.dark }}>{t("مادة متطلب (تظهر للجميع مجاناً)")}</span>
                </label>
                <p style={{ fontSize: "0.78rem", color: C.muted, marginBottom: 20 }}>*{t("ملاحظة: المواد المتطلب تظهر مجانية لجميع الطلاب، بينما التخصصية تكون مدفوعة.")}</p>
              </>
            )}

            {modalType === "fields" && (
              <>
                <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("الأيقونة")}</label>
                <div style={{ display: "grid", gridTemplateColumns: "repeat(6, 1fr)", gap: 8, marginBottom: 20 }}>
                  {Object.keys(AVAILABLE_ICONS).map(k => (
                    <div key={k} onClick={() => setFormIconKey(k)} style={{ height: 44, borderRadius: 8, border: `2px solid ${formIconKey === k ? C.blue : C.border}`, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", fontSize: "1.2rem", color: formIconKey === k ? C.blue : C.muted, background: formIconKey === k ? C.blueLight : C.white }}>
                      {AVAILABLE_ICONS[k]}
                    </div>
                  ))}
                </div>
              </>
            )}
            <div style={{ display: "flex", gap: 12, justifyContent: "flex-end" }}><Btn variant="secondary" onClick={() => setShowModal(false)}>{t("إلغاء")}</Btn><Btn onClick={saveModal}>{editItem ? (t("حفظ التعديل")) : (t("إضافة"))}</Btn></div>
          </div>
        </div>
      )}

      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 28 }}>
        <div><h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إدارة التخصصات")}</h1><p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("إدارة الجامعات والكليات والمجالات والتخصصات والمواد")}</p></div>
        <Btn onClick={() => openAdd(tab)}>{t("+ إضافة ")}{tabs.find(t => t.id === tab)?.singular}</Btn>
      </div>

      <div className="admin-tabs" style={{ display: "flex", gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 24, overflowX: 'auto' }}>
        {tabs.map(({ id, label, icon, count }) => (
          <div key={id} onClick={() => setTab(id)} style={{ padding: "10px 22px", cursor: "pointer", fontWeight: tab === id ? 700 : 400, color: tab === id ? C.blue : C.muted, borderBottom: `2px solid ${tab === id ? C.blue : "transparent"}`, marginBottom: -1, fontSize: "0.9rem", transition: "all .2s", display: "flex", alignItems: "center", gap: 7, flexShrink: 0, whiteSpace: 'nowrap' }}>
            <span>{icon}</span>{label}<span className="tab-count" style={{ background: tab === id ? C.blue : C.border, color: tab === id ? C.white : C.muted, borderRadius: 10, padding: "1px 8px", fontSize: "0.72rem", fontWeight: 700 }}>{count}</span>
          </div>
        ))}
      </div>

      {tab === "universities" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr>
                  <TH>{t("الاسم")}</TH>
                  <TH>{t("النوع")}</TH>
                  <TH>{t("المدينة")}</TH>
                  <TH>{t("الحالة")}</TH>
                  <TH>{t("إجراءات")}</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><TD><Skeleton width="140px" /></TD><TD><Skeleton width="80px" /></TD><TD><Skeleton width="100px" /></TD><TD><Skeleton width="60px" height="22px" borderRadius="12px" /></TD><TD><div style={{ display: "flex", gap: 8 }}><Skeleton width="60px" height="30px" /><Skeleton width="60px" height="30px" /></div></TD></tr>
                  ))
                ) : universities.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: 30, textAlign: 'center', color: C.muted }}>{t("لا توجد جامعات مسجلة")}</td></tr>
                ) : universities.map(u => {
                  const typeLabel = u.type === 1 ? t("جامعة") : (u.type === 2 ? t("كلية") : t("معهد"));
                  const isActive = u.is_active ?? u.active;
                  return (
                    <tr key={u.id}>
                      <TD bold>{u.name}</TD>
                      <TD>{typeLabel}</TD>
                      <TD>{u.city}</TD>
                      <TD>
                        <span style={{ background: isActive ? C.greenBg : C.redBg, color: isActive ? C.green : C.red, borderRadius: 12, padding: "3px 10px", fontSize: "0.76rem", fontWeight: 700 }}>
                          {isActive ? t("نشطة") : t("موقوفة")}
                        </span>
                      </TD>
                      <TD>
                        <div style={{ display: "flex", gap: 8 }}>
                          <Btn variant="ghost" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => openEdit("universities", u)}>{t("تعديل")}</Btn>
                          <Btn variant="danger" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => deleteItem("universities", u.id)}>{t("حذف")}</Btn>
                        </div>
                      </TD>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <Pagination meta={metas.universities} onPageChange={fetchUniversities} />
        </Card>
      )}
      {tab === "faculties" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr>
                  <TH>{t("الكلية")}</TH>
                  <TH>{t("المجال")}</TH>
                  <TH>{t("إجراءات")}</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><TD><Skeleton width="140px" /></TD><TD><Skeleton width="120px" /></TD><TD><div style={{ display: "flex", gap: 8 }}><Skeleton width="60px" height="30px" /><Skeleton width="60px" height="30px" /></div></TD></tr>
                  ))
                ) : faculties.length === 0 ? (
                  <tr><td colSpan="3" style={{ padding: 30, textAlign: 'center', color: C.muted }}>{t("لا توجد كليات مسجلة")}</td></tr>
                ) : faculties.map(f => (
                  <tr key={f.id}>
                    <TD bold>{f.name}</TD>
                    <TD>{f.field?.name || t("غير محدد")}</TD>
                    <TD>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="ghost" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => openEdit("faculties", f)}>{t("تعديل")}</Btn>
                        <Btn variant="danger" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => deleteItem("faculties", f.id)}>{t("حذف")}</Btn>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={metas.faculties} onPageChange={fetchColleges} />
        </Card>
      )}
      {tab === "fields" && (
        <>
          {loading ? (
            <div style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
              {Array(6).fill(0).map((_, i) => (
                <Card key={i} style={{ padding: "22px 24px" }} hover={false}>
                  <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                    <Skeleton width="48px" height="48px" borderRadius="12px" />
                    <div style={{ display: "flex", gap: 8 }}>
                      <Skeleton width="50px" height="30px" />
                      <Skeleton width="50px" height="30px" />
                    </div>
                  </div>
                  <Skeleton width="180px" height="18px" margin="0 0 8px" />
                  <Skeleton width="100px" height="14px" />
                </Card>
              ))}
            </div>
          ) : (
            <>
              <div className="admin-fields-grid" style={{ display: "grid", gridTemplateColumns: "repeat(3,1fr)", gap: 18 }}>
                {fields.map(f => (
                  <Card key={f.id} style={{ padding: "22px 24px" }}>
                    <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 12 }}>
                      <div style={{ 
                        width: 48, 
                        height: 48, 
                        borderRadius: 12, 
                        background: (f.color_hex || f.color || "#3B5BDB") + "18", 
                        display: "flex", 
                        alignItems: "center", 
                        justifyContent: "center", 
                        color: f.color_hex || f.color || "#3B5BDB", 
                        fontSize: "1.5rem" 
                      }}>
                        {AVAILABLE_ICONS[f.icon_key || f.iconKey] || AVAILABLE_ICONS.General}
                      </div>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="ghost" style={{ fontSize: "0.76rem", padding: "5px 10px" }} onClick={() => openEdit("fields", f)}>{t("تعديل")}</Btn>
                        <Btn variant="danger" style={{ fontSize: "0.76rem", padding: "5px 10px" }} onClick={() => deleteItem("fields", f.id)}>{t("حذف")}</Btn>
                      </div>
                    </div>
                    <div style={{ fontWeight: 700, color: C.dark, marginBottom: 4 }}>{f.name}</div>
                    <div style={{ color: C.muted, fontSize: "0.8rem" }}>{f.majors_count || f.majors || 0} {t("تخصصات")}</div>
                  </Card>
                ))}
              </div>
              {fields.length === 0 && <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>{t("لا توجد مجالات مسجلة")}</div>}
              <Pagination meta={metas.fields} onPageChange={fetchFields} />
            </>
          )}
        </>
      )}
      {tab === "majors" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr>
                  <TH>{t("التخصص")}</TH>
                  <TH>{t("الكلية")}</TH>
                  <TH>{t("المجال")}</TH>
                  <TH>{t("إجراءات")}</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><TD><Skeleton width="140px" /></TD><TD><Skeleton width="120px" /></TD><TD><Skeleton width="100px" /></TD><TD><div style={{ display: "flex", gap: 8 }}><Skeleton width="60px" height="30px" /><Skeleton width="60px" height="30px" /></div></TD></tr>
                  ))
                ) : majors.length === 0 ? (
                  <tr><td colSpan="4" style={{ padding: 30, textAlign: 'center', color: C.muted }}>{t("لا توجد تخصصات مسجلة")}</td></tr>
                ) : majors.map(m => (
                  <tr key={m.id}>
                    <TD bold>{m.name}</TD>
                    <TD>{m.college?.name || t("غير محدد")}</TD>
                    <TD>{m.field?.name || t("غير محدد")}</TD>
                    <TD>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="secondary" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => setPage("admin-major-details", m.id)}>{t("التفاصيل")}</Btn>
                        <Btn variant="ghost" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => openEdit("majors", m)}>{t("تعديل")}</Btn>
                        <Btn variant="danger" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => deleteItem("majors", m.id)}>{t("حذف")}</Btn>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={metas.majors} onPageChange={fetchMajors} />
        </Card>
      )}
      {tab === "subjects" && (
        <Card style={{ padding: 0, overflow: "hidden" }}>
          <div style={{ overflowX: "auto" }}>
            <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
              <thead>
                <tr>
                  <TH>{t("المادة")}</TH>
                  <TH>{t("الكود")}</TH>
                  <TH>{t("التخصص")}</TH>
                  <TH>{t("نوع المادة")}</TH>
                  <TH>{t("إجراءات")}</TH>
                </tr>
              </thead>
              <tbody>
                {loading ? (
                  Array(5).fill(0).map((_, i) => (
                    <tr key={i}><TD><Skeleton width="140px" /></TD><TD><Skeleton width="60px" height="20px" /></TD><TD><Skeleton width="120px" /></TD><TD><Skeleton width="70px" height="22px" borderRadius="12px" /></TD><TD><div style={{ display: "flex", gap: 8 }}><Skeleton width="60px" height="30px" /><Skeleton width="60px" height="30px" /></div></TD></tr>
                  ))
                ) : subjects.length === 0 ? (
                  <tr><td colSpan="5" style={{ padding: 30, textAlign: 'center', color: C.muted }}>{t("لا توجد مواد مسجلة")}</td></tr>
                ) : subjects.map(s => (
                  <tr key={s.id}>
                    <TD bold>{s.name}</TD>
                    <TD><code style={{ background: C.bg, padding: "2px 8px", borderRadius: 5, fontSize: "0.82rem", fontFamily: "monospace" }}>{s.code || "---"}</code></TD>
                    <TD>{s.major?.name || t("غير محدد")}</TD>
                    <TD>
                      <span style={{ 
                        background: (s.is_free ?? s.free) ? C.greenBg : C.goldBg, 
                        color: (s.is_free ?? s.free) ? C.green : C.gold, 
                        borderRadius: 12, 
                        padding: "3px 10px", 
                        fontSize: "0.76rem", 
                        fontWeight: 700 
                      }}>
                        {(s.is_free ?? s.free) ? t("متطلب") : t("تخصصية")}
                      </span>
                    </TD>
                    <TD>
                      <div style={{ display: "flex", gap: 8 }}>
                        <Btn variant="ghost" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => openEdit("subjects", s)}>{t("تعديل")}</Btn>
                        <Btn variant="danger" style={{ fontSize: "0.78rem", padding: "5px 10px" }} onClick={() => deleteItem("subjects", s.id)}>{t("حذف")}</Btn>
                      </div>
                    </TD>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <Pagination meta={metas.subjects} onPageChange={fetchSubjects} />
        </Card>
      )}
    </>
  );
}
