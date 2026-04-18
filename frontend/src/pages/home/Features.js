import React, { useContext } from "react";
import { C } from "../../tokens";
import { Card, SectionHead } from "../../components/Common";
import { FadeIn } from "../../utils";
import { PiCompassDuotone, PiRobotDuotone, PiUsersDuotone } from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";

export default function Features() {
  const { t } = useContext(LanguageContext);
  const items = [
    { icon:<PiCompassDuotone/>, bg:C.blueLight, color:C.blue, title:t("اكتشف تخصصك المناسب"), desc:t("اختبار ميول علمي يساعدك في اختيار المجال الدراسي الأنسب لشخصيتك وقدراتك.") },
    { icon:<PiRobotDuotone/>, bg:C.greenBg, color:C.green, title:t("اختبر نفسك في موادك"), desc:t("ارفع ملفات المادة وسيقوم الذكاء الاصطناعي بتوليد اختبارات تفاعلية لتعميق فهمك.") },
    { icon:<PiUsersDuotone/>, bg:C.orangeBg, color:C.orange, title:t("شارك المعرفة"), desc:t("مجتمع طلابي متكامل — ارفع ملخصاتك وشاركها مع زملائك، واستفد من مواردهم.") },
  ];
  return (
    <section style={{ background:C.bg, padding:"64px 0" }}>
      <div className="container">
        <FadeIn><SectionHead title={t("ماذا تقدم لك منصة النخبة؟")} sub={t("نقدم لك مجموعة متكاملة من الأدوات لمساعدتك في كل خطوة من رحلتك الأكاديمية")} /></FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:24 }}>
          {items.map((f,i) => (
            <FadeIn key={f.title} delay={i*0.13}>
              <Card style={{ textAlign:"center", padding:36, height: "100%" }}>
                <div style={{ width:58, height:58, borderRadius:15, background:f.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.7rem", margin:"0 auto 20px" }}>{f.icon}</div>
                <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:C.dark, margin:"0 0 12px" }}>{f.title}</h3>
                <p style={{ color:C.muted, fontSize:"0.88rem", lineHeight:1.85, margin:0 }}>{f.desc}</p>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
