import React, { useState, useContext, useEffect, useRef } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Field } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { FadeIn } from '../utils';
import { PiBroadcastDuotone, PiUsersDuotone, PiTimerDuotone, PiTrophyDuotone, PiCalendarDuotone, PiFileTextDuotone, PiStarDuotone, PiChartLineUpDuotone, PiMagnifyingGlassDuotone, PiShareNetworkDuotone, PiCheckCircleDuotone, PiTrashDuotone, PiXCircleDuotone, PiUsersFourDuotone, PiEyeDuotone, PiLightningDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { UserContext } from '../UserContext';
import { getApiUrl } from '../api';

export default function DashChallenges({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState('my-active');
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showJoinPreview, setShowJoinPreview] = useState(false);
  const [previewData, setPreviewData] = useState(null);
  const [createSuccess, setCreateSuccess] = useState(false);
  const [generatedCode, setGeneratedCode] = useState('');
  const [joinCode, setJoinCode] = useState('');
  const [copied, setCopied] = useState(false);
  const [showManageModal, setShowManageModal] = useState(false);
  const [selectedChallenge, setSelectedChallenge] = useState(null);
  const [showPastModal, setShowPastModal] = useState(false);
  const [selectedPast, setSelectedPast] = useState(null);
  const [manageTab, setManageTab] = useState('overview');
  const [previewFile, setPreviewFile] = useState(null);
  
  // Real Data State
  const [activeChallenges, setActiveChallenges] = useState([]);
  const [pastChallengesList, setPastChallengesList] = useState([]);
  const [loading, setLoading] = useState(true);
  const [createLoading, setCreateLoading] = useState(false);
  const [joinLoading, setJoinLoading] = useState(false);
  const [userStats, setUserStats] = useState({ level: 1, level_name: 'مبتدئ', gold: 0, silver: 0, bronze: 0, xp: 0, next_gold: 10 });
  
  // Form State
  const [form, setForm] = useState({
    title: '',
    duration: 15,
    difficulty: 2, // Medium
    num_questions: 10,
    max_participants: 10,
    end_at: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    file: null,
    language: 'auto'
  });

  React.useEffect(() => {
    fetchChallenges();
  }, []);

  async function fetchChallenges() {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setActiveChallenges(data.active || []);
        setPastChallengesList(data.past || []);
        if (data.userStats) setUserStats(data.userStats);
      }
    } catch (err) {
      console.error("Fetch challenges failed", err);
    }
    setLoading(false);
  }

  // Countdown timer for manage modal (counts down from full-capacity moment)
  const [countdown, setCountdown] = useState(null);
  const countdownRef = useRef(null);

  useEffect(() => {
    if (showManageModal && selectedChallenge) {
      const parts = selectedChallenge.participants_count || 0;
      const maxP = selectedChallenge.max_participants || 0;
      const endAt = selectedChallenge.end_at ? new Date(selectedChallenge.end_at) : null;

      // Only start countdown if challenge is full
      if (parts >= maxP && endAt) {
        const tick = () => {
          const diff = endAt - new Date();
          if (diff <= 0) {
            setCountdown({ label: 'انتهى', expired: true });
            clearInterval(countdownRef.current);
          } else {
            const mins = Math.floor(diff / 60000);
            const secs = Math.floor((diff % 60000) / 1000);
            setCountdown({ label: `${mins}:${String(secs).padStart(2,'0')}`, expired: false });
          }
        };
        tick();
        countdownRef.current = setInterval(tick, 1000);
      } else {
        setCountdown({ label: 'لم يكتمل العدد', expired: false, incomplete: true });
        clearInterval(countdownRef.current);
      }
    } else {
      clearInterval(countdownRef.current);
      setCountdown(null);
    }
    return () => clearInterval(countdownRef.current);
  // eslint-disable-next-line
  }, [showManageModal, selectedChallenge?.uuid]);

  const mockParticipants = [
    { id: 101, name: 'أحمد علي', score: 85, progress: 100, status: 'completed' },
    { id: 102, name: 'سارة حسن', score: 72, progress: 80, status: 'playing' },
    { id: 103, name: 'محمد خالد', score: 0, progress: 15, status: 'playing' },
    { id: 104, name: 'ليلى مراد', score: 95, progress: 100, status: 'completed' },
    { id: 105, name: 'ياسين فريد', score: 0, progress: 0, status: 'joined' },
    { id: 106, name: 'نورا أمين', score: 0, progress: 0, status: 'joined' },
  ];



  const myActiveChallenges = [
    { id:4, title:'تحدي شبكات البيانات', subject:'الشبكات', participants:5, maxOpts:15, time:'25 دق', code:'CH-772B', status:'live', createdAt:'20 مارس 2024', expiresAt:'25 مارس 2024' },
  ];

  const pastChallenges = [
    { id: 201, title: 'أساسيات الشبكات', date: '15 مارس', participants: 42, rank: '3/42', score: 850, avgScore: 620, creator: 'د. عبدالله خالد', questions: 20 },
    { id: 202, title: 'قواعد البيانات متقدم', date: '10 مارس', participants: 28, rank: '12/28', score: 420, avgScore: 510, creator: 'سارة حسن', questions: 15 },
    { id: 203, title: 'أمن المعلومات', date: '5 مارس', participants: 56, rank: '1/56', score: 980, avgScore: 590, creator: 'نادي المبدعين', questions: 25 },
  ];

  const allChallengesRepo = [
    ...myActiveChallenges,
    { id:5, title:'تحدي البرمجة الكائنية', subject:'Java OOP', participants:12, maxOpts:20, time:'45 دق', code:'CH-991X', status:'live', createdAt:'21 مارس 2024', expiresAt:'23 مارس 2024', fileName:'oop_java_ch1.pdf' }
  ];

  async function handleJoin() {
    if (!joinCode) return;
    setJoinLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/join`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: joinCode })
      });
      const data = await res.json();
      if (res.ok) {
        setPreviewData(data.challenge);
        setShowJoinPreview(true);
        fetchChallenges();
      } else {
        alert(data.message || t("التحدي الذي انضممت إليه غير موجود"));
      }
    } catch (err) {
      alert(t("حدث خطأ في الاتصال بالخادم"));
    }
    setJoinLoading(false);
  }

  async function handleCreateChallenge(e) {
    e.preventDefault();
    setCreateLoading(true);

    const formData = new FormData();
    formData.append('title', form.title);
    formData.append('duration', form.duration);
    formData.append('difficulty', form.difficulty);
    formData.append('num_questions', form.num_questions);
    formData.append('max_participants', form.max_participants);
    formData.append('end_at', form.end_at + ' 23:59:59');
    formData.append('language', form.language);
    if (form.file) formData.append('file', form.file);

    try {
      const res = await fetch(`${getApiUrl()}/api/challenges`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Accept': 'application/json'
        },
        body: formData
      });
      const data = await res.json();
      if (res.ok) {
        setGeneratedCode(data.code);
        setCreateSuccess(true);
        fetchChallenges();
      } else {
        alert(data.message || t("فشل إنشاء التحدي"));
      }
    } catch (err) {
      alert(t("حدث خطأ في الاتصال بالخادم"));
    }
    setCreateLoading(false);
  }

  async function handleManage(c) {
    setSelectedChallenge(c);
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/${c.uuid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}` }
      });
      if (res.ok) {
        const data = await res.json();
        // Merge participants from the flat array the API returns
        const enriched = {
          ...data.challenge,
          participants: data.participants || [],
          participants_count: (data.participants || []).length
        };
        setSelectedChallenge(enriched);
        setShowManageModal(true);
      }
    } catch(e) { console.error(e); }
  }

  async function handleEndChallenge() {
    if(!window.confirm(t("هل أنت متأكد من إنهاء التحدي؟"))) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/${selectedChallenge.uuid}/end`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}` }
      });
      if(res.ok) {
        setShowManageModal(false);
        fetchChallenges();
      }
    } catch(e) { }
  }

  async function handleDeleteChallenge() {
    if(!window.confirm(t("سيتم حذف كل البيانات، هل أنت متأكد؟"))) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/${selectedChallenge.uuid}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}` }
      });
      if(res.ok) {
        setShowManageModal(false);
        fetchChallenges();
      }
    } catch(e) { }
  }

  async function handleKickParticipant(userId) {
    if(!window.confirm(t("هل تريد طرد هذا المشارك؟"))) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/${selectedChallenge.uuid}/kick/${userId}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}` }
      });
      if(res.ok) {
        // Refresh local modal
        handleManage(selectedChallenge);
      }
    } catch(e) { }
  }

  function copyCode() {
    navigator.clipboard.writeText(generatedCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }

  const { user, isSubscribed } = useContext(UserContext);
  const perms = user?.user_permissions || user?.permissions || [];
  const canAccess = isSubscribed || perms.includes('access_challenges');

  return !canAccess ? (
    <DashboardLayout activeSub="challenges" setPage={setPage}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("نظام التحديات")}</h1>
          <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("تنافس مع زملائك واختبر معلوماتك في الوقت الفعلي")}</p>
        </div>
      </div>
      <Card style={{ padding: 60, textAlign: 'center', marginTop: 40 }}>
          <PiLightningDuotone size={64} color={C.border} style={{ marginBottom: 16 }} />
          <h2 style={{ color: C.dark, marginBottom: 12 }}>{t("ميزة خاصة بالمشتركين")}</h2>
          <p style={{ color: C.muted, fontSize: '1rem', marginBottom: 30, maxWidth: 400, margin: '0 auto 30px' }}>
            {t("هذه الميزة تتيح لك الدخول في تحديات مباشرة مع زملائك واختبار مستواك. اشترك الآن لتتمكن من الوصول إليها.")}
          </p>
          <Btn onClick={() => setPage('dash-activate')}>{t("تفعيل الاشتراك")}</Btn>
      </Card>
    </DashboardLayout>
  ) : (
    <DashboardLayout activeSub="challenges" setPage={setPage}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
        <div>
          <h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("نظام التحديات")}</h1>
          <p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("تنافس مع زملائك واختبر معلوماتك في الوقت الفعلي")}</p>
        </div>
        <Btn onClick={() => setShowCreateModal(true)}>{t("+ إعداد تحدي جديد")}</Btn>
      </div>

      <div style={{ display:'grid', gridTemplateColumns:'2.5fr 1fr', gap:24, marginBottom:32 }}>
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          <Card style={{ padding:'20px 24px', background:C.blueLight, border:`1px solid ${C.blue}20`, display:'flex', alignItems:'center', justifyContent:'space-between' }}>
            <div style={{ display:'flex', alignItems:'center', gap:15 }}>
              <div style={{ width:42, height:42, borderRadius:12, background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <PiBroadcastDuotone size={22}/>
              </div>
              <div>
                <div style={{ fontWeight:700, color:C.dark, fontSize:'0.95rem' }}>{t("انضمام عبر الكود")}</div>
                <div style={{ color:C.muted, fontSize:'0.82rem' }}>{t("أدخل الكود لبدء التحدي فوراً")}</div>
              </div>
            </div>
            <div style={{ display:'flex', gap:10 }}>
              <input 
                value={joinCode} 
                onChange={e => setJoinCode(e.target.value)} 
                placeholder={t("مثال: CH-982X")} 
                style={{ ...inputStyle, width:160, marginBottom:0 }} 
              />
              <Btn onClick={handleJoin} disabled={!joinCode || joinLoading}>{joinLoading ? t("جاري...") : t("انضمام")}</Btn>
            </div>
          </Card>

          <div style={{ display:'flex', gap:0, borderBottom:`1px solid ${C.border}` }}>
            {[
              ['my-active', t('التحديات التي أنشأتها')],
              ['past', t('سجل تحدياتي السابقة')]
            ].map(([id, l]) => (
              <div key={id} onClick={() => setTab(id)} style={{ padding:'10px 20px', cursor:'pointer', fontWeight: tab===id ? 700 : 400, color: tab===id ? C.blue : C.muted, borderBottom:`2px solid ${tab===id ? C.blue : 'transparent'}`, marginBottom:-1, fontSize:'0.88rem', transition:'all .2s' }}>{l}</div>
            ))}
          </div>
        </div>

        <Card style={{ padding:'24px', background:`linear-gradient(135deg, ${C.white} 0%, ${C.bg} 100%)`, border:`1px solid ${C.border}`, position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', top:-20, right:-20, width:100, height:100, background:`${C.blue}08`, borderRadius:'50%' }}></div>
          
          <div style={{ textAlign:'center', marginBottom:24, position:'relative' }}>
            <div style={{ width:80, height:80, margin:'0 auto 16px', position:'relative', display:'flex', alignItems:'center', justifyContent:'center' }}>
               <svg style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', transform:'rotate(-90deg)' }}>
                  <circle cx="40" cy="40" r="36" fill="none" stroke={`${C.blue}15`} strokeWidth="6" />
                  <circle cx="40" cy="40" r="36" fill="none" stroke={C.blue} strokeWidth="6" strokeDasharray={2 * Math.PI * 36} strokeDashoffset={2 * Math.PI * 36 * (1 - Math.min((userStats.gold || 0)/Math.max(1, userStats.next_gold), 1))} strokeLinecap="round" />
               </svg>
               <div style={{ width:56, height:56, borderRadius:'50%', background:C.blue, color:C.white, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', boxShadow:`0 8px 20px ${C.blue}40` }}>
                  <div style={{ fontSize:'0.65rem', fontWeight:800, opacity:0.8 }}>LVL</div>
                  <div style={{ fontSize:'1.3rem', fontWeight:900 }}>{userStats.level}</div>
               </div>
            </div>
            <div style={{ fontWeight:800, color:C.dark, fontSize:'0.9rem', marginBottom:4 }}>{userStats.level_name || t("مبتدئ")}</div>
            <div style={{ fontSize:'0.75rem', color:C.muted, fontWeight:600 }}>{userStats.gold} / {Math.max(userStats.gold, userStats.next_gold)} GS</div>
          </div>

          <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:10 }}>
            {[
              { label: t('ذهب'), count: userStats.gold, color: '#FFD700', bg: 'rgba(255, 215, 0, 0.1)' },
              { label: t('فضة'), count: userStats.silver, color: '#94A3B8', bg: 'rgba(148, 163, 184, 0.1)' },
              { label: t('برونز'), count: userStats.bronze, color: '#B45309', bg: 'rgba(180, 83, 9, 0.1)' },
            ].map((medal, i) => (
              <div key={i} style={{ background: medal.bg, padding:'12px 8px', borderRadius:14, textAlign:'center', border:`1px solid ${medal.color}20` }}>
                 <PiStarDuotone color={medal.color} size={22} style={{ marginBottom:6, filter: `drop-shadow(0 2px 4px ${medal.color}40)` }} />
                 <div style={{ fontSize:'1.1rem', fontWeight:900, color:C.dark }}>{medal.count}</div>
                 <div style={{ fontSize:'0.65rem', color:C.muted, fontWeight:700, textTransform:'uppercase' }}>{medal.label}</div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {tab === 'my-active' && (
        <FadeIn>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(2, 1fr)', gap:16 }}>
            {activeChallenges.length > 0 ? (
              activeChallenges.map(c => (
                <Card key={c.id} style={{ padding:'22px' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:16 }}>
                    <div>
                        <Badge color={C.orange} style={{ gap:4 }}><PiBroadcastDuotone size={14}/> {t("مباشر الآن")}</Badge>
                        <h3 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:'8px 0 4px' }}>{t(c.title)}</h3>
                        <div style={{ color:C.muted, fontSize:'0.85rem' }}>{t("المادة: ")}{t(c.subject ? c.subject.name : "عام")}</div>
                    </div>
                    <div style={{ background:C.bg, padding:'8px 12px', borderRadius:8, textAlign:'center' }}>
                        <div style={{ fontSize:'0.7rem', color:C.muted, marginBottom:2 }}>{t("كود الدخول")}</div>
                        <div style={{ fontWeight:800, color:C.dark, letterSpacing:1 }}>{c.uuid}</div>
                    </div>
                    </div>
                    <div style={{ display:'flex', gap:10, marginBottom:20, flexWrap:'wrap' }}>
                        <Badge color={C.blue}><PiUsersDuotone size={14}/> {c.participants_count}/{c.max_participants} {t("مشارك")}</Badge>
                        <Badge color={C.blue}><PiTimerDuotone size={14}/> {c.difficulty === 1 ? t("سهل") : (c.difficulty === 3 ? t("صعب") : t("متوسط"))}</Badge>
                        <Badge color={C.orange}><PiCalendarDuotone size={14}/> {t("ينتهي: ")}{new Date(c.end_at).toLocaleDateString('ar-YE')}</Badge>
                    </div>
                    <div style={{ display:'flex', gap:10 }}>
                        {c.participants && c.participants[0] && c.participants[0].pivot.status === 1 ? (
                            <Btn style={{ flex:1 }} variant="secondary" onClick={() => setPage('dash-challenge-result', { fetchUuid: c.uuid })}>{t("عرض النتائج")}</Btn>
                        ) : (
                            <Btn style={{ flex:1 }} variant="secondary" onClick={() => setPage('dash-challenge-view', { challenge: c })}>{t("انضمام للتحدي")}</Btn>
                        )}
                        <Btn style={{ flex:1.5 }} onClick={() => handleManage(c)}>{t("إدارة التحدي")}</Btn>
                    </div>
                </Card>
              ))
            ) : (
                <div style={{ gridColumn:'1/-1', textAlign:'center', padding:'40px', color:C.muted }}>
                    <div style={{ color:C.muted, marginBottom:10, display:'flex', justifyContent:'center' }}><PiMagnifyingGlassDuotone size={48}/></div>
                    <div>{t("لا توجد تحديات حالية")}</div>
                </div>
            )}
          </div>
        </FadeIn>
      )}

      {tab === 'past' && (
        <FadeIn>
          <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
            {pastChallengesList.map(c => {
               const myPivot = c.participants && c.participants[0] ? c.participants[0].pivot : null;
               const myScore = myPivot ? myPivot.score : 0;
               return (
            <Card key={c.id} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px 24px' }} hover>
               <div style={{ display:'flex', alignItems:'center', gap:16 }}>
                 <div style={{ width:44, height:44, borderRadius:12, background:C.blueLight, color:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                    <PiCalendarDuotone />
                 </div>
                 <div>
                    <div style={{ fontWeight:800, color:C.dark, fontSize:'0.95rem' }}>{c.title}</div>
                    <div style={{ color:C.muted, fontSize:'0.82rem', marginTop:4 }}>
                        <span style={{ display:'inline-flex', alignItems:'center', gap:4 }}><PiUsersFourDuotone size={14}/> {c.participants_count}</span>
                        <span style={{ margin:'0 8px', opacity:.3 }}>|</span>
                        <span>{new Date(c.created_at).toLocaleDateString('ar-YE')}</span>
                    </div>
                 </div>
               </div>
               
               <div style={{ display:'flex', gap:24, alignItems:'center' }}>
                    <div style={{ textAlign:'center' }}>
                        <div style={{ color:C.muted, fontSize:'0.72rem', marginBottom:2 }}>{t("النجوم المكتسبة")}</div>
                        <div style={{ fontWeight:800, color:C.dark, fontSize:'1rem' }}>{myScore}</div>
                    </div>
                    <div style={{ textAlign:'center', minWidth:60 }}>
                        <div style={{ color:C.muted, fontSize:'0.72rem', marginBottom:2 }}>{t("الحالة")}</div>
                        <Badge color={myPivot?.status === 1 ? C.green : C.orange} style={{ fontSize:'0.85rem' }}>{myPivot?.status === 1 ? t("مكتمل") : t("منتهي")}</Badge>
                    </div>
                    <Btn variant="secondary" style={{ padding:'8px 16px', fontSize:'0.9rem' }} onClick={() => setPage('dash-challenge-result', { fetchUuid: c.uuid })}>
                        {t("عرض النتائج")}
                    </Btn>
               </div>
            </Card>
          )})}
          </div>
        </FadeIn>
      )}

      {showCreateModal && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.5)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center" }}>
          <div style={{ background:C.white, borderRadius:20, padding:"32px", width:480, maxWidth:"90%", boxShadow:"0 20px 40px rgba(0,0,0,0.15)", position:'relative' }}>
            <div onClick={() => { setShowCreateModal(false); setCreateSuccess(false); }} style={{ position:'absolute', top:24, left:24, cursor:'pointer', color:C.muted, fontSize:'1.1rem' }}>✕</div>
            
            {!createSuccess ? (
              <>
                <h3 style={{ fontWeight:800, color:C.dark, marginBottom:24, fontSize:'1.2rem' }}>{t("إعداد تحدي جديد")}</h3>
                <form onSubmit={handleCreateChallenge}>
                  <Field label={t("عنوان التحدي")}>
                    <input required value={form.title} onChange={e => setForm({...form, title: e.target.value})} placeholder={t("مثال: التحدي الأسبوعي للبرمجة")} style={inputStyle} onFocus={e => e.target.style.borderColor = C.blue} onBlur={e => e.target.style.borderColor = C.border} />
                  </Field>
                  
                  <div style={{ marginBottom: 24 }}>
                    <label style={{ display: 'block', fontWeight: 600, fontSize: '0.88rem', color: C.dark, marginBottom: 8 }}>{t("رفع ملف الدراسة")}</label>
                    <input type="file" id="challenge-file" hidden onChange={e => setForm({...form, file: e.target.files[0]})} />
                    <div onClick={() => document.getElementById('challenge-file').click()} 
                         style={{ border: `2px dashed ${form.file ? C.green : C.border}`, borderRadius: 14, padding: '30px 20px', textAlign: 'center', background: C.bg, cursor: 'pointer' }}>
                      <div style={{ color: form.file ? C.green : C.blue, marginBottom: 8, display:'flex', justifyContent:'center' }}><PiFileTextDuotone size={34}/></div>
                      <div style={{ fontWeight: 600, color: C.dark, marginBottom: 4, fontSize: '0.88rem' }}>{form.file ? form.file.name : t("انقر لرفع ملف التحدي")}</div>
                      <div style={{ color: C.muted, fontSize: '0.75rem' }}>{t("PDF أو DOCX — حد أقصى 10MB")}</div>
                    </div>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:18 }}>
                    <Field label={t("درجة الصعوبة")}>
                      <select value={form.difficulty} onChange={e => setForm({...form, difficulty: e.target.value})} style={{ ...inputStyle, appearance:'auto', padding:'8px 12px' }}>
                        <option value={1}>{t("سهل")}</option>
                        <option value={2}>{t("متوسط")}</option>
                        <option value={3}>{t("صعب")}</option>
                      </select>
                    </Field>
                    <Field label={t("عدد الأسئلة")}>
                      <select value={form.num_questions} onChange={e => setForm({...form, num_questions: e.target.value})} style={{ ...inputStyle, appearance:'auto', padding:'8px 12px' }}>
                        <option value={10}>10 {t("أسئلة")}</option>
                        <option value={20}>20 {t("سؤال")}</option>
                        <option value={30}>30 {t("سؤال")}</option>
                        <option value={40}>40 {t("سؤال")}</option>
                      </select>
                    </Field>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:10 }}>
                    <Field label={t("المدة الزمنية")}>
                      <select value={form.duration} onChange={e => setForm({...form, duration: e.target.value})} style={{ ...inputStyle, appearance:'auto', padding:'8px 12px' }}>
                        <option value={10}>{t("10 دقائق")}</option>
                        <option value={15}>{t("15 دقيقة")}</option>
                        <option value={30}>{t("30 دقيقة")}</option>
                      </select>
                    </Field>
                    <Field label={t("لغة الاختبار")}>
                      <select value={form.language} onChange={e => setForm({...form, language: e.target.value})} style={{ ...inputStyle, appearance:'auto', padding:'8px 12px' }}>
                        <option value="auto">{t("حسب محتوى الملف")}</option>
                        <option value="ar">{t("عربي")}</option>
                        <option value="en">{t("انجليزي")}</option>
                      </select>
                    </Field>
                  </div>
                  
                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:14, marginBottom:10 }}>
                    <Field label={t("تاريخ انتهاء التحدي")}>
                      <input type="date" value={form.end_at} onChange={e => setForm({...form, end_at: e.target.value})} style={inputStyle} />
                    </Field>
                    <Field label={t("أقصى عدد المشاركين")}>
                      <input type="number" value={form.max_participants} onChange={e => setForm({...form, max_participants: e.target.value})} min={2} max={50} style={inputStyle} />
                    </Field>
                  </div>
                  
                  <Btn type="submit" disabled={createLoading} style={{ width: '100%', padding: '14px', marginTop: 10 }}>{createLoading ? t("جاري الإنشاء...") : t("إنشاء رابط التحدي")}</Btn>
                </form>
              </>
            ) : (
              <div style={{ textAlign:'center', padding:'10px 0' }}>
                <div style={{ width:64, height:64, borderRadius:'50%', background:C.greenBg, color:C.green, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 20px', fontSize:'1.8rem' }}>✓</div>
                <h3 style={{ fontWeight:800, color:C.dark, marginBottom:10 }}>{t("تم إنشاء التحدي بنجاح!")}</h3>
                <p style={{ color:C.muted, fontSize:'0.9rem', marginBottom:30 }}>{t("شارك هذا الكود مع زملائك ليتمكنوا من الانضمام للتحدي")}</p>
                
                <div style={{ background:C.bg, borderRadius:14, padding:'20px', border:`1px solid ${C.border}`, marginBottom:30 }}>
                    <div style={{ fontSize:'0.75rem', color:C.muted, marginBottom:8, fontWeight:600 }}>{t("كود التحدي الخاص بك:")}</div>
                    <div style={{ fontSize:'1.8rem', fontWeight:900, color:C.blue, letterSpacing:4, fontFamily:'monospace' }}>{generatedCode}</div>
                </div>

                <div style={{ display:'flex', gap:12 }}>
                    <Btn variant="secondary" style={{ flex:1 }} onClick={() => { setShowCreateModal(false); setCreateSuccess(false); }}>{t("إغلاق")}</Btn>
                    <Btn style={{ flex:1 }} onClick={copyCode}>{copied ? t("تم النسخ!") : t("نسخ الكود")}</Btn>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {showJoinPreview && previewData && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.55)", zIndex:999, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(4px)' }}>
          <div style={{ background:C.white, borderRadius:24, padding:"36px", width:500, maxWidth:"92%", boxShadow:"0 25px 50px rgba(0,0,0,0.2)", position:'relative' }}>
            <div onClick={() => setShowJoinPreview(false)} style={{ position:'absolute', top:20, left:20, cursor:'pointer', color:C.muted, width:32, height:32, borderRadius:'50%', border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center' }}>✕</div>

            <div style={{ marginBottom:20 }}>
              <Badge color={C.green} style={{ marginBottom:12, gap:4 }}><PiCheckCircleDuotone size={14}/> {t("تم الانضمام بنجاح")}</Badge>
              <h2 style={{ fontWeight:900, color:C.dark, marginBottom:6, fontSize:'1.3rem' }}>{previewData.title}</h2>
              <div style={{ color:C.muted, fontSize:'0.88rem', display:'flex', alignItems:'center', gap:6 }}>
                <PiFileTextDuotone size={16}/> {t("المادة: ")}{previewData.subject || t('عام')}
              </div>
            </div>

            <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:12, marginBottom:20 }}>
              <div style={{ background:C.bg, padding:'14px', borderRadius:12 }}>
                <div style={{ color:C.muted, fontSize:'0.72rem', fontWeight:600, marginBottom:4 }}>{t("تاريخ إنشاء التحدي")}</div>
                <div style={{ fontWeight:700, color:C.dark, fontSize:'0.88rem' }}>{previewData.created_at ? new Date(previewData.created_at).toLocaleDateString('ar-YE') : '-'}</div>
              </div>
              <div style={{ background:C.bg, padding:'14px', borderRadius:12 }}>
                <div style={{ color:C.muted, fontSize:'0.72rem', fontWeight:600, marginBottom:4 }}>{t("تاريخ انتهاء التحدي")}</div>
                <div style={{ fontWeight:700, color:C.dark, fontSize:'0.88rem' }}>{previewData.end_at ? new Date(previewData.end_at).toLocaleDateString('ar-YE') : '-'}</div>
              </div>
              <div style={{ background:C.bg, padding:'14px', borderRadius:12 }}>
                <div style={{ color:C.muted, fontSize:'0.72rem', fontWeight:600, marginBottom:4 }}>{t("درجة الصعوبة")}</div>
                <div style={{ fontWeight:700, color:C.dark, fontSize:'0.88rem' }}>
                  {previewData.difficulty === 1 ? t('سهل') : previewData.difficulty === 3 ? t('صعب') : t('متوسط')}
                </div>
              </div>
              <div style={{ background:C.bg, padding:'14px', borderRadius:12 }}>
                <div style={{ color:C.muted, fontSize:'0.72rem', fontWeight:600, marginBottom:4 }}>{t("كود التحدي")}</div>
                <div style={{ fontWeight:800, color:C.blue, fontSize:'0.9rem', letterSpacing:2, fontFamily:'monospace' }}>{previewData.uuid}</div>
              </div>
            </div>

            {/* Participants progress */}
            <div style={{ background:C.blueLight, padding:'18px', borderRadius:16, marginBottom:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:10 }}>
                <span style={{ fontWeight:700, color:C.blue, fontSize:'0.9rem', display:'flex', alignItems:'center', gap:6 }}><PiUsersDuotone size={17}/> {t("المشاركون")}</span>
                <span style={{ fontWeight:800, color: (previewData.participants_count || 0) >= (previewData.max_participants || 1) ? C.green : C.blue }}>
                  {previewData.participants_count || 0} / {previewData.max_participants || '?'}
                  {(previewData.participants_count || 0) >= (previewData.max_participants || 0) && (
                    <Badge color={C.green} style={{ marginRight:8 }}>{t("اكتمل العدد ✔")}</Badge>
                  )}
                </span>
              </div>
              <div style={{ width:'100%', height:8, background:'rgba(59,130,246,0.15)', borderRadius:4, overflow:'hidden' }}>
                <div style={{ width:`${Math.min(((previewData.participants_count||0)/(previewData.max_participants||1))*100,100)}%`, height:'100%', background: (previewData.participants_count||0) >= (previewData.max_participants||1) ? C.green : C.blue, transition:'width .5s' }}></div>
              </div>
            </div>

            <div style={{ display:'flex', gap:12 }}>
              <Btn variant="secondary" style={{ flex:1 }} onClick={() => setShowJoinPreview(false)}>{t("إغلاق")}</Btn>
              <Btn style={{ flex:1.5, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={() => { setShowJoinPreview(false); setPage('dash-challenge-view', { challenge: previewData }); }}>
                {t("بدء التحدي الآن →")}
              </Btn>
            </div>
          </div>
        </div>
      )}

      {showManageModal && selectedChallenge && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1000, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(4px)' }}>
          <div style={{ background:C.white, borderRadius:24, width:640, maxWidth:"95%", height:'85vh', maxHeight:700, boxShadow:"0 25px 50px rgba(0,0,0,0.2)", position:'relative', display:'flex', flexDirection:'column', overflow:'hidden' }}>
            {/* Header */}
            <div style={{ padding:'24px 32px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
              <div>
                <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:4 }}>
                   <Badge color={C.orange}><PiBroadcastDuotone size={14}/> {t("بث مباشر")}</Badge>
                   <span style={{ fontSize:'0.85rem', color:C.muted, fontWeight:600 }}>{selectedChallenge.code}</span>
                </div>
                <h2 style={{ fontSize:'1.25rem', fontWeight:800, color:C.dark, margin:0 }}>{t("إدارة: ")}{t(selectedChallenge.title)}</h2>
              </div>
              <div onClick={() => setShowManageModal(false)} style={{ width:36, height:36, borderRadius:'50%', background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.muted }}>✕</div>
            </div>

            {/* Menu Tabs */}
            <div style={{ display:'flex', gap:20, padding:'0 32px', background:C.bg, borderBottom:`1px solid ${C.border}` }}>
              {[
                { id:'overview', label: t('نظرة عامة'), icon: PiChartLineUpDuotone },
                { id:'settings', label: t('الإعدادات'), icon: PiFileTextDuotone },
              ].map(m => (
                <div key={m.id} onClick={() => setManageTab(m.id)} style={{ padding:'14px 0', cursor:'pointer', fontSize:'0.9rem', fontWeight: manageTab===m.id ? 700 : 500, color: manageTab===m.id ? C.blue : C.muted, borderBottom:`3px solid ${manageTab===m.id ? C.blue : 'transparent'}`, display:'flex', alignItems:'center', gap:8, transition:'all .2s' }}>
                  <m.icon size={18}/>
                  {m.label}
                </div>
              ))}
            </div>

            {/* Content Area */}
            <div style={{ flex:1, overflowY:'auto', padding:'24px 32px' }}>
              {manageTab === 'overview' && (
                <FadeIn>
                  {/* Stats Cards */}
                {(() => {
                  const parts = selectedChallenge.participants || [];
                  const totalStars = parts.reduce((sum, p) => sum + (p.score || 0), 0);
                  const countdownColor = countdown?.expired ? C.red : countdown?.incomplete ? C.muted : C.orange;
                  const countdownBg = countdown?.incomplete ? C.bg : C.orangeBg;
                  return (
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:28 }}>
                      <div style={{ background:C.blueLight, padding:'16px', borderRadius:16, textAlign:'center' }}>
                        <div style={{ color:C.blue, fontSize:'0.75rem', fontWeight:700, marginBottom:4 }}>{t("المشاركين")}</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:900, color:C.blue }}>
                          {parts.length} / {selectedChallenge.max_participants || '?'}
                        </div>
                      </div>
                      <div style={{ background:C.greenBg, padding:'16px', borderRadius:16, textAlign:'center' }}>
                        <div style={{ color:C.green, fontSize:'0.75rem', fontWeight:700, marginBottom:4 }}>{t("إجمالي النجوم المكتسبة")}</div>
                        <div style={{ fontSize:'1.4rem', fontWeight:900, color:C.green }}>{totalStars} <span style={{fontSize:'0.7rem'}}>GS</span></div>
                      </div>
                      <div style={{ background:countdownBg, padding:'16px', borderRadius:16, textAlign:'center', border: countdown?.incomplete ? `1px dashed ${C.border}` : 'none' }}>
                        <div style={{ color:countdownColor, fontSize:'0.7rem', fontWeight:700, marginBottom:4 }}>
                          {countdown?.incomplete ? t("انتظار اكتمال المشاركين") : t("الوقت المتبقي")}
                        </div>
                        <div style={{ fontSize: countdown?.incomplete ? '0.78rem' : '1.4rem', fontWeight:900, color:countdownColor }}>
                          {countdown ? countdown.label : '...'}
                        </div>
                      </div>
                    </div>
                  );
                })()}

                  <h3 style={{ fontSize:'0.95rem', fontWeight:800, color:C.dark, marginBottom:16, display:'flex', alignItems:'center', gap:8 }}>
                    <PiStarDuotone size={20} color={C.orange}/> {t("لوحة المتصدرين")}
                  </h3>
                  <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                    {(selectedChallenge.participants || []).length > 0
                      ? [...(selectedChallenge.participants || [])].sort((a,b) => (b.score || 0) - (a.score || 0)).map((p, idx) => (
                        <div key={p.id || idx} style={{ display:'flex', alignItems:'center', gap:12, padding:'12px 16px', background:C.bg, borderRadius:12, border:`1px solid ${C.border}` }}>
                          <div style={{ width:28, height:28, borderRadius:'50%', background: idx===0?'#FFD700':idx===1?'#94A3B8':idx===2?'#B45309':C.bg, display:'flex', alignItems:'center', justifyContent:'center', fontWeight:900, fontSize:'0.8rem', color: idx<3?C.white:C.muted }}>#{idx+1}</div>
                          <div style={{ flex:1, fontWeight:700, color:C.dark }}>{p.name || 'مجهول'}</div>
                          <div style={{ display:'flex', alignItems:'center', gap:6 }}>
                            <div style={{ width:100, height:6, background:'#eee', borderRadius:3, overflow:'hidden' }}>
                              <div style={{ width:`${p.progress || 0}%`, height:'100%', background: (p.progress||0) === 100 ? C.green : C.blue }}></div>
                            </div>
                            <div style={{ fontSize:'0.75rem', color:C.muted }}>{p.progress || 0}%</div>
                          </div>
                          <div style={{ fontWeight:900, color:C.orange, minWidth:50, textAlign:'left', display:'flex', alignItems:'center', gap:4 }}>
                            <PiStarDuotone size={14} color='#FFD700'/>{p.score || 0}
                          </div>
                        </div>
                      ))
                      : <div style={{ color:C.muted, textAlign:'center', padding:'20px 10px' }}>{t("لا يوجد متصدرين بعد")}</div>
                    }
                  </div>
                </FadeIn>
              )}


              {manageTab === 'settings' && (
                <FadeIn>
                   <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
                      <Card style={{ padding:'24px', border:`1px solid ${C.blue}30` }}>
                        <h4 style={{ margin:'0 0 14px', fontSize:'0.95rem', fontWeight:800 }}>{t("كود الانضمام للتحدي")}</h4>
                        <div style={{ display:'flex', alignItems:'center', gap:14 }}>
                           <div style={{ flex:1, background:C.bg, border:`2px dashed ${C.blue}40`, borderRadius:12, padding:'16px 20px', textAlign:'center' }}>
                              <div style={{ fontSize:'0.75rem', color:C.muted, marginBottom:6 }}>{t("شارك هذا الكود مع الطلاب للانضمام")}</div>
                              <div style={{ fontSize:'1.6rem', fontWeight:900, color:C.dark, letterSpacing:3 }}>{selectedChallenge.uuid || selectedChallenge.code}</div>
                           </div>
                           <Btn onClick={() => { navigator.clipboard.writeText(selectedChallenge.uuid || selectedChallenge.code || ''); setCopied(true); setTimeout(()=>setCopied(false),2000); }}>
                             {copied ? t("✓ تم النسخ!") : t("نسخ الكود")}
                           </Btn>
                        </div>
                      </Card>

                      <div style={{ display:'flex', flexDirection:'column', gap:12 }}>
                         <Btn variant="secondary" style={{ color:C.orange, borderColor:C.orange, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={handleEndChallenge}>
                           <PiCheckCircleDuotone size={18}/> {t("إنهاء التحدي الآن")}
                         </Btn>
                         <Btn variant="secondary" style={{ color:C.red, borderColor:C.red, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }} onClick={handleDeleteChallenge}>
                           <PiTrashDuotone size={18}/> {t("حذف التحدي نهائياً")}
                         </Btn>
                      </div>
                   </div>
                </FadeIn>
              )}
            </div>

            {/* Footer */}
            <div style={{ padding:'20px 32px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', background:C.bg }}>
               <Btn variant="secondary" onClick={() => setShowManageModal(false)}>{t("إغلاق النافذة")}</Btn>
            </div>
          </div>
        </div>
      )}
      {/* Past Challenge Details Modal */}
      {showPastModal && selectedPast && (
        <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.6)', zIndex:1000, backdropFilter:'blur(5px)', display:'flex', alignItems:'center', justifyContent:'center', padding:20 }} onClick={() => setShowPastModal(false)}>
            <div style={{ background:C.white, width:'100%', maxWidth:580, borderRadius:24, overflow:'hidden', animation:'modalIn 0.3s ease' }} onClick={e => e.stopPropagation()}>
                <div style={{ background:C.dark, padding:'24px 32px', color:C.white, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                    <div>
                        <h3 style={{ margin:0, fontSize:'1.2rem', fontWeight:800 }}>{selectedPast.title}</h3>
                        <div style={{ fontSize:'0.85rem', color:'rgba(255,255,255,0.6)', marginTop:4 }}>{t("تم إنجازه في ")}{selectedPast.date}</div>
                    </div>
                    <Btn variant="ghost" style={{ color:C.white, padding:0 }} onClick={() => setShowPastModal(false)}><PiXCircleDuotone size={28}/></Btn>
                </div>
                
                <div style={{ padding:32 }}>
                    <div style={{ display:'grid', gridTemplateColumns:'repeat(3, 1fr)', gap:16, marginBottom:32 }}>
                        {[
                            { label: t("المركز المحقق"), val: selectedPast.rank, icon: <PiTrophyDuotone />, color: C.blue },
                            { label: t("النجوم المكتسبة"), val: selectedPast.score, icon: <PiStarDuotone />, color: C.orange },
                            { label: t("عدد الأسئلة"), val: selectedPast.questions, icon: <PiFileTextDuotone />, color: C.green },
                        ].map((stat, i) => (
                            <div key={i} style={{ background:C.bg, padding:'16px', borderRadius:16, textAlign:'center', border:`1px solid ${C.border}` }}>
                                <div style={{ color: stat.color, marginBottom:8 }}>{stat.icon}</div>
                                <div style={{ fontSize:'0.75rem', color:C.muted, marginBottom:4 }}>{stat.label}</div>
                                <div style={{ fontWeight:800, fontSize:'1.1rem', color:C.dark }}>{stat.val}</div>
                            </div>
                        ))}
                    </div>

                    <div style={{ background:C.bg, padding:'20px', borderRadius:16, border:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                         <div>
                            <div style={{ fontSize:'0.82rem', color:C.muted, marginBottom:4 }}>{t("منشئ التحدي")}</div>
                            <div style={{ fontWeight:800, color:C.dark, fontSize:'1.05rem' }}>{selectedPast.creator}</div>
                         </div>
                         <div style={{ width:42, height:42, borderRadius:'50%', background:C.blueLight, color:C.blue, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem' }}>
                            <PiUsersDuotone />
                         </div>
                    </div>

                    <div style={{ marginTop:24, background:C.greenBg, padding:'14px 18px', borderRadius:12, border:`1px solid ${C.green}40`, display:'flex', alignItems:'center', gap:10 }}>
                        <PiCheckCircleDuotone color={C.green} size={20}/>
                        <div style={{ fontSize:'0.88rem', color:C.dark, fontWeight:700 }}>{t("تم إكمال هذا التحدي بنجاح!")}</div>
                    </div>

                    <Btn style={{ width:'100%', marginTop:32, padding:'14px' }} onClick={() => setShowPastModal(false)}>{t("إغلاق")}</Btn>
                </div>
            </div>
        </div>
      )}

      {previewFile && (
        <div style={{ position:"fixed", inset:0, background:"rgba(0,0,0,0.6)", zIndex:1100, display:"flex", alignItems:"center", justifyContent:"center", backdropFilter:'blur(4px)' }} onClick={()=>setPreviewFile(null)}>
          <div style={{ background:C.white, borderRadius:24, width:800, maxWidth:"95%", height:'80vh', boxShadow:"0 25px 50px rgba(0,0,0,0.2)", position:'relative', display:'flex', flexDirection:'column', overflow:'hidden' }} onClick={e=>e.stopPropagation()}>
            <div style={{ padding:'20px 28px', borderBottom:`1px solid ${C.border}`, display:'flex', justifyContent:'space-between', alignItems:'center', background:C.bg }}>
              <div>
                <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:0 }}>{t("معاينة الملف: ")}{previewFile.title}</h2>
              </div>
              <div onClick={()=>setPreviewFile(null)} style={{ width:32, height:32, borderRadius:'50%', background:C.white, border:`1px solid ${C.border}`, display:'flex', alignItems:'center', justifyContent:'center', cursor:'pointer', color:C.muted }}>✕</div>
            </div>
            <div style={{ flex:1, background:"#f8f9fa", display:"flex", alignItems:"center", justifyContent:"center", overflow:"hidden" }}>
                <div style={{ width:"100%", height:"100%", display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", color:C.muted }}>
                   <PiFileTextDuotone size={80} style={{ marginBottom:20, opacity:0.2 }}/>
                   <div style={{ fontSize:"1.2rem", fontWeight:700, color:C.dark, marginBottom:8 }}>{t("محتوى المادة الدراسية")}</div>
                   <p style={{ maxWidth:400, textAlign:"center", fontSize:"0.9rem" }}>{t("هنا يمكن للمشرف والطلاب استعراض ملف التحدي.")}</p>
                   <div style={{ marginTop:32, width:"80%", height:300, background:"#fff", borderRadius:12, border:`1px dashed ${C.border}`, display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <span style={{ fontSize:"0.85rem" }}>[ {t("منطقة عرض المحتوى")} ]</span>
                   </div>
                </div>
            </div>
            <div style={{ padding:'16px 28px', borderTop:`1px solid ${C.border}`, display:'flex', justifyContent:'flex-end', background:C.bg }}>
               <Btn variant="secondary" onClick={()=>setPreviewFile(null)}>{t("إغلاق")}</Btn>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
