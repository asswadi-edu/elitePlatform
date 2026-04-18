import React, { useState, useEffect, useContext } from "react";
import { LanguageContext } from "../../LanguageContext";
import { C } from "../../tokens";
import { Btn, Badge, Card } from "../../components/Common";
import { PiTimerDuotone } from "react-icons/pi";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getApiUrl } from "../../api";

export default function TestPage({ setPage, inDashboard = false, isUniversity, userName = "محمد العلي", onLogout }) {
  const { t } = useContext(LanguageContext);
  const [questions, setQuestions] = useState([]);
  const [loading, setLoading] = useState(true);
  const opts = ["أوافق بشدة","أوافق","محايد","لا أوافق","لا أوافق بشدة"];
  const [current, setCurrent] = useState(0);
  const [answers, setAnswers] = useState({});
  const [testId, setTestId] = useState(null);
  const [timeLimit, setTimeLimit] = useState(null);
  const [timeLeft, setTimeLeft] = useState(null);
  const [elapsed, setElapsed] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [isTimeUp, setIsTimeUp] = useState(false);

  useEffect(() => {
    fetchQuestions();
  }, []);

  const fetchQuestions = async () => {
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/aptitude-test`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        
        // Handle max attempts reached
        if (data.has_taken_test) {
          setPage(inDashboard ? "dash-test-result" : "test-result", { 
            uuid: data.past_results?.[0]?.uuid 
          });
          return;
        }

        setQuestions(data.questions || []);
        if (data.test) {
            setTestId(data.test.id);
            if (data.test.time_limit) {
              setTimeLimit(data.test.time_limit);
              setTimeLeft(data.test.time_limit * 60);
            }
        }
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const currentQuestionsLength = questions ? questions.length : 0;
  const progress = currentQuestionsLength > 0 ? Math.round(((current + 1) / currentQuestionsLength) * 100) : 0;

  useEffect(() => {
    const interval = setInterval(() => {
      setElapsed(e => e + 1);
      if (timeLimit) {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimeUp(true);
            clearInterval(interval);
            return 0;
          }
          return prev - 1;
        });
      }
    }, 1000);
    return () => clearInterval(interval);
  }, [timeLimit]);

  const formatTime = (sec) => {
    const m = Math.floor(sec/60).toString().padStart(2,"0");
    const s = (sec%60).toString().padStart(2,"0");
    return `${m}:${s}`;
  };

  const handleSubmit = async () => {
    if (submitting) return;
    setSubmitting(true);

    const requestAnswers = {};
    questions.forEach(q => {
      if (answers[q.id]) {
        requestAnswers[`q${q.display_order}`] = answers[q.id];
      }
    });

    // الانتهاء والانتقال لصفحة النتيجة مع تمرير الإجابات
    setPage(inDashboard ? "dash-test-result" : "test-result", { 
      requestAnswers, 
      testId, 
      elapsed 
    });
  };

  if (loading) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", direction: "rtl", background: inDashboard ? "transparent" : C.bg }}>
        <div style={{ textAlign: "center" }}>
          <div style={{ width: 40, height: 40, border: `3px solid ${C.blueLight}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
          <p style={{ color: C.muted }}>جاري تحميل الأسئلة...</p>
        </div>
      </div>
    );
  }

  if (!questions || questions.length === 0) {
    return (
      <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "60vh", background: inDashboard ? "transparent" : C.bg }}>
        <Card style={{ padding: 40, textAlign: "center" }}>
          <div style={{ fontSize: "3rem", marginBottom: 16 }}>⚠️</div>
          <h3 style={{ fontWeight: 800, color: C.dark }}>{t("لا توجد أسئلة")}</h3>
          <p style={{ color: C.muted, marginBottom: 24 }}>{t("عذراً، لا توجد أسئلة متاحة لهذا الاختبار حالياً.")}</p>
          <Btn onClick={() => setPage(inDashboard ? "dashboard" : "home")}>{t("العودة")}</Btn>
        </Card>
      </div>
    );
  }

  const content = (
    <div style={{ direction:"rtl", minHeight: inDashboard ? "auto" : "80vh", background: inDashboard ? "transparent" : C.bg, display:"flex", alignItems:"center", padding: inDashboard ? "0" : "60px 28px" }}>
      <div style={{ maxWidth:700, margin:"0 auto", width:"100%" }}>
        <Card style={{ padding:"40px 44px" }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
            <span style={{ color:C.muted, fontSize:"0.85rem" }}>السؤال {current+1} من {currentQuestionsLength}</span>
            <div style={{ display:"flex", alignItems:"center", gap:12 }}>
              <div style={{ display:"flex", alignItems:"center", gap:6, background:C.bg, border:`1px solid ${C.border}`, borderRadius:20, padding:"4px 12px" }}>
                <span style={{ fontSize:"1rem", color:C.muted, display:"flex" }}><PiTimerDuotone/></span>
                <span style={{ fontSize:"0.86rem", fontWeight:700, color: (timeLeft !== null && timeLeft < 60) ? C.red : C.dark, fontFamily:"monospace" }}>
                  {timeLeft !== null ? formatTime(timeLeft) : formatTime(elapsed)}
                </span>
              </div>
              <Badge color={C.blue}>{t("اختبار الاهتمامات")}</Badge>
            </div>
          </div>
          <div style={{ background:C.border, borderRadius:10, height:7, marginBottom:36 }}>
            <div style={{ background:`linear-gradient(90deg, ${C.blue}, #6B8EFF)`, width:`${progress}%`, height:"100%", borderRadius:10, transition:"width .4s ease" }} />
          </div>
          <h2 style={{ fontSize:"1.18rem", fontWeight:700, color:C.dark, marginBottom:28, lineHeight:1.6 }}>{questions[current]?.question_text}</h2>
          
          <div style={{ position: "relative" }}>
            {isTimeUp && (
              <div style={{ position: "absolute", inset: "-20px", background: "rgba(255,255,255,0.85)", backdropFilter: "blur(4px)", zIndex: 10, borderRadius: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", textAlign: "center", padding: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: "50%", background: "#FEF2F2", color: C.red, display: "flex", alignItems: "center", justifyContent: "center", fontSize: "2rem", marginBottom: 16 }}>✕</div>
                <h3 style={{ fontWeight: 800, color: C.dark, marginBottom: 8 }}>{t("انتهى الوقت!")}</h3>
                <p style={{ color: C.muted, fontSize: "0.9rem", marginBottom: 24 }}>{t("للأسف، انتهى الوقت المخصص للاختبار قبل إكماله. لا يمكن حفظ إجاباتك.")}</p>
                <Btn onClick={() => setPage(inDashboard ? "dash-test-intro" : "test-intro")}>{t("إعادة المحاولة")}</Btn>
              </div>
            )}
            
            <div style={{ display:"flex", flexDirection:"column", gap:12, marginBottom:36, opacity: isTimeUp ? 0.3 : 1, pointerEvents: isTimeUp ? "none" : "auto" }}>
              {opts.map((opt, oIdx) => {
                const questionId = questions[current]?.id;
                const selected = questionId ? answers[questionId] === (5 - oIdx) : false;
                return (
                  <div key={opt} onClick={() => questionId && setAnswers(a => ({ ...a, [questionId]: (5 - oIdx) }))} style={{ display:"flex", alignItems:"center", gap:14, padding:"13px 18px", borderRadius:11, border:`1.5px solid ${selected ? C.blue : C.border}`, background: selected ? C.blueLight : C.white, cursor:"pointer", transition:"all .2s" }}>
                    <div style={{ width:20, height:20, borderRadius:"50%", border:`2px solid ${selected ? C.blue : C.border}`, background: selected ? C.blue : "transparent", display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                      {selected && <div style={{ width:8, height:8, borderRadius:"50%", background:C.white }} />}
                    </div>
                    <span style={{ color: selected ? C.blue : C.body, fontWeight: selected ? 700 : 400, fontSize:"0.92rem" }}>{opt}</span>
                  </div>
                );
              })}
            </div>
          </div>

          <div style={{ display:"flex", justifyContent:"space-between", opacity: isTimeUp ? 0.3 : 1, pointerEvents: isTimeUp ? "none" : "auto" }}>
            {current > 0 ? <Btn variant="secondary" onClick={() => setCurrent(c => c-1)}>السابق →</Btn> : <div />}
            <Btn 
              onClick={() => current < currentQuestionsLength-1 ? setCurrent(c => c+1) : handleSubmit()} 
              style={{ opacity: (questions[current] && answers[questions[current].id]) ? 1 : .5 }} 
              disabled={submitting || isTimeUp || !answers[questions[current]?.id]}
            >
              {submitting ? t("جاري المعالجة...") : (current < currentQuestionsLength-1 ? t("← التالي") : t("← عرض النتائج"))}
            </Btn>
          </div>
        </Card>
      </div>
    </div>
  );

  if (inDashboard) {
    return (
      <DashboardLayout activeSub="dashboard" setPage={setPage} isUniversity={isUniversity} userName={userName} onLogout={onLogout}>
        {content}
      </DashboardLayout>
    );
  }

  return content;
}
