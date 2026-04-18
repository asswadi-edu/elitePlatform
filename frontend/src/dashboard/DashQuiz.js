import React, { useState, useEffect, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Badge, Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function DashQuiz({ setPage, pageData }) {
  const { t } = useContext(LanguageContext);
  const [quiz, setQuiz] = useState(null);
  const [qs, setQs] = useState([]);
  const [cur, setCur] = useState(0);
  const [answers, setAnswers] = useState({});
  const [elapsed, setElapsed] = useState(0);
  const [paused, setPaused] = useState(false);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    const fetchQuiz = async () => {
      if (!pageData?.uuid) {
         setLoading(false);
         return;
      }
      try {
        const token = localStorage.getItem('elite_token');
        const res = await fetch(`${getApiUrl()}/api/ai-quizzes/${pageData.uuid}`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuiz(data);
          let questions = data.questions_json;
          if (!Array.isArray(questions)) {
             questions = questions.questions || questions['أسئلة'] || (questions['اختبار'] && questions['اختبار']['أسئلة']) || Object.values(questions).find(v => Array.isArray(v)) || [];
          }
          
          // Normalize AI variations (handle generic options, true/false missing options, boolean answers)
          questions = questions.map((q, idx) => {
             let opts = q.options || q.opts || q.choices || q['خيارات'] || [];
             let correct = q.correct ?? q.answer ?? q['إجابة'] ?? 0;
             let qText = q.question || q.q || q['سؤال'] || "سؤال غير معروف";
             
             if (opts.length === 0 && (q.type === 'true_false' || q['نوع'] === 'صح/خطأ' || typeof correct === 'boolean')) {
                 opts = ['صح', 'خطأ'];
                 correct = (correct === true || correct === 'صح' || correct === 'true') ? 0 : 1;
             }
             
             // If correct answer is a string but not 'صح'/'خطأ', try to find its index in options
             if (typeof correct === 'string' && isNaN(correct) && correct !== 'صح' && correct !== 'خطأ') {
                 const foundIdx = opts.findIndex(o => o === correct);
                 if (foundIdx !== -1) correct = foundIdx;
             }
             
             return { ...q, question: qText, options: opts, correct: parseInt(correct) || 0, originalIndex: idx };
          }).sort((a, b) => {
              if (a.options.length === 2 && b.options.length > 2) return -1;
              if (a.options.length > 2 && b.options.length === 2) return 1;
              return 0;
          });

          setQs(questions);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuiz();
  }, [pageData.uuid]);

  useEffect(() => { 
    if (paused || loading || !quiz) return; 
    const interval = setInterval(() => setElapsed(e => e + 1), 1000); 
    return () => clearInterval(interval); 
  }, [paused, loading, quiz]);

  const submitQuiz = async () => {
    setSubmitting(true);
    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${getApiUrl()}/api/ai-quizzes/${pageData.uuid}/submit`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json' 
        },
        body: JSON.stringify({
          answers: answers,
          time_taken: elapsed
        })
      });

      if (res.ok) {
        const result = await res.json();
        setPage('dash-result', { 
            quiz: result.quiz, 
            attempt: result.attempt, 
            score: result.score,
            elapsed: elapsed
        });
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <DashboardLayout activeSub="quizzes" setPage={setPage}><div style={{ padding: 40, textAlign: 'center' }}>{t("جاري تحميل الاختبار...")}</div></DashboardLayout>;
  if (!qs.length) return <DashboardLayout activeSub="quizzes" setPage={setPage}><div style={{ padding: 40, textAlign: 'center' }}>{t("تعذر تحميل أسئلة الاختبار.")}</div></DashboardLayout>;

  const progress = Math.round(((cur + 1) / qs.length) * 100);
  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${(s % 60).toString().padStart(2, '0')}`;
  const timerColor = elapsed > (quiz.time_limit * 60) ? C.red : elapsed > (quiz.time_limit * 30) ? C.orange : C.dark;

  return (
    <DashboardLayout activeSub="quizzes" setPage={setPage}>
      <div style={{ maxWidth: 660, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
          <Badge color={C.blue}>{quiz.subject}</Badge>
          <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 8, background: elapsed > (quiz.time_limit * 60) ? C.redBg : C.bg, border: `1.5px solid ${elapsed > (quiz.time_limit * 60) ? C.red : C.border}`, borderRadius: 22, padding: '6px 14px', transition: 'all .3s' }}>
              <span style={{ fontSize: '0.9rem' }}>⏱️</span>
              <span style={{ fontSize: '0.95rem', fontWeight: 800, color: timerColor, fontFamily: 'monospace', letterSpacing: '0.05em' }}>{fmt(elapsed)}</span>
            </div>
            <button onClick={() => setPaused(p => !p)} style={{ background: 'none', border: `1.5px solid ${C.border}`, borderRadius: 8, padding: '5px 10px', cursor: 'pointer', fontSize: '0.8rem', color: C.muted }}>{paused ? t('▶️ استئناف') : t('⏸️ إيقاف')}</button>
            <span style={{ color: C.muted, fontSize: '0.85rem' }}>{cur + 1} / {qs.length}</span>
          </div>
        </div>
        <div style={{ background: C.border, borderRadius: 10, height: 7, marginBottom: 32 }}><div style={{ background: `linear-gradient(90deg,${C.blue},#6B8EFF)`, width: `${progress}%`, height: '100%', borderRadius: 10, transition: 'width .4s' }} /></div>
        <Card style={{ padding: '36px 40px' }}>
          <h2 style={{ fontSize: '1.12rem', fontWeight: 700, color: C.dark, marginBottom: 26, lineHeight: 1.65 }}>{qs[cur].question}</h2>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12, marginBottom: 34 }}>
            {qs[cur].options.map((opt, i) => {
              const sel = answers[qs[cur].originalIndex] === i;
              return (
                <div key={i} onClick={() => !submitting && setAnswers(a => ({ ...a, [qs[cur].originalIndex]: i }))} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '13px 18px', borderRadius: 11, border: `1.5px solid ${sel ? C.blue : C.border}`, background: sel ? C.blueLight : C.white, cursor: 'pointer', transition: 'all .2s' }}>
                  <div style={{ width: 20, height: 20, borderRadius: '50%', border: `2px solid ${sel ? C.blue : C.border}`, background: sel ? C.blue : 'transparent', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>{sel && <div style={{ width: 8, height: 8, borderRadius: '50%', background: C.white }} />}</div>
                  <span style={{ color: sel ? C.blue : C.body, fontWeight: sel ? 700 : 400, fontSize: '0.91rem' }}>{opt}</span>
                </div>
              );
            })}
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            {cur > 0 ? <Btn variant="secondary" onClick={() => setCur(c => c - 1)} disabled={submitting}>{t("السابقة")}</Btn> : <div />}
            <Btn onClick={() => cur < qs.length - 1 ? setCur(c => c + 1) : submitQuiz()} disabled={submitting}>
              {submitting ? t("جاري الإرسال...") : (cur < qs.length - 1 ? t('التالية') : t('عرض النتائج'))}
            </Btn>
          </div>
        </Card>
      </div>
    </DashboardLayout>
  );
}
