import React, { useState, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiTrophyDuotone, PiTimerDuotone, PiCheckCircleDuotone, PiXCircleDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';

export default function DashResult({ setPage, pageData }) {
  const { t } = useContext(LanguageContext);
  const [showReview, setShowReview] = useState(false);
  
  const { quiz, attempt, score, elapsed } = pageData || { quiz: null, attempt: null, score: 0, elapsed: 0 };
  
  if (!quiz || !attempt) {
    return (
      <DashboardLayout activeSub="quizzes" setPage={setPage}>
        <div style={{ padding: 40, textAlign: 'center' }}>{t("بيانات النتيجة غير متوفرة.")}</div>
      </DashboardLayout>
    );
  }

  let questions = quiz.questions_json;
  if (!Array.isArray(questions)) {
     questions = questions.questions || questions['أسئلة'] || (questions['اختبار'] && questions['اختبار']['أسئلة']) || Object.values(questions).find(v => Array.isArray(v)) || [];
  }

  const review = questions.map((q, i) => {
    // Normalize logic identical to DashQuiz
    let opts = q.options || q.opts || q.choices || q['خيارات'] || [];
    let correct = q.correct ?? q.answer ?? q['إجابة'] ?? 0;
    if (opts.length === 0 && (q.type === 'true_false' || q['نوع'] === 'صح/خطأ' || typeof correct === 'boolean')) {
        opts = ['صح', 'خطأ'];
        correct = (correct === true || correct === 'صح' || correct === 'true') ? 0 : 1;
    }
    
    // If correct answer is a string but not 'صح'/'خطأ', try to find its index in options
    if (typeof correct === 'string' && isNaN(correct) && correct !== 'صح' && correct !== 'خطأ') {
        const foundIdx = opts.findIndex(o => o === correct);
        if (foundIdx !== -1) correct = foundIdx;
    }
    
    return { ...q, question: q.question || q.q || q['سؤال'] || "سؤال غير معروف", options: opts, correct: parseInt(correct) || 0, originalIndex: i };
  }).sort((a, b) => {
    if (a.options.length === 2 && b.options.length > 2) return -1;
    if (a.options.length > 2 && b.options.length === 2) return 1;
    return 0;
  }).map((q) => {
    const userAnsIdx = attempt.answers_json[q.originalIndex];
    
    return {
      q: q.question,
      your: q.options[userAnsIdx] !== undefined ? q.options[userAnsIdx] : t("لم تتم الإجابة"),
      correct: q.options[q.correct],
      ok: userAnsIdx == q.correct
    };
  });

  const correctCount = review.filter(r => r.ok).length;
  const wrongCount = review.length - correctCount;

  const fmt = (s) => `${Math.floor(s / 60).toString().padStart(2, '0')}:${((s % 60) || 0).toString().padStart(2, '0')}`;

  return (
    <DashboardLayout activeSub="quizzes" setPage={setPage}>
      <div style={{ maxWidth: 640, margin: '0 auto' }}>
        <Card style={{ padding: '48px 40px', textAlign: 'center', marginBottom: 22 }}>
          <div style={{ color: C.gold, marginBottom: 16, display: 'flex', justifyContent: 'center' }}><PiTrophyDuotone size={64} /></div>
          <h1 style={{ fontSize: '2rem', fontWeight: 900, color: C.dark, margin: '0 0 8px' }}>{Math.round(score)}%</h1>
          <p style={{ color: C.muted, marginBottom: 28 }}>{quiz.subject} — {correctCount} {t("إجابة صحيحة من")} {questions.length}</p>
          {elapsed > 0 && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 10, background: C.blueLight, border: `1.5px solid ${C.blueMid}`, borderRadius: 20, padding: '8px 20px', marginBottom: 28 }}>
              <span style={{ color: C.blue, display: 'flex' }}><PiTimerDuotone size={18} /></span>
              <span style={{ fontWeight: 800, color: C.blue, fontSize: '1.1rem', fontFamily: 'monospace' }}>{fmt(elapsed)}</span>
              <span style={{ color: C.muted, fontSize: '0.82rem' }}>{t("وقت الإجابة")}</span>
            </div>
          )}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 36 }}>
            {[[correctCount, t('الصحيحة'), C.green], [wrongCount, t('الخاطئة'), C.red], [Math.round(score) + '%', t('الدرجة'), C.blue]].map(([v, l, c]) => (
              <div key={l} style={{ background: c + '12', border: `1px solid ${c}25`, borderRadius: 12, padding: 18 }}>
                <div style={{ fontSize: '1.6rem', fontWeight: 800, color: c }}>{v}</div>
                <div style={{ color: C.muted, fontSize: '0.8rem' }}>{l}</div>
              </div>
            ))}
          </div>
          <div style={{ display: 'flex', gap: 14, justifyContent: 'center' }}>
            <Btn onClick={() => setPage('dash-generate', { retest: true, fileName: quiz.file_name || quiz.subject, subject: quiz.subject })}>{t("توليد اختبار لنفس الملف")}</Btn>
            <Btn variant="secondary" onClick={() => setPage('dash-quiz', { uuid: quiz.uuid })}>{t("إعادة الاختبار نفسه")}</Btn>
            <Btn variant="ghost" onClick={() => setPage('dash-quizzes')}>{t("اختباراتي")}</Btn>
          </div>
        </Card>
        <Card style={{ padding: '24px 28px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: showReview ? 20 : 0 }}>
            <h3 style={{ fontWeight: 700, color: C.dark, margin: 0, fontSize: '0.95rem' }}>{t("مراجعة الأسئلة")}</h3>
            <Btn variant="ghost" style={{ fontSize: '0.82rem', padding: '6px 14px' }} onClick={() => setShowReview(!showReview)}>{showReview ? t("إخفاء") : t("عرض المراجعة")}</Btn>
          </div>
          {showReview && (
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              {review.map((r, i) => (
                <div key={i} style={{ padding: '14px 16px', borderRadius: 10, border: `1px solid ${r.ok ? C.green : C.red}25`, background: r.ok ? C.greenBg : C.redBg }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 8 }}>
                    <span style={{ color: r.ok ? C.green : C.red, display: 'flex' }}>{r.ok ? <PiCheckCircleDuotone size={18} /> : <PiXCircleDuotone size={18} />}</span>
                    <span style={{ fontWeight: 600, color: C.dark, fontSize: '0.88rem' }}>{t("س")}{i + 1}: {r.q}</span>
                  </div>
                  <div style={{ paddingRight: 28 }}>
                    <div style={{ fontSize: 0.82, color: r.ok ? C.green : C.red, marginBottom: 4 }}>{t("إجابتك: ")}{r.your}</div>
                    {!r.ok && (<div style={{ fontSize: '0.82rem', color: C.green }}>{t("الإجابة الصحيحة: ")}{r.correct}</div>)}
                  </div>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </DashboardLayout>
  );
}
