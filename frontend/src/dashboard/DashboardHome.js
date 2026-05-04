import React, { useContext } from "react";
import { C } from "../tokens";
import { Btn, Badge, Card } from "../components/Common";
import DashboardLayout from "../layouts/DashboardLayout";
import { RankCard } from "./ranking";
import { LanguageContext } from "../LanguageContext";
import { PiNotePencilDuotone, PiChartLineUpDuotone, PiFolderDuotone, PiStarDuotone, PiHandWavingDuotone, PiRobotDuotone, PiBookOpenDuotone, PiBellDuotone, PiUserCircleDuotone, PiGraduationCapDuotone, PiLinkDuotone, PiFilePdfDuotone, PiLightningDuotone } from 'react-icons/pi';
import { UserContext } from "../UserContext";
import TestResultPage from "../pages/test/TestResultPage";
import { getApiUrl } from "../api";
import UserAvatar from "../components/UserAvatar";

export default function DashboardHome({ setPage, isUniversity: propIsUniversity, onLogout }) {
  const { user, isUniversity: contextIsUniversity, isSubscribed } = useContext(UserContext);
  const isUniversity = propIsUniversity !== undefined ? propIsUniversity : contextIsUniversity;
  const hasFullAccess = isUniversity || isSubscribed;
  const { t, lang } = useContext(LanguageContext);
  const userName = user?.profile?.first_name || t("المستخدم");
  const [testInfo, setTestInfo] = React.useState(null);
  const [dashData, setDashData] = React.useState(null);

  React.useEffect(() => {
    const token = localStorage.getItem("elite_token");
    if (!token) return;

    if (!isUniversity) {
      fetch(`${getApiUrl()}/api/aptitude-test`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => setTestInfo(d))
      .catch(e => console.error(e));
    }

    if (hasFullAccess) {
      fetch(`${getApiUrl()}/api/student-dashboard-stats`, {
        headers: { "Authorization": `Bearer ${token}` }
      })
      .then(r => r.json())
      .then(d => setDashData(d))
      .catch(e => console.error(e));
    }
  }, [isUniversity, hasFullAccess]);

  const stats = [
    { label:t("عدد الاختبارات"), val: dashData?.stats?.quizzes_count || "0", icon:<PiNotePencilDuotone size={20}/>, color:C.blue, bg:C.blueLight },
    { label:t("متوسط النتائج"), val: dashData?.stats?.avg_score ? `${dashData.stats.avg_score}%` : "—", icon:<PiChartLineUpDuotone size={20}/>, color:C.green, bg:C.greenBg },
    { label:t("ملخصاتي المرفوعة"), val: dashData?.stats?.resources_count || "0", icon:<PiFilePdfDuotone size={20}/>, color:C.orange, bg:C.orangeBg },
    { label:t("النقاط"), val: dashData?.stats?.points || "0", icon:<PiStarDuotone size={20}/>, color:C.gold, bg:C.gold + "15" },
  ];

  const recentTests = dashData?.recent_attempts?.map(att => ({
    subject: att.ai_quiz?.title || t("اختبار غير معروف"),
    score: att.score,
    date: new Date(att.created_at).toLocaleDateString(lang === 'ar' ? 'ar-EG' : 'en-US', { day: 'numeric', month: 'short' })
  })) || [];

  const mySubjects = dashData?.my_subjects?.map(s => ({
    title: s.name,
    code: s.code,
    id: s.id
  })) || [];

  const getLevelLabel = (level) => {
    const levels = {
        1: t("المستوى الأول"),
        2: t("المستوى الثاني"),
        3: t("المستوى الثالث"),
        4: t("المستوى الرابع"),
        5: t("المستوى الخامس"),
        6: t("المستوى السادس"),
        7: t("المستوى السابع"),
        8: t("المستوى الثامن"),
    };
    return levels[level] || t("غير محدد");
  };

  if (!isUniversity) {
    return (
      <DashboardLayout activeSub="dashboard" setPage={setPage} isUniversity={isUniversity} user={user} onLogout={onLogout}>
        <div style={{ marginBottom: 32, display: 'flex', alignItems: 'center', gap: 15 }}>
          <UserAvatar user={user} size={64} />
          <div>
            <h1 style={{ fontSize: "1.7rem", fontWeight: 800, color: C.dark, margin: 0, display: 'flex', alignItems: 'center', gap: 10 }}>
              {t("مرحباً بك")} {userName} {t("في منصة النخبة")} <PiHandWavingDuotone size={28} color={C.gold} />
            </h1>
            <p style={{ color: C.muted, marginTop: 6, fontSize: "1rem" }}>{t("اكتشف مسارك، وحدد مستقبلك الأكاديمي بنجاح.")}</p>
          </div>
        </div>

        {/* Aptitude Test Card */}
        {testInfo?.has_taken_test && testInfo?.past_results?.[0] ? (
          <Card style={{ padding: '32px', marginBottom: '24px', background: `linear-gradient(135deg, ${C.blue}10, ${C.blue}05)`, border: `1px solid ${C.blue}30` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: C.blue, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}><PiLightningDuotone /></div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, margin: '0 0 8px' }}>{t("المجال المقترح لك هو:")} <span style={{ color: C.blue }}>{testInfo.past_results[0].result?.best_field_name}</span></h2>
                <p style={{ color: C.muted, fontSize: '0.95rem', margin: 0 }}>{t("بناءً على نتائج اختبار الميول، هذا المجال يتوافق بشكل كبير مع قدراتك واهتماماتك.")}</p>
              </div>
              <Btn onClick={() => setPage("/dash-majors", { selectedField: testInfo.past_results[0].result?.best_field_id })} style={{ padding: '12px 24px' }}>
                {t("اكتشف التخصصات المرتبطة")}
              </Btn>
            </div>
          </Card>
        ) : (
          <Card style={{ padding: '32px', marginBottom: '24px', background: `linear-gradient(135deg, ${C.gold}15, ${C.gold}05)`, border: `1px solid ${C.gold}40` }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
              <div style={{ width: 64, height: 64, borderRadius: 16, background: C.gold, color: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '2rem' }}><PiLightningDuotone /></div>
              <div style={{ flex: 1 }}>
                <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, margin: '0 0 8px' }}>{t("هل أنت محتار في اختيار تخصصك الجامعي؟")}</h2>
                <p style={{ color: C.muted, fontSize: '0.95rem', margin: 0, lineHeight: 1.6 }}>{t("يقدم لك اختبار تحديد الميول المهنية الخاص بنا تحليلاً دقيقاً لمهاراتك وشخصيتك، ليقترح عليك أفضل المجالات الأكاديمية التي تتناسب معك وتضمن لك مستقبلاً مشرقاً.")}</p>
              </div>
              <Btn onClick={() => setPage("/dash-test-intro")} style={{ background: C.gold, color: C.white, border: 'none', padding: '12px 24px' }}>
                {t("إجراء الاختبار الآن")}
              </Btn>
            </div>
          </Card>
        )}

        {/* University Benefits Card */}
        <Card style={{ padding: '32px', background: C.white, border: `1px solid ${C.border}`, position: 'relative', overflow: 'hidden' }}>
          <div style={{ position: 'absolute', right: lang === 'ar' ? '-5%' : 'auto', left: lang !== 'ar' ? '-5%' : 'auto', top: '-20%', fontSize: '15rem', color: C.bg, zIndex: 0, transform: 'rotate(-15deg)' }}><PiGraduationCapDuotone /></div>
          <div style={{ position: 'relative', zIndex: 1, display: 'flex', alignItems: 'center', gap: 20, flexWrap: 'wrap' }}>
            <div style={{ flex: 1 }}>
              <h2 style={{ fontSize: '1.3rem', fontWeight: 800, color: C.dark, margin: '0 0 12px', display: 'flex', alignItems: 'center', gap: 10 }}>
                <PiGraduationCapDuotone size={28} color={C.blue} /> {t("هل أنت طالب جامعي بالفعل؟")}
              </h2>
              <p style={{ color: C.muted, fontSize: '0.95rem', margin: '0 0 16px', lineHeight: 1.6 }}>
                {t("منصة النخبة توفر لطلاب الجامعات أدوات متقدمة لتسهيل مسيرتهم الأكاديمية، تشمل:")}
              </p>
              <ul style={{ color: C.dark, fontSize: '0.9rem', paddingInlineStart: 20, marginBottom: 0, display: 'flex', flexDirection: 'column', gap: 8, fontWeight: 600 }}>
                <li>{t("توليد اختبارات ذكية (AI) لمراجعة المواد.")}</li>
                <li>{t("الوصول إلى ملخصات وموارد دراسية موثوقة.")}</li>
                <li>{t("المشاركة في التحديات الأكاديمية وجمع النقاط.")}</li>
                <li>{t("تتبع الأداء الدراسي ومعدل الإنجاز.")}</li>
              </ul>
            </div>
            <div style={{ textAlign: 'center' }}>
              <Btn variant="secondary" onClick={() => setPage("/dash-settings")} style={{ padding: '12px 24px', border: `2px solid ${C.blue}`, color: C.blue, background: C.white }}>
                {t("سجل بياناتك الأكاديمية")}
              </Btn>
              <div style={{ fontSize: '0.8rem', color: C.muted, marginTop: 8 }}>{t("للحصول على المزايا الجامعية")}</div>
            </div>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeSub="dashboard" setPage={setPage} isUniversity={isUniversity} user={user} onLogout={onLogout}>
      <div style={{ marginBottom:28, display:'flex', justifyContent:'space-between', alignItems:'center', flexWrap:'wrap', gap:20 }}>
        <div style={{ display:'flex', alignItems:'center', gap:15 }}>
            <UserAvatar user={user} size={54} />
            <div>
                <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:C.dark, margin:0, display:'flex', alignItems:'center', gap:10 }}>{t("مرحباً بك")} {userName} {t("في منصة النخبة")} <PiHandWavingDuotone size={28} color={C.gold}/></h1>
                <p style={{ color:C.muted, marginTop:6, fontSize:"0.95rem" }}>{t("إليك نظرة شاملة على تقدمك الدراسي اليوم")}</p>
            </div>
        </div>
        <div style={{ display:'flex', gap:12 }}>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:C.white, padding:'10px 18px', borderRadius:50, border:`1px solid ${C.border}`, boxShadow:'0 2px 5px rgba(0,0,0,0.02)' }}>
                <PiGraduationCapDuotone size={20} color={C.blue}/>
                <div style={{ display:'flex', flexDirection:'column' }}>
                    <span style={{ fontSize:'0.7rem', color:C.muted, fontWeight:600, textTransform:'uppercase' }}>{t("التخصص")}</span>
                    <span style={{ fontSize:'0.88rem', fontWeight:700, color:C.dark }}>{user?.university_info?.major?.name || t("غير محدد")}</span>
                </div>
            </div>
            <div style={{ display:'flex', alignItems:'center', gap:10, background:C.white, padding:'10px 18px', borderRadius:50, border:`1px solid ${C.border}`, boxShadow:'0 2px 5px rgba(0,0,0,0.02)' }}>
                <PiUserCircleDuotone size={20} color={C.green}/>
                <div style={{ display:'flex', flexDirection:'column' }}>
                    <span style={{ fontSize:'0.7rem', color:C.muted, fontWeight:600, textTransform:'uppercase' }}>{t("المستوى")}</span>
                    <span style={{ fontSize:'0.88rem', fontWeight:700, color:C.dark }}>{getLevelLabel(user?.university_info?.study_level)}</span>
                </div>
            </div>
        </div>
      </div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(200px, 1fr))", gap:18, marginBottom:22 }}>
        {stats.map(s => (
          <Card key={s.label} style={{ padding:"22px 24px", border:'none', boxShadow:'0 4px 15px rgba(0,0,0,0.04)' }} hover>
            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
              <div>
                <div style={{ color:C.muted, fontSize:"0.8rem", marginBottom:8, fontWeight:500 }}>{s.label}</div>
                <div style={{ fontSize:"2rem", fontWeight:900, color:C.dark }}>{s.val}</div>
              </div>
              <div style={{ width:44, height:44, borderRadius:12, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>{s.icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <div style={{ marginBottom:28 }}><RankCard likes={108} /></div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22, marginBottom:28 }}>
        <Card style={{ padding:'24px' }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
            <h3 style={{ fontSize:"1.05rem", fontWeight:800, color:C.dark, margin:0 }}>{t("مواد الترم الحالي")}</h3>
            <Btn variant="ghost" style={{ fontSize:"0.82rem", padding:"8px 16px", borderRadius:10, border:`1px solid ${C.border}` }} onClick={() => setPage("/dash-subjects-selection")}>{t("تعديل")}</Btn>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:16 }}>
            {mySubjects.map(s => (
              <div key={s.code} onClick={() => setPage('/dash-subject-details', { subject: s })} style={{ display:"flex", alignItems:"center", gap:14, padding:"18px 20px", borderRadius:16, border:`1.5px solid ${C.bg}`, cursor:"pointer", transition:"all .2s", background:C.white }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLight; e.currentTarget.style.transform='translateY(-2px)'; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.bg; e.currentTarget.style.background=C.white; e.currentTarget.style.transform='translateY(0)'; }}>
                <div style={{ width:40, height:40, borderRadius:10, background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}>
                    <PiBookOpenDuotone size={20}/>
                </div>
                <div style={{ flex:1 }}>
                  <div style={{ fontSize:"0.9rem", fontWeight:800, color:C.dark, marginBottom:2 }}>{s.title}</div>
                  <div style={{ fontSize:"0.76rem", color:C.muted, fontWeight:600 }}>{s.code}</div>
                </div>
                <div style={{ color:C.muted, fontSize:'1rem' }}>→</div>
              </div>
            ))}
          </div>
        </Card>

        <Card style={{ padding:'24px' }}>
          <h3 style={{ fontSize:"1.05rem", fontWeight:800, color:C.dark, margin:"0 0 20px" }}>{t("إجراءات سريعة")}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
            {[
              [<PiRobotDuotone size={20}/>,t("توليد اختبار AI"),"/dash-generate"],
              [<PiBookOpenDuotone size={20}/>,t("جميع موادي"),"/dash-subjects"],
              [<PiFolderDuotone size={20}/>,t("رفع مورد جديد"),"/dash-resources"],
              [<PiBellDuotone size={20}/>,t("الإشعارات"),"/dash-notifications"]
            ].map(([ic,txt,p]) => (
              <div key={txt} onClick={() => setPage(p)} style={{ display:"flex", alignItems:"center", gap:14, padding:"14px 16px", borderRadius:12, border:`1px solid ${C.border}`, cursor:"pointer", transition:"all .2s" }}
                onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLight; }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}>
                <span style={{ color:C.blue, display:'flex' }}>{ic}</span>
                <span style={{ fontSize:"0.9rem", color:C.dark, fontWeight:700 }}>{txt}</span>
                <span style={{ marginRight:"auto", color:C.muted, transform:lang==='ar'?'scaleX(-1)':'none' }}>→</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      <Card style={{ padding:'24px' }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:24, flexWrap:"wrap", gap:10 }}>
          <h3 style={{ fontSize:"1.05rem", fontWeight:800, color:C.dark, margin:0 }}>{t("آخر الاختبارات")}</h3>
          <Btn variant="ghost" style={{ fontSize:"0.82rem", padding:"8px 16px", border:`1px solid ${C.border}` }} onClick={() => setPage("/dash-quizzes")}>{t("عرض الكل")}</Btn>
        </div>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(240px, 1fr))", gap:20 }}>
          {recentTests.map(t => (
            <div key={t.subject} style={{ padding:'18px', borderRadius:16, background:C.bg, border:`1px solid ${C.border}`, display:'flex', flexDirection:'column', gap:12 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                <div style={{ width:36, height:36, borderRadius:9, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', color:C.blue }}><PiNotePencilDuotone size={18}/></div>
                <Badge color={t.score>=80 ? C.green : t.score>=60 ? C.orange : C.red}>{t.score}%</Badge>
              </div>
              <div>
                <div style={{ fontWeight:800, fontSize:"0.95rem", color:C.dark, marginBottom:4 }}>{t.subject}</div>
                <div style={{ fontSize:"0.78rem", color:C.muted }}>{t.date}</div>
              </div>
            </div>
          ))}
        </div>
        <div style={{ marginTop:24, textAlign:'center' }}><Btn onClick={() => setPage("/dash-generate")} style={{ padding:'12px 40px' }}>{t("← إجراء اختبار جديد")}</Btn></div>
      </Card>
    </DashboardLayout>
  );
}
