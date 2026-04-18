import React, { useContext } from "react";
import { C } from "../../tokens";
import { SectionHead } from "../../components/Common";
import { FadeIn } from "../../utils";
import { LanguageContext } from "../../LanguageContext";

export default function HowItWorks() {
  const { t } = useContext(LanguageContext);
  const steps = [
    { n:"1", title:t("أنشئ حسابك"), desc:t("سجل في منصة النخبة بخطوات بسيطة وحدد مرحلتك الدراسية الحالية.") },
    { n:"2", title:t("اكتشف تخصصك"), desc:t("قم بإجراء اختبار الميول الشامل للحصول على تحليل دقيق لشخصيتك وميولك.") },
    { n:"3", title:t("ابدأ رحلتك"), desc:t("استفد من الموارد التعليمية، الاختبارات الذكية، ومجتمع طلاب النخبة.") },
  ];
  return (
    <section style={{ background:C.white, padding:"64px 0" }}>
      <div className="container">
        <FadeIn><SectionHead title={t("كيف تعمل المنصة؟")} sub={t("ثلاث خطوات بسيطة تفصلك عن مستقبلك")} /></FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:40, position:"relative" }}>
          <div className="desktop-only" style={{ position:"absolute", top:36, right:"17%", left:"17%", height:1, background:`linear-gradient(90deg,transparent,color-mix(in srgb, ${C.blue} 19%, transparent),color-mix(in srgb, ${C.blue} 19%, transparent),transparent)` }} />
          {steps.map((s,i) => (
            <FadeIn key={s.n} delay={i*0.15}>
              <div style={{ textAlign:"center", padding:"0 10px" }}>
                <div style={{ width:72, height:72, borderRadius:"50%", border:`2px solid ${C.blue}`, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", background:C.white, fontSize:"1.4rem", fontWeight:800, color:C.blue, boxShadow:`0 0 0 10px color-mix(in srgb, ${C.blue} 5%, transparent)`, position: "relative", zIndex: 1 }}>{s.n}</div>
                <h3 style={{ fontSize:"1.05rem", fontWeight:700, color:C.dark, margin:"0 0 10px" }}>{s.title}</h3>
                <p style={{ color:C.muted, fontSize:"0.88rem", lineHeight:1.85 }}>{s.desc}</p>
              </div>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
