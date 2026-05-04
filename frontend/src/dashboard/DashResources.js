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
         duration: i.duration || t('ط؛ظٹط± ظ…ط­ط¯ط¯'),
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
            alert(data.message || "ظپط´ظ„ ط§ظ„ط±ظپط¹");
        }
    } catch(e) {
        alert("ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط±ظپط¹");
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
            alert(data.message || "ظپط´ظ„ ط§ظ„ط¥ط±ط³ط§ظ„");
        }
    } catch(e) {
        alert("ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط§ظ„ط¥ط±ط³ط§ظ„");
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
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("ظ…ظˆط§ط±ط¯ظٹ")}</h1>
          <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("ظ…ظ„ط®طµط§طھظƒ ظˆط¯ظˆط±ط§طھظƒ ط§ظ„ط¯ط±ط§ط³ظٹط© ط§ظ„ظ…ط´طھط±ظƒط©")}</p>
        </div>
        
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
          {[['summaries',t('ط§ظ„ظ…ظ„ط®طµط§طھ')],['courses',t('ط§ظ„ط¯ظˆط±ط§طھ')]].map(([id,l]) => (
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
              <Btn variant="secondary" onClick={() => setShowUploadModal(true)} style={{ padding:'12px 24px' }}>{t("+ ط±ظپط¹ ظ…ظ„ط®طµ ط¬ط¯ظٹط¯")}</Btn>
            </div>
            {items.map(item => { 
              const statusColor = item.is_approved ? C.green : (item.is_rejected ? C.red : C.gold); 
              const statusLabel = item.is_approved ? t('ظ…ظ‚ط¨ظˆظ„') : (item.is_rejected ? t('ظ…ط±ظپظˆط¶') : t('ظ‚ظٹط¯ ط§ظ„ظ…ط±ط§ط¬ط¹ط©')); 
              return (
                <Card key={item.id} style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:16, opacity: 1 }} hover>
                  <div style={{ width:44, height:44, borderRadius:11, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}><PiFilePdfDuotone size={24} style={{color:C.blue}} /></div>
                  <div style={{ flex:1 }}>
                    <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                      <div style={{ fontWeight:700, color:C.dark, fontSize:'0.9rem' }}>{item.title}</div>
                      {item.is_anonymous && <Badge color={C.blue} style={{ display:'flex', alignItems:'center', gap:4 }}><PiUserCircleDuotone size={12}/> {t("ظ…ط¬ظ‡ظˆظ„")}</Badge>}
                      {item.user?.is_trusted && <PiSealCheckFill size={16} color={C.blue} title={t("ظ…ظˆط«ظ‚")}/>}
                    </div>
                    <div style={{ display:'flex', gap:10, alignItems:'center', flexWrap:'wrap' }}>
                      <span style={{ color:statusColor, fontSize:'0.76rem', fontWeight:800 }}>{statusLabel}</span>
                      <span style={{ color:C.muted, fontSize:'0.76rem' }}>{item.resource_type === 1 ? 'PDF' : item.resource_type} آ· {item.subject?.code}</span>
                      <span style={{ color:C.gold, fontSize:'0.76rem', display:'flex', alignItems:'center', gap:4 }}><PiStarDuotone /> {likesToPoints(item.likes_count)}{t(" ظ†ظ‚ط·ط©")}</span>
                      {item.is_approved && (
                        <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.76rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiDownloadSimpleDuotone size={14} /> {item.downloads_count} {t("طھط­ظ…ظٹظ„")}</div>
                      )}
                      <span style={{ color:C.muted, fontSize:'0.76rem' }}>{formatFileSize(item.file_size)}</span>
                      {item.doctor && <span style={{ color:C.blue, fontSize:'0.76rem', fontWeight:600 }}>{t("ط¨ط¥ط´ط±ط§ظپ: ")}{item.doctor}</span>}
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
                      }}>{t("طھط­ظ…ظٹظ„ â†“")}</Btn>
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
                  {t("+ ط¥ط¶ط§ظپط© ط¯ظˆط±ط© / ط±ط§ط¨ط· ط¬ط¯ظٹط¯")}
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
                     <span style={{ fontSize:'0.76rem', color:C.muted, display:'flex', alignItems:'center', gap:5 }}><PiClockDuotone /> {t("ط§ظ„ظ…ط¯ط© ط§ظ„ظ…ظ‚ط¯ط±ط©: ")}{c.duration}</span>
                     <span style={{ fontSize:'0.76rem', color:C.green, fontWeight:700, display:'flex', alignItems:'center', gap:5 }}><PiThumbsUpDuotone /> {c.likes} {t("ط¥ط¹ط¬ط§ط¨")}</span>
                     <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.76rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiCursorClickDuotone size={14} /> {c.clicks} {t("ط²ظٹط§ط±ط©")}</div>
                  </div>
                </div>
                <Btn variant="ghost" style={{ fontSize:'0.82rem', padding:'10px 16px', display:'flex', alignItems:'center', gap:6 }} onClick={() => {
                  handleInteraction('download', c.id);
                  window.open(c.url, '_blank');
                }}>
                  <PiLinkDuotone /> {t("ظپطھط­ ط§ظ„ط±ط§ط¨ط·")}
                </Btn>
              </Card>
            ))}
          </div>
        )}

        {/* Upload Modal */}
        {showUploadModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
            <div style={{ background:C.white, borderRadius:16, padding:"32px", width:480, maxWidth:"90%", boxShadow:"0 20px 40px rgba(0,0,0,0.15)" }}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:20 }}>{t("ط±ظپط¹ ظ…ظ„ط®طµ ط¬ط¯ظٹط¯")}</h3>
              <form onSubmit={submitUpload}>
                <Field label={t("ط§ظ„ظ…ط§ط¯ط© ط§ظ„ط¯ط±ط§ط³ظٹط©")}>
                  <select style={inputStyle} required value={uploadData.subject_id} onChange={e => setUploadData({...uploadData, subject_id: e.target.value})}>
                    <option value="">{t("ط§ط®طھط± ط§ظ„ظ…ط§ط¯ط©...")}</option>
                    {myCourses.map(s => (
                        <option key={s.id} value={s.id}>{s.name} - {s.code}</option>
                    ))}
                  </select>
                </Field>
                <Field label={t("ط¹ظ†ظˆط§ظ† ط§ظ„ظ…ظ„ط®طµ")}>
                  <input required placeholder={t("ظ…ط«ط§ظ„: ظ…ظ„ط®طµ ط§ظ„ظپطµظ„ ط§ظ„ط£ظˆظ„...")} style={inputStyle} value={uploadData.title} onChange={e => setUploadData({...uploadData, title: e.target.value})} />
                </Field>
                <Field label={t("ط§ط³ظ… ط§ظ„ط¯ظƒطھظˆط± (ط§ط®طھظٹط§ط±ظٹ)")}>
                  <input placeholder={t("ظ…ط«ط§ظ„: ط¯. ط£ط­ظ…ط¯ ظ…ط­ظ…ط¯")} style={inputStyle} value={uploadData.doctor} onChange={e => setUploadData({...uploadData, doctor: e.target.value})} />
                </Field>
                <Field label={t("ظˆطµظپ ظ‚طµظٹط±")}>
                  <textarea rows={3} placeholder={t("ط§ظƒطھط¨ ظ†ط¨ط°ط© ط¹ظ† ظ…ط­طھظˆظ‰ ط§ظ„ظ…ظ„ط®طµ...")} style={{...inputStyle, resize:'vertical'}} value={uploadData.description} onChange={e => setUploadData({...uploadData, description: e.target.value})} />
                </Field>
                <Field label={t("ظ…ظ„ظپ ط§ظ„ظ…ظ„ط®طµ (PDF, PPTX, DOCX)")}>
                  <input type="file" required style={{...inputStyle, padding:'9px'}} onChange={e => setUploadData({...uploadData, file: e.target.files[0]})} />
                </Field>
                <div style={{ display:'flex', gap:10, alignItems:'center', marginBottom:24 }}>
                  <input type="checkbox" id="hideName" style={{ width:16, height:16, accentColor:C.blue }} checked={uploadData.is_anonymous} onChange={e => setUploadData({...uploadData, is_anonymous: e.target.checked})} />
                  <label htmlFor="hideName" style={{ fontSize:'0.85rem', color:C.dark }}>{t("ط¥ط®ظپط§ط، ط§ط³ظ…ظٹ ظƒظ…ط³ط§ظ‡ظ… (ظ†ط´ط± ظƒظ€ ظ…ط¬ظ‡ظˆظ„)")}</label>
                </div>
                <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                  <Btn type="button" variant="secondary" onClick={() => setShowUploadModal(false)}>{t("ط¥ظ„ط؛ط§ط،")}</Btn>
                  <Btn type="submit">{t("â†گ ط±ظپط¹ ط§ظ„ظ…ظ„ط®طµ")}</Btn>
                </div>
              </form>
            </div>
          </div>
        )}

        {/* Add Course Modal */}
        {showAddCourseModal && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(5px)' }} onClick={() => setShowAddCourseModal(false)}>
            <div style={{ background:C.white, borderRadius:20, padding:"32px", width:500, maxWidth:"90%", boxShadow:"0 25px 50px rgba(0,0,0,0.2)", animation:'modalFadeIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:6 }}>{t("ط¥ط¶ط§ظپط© ط¯ظˆط±ط© ط£ظˆ ط±ط§ط¨ط· ط¬ط¯ظٹط¯")}</h3>
              <p style={{ color:C.muted, fontSize:'0.88rem', marginBottom:24 }}>{t("ط´ط§ط±ظƒ ط§ظ„ظپط§ط¦ط¯ط© ظ…ط¹ ط²ظ…ظ„ط§ط¦ظƒ ط¨ط¥ط¶ط§ظپط© ط±ظˆط§ط¨ط· طھط¹ظ„ظٹظ…ظٹط© ظ…ظ…ظٹط²ط©.")}</p>
              
              <form onSubmit={submitCourse}>
                  <Field label={t("ط§ظ„ظ…ط§ط¯ط© ط§ظ„ط¯ط±ط§ط³ظٹط©")}>
                      <select style={inputStyle} required value={courseData.subject_id} onChange={e => setCourseData({...courseData, subject_id: e.target.value})}>
                          <option value="">{t("ط§ط®طھط± ط§ظ„ظ…ط§ط¯ط©...")}</option>
                          {myCourses.map(s => (
                              <option key={s.id} value={s.id}>{s.name} - {s.code}</option>
                          ))}
                      </select>
                  </Field>

                  <Field label={t("ط¹ظ†ظˆط§ظ† ط§ظ„ط¯ظˆط±ط© / ط§ظ„ط±ط§ط¨ط·")}>
                      <input required placeholder={t("ظ…ط«ط§ظ„: طھط¹ظ„ظ… ط¨ط§ظٹط«ظˆظ† ظ…ظ† ط§ظ„طµظپط±...")} style={inputStyle} value={courseData.title} onChange={e => setCourseData({...courseData, title: e.target.value})} />
                  </Field>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                      <Field label={t("ط§ظ„ظ…ظ†طµط©")}>
                          <select style={inputStyle} required value={courseData.platform} onChange={e => setCourseData({...courseData, platform: e.target.value})}>
                              <option value="YouTube">YouTube</option>
                              <option value="Udemy">Udemy</option>
                              <option value="Coursera">Coursera</option>
                              <option value="Other">{t("ط£ط®ط±ظ‰")}</option>
                          </select>
                      </Field>
                      <Field label={t("ط§ظ„ظˆظ‚طھ ط§ظ„ظ„ط§ط²ظ… ظ„ظ„ط¥ظ†ظ‡ط§ط،")}>
                          <input required placeholder={t("ظ…ط«ط§ظ„: 10 ط³ط§ط¹ط§طھ")} style={inputStyle} value={courseData.duration} onChange={e => setCourseData({...courseData, duration: e.target.value})} />
                      </Field>
                  </div>

                  <Field label={t("ط±ط§ط¨ط· ط§ظ„ط¯ظˆط±ط© (URL)")}>
                      <input type="url" required placeholder="https://..." style={inputStyle} value={courseData.url} onChange={e => setCourseData({...courseData, url: e.target.value})} />
                  </Field>

                  <Field label={t("ظˆطµظپ ظ…ط­طھظˆظ‰ ط§ظ„ط¯ظˆط±ط©")}>
                      <textarea required rows={3} placeholder={t("ظ…ط§ط°ط§ طھظ‚ط¯ظ… ظ‡ط°ظ‡ ط§ظ„ط¯ظˆط±ط©طں ظˆظ…ط§ ط£ظ‡ظ… ظ…ظٹط²ط§طھظ‡ط§طں")} style={{...inputStyle, resize:'vertical'}} value={courseData.description} onChange={e => setCourseData({...courseData, description: e.target.value})} />
                  </Field>

                  <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
                      <Btn type="button" variant="secondary" style={{ padding:'10px 24px' }} onClick={() => setShowAddCourseModal(false)}>{t("ط¥ظ„ط؛ط§ط،")}</Btn>
                      <Btn type="submit" style={{ padding:'10px 32px' }}>{t("ظ†ط´ط± ط§ظ„ط±ط§ط¨ط·")}</Btn>
                  </div>
              </form>
            </div>
          </div>
        )}

        {/* Edit Modal */}
        {showEditModal && editingItem && (
          <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(5px)' }} onClick={() => setShowEditModal(false)}>
            <div style={{ background:C.white, borderRadius:20, padding:"32px", width:440, maxWidth:"90%", boxShadow:"0 25px 50px rgba(0,0,0,0.2)", animation:'modalFadeIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
              <h3 style={{ fontWeight:800, color:C.dark, marginBottom:20 }}>{t("طھط¹ط¯ظٹظ„ طھظپط§طµظٹظ„ ط§ظ„ظ…ظˆط±ط¯")}</h3>
              
              <Field label={t("ط§ط³ظ… ط§ظ„ط¯ظƒطھظˆط±")}>
                <input value={editingItem.doctor} onChange={e => setEditingItem({ ...editingItem, doctor: e.target.value })} placeholder={t("ظ…ط«ط§ظ„: ط¯. ط£ط­ظ…ط¯ ظ…ط­ظ…ط¯")} style={inputStyle} />
              </Field>
              
              <div style={{ marginBottom:20 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 14px', borderRadius:12, background: editingItem.isAnonymous ? C.blueLight : C.bg, border:`1.5px solid ${editingItem.isAnonymous ? C.blue : C.border}`, cursor:'pointer', transition:'all .2s' }} onClick={()=>setEditingItem({...editingItem, isAnonymous:!editingItem.isAnonymous})}>
                      <input type="checkbox" checked={editingItem.isAnonymous} readOnly style={{ width:18, height:18, accentColor:C.blue }} />
                      <label style={{ fontSize:'0.9rem', color:C.dark, cursor:'pointer', fontWeight:600 }}>{t("ط¥ط¸ظ‡ط§ط± ظƒظ…ط³ط§ظ‡ظ… ظ…ط¬ظ‡ظˆظ„")}</label>
                  </div>
                  <p style={{ color:C.muted, fontSize:'0.75rem', marginTop:6, paddingRight:32 }}>{t("ظ„ظ† ظٹط¸ظ‡ط± ط§ط³ظ…ظƒ ط§ظ„ط­ظ‚ظٹظ‚ظٹ ظ„ظ„ظ…ط³طھط®ط¯ظ…ظٹظ† ط§ظ„ط¢ط®ط±ظٹظ† ط¹ظ†ط¯ طھظپط¹ظٹظ„ ظ‡ط°ط§ ط§ظ„ط®ظٹط§ط±.")}</p>
              </div>

              <div style={{ marginBottom:28 }}>
                  <div style={{ display:'flex', gap:12, alignItems:'center', padding:'12px 14px', borderRadius:12, background: editingItem.isActive ? C.greenBg : C.bg, border:`1.5px solid ${editingItem.isActive ? C.green : C.border}`, cursor:'pointer', transition:'all .2s' }} onClick={()=>setEditingItem({...editingItem, isActive:!editingItem.isActive})}>
                      <input type="checkbox" checked={editingItem.isActive} readOnly style={{ width:18, height:18, accentColor:C.green }} />
                      <label style={{ fontSize:'0.9rem', color:C.dark, cursor:'pointer', fontWeight:600 }}>{t("ط§ظ„ظ…ظˆط±ط¯ ظ†ط´ط· (ط¸ط§ظ‡ط± ظ„ظ„ط¹ط§ظ…ط©)")}</label>
                  </div>
                  <p style={{ color:C.muted, fontSize:'0.75rem', marginTop:6, paddingRight:32 }}>{t("ظٹظ…ظƒظ†ظƒ ط¥ظٹظ‚ط§ظپ طھظ†ط´ظٹط· ط§ظ„ظ…ظˆط±ط¯ ظ…ط¤ظ‚طھط§ظ‹ ظ„ظ…ظ†ط¹ ط§ظ„ط¢ط®ط±ظٹظ† ظ…ظ† ط§ظ„ظˆطµظˆظ„ ط¥ظ„ظٹظ‡.")}</p>
              </div>

              <div style={{ display:"flex", gap:12, justifyContent:"flex-end" }}>
                <Btn variant="secondary" style={{ padding:'10px 24px' }} onClick={() => setShowEditModal(false)}>{t("ط¥ظ„ط؛ط§ط،")}</Btn>
                <Btn style={{ padding:'10px 32px' }} onClick={() => {
                  setItems(arr => arr.map(it => it.id === editingItem.id ? editingItem : it));
                  setShowEditModal(false);
                }}>{t("ط­ظپط¸ ط§ظ„طھط؛ظٹظٹط±ط§طھ")}</Btn>
              </div>
            </div>
          </div>
        )}
      </FadeIn>
    </DashboardLayout>
  );
}

