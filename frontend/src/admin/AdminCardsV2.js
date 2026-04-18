import React, { useState, useContext, useEffect } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';
import { 
  PiTicketDuotone, PiTrashDuotone, PiCopyDuotone,
  PiMagnifyingGlassDuotone, PiSpinnerGapDuotone,
  PiLightningDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone,
  PiCurrencyCircleDollarDuotone, PiShieldCheckDuotone
} from "react-icons/pi";
import { CurrencyContext } from '../CurrencyContext';

export default function AdminCardsV2({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);
  
  const [plans, setPlans] = useState([]);
  const [cards, setCards] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [summary, setSummary] = useState({ total: 0, unused: 0, used: 0, exported: 0 });
  const [generatedPlainCodes, setGeneratedPlainCodes] = useState(null);

  const [showForm, setShowForm] = useState(false);
  const [selectedPlan, setSelectedPlan] = useState(null);
  const [newCount, setNewCount] = useState(100);
  const [countInput, setCountInput] = useState("100");
  const [customPrice, setCustomPrice] = useState("");
  const [search, setSearch] = useState("");
  const [toast, setToast] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [filterPlanId, setFilterPlanId] = useState("all");
  
  // Export states
  const [showExport, setShowExport] = useState(false);
  const [exportPlan, setExportPlan] = useState(null);
  const [exportCount, setExportCount] = useState(50);
  const [exportFilename, setExportFilename] = useState("Subscription_Cards");

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchPlans();
  }, []);

  useEffect(() => {
    const delay = setTimeout(() => {
      fetchCards(1);
    }, 300);
    return () => clearTimeout(delay);
  }, [search, filterPlanId]);

  async function fetchPlans() {
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(data);
      if (data.length > 0) {
        setSelectedPlan(data[0]);
        setExportPlan(data[0]);
        setCustomPrice(data[0].price.toString());
      } else {
        setSelectedPlan(null);
        setExportPlan(null);
        setCustomPrice("");
      }
    } catch (err) { console.error(err); }
  }

  async function fetchCards(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-cards?page=${page}&search=${search}&plan_id=${filterPlanId}`, {
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setCards(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page });
      if (data.summary) setSummary(data.summary);
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }


  useEffect(() => {
    if (selectedPlan) setCustomPrice(selectedPlan.price.toString());
  }, [selectedPlan]);

  function showToast(msg, color = C.green) { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }
  function handleCountChange(val) { setCountInput(val); const parsed = parseInt(val.replace(/,/g, "")) || 0; if (parsed >= 1) setNewCount(parsed); }
  
  async function createCards() {
    if (plans.length === 0) {
      showToast(t("يجب إضافة خطة اشتراك أولاً من صفحة الإعدادات"), C.red);
      return;
    }
    if (!selectedPlan) {
      showToast(t("يرجى اختيار خطة اشتراك"), C.orange);
      return;
    }
    if (newCount < 1) { showToast(t("أدخل عدداً صحيحاً"), C.orange); return; }
    setGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-cards`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: selectedPlan.id,
          count: newCount,
          price: selectedPlan.price
        })
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setGeneratedPlainCodes(data.plain_codes);
      fetchCards(1);
      setShowForm(false);
      showToast(`${t("تم إنشاء ")}${data.cards.length}${t(" بطاقة بنجاح")}`);
    } catch (err) {
      console.error("Create cards error", err);
      showToast(t("فشل إنشاء البطاقات. تأكد من إعدادات السيرفر"), C.red);
    } finally {
      setGenerating(false);
    }
  }

  async function deleteCard(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-cards/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      fetchCards(meta.current_page);
      showToast(t("تم حذف البطاقة"), C.red);
    } catch (err) {
      showToast(t("فشل الحذف"), C.red);
    }
  }
  function copyCode(code) { navigator.clipboard?.writeText(code); showToast(t("تم نسخ الكود: ") + code, C.blue); }

  async function downloadCardsCSV() {
    if (!exportPlan) return;
    setGenerating(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscription-cards/export`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          plan_id: exportPlan.id,
          count: exportCount
        })
      });
      
      if (!res.ok) {
        const err = await res.json();
        throw new Error(err.message || t("حدث خطأ أثناء التصدير"));
      }
      
      const data = await res.json();
      
      const headers = [t("كود التفعيل"), t("الباقة"), t("السعر (ر.ي)"), t("المدة")].join(",");
      const rows = data.map(item => [
        item.code,
        item.plan_name,
        item.price, // Always raw YER price from backend
        item.duration + " " + t("يوم")
      ].join(",")).join("\n");

      const csvContent = "\uFEFF" + headers + "\n" + rows; // UTF-8 BOM for Excel Arabic support

      const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
      const url = URL.createObjectURL(blob);
      const link = document.createElement("a");
      link.setAttribute("href", url);
      link.setAttribute("download", `${exportFilename || "cards"}_${new Date().toISOString().split('T')[0]}.csv`);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      
      setShowExport(false);
      showToast(`${t("تم تصدير ")}${data.length}${t(" بطاقة بنجاح")}`);
      fetchCards(); // Refresh list to reflect exported status
    } catch (err) {
      showToast(err.message, C.red);
    } finally {
      setGenerating(false);
    }
  }

  const unusedCount = summary.unused;
  const exportedCountTotal = summary.exported;

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 70, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 999, borderRight: `4px solid ${toast.color}` }}>{toast.msg}</div>}
      
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 24 }}>
        <div><h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("بطاقات الاشتراك")}</h1><p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("إنشاء وإدارة أكواد تفعيل الاشتراكات")}</p></div>
        <div style={{ display: 'flex', gap: 12 }}>
          <Btn variant="secondary" onClick={() => setShowExport(true)} style={{ display: "flex", alignItems:"center", gap:8, background:C.bg, color:C.dark, border:`1px solid ${C.border}` }}><PiCopyDuotone size={18} /> {t("تصدير للطباعة")}</Btn>
          <Btn variant="secondary" onClick={() => setPage("admin-settings", { tab: "monetization" })} style={{ display: "flex", alignItems: "center", gap: 8 }}><PiShieldCheckDuotone size={18} /> {t("إدارة الخطط")}</Btn>
          <Btn onClick={() => setShowForm(!showForm)} style={{ display: "flex", alignItems: "center", gap: 8 }}><PiTicketDuotone size={18} /> {t("إنشاء بطاقات")}</Btn>
        </div>
      </div>

      <div style={{ display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 16, marginBottom: 22 }}>
        {[[t("إجمالي البطاقات"), summary.total, C.blue], [t("غير مستخدمة"), summary.unused, C.green], [t("مستخدمة"), summary.used, C.gold], [t("تم تصديرها"), summary.exported, C.blueDark]].map(([l, v, col]) => (
          <Card key={l} style={{ padding: "16px 20px", display: "flex", alignItems: "center", gap: 16 }}>
            <div style={{ flex: 1 }}>
              <div style={{ color: C.muted, fontSize: "0.76rem", marginBottom: 4 }}>{l}</div>
              <div style={{ fontSize: "1.4rem", fontWeight: 800, color: col }}>{v}</div>
            </div>
            <div style={{ fontSize: "1.6rem", color: C.muted }}><PiTicketDuotone /></div>
          </Card>
        ))}
      </div>

      {showForm && (
        <Card style={{ padding: 26, marginBottom: 20, border: `2px solid ${C.blue}20`, background: `${C.blueLight}20` }}>
          <h3 style={{ fontWeight: 700, color: C.dark, margin: "0 0 18px", fontSize: "0.98rem", display: "flex", alignItems: "center", gap: 8 }}><PiTicketDuotone size={20} color={C.blue} /> {t("توليد بطاقات اشتراك جديدة")}</h3>
          <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 0.8fr 1fr auto", gap: 18, alignItems: "flex-end" }}>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("الخطة")}</label>
              {plans.length > 0 ? (
                <select value={selectedPlan?.id || ""} onChange={e => setSelectedPlan(plans.find(p => p.id === parseInt(e.target.value)))} style={{ ...inputStyle, background: C.white }}>
                  {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                </select>
              ) : (
                <div onClick={() => setPage("admin-settings", { tab: "monetization" })} style={{ ...inputStyle, background: `${C.red}10`, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer', border: `1px solid ${C.red}40` }}>
                   <PiWarningCircleDuotone style={{ marginRight:8 }} /> {t("لا توجد خطط - اضغط للإضافة")}
                </div>
              )}
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("العدد")}</label>
              <input type="text" value={countInput} onChange={e => handleCountChange(e.target.value)} style={{ ...inputStyle, background: C.white, textAlign: 'center' }} />
            </div>
            <div>
              <label style={{ display: "block", fontWeight: 600, fontSize: "0.86rem", color: C.dark, marginBottom: 8 }}>{t("القيمة الإجمالية")}</label>
              <div style={{ padding: "10px 14px", background: C.greenBg, border: `1.5px solid ${C.green}30`, borderRadius: 9, color: C.green, fontWeight: 800 }}>
                {formatPrice(newCount * (selectedPlan?.price || 0))}
              </div>
            </div>
            <div style={{ display: "flex", gap: 8 }}>
              <button onClick={createCards} disabled={generating || newCount < 1} style={{ background: generating ? C.muted : `linear-gradient(135deg,${C.blue},${C.blueDark})`, color: C.white, border: "none", borderRadius: 9, padding: "11px 20px", fontSize: "0.9rem", fontWeight: 700, cursor: "pointer", display: "flex", alignItems: "center", gap: 8 }}>
                {generating ? <PiSpinnerGapDuotone className="spin" /> : <PiLightningDuotone />} {t("توليد")}
              </button>
              <Btn variant="secondary" onClick={() => setShowForm(false)}>{t("إلغاء")}</Btn>
            </div>
          </div>
        </Card>
      )}

      <div style={{ display: "flex", gap: 12, marginBottom: 18 }}>
        <div style={{ position: "relative", flex: 1 }}>
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("ابحث بكود البطاقة أو اسم المستخدم...")} style={{ ...inputStyle, width: "100%", paddingRight: 40 }} />
          <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.muted }}><PiMagnifyingGlassDuotone /></span>
        </div>
        <select value={filterPlanId} onChange={e => setFilterPlanId(e.target.value)} style={{ ...inputStyle, width: 220, background: C.white }}>
          <option value="all">{t("جميع الخطط")}</option>
          {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
        </select>
      </div>

      <Card style={{ padding: 0, overflow: "hidden" }}>
        <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
          <thead>
            <tr style={{ background: C.bg, borderBottom: `2px solid ${C.border}` }}>
              {[t("كود البطاقة"), t("الخطة"), t("السعر"), t("تاريخ الإنشاء"), t("الحالة"), t("المستخدم"), t("إجراءات")].map(h => (
                <th key={h} style={{ padding: "12px 16px", textAlign: "start", fontWeight: 700, color: C.muted }}>{h}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {loading ? (
              Array(8).fill(0).map((_, i) => (
                <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="120px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="80px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="60px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="90px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="100px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="120px" height="24px" /></td>
                  <td style={{ padding: "13px 16px" }}><Skeleton width="30px" height="24px" /></td>
                </tr>
              ))
            ) : cards.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ padding: "40px", textAlign: "center", color: C.muted }}>
                  {t("لا توجد بطاقات تطابق بحثك")}
                </td>
              </tr>
            ) : (
              cards.map(card => (
                <tr key={card.id} style={{ borderBottom: `1px solid ${C.border}`, opacity: card.is_used ? 0.7 : 1 }}>
                  <td style={{ padding: "13px 16px" }}><div style={{ display: "flex", alignItems: "center", gap: 8 }}><code style={{ background: C.bg, borderRadius: 6, padding: "4px 8px", fontWeight: 600 }}>{card.display_code || card.code}</code><PiCopyDuotone style={{ cursor: 'pointer', opacity: 0.5 }} onClick={() => copyCode(card.display_code || card.code)} /></div></td>
                  <td style={{ padding: "13px 16px" }}><Badge color={card.plan?.color_hex || C.blue}>{card.plan?.name || "—"}</Badge></td>
                  <td style={{ padding: "13px 16px", fontWeight: 700, color: C.dark }}>{formatPrice(card.price)}</td>
                  <td style={{ padding: "13px 16px", color: C.muted }}>{new Date(card.created_at).toLocaleDateString("ar-SA")}</td>
                  <td style={{ padding: "13px 16px" }}>
                    <div style={{ display:'flex', gap:6 }}>
                      <Badge color={!card.is_used ? C.green : C.gold}>{!card.is_used ? t("غير مستخدمة") : t("مستخدمة")}</Badge>
                      {card.exported_at && <Badge color={C.blue}>{t("تم تصديرها")}</Badge>}
                    </div>
                  </td>
                  <td style={{ padding: "13px 16px", color: C.muted }}>{card.user?.name || "—"}</td>
                  <td style={{ padding: "13px 16px" }}>{!card.is_used && <button onClick={() => deleteCard(card.id)} style={{ background: 'none', border: 'none', color: C.red, cursor: 'pointer' }}><PiTrashDuotone size={18} /></button>}</td>
                </tr>
              ))
            )}
          </tbody>
        </table>
        <div style={{ padding: '16px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', borderTop: `1px solid ${C.border}` }}>
          <div style={{ fontSize: '0.78rem', color: C.muted }}>
            {t("عرض")} {cards.length} {t("من إجمالي")} {summary.total} {t("بطاقة")}
            <span style={{ marginLeft: 10, fontSize: '0.6rem', opacity: 0.5 }}>(Page {meta.current_page} / {meta.last_page})</span>
          </div>
          <Pagination meta={meta} onPageChange={fetchCards} />
        </div>
      </Card>

      {showExport && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.5)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)' }} onClick={() => setShowExport(false)}>
          <Card style={{ background: C.white, borderRadius: 20, width: 420, padding: 28, boxShadow: "0 20px 40px rgba(0,0,0,0.15)" }} onClick={e => e.stopPropagation()}>
            <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.dark, marginBottom: 20, display:'flex', alignItems:'center', gap:10 }}><PiCopyDuotone color={C.blue}/> {t("تصدير الأكواد للطباعة")}</h2>
            <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom:6 }}>{t("اسم ملف التصدير")}</label>
                <input type="text" value={exportFilename} onChange={e=>setExportFilename(e.target.value)} placeholder="Cards_Batch_01" style={{ ...inputStyle, background:C.bg }} />
              </div>
              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("نوع الخطة")}</label>
                  <select value={exportPlan.id} onChange={e => setExportPlan(plans.find(p => p.id === parseInt(e.target.value)))} style={{ ...inputStyle }}>
                    {plans.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                  </select>
                </div>
                <div>
                  <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("عدد البطاقات")}</label>
                  <input type="number" value={exportCount} onChange={e => setExportCount(parseInt(e.target.value) || 0)} style={{ ...inputStyle }} />
                </div>
              </div>
              <div style={{ background: C.blueLight, padding: 14, borderRadius: 12, border: `1px solid ${C.blue}20` }}>
                <div style={{ fontSize: '0.78rem', color: C.blue, fontWeight: 700 }}>{t("البطاقات المتاحة حالياً:")}</div>
                <div style={{ fontSize: '1.2rem', fontWeight: 900, color: C.blue }}>{cards.filter(c => !c.is_used && !c.exported_at && c.plan_id === exportPlan.id).length} {t("بطاقة")}</div>
              </div>
              <div style={{ display: "flex", gap: 10, marginTop: 10 }}>
                <Btn onClick={downloadCardsCSV} style={{ flex: 1 }}>{t("تصدير الآن")}</Btn>
                <Btn variant="secondary" onClick={() => setShowExport(false)}>{t("إلغاء")}</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
      {generatedPlainCodes && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.7)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(8px)' }}>
          <Card style={{ width: 500, maxHeight: "80vh", display: "flex", flexDirection: "column", padding: 30 }}>
            <div style={{ textAlign: 'center', marginBottom: 20 }}>
              <div style={{ width: 60, height: 60, borderRadius: 30, background: C.greenBg, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem', margin: '0 auto 12px' }}><PiCheckCircleDuotone /></div>
              <h2 style={{ fontSize: '1.2rem', fontWeight: 800 }}>{t("تم إنشاء البطاقات بنجاح")}</h2>
              <p style={{ color: C.blue, fontSize: '0.82rem', fontWeight: 600, marginTop: 4 }}>{t("تم حفظ الأكواد بنجاح؛ يمكنك دائماً مراجعتها في قائمة الإدارة")}</p>
            </div>
            <div style={{ flex: 1, overflowY: "auto", background: C.bg, borderRadius: 12, padding: 16 }}>
              {generatedPlainCodes.map((code, i) => (
                <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 0', borderBottom: i < generatedPlainCodes.length - 1 ? `1px solid ${C.border}` : 'none' }}>
                  <code style={{ fontWeight: 700, color: C.dark }}>{code}</code>
                  <PiCopyDuotone style={{ cursor: 'pointer', color: C.blue }} onClick={() => copyCode(code)} />
                </div>
              ))}
            </div>
            <div style={{ marginTop: 24, display: 'flex', gap: 12 }}>
              <Btn style={{ flex: 1 }} onClick={() => {
                const text = generatedPlainCodes.join('\n');
                const blob = new Blob([text], { type: 'text/plain' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `codes_${Date.now()}.txt`;
                link.click();
              }}>{t("تحميل كملف نصي")}</Btn>
              <Btn variant="secondary" onClick={() => setGeneratedPlainCodes(null)}>{t("إغلاق")}</Btn>
            </div>
          </Card>
        </div>
      )}
      <style>{` .spin { animation: spin 1s linear infinite; } @keyframes spin { to { transform: rotate(360deg); } } `}</style>
    </>
  );
}
