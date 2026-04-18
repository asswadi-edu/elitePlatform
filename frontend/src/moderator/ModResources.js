import React, { useState, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Skeleton, Pagination } from '../components/Common';
import { PiCheckCircleDuotone, PiXCircleDuotone, PiTrashDuotone, PiTrayDuotone, PiLinkDuotone, PiFileTextDuotone, PiUserDuotone, PiBookOpenDuotone, PiPackageDuotone, PiClockDuotone, PiEyeDuotone, PiDownloadSimpleDuotone, PiCursorClickDuotone, PiSealCheckFill, PiFlagDuotone, PiFunnelDuotone, PiMagnifyingGlassDuotone, PiTrendUpDuotone, PiTrendDownDuotone, PiStackDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function ModResources({ setPage, userFilter }) {
  const { t } = useContext(LanguageContext);
  const [filter, setFilter] = useState(userFilter ? "all" : "pending");
  const [searchTerm, setSearchTerm] = useState(userFilter || "");
  const [resources, setResources] = useState([]);
  const [loading, setLoading] = useState(false);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [toast, setToast] = useState(null);
  const [previewFile, setPreviewFile] = useState(null);

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  React.useEffect(() => {
    fetchResources(1);
  }, [filter, searchTerm]);

  async function fetchResources(page = 1) {
    setLoading(true);
    try {
      const res = await fetch(`${apiUrl}/api/admin/resources?page=${page}&status=${filter}&search=${searchTerm}`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setResources(data.data);
      setMeta({ current_page: data.current_page, last_page: data.last_page });
    } catch (err) { console.error(err); }
    finally { setLoading(false); }
  }

  function showToast(msg, color) { setToast({msg,color}); setTimeout(()=>setToast(null),2800); }
  
  async function approve(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/resources/${id}/approve`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      showToast(t("تم قبول المورد بنجاح"), C.green);
      fetchResources(meta.current_page);
    } catch (err) { showToast(t("فشل الإجراء"), C.red); }
  }

  function reject(id) { remove(id); }

  async function remove(id) {
    try {
      const res = await fetch(`${apiUrl}/api/admin/resources/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      showToast(t("تم حذف المورد نهائياً"), C.orange);
      fetchResources(meta.current_page);
    } catch (err) { showToast(t("فشل الحذف"), C.red); }
  }

  const statusColors = { pending:C.gold, approved:C.green, rejected:C.red };
  const statusLabels = { pending:t("قيد المراجعة"), approved:t("مقبول"), rejected:t("مرفوض") };
  return (
    <React.Fragment>
      {toast && <div style={{ position:"fixed", top:72, left:"50%", transform:"translateX(-50%)", background:C.dark, color:C.white, padding:"12px 24px", borderRadius:12, fontSize:"0.9rem", fontWeight:600, zIndex:999, borderRight:`4px solid ${toast.color}`, boxShadow:"0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إدارة الموارد")}</h1>
          <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("مراجعة وإدارة جميع الموارد المرفوعة من الطلاب")}</p>
        </div>
        <div style={{ display: "flex", gap: 12 }}>
          {[[t("قيد المراجعة"), C.gold, C.goldBg], [t("مقبول"), C.green, C.greenBg], [t("مرفوض"), C.red, C.redBg]].map(([l, col, bg]) => (
            <div key={l} style={{ textAlign: "center", background: bg, border: `1px solid ${col}25`, borderRadius: 12, padding: "10px 18px" }}>
              <div style={{ fontSize: "0.74rem", color: col, fontWeight: 600 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>
      <div style={{ marginBottom: 20 }}>
        <input 
          type="text" 
          placeholder={t("البحث باسم الطالب، المادة، أو العنوان...")} 
          value={searchTerm} 
          onChange={e => setSearchTerm(e.target.value)} 
          style={{ ...inputStyle, width: '100%', padding: '12px 20px', borderRadius: 14 }}
        />
      </div>
      <div style={{ display:"flex", gap:8, marginBottom:22 }}>{[[t("all"),t("الكل")],[t("pending"),t("قيد المراجعة")],[t("approved"),t("مقبول")]].map(([id,l])=>(<div key={id} onClick={()=>setFilter(id)} style={{ padding:"7px 18px", borderRadius:20, cursor:"pointer", fontSize:"0.86rem", fontWeight:filter===id?700:400, background:filter===id?C.blue:C.white, color:filter===id?C.white:C.muted, border:`1.5px solid ${filter===id?C.blue:C.border}`, transition:"all .2s" }}>{l}</div>))}</div>
      <div style={{ display: "flex", flexDirection: "column", gap: 12 }}>
        {loading ? (
          Array(4).fill(0).map((_, i) => (
            <Card key={i} style={{ padding: "18px 24px" }} hover={false}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <Skeleton width="48px" height="48px" borderRadius="12px" />
                <div style={{ flex: 1 }}>
                  <Skeleton width="220px" height="18px" margin="0 0 8px" />
                  <div style={{ display: "flex", gap: 14 }}>
                    <Skeleton width="80px" height="14px" />
                    <Skeleton width="60px" height="14px" />
                    <Skeleton width="70px" height="14px" />
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8 }}>
                  <Skeleton width="120px" height="36px" borderRadius="9px" />
                  <Skeleton width="60px" height="36px" borderRadius="9px" />
                </div>
              </div>
            </Card>
          ))
        ) : resources.length === 0 ? (
          <Card style={{ textAlign:"center", padding:"60px 40px" }}>
            <div style={{ color:C.muted, marginBottom:12, display:'flex', justifyContent:'center' }}><PiTrayDuotone size={48}/></div>
            <div style={{ fontWeight:700, color:C.dark }}>{t("لا توجد موارد في هذا القسم")}</div>
          </Card>
        ) : (
          resources.map(res => (
            <Card key={res.id} style={{ padding: "18px 24px" }} hover={false}>
              <div style={{ display: "flex", alignItems: "center", gap: 18 }}>
                <div style={{ width: 48, height: 48, borderRadius: 12, background: res.resource_type === 2 ? C.redBg : C.blueLight, display: "flex", alignItems: "center", justifyContent: "center", color: res.resource_type === 2 ? C.red : C.blue, flexShrink: 0 }}>
                  {res.resource_type === 2 ? <PiLinkDuotone size={24} /> : <PiFileTextDuotone size={24} />}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                  <div style={{ fontWeight: 700, color: C.dark, marginBottom: 6, fontSize: "0.93rem" }}>{res.title}</div>
                  <div style={{ display: "flex", gap: 14, flexWrap: "wrap", alignItems: 'center' }}>
                    <span style={{ color: C.muted, fontSize: "0.78rem", display: 'flex', alignItems: 'center', gap: 4 }}>
                      <PiUserDuotone size={14} /> {res.user?.name || t("مستخدم")}
                      {res.user?.is_trusted && <PiSealCheckFill size={15} color={C.blue} title={t("موثق")}/>}
                    </span>
                    <span style={{ color: C.muted, fontSize: "0.78rem", display: 'flex', alignItems: 'center', gap: 4 }}><PiBookOpenDuotone size={14} /> {res.subject?.name || "—"}</span>
                    <span style={{ color: C.muted, fontSize: "0.78rem", display: 'flex', alignItems: 'center', gap: 4 }}><PiPackageDuotone size={14} /> {res.file_size ? (res.file_size / 1024 / 1024).toFixed(1) + "MB" : "—"}</span>
                    <span style={{ color: C.muted, fontSize: "0.78rem", display: 'flex', alignItems: 'center', gap: 4 }}><PiClockDuotone size={14} /> {new Date(res.created_at).toLocaleDateString("ar-SA")}</span>
                    <Badge color={res.is_approved ? C.green : C.gold}>{res.is_approved ? t("مقبول") : t("قيد المراجعة")}</Badge>
                  </div>
                </div>
                <div style={{ display: "flex", gap: 8, flexShrink: 0 }}>
                  <Btn variant="secondary" style={{ fontSize: "0.82rem", padding: "8px 18px", display: 'flex', alignItems: 'center', gap: 6, background: C.blue, color: C.white, border: "none" }} onClick={() => setPreviewFile(res)}>
                    <PiEyeDuotone size={16} /> {t("معاينة واتخاذ إجراء")}
                  </Btn>
                  <Btn variant="secondary" style={{ fontSize: "0.82rem", padding: "8px 12px", color: C.red, border: `1px solid color-mix(in srgb, ${C.red} 19%, transparent)`, display: 'flex', alignItems: 'center', gap: 6 }} onClick={() => remove(res.id)}>
                    <PiTrashDuotone size={16} /> {t("حذف")}
                  </Btn>
                </div>
              </div>
            </Card>
          ))
        )}
        <Pagination meta={meta} onPageChange={fetchResources} />
      </div>

      {previewFile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(4px)' }} onClick={()=>setPreviewFile(null)}>
          <div style={{ background:C.white, borderRadius:24, width:800, maxWidth:"95%", height:'85vh', boxShadow:"0 25px 50px rgba(0,0,0,0.2)", position:'relative', display:'flex', flexDirection:'column', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:'20px 28px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
              <div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:0 }}>{t("معاينة الملف: ")}{previewFile.title}</h2>
                <div style={{ fontSize:'0.75rem', color:C.muted, marginTop:4, display:'flex', alignItems:'center', gap:4 }}>
                  {previewFile.user?.name || "—"} {previewFile.user?.profile?.is_trusted && <PiSealCheckFill size={14} color={C.blue}/>} • {previewFile.subject?.name || "—"} • {previewFile.file_size ? (previewFile.file_size / 1024 / 1024).toFixed(1) + "MB" : "—"}
                </div>
              </div>
              <div onClick={()=>setPreviewFile(null)} style={{ width:32, height:32, borderRadius:'50%', background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.muted }}>✕</div>
            </div>
            <div style={{ flex:1, background:"#f8f9fa", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
              {previewFile.resource_type === 2 ? (
                <div style={{ textAlign:"center", padding:40 }}>
                  <PiLinkDuotone size={64} color={C.blue} style={{ marginBottom:20 }}/>
                  <h3 style={{ marginBottom:10 }}>{t("هذا المورد عبارة عن رابط خارجي")}</h3>
                  <p style={{ color:C.muted, marginBottom:24 }}>{previewFile.url}</p>
                  <Btn onClick={()=>window.open(previewFile.url, '_blank')}>{t("فتح الرابط في علامة تبويب جديدة")}</Btn>
                </div>
              ) : (
                <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center" }}>
                   {previewFile.mime_type?.startsWith('image/') ? (
                     <img src={`${getApiUrl()}/api/resources/view/${previewFile.uuid}`} style={{ maxWidth:'100%', maxHeight:'100%', objectFit:'contain' }} alt="preview" />
                   ) : (
                     <iframe 
                       src={`${getApiUrl()}/api/resources/view/${previewFile.uuid}`} 
                       style={{ width:'100%', height:'100%', border:'none' }} 
                       title="File Preview"
                     />
                   )}
                </div>
              )}
            </div>
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', gap:10, background:C.bg }}>
               <Btn variant="secondary" style={{ padding:'8px 18px' }} onClick={()=>setPreviewFile(null)}>{t("إغلاق")}</Btn>
               {!previewFile.is_approved && (
                 <React.Fragment>
                   <Btn variant="danger" style={{ padding:'8px 24px' }} onClick={()=>{ remove(previewFile.id); setPreviewFile(null); }}>{t("رفض المورد")}</Btn>
                   <Btn variant="success" style={{ padding:'8px 24px' }} onClick={()=>{ approve(previewFile.id); setPreviewFile(null); }}>{t("قبول المورد")}</Btn>
                 </React.Fragment>
               )}
               {previewFile.is_approved && (
                 <React.Fragment>
                   <Btn variant="secondary" style={{ display:'flex', alignItems:'center', gap:6, color:C.red, border:`1px solid ${C.red}30` }} onClick={()=>{ remove(previewFile.id); setPreviewFile(null); }}><PiXCircleDuotone/> {t("سحب القبول")}</Btn>
                   <Btn variant="primary" style={{ display:'flex', alignItems:'center', gap:8, padding:'8px 24px' }} onClick={()=>{
                      window.open(`${getApiUrl()}/api/resources/${previewFile.id}/download`, '_blank');
                   }}><PiDownloadSimpleDuotone size={18}/> {t("تحميل الملف")}</Btn>
                 </React.Fragment>
               )}
            </div>
          </div>
        </div>
      )}
    </React.Fragment>
  );
}
