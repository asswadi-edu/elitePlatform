import React, { useState, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Card, Badge } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { FadeIn } from '../utils';
import { PiTrophyDuotone, PiUsersFourDuotone, PiTimerDuotone, PiCheckCircleDuotone, PiXCircleDuotone, PiRankingDuotone, PiLightningDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function DashChallengeResult({ setPage, pageData }) {
  const { t } = useContext(LanguageContext);
  const [showReview, setShowReview] = useState(false);
  const [loading, setLoading] = useState(!!pageData?.fetchUuid);
  const [data, setData] = useState(pageData || {});

  React.useEffect(() => {
    if (pageData?.fetchUuid) {
      setLoading(true);
      fetch(`${getApiUrl()}/api/challenges/${pageData.fetchUuid}`, {
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}`, 'Accept': 'application/json' }
      })
      .then(res => res.json())
      .then(json => {
         const me = json.participants?.find(p => p.current) || {};
         // Transform data to match required shape
         setData({
            challenge: json.challenge,
            qs: json.questions,
            answers: me.answers_json || {},
            participants: json.participants || [],
            score: me.score || 0,
            elapsed: me.time_spent || 0
         });
         setLoading(false);
      })
      .catch(err => {
         console.error(err);
         setLoading(false);
      });
    } else {
      setData(pageData || {});
    }
  }, [pageData]);

  if (loading) {
     return <DashboardLayout activeSub="challenges" setPage={setPage} hideSidebar={true}>
        <div style={{ padding: 40, textAlign: 'center' }}>{t("جاري تحميل النتائج...")}</div>
     </DashboardLayout>;
  }

  const { challenge, qs = [], answers = {}, participants = [], score = 0, elapsed = 0 } = data;

  if (!challenge || qs.length === 0) {
    return (
      <DashboardLayout activeSub="challenges" setPage={setPage} hideSidebar={true}>
        <div style={{ padding: 40, textAlign: 'center' }}>{t("بيانات نتيجة التحدي ذهبت مهب الريح.")}</div>
      </DashboardLayout>
    );
  }

  // Sort participants by score descending for podium
  const sortedParticipants = [...participants].sort((a, b) => b.score - a.score);
  const p1 = sortedParticipants[0];
  const p2 = sortedParticipants[1];
  const p3 = sortedParticipants[2];

  // Discover my ranking
  const myRank = sortedParticipants.findIndex(p => p.current) + 1;

  // Process Answers Review
  const review = qs.map((q, i) => {
    const userAnsIdx = answers[i];
    
    // Attempt to map strings to index if it isn't an integer. Based on previous DashChallengeView format.
    const isCorrect = userAnsIdx === q.correct;
    
    return {
      qText: q.q,
      yourAns: (userAnsIdx !== undefined && q.opts[userAnsIdx]) ? q.opts[userAnsIdx] : t("لم تجب"),
      correctAns: q.opts[q.correct],
      isCorrect: isCorrect
    };
  });

  const correctCount = review.filter(r => r.isCorrect).length;
  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${((s % 60) || 0).toString().padStart(2, '0')}`;

  return (
    <DashboardLayout activeSub="challenges" setPage={setPage} hideSidebar={true}>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 32, padding: '0 20px', paddingBottom: 40, maxWidth: 1100, margin: '0 auto' }}>
        
        {/* Header Ribbon */}
        <div style={{ textAlign: 'center', marginTop: 10 }}>
          <Badge color={C.orange} style={{ marginBottom: 12, padding: '8px 16px', fontSize: '0.9rem' }}><PiRankingDuotone size={18} style={{ verticalAlign:'middle', marginRight:6 }}/> {t("نهاية التحدي")}</Badge>
          <h1 style={{ fontSize: '2.2rem', fontWeight: 900, color: C.dark, margin: '0 0 8px' }}>{t("نتائج")} {t(challenge.title || "")}</h1>
          <p style={{ color: C.muted, fontSize: '1.05rem', maxWidth: 600, margin: '0 auto' }}>{t("لقد أكملت التحدي بنجاح، إليك ترتيب المتسابقين النهائي وتقييم إجاباتك.")}</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(350px, 1fr) 2fr', gap: 24 }}>
          
          {/* Left Column: Podium & Participants */}
          <Card style={{ padding: '32px 24px', display: 'flex', flexDirection: 'column' }}>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.dark, marginBottom: 30, display: 'flex', alignItems: 'center', gap: 10, justifyContent: 'center' }}>
                <PiTrophyDuotone size={26} color={C.gold}/> {t("منصة التتويج")}
            </h3>
            
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap: 12, marginBottom: 40, height: 160, paddingBottom: 10, borderBottom: `1px solid ${C.border}50` }}>
              <>
                {/* 2nd Place */}
                {p2 && (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width: 90 }} title={p2.correct_count !== undefined ? `${t("الإجابات الصحيحة:")} ${p2.correct_count}\n${t("الوقت المستغرق:")} ${fmt(p2.time_spent || 0)}` : ""}>
                        <div style={{ padding:'10px 4px', width:'100%', background:`linear-gradient(180deg, #94A3B8 0%, #64748B 100%)`, borderRadius:'8px 8px 0 0', textAlign:'center', color:C.white, position:'relative', height: 80, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <div style={{ position:'absolute', top: -30, left:'50%', transform:'translateX(-50%)' }}>
                                <div style={{ width: 44, height: 44, borderRadius:'50%', background: C.white, border: `3px solid #94A3B8`, color: '#64748B', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1rem', fontWeight:900, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{p2.name[0]}</div>
                            </div>
                            <div style={{ fontSize:'0.85rem', fontWeight:800, marginTop: 15 }}>#2</div>
                            <div style={{ fontSize:'0.75rem', fontWeight:700, marginTop: 'auto', marginBottom: 5 }}>{p2.score}</div>
                        </div>
                        <div style={{ fontSize:'0.8rem', fontWeight:700, marginTop:8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center', color: p2.current ? C.blue : C.dark }}>{p2.name}</div>
                    </div>
                )}
                {/* 1st Place */}
                {p1 && (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width: 100 }} title={p1.correct_count !== undefined ? `${t("الإجابات الصحيحة:")} ${p1.correct_count}\n${t("الوقت المستغرق:")} ${fmt(p1.time_spent || 0)}` : ""}>
                        <div style={{ padding:'12px 4px', width:'100%', background:`linear-gradient(180deg, #F59E0B 0%, #D97706 100%)`, borderRadius:'10px 10px 0 0', textAlign:'center', color:C.white, position:'relative', boxShadow:`0 -4px 15px rgba(245, 158, 11, 0.4)`, height: 110, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <div style={{ position:'absolute', top: -45, left:'50%', transform:'translateX(-50%)' }}>
                                <div style={{ position: 'absolute', top: -14, left: '50%', transform: 'translateX(-50%)', zIndex: 2 }}><PiTrophyDuotone size={22} color="#F59E0B" weight="fill" /></div>
                                <div style={{ width: 56, height: 56, borderRadius:'50%', background: C.white, border: `4px solid #F59E0B`, color: '#D97706', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.2rem', fontWeight:900, position: 'relative', zIndex: 1, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{p1.name[0]}</div>
                            </div>
                            <div style={{ fontSize:'1rem', fontWeight:900, marginTop: 15 }}>#1</div>
                            <div style={{ fontSize:'0.85rem', fontWeight:800, marginTop: 'auto', marginBottom: 5 }}>{p1.score}</div>
                        </div>
                        <div style={{ fontSize:'0.85rem', fontWeight:800, marginTop:8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center', color: p1.current ? C.blue : C.dark }}>{p1.name}</div>
                    </div>
                )}
                {/* 3rd Place */}
                {p3 && (
                    <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width: 90 }} title={p3.correct_count !== undefined ? `${t("الإجابات الصحيحة:")} ${p3.correct_count}\n${t("الوقت المستغرق:")} ${fmt(p3.time_spent || 0)}` : ""}>
                        <div style={{ padding:'8px 4px', width:'100%', background:`linear-gradient(180deg, #B45309 0%, #78350F 100%)`, borderRadius:'8px 8px 0 0', textAlign:'center', color:C.white, position:'relative', height: 60, display: 'flex', flexDirection: 'column', justifyContent: 'flex-start' }}>
                            <div style={{ position:'absolute', top: -25, left:'50%', transform:'translateX(-50%)' }}>
                                <div style={{ width: 38, height: 38, borderRadius:'50%', background: C.white, border: `3px solid #B45309`, color: '#78350F', display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', fontWeight:900, boxShadow: '0 4px 10px rgba(0,0,0,0.1)' }}>{p3.name[0]}</div>
                            </div>
                            <div style={{ fontSize:'0.75rem', fontWeight:800, marginTop: 12 }}>#3</div>
                            <div style={{ fontSize:'0.7rem', fontWeight:700, marginTop: 'auto', marginBottom: 5 }}>{p3.score}</div>
                        </div>
                        <div style={{ fontSize:'0.8rem', fontWeight:700, marginTop:8, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center', color: p3.current ? C.blue : C.dark }}>{p3.name}</div>
                    </div>
                )}
              </>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: 10, display: 'flex', flexDirection: 'column', gap: 10 }}>
                {sortedParticipants.map((p, idx) => (
                    <div key={idx} style={{ 
                        display:'flex', 
                        alignItems:'center', 
                        gap:12, 
                        padding:'14px 16px', 
                        borderRadius: 14, 
                        background: p.current ? 'rgba(59, 130, 246, 0.08)' : C.bg,
                        border: p.current ? `1px solid ${C.blue}40` : `1px solid ${C.border}`,
                    }} title={p.correct_count !== undefined ? `${t("الإجابات الصحيحة:")} ${p.correct_count}\n${t("الوقت المستغرق:")} ${fmt(p.time_spent || 0)}` : ""}>
                        <div style={{ width:24, fontWeight:900, color: idx < 3 ? C.gold : C.muted, fontSize:'1rem' }}>{idx+1}</div>
                        <div style={{ flex:1, fontWeight:700, color:C.dark, fontSize:'0.9rem' }}>{p.name} {p.current && "⭐"}</div>
                        <div style={{ fontWeight:900, fontSize:'1rem', color: idx === 0 ? C.orange : C.dark }}>{p.score}</div>
                    </div>
                ))}
            </div>
            <Btn style={{ marginTop: 24 }} variant="secondary" onClick={() => setPage('dash-challenges')}>{t("العودة إلى التحديات")}</Btn>
          </Card>

          {/* Right Column: Personal Stats & Review */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
            
            <Card style={{ padding: '32px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
                    <div style={{ background: C.blueLight, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ color: C.blue, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><PiLightningDuotone size={26}/></div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.blue, marginBottom: 4 }}>{score}</div>
                        <div style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 700 }}>{t("إجمالي نجومك")}</div>
                    </div>
                    <div style={{ background: C.greenBg, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ color: C.green, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><PiCheckCircleDuotone size={26}/></div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.green, marginBottom: 4 }}>{correctCount}</div>
                        <div style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 700 }}>{t("إجابات صحيحة")}</div>
                    </div>
                    <div style={{ background: C.orangeBg, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ color: C.orange, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><PiRankingDuotone size={26}/></div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.orange, marginBottom: 4 }}>{myRank}</div>
                        <div style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 700 }}>{t("ترتيبك النهائي")}</div>
                    </div>
                    <div style={{ background: C.bg, borderRadius: 16, padding: '20px 16px', textAlign: 'center', border: `1px solid ${C.border}` }}>
                        <div style={{ color: C.muted, marginBottom: 8, display: 'flex', justifyContent: 'center' }}><PiTimerDuotone size={26}/></div>
                        <div style={{ fontSize: '1.6rem', fontWeight: 900, color: C.dark, marginBottom: 4, fontFamily: 'monospace' }}>{fmt(elapsed)}</div>
                        <div style={{ fontSize: '0.82rem', color: C.muted, fontWeight: 700 }}>{t("الزمن المستغرق")}</div>
                    </div>
                </div>
            </Card>

            <Card style={{ padding: '32px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showReview ? 24 : 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                        <div style={{ width: 40, height: 40, background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', borderRadius: 10 }}><PiCheckCircleDuotone size={20}/></div>
                        <div>
                            <h3 style={{ fontWeight: 800, color: C.dark, margin: 0, fontSize: '1.1rem' }}>{t("مراجعة الإجابات")}</h3>
                            <div style={{ fontSize: '0.85rem', color: C.muted }}>{t("استعرض إجاباتك بالتفصيل وتحقق من الأخطاء")}</div>
                        </div>
                    </div>
                    <Btn variant="secondary" onClick={() => setShowReview(!showReview)}>{showReview ? t("إخفاء التفاصيل") : t("عرض التفاصيل")}</Btn>
                </div>
                
                {showReview && (
                    <FadeIn>
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
                            {review.map((r, i) => (
                                <div key={i} style={{ padding: '20px', borderRadius: 16, border: `1px solid ${r.isCorrect ? C.green : C.red}40`, background: r.isCorrect ? C.greenBg : C.redBg }}>
                                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: 12, marginBottom: 16 }}>
                                        <div style={{ color: r.isCorrect ? C.green : C.red, marginTop: 2 }}>{r.isCorrect ? <PiCheckCircleDuotone size={24} /> : <PiXCircleDuotone size={24} />}</div>
                                        <div style={{ fontWeight: 700, color: C.dark, fontSize: '1.05rem', lineHeight: 1.5 }}>{r.qText}</div>
                                    </div>
                                    <div style={{ paddingRight: 36, display: 'grid', gridTemplateColumns: r.isCorrect ? '1fr' : '1fr 1fr', gap: 16 }}>
                                        <div style={{ background: C.white, padding: '12px 16px', borderRadius: 10, border: `1px solid ${r.isCorrect ? C.green : C.red}30` }}>
                                            <div style={{ fontSize: '0.75rem', color: C.muted, marginBottom: 4, fontWeight: 700 }}>{t("إجابتك")}</div>
                                            <div style={{ fontSize: '0.95rem', color: C.dark, fontWeight: 600 }}>{r.yourAns}</div>
                                        </div>
                                        {!r.isCorrect && (
                                            <div style={{ background: C.white, padding: '12px 16px', borderRadius: 10, border: `1px dashed ${C.green}` }}>
                                                <div style={{ fontSize: '0.75rem', color: C.green, marginBottom: 4, fontWeight: 700 }}>{t("الإجابة الصحيحة")}</div>
                                                <div style={{ fontSize: '0.95rem', color: C.dark, fontWeight: 600 }}>{r.correctAns}</div>
                                            </div>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </FadeIn>
                )}
            </Card>

          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
