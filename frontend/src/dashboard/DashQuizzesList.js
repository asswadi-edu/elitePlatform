import React, { useState, useEffect, useContext } from 'react';
import { C } from '../tokens';
import { Btn, Card, Badge } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiNotePencilDuotone, PiCalendarDuotone, PiQuestionDuotone, PiTimerDuotone, PiCheckCircleDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { UserContext } from '../UserContext';
import { getApiUrl } from '../api';

export default function DashQuizzesList({ setPage, activeSubscription }) {
  const { t } = useContext(LanguageContext);
  const { user, isSubscribed } = useContext(UserContext);
  const perms = user?.user_permissions || user?.permissions || [];
  const [quizzes, setQuizzes] = useState([]);
  const [loading, setLoading] = useState(true);

  // Consider context flag, prop, role, and permission
  const canAccess = isSubscribed || 
                    !!activeSubscription || 
                    user?.roles?.some(r => r.name === 'subscriber') || 
                    perms.includes('access_ai_quizzes');

  useEffect(() => {
    if (!canAccess) {
      setLoading(false);
      return;
    }

    const fetchQuizzes = async () => {
      try {
        const token = localStorage.getItem('elite_token');
        const res = await fetch(`${getApiUrl()}/api/ai-quizzes`, {
          headers: { 'Authorization': `Bearer ${token}` }
        });
        if (res.ok) {
          const data = await res.json();
          setQuizzes(data);
        }
      } catch (e) {
        console.error(e);
      } finally {
        setLoading(false);
      }
    };
    fetchQuizzes();
  }, [canAccess]);

  const avgScore = quizzes.length > 0 
    ? Math.round(quizzes.reduce((acc, q) => acc + (q.latest_attempt ? parseFloat(q.latest_attempt.score) : 0), 0) / quizzes.filter(q => q.latest_attempt).length || 0) 
    : 0;

  if (!canAccess) {
    return (
      <DashboardLayout activeSub="quizzes" setPage={setPage} activeSubscription={activeSubscription}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
          <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("اختباراتي")}</h1><p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("جميع اختباراتك السابقة")}</p></div>
        </div>
        <Card style={{ padding: 60, textAlign: 'center', marginTop: 40 }}>
            <PiNotePencilDuotone size={64} color={C.border} style={{ marginBottom: 16 }} />
            <h2 style={{ color: C.dark, marginBottom: 12 }}>{t("ميزة خاصة بالمشتركين")}</h2>
            <p style={{ color: C.muted, fontSize: '1rem', marginBottom: 30, maxWidth: 400, margin: '0 auto 30px' }}>
              {t("هذه الميزة تتيح لك توليد اختبارات لا نهائية باستخدام الذكاء الاصطناعي بناءً على محتوى موادك الدراسية. اشترك الآن لتتمكن من الوصول إليها.")}
            </p>
            <Btn onClick={() => setPage('dash-activate')}>{t("تفعيل الاشتراك")}</Btn>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeSub="quizzes" setPage={setPage} activeSubscription={activeSubscription}>
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:28 }}>
        <div><h1 style={{ fontSize:'1.4rem', fontWeight:800, color:C.dark, margin:'0 0 6px' }}>{t("اختباراتي")}</h1><p style={{ color:C.muted, fontSize:'0.88rem' }}>{t("جميع اختباراتك السابقة")}</p></div>
        <Btn onClick={() => setPage('dash-generate')}>{t("← إجراء اختبار جديد")}</Btn>
      </div>
      <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:16, marginBottom:28 }}>
        {[[quizzes.length, t('اختبار تولده'), C.blue, C.blueLight], [avgScore + '%', t('متوسط درجاتك'), C.green, C.greenBg], [quizzes.reduce((acc, q) => acc + (q.latest_attempt ? q.num_questions : 0), 0), t('إجمالي الأسئلة المُجابة'), C.orange, C.orangeBg]].map(([v, l, col, bg]) => (
          <Card key={l} style={{ padding:'18px 22px', display:'flex', alignItems:'center', gap:14 }}><div style={{ flex:1 }}><div style={{ color:C.muted, fontSize:'0.78rem', marginBottom:4 }}>{l}</div><div style={{ fontSize:'1.6rem', fontWeight:800, color:col }}>{v}</div></div></Card>
        ))}
      </div>
      <div style={{ display:'flex', flexDirection:'column', gap:14 }}>
        {loading ? (
          <div style={{ textAlign: 'center', padding: 40, color: C.muted }}>{t("جاري التحميل...")}</div>
        ) : quizzes.length === 0 ? (
          <Card style={{ padding: 40, textAlign: 'center' }}>
            <PiNotePencilDuotone size={48} color={C.border} style={{ marginBottom: 16 }} />
            <h3 style={{ color: C.dark, marginBottom: 8 }}>{t("لا توجد اختبارات بعد")}</h3>
            <p style={{ color: C.muted, fontSize: '0.9rem', marginBottom: 24 }}>{t("ابدأ الان وولد اول اختبار لك بمساعدة الذكاء الاصطناعي")}</p>
            <Btn onClick={() => setPage('dash-generate')}>{t("توليد اول اختبار")}</Btn>
          </Card>
        ) : quizzes.map((test, i) => {
          const score = test.latest_attempt ? parseFloat(test.latest_attempt.score) : null;
          const date = new Date(test.created_at).toLocaleDateString('ar-YE', { day: 'numeric', month: 'long', year: 'numeric' });
          return (
            <Card key={i} style={{ padding:'18px 24px', display:'flex', alignItems:'center', gap:20 }}>
              <div style={{ width:46, height:46, borderRadius:12, background:C.blueLight, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue, flexShrink:0 }}><PiNotePencilDuotone size={22}/></div>
              <div style={{ flex:1 }}><div style={{ fontWeight:700, color:C.dark, marginBottom:4, fontSize:'0.95rem' }}>{test.subject}</div><div style={{ display:'flex', gap:16 }}><span style={{ color:C.muted, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}><PiCalendarDuotone size={14}/> {date}</span><span style={{ color:C.muted, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}><PiQuestionDuotone size={14}/> {test.num_questions}{t(" سؤال")}</span><span style={{ color:C.muted, fontSize:'0.78rem', display:'flex', alignItems:'center', gap:4 }}><PiTimerDuotone size={14}/> {test.time_limit} {t("دق")}</span></div></div>
              {score !== null ? (
                <Badge color={score >= 80 ? C.green : score >= 60 ? C.orange : C.red}>{Math.round(score)}%</Badge>
              ) : (
                <Badge color={C.muted}>{t("لم يكتمل")}</Badge>
              )}
              <div style={{ display:'flex', gap:8 }}>
                  <Btn variant="ghost" style={{ fontSize:'0.82rem', padding:'7px 14px' }} onClick={() => setPage(score !== null ? 'dash-result' : 'dash-quiz', { uuid: test.uuid, quiz: test, attempt: test.latest_attempt, score: score, elapsed: test.latest_attempt?.time_spent })}>{score !== null ? t("مراجعة ←") : t("بدء الاختبار")}</Btn>
                  <Btn variant="secondary" style={{ fontSize:'0.82rem', padding:'7px 14px', borderColor:C.blue, color:C.blue }} onClick={() => setPage('dash-generate', { retest: true, fileName: test.file_name || test.subject, subject: test.subject })}>{t("توليد جديد")}</Btn>
              </div>
            </Card>
          );
        })}
      </div>
    </DashboardLayout>
  );
}
