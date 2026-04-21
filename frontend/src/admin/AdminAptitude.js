import React, { useState, useEffect, useContext } from "react";
import { C } from "../tokens";
import { Btn, Card, Badge } from "../components/Common";
import { 
  PiPlusBold, PiTrashDuotone, PiPencilDuotone, 
  PiTextAlignLeftDuotone, PiCheckCircleDuotone, PiXCircleDuotone,
  PiSortAscendingDuotone, PiCheckBold, PiClockClockwiseDuotone
} from "react-icons/pi";
import { LanguageContext } from "../LanguageContext";
import { Pagination, Skeleton } from "../components/Common";
import { getApiUrl } from "../api";

export default function AdminAptitude() {
  const { t } = useContext(LanguageContext);
  const [questions, setQuestions] = useState([]);
  const [test, setTest] = useState(null);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [showModal, setShowModal] = useState(false);
  const [editId, setEditId] = useState(null);
  const [formData, setFormData] = useState({ question_text: "", display_order: 0 });
  const [actionLoading, setActionLoading] = useState(false);
  const [localTimeLimit, setLocalTimeLimit] = useState("");
  const [savingTime, setSavingTime] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/admin/aptitude/questions?page=${page}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setQuestions(data.questions.data);
        setMeta({
          current_page: data.questions.current_page,
          last_page: data.questions.last_page
        });
        setTest({
          ...data.test,
          can_delete_results: data.can_delete_results
        });
        setLocalTimeLimit(data.test.time_limit ?? "");
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const token = localStorage.getItem("elite_token");
      const url = editId 
        ? `${getApiUrl()}/api/admin/aptitude/questions/${editId}`
        : `${getApiUrl()}/api/admin/aptitude/questions`;
      
      const res = await fetch(url, {
        method: editId ? "PUT" : "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(formData)
      });

      if (res.ok) {
        fetchQuestions();
        setShowModal(false);
        setEditId(null);
        setFormData({ question_text: "", display_order: 0 });
      }
    } catch (err) {
      console.error(err);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm(t("هل أنت متأكد من حذف هذا السؤال؟"))) return;
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/admin/aptitude/questions/${id}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) fetchQuestions();
    } catch (err) {
      console.error(err);
    }
  };

  const handleUpdateSettings = async (updates) => {
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/admin/aptitude/update-settings`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Content-Type": "application/json"
        },
        body: JSON.stringify(updates)
      });
      if (res.ok) {
        const data = await res.json();
        setTest({
          ...data,
          can_delete_results: updates.hasOwnProperty('can_delete_results') ? updates.can_delete_results : (test?.can_delete_results ?? true)
        });
        setLocalTimeLimit(data.time_limit ?? "");
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openAdd = () => {
    setEditId(null);
    setFormData({ question_text: "", display_order: questions.length + 1 });
    setShowModal(true);
  };

  const openEdit = (q) => {
    setEditId(q.id);
    setFormData({ question_text: q.question_text, display_order: q.display_order });
    setShowModal(true);
  };

  return (
    <div style={{ direction: "rtl" }}>
      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32 }}>
        <div>
          <h1 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, marginBottom: 8 }}>{t("إدارة اختبار الميول")}</h1>
          <p style={{ color: C.muted, fontSize: "0.92rem" }}>{t("هنا يمكنك التحكم في أسئلة اختبار تحديد الميول والاهتمامات.")}</p>
        </div>
        <div className="admin-aptitude-actions" style={{ display: "flex", gap: 12 }}>
          {test && (
            <div style={{ display: "flex", alignItems: "center", gap: 10, background: C.white, padding: "4px 8px 4px 14px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <span style={{ fontSize: "0.82rem", fontWeight: 700, color: C.muted }}>{t("مدة الاختبار (دقائق):")}</span>
              <input 
                type="number" 
                value={localTimeLimit} 
                onChange={(e) => setLocalTimeLimit(e.target.value)}
                placeholder={t("غير محدود")}
                min="0"
                style={{ width: 60, border: "none", background: C.bg, padding: "6px 8px", borderRadius: 8, fontSize: "0.85rem", fontWeight: 800, color: C.blue, textAlign: "center" }}
              />
              <button 
                onClick={() => {
                  setSavingTime(true);
                  handleUpdateSettings({ time_limit: localTimeLimit === "" ? null : parseInt(localTimeLimit) })
                    .finally(() => setTimeout(() => setSavingTime(false), 1000));
                }}
                disabled={savingTime}
                style={{ width: 32, height: 32, borderRadius: 8, border: "none", background: savingTime ? C.green : C.blue, color: C.white, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .3s" }}
                title={t("حفظ التوقيت")}
              >
                {savingTime ? <PiCheckBold size={16} /> : <PiClockClockwiseDuotone size={18} />}
              </button>
            </div>
          )}
          {test && (
            <Btn variant={test.is_active ? "secondary" : "primary"} onClick={() => handleUpdateSettings({ is_active: !test.is_active })} style={{ display: "flex", alignItems: "center", gap: 8, color: test.is_active ? C.red : C.green, background: test.is_active ? "#FEF2F2" : "#F0FDF4", border: "none" }}>
              {test.is_active ? <><PiXCircleDuotone size={18}/> {t("تعطيل الاختبار")}</> : <><PiCheckCircleDuotone size={18}/> {t("تفعيل الاختبار")}</>}
            </Btn>
          )}
          {test && (
            <label style={{ display: "flex", alignItems: "center", gap: 8, background: C.white, padding: "0 16px", borderRadius: 12, border: `1px solid ${C.border}`, cursor: "pointer", userSelect: "none" }}>
              <input 
                type="checkbox" 
                checked={test.can_delete_results === false} 
                onChange={(e) => handleUpdateSettings({ can_delete_results: !e.target.checked })}
                style={{ cursor: "pointer" }}
              />
              <span style={{ fontSize: "0.85rem", fontWeight: 700, color: C.muted }}>{t("إخفاء زر إعادة محاولة اختبار تحديد الميول")}</span>
            </label>
          )}
          <Btn onClick={openAdd} style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <PiPlusBold size={18} />
            {t("إضافة سؤال جديد")}
          </Btn>
        </div>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", textAlign: "right" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                <th style={{ padding: "16px 24px", color: C.muted, fontSize: "0.82rem", fontWeight: 700 }}>{t("الترتيب")}</th>
                <th style={{ padding: "16px 24px", color: C.muted, fontSize: "0.82rem", fontWeight: 700 }}>{t("نص السؤال")}</th>
                <th style={{ padding: "16px 24px", color: C.muted, fontSize: "0.82rem", fontWeight: 700, textAlign: "center" }}>{t("الإجراءات")}</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "18px 24px" }}><Skeleton width="40px" height="24px" borderRadius="12px" /></td>
                    <td style={{ padding: "18px 24px" }}><Skeleton width="70%" height="18px" /></td>
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <Skeleton width="34px" height="34px" borderRadius="8px" />
                        <Skeleton width="34px" height="34px" borderRadius="8px" />
                      </div>
                    </td>
                  </tr>
                ))
              ) : questions.length === 0 ? (
                <tr><td colSpan="3" style={{ padding: 40, textAlign: "center", color: C.muted }}>{t("لا توجد أسئلة مضافة حالياً")}</td></tr>
              ) : (
                questions.map((q, idx) => (
                  <tr key={q.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#F8FAFC"} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                    <td style={{ padding: "18px 24px" }}>
                      <Badge color={C.blueLight} style={{ color: C.blue, fontWeight: 800 }}>{q.display_order}</Badge>
                    </td>
                    <td style={{ padding: "18px 24px", fontWeight: 500, color: C.dark }}>{q.question_text}</td>
                    <td style={{ padding: "18px 24px" }}>
                      <div style={{ display: "flex", gap: 10, justifyContent: "center" }}>
                        <button onClick={() => openEdit(q)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: C.bg, color: C.blue, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = C.blueLight} onMouseLeave={e => e.currentTarget.style.background = C.bg} title={t("تعديل")}>
                          <PiPencilDuotone size={18} />
                        </button>
                        <button onClick={() => handleDelete(q.id)} style={{ width: 34, height: 34, borderRadius: 8, border: "none", background: C.bg, color: C.red, display: "flex", alignItems: "center", justifyContent: "center", cursor: "pointer", transition: "all .2s" }} onMouseEnter={e => e.currentTarget.style.background = "#FEF2F2"} onMouseLeave={e => e.currentTarget.style.background = C.bg} title={t("حذف")}>
                          <PiTrashDuotone size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {!loading && questions.length > 0 && (
        <Pagination meta={meta} onPageChange={fetchQuestions} />
      )}

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", display: "flex", alignItems: "center", justifyContent: "center", zIndex: 1000, padding: 20 }}>
          <div style={{ background: C.white, width: 500, borderRadius: 20, padding: 32, boxShadow: "0 20px 25px -5px rgba(0,0,0,0.1)" }}>
            <h3 style={{ fontSize: "1.25rem", fontWeight: 800, color: C.dark, marginBottom: 24 }}>{editId ? t("تعديل السؤال") : t("إضافة سؤال جديد")}</h3>
            <form onSubmit={handleSubmit}>
              <div style={{ marginBottom: 20 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("نص السؤال")}</label>
                <textarea 
                  required 
                  value={formData.question_text} 
                  onChange={e => setFormData({ ...formData, question_text: e.target.value })} 
                  style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: "0.95rem", minHeight: 100, fontFamily: "inherit" }} 
                  placeholder={t("اكتب نص السؤال هنا...")}
                />
              </div>
              <div style={{ marginBottom: 32 }}>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("الترتيب")}</label>
                <div style={{ position: "relative" }}>
                  <input 
                    type="number" 
                    value={formData.display_order} 
                    onChange={e => setFormData({ ...formData, display_order: e.target.value })} 
                    style={{ width: "100%", padding: "12px 16px 12px 40px", borderRadius: 12, border: `1.5px solid ${C.border}`, background: C.bg, fontSize: "0.95rem" }} 
                  />
                  <PiSortAscendingDuotone style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", color: C.muted }} size={20} />
                </div>
              </div>

              <div style={{ display: "flex", gap: 12 }}>
                <Btn style={{ flex: 1 }} disabled={actionLoading}>
                  {actionLoading ? t("جاري الحفظ...") : t("حفظ السؤال")}
                </Btn>
                <Btn variant="secondary" type="button" onClick={() => setShowModal(false)} style={{ flex: 1 }}>{t("إلغاء")}</Btn>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
