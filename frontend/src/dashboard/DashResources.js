import React, { useState, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Field, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { likesToPoints } from './ranking';
import { PiFilePdfDuotone, PiStarDuotone, PiThumbsUpDuotone, PiThumbsDownDuotone, PiPlayCircleDuotone, PiPencilSimpleDuotone, PiUserCircleDuotone, PiClockDuotone, PiLinkDuotone, PiInfoDuotone, PiDownloadSimpleDuotone, PiCursorClickDuotone, PiSealCheckFill } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { FadeIn } from '../utils';
import { getApiUrl } from '../api';

export default function DashResources({ setPage, user }) {
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState('summaries');
  const [loading, setLoading] = useState(true);
  const [items, setItems] = useState([]);
  const [courses, setCourses] = useState([]);
  const [myCourses, setMyCourses] = useState([]); // Enrolled subjects for dropdown
  
  // States for modals
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showAddCourseModal, setShowAddCourseModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  // Form states
  const [uploadData, setUploadData] = useState({
    title: '',
    subject_id: '',
    doctor: '',
    description: '',
    is_anonymous: false,
    file: null
  });
  const [courseData, setCourseData] = useState({
    title: '',
    platform: 'YouTube',
    duration: '',
    url: '',
    description: '',
    subject_id: ''
  });

  React.useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const token = localStorage.getItem("elite_token");
    setLoading(true);
    try {
      // Fetch my contributions
      const res = await fetch(`${getApiUrl()}/api/my-resources`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const data = await res.json();
      
      // Filter Summaries (Type 1)
      setItems(data.filter(i => i.resource_type === 1));
      
      // Filter Courses (Type 2) and map to frontend format
      setCourses(data.filter(i => i.resource_type === 2).map(i => ({
         id: i.id,
         title: i.title,
         platform: i.platform || 'Other',
         duration: i.duration || t('غير محدد'),
         description: i.description,
         likes: i.likes_count,
         clicks: i.clicks || 0,
         url: i.file_url 
      })));

      // Fetch enrolled courses for the upload dropdown
      const resC = await fetch(`${getApiUrl()}/api/my-courses`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const dataC = await resC.json();
      const flat = [];
      dataC.forEach(group => group.subjects.forEach(s => flat.push(s)));
      setMyCourses(flat);
    } catch (e) { console.error(e); }
    finally { setLoading(false); }
  };

  const handleInteraction = async (type, id) => {
    const token = localStorage.getItem("elite_token");
    try {
        const res = await fetch(`${getApiUrl()}/api/resources/${id}/${type}`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` }
        });
        const data = await res.json();
        setItems(prev => prev.map(it => it.id === id ? {
            ...it, 
            likes_count: data.likes ?? it.likes_count,
            dislikes_count: data.dislikes ?? it.dislikes_count,
            downloads_count: data.downloads ?? it.downloads_count
        } : it));
    } catch(e) {}
  };

  const submitUpload = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("elite_token");
    const formData = new FormData();
    formData.append('title', uploadData.title);
    formData.append('subject_id', uploadData.subject_id);
    formData.append('doctor', uploadData.doctor);
    formData.append('description', uploadData.description);
    formData.append('is_anonymous', uploadData.is_anonymous ? 1 : 0);
    formData.append('file', uploadData.file);
    formData.append('resource_type', 1);

    setLoading(true);
    try {
        const res = await fetch(`${getApiUrl()}/api/resources`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            setShowUploadModal(false);
            fetchData();
        } else {
            alert(data.message || "فشل الرفع");
        }
    } catch(e) {
        alert("حدث خطأ أثناء الرفع");
    } finally {
        setLoading(false);
    }
  };

  const submitCourse = async (e) => {
    e.preventDefault();
    const token = localStorage.getItem("elite_token");
    const formData = new FormData();
    formData.append('title', courseData.title);
    formData.append('platform', courseData.platform);
    formData.append('duration', courseData.duration);
    formData.append('description', courseData.description);
    formData.append('file_url', courseData.url); // We use file_url as the link
    formData.append('resource_type', 2); // 2 = Link/Course
    formData.append('subject_id', courseData.subject_id);

    setLoading(true);
    try {
        const res = await fetch(`${getApiUrl()}/api/resources`, {
            method: 'POST',
            headers: { 'Authorization': `Bearer ${token}` },
            body: formData
        });
        const data = await res.json();
        if (res.ok) {
            alert(data.message);
            setShowAddCourseModal(false);
            setCourseData({ title: '', platform: 'YouTube', duration: '', url: '', description: '', subject_id: '' });
            fetchData();
        } else {
            alert(data.message || "فشل الإرسال");
        }
    } catch(e) {
        alert("حدث خطأ أثناء الإرسال");
    } finally {
        setLoading(false);
    }
  };

  function handleOldInteraction(type, id) {
    // Legacy function - kept for compatibility
  }

  const formatFileSize = (bytes) => {
    if (!bytes) return '0 B';
    const k = 1024;
    const sizes = ['B', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  return (
    <DashboardLayout activeSub="resources" setPage={setPage}>
      <FadeIn>
        <div style={{ marginBottom:28 }}>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("مواردي")}</h1>
          <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("ملخصاتك ودوراتك الدراسية المشتركة")}</p>
        </div>
        
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
          {[['summaries',t('الملخصات')],['courses',t('الدورات')]].map(([id,l]) => (
            <div key={id} onClick={() => setTab(id)} style={{ padding:'10px 24px', cursor:'pointer', fontWeight: tab===id ? 700 : 400, color: tab===id ? C.blue : C.muted, borderBottom:`2px solid ${tab===id ? C.blue : 'transparent'}`, marginBottom:-1, fontSize:'0.9rem', transition:'all .2s' }}>{l}</div>
          ))}
        </div>
        
        {loading && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {[1,2,3].map(i => (
              <Card key={i} style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16, border:`1px solid ${C.border}` }}>
                <Skeleton width="44px" height="44px" borderRadius="11px" />
                <div style={{ flex:1 }}>
                   <Skeleton width="200px" height="20px" margin="0 0 8px" />
                   <div style={{ display:'flex', gap:10 }}>
                      <Skeleton width="60px" height="14px" />
                      <Skeleton width="80px" height="14px" />
                      <Skeleton width="50px" height="14px" />
                   </div>
                </div>
                <div style={{ display:'flex', gap:10 }}>
                   <Skeleton width="80px" height="34px" borderRadius="20px" />
                   <Skeleton width="70px" height="34px" />
                </div>
              </Card>
            ))}
          </div>
        )}

        {!loading && tab==='summaries' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ display:'flex', gap:12, marginBottom:10 }}>
              <Btn variant="secondary" onClick={() => setShowUploadModal(true)} style={{ padding:'12px 24px' }}>{t("+ رفع ملخص جديد")}</Btn>
            </div>
            {items.map(item => { 
              const statusColor = item.is_approved ? C.green : (item.is_rejected ? C.red : C.gold); 
              const statusLabel = item.is_approved ? t('مقبول') : (item.is_rejected ? t('مرفوض') : t('قيد المراجعة')); 
              return (
                <Card key={item.id} style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16, opacity: 1 }} hover>
                  <div style={{ width:44, height:44, borderRadius:11, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><PiFilePdfDuotone size={24} style={{color:C.blue}} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <div style={{ fontWeight:700, color:C.dark, fontSize:'0.9rem' }}>{item.title}</div>
                      {item.is_anonymous && <Badge color={C.blue} style={{ display:'flex', alignItems:'center', gap:4 }}><PiUserCircleDuotone size={12}/> {t("مجهول")}</Badge>}
                      {item.user?.is_trusted && <PiSealCheckFill size={16} color={C.blue} title={t("موثق")}/>}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ color:statusColor, fontSize:'0.76rem', fontWeight:800 }}>{statusLabel}</span>
                      <span style={{ color:C.muted, fontSize:'0.76rem' }}>{item.resource_type === 1 ? 'PDF' : item.resource_type} · {item.subject?.code}</span>
                      <span style={{ color:C.gold, fontSize:'0.76rem', display:'flex', alignItems:'center', gap:4 }}><PiStarDuotone /> {likesToPoints(item.likes_count)}{t(" نقطة")}</span>
                      {item.is_approved && (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.76rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiDownloadSimpleDuotone size={14} /> {item.downloads_count} {t("تحميل")}</div>
                      )}
                      <span style={{ color:C.muted, fontSize:'0.76rem' }}>{formatFileSize(item.file_size)}</span>
                      {item.doctor && <span style={{ color:C.blue, fontSize:'0.76rem', fontWeight:600 }}>{t("بإشراف: ")}{item.doctor}</span>}
                    </div>
                  </div>
                  
                  <div style={{ display:'flex', gap:10, alignItems:'center' }}>
                    <div style={{ display:'flex', gap:8, alignItems:'center', background:C.bg, padding:'6px 12px', borderRadius:20 }}>
                       <span style={{ display:'flex', alignItems:'center', gap:4, color:C.green, fontWeight:700, fontSize:'0.82rem' }}><PiThumbsUpDuotone /> {item.likes_count}</span>
                       <span style={{ display:'flex', alignItems:'center', gap:4, color:C.red, fontWeight:700, fontSize:'0.82rem' }}><PiThumbsDownDuotone /> {item.dislikes_count}</span>
                    </div>

                    {item.is_approved && (
                      <Btn variant="ghost" style={{ fontSize:'0.78rem', padding:'6px 12px' }} onClick={() => {
                        handleInteraction('download', item.id);
                        window.open(getApiUrl() + item.file_url, '_blank');
                      }}>{t("تحميل ↓")}</Btn>
                    )}
                  </div>
                </Card>
              ); 
            })}
          </div>
        )}

        {!loading && tab==='courses' && (
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            <div style={{ marginBottom:10 }}>
              <Btn variant="secondary" style={{ display:'flex', alignItems:'center', gap:8, padding:'12px 24px' }} onClick={() => setShowAddCourseModal(true)}>
                  {t("+ إضافة دورة / رابط جديد")}
              </Btn>
            </div>
            {courses.map(c => (
              <Card key={c.id} style={{ padding:'20px 24px', display:'flex', alignItems:'center', gap:20 }} hover>
                <div style={{ width:50, height:50, borderRadius:14, background: c.platform === 'YouTube' ? C.redBg : C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
                  <PiPlayCircleDuotone size={28} style={{color: c.platform === 'YouTube' ? C.red : C.blue}}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:6 }}>
                      <div style={{ fontWeight:800, color:C.dark, fontSize:'1rem' }}>{c.title}</div>
                      <Badge color={c.platform === 'YouTube' ? C.red : C.blue}>{c.platform}</Badge>
                  </div>
                  <div style={{ fontSize:'0.85rem', color:C.muted, marginBottom:10, lineHeight:1.5, maxWidth:'90%' }}>{c.description}</div>
                  <div style={{ display:'flex', gap:16, alignItems:'center' }}>
                     <span style={{ fontSize:'0.76rem', color:C.muted, display:'flex', alignItems:'center', gap:5 }}><PiClockDuotone /> {t("المدة المقدرة: ")}{c.duration}</span>
                     <span style={{ fontSize:'0.76rem', color:C.green, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><PiThumbsUpDuotone /> {c.likes} {t("إعجاب")}</span>
                     <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.76rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiCursorClickDuotone size={14} /> {c.clicks} {t("زيارة")}</div>
                  </div>
                </div>
                <Btn variant="ghost" style={{ fontSize:'0.82rem', padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }} onClick={() => {
                  handleInteraction('download', c.id);
                  window.open(c.url, '_blank');
                }}>
                  <PiLinkDuotone /> {t("فتح الرابط")}
                </Btn>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:C.white, borderRadius:16, padding:"32px", width:480, maxWidth:"90%", boxShadow:"0 20px 40px rgba(0,0,0,0.15)" }}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:20 }}>{t("رفع ملخص جديد")}</h3>
              <form onSubmit={submitUpload}>
                <Field label={t("المادة الدراسية")}>
                  <select style={inputStyle} required value={uploadData.subject_id} onChange={e => setUploadData({...uploadData, subject_id: e.target.value})}>
                    <option value="">{t("اختر المادة...")}</option>
                    {myCourses.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.code}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("عنوان الملخص")}>
                  <input required placeholder={t("مثال: ملخص الفصل الأول...")} style={inputStyle} value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} />
                </Field>
                <Field label={t("اسم الدكتور (اختياري)")}>
                  <input placeholder={t("مثال: د. أحمد محمد")} style={inputStyle} value={uploadData.doctor} onChange={e => setUploadData({...uploadData, doctor: e.target.value})} />
                </Field>
                <Field label={t("وصف قصير")}>
                  <textarea rows={3} placeholder={t("اكتب نبذة عن محتوى الملخص...")} style={{...inputStyle, resize:'vertical'}} value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})} />
                </Field>
                <Field label={t("ملف الملخص (PDF, PPTX, DOCX)")}>
                  <input type="file" required style={{...inputStyle, padding:'9px'}} onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} />
                </Field>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:24 }}>
                  <input type="checkbox" id="hideName" style={{ width:16, height:16, accentColor:C.blue }} checked={uploadData.is_anonymous} onChange={e => setUploadData({...uploadData, is_anonymous: e.target.checked})} />
                  <label htmlFor="hideName" style={{ fontSize:'0.85rem', color:C.dark }}>{t("إخفاء اسمي كمساهم (نشر كـ مجهول)")}</label>
                </div>
                <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                  <Btn type="button" variant="secondary" onClick={() => setShowUploadModal(false)}>{t("إلغاء")}</Btn>
                  <Btn type="submit">{t("← رفع الملخص")}</Btn>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(5px)' }} onClick={() => setShowAddCourseModal(false)}>
            <div style={{ background:C.white, borderRadius:20, padding:"32px", width:500, maxWidth:"90%", boxShadow:"0 25px 50px rgba(0,0,0,0.2)", animation:'modalFadeIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:6 }}>{t("إضافة دورة أو رابط جديد")}</h3>
              <p style={{ color:C.muted, fontSize:'0.88rem', marginBottom:24 }}>{t("شارك الفائدة مع زملائك بإضافة روابط تعليمية مميزة.")}</p>
              
              <form onSubmit={submitCourse}>
                  <Field label={t("المادة الدراسية")}>
                      <select style={inputStyle} required value={courseData.subject_id} onChange={e => setCourseData({...courseData, subject_id: e.target.value})}>
                          <option value="">{t("اختر المادة...")}</option>
                          {myCourses.map(s => (
                              <option key={s.id} value={s.id}>{s.name} - {s.code}</option>
                          ))}
                      </select>
                  </Field>

                  <Field label={t("عنوان الدورة / الرابط")}>
                      <input required placeholder={t("مثال: تعلم بايثون من الصفر...")} style={inputStyle} value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} />
                  </Field>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <Field label={t("المنصة")}>
                          <select style={inputStyle} required value={courseData.platform} onChange={e => setCourseData({...courseData, platform: e.target.value})}>
                              <option value="YouTube">YouTube</option>
                              <option value="Udemy">Udemy</option>
                              <option value="Coursera">Coursera</option>
                              <option value="Other">{t("أخرى")}</option>
                          </select>
                      </Field>
                      <Field label={t("الوقت اللازم للإنهاء")}>
                          <input required placeholder={t("مثال: 10 ساعات")} style={inputStyle} value={courseData.duration} onChange={e => setCourseData({...courseData, duration: e.target.value})} />
                      </Field>
                  </div>

                  <Field label={t("رابط الدورة (URL)")}>
                      <input type="url" required placeholder="https://..." style={inputStyle} value={courseData.url} onChange={e => setCourseData({...courseData, url: e.target.value})} />
                  </Field>

                  <Field label={t("وصف محتوى الدورة")}>
                      <textarea required rows={3} placeholder={t("ماذا تقدم هذه الدورة؟ وما أهم ميزاتها؟")} style={{...inputStyle, resize:'vertical'}} value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} />
                  </Field>

                  <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
                      <Btn type="button" variant="secondary" style={{ padding:'10px 24px' }} onClick={() => setShowAddCourseModal(false)}>{t("إلغاء")}</Btn>
                      <Btn type="submit" style={{ padding:'10px 32px' }}>{t("نشر الرابط")}</Btn>
                  </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(5px)' }} onClick={() => setShowEditModal(false)}>
            <div style={{ background:C.white, borderRadius:20, padding:"32px", width:440, maxWidth:"90%", boxShadow:"0 25px 50px rgba(0,0,0,0.2)", animation:'modalFadeIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:20 }}>{t("تعديل تفاصيل المورد")}</h3>
              
              <Field label={t("اسم الدكتور")}>
                <input value={editingItem.doctor} onChange={e => setEditingItem({ ...editingItem, doctor: e.target.value })} placeholder={t("مثال: د. أحمد محمد")} style={inputStyle} />
              </Field>
              
              <div style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 14px', borderRadius:12, background: editingItem.isAnonymous ? C.blueLight : C.bg, border:`1.5px solid ${editingItem.isAnonymous ? C.blue : C.border}`, cursor:'pointer', transition:'all .2s' }} onClick={()=>setEditingItem({...editingItem, isAnonymous:!editingItem.isAnonymous})}>
                      <input type="checkbox" checked={editingItem.isAnonymous} readOnly style={{ width:18, height:18, accentColor:C.blue }} />
                      <label style={{ fontSize:'0.9rem', color:C.dark, cursor:'pointer', fontWeight:600 }}>{t("إظهار كمساهم مجهول")}</label>
                  </div>
                  <p style={{ color:C.muted, fontSize:'0.75rem', marginTop:6, paddingRight:32 }}>{t("لن يظهر اسمك الحقيقي للمستخدمين الآخرين عند تفعيل هذا الخيار.")}</p>
              </div>

              <div style={{ marginBottom:28 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 14px', borderRadius:12, background: editingItem.isActive ? C.greenBg : C.bg, border:`1.5px solid ${editingItem.isActive ? C.green : C.border}`, cursor:'pointer', transition:'all .2s' }} onClick={()=>setEditingItem({...editingItem, isActive:!editingItem.isActive})}>
                      <input type="checkbox" checked={editingItem.isActive} readOnly style={{ width:18, height:18, accentColor:C.green }} />
                      <label style={{ fontSize:'0.9rem', color:C.dark, cursor:'pointer', fontWeight:600 }}>{t("المورد نشط (ظاهر للعامة)")}</label>
                  </div>
                  <p style={{ color:C.muted, fontSize:'0.75rem', marginTop:6, paddingRight:32 }}>{t("يمكنك إيقاف تنشيط المورد مؤقتاً لمنع الآخرين من الوصول إليه.")}</p>
              </div>

              <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                <Btn variant="secondary" style={{ padding:'10px 24px' }} onClick={() => setShowEditModal(false)}>{t("إلغاء")}</Btn>
                <Btn style={{ padding:'10px 32px' }} onClick={() => {
                  setItems(arr => arr.map(it => it.id === editingItem.id ? editingItem : it));
                  setShowEditModal(false);
                }}>{t("حفظ التغييرات")}</Btn>
              </div>
            </div>
          </div>
        )}
      </FadeIn>
    </DashboardLayout>
  );
}
