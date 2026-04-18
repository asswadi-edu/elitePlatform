import React, { useState, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import { PiTrashDuotone, PiCheckCircleDuotone, PiConfettiDuotone, PiFlagDuotone, PiClockDuotone, PiWarningDuotone, PiEyeDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function ModReported({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [reports, setReports] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [filter, setFilter] = useState(0); // Default to pending
  const [toast, setToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  React.useEffect(() => {
    fetchReports(1);
  }, [filter]);

  async function fetchReports(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/reports?page=${page}&status=${filter}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setReports(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function showToast(msg, color) { setToast({msg,color}); setTimeout(()=>setToast(null),2800); }
  
  async function resolveReport(id, note = "") {
    try {
      const res = await fetch(`${apiUrl}/api/admin/reports/${id}/resolve`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          resolution_note: note,
          delete_content: true
        })
      });
      if (!res.ok) throw new Error();
      showToast(t("تمت معالجة البلاغ بنجاح"), C.green);
      fetchReports(meta.current_page);
    } catch (err) { showToast(t("فشل الإجراء"), C.red); }
  }

  async function dismissReport(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/reports/${id}/dismiss`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      showToast(t("تم تجاهل البلاغ"), C.green);
      fetchReports(meta.current_page);
    } catch (err) { showToast(t("فشل الإجراء"), C.red); }
  }

  return (
    <>
      {toast && <div style={{ position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", background:C.dark, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:"0.9rem", fontWeight:600, zIndex:999, borderRight:`4px solid ${toast.color}`, boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}
      
      <div style={{ marginBottom:28 }}>
        <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("إدارة البلاغات")}</h1>
        <p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("مراجعة البلاغات المقدمة من المستخدمين واتخاذ الإجراءات الإدارية")}</p>
      </div>
      
      <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
        {[
          { id: 'pending', label: t('بلاغات معلقة'), status: 0 },
          { id: 'resolved', label: t('تمت معالجتها'), status: 2 },
          { id: 'dismissed', label: t('تم تجاهلها'), status: 3 }
        ].map(tab => (
          <div key={tab.id} onClick={() => setFilter(tab.status)} style={{ padding:'12px 28px', cursor:'pointer', fontWeight: filter===tab.status ? 700 : 500, color: filter===tab.status ? C.blue : C.muted, borderBottom:`3px solid ${filter===tab.status ? C.blue : 'transparent'}`, marginBottom:-2, fontSize:'0.95rem', transition:'all .2s' }}>
            {tab.label}
          </div>
        ))}
      </div>

      <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
        {loading ? (
          Array(3).fill(0).map((_, i) => (
            <Card key={i} style={{ padding: "22px 26px" }} hover={false}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                <Skeleton width="48px" height="48px" borderRadius="12px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="280px" height="18px" margin="0 0 10px" />
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
                    <Skeleton width="120px" height="14px" />
                    <Skeleton width="100px" height="14px" />
                  </div>
                  <Skeleton width="100%" height="40px" borderRadius="10px" margin="0 0 16px" />
                  <div style={{ display: "flex", gap: 10 }}>
                    <Skeleton width="100px" height="36px" borderRadius="9px" />
                    <Skeleton width="80px" height="36px" borderRadius="9px" />
                  </div>
                </div>
              </div>
            </Card>
          ))
        ) : reports.length === 0 ? (
          <Card style={{ textAlign:"center", padding:"60px 40px" }}>
            <div style={{ color:C.green, marginBottom:12, display:'flex', justifyContent:'center' }}><PiConfettiDuotone size={48}/></div>
            <div style={{ fontWeight:700, color:C.dark }}>{filter === 0 ? t("لا توجد بلاغات معلقة") : t("السجل فارغ")}</div>
            <div style={{ color:C.muted, marginTop:8, fontSize:"0.88rem" }}>{filter === 0 ? t("لقد تمت معالجة جميع البلاغات بنجاح") : t("لا توجد بيانات لهذا النوع")}</div>
          </Card>
        ) : (
          reports.map(rep => (
            <Card key={rep.id} style={{ padding: "22px 26px", border: `1px solid color-mix(in srgb, ${C.red} 13%, transparent)`, background: `color-mix(in srgb, ${C.redBg} 25%, transparent)` }} hover={false}>
              <div style={{ display: "flex", alignItems: "flex-start", gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: C.redBg, display: "flex", alignItems: "center", justifyContent: "center", color: C.red, flexShrink: 0 }}>
                  <PiFlagDuotone size={24} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, color: C.dark, fontSize: "0.95rem", marginBottom: 10 }}>{rep.reportable?.title || t("محتوى غير معروف")}</div>
                  <div style={{ display: "grid", gridTemplateColumns: "repeat(2,1fr)", gap: 8, marginBottom: 14 }}>
                    {[
                      [<PiFlagDuotone size={14} />, t("أبلغ عنه"), rep.reporter?.name || "—"],
                      [<PiClockDuotone size={14} />, t("التاريخ"), new Date(rep.created_at).toLocaleDateString("ar-SA")]
                    ].map(([icon, l, v]) => (
                      <div key={l} style={{ display: "flex", gap: 6, alignItems: 'center' }}>
                        <span style={{ color: C.muted, fontSize: "0.78rem", display: 'flex', alignItems: 'center', gap: 4 }}>{icon} {l}:</span>
                        <span style={{ color: C.body, fontSize: "0.78rem", fontWeight: 600 }}>{v}</span>
                      </div>
                    ))}
                  </div>
                  <div style={{ background: C.redBg, border: `1px solid color-mix(in srgb, ${C.red} 15%, transparent)`, borderRadius: 10, padding: "10px 14px", marginBottom: 16, display: "flex", gap: 10, alignItems: "center" }}>
                    <span style={{ color: C.red, fontSize: "1rem" }}><PiWarningDuotone /></span>
                    <span style={{ color: C.red, fontSize: "0.82rem", fontWeight: 600 }}>{t("السبب: ")}</span>
                    <span style={{ color: C.body, fontSize: "0.82rem" }}>{rep.description}</span>
                  </div>
                  {filter === 0 ? (
                    <div style={{ display: "flex", gap: 10, flexWrap: "wrap" }}>
                      <Btn variant="primary" style={{ fontSize: "0.86rem", padding: "9px 18px", display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => setPreviewFile({
                        ...rep.reportable,
                        id: rep.id,
                        resourceId: rep.reportable?.id,
                        reason: rep.description,
                        resourceTitle: rep.reportable?.title,
                        resourceOwner: rep.reportable?.user?.name || t("مجهول"),
                        subject: rep.reportable?.subject?.title
                      })}>
                        <PiEyeDuotone size={16} /> {t("معاينة المورد")}
                      </Btn>
                      <Btn variant="danger" style={{ fontSize: "0.86rem", padding: "9px 18px", display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => resolveReport(rep.id, "Deleted by moderator")}>
                        <PiTrashDuotone size={16} /> {t("حل البلاغ")}
                      </Btn>
                      <Btn variant="secondary" style={{ fontSize: "0.86rem", padding: "9px 18px", display: 'flex', alignItems: 'center', gap: 8 }} onClick={() => dismissReport(rep.id)}>
                        <PiCheckCircleDuotone size={16} /> {t("تجاهل")}
                      </Btn>
                    </div>
                  ) : (
                    <Badge color={filter === 2 ? C.green : C.muted}>
                      {filter === 2 ? t("تم الحل") : t("تم التجاهل")}
                    </Badge>
                  )}
                </div>
              </div>
            </Card>
          ))
        )}
        <Pagination meta={meta} onPageChange={fetchReports} />
      </div>

      {previewFile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(4px)' }} onClick={() => setPreviewFile(null)}>
          <div style={{ background:C.white, borderRadius:24, width:800, maxWidth:"95%", height:'85vh', boxShadow:"0 25px 50px rgba(0,0,0,0.2)", position:'relative', display:'flex', flexDirection:'column', overflow:'hidden' }} onClick={e => e.stopPropagation()}>
            <div style={{ padding:'20px 28px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
              <div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:0 }}>{t("معاينة بلاغ: ")}{previewFile.resourceTitle}</h2>
                <div style={{ fontSize:'0.75rem', color:C.muted, marginTop:4 }}>{t("المالك:")} {previewFile.resourceOwner} • {previewFile.subject}</div>
              </div>
              <div onClick={() => setPreviewFile(null)} style={{ width:32, height:32, borderRadius:'50%', background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.muted }}>✕</div>
            </div>
            <div style={{ flex:1, background:"#f8f9fa", position:'relative', overflow:'hidden' }}>
                {previewFile.mime_type?.includes('pdf') || previewFile.mime_type?.includes('officedocument') || previewFile.mime_type?.includes('word') ? (
                  <iframe 
                    src={`${getApiUrl()}/api/resources/view/${previewFile.uuid}`}
                    style={{ width:'100%', height:'100%', border:'none' }}
                    title="Resource Preview"
                  />
                ) : previewFile.mime_type?.includes('image') ? (
                  <div style={{ width:'100%', height:'100%', display:'flex', alignItems:'center', justifyContent:'center', padding:20, overflow:'auto' }}>
                    <img 
                      src={`${getApiUrl()}/api/resources/view/${previewFile.uuid}`} 
                      style={{ maxWidth:'100%', maxHeight:'100%', borderRadius:8, boxShadow:'0 10px 30px rgba(0,0,0,0.1)' }} 
                      alt="Preview"
                    />
                  </div>
                ) : (
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', height:'100%', color:C.muted, gap:16 }}>
                    <PiWarningDuotone size={60} style={{ opacity:0.3 }}/>
                    <div style={{ fontWeight:600 }}>{t("لا يمكن معاينة هذا النوع من الملفات تلقائياً")}</div>
                    <Btn onClick={()=>window.open(`${getApiUrl()}/api/resources/view/${previewFile.uuid}`, '_blank')} variant="secondary">{t("فتح في نافذة جديدة")}</Btn>
                  </div>
                )}
            </div>
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:12, background:C.bg }}>
               <Btn variant="secondary" onClick={() => setPreviewFile(null)}>{t("إغلاق")}</Btn>
               <Btn variant="success" onClick={() => { dismissReport(previewFile.id); setPreviewFile(null); }}>{t("تجاهل البلاغ")}</Btn>
               <Btn variant="danger" onClick={() => { resolveReport(previewFile.id, "Deleted by moderator"); setPreviewFile(null); }}>{t("حذف المورد")}</Btn>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
