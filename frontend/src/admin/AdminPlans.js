import React, { useState, useContext, useEffect } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { PiListChecksDuotone, PiPlusCircleDuotone, PiTrashDuotone, PiPencilSimpleDuotone, PiClockDuotone, PiCurrencyCircleDollarDuotone, PiCheckCircleDuotone, PiLightningDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminPlans({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);

  const [showModal, setShowModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [formData, setFormData] = useState({ name: '', price: '', duration_days: '30', color_hex: C.blue, max_ai_tests: '10' });
  const [toast, setToast] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setPlans(data);
      }
    } catch (e) {
      console.error("Fetch plans error", e);
    } finally {
      setLoading(false);
    }
  }

  function showToast(msg, color = C.green) { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }

  async function handleSave() {
    if (!formData.name || !formData.price || !formData.duration_days) {
      showToast(t("يرجى إكمال جميع الحقول"), C.red);
      return;
    }

    const isEdit = !!editingPlan;
    const url = isEdit ? `${apiUrl}/api/admin/subscription-plans/${editingPlan.id}` : `${apiUrl}/api/admin/subscription-plans`;
    const method = isEdit ? 'PUT' : 'POST';

    try {
      const res = await fetch(url, {
        method,
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          price: parseFloat(formData.price),
          duration_days: parseInt(formData.duration_days),
          max_ai_tests: parseInt(formData.max_ai_tests || 0)
        })
      });

      if (res.ok) {
        showToast(isEdit ? t("تم تحديث الخطة بنجاح") : t("تم إضافة الخطة الجديدة بنجاح"));
        fetchPlans();
        closeModal();
      } else {
        const err = await res.json();
        showToast(err.message || t("فشل في حفظ الخطة"), C.red);
      }
    } catch (e) {
      showToast(t("خطأ في الاتصال بالسيرفر"), C.red);
    }
  }

  async function deletePlan(id) {
    if (!window.confirm(t("هل أنت متأكد من حذف هذه الخطة؟"))) return;
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-plans/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setPlans(plans.filter(p => p.id !== id));
        showToast(t("تم حذف الخطة"), C.red);
      } else {
        showToast(t("لا يمكن حذف الخطة لارتباطها باشتراكات حالية"), C.red);
      }
    } catch (e) {
      showToast(t("خطأ في الاتصال"), C.red);
    }
  }

  function openModal(plan = null) {
    if (plan) {
      setEditingPlan(plan);
      setFormData({ 
        name: plan.name, 
        price: plan.price.toString(), 
        duration_days: plan.duration_days.toString(), 
        color_hex: plan.color_hex || plan.color || C.blue,
        max_ai_tests: (plan.max_ai_tests || 0).toString()
      });
    } else {
      setEditingPlan(null);
      setFormData({ name: '', price: '', duration_days: '30', color_hex: C.blue, max_ai_tests: '10' });
    }
    setShowModal(true);
  }

  function closeModal() {
    setShowModal(false);
    setEditingPlan(null);
  }

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 999, borderRight: `4px solid ${toast.color}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}

      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إدارة خطط الاشتراك")}</h1>
          <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("إضافة وتعديل خطط الاشتراك والأسعار المتاحة في المنصة")}</p>
        </div>
        <Btn onClick={() => openModal()} style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <PiPlusCircleDuotone size={20} /> {t("إضافة خطة جديدة")}
        </Btn>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 20 }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => <Card key={i} style={{ height: 200, background: `${C.bg}60`, animate: 'pulse' }} />)
        ) : plans.length === 0 ? (
          <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: 60, color: C.muted }}>{t("لا توجد خطط اشتراك حالياً. ابدأ بإضافة خطة.")}</div>
        ) : plans.map(plan => {
          const pColor = plan.color_hex || C.blue;
          return (
            <Card key={plan.id} style={{ padding: 24, border: `1.5px solid ${pColor}20`, position: 'relative', overflow: 'hidden' }} hover={true}>
              <div style={{ position: 'absolute', top: 0, right: 0, width: 80, height: 80, background: `${pColor}08`, borderRadius: '0 0 0 100%', pointerEvents: 'none' }} />
              
              <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 20 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: `${pColor}15`, color: pColor, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "1.5rem" }}>
                  <PiClockDuotone />
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <button onClick={() => openModal(plan)} style={{ background: 'none', border: 'none', color: C.muted, cursor: 'pointer', padding: 4 }}><PiPencilSimpleDuotone size={18} /></button>
                  <button onClick={() => deletePlan(plan.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer', padding: 4 }}><PiTrashDuotone size={18} /></button>
                </div>
              </div>

              <h3 style={{ fontSize: "1.2rem", fontWeight: 800, color: C.dark, marginBottom: 8 }}>{plan.name}</h3>
              <div style={{ display: "flex", alignItems: "baseline", gap: 6, marginBottom: 16 }}>
                <span style={{ fontSize: "1.8rem", fontWeight: 900, color: pColor }}>{plan.price}</span>
                <span style={{ fontSize: "0.85rem", color: C.muted, fontWeight: 600 }}>{t("ر.ي")}</span>
              </div>

              <div style={{ display: "flex", flexWrap: 'wrap', gap: 12, borderTop: `1px solid ${C.border}`, paddingTop: 16 }}>
                <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.muted, fontSize: "0.82rem" }}>
                  <PiClockDuotone /> {plan.duration_days} {t("يوم")}
                </div>
                {plan.max_ai_tests > 0 && (
                   <div style={{ display: "flex", alignItems: "center", gap: 6, color: C.blue, fontSize: "0.82rem", fontWeight:600 }}>
                      <PiLightningDuotone /> {plan.max_ai_tests} {t("اختبار AI")}
                   </div>
                )}
                <Badge color={pColor} style={{ fontSize: '0.65rem' }}>{t("خطة فعالة")}</Badge>
              </div>
            </Card>
          );
        })}
      </div>

      {showModal && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)' }} onClick={closeModal}>
          <div style={{ background: C.white, borderRadius: 20, width: 450, padding: 32, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.2rem', fontWeight: 800, color: C.dark, marginBottom: 24 }}>{editingPlan ? t("تعديل الخطة") : t("إضافة خطة جديدة")}</h2>
            
            <div style={{ display: "flex", flexDirection: "column", gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.dark, marginBottom:8 }}>{t("اسم الخطة")}</label>
                <input type="text" value={formData.name} onChange={e => setFormData({ ...formData, name: e.target.value })} style={inputStyle} placeholder={t("مثلاً: خطة المتميزين")} />
              </div>
              
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 16 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.dark, marginBottom: 8 }}>{t("السعر (ر.ي)")}</label>
                  <input type="number" value={formData.price} onChange={e => setFormData({ ...formData, price: e.target.value })} style={inputStyle} placeholder="5000" />
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.dark, marginBottom: 8 }}>{t("المدة (بالأيام)")}</label>
                  <input type="number" value={formData.duration_days} onChange={e => setFormData({ ...formData, duration_days: e.target.value })} style={inputStyle} placeholder="30" />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.dark, marginBottom: 8 }}>{t("اختبارات الذكاء الاصطناعي")}</label>
                <input type="number" value={formData.max_ai_tests} onChange={e => setFormData({ ...formData, max_ai_tests: e.target.value })} style={inputStyle} placeholder="10" />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, color: C.dark, marginBottom: 8 }}>{t("لون التمييز")}</label>
                <div style={{ display: "flex", gap: 10 }}>
                  {[C.blue, C.green, C.gold, C.red, '#6366f1', '#a855f7'].map(color => (
                    <div key={color} onClick={() => setFormData({ ...formData, color_hex: color })} style={{ width: 32, height: 32, borderRadius: '50%', background: color, cursor: 'pointer', border: formData.color_hex === color ? `3px solid ${C.dark}30` : 'none', scale: formData.color_hex === color ? '1.1' : '1', transition: 'all 0.2s' }} />
                  ))}
                </div>
              </div>

              <div style={{ display: "flex", gap: 12, marginTop: 12 }}>
                <Btn onClick={handleSave} style={{ flex: 1 }}>{editingPlan ? t("حفظ التغييرات") : t("إضافة الخطة")}</Btn>
                <Btn variant="secondary" onClick={closeModal}>{t("إلغاء")}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
