import React, { useState, useContext, useEffect } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { PiTicketDuotone, PiCreditCardDuotone, PiTimerDuotone, PiChartBarDuotone, PiCurrencyCircleDollarDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';
import { CurrencyContext } from '../CurrencyContext';

export default function AdminSubscriptions({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);
  const [subs, setSubs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [summary, setSummary] = useState({ all: 0, active: 0, expired: 0, revenue: 0 });
  const [filter, setFilter] = useState("all");

  const counts = {
    all: summary.all,
    active: summary.active,
    expired: summary.expired
  };
  const revenue = summary.revenue;

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchSubscriptions(1);
  }, [filter]);

  async function fetchSubscriptions(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscriptions?page=${page}&filter=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubs(data.data);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page
      });
      if (data.summary) {
        setSummary(data.summary);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function cancel(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscriptions/${id}/cancel`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubs(s => s.map(x => x.id === id ? data : x));
    } catch (err) {
      console.error(err);
    }
  }

  async function renew(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/subscriptions/${id}/renew`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setSubs(s => s.map(x => x.id === id ? data : x));
    } catch (err) {
      console.error(err);
    }
  }

  return (
    <>
      <div className="admin-page-header" style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:28 }}>
        <div><h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("إدارة الاشتراكات")}</h1><p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("متابعة وإدارة اشتراكات المستخدمين")}</p></div>
        <Btn onClick={() => setPage("admin-cards")} variant="primary" style={{ display:'flex', alignItems:'center', gap:8 }}><PiTicketDuotone size={18}/> {t("إنشاء بطاقة اشتراك")}</Btn>
      </div>
      <div className="admin-kpi-grid" style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:16, marginBottom:24 }}>
        {[[t("الاشتراكات النشطة"),counts.active,C.green,C.greenBg,<PiCreditCardDuotone/>],[t("الاشتراكات المنتهية"),counts.expired,C.red,C.redBg,<PiTimerDuotone/>],[t("إجمالي الاشتراكات"),counts.all,C.blue,C.blueLight,<PiChartBarDuotone/>],[t("الإيرادات النشطة"),formatPrice(revenue),C.gold,C.goldBg,<PiCurrencyCircleDollarDuotone/>]].map(([l,v,col,bg,ic])=>(
          <Card key={l} style={{ padding:"18px 20px" }}><div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}><div><div style={{ color:C.muted, fontSize:"0.76rem", marginBottom:6 }}>{l}</div><div style={{ fontSize:"1.6rem", fontWeight:800, color:col }}>{v}</div></div><div style={{ width:38, height:38, borderRadius:10, background:bg, display:"flex", alignItems:"center", justifyContent:"center", color:col, fontSize:"1.2rem" }}>{ic}</div></div></Card>
        ))}
      </div>
      <div className="admin-tabs" style={{ display:"flex", gap:8, marginBottom:18 }}>
        {[[ "all",t("الكل") ],[ "active",t("نشط") ],[ "expired",t("منتهي") ]].map(([id,l])=>(<div key={id} onClick={()=>setFilter(id)} style={{ padding:"7px 18px", borderRadius:20, cursor:"pointer", fontSize:"0.86rem", fontWeight:filter===id?700:400, background:filter===id?C.blue:C.white, color:filter===id?C.white:C.muted, border:`1.5px solid ${filter===id?C.blue:C.border}`, transition:"all .2s" }}>{l} ({counts[id]??counts.all})</div>))}
      </div>
      <Card style={{ padding:0, overflow:"hidden" }}>
        <div className="admin-table-wrap">
          <table style={{ width:"100%", borderCollapse:"collapse", fontSize:"0.86rem" }}>
            <thead><tr style={{ background:C.bg, borderBottom:`2px solid ${C.border}` }}>{[t("المستخدم"),t("الخطة"),t("كود التفعيل"),t("تاريخ البدء"),t("تاريخ الانتهاء"),t("المبلغ"),t("الحالة"),t("إجراءات")].map(h=>(<th key={h} style={{ padding:"12px 18px", textAlign:"start", fontWeight:700, color:C.muted, fontSize:"0.82rem" }}>{h}</th>))}</tr></thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="120px" height="15px" /><br /><Skeleton width="80px" height="10px" margin="4px 0 0" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="60px" height="20px" borderRadius="6px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="100px" height="15px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="80px" height="14px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="80px" height="14px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="50px" height="14px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="60px" height="22px" borderRadius="6px" /></td>
                    <td style={{ padding: "14px 18px" }}><Skeleton width="32px" height="32px" borderRadius="8px" /></td>
                  </tr>
                ))
              ) : subs.map(s => (
              <tr key={s.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "background .15s" }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                <td style={{ padding: "14px 18px" }}>
                  <div style={{ fontWeight: 600, color: C.dark, fontSize: "0.88rem" }}>{s.user?.name || t("مستخدم مهمل")}</div>
                  <div style={{ color: C.muted, fontSize: "0.76rem" }}>{s.user?.email || "—"}</div>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <Badge color={s.plan?.color_hex || C.blue}>{s.plan?.name || "—"}</Badge>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  <code style={{ background: C.bg, borderRadius: 6, padding: "4px 8px", fontSize: "0.78rem" }}>{s.activation_card?.full_code || (s.activation_card?.code_suffix ? "NKBH-****-****-" + s.activation_card.code_suffix : "—")}</code>
                </td>
                <td style={{ padding: "14px 18px", color: C.muted, fontSize: "0.82rem" }}>{s.starts_at ? new Date(s.starts_at).toLocaleDateString("ar-SA") : "—"}</td>
                <td style={{ padding: "14px 18px", color: C.muted, fontSize: "0.82rem" }}>{s.ends_at ? new Date(s.ends_at).toLocaleDateString("ar-SA") : "—"}</td>
                <td style={{ padding: "14px 18px", fontWeight: 700, color: C.dark }}>{formatPrice(s.activation_card?.price ?? s.plan?.price ?? 0)}</td>
                <td style={{ padding: "14px 18px" }}>
                  <Badge color={s.status === 1 ? C.green : C.red}>
                    {s.status === 1 ? t("نشط") : (s.status === 2 ? t("ملغي") : t("منتهي"))}
                  </Badge>
                </td>
                <td style={{ padding: "14px 18px" }}>
                  {s.status === 1 ? (
                    <Btn variant="secondary" style={{ fontSize: "0.78rem", padding: "6px 12px", color: C.red, border: `1px solid color-mix(in srgb, ${C.red} 19%, transparent)` }} onClick={() => cancel(s.id)}>{t("إلغاء")}</Btn>
                  ) : (
                    <Btn variant="ghost" style={{ fontSize: "0.78rem", padding: "6px 12px" }} onClick={() => renew(s.id)}>{t("تجديد")}</Btn>
                  )}
                </td>
              </tr>
            ))}</tbody>
          </table>
        </div>
        <Pagination meta={meta} onPageChange={fetchSubscriptions} />
      </Card>
    </>
  );
}
