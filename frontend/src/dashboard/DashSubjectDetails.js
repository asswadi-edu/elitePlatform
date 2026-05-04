import React, { useState, useContext } from 'react';`nimport { UserContext } from '../UserContext';
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
        <div onClick={onClose} style={{ position:'absolute', top:20, right:20, cursor:'pointer', fontSize:'1.5rem', color:C.muted }}>أ—</div>
        <h3 style={{ fontWeight:800, color:C.dark, marginBottom:8, fontSize:'1.2rem' }}>{t("ط·ظ„ط¨ ظ…ظ„ط®طµ ظ…ظپظ‚ظˆط¯")}</h3>
        <p style={{ color:C.muted, fontSize:'0.82rem', marginBottom:24, lineHeight:1.5 }}>{t("ط³ظٹطھظ… ط¥ط±ط³ط§ظ„ ط·ظ„ط¨ظƒ ظ„ظ„ط·ظ„ط§ط¨ ط§ظ„ظ…ظ…ظٹط²ظٹظ† ظˆط§ظ„ظ…ط³ط§ظ‡ظ…ظٹظ† ظپظٹ ظ‡ط°ظ‡ ط§ظ„ظ…ط§ط¯ط©.")}</p>
        
        <form onSubmit={(e) => { e.preventDefault(); alert(t('طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨ ط¨ظ†ط¬ط§ط­!')); onClose(); }}>
          <Field label={t("ط§ظ„ظ…ط§ط¯ط© ط§ظ„ط¯ط±ط§ط³ظٹط©")}>
            <input value={subject.title} disabled style={{ ...inputStyle, background:C.bg, cursor:'not-allowed' }} />
          </Field>
          <Field label={t("ظ…ظˆط¶ظˆط¹ ط§ظ„ط·ظ„ط¨ / ط§ظ„ط¬ط²ط، ط§ظ„ظ…ظپظ‚ظˆط¯")}>
            <textarea required rows={4} placeholder={t("ظ…ط«ط§ظ„: ط£ط­طھط§ط¬ ظ„ظ…ظ„ط®طµ ظٹط´ط±ط­ ط®ظˆط§ط±ط²ظ…ظٹط§طھ ط§ظ„طھط±طھظٹط¨ (Sorting Algorithms) ظ„ظ„ظپطµظ„ ط§ظ„ط±ط§ط¨ط¹...")} style={{...inputStyle, resize:'vertical'}} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
          </Field>
          <div style={{ display:"flex", gap:12, justifyContent:"flex-end", marginTop:24 }}>
            <Btn type="button" variant="secondary" onClick={onClose} style={{ flex:1 }}>{t("ط¥ظ„ط؛ط§ط،")}</Btn>
            <Btn type="submit" style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
              {t("â†گ ط¥ط±ط³ط§ظ„ ط§ظ„ط·ظ„ط¨")} <PiPaperPlaneTiltDuotone size={18}/>
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
    t("ظ…ط­طھظˆظ‰ ط؛ظٹط± ظ„ط§ط¦ظ‚"),
    t("ظ…ط¹ظ„ظˆظ…ط§طھ ط؛ظٹط± طµط­ظٹط­ط©"),
    t("ظ…ظˆط±ط¯ ظ…ظƒط±ط±"),
    t("ط£ط®ط±ظ‰")
  ];

  const handleSendReport = async () => {
    if (!reason) return alert(t('ظٹط±ط¬ظ‰ ط§ط®طھظٹط§ط± ط³ط¨ط¨'));
    if (reason === t("ط£ط®ط±ظ‰") && !otherReason.trim()) return alert(t('ظٹط±ط¬ظ‰ ظƒطھط§ط¨ط© ط§ظ„ط³ط¨ط¨'));
    
    // Map text reason to DB integer (1=inappropriate, 2=broken, 3=duplicate, 4=other)
    const reasonMap = {
      [t("ظ…ط­طھظˆظ‰ ط؛ظٹط± ظ„ط§ط¦ظ‚")]: 1,
      [t("ظ…ظ„ظپ طھط§ظ„ظپ ط£ظˆ ط®ط§ط·ط¦")]: 2,
      [t("ظ…ظˆط±ط¯ ظ…ظƒط±ط±")]: 3,
      [t("ط£ط®ط±ظ‰")]: 4
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
          description: reason === t("ط£ط®ط±ظ‰") ? otherReason : reason
        })
      });

      if (res.ok) {
        alert(t('طھظ… ط¥ط±ط³ط§ظ„ ط§ظ„ط¨ظ„ط§ط؛ ط¨ظ†ط¬ط§ط­!'));
        onClose();
        setReporting(false);
        setReason('');
        setOtherReason('');
      } else {
        alert(t('ط­ط¯ط« ط®ط·ط£ ط£ط«ظ†ط§ط، ط¥ط±ط³ط§ظ„ ط§ظ„ط¨ظ„ط§ط؛'));
      }
    } catch(e) {
      alert(t('طھط¹ط°ط± ط§ظ„ط§طھطµط§ظ„ ط¨ط§ظ„ط®ط§ط¯ظ…'));
    }
  };

  return (
    <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:20 }}>
      <Card style={{ maxWidth:500, width:'100%', padding:32, position:'relative' }} hover={false}>
        <div onClick={onClose} style={{ position:'absolute', top:20, right:20, cursor:'pointer', fontSize:'1.5rem', color:C.muted }}>أ—</div>
        
        {!reporting ? (
          <>
            <h2 style={{ fontWeight:800, color:C.dark, marginBottom:24, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:10 }}>
              <PiInfoDuotone color={C.blue}/> {t("طھظپط§طµظٹظ„ ط§ظ„ظ…ظˆط±ط¯")}
            </h2>
            
            <div style={{ display:'flex', flexDirection:'column', gap:18, marginBottom:32 }}>
              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiUserDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("طµط§ط­ط¨ ط§ظ„ظ…ظˆط±ط¯")}</div>
                  <div style={{ fontWeight:700, color:C.dark, display:'flex', alignItems:'center', gap:4 }}>
                    {item.isAnonymous ? t("ظ…ط¬ظ‡ظˆظ„") : item.author}
                    {item.isTrusted && <PiSealCheckFill size={16} color={C.blue} title={t("ظ…ظˆط«ظ‚")}/>}
                  </div>
                </div>
              </div>

              {!item.isAnonymous && (
                <>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiIdentificationCardDuotone size={20}/></div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("ظ…ط³طھظˆظ‰ ط§ظ„ط·ط§ظ„ط¨")}</div>
                      <div style={{ fontWeight:700, color:C.dark }}>{item.level}</div>
                    </div>
                  </div>
                  <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                    <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiGraduationCapDuotone size={20}/></div>
                    <div>
                      <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("ط§ظ„ط¬ط§ظ…ط¹ط©")}</div>
                      <div style={{ fontWeight:700, color:C.dark }}>{item.university}</div>
                    </div>
                  </div>
                </>
              )}

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiIdentificationCardDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("ط§ط³ظ… ط§ظ„ط¯ظƒطھظˆط± ط§ظ„ظ…ظ‚ط±ط±")}</div>
                  <div style={{ fontWeight:700, color:C.dark }}>{item.doctor}</div>
                </div>
              </div>

              <div style={{ display:'flex', alignItems:'center', gap:12 }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiHardDriveDuotone size={20}/></div>
                <div>
                  <div style={{ fontSize:'0.75rem', color:C.muted }}>{t("ط­ط¬ظ… ط§ظ„ظ…ظ„ظپ")}</div>
                  <div style={{ fontWeight:700, color:C.dark }}>{item.size}</div>
                </div>
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Btn onClick={() => setReporting(true)} variant="secondary" style={{ flex:1, color:C.red, borderColor:C.red+'40', background:C.red+'08' }}>
                <PiWarningDuotone style={{ verticalAlign:'middle', marginInlineEnd:6 }}/> {t("ط¥ط¨ظ„ط§ط؛ ط¹ظ† ط§ظ„ظ…ظˆط±ط¯")}
              </Btn>
              <Btn onClick={onClose} style={{ flex:1 }}>{t("ط¥ط؛ظ„ط§ظ‚")}</Btn>
            </div>
          </>
        ) : (
          <>
            <h2 style={{ fontWeight:800, color:C.dark, marginBottom:24, fontSize:'1.3rem', display:'flex', alignItems:'center', gap:10 }}>
              <PiWarningDuotone color={C.red}/> {t("ط¥ط¨ظ„ط§ط؛ ط¹ظ† ط§ظ„ظ…ظˆط±ط¯")}
            </h2>
            
            <div style={{ marginBottom:32 }}>
              <label style={{ display:'block', fontWeight:600, fontSize:'0.86rem', color:C.dark, marginBottom:12 }}>{t("ط³ط¨ط¨ ط§ظ„ط¥ط¨ظ„ط§ط؛")}</label>
              <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                {reasons.map(r => (
                  <div key={r}>
                    <div onClick={() => setReason(r)} style={{ padding:'12px 16px', borderRadius:11, border:`1.5px solid ${reason === r ? C.red : C.border}`, background: reason === r ? C.red+'08' : C.bg, cursor:'pointer', fontSize:'0.9rem', color: reason === r ? C.red : C.dark, fontWeight: reason === r ? 700 : 500, transition:'all .2s' }}>
                      {r}
                    </div>
                    {r === t("ط£ط®ط±ظ‰") && reason === r && (
                      <textarea 
                        value={otherReason} 
                        onChange={e => setOtherReason(e.target.value)} 
                        placeholder={t("ط§ظƒطھط¨ ط§ظ„ط³ط¨ط¨ ظ‡ظ†ط§...")}
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
              <Btn onClick={() => { setReporting(false); setReason(''); setOtherReason(''); }} variant="secondary" style={{ flex:1 }}>{t("ط¥ظ„ط؛ط§ط،")}</Btn>
              <Btn onClick={handleSendReport} variant="danger" disabled={!reason || (reason === t("ط£ط®ط±ظ‰") && !otherReason.trim())} style={{ flex:1 }}>
                {t("ط¥ط±ط³ط§ظ„ ط§ظ„ط¨ظ„ط§ط؛")}
              </Btn>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

export default function DashSubjectDetails({ setPage, subject }) {`n  const { userRole } = useContext(UserContext); const isAdmin = userRole === "admin";
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState('summaries');
  const [selectedResource, setSelectedResource] = useState(null);
  const [showRequestModal, setShowRequestModal] = useState(false);
  
  // If no subject is passed (user directly went here), default to something
  const currentSub = subject || { title:t('ط±ظٹط§ط¶ظٹط§طھ ظ…طھظ‚ط¯ظ…ط©'), code:'MATH301', locked:false, id:'MATH301' };

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
        author: i.is_anonymous ? t('ظ…ط¬ظ‡ظˆظ„') : (i.user?.profile?.first_name + ' ' + i.user?.profile?.last_name),
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
         duration: i.duration || 'â€”',
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
              {isAdmin && <Badge color={C.blue}>{currentSub.code}</Badge>}
              <h1 style={{ fontSize:'1.8rem', fontWeight:900, color:C.dark, margin:0 }}>{currentSub.title}</h1>
            </div>
            <p style={{ color:C.muted, fontSize:'0.95rem', maxWidth:600, lineHeight:1.6 }}>
              {t("ظ‡ط°ظ‡ ط§ظ„طµظپط­ط© ظ…ط®طµطµط© ظ„ط¹ط±ط¶ ط¬ظ…ظٹط¹ ط§ظ„ظ…طµط§ط¯ط± ط§ظ„طھط¹ظ„ظٹظ…ظٹط© ظˆط§ظ„ظ…ظ„ط®طµط§طھ ظˆط§ظ„ط¯ظˆط±ط§طھ ط§ظ„ط®ط§طµط© ط¨ظ…ط§ط¯ط© ")}{currentSub.title}{t(". ظٹظ…ظƒظ†ظƒ ط§ظ„ط§ط³طھظپط§ط¯ط© ظ…ظ† ط§ظ„ظ…ط­طھظˆظ‰ ط§ظ„ط°ظٹ ظٹط´ط§ط±ظƒظ‡ ط²ظ…ظ„ط§ط¤ظƒ ط£ظˆ ط±ظپط¹ ظ…ظ„ط®طµط§طھظƒ ط§ظ„ط®ط§طµط©.")}
            </p>
          </div>
          <Btn onClick={() => setPage('dash-subjects')} variant="secondary" style={{ background:C.white }}>{t("â†گ ط§ظ„ط¹ظˆط¯ط© ظ„ظ„ظ…ظˆط§ط¯")}</Btn>
        </div>

        {/* Tabs */}
        <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}`, marginBottom:28 }}>
          {[['summaries',t('ط§ظ„ظ…ظ„ط®طµط§طھ (ط§ظ„ظ‚ط³ظ… ط§ظ„ط£ظƒط§ط¯ظٹظ…ظٹ)')],['courses',t('ط§ظ„ط¯ظˆط±ط§طھ ظˆط§ظ„ط´ط±ظˆط­ط§طھ')]].map(([id,l]) => (
            <div key={id} onClick={() => setTab(id)} style={{ padding:'12px 28px', cursor:'pointer', fontWeight: tab===id ? 700 : 500, color: tab===id ? C.blue : C.muted, borderBottom:`3px solid ${tab===id ? C.blue : 'transparent'}`, marginBottom:-2, fontSize:'0.95rem', transition:'all .2s' }}>
              {l}
            </div>
          ))}
        </div>

        {/* Content */}
        {tab === 'summaries' && (
          <FadeIn>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem' }}>{t("ط£ط­ط¯ط« ط§ظ„ظ…ظ„ط®طµط§طھ")}</h3>
              <div style={{ display:'flex', gap:12 }}>
                <Btn variant="secondary" onClick={() => setShowRequestModal(true)} style={{ display:'flex', alignItems:'center', gap:6 }}><PiBellDuotone size={16}/> {t("ط·ظ„ط¨ ظ…ظ„ط®طµ")}</Btn>
                <Btn onClick={() => setPage('dash-resources', { openUpload: true })}>{t("+ ط±ظپط¹ ظ…ظ„ط®طµ ط¬ط¯ظٹط¯")}</Btn>
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
                          <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.78rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiDownloadSimpleDuotone color={C.blue} size={14}/> {item.downloads_count} {t("طھط­ظ…ظٹظ„")}</div>
                        )}
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiHardDriveDuotone/> {item.size}</span>
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}>
                          <PiUserDuotone/> {item.is_anonymous ? t("ظ…ط¬ظ‡ظˆظ„") : item.author}
                          {item.isTrusted && <PiSealCheckFill size={14} color={C.blue} title={t("ظ…ظˆط«ظ‚")} style={{ marginLeft: 2 }}/>}
                        </span>
                        <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiCalendarDuotone/> {item.date}</span>
                        <RankBadge points={item.points} />
                      </div>
                  </div>
                  <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:10 }}>
                    <div style={{ display:'flex', gap:8 }}>
                      <Btn onClick={() => setSelectedResource(item)} variant="secondary" style={{ fontSize:'0.82rem', padding:'8px 14px' }}>{t("طھظپط§طµظٹظ„")}</Btn>
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
                        }}>{t("طھط­ظ…ظٹظ„ ط§ظ„ظ…ظ„ظپ â†“")}</Btn>
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
                  <div style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem', marginBottom:6 }}>{t("ظ„ط§ طھظˆط¬ط¯ ظ…ظ„ط®طµط§طھ ط¨ط¹ط¯")}</div>
                  <div style={{ fontSize:'0.9rem' }}>{t("ظƒظ† ط£ظˆظ„ ظ…ظ† ظٹط±ظپط¹ ظ…ظ„ط®طµط§ظ‹ ظ„ظ‡ط°ظ‡ ط§ظ„ظ…ط§ط¯ط©!")}</div>
                </div>
              )}
            </div>
          </FadeIn>
        )}

        {tab === 'courses' && (
          <FadeIn>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
              <h3 style={{ fontWeight:700, color:C.dark, fontSize:'1.1rem' }}>{t("ط´ط±ظˆط­ط§طھ ظ…ط±ط¦ظٹط© ظˆط¯ظˆط±ط§طھ ظ…ظƒط«ظپط©")}</h3>
              <Btn onClick={() => setPage('dash-resources')}>{t("+ ط¥ط¶ط§ظپط© ط¯ظˆط±ط©")}</Btn>
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
                         <span style={{ color:C.green, fontSize:'0.82rem', fontWeight:700, display:'flex', alignItems:'center', gap:4 }}><PiThumbsUpDuotone size={16}/> {c.likes} {t(" ط¥ط¹ط¬ط§ط¨")}</span>
                         <div style={{ display:'inline-flex', alignItems:'center', gap:5, background:C.blueLight, color:C.blue, borderRadius:8, padding:'2px 10px', fontSize:'0.8rem', fontWeight:700, border:`1px solid ${C.blueMid}` }}><PiCursorClickDuotone size={16}/> {c.clicks} {t(" ط²ظٹط§ط±ط©")}</div>
                      </div>
                       <span style={{ color:C.muted, fontSize:'0.82rem', display:'flex', alignItems:'center', gap:4 }}><PiTimerDuotone size={16}/> {c.duration}</span>
                    </div>
                    <Btn variant="ghost" style={{ fontSize:'0.8rem', padding:'5px 12px' }} onClick={() => {
                       handleInteraction('download', c.id);
                       window.open(c.url, '_blank');
                    }}>{t("ظپطھط­ ط§ظ„ط±ط§ط¨ط· â†—")}</Btn>
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


