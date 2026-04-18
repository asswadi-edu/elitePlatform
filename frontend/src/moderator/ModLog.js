import React, { useContext, useState, useEffect } from 'react';
import { C } from '../tokens';
import { Card, Badge, Btn, Pagination, Skeleton } from '../components/Common';
import { PiCheckCircleDuotone, PiXCircleDuotone, PiTrashDuotone, PiClockCounterClockwiseDuotone, PiFileTextDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function ModLog({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

  useEffect(() => {
    fetchLogs(1);
  }, []);

  const fetchLogs = async (p = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const response = await fetch(`${apiUrl}/api/admin/logs?page=${p}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (response.ok) {
        const data = await response.json();
        setLogs(data.data);
        setMeta({
          current_page: data.current_page,
          last_page: data.last_page
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const getActionInfo = (l) => {
    const action = l.action;
    const model = l.auditable_type ? l.auditable_type.split('\\').pop() : '';
    const title = l.metadata?.title || '';

    if (action === 'approved') return { label: t("قبول مورد"), color: C.green, icon: <PiCheckCircleDuotone size={18}/> };
    if (action === 'unapproved') return { label: t("إلغاء قبول"), color: C.orange, icon: <PiXCircleDuotone size={18}/> };
    if (action === 'deleted') return { label: t("حذف مورد"), color: C.red, icon: <PiTrashDuotone size={18}/> };
    if (action === 'created') return { label: t("إضافة ") + model, color: C.blue, icon: <PiCheckCircleDuotone size={18}/> };
    if (action === 'updated') return { label: t("تعديل ") + model, color: C.blue, icon: <PiClockCounterClockwiseDuotone size={18}/> };
    
    return { label: t(action), color: C.muted, icon: <PiFileTextDuotone size={18}/> };
  };

  return (
    <React.Fragment>
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("سجل الإجراءات الخاصة بك")}</h1>
        <p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("جميع الإجراءات التي قمت بها على الموارد والبلاغات")}</p>
      </div>

      <Card style={{ padding:0, overflow:"hidden" }}>
        {loading ? (
          Array(6).fill(0).map((_, i) => (
            <div key={i} style={{ display:"flex", alignItems:"center", gap:18, padding:"16px 24px", borderBottom: `1px solid ${C.border}` }}>
              <Skeleton width="38px" height="38px" borderRadius="10px" />
              <div style={{ flex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                  <Skeleton width="100px" height="15px" />
                  <Skeleton width="150px" height="15px" />
                </div>
                <Skeleton width="120px" height="12px" />
              </div>
            </div>
          ))
        ) : logs.map((entry,i)=>(
          <div key={entry.id} style={{ display:"flex", alignItems:"center", gap:18, padding:"16px 24px", borderBottom:i<logs.length-1?`1px solid ${C.border}`:"none", transition:"background .2s" }}
            onMouseEnter={e=>e.currentTarget.style.background=C.bg}
            onMouseLeave={e=>e.currentTarget.style.background="transparent"}>
            <div style={{ width:38, height:38, borderRadius:10, background:getActionInfo(entry).color+"15", display:"flex", alignItems:"center", justifyContent:"center", color:getActionInfo(entry).color, flexShrink:0 }}>{getActionInfo(entry).icon}</div>
            <div style={{ flex:1 }}>
              <div style={{ display:"flex", alignItems:"center", gap:10, marginBottom:4 }}>
                <span style={{ fontWeight:700, color:getActionInfo(entry).color, fontSize:"0.86rem" }}>{getActionInfo(entry).label}</span>
                <span style={{ color:C.muted, fontSize:"0.78rem" }}>—</span>
                <span style={{ color:C.dark, fontSize:"0.86rem" }}>{entry.metadata?.title || (entry.auditable_type ? entry.auditable_type.split('\\').pop() : entry.action)}</span>
              </div>
              <div style={{ color:C.muted, fontSize:"0.76rem" }}>{new Date(entry.created_at).toLocaleString()}</div>
            </div>
          </div>
        ))}
        
        {logs.length === 0 && !loading && (
          <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>{t("لا توجد سجلات حالياً")}</div>
        )}
      </Card>

      <Pagination meta={meta} onPageChange={fetchLogs} />
    </React.Fragment>
  );
}
