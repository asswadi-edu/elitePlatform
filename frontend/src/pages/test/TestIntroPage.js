import React, { useState, useEffect, useContext } from "react";
import { C } from "../../tokens";
import { Btn, Card, Pill, Skeleton } from "../../components/Common";
import { FadeIn } from "../../utils";
import { PiCompassDuotone, PiNotePencilDuotone, PiTimerDuotone, PiTargetDuotone } from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getApiUrl } from "../../api";

export default function TestIntroPage({ setPage, inDashboard = false, isUniversity, userName = "محمد العلي", onLogout }) {
  const { t } = useContext(LanguageContext);
  const [test, setTest] = useState(null);
  const [questionsCount, setQuestionsCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchTestInfo();
  }, []);

  const fetchTestInfo = async () => {
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/aptitude-test`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setTest(data.test);
        setQuestionsCount(data.questions?.length || 0);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const timeDisplay = test?.time_limit ? `${test.time_limit} ${t("دقيقة")}` : t("غير محدود");
  const timeSub = test?.time_limit ? t("لإكمال الاختبار") : t("على راحتك");
  const content = (
    <div style={{ direction:"rtl", minHeight: inDashboard ? "auto" : "80vh", display:"flex", alignItems:"center", background: inDashboard ? "transparent" : C.bg, padding: inDashboard ? "0" : "60px 28px" }}>
      <div style={{ maxWidth:780, margin:"0 auto", textAlign:"center" }}>
        <FadeIn>
          <div style={{ width:90, height:90, borderRadius:"50%", background:C.blueLight, color:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"3.5rem", margin:"0 auto 28px" }}><PiCompassDuotone/></div>
          <Pill>{t("اختبار الاهتمامات الأكاديمية")}</Pill>
          <h1 style={{ fontSize: inDashboard ? "2rem" : "2.4rem", fontWeight:900, color:C.dark, margin:"0 0 20px", lineHeight:1.3 }}>{t("اكتشف مجالك الأكاديمي المثالي")}</h1>
          <p style={{ color:C.body, fontSize:"1.02rem", lineHeight:1.9, maxWidth:600, margin:"0 auto 40px" }}>
            {t("يعتمد اختبار الاهتمامات على أسس علمية ومدعوم بالذكاء الاصطناعي. ستجيب على مجموعة من الأسئلة حول اهتماماتك وميولك، وستحصل على تحليل دقيق للمجال الأكاديمي الذي يناسبك.")}
          </p>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:20, marginBottom:44 }}>
            {[
              { icon: <PiNotePencilDuotone/>, title: loading ? <Skeleton width="50%" /> : `${questionsCount} ${t("سؤال")}`, sub: t("تغطي مختلف المجالات"), color: C.blue },
              { icon: <PiTimerDuotone/>, title: loading ? <Skeleton width="50%" /> : timeDisplay, sub: timeSub, color: C.orange },
              { icon: <PiTargetDuotone/>, title: t("تحليل دقيق"), sub: t("مدعوم بالذكاء الاصطناعي"), color: C.green }
            ].map((item, i) => (
              <Card key={i} style={{ padding:22, textAlign:"center" }}>
                <div style={{ fontSize:"2rem", marginBottom:8, color: item.color, display:"flex", justifyContent:"center" }}>{item.icon}</div>
                <div style={{ fontWeight:700, color:C.dark, marginBottom:4, fontSize:"0.95rem" }}>{item.title}</div>
                <div style={{ color:C.muted, fontSize:"0.8rem" }}>{item.sub}</div>
              </Card>
            ))}
          </div>
          <Btn onClick={() => setPage(inDashboard ? "dash-test" : "test")}>← {t("ابدأ الاختبار الآن")}</Btn>
        </FadeIn>
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
