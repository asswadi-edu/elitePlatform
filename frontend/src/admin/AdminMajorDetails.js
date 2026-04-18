import React, { useState, useEffect, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Card, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { 
  PiBooksDuotone, PiInfoDuotone, PiGraduationCapDuotone, 
  PiClockDuotone, PiUserFocusDuotone, PiBookOpenDuotone,
  PiBriefcaseDuotone, PiCheckBold, PiPlusBold, PiTrashBold,
  PiTargetDuotone, PiTimerDuotone
} from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminMajorDetails({ setPage, selectedId = null }) {
  const { t } = useContext(LanguageContext);
  const [majors, setMajors] = useState([]);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    description: "",
    job_title: [],
    image_url: "",
    duration: "",
    degree_type: "",
    study_nature: "",
    core_subjects: [],
    required_skills: [],
    careers: []
  });

  const [newSubject, setNewSubject] = useState("");
  const [newSkill, setNewSkill] = useState("");
  const [newCareer, setNewCareer] = useState("");
  const [newTitle, setNewTitle] = useState("");
  const [uploading, setUploading] = useState(false);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchMajors();
  }, []);

  async function fetchMajors() {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/majors?per_page=100`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setMajors(data.data);
        if (selectedId) {
          const found = data.data.find(m => m.id === parseInt(selectedId));
          if (found) loadMajor(found);
        }
      }
    } catch (err) {
      showToast(t("فشل تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }

  function loadMajor(m) {
    setSelectedMajor(m);
    setFormData({
      description: m.description || "",
      job_title: m.job_title || [],
      image_url: m.image_url || "",
      duration: m.duration || "",
      degree_type: m.degree_type || "",
      study_nature: m.study_nature || "",
      core_subjects: m.core_subjects || [],
      required_skills: m.required_skills || [],
      careers: m.careers || []
    });
  }

  function showToast(msg, color = C.green) {
    setToast({ msg, color });
    setTimeout(() => setToast(null), 3000);
  }

  async function handleSave() {
    if (!selectedMajor) return;
    setSaving(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/majors/${selectedMajor.id}`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify(formData)
      });
      if (res.ok) {
        showToast(t("تم حفظ المعلومات بنجاح"));
        const updated = await res.json();
        setMajors(prev => prev.map(m => m.id === updated.id ? updated : m));
      } else {
        showToast(t("فشل الحفظ"), C.red);
      }
    } catch (err) {
      showToast(t("خطأ في الاتصال"), C.red);
    } finally {
      setSaving(false);
    }
  }

  async function handleImageUpload(e) {
    const file = e.target.files[0];
    if (!file || !selectedMajor) return;

    setUploading(true);
    const data = new FormData();
    data.append('image', file);

    try {
      const res = await fetch(`${apiUrl}/api/admin/academic/majors/${selectedMajor.id}/upload-image`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        },
        body: data
      });
      if (res.ok) {
        const result = await res.json();
        setFormData(prev => ({ ...prev, image_url: result.image_url }));
        showToast(t("تم رفع الصورة بنجاح"));
      } else {
        showToast(t("فشل رفع الصورة"), C.red);
      }
    } catch (err) {
      showToast(t("خطأ في الاتصال"), C.red);
    } finally {
      setUploading(false);
    }
  }

  const addItem = (listKey, value, setValue) => {
    if (!value.trim()) return;
    setFormData(prev => ({ ...prev, [listKey]: [...prev[listKey], value.trim()] }));
    setValue("");
  };

  const removeItem = (listKey, index) => {
    setFormData(prev => ({ ...prev, [listKey]: prev[listKey].filter((_, i) => i !== index) }));
  };

  return (
    <>
      <div style={{ direction: "rtl", paddingBottom: 60 }}>
        {toast && <div style={{ position: "fixed", top: 80, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 999, borderRight: `4px solid ${toast.color}` }}>{toast.msg}</div>}
        
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
          <div>
            <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, marginBottom: 8 }}>{t("نبذة عن التخصصات")}</h1>
            <p style={{ color: C.muted, fontSize: "0.92rem" }}>{t("إدارة المعلومات التفصيلية لكل تخصص ليطلع عليها الطلاب.")}</p>
          </div>
          <Btn onClick={() => setPage("admin-majors")} variant="secondary">{t("العودة للتخصصات")}</Btn>
        </div>

        <div style={{ display: "grid", gridTemplateColumns: "300px 1fr", gap: 24, alignItems: "start" }}>
          {/* Sidebar: Major List */}
          <Card style={{ padding: 0 }}>
            <div style={{ padding: "16px 20px", borderBottom: `1px solid ${C.border}`, fontWeight: 800, color: C.dark, fontSize: "0.95rem", display: "flex", alignItems: "center", gap: 10 }}>
              <PiBooksDuotone size={20} color={C.blue} />
              {t("قائمة التخصصات")}
            </div>
            <div style={{ maxHeight: "70vh", overflowY: "auto", padding: 8 }}>
              {loading ? (
                Array(6).fill(0).map((_, i) => <Skeleton key={i} height="44px" margin="4px 0" borderRadius="8px" />)
              ) : (
                majors.map(m => (
                  <div 
                    key={m.id} 
                    onClick={() => loadMajor(m)}
                    style={{ 
                      padding: "12px 14px", 
                      borderRadius: 10, 
                      cursor: "pointer", 
                      fontSize: "0.88rem", 
                      fontWeight: selectedMajor?.id === m.id ? 700 : 500,
                      color: selectedMajor?.id === m.id ? C.blue : C.body,
                      background: selectedMajor?.id === m.id ? C.blueLight : "transparent",
                      transition: "all .2s",
                      marginBottom: 4
                    }}
                  >
                    {m.name}
                    <div style={{ fontSize: "0.7rem", color: C.muted, fontWeight: 400 }}>{m.college?.name}</div>
                  </div>
                ))
              )}
            </div>
          </Card>

          {/* Main: Details Form */}
          {selectedMajor ? (
            <div style={{ display: "flex", flexDirection: "column", gap: 24 }}>
              <Card>
                <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 24 }}>
                  <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                    <div style={{ width: 54, height: 54, borderRadius: 12, background: C.blueLight, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.2rem", overflow: "hidden" }}>
                      {formData.image_url ? <img src={formData.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} /> : <PiInfoDuotone />}
                    </div>
                    <div>
                      <h2 style={{ fontSize: "1.2rem", fontWeight: 800, color: C.dark }}>{selectedMajor.name}</h2>
                      <span style={{ fontSize: "0.8rem", color: C.muted }}>{selectedMajor.field?.name} / {selectedMajor.college?.name}</span>
                    </div>
                  </div>
                  <Btn onClick={handleSave} disabled={saving} style={{ padding: "10px 24px" }}>
                    {saving ? t("جاري الحفظ...") : <><PiCheckBold style={{ marginLeft: 8 }} /> {t("حفظ المعلومات")}</>}
                  </Btn>
                </div>

                <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                  {/* Definition */}
                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: C.dark, marginBottom: 8 }}>{t("تعريف التخصص")}</label>
                    <textarea 
                      value={formData.description} 
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      placeholder={t("اكتب نبذة مختصرة عن التخصص والشغف الذي يتطلبه...")}
                      style={{ width: "100%", padding: 14, borderRadius: 12, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", fontFamily: "inherit", minHeight: 120, outline: "none", resize: "vertical" }}
                    />
                  </div>

                  {/* Image Upload */}
                  <div style={{ gridColumn: "span 2", background: C.bg, padding: 20, borderRadius: 16, border: `1px solid ${C.border}` }}>
                    <label style={{ display: "block", fontWeight: 800, fontSize: "0.9rem", color: C.dark, marginBottom: 16 }}>{t("صورة أو أيقونة التخصص")}</label>
                    <div style={{ display: "flex", alignItems: "center", gap: 20 }}>
                       <div style={{ width: 80, height: 80, borderRadius: 16, background: C.white, border: `2px dashed ${C.border}`, display: "flex", alignItems: "center", justifyContent: "center", overflow: "hidden" }}>
                         {formData.image_url ? (
                           <img src={formData.image_url} alt="" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
                         ) : (
                           <PiPlusBold size={24} color={C.muted} style={{ opacity: 0.3 }} />
                         )}
                       </div>
                       <div style={{ flex: 1 }}>
                         <p style={{ fontSize: "0.84rem", color: C.muted, marginBottom: 12 }}>{t("يمكنك رفع صورة مباشرة من جهازك أو وضع رابط خارجي.")}</p>
                         <div style={{ display: "flex", gap: 10 }}>
                           <label style={{ padding: "8px 16px", borderRadius: 8, background: C.blue, color: C.white, fontSize: "0.85rem", fontWeight: 700, cursor: "pointer", display: "inline-block" }}>
                             {uploading ? t("جاري الرفع...") : t("رفع صورة من الجهاز")}
                             <input type="file" hidden accept="image/*" onChange={handleImageUpload} disabled={uploading} />
                           </label>
                           <input 
                             value={formData.image_url} 
                             onChange={e => setFormData({ ...formData, image_url: e.target.value })}
                             placeholder={t("أو ضع رابط خارجي هنا...")}
                             style={{ flex: 1, padding: "8px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none" }}
                           />
                         </div>
                       </div>
                    </div>
                  </div>

                  {/* Duration & Nature */}
                  <div>
                    <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: C.dark, marginBottom: 8 }}>
                      <PiClockDuotone style={{ marginLeft: 6, verticalAlign: "middle" }} /> {t("مدة الدراسة")}
                    </label>
                    <input 
                      value={formData.duration} 
                      onChange={e => setFormData({ ...formData, duration: e.target.value })}
                      placeholder={t("مثال: 4 سنوات")}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", outline: "none" }}
                    />
                  </div>

                  <div>
                    <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: C.dark, marginBottom: 8 }}>
                      <PiGraduationCapDuotone style={{ marginLeft: 6, verticalAlign: "middle" }} /> {t("نوع الدرجة")}
                    </label>
                    <input 
                      value={formData.degree_type} 
                      onChange={e => setFormData({ ...formData, degree_type: e.target.value })}
                      placeholder={t("مثال: بكالوريوس")}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", outline: "none" }}
                    />
                  </div>

                  <div style={{ gridColumn: "span 2" }}>
                    <label style={{ display: "block", fontWeight: 700, fontSize: "0.88rem", color: C.dark, marginBottom: 8 }}>
                      <PiUserFocusDuotone style={{ marginLeft: 6, verticalAlign: "middle" }} /> {t("طبيعة الدراسة")}
                    </label>
                    <select 
                      value={formData.study_nature} 
                      onChange={e => setFormData({ ...formData, study_nature: e.target.value })}
                      style={{ width: "100%", padding: "11px 14px", borderRadius: 10, border: `1.5px solid ${C.border}`, fontSize: "0.92rem", outline: "none", background: C.white }}
                    >
                      <option value="">{t("اختر...")}</option>
                      <option value="نظري">{t("نظري")}</option>
                      <option value="عملي">{t("عملي")}</option>
                      <option value="نظري وعملي">{t("نظري وعملي")}</option>
                    </select>
                  </div>
                </div>
              </Card>

              {/* Lists: Job Titles, Subjects, Skills, Careers */}
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 24 }}>
                <Card style={{ gridColumn: "span 2" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <PiBriefcaseDuotone color={C.blue} /> {t("المسميات الوظيفية")}
                  </h3>
                  <p style={{ fontSize: "0.82rem", color: C.muted, marginBottom: 12 }}>{t("إضافة المسميات المهنية التي يمكن لخريج هذا التخصص الحصول عليها.")}</p>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input 
                      value={newTitle} 
                      onChange={e => setNewTitle(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addItem("job_title", newTitle, setNewTitle)}
                      placeholder={t("أضف مسمى وظيفي...")}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    <button onClick={() => addItem("job_title", newTitle, setNewTitle)} style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: C.blue, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PiPlusBold /></button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {formData.job_title.map((t, idx) => (
                      <div key={idx} style={{ background: C.blueLight, padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: C.blue, display: "flex", alignItems: "center", gap: 8 }}>
                        {t} <PiTrashBold onClick={() => removeItem("job_title", idx)} style={{ cursor: "pointer", color: C.red }} size={14} />
                      </div>
                    ))}
                    {formData.job_title.length === 0 && <span style={{ color: C.muted, fontSize: "0.8rem" }}>{t("لا توجد مسميات مضافة")}</span>}
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <PiBookOpenDuotone color={C.blue} /> {t("أبرز المواد الدراسية")}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input 
                      value={newSubject} 
                      onChange={e => setNewSubject(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addItem("core_subjects", newSubject, setNewSubject)}
                      placeholder={t("أضف مادة...")}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    <button onClick={() => addItem("core_subjects", newSubject, setNewSubject)} style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: C.blue, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PiPlusBold /></button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {formData.core_subjects.map((s, idx) => (
                      <div key={idx} style={{ background: C.bg, padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: C.dark, display: "flex", alignItems: "center", gap: 8 }}>
                        {s} <PiTrashBold onClick={() => removeItem("core_subjects", idx)} style={{ cursor: "pointer", color: C.red }} size={14} />
                      </div>
                    ))}
                    {formData.core_subjects.length === 0 && <span style={{ color: C.muted, fontSize: "0.8rem" }}>{t("لا توجد مواد مضافة")}</span>}
                  </div>
                </Card>

                <Card>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <PiTargetDuotone color={C.green} /> {t("المهارات المطلوبة")}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input 
                      value={newSkill} 
                      onChange={e => setNewSkill(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addItem("required_skills", newSkill, setNewSkill)}
                      placeholder={t("أضف مهارة...")}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    <button onClick={() => addItem("required_skills", newSkill, setNewSkill)} style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: C.green, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PiPlusBold /></button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {formData.required_skills.map((s, idx) => (
                      <div key={idx} style={{ background: C.greenBg, padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: C.green, display: "flex", alignItems: "center", gap: 8 }}>
                        {s} <PiTrashBold onClick={() => removeItem("required_skills", idx)} style={{ cursor: "pointer", color: C.red }} size={14} />
                      </div>
                    ))}
                    {formData.required_skills.length === 0 && <span style={{ color: C.muted, fontSize: "0.8rem" }}>{t("لا توجد مهارات مضافة")}</span>}
                  </div>
                </Card>

                <Card style={{ gridColumn: "span 2" }}>
                  <h3 style={{ fontSize: "1rem", fontWeight: 800, color: C.dark, marginBottom: 16, display: "flex", alignItems: "center", gap: 8 }}>
                    <PiBriefcaseDuotone color={C.gold} /> {t("مجالات العمل المستقبلية")}
                  </h3>
                  <div style={{ display: "flex", gap: 8, marginBottom: 16 }}>
                    <input 
                      value={newCareer} 
                      onChange={e => setNewCareer(e.target.value)}
                      onKeyDown={e => e.key === "Enter" && addItem("careers", newCareer, setNewCareer)}
                      placeholder={t("أضف مجال عمل...")}
                      style={{ flex: 1, padding: "9px 12px", borderRadius: 8, border: `1.5px solid ${C.border}`, fontSize: "0.85rem", outline: "none" }}
                    />
                    <button onClick={() => addItem("careers", newCareer, setNewCareer)} style={{ width: 38, height: 38, borderRadius: 8, border: "none", background: C.gold, color: C.white, cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center" }}><PiPlusBold /></button>
                  </div>
                  <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                    {formData.careers.map((c, idx) => (
                      <div key={idx} style={{ background: C.goldBg, padding: "6px 12px", borderRadius: 8, fontSize: "0.82rem", fontWeight: 600, color: C.gold, display: "flex", alignItems: "center", gap: 8 }}>
                        {c} <PiTrashBold onClick={() => removeItem("careers", idx)} style={{ cursor: "pointer", color: C.red }} size={14} />
                      </div>
                    ))}
                    {formData.careers.length === 0 && <span style={{ color: C.muted, fontSize: "0.8rem" }}>{t("لا توجد مجالات مضافة")}</span>}
                  </div>
                </Card>
              </div>
            </div>
          ) : (
            <Card style={{ display: "flex", alignItems: "center", justifyContent: "center", minHeight: 400, color: C.muted }}>
              <div style={{ textAlign: "center" }}>
                <PiBooksDuotone size={48} style={{ marginBottom: 16, opacity: 0.2 }} />
                <p>{t("يرجى اختيار تخصص من القائمة الجانبية لبدء إدخال المعلومات")}</p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </>
  );
}
