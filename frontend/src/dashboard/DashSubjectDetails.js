import React, { useState, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiFilePdfDuotone, PiChartBarDuotone, PiNotePencilDuotone, PiUserDuotone, PiCalendarDuotone, PiStarDuotone, PiThumbsUpDuotone, PiThumbsDownDuotone, PiPlayCircleDuotone, PiTimerDuotone, PiFolderOpenDuotone, PiBellDuotone, PiInfoDuotone, PiWarningDuotone, PiIdentificationCardDuotone, PiGraduationCapDuotone, PiHardDriveDuotone, PiPaperPlaneTiltDuotone, PiDownloadSimpleDuotone, PiCursorClickDuotone, PiSealCheckFill } from 'react-icons/pi';
import { FadeIn } from '../utils';
import { RankBadge, likesToPoints } from './ranking';
import { LanguageContext } from '../LanguageContext';
import { inputStyle } from '../tokens';
import { Field } from '../components/Common';
import { getApiUrl } from '../api';

function RequestSummaryModal({ subject, onClose, t }) {
  if (!subject) return null;
  return (
    <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:C.white, borderRadius:16, padding:"32px", width:440, maxWidth:"90%", boxShadow:"0 20px 40px rgba(0,0,0,0.15)", position:'relative' }}>
        <div onClick={onClose} style={{ position:'absolute', top:20, right:20, cursor:'pointer', fontSize:'1.5rem', color:C.muted }}>×</div>
        <h3 style={{ fontWeight:800, color:C.dark, marginBottom:8, fontSize:'1.2rem' }}>{t("طلب ملخص مفقود")}</h3>
        <p style={{ color:C.muted, fontSize:'0.82rem', marginBottom:24, lineHeight:1.5 }}>{t("سيتم إرسال طلبك للطلاب المميزين والمساهمين في هذه المادة.")}</p>
        
        <form onSubmit={(e) => { e.preventDefault(); alert(t('تم إرسال الطلب بنجاح!')); onClose(); }}>
          <Field label={t("المادة الدراسية")}>
            <input value={subject.title} disabled style={{ ...inputStyle, background:C.bg, cursor:'not-allowed' }} />
          </Field>
          <Field label={t("موضوع الطلب / الجزء المفقود")}>
            <textarea required rows={4} placeholder={t("مثال: أحتاج لملخص يشرح خوارزميات الترتيب (Sorting Algorithms) للفصل الرابع...")} style={{...inputStyle, resize:'vertical'}} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
          </Field>
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
            <Btn type="button" variant="secondary" onClick={onClose} style={{ flex:1 }}>{t("إلغاء")}</Btn>
            <Btn type="submit" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {t("← إرسال الطلب")} <PiPaperPlaneTiltDuotone size={18}/>
            </Btn>
          </div>
        </form>
      </div>
    </div>
  );
}

function ResourceDetailsModal({ item, onClose, t }) {
  const [reporting, setReporting] = useState(false);
  const [reason, setReason] = useState('');
  const [otherReason, setOtherReason] = useState('');

  if (!item) return null;

  const reasons = [
    t("محتوى غير لائق"),
    t("معلومات غير صحيحة"),
    t("مورد مكرر"),
    t("أخرى")
  ];

  const handleSendReport = async () => {
    if (!reason) return alert(t('يرجى اختيار سبب'));
    if (reason === t("أخرى") && !otherReason.trim()) return alert(t('يرجى كتابة السبب'));
    
    // Map text reason to DB integer (1=inappropriate, 2=broken, 3=duplicate, 4=other)
    const reasonMap = {
      [t("محتوى غير لائق")]: 1,
      [t("ملف تالف أو خاطئ")]: 2,
      [t("مورد مكرر")]: 3,
      [t("أخرى")]: 4
    };

    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/reports`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          reportable_type: 'App\\Models\\Resource',
          reportable_id: item.id,
          report_type: reasonMap[reason] || 4,
          description: reason === t("أخرى") ? otherReason : reason
        })
      });

      if (res.ok) {
        alert(t('تم إرسال البلاغ بنجاح!'));
        onClose();
        setReporting(false);
        setReason('');
        setOtherReason('');
      } else {
        alert(t('حدث خطأ أثناء إرسال البلاغ'));
      }
    } catch(e) {
      alert(t('تعذر الاتصال بالخادم'));
    }
  };

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <Card style={{ maxWidth:500, width:'100%', padding:32, position:'relative' }} hover={false}>
        <div onClick={onClose} style={{ position:'absolute', top:20, right:20, cursor:'pointer', fontSize:'1.5rem', color:C.muted }}>×</div>
        
        {!reporting ? (
          <>
            <h2 style={{ fontWeight:800, color:C.dark, marginBottom:24, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:10 }}>
              <PiInfoDuotone color={C.blue}/> {t("تفاصيل المورد")}
            </h2>
            
            <div style={{ display:'flex', flexDirection:'column', gap:18, marginBottom:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiUserDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("صاحب المورد")}</div>
                  <div style={{ fontWeight:700, color:C.dark, display:'flex', alignItems:'center', gap:4 }}>
                    {item.isAnonymous ? t("مجهول") : item.author}
                    {item.isTrusted && <PiSealCheckFill size={16} color={C.blue} title={t("موثق")}/>}
                  </div>
                </div>
              </div>

              {!item.isAnonymous && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiIdentificationCardDuotone size={20}/></div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("مستوى الطالب")}</div>
                      <div style={{ fontWeight:700, color:C.dark }}>{item.level}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiGraduationCapDuotone size={20}/></div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("الجامعة")}</div>
                      <div style={{ fontWeight:700, color:C.dark }}>{item.university}</div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiIdentificationCardDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("اسم الدكتور المقرر")}</div>
                  <div style={{ fontWeight:700, color:C.dark }}>{item.doctor}</div>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiHardDriveDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("حجم الملف")}</div>
                  <div style={{ fontWeight:700, color:C.dark }}>{item.size}</div>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Btn onClick={() => setReporting(true)} variant="secondary" style={{ flex:1, color:C.red, borderColor:C.red+'40', background:C.red+'08' }}>
                <PiWarningDuotone style={{ verticalAlign:'middle', marginInlineEnd:6 }}/> {t("إبلاغ عن المورد")}
              </Btn>
              <Btn onClick={onClose} style={{ flex:1 }}>{t("إغلاق")}</Btn>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontWeight:800, color:C.dark, marginBottom:24, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:10 }}>
              <PiWarningDuotone color={C.red}/> {t("إبلاغ عن المورد")}
            </h2>
            
            <div style={{ marginBottom:32 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:'0.86rem', color:C.dark, marginBottom:12 }}>{t("سبب الإبلاغ")}</label>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {reasons.map(r => (
                  <div key={r}>
                    <div onClick={() => setReason(r)} style={{ padding:'12px 16px', borderRadius:11, border:`1.5px solid ${reason === r ? C.red : C.border}`, background: reason === r ? C.red+'08' : C.bg, cursor:'pointer', fontSize:'0.9rem', color: reason === r ? C.red : C.dark, fontWeight: reason === r ? 700 : 500, transition:'all .2s' }}>
                      {r}
                    </div>
                    {r === t("أخرى") && reason === r && (
                      <textarea 
                        value={otherReason} 
                        onChange={e => setOtherReason(e.target.value)} 
                        placeholder={t("اكتب السبب هنا...")}
                        style={{ width:'100%', marginTop:10, borderRadius:11, border:`1.5px solid ${C.border}`, padding:12, fontFamily:'inherit', fontSize:'0.88rem', minHeight:80, outline:'none' }}
                        onFocus={e => e.target.style.borderColor = C.red}
                        onBlur={e => e.target.style.borderColor = C.border}
                      />
                    )}
                  </div>
                ))}
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Btn onClick={() => { setReporting(false); setReason(''); setOtherReason(''); }} variant="secondary" style={{ flex:1 }}>{t("إلغاء")}</Btn>
              <Btn onClick={handleSendReport} variant="danger" disabled={!reason || (reason === t("أخرى") && !otherReason.trim())} style={{ flex:1 }}>
                {t("إرسال البلاغ")}
              </Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function DashSubjectDetails({ setPage, subject }) {
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState('summaries');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // If no subject is passed (user directly went here), default to something
  const currentSub = subject || { title:t('رياضيات متقدمة'), code:'MATH301', locked:false, id:'MATH301' };

  const [summaries, setSummaries] = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);

  React.useEffect(() => {
    fetchSubjectData();
  }, [currentSub.id]);

  const fetchSubjectData = async () => {
    const token = localStorage.getItem("elite_token");
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/resources?subject_id=${currentSub.id}&status=approved`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Academic Summaries
      setSummaries(data.filter(i => i.resource_type === 1).map(i => ({
        ...i,
        author: i.is_anonymous ? t('مجهول') : (i.user?.profile?.first_name + ' ' + i.user?.profile?.last_name),
        isTrusted: i.user?.is_trusted,
        size: formatFileSize(i.file_size),
        date: new Date(i.created_at).toLocaleDateString('ar-EG', { day: 'numeric', month: 'long', year: 'numeric' }),
        likes: i.likes_count,
        downloads: i.downloads_count
      })));

      // Courses / Links
      setCourses(data.filter(i => i.resource_type === 2).map(i => ({
         id: i.id,
         title: i.title,
         platform: i.platform || 'YouTube',
         likes: i.likes_count,
         clicks: i.clicks || 0,
         duration: i.duration || '—',
         url: i.file_url 
      })));

    } catch(e) { console.error(e); }
    finally { setLoading(false); }
  };

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  const handleInteraction = async (type, id) => {
    const token = localStorage.getItem("elite_token");
    try {
        const res = await fetch(`${getApiUrl()}/api/resources/${id}/${type}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        // Update local state
        setSummaries(prev => prev.map(it => it.id === id ? {
            ...it, 
            likes_count: data.likes ?? it.likes_count,
            dislikes_count: data.dislikes ?? it.dislikes_count,
            downloads_count: data.downloads ?? it.downloads_count,
            likes: data.likes ?? it.likes // for UI compatibility
        } : it));
    } catch(e) {}
  };

  return (
    <DashboardLayout activeSub="subjects" setPage={setPage}>
      <FadeIn>
        {/* Header */}
        <div style={{ display:'flex', alignItems:'flex-start', justifyContent:'space-between', marginBottom:28, background:`linear-gradient(135deg, ${C.blueBg}, ${C.white})`, padding:"26px 32px", borderRadius:20, border:`1px solid ${C.blueLight}` }}>
          <div>
            <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:8 }}>
              <Badge color={C.blue}>{currentSub.code}</Badge>
              <h1 style={{ fontSize:'1.8rem', fontWeight:900, color:C.dark, margin:0 }}>{currentSub.title}</h1>
            </div>
            <p style={{ color:C.muted, fontSize:'0.95rem', maxWidth:600, lineHeight:1.6 }}>
              {t("هذه الصفحة مخصصة لعرض جميع المصادر التعليمية والملخصات والدورات الخاصة بمادة ")}{currentSub.title}{t(". يمكنك الاستفادة من المحتوى الذي يشاركه زملاؤك أو رفع ملخصاتك الخاصة.")}
            </p>
          </div>
          <Btn onClick={() => setPage('dash-subjects')} variant="secondary" style={{ background:C.white }}>{t("← العودة للمواد")}</Btn>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
          {[['summaries',t('الملخصات (القسم الأكاديمي)')],['courses',t('الدورات والشروحات')]].map(([id,l]) => (
            <div key={id} onClick={() => setTab(id)} style={{ padding:'12px 28px', cursor:'pointer', fontWeight: tab===id ? 700 : 500, color: tab===id ? C.blue : C.muted, borderBottom:`3px solid ${tab===id ? C.blue : 'transparent'}`, marginBottom:-2, fontSize:'0.95rem', transition:'all .2s' }}>
              {l}
            </div>
          ))}
        </div>

        {/* Content */}
        {tab === 'summaries' && (
          <FadeIn>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem' }}>{t("أحدث الملخصات")}</h3>
              <div style={{ display:'flex', gap:12 }}>
                <Btn variant="secondary" onClick={() => setShowRequestModal(true)} style={{ display:'flex', alignItems:'center', gap:6 }}><PiBellDuotone size={16}/> {t("طلب ملخص")}</Btn>
                <Btn onClick={() => setPage('dash-resources', { openUpload: true })}>{t("+ رفع ملخص جديد")}</Btn>
              </div>
            </div>

            <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
              {summaries.map(item => (
                <Card key={item.id} style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:20, transition:'all .2s' }} hover>
                  <div style={{ width:54, height:54, borderRadius:14, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.6rem', flexShrink:0, color:C.blue }}>
                    {item.type==='PDF' ? <PiFilePdfDuotone size={28}/> : item.type==='PPTX' ? <PiChartBarDuotone size={28}/> : <PiNotePencilDuotone size={28}/>}
                  </div>
                  <div style={{ flex:1 }}>
                    <div style={{ fontWeight:800, color:C.dark, marginBottom:6, fontSize:'1rem' }}>{item.title}</div>
                      <div style={{ display:'flex', gap:14, alignItems:'center', flexWrap:'wrap' }}>
                        {item.is_approved && (
                          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.78rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiDownloadSimpleDuotone color={C.blue} size={14}/> {item.downloads_count} {t("تحميل")}</div>
                        )}
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiHardDriveDuotone/> {item.size}</span>
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}>
                          <PiUserDuotone/> {item.is_anonymous ? t("مجهول") : item.author}
                          {item.isTrusted && <PiSealCheckFill size={14} color={C.blue} title={t("موثق")} style={{ marginLeft: 2 }}/>}
                        </span>
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiCalendarDuotone/> {item.date}</span>
                        <RankBadge points={item.points} />
                      </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn onClick={() => setSelectedResource(item)} variant="secondary" style={{ fontSize:'0.82rem', padding:'8px 14px' }}>{t("تفاصيل")}</Btn>
                      {item.is_approved && (
                        <Btn variant="primary" style={{ fontSize:'0.82rem', padding:'8px 18px' }} onClick={async () => {
                          const token = localStorage.getItem("elite_token");
                          // Increment count in backend
                          fetch(`${getApiUrl()}/api/resources/${item.id}/download`, {
                            method: 'POST',
                            headers: { 'Authorization': `Bearer ${token}` }
                          });
                          // Update local state
                          setSummaries(arr => arr.map(s => s.id === item.id ? {...s, downloads_count: (s.downloads_count || 0) + 1} : s));
                          // Open file for download/view
                          window.open(`${getApiUrl()}/api/resources/view/${item.uuid}`, '_blank');
                        }}>{t("تحميل الملف ↓")}</Btn>
                      )}
                    </div>
                    <div style={{ display:'flex', gap:6, alignItems:'center', background:C.bg, padding:"4px", borderRadius:10 }}>
                      <button onClick={()=>handleInteraction('like', item.id)} style={{ display:'flex', alignItems:'center', gap:4, padding:"4px 10px", background:"transparent", border:"none", cursor:"pointer", color:C.green, fontWeight:700, borderRadius:6, transition:"background .2s" }} onMouseEnter={e=>e.target.style.background=C.greenBg} onMouseLeave={e=>e.target.style.background="transparent"}><PiThumbsUpDuotone size={16}/> {item.likes}</button>
                      <button onClick={()=>handleInteraction('dislike', item.id)} style={{ display:'flex', alignItems:'center', gap:4, padding:"4px 10px", background:"transparent", border:"none", cursor:"pointer", color:C.red, fontWeight:700, borderRadius:6, transition:"background .2s" }} onMouseEnter={e=>e.target.style.background=C.redBg} onMouseLeave={e=>e.target.style.background="transparent"}><PiThumbsDownDuotone size={16}/> {item.dislikes}</button>
                    </div>
                  </div>
                </Card>
              ))}
              {summaries.length === 0 && (
                <div style={{ textAlign:'center', padding:'60px 20px', color:C.muted, background:C.bg, borderRadius:16 }}>
                  <div style={{ marginBottom:12, color:C.muted, opacity:0.6 }}><PiFolderOpenDuotone size={48} /></div>
                  <div style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem', marginBottom:6 }}>{t("لا توجد ملخصات بعد")}</div>
                  <div style={{ fontSize:'0.9rem' }}>{t("كن أول من يرفع ملخصاً لهذه المادة!")}</div>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {tab === 'courses' && (
          <FadeIn>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem' }}>{t("شروحات مرئية ودورات مكثفة")}</h3>
              <Btn onClick={() => setPage('dash-resources')}>{t("+ إضافة دورة")}</Btn>
            </div>
            
            <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
              {courses.map(c => (
                <Card key={c.id} style={{ padding:'20px', display:'flex', flexDirection:'column', gap:16 }} hover>
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:C.redBg, display:'flex', alignItems:'center', justifyContent:'center', color:C.red, flexShrink:0 }}><PiPlayCircleDuotone size={28}/></div>
                    <div>
                      <div style={{ fontWeight:800, color:C.dark, marginBottom:4, fontSize:'0.95rem' }}>{c.title}</div>
                      <Badge color={C.red}>{c.platform}</Badge>
                    </div>
                  </div>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg, padding:"10px 14px", borderRadius:10 }}>
                    <div style={{ display:'flex', flexDirection:'column', gap:8 }}>
                      <div style={{ display:'flex', gap:12, alignItems:'center' }}>
                         <span style={{ color:C.green, fontSize:'0.82rem', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><PiThumbsUpDuotone size={16}/> {c.likes} {t(" إعجاب")}</span>
                         <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.8rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiCursorClickDuotone size={16}/> {c.clicks} {t(" زيارة")}</div>
                      </div>
                       <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiTimerDuotone size={16}/> {c.duration}</span>
                    </div>
                    <Btn variant="ghost" style={{ fontSize:'0.8rem', padding:'5px 12px' }} onClick={() => {
                       handleInteraction('download', c.id);
                       window.open(c.url, '_blank');
                    }}>{t("فتح الرابط ↗")}</Btn>
                  </div>
                </Card>
              ))}
            </div>
          </FadeIn>
        )}
      </FadeIn>
      
      <ResourceDetailsModal 
        item={selectedResource} 
        onClose={() => setSelectedResource(null)} 
        t={t} 
      />

      {showRequestModal && (
        <RequestSummaryModal 
          subject={currentSub} 
          onClose={() => setShowRequestModal(false)} 
          t={t} 
        />
      )}
    </DashboardLayout>
  );
}
