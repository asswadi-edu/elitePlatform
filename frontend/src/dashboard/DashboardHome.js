import React, { useContext, useState, useEffect } from "react";
import { C } from "../tokens";
import { Btn, Badge, Card, Skeleton } from "../components/Common";
import DashboardLayout from "../layouts/DashboardLayout";
import { RankCard } from "./ranking";
import { LanguageContext } from "../LanguageContext";
import { UserContext } from "../UserContext";
import { getApiUrl } from "../api";
import UserAvatar from "../components/UserAvatar";
import {
  PiNotePencilDuotone, PiChartLineUpDuotone, PiFilePdfDuotone,
  PiStarDuotone, PiHandWavingDuotone, PiRobotDuotone, PiBookOpenDuotone,
  PiBellDuotone, PiGraduationCapDuotone, PiLightningDuotone,
  PiCalendarDuotone, PiThumbsUpDuotone, PiDownloadSimpleDuotone,
  PiTrophyDuotone, PiShieldCheckDuotone, PiWarningDuotone, PiFolderDuotone
} from "react-icons/pi";

export default function DashboardHome({ setPage, isUniversity: propIsUni, onLogout }) {
  const { user, isUniversity: ctxUni, isSubscribed } = useContext(UserContext);
  const { t, lang } = useContext(LanguageContext);
  const isUniversity = propIsUni !== undefined ? propIsUni : ctxUni;
  const [dashData, setDashData] = useState(null);
  const [testInfo, setTestInfo] = useState(null);
  const [loading, setLoading] = useState(true);
  const userName = user?.profile?.first_name || t("المستخدم");

  useEffect(() => {
    const token = localStorage.getItem("elite_token");
    if (!token) { setLoading(false); return; }
    if (!isUniversity) {
      fetch(`${getApiUrl()}/api/aptitude-test`, { headers: { Authorization: `Bearer ${token}` } })
        .then(r => r.json()).then(d => setTestInfo(d)).catch(() => {});
    }
    fetch(`${getApiUrl()}/api/student-dashboard-stats`, { headers: { Authorization: `Bearer ${token}` } })
      .then(r => r.json()).then(d => { setDashData(d); setLoading(false); })
      .catch(() => setLoading(false));
  }, [isUniversity]);

  const st = dashData?.stats || {};
  const sub = dashData?.subscription || {};
  const uniInfo = dashData?.university_info || {};
  const recentAttempts = dashData?.recent_attempts || [];
  const mySubjects = dashData?.my_subjects || [];

  const getLvl = (l) => [t("الأول"),t("الثاني"),t("الثالث"),t("الرابع"),t("الخامس"),t("السادس"),t("السابع"),t("الثامن")][l-1] || t("—");

  if (!isUniversity) {
    return (
      <DashboardLayout activeSub="dashboard" setPage={setPage} user={user} onLogout={onLogout}>
        <div style={{ marginBottom:28, display:"flex", alignItems:"center", gap:15 }}>
          <UserAvatar user={user} size={60}/>
          <div>
            <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:C.dark, margin:0 }}>
              {t("مرحباً")} {userName} <PiHandWavingDuotone size={26} color={C.gold}/>
            </h1>
            <p style={{ color:C.muted, marginTop:4, fontSize:"0.95rem" }}>{t("اكتشف مسارك الأكاديمي")}</p>
          </div>
        </div>
        {testInfo?.has_taken_test && testInfo?.past_results?.[0] ? (
          <Card style={{ padding:28, marginBottom:20, background:`linear-gradient(135deg,${C.blue}12,${C.blue}04)`, border:`1px solid ${C.blue}30` }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ width:56, height:56, borderRadius:14, background:C.blue, color:C.white, display:"flex", alignItems:"center", justifyContent:"center" }}><PiLightningDuotone size={28}/></div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"1.2rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("مجالك المقترح:")} <span style={{ color:C.blue }}>{testInfo.past_results[0].result?.best_field_name}</span></h2>
                <p style={{ color:C.muted, fontSize:"0.9rem", margin:0 }}>{t("بناءً على اختبار الميول المهنية")}</p>
              </div>
              <Btn onClick={() => setPage("/dash-majors")}>{t("اكتشف التخصصات")}</Btn>
            </div>
          </Card>
        ) : (
          <Card style={{ padding:28, marginBottom:20, background:`linear-gradient(135deg,${C.gold}15,${C.gold}05)`, border:`1px solid ${C.gold}40` }}>
            <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
              <div style={{ width:56, height:56, borderRadius:14, background:C.gold, color:C.white, display:"flex", alignItems:"center", justifyContent:"center" }}><PiLightningDuotone size={28}/></div>
              <div style={{ flex:1 }}>
                <h2 style={{ fontSize:"1.2rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("هل أنت محتار في اختيار تخصصك؟")}</h2>
                <p style={{ color:C.muted, fontSize:"0.9rem", margin:0 }}>{t("أجرِ اختبار الميول المهنية لمعرفة المجال الأنسب لك")}</p>
              </div>
              <Btn onClick={() => setPage("/dash-test-intro")} style={{ background:C.gold, border:"none" }}>{t("إجراء الاختبار")}</Btn>
            </div>
          </Card>
        )}
        <Card style={{ padding:28 }}>
          <div style={{ display:"flex", alignItems:"center", gap:16, flexWrap:"wrap" }}>
            <div style={{ flex:1 }}>
              <h2 style={{ fontSize:"1.2rem", fontWeight:800, color:C.dark, margin:"0 0 10px", display:"flex", alignItems:"center", gap:8 }}><PiGraduationCapDuotone size={24} color={C.blue}/> {t("هل أنت طالب جامعي؟")}</h2>
              <p style={{ color:C.muted, fontSize:"0.9rem", margin:0, lineHeight:1.7 }}>{t("سجّل بياناتك الأكاديمية للوصول إلى مواد الجامعة والاختبارات الذكية والموارد الدراسية")}</p>
            </div>
            <Btn variant="secondary" onClick={() => setPage("/dash-settings")}>{t("تسجيل البيانات الجامعية")}</Btn>
          </div>
        </Card>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout activeSub="dashboard" setPage={setPage} user={user} onLogout={onLogout}>

      {/* Header */}
      <div style={{ marginBottom:24, display:"flex", justifyContent:"space-between", alignItems:"center", flexWrap:"wrap", gap:16 }}>
        <div style={{ display:"flex", alignItems:"center", gap:14 }}>
          <UserAvatar user={user} size={52}/>
          <div>
            <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, margin:0 }}>
              {t("مرحباً")} {userName} <PiHandWavingDuotone size={24} color={C.gold}/>
            </h1>
            <p style={{ color:C.muted, marginTop:4, fontSize:"0.88rem" }}>{t("إليك نظرة شاملة على تقدمك الأكاديمي")}</p>
          </div>
        </div>
        <div style={{ display:"flex", gap:10, flexWrap:"wrap" }}>
          {uniInfo.major && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:C.white, padding:"8px 16px", borderRadius:40, border:`1px solid ${C.border}` }}>
              <PiGraduationCapDuotone size={18} color={C.blue}/>
              <span style={{ fontSize:"0.82rem", fontWeight:700, color:C.dark }}>{uniInfo.major}</span>
            </div>
          )}
          {uniInfo.study_level && (
            <div style={{ display:"flex", alignItems:"center", gap:8, background:C.white, padding:"8px 16px", borderRadius:40, border:`1px solid ${C.border}` }}>
              <PiCalendarDuotone size={18} color={C.green}/>
              <span style={{ fontSize:"0.82rem", fontWeight:700, color:C.dark }}>{t("المستوى")} {getLvl(uniInfo.study_level)}</span>
            </div>
          )}
        </div>
      </div>

      {/* Subscription Banner */}
      {loading ? <Skeleton width="100%" height="80px" margin="0 0 20px" borderRadius="14px"/> : sub.is_active ? (
        <div style={{ marginBottom:20, padding:"16px 22px", borderRadius:14, background:`linear-gradient(135deg, ${sub.plan_color}18, ${sub.plan_color}08)`, border:`1.5px solid ${sub.plan_color}40`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <div style={{ width:42, height:42, borderRadius:11, background:sub.plan_color, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff" }}><PiShieldCheckDuotone size={22}/></div>
            <div>
              <div style={{ fontWeight:800, color:C.dark, fontSize:"0.95rem" }}>{sub.plan_name} <Badge color={sub.plan_color} style={{ marginInlineStart:6 }}>{t("نشط")}</Badge></div>
              <div style={{ fontSize:"0.78rem", color:C.muted, marginTop:2 }}>{t("ينتهي في")} {sub.ends_at} · {t("باقي")} {sub.days_remaining} {t("يوم")}</div>
            </div>
          </div>
          <div style={{ display:"flex", gap:16, alignItems:"center" }}>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", fontWeight:900, color:sub.plan_color }}>{sub.quizzes_left === null ? "∞" : sub.quizzes_left}</div>
              <div style={{ fontSize:"0.7rem", color:C.muted, fontWeight:600 }}>{t("اختبار متبقٍ")}</div>
            </div>
            <div style={{ width:1, height:36, background:C.border }}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", fontWeight:900, color:C.blue }}>{sub.max_ai_tests === 0 ? "∞" : sub.max_ai_tests}</div>
              <div style={{ fontSize:"0.7rem", color:C.muted, fontWeight:600 }}>{t("الحد الأقصى/شهر")}</div>
            </div>
            <div style={{ width:1, height:36, background:C.border }}/>
            <div style={{ textAlign:"center" }}>
              <div style={{ fontSize:"1.5rem", fontWeight:900, color:C.muted }}>{sub.used_this_month}</div>
              <div style={{ fontSize:"0.7rem", color:C.muted, fontWeight:600 }}>{t("مستخدم هذا الشهر")}</div>
            </div>
          </div>
        </div>
      ) : (
        <div style={{ marginBottom:20, padding:"16px 22px", borderRadius:14, background:C.goldBg, border:`1.5px solid ${C.gold}50`, display:"flex", alignItems:"center", justifyContent:"space-between", flexWrap:"wrap", gap:12 }}>
          <div style={{ display:"flex", alignItems:"center", gap:12 }}>
            <PiWarningDuotone size={24} color={C.gold}/>
            <span style={{ fontWeight:700, color:C.dark, fontSize:"0.9rem" }}>{t("لا يوجد اشتراك نشط — بعض الميزات محدودة")}</span>
          </div>
          <Btn onClick={() => setPage("/dash-activate")} style={{ background:C.gold, border:"none", color:"#fff", padding:"8px 20px" }}>{t("تفعيل الاشتراك")}</Btn>
        </div>
      )}

      {/* Stats Grid */}
      {loading ? (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 }}>
          {[1,2,3,4,5,6].map(i => <Skeleton key={i} width="100%" height="90px" borderRadius="14px"/>)}
        </div>
      ) : (
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(160px,1fr))", gap:14, marginBottom:20 }}>
          {[
            { label:t("اختبارات منجزة"), val:st.quizzes_count??0, icon:<PiNotePencilDuotone size={20}/>, color:C.blue, bg:C.blueLight },
            { label:t("متوسط النتائج"), val: st.avg_score ? `${st.avg_score}%` : "—", icon:<PiChartLineUpDuotone size={20}/>, color:C.green, bg:C.greenBg },
            { label:t("أفضل نتيجة"), val: st.best_score ? `${st.best_score}%` : "—", icon:<PiTrophyDuotone size={20}/>, color:C.gold, bg:C.goldBg },
            { label:t("ملخصاتي"), val:st.resources_count??0, icon:<PiFilePdfDuotone size={20}/>, color:C.orange, bg:C.orangeBg },
            { label:t("إجمالي التحميلات"), val:st.total_downloads??0, icon:<PiDownloadSimpleDuotone size={20}/>, color:"#7C3AED", bg:"#EDE9FE" },
            { label:t("النقاط"), val:st.points??0, icon:<PiStarDuotone size={20}/>, color:C.gold, bg:C.goldBg },
          ].map(s => (
            <Card key={s.label} style={{ padding:"18px 20px", boxShadow:"0 4px 12px rgba(0,0,0,0.04)" }} hover>
              <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
                <div>
                  <div style={{ color:C.muted, fontSize:"0.75rem", marginBottom:6, fontWeight:600 }}>{s.label}</div>
                  <div style={{ fontSize:"1.8rem", fontWeight:900, color:C.dark }}>{s.val}</div>
                </div>
                <div style={{ width:40, height:40, borderRadius:11, background:s.bg, display:"flex", alignItems:"center", justifyContent:"center", color:s.color }}>{s.icon}</div>
              </div>
            </Card>
          ))}
        </div>
      )}

      <div style={{ marginBottom:20 }}><RankCard likes={st.total_likes??0}/></div>

      <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit,minmax(280px,1fr))", gap:20, marginBottom:20 }}>

        {/* Current Subjects */}
        <Card style={{ padding:22 }}>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
            <h3 style={{ fontSize:"1rem", fontWeight:800, color:C.dark, margin:0, display:"flex", alignItems:"center", gap:8 }}><PiBookOpenDuotone color={C.blue}/> {t("مواد الترم الحالي")}</h3>
            <Btn variant="ghost" style={{ fontSize:"0.78rem", padding:"6px 14px", border:`1px solid ${C.border}` }} onClick={() => setPage("/dash-subjects-selection")}>{t("تعديل")}</Btn>
          </div>
          {loading ? [1,2,3].map(i => <Skeleton key={i} width="100%" height="52px" margin="0 0 10px" borderRadius="10px"/>) :
          mySubjects.length === 0 ? (
            <div style={{ textAlign:"center", padding:"30px 0", color:C.muted }}>
              <PiBookOpenDuotone size={36} style={{ marginBottom:8, opacity:0.4 }}/>
              <div style={{ fontSize:"0.85rem" }}>{t("لم تضف مواد بعد")}</div>
              <Btn style={{ marginTop:12, fontSize:"0.8rem" }} onClick={() => setPage("/dash-subjects-selection")}>{t("إضافة مواد")}</Btn>
            </div>
          ) : mySubjects.map(s => (
            <div key={s.id} onClick={() => setPage("/dash-subject-details", { subject: s })}
              style={{ display:"flex", alignItems:"center", gap:12, padding:"12px 14px", borderRadius:11, cursor:"pointer", marginBottom:8, border:`1px solid ${C.border}`, transition:"all .2s" }}
              onMouseEnter={e => { e.currentTarget.style.borderColor=C.blue; e.currentTarget.style.background=C.blueLight; }}
              onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}>
              <div style={{ width:34, height:34, borderRadius:9, background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue, flexShrink:0 }}><PiBookOpenDuotone size={17}/></div>
              <div style={{ flex:1 }}>
                <div style={{ fontSize:"0.88rem", fontWeight:700, color:C.dark }}>{s.name}</div>
                <div style={{ fontSize:"0.72rem", color:C.muted }}>{s.code}</div>
              </div>
              <span style={{ color:C.muted, fontSize:"0.85rem" }}>←</span>
            </div>
          ))}
        </Card>

        {/* Quick Actions */}
        <Card style={{ padding:22 }}>
          <h3 style={{ fontSize:"1rem", fontWeight:800, color:C.dark, margin:"0 0 18px", display:"flex", alignItems:"center", gap:8 }}><PiLightningDuotone color={C.blue}/> {t("إجراءات سريعة")}</h3>
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {[
              { icon:<PiRobotDuotone size={19}/>, label:t("توليد اختبار AI"), path:"/dash-generate", color:C.blue, disabled: sub.is_active===false && sub.quizzes_left===0 },
              { icon:<PiBookOpenDuotone size={19}/>, label:t("موادي الدراسية"), path:"/dash-subjects", color:C.green },
              { icon:<PiFolderDuotone size={19}/>, label:t("مواردي"), path:"/dash-resources", color:C.orange },
              { icon:<PiBellDuotone size={19}/>, label:t("الإشعارات"), path:"/dash-notifications", color:"#7C3AED", badge: dashData?.notifications_count > 0 ? dashData.notifications_count : null },
            ].map(item => (
              <div key={item.label} onClick={() => !item.disabled && setPage(item.path)}
                style={{ display:"flex", alignItems:"center", gap:12, padding:"13px 16px", borderRadius:11, border:`1px solid ${C.border}`, cursor: item.disabled ? "not-allowed" : "pointer", opacity: item.disabled ? 0.5 : 1, transition:"all .2s" }}
                onMouseEnter={e => { if(!item.disabled){ e.currentTarget.style.borderColor=item.color; e.currentTarget.style.background=item.color+"12"; } }}
                onMouseLeave={e => { e.currentTarget.style.borderColor=C.border; e.currentTarget.style.background="transparent"; }}>
                <span style={{ color:item.color, display:"flex" }}>{item.icon}</span>
                <span style={{ fontSize:"0.9rem", color:C.dark, fontWeight:700, flex:1 }}>{item.label}</span>
                {item.badge && <span style={{ background:C.red, color:"#fff", borderRadius:20, padding:"1px 8px", fontSize:"0.72rem", fontWeight:700 }}>{item.badge}</span>}
                <span style={{ color:C.muted }}>←</span>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Recent Quizzes */}
      <Card style={{ padding:22 }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:18 }}>
          <h3 style={{ fontSize:"1rem", fontWeight:800, color:C.dark, margin:0 }}>{t("آخر الاختبارات")}</h3>
          <Btn variant="ghost" style={{ fontSize:"0.78rem", padding:"6px 14px", border:`1px solid ${C.border}` }} onClick={() => setPage("/dash-quizzes")}>{t("عرض الكل")}</Btn>
        </div>
        {loading ? (
          <div style={{ display:"flex", gap:12 }}>{[1,2,3].map(i=><Skeleton key={i} width="200px" height="80px" borderRadius="11px"/>)}</div>
        ) : recentAttempts.length === 0 ? (
          <div style={{ textAlign:"center", padding:"30px 0", color:C.muted }}>
            <PiNotePencilDuotone size={36} style={{ marginBottom:8, opacity:0.4 }}/>
            <div style={{ fontSize:"0.85rem" }}>{t("لا توجد اختبارات بعد")}</div>
          </div>
        ) : (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill,minmax(200px,1fr))", gap:12 }}>
            {recentAttempts.map((att,i) => {
              const pct = att.percentage ?? 0;
              const col = pct>=80 ? C.green : pct>=60 ? C.orange : C.red;
              return (
                <div key={i} style={{ padding:"16px", borderRadius:11, background:C.bg, border:`1px solid ${C.border}` }}>
                  <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:10 }}>
                    <div style={{ width:32, height:32, borderRadius:8, background:C.white, display:"flex", alignItems:"center", justifyContent:"center", color:C.blue }}><PiNotePencilDuotone size={16}/></div>
                    <Badge color={col}>{pct}%</Badge>
                  </div>
                  <div style={{ fontWeight:700, fontSize:"0.88rem", color:C.dark, marginBottom:3 }}>{att.subject}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>{att.taken_at?.slice(0,10)}</div>
                  <div style={{ marginTop:10, height:5, borderRadius:10, background:C.border, overflow:"hidden" }}>
                    <div style={{ width:`${pct}%`, height:"100%", background:col, borderRadius:10, transition:"width .5s" }}/>
                  </div>
                </div>
              );
            })}
          </div>
        )}
        <div style={{ marginTop:18, textAlign:"center" }}>
          <Btn onClick={() => setPage("/dash-generate")} disabled={sub.is_active===false}>
            {t("← توليد اختبار جديد")}
            {sub.quizzes_left !== null && sub.quizzes_left !== undefined && (
              <span style={{ marginInlineStart:8, opacity:0.75, fontSize:"0.8rem" }}>({sub.quizzes_left} {t("متبقٍ")})</span>
            )}
          </Btn>
        </div>
      </Card>

    </DashboardLayout>
  );
}
