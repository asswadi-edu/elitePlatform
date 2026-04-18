import React, { useState, useEffect, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { FadeIn } from '../utils';
import { PiTrophyDuotone, PiUsersFourDuotone, PiTimerDuotone, PiLightningDuotone, PiChartLineUpDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function DashChallengeView({ setPage, data = {} }) {
  const { t } = useContext(LanguageContext);
  const challengeUuid = data.challenge?.uuid || data.challenge?.code;
  
  const [challenge, setChallenge] = useState({ title: t('تحدي جاري التحميل...'), code: challengeUuid });
  const [qs, setQs] = useState([]);
  const [participants, setParticipants] = useState([]);
  
  const [loading, setLoading] = useState(true);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [combo, setCombo] = useState(0);
  const [score, setScore] = useState(0);
  const [qStartTime, setQStartTime] = useState(Date.now());
  const [bonusMsg, setBonusMsg] = useState("");
  const [gameSettings, setGameSettings] = useState({ speed_bonus_bronze: 10, combo_bonus_bronze: 2 });

  // Added logic to calculate progress
  const progress = qs.length > 0 ? Math.round(((cur) / qs.length) * 100) : 0;

  useEffect(() => {
    fetchChallenge();
  }, [challengeUuid]);

  async function fetchChallenge() {
    setLoading(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/challenges/${challengeUuid}`, {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Accept': 'application/json'
        }
      });
      const data = await res.json();
      if (res.ok) {
        setChallenge(data.challenge);
        setQs(data.questions || []);
        setParticipants(data.participants || []);
        if (data.settings) setGameSettings(data.settings);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  useEffect(() => {
    const timer = setInterval(() => {
      setElapsed(e => e + 1);
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    // Reset timer when question changes
    setQStartTime(Date.now());
  }, [cur, qs]);

  useEffect(() => {
    // Keep sync leaderboard
    const syncServer = async () => {
      try {
        const res = await fetch(`${getApiUrl()}/api/challenges/${challengeUuid}/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          },
          body: JSON.stringify({ score, progress })
        });
        const d = await res.json();
        if (res.ok) setParticipants(d.participants || []);
      } catch (err) {}
    };

    const syncInterval = setInterval(syncServer, 3000);
    return () => clearInterval(syncInterval);
  }, [score, progress, challengeUuid]);

  const handleAnswer = (idx) => {
    const isCorrect = idx === qs[cur].correct;
    setAnswers({ ...answers, [cur]: idx });
    
    let newScore = score;
    let newCombo = combo;
    if (isCorrect) {
      newCombo = combo + 1;
      setCombo(newCombo);
      
      const timeSpentOnQuestion = Math.max(0, Math.floor((Date.now() - qStartTime) / 1000));
      let speedBonus = 0;
      const maxSpeedBonus = parseInt(gameSettings.speed_bonus_bronze) || 10;
      if (timeSpentOnQuestion < 10) {
          // Grant proportional speed bonus up to maxSpeedBonus
          speedBonus = Math.floor(maxSpeedBonus * ((10 - timeSpentOnQuestion) / 10));
      }

      const comboBonus = parseInt(gameSettings.combo_bonus_bronze) || 2;
      const points = 10 + (newCombo * comboBonus) + speedBonus;
      newScore = score + points;
      setScore(newScore);

      if (speedBonus > 0) {
          setBonusMsg(`+${speedBonus} ${t("نجوم سرعة!")}`);
          setTimeout(() => setBonusMsg(""), 1500);
      }
    } else {
      setCombo(0);
      newCombo = 0;
    }

    const nextProgress = Math.round(((cur + 1) / qs.length) * 100);

    setTimeout(() => {
      if (cur < qs.length - 1) {
        setCur(c => c + 1);
      } else {
        // Prepare completion stats
        let correctCount = 0;
        qs.forEach((q, idx) => {
            if (answers[idx] === q.correct) correctCount++;
        });

        // Send final sync then redirect
         fetch(`${getApiUrl()}/api/challenges/${challengeUuid}/sync`, {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({ 
              score: newScore, 
              progress: nextProgress,
              status: 1, 
              time_spent: elapsed, 
              correct_count: correctCount,
              answers_json: answers
          })
        }).then(() => {
            setPage('dash-challenge-result', { challenge, qs, answers, score: newScore, elapsed, participants });
        });
      }
    }, 600);
  };

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;

  return (
    <DashboardLayout activeSub="challenges" setPage={setPage} hideSidebar={true}>
      <div style={{ display:'grid', gridTemplateColumns:'1fr 340px', gap:32, height:'calc(100vh - 120px)', padding:'0 20px' }}>
        
        {/* Main Content: Quiz Area */}
        <div style={{ display:'flex', flexDirection:'column', gap:24 }}>
          {/* Challenge Header */}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', background:C.white, padding:'16px 24px', borderRadius:20, border:`1px solid ${C.border}`, boxShadow:'0 4px 12px rgba(0,0,0,0.03)' }}>
            <div style={{ display:'flex', alignItems:'center', gap:15 }}>
                <div style={{ width:48, height:48, borderRadius:14, background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.4rem' }}>
                    <PiTrophyDuotone />
                </div>
                <div>
                    <h2 style={{ fontSize:'1.1rem', fontWeight:800, color:C.dark, margin:0 }}>{t(challenge.title)}</h2>
                    <div style={{ color:C.muted, fontSize:'0.85rem' }}>{t("كود التحدي: ")}{challenge.code}</div>
                </div>
            </div>
            <div style={{ display:'flex', gap:20 }}>
                <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.75rem', color:C.muted, marginBottom:2 }}>{t("الوقت")}</div>
                    <div style={{ fontWeight:800, color:C.dark, fontFamily:'monospace', fontSize:'1.1rem' }}>{fmt(elapsed)}</div>
                </div>
                <div style={{ textAlign:'center' }}>
                    <div style={{ fontSize:'0.75rem', color:C.muted, marginBottom:2 }}>{t("النجوم")}</div>
                    <div style={{ fontWeight:900, color:C.blue, fontSize:'1.2rem', position:'relative' }}>
                        {score}
                        {bonusMsg && (
                            <div style={{ position:'absolute', top: -20, left: '50%', transform: 'translateX(-50%)', color:C.gold, fontSize:'0.85rem', whiteSpace: 'nowrap', animation: 'fadeInUp 0.5s ease forwards' }}>{bonusMsg}</div>
                        )}
                    </div>
                </div>
            </div>
          </div>

          {loading ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${C.blue}`, borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite' }}></div>
              <div style={{ color:C.muted }}>{t("جاري تجهيز التحدي...")}</div>
            </div>
          ) : qs.length === 0 ? (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center', flexDirection:'column', gap:10 }}>
              <div style={{ color:C.red }}>{t("لم يتم العثور على أسئلة لهذا التحدي!")}</div>
            </div>
          ) : (
            <div style={{ flex:1, display:'flex', alignItems:'center', justifyContent:'center' }}>
                <FadeIn style={{ width:'100%', maxWidth:600 }}>
                  <div style={{ textAlign:'center', marginBottom:32 }}>
                    <Badge color={C.orange} style={{ marginBottom:12 }}><PiLightningDuotone size={14}/> {combo > 1 ? `${combo}x COMBO!` : t("السؤال ") + (cur + 1)}</Badge>
                    <h2 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, lineHeight:1.5 }}>{qs[cur]?.q || ''}</h2>
                  </div>

                  <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                    {qs[cur]?.opts?.map((opt, i) => {
                      const isSelected = answers[cur] === i;
                      return (
                        <Card 
                          key={i} 
                          onClick={() => handleAnswer(i)}
                          style={{ 
                            padding:'24px', 
                            textAlign:'center', 
                            cursor:'pointer', 
                            border:`2px solid ${isSelected ? C.blue : C.border}`,
                            background: isSelected ? C.blueLight : C.white,
                            transition:'all .2s'
                          }}
                          hover
                        >
                          <span style={{ fontWeight:700, color: isSelected ? C.blue : C.dark, fontSize:'1rem' }}>{opt}</span>
                        </Card>
                      );
                    })}
                  </div>
                </FadeIn>
            </div>
          )}

          {/* Progress Bottom Bar */}
          <div style={{ background:C.white, padding:'20px 24px', borderRadius:20, border:`1px solid ${C.border}` }}>
             <div style={{ display:'flex', justifyContent:'space-between', marginBottom:8, fontSize:'0.85rem', fontWeight:700 }}>
                <span style={{ color:C.muted }}>{t("تقدم اللعبة")}</span>
                <span style={{ color:C.blue }}>{progress}%</span>
             </div>
             <div style={{ height:10, background:C.bg, borderRadius:5, overflow:'hidden' }}>
                <div style={{ width:`${progress}%`, height:'100%', background:C.blue, transition:'width .5s cubic-bezier(0.175, 0.885, 0.32, 1.275)' }}></div>
             </div>
          </div>
        </div>

        {/* Sidebar: Live Leaderboard */}
        <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
          <Card style={{ flex:1, display:'flex', flexDirection:'column', padding:'24px' }}>
            <h3 style={{ fontSize:'1.05rem', fontWeight:800, color:C.dark, marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
                <PiUsersFourDuotone size={22} color={C.blue}/> {t("لوحة المتصدرين الحية")}
            </h3>
            
            {/* Winner Podium */}
            <div style={{ display:'flex', alignItems:'flex-end', justifyContent:'center', gap:8, marginBottom:28, height:130, paddingBottom:10, borderBottom:`1px solid ${C.border}50` }}>
                {(() => {
                    const sorted = [...participants].sort((a,b) => b.score - a.score);
                    const p1 = sorted[0];
                    const p2 = sorted[1];
                    const p3 = sorted[2];
                    return (
                        <>
                            {/* 2nd Place */}
                            {p2 && (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:80 }}>
                                    <div style={{ width:32, height:32, borderRadius:'50%', background:C.border, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:900, marginBottom:6 }}>{p2.name[0]}</div>
                                    <div style={{ padding:'8px 4px', width:'100%', background:`linear-gradient(180deg, #94A3B8 0%, #64748B 100%)`, borderRadius:'8px 8px 4px 4px', textAlign:'center', color:C.white, position:'relative' }}>
                                        <div style={{ fontSize:'0.7rem', fontWeight:800 }}>#2</div>
                                        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)' }}><PiTrophyDuotone size={18} color="#CBD5E1"/></div>
                                    </div>
                                    <div style={{ fontSize:'0.7rem', fontWeight:700, marginTop:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center' }}>{p2.name}</div>
                                </div>
                            )}
                            {/* 1st Place */}
                            {p1 && (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:90 }}>
                                    <div style={{ width:40, height:40, borderRadius:'50%', border:`2px solid #FFD700`, padding:2, marginBottom:6 }}>
                                        <div style={{ width:'100%', height:'100%', borderRadius:'50%', background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.9rem', fontWeight:900 }}>{p1.name[0]}</div>
                                    </div>
                                    <div style={{ padding:'12px 4px', width:'100%', background:`linear-gradient(180deg, #F59E0B 0%, #D97706 100%)`, borderRadius:'10px 10px 4px 4px', textAlign:'center', color:C.white, position:'relative', boxShadow:`0 4px 12px rgba(245, 158, 11, 0.3)` }}>
                                        <div style={{ fontSize:'0.85rem', fontWeight:900 }}>#1</div>
                                        <div style={{ position:'absolute', top:-16, left:'50%', transform:'translateX(-50%)' }}><PiTrophyDuotone size={24} color="#FFF"/></div>
                                    </div>
                                    <div style={{ fontSize:'0.75rem', fontWeight:800, marginTop:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center' }}>{p1.name}</div>
                                </div>
                            )}
                            {/* 3rd Place */}
                            {p3 && (
                                <div style={{ display:'flex', flexDirection:'column', alignItems:'center', width:80 }}>
                                    <div style={{ width:32, height:32, borderRadius:'50%', background:C.border, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'0.75rem', fontWeight:900, marginBottom:6 }}>{p3.name[0]}</div>
                                    <div style={{ padding:'6px 4px', width:'100%', background:`linear-gradient(180deg, #B45309 0%, #78350F 100%)`, borderRadius:'8px 8px 4px 4px', textAlign:'center', color:C.white, position:'relative' }}>
                                        <div style={{ fontSize:'0.65rem', fontWeight:800 }}>#3</div>
                                        <div style={{ position:'absolute', top:-12, left:'50%', transform:'translateX(-50%)' }}><PiTrophyDuotone size={16} color="#D97706"/></div>
                                    </div>
                                    <div style={{ fontSize:'0.7rem', fontWeight:700, marginTop:6, whiteSpace:'nowrap', overflow:'hidden', textOverflow:'ellipsis', width:'100%', textAlign:'center' }}>{p3.name}</div>
                                </div>
                            )}
                        </>
                    );
                })()}
            </div>
            <div style={{ flex:1, overflowY:'auto', display:'flex', flexDirection:'column', gap:12 }}>
                {participants.sort((a,b) => b.score - a.score).map((p, idx) => (
                    <div key={idx} style={{ 
                        display:'flex', 
                        alignItems:'center', 
                        gap:12, 
                        padding:'12px', 
                        borderRadius:14, 
                        background: p.current ? 'rgba(59, 130, 246, 0.1)' : C.bg,
                        border: p.current ? `1px solid ${C.blue}40` : `1px solid ${C.border}`,
                        transition:'all .3s' 
                    }}>
                        <div style={{ width:24, fontWeight:900, color: idx < 3 ? C.gold : C.muted, fontSize:'0.9rem' }}>#{idx+1}</div>
                        <div style={{ flex:1 }}>
                            <div style={{ fontWeight:700, color:C.dark, fontSize:'0.88rem', marginBottom:4 }}>{p.name} {p.current && "⭐"}</div>
                            <div style={{ height:4, background:'rgba(0,0,0,0.05)', borderRadius:2, overflow:'hidden' }}>
                                <div style={{ width:`${p.progress}%`, height:'100%', background: p.current ? C.blue : C.blueMid }}></div>
                            </div>
                        </div>
                        <div style={{ fontWeight:900, fontSize:'0.9rem', color: idx === 0 ? C.orange : C.dark }}>{p.score}</div>
                    </div>
                ))}
            </div>

            <div style={{ marginTop:24, borderTop:`1px solid ${C.border}`, paddingTop:20 }}>
                <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', color:C.muted, fontSize:'0.82rem' }}>
                    <span>{t("المشاركين المتصلين")}</span>
                    <span style={{ color:C.green, fontWeight:800 }}>• {participants.length} {t("نشط")}</span>
                </div>
            </div>
          </Card>

          <Btn variant="secondary" style={{ color:C.red, borderColor:C.red, background:C.white }} onClick={() => { if(window.confirm(t("هل أنت متأكد من الانسحاب؟"))) setPage('dash-challenges'); }}>{t("انسحاب من التحدي")}</Btn>
        </div>

      </div>
    </DashboardLayout>
  );
}
