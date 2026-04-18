import React, { useContext } from "react";
import { C } from "../tokens";
import { Card, SectionHead, Pill } from "../components/Common";
import { LanguageContext } from "../LanguageContext";
import { PiTargetDuotone, PiHandshakeDuotone, PiRocketLaunchDuotone } from "react-icons/pi";

export default function AboutPage({ setPage }) {
  const { t } = useContext(LanguageContext);
  return (
    <div style={{ background:C.white }}>
      <div style={{ background:`linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, padding:"clamp(60px, 10vw, 80px) 20px", textAlign:"center" }}>
        <div className="container">
          <h1 style={{ fontSize:"clamp(1.8rem, 6vw, 2.5rem)", fontWeight:900, color:C.white, margin:"0 0 16px" }}>{t("عن منصة النخبة")}</h1>
          <p style={{ color:"rgba(255,255,255,0.8)", fontSize:"1.02rem", maxWidth:560, margin:"0 auto" }}>{t("منصة تعليمية عربية متكاملة تُعيد تعريف التجربة الأكاديمية بأدوات الذكاء الاصطناعي")}</p>
        </div>
      </div>
      <div className="container" style={{ padding:"72px 20px" }}>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:48, alignItems:"center", marginBottom:72 }}>
          <div>
            <Pill>{t("رسالتنا")}</Pill>
            <h2 style={{ fontSize:"1.8rem", fontWeight:800, color:C.dark, margin:"0 0 16px" }}>{t("نساعد كل طالب يجد طريقه")}</h2>
            <p style={{ color:C.body, lineHeight:1.9, fontSize:"0.95rem" }}>{t("تأسست منصة النخبة بهدف واحد واضح: مساعدة الطلاب العرب في اتخاذ قرار التخصص الجامعي بثقة ووعي، ثم دعمهم طوال مسيرتهم الأكاديمية بأحدث أدوات الذكاء الاصطناعي.")}</p>
          </div>
          <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(180px, 1fr))", gap:16 }}>
            {[["2000+",t("طالب مسجل")],["50+",t("جامعة مدعومة")],["10000+",t("مورد دراسي")],["95%",t("رضا المستخدمين")]].map(([v,l]) => (
              <Card key={l} style={{ textAlign:"center", padding:22 }}>
                <div style={{ fontSize:"1.6rem", fontWeight:800, color:C.blue, marginBottom:4 }}>{v}</div>
                <div style={{ color:C.muted, fontSize:"0.8rem" }}>{l}</div>
              </Card>
            ))}
          </div>
        </div>
        <SectionHead title={t("قيمنا الأساسية")} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:22 }}>
          {[[<PiTargetDuotone/>,t("الدقة والموثوقية"),t("نعتمد على أسس علمية وبيانات موثوقة في كل توصية نقدمها.")],
            [<PiHandshakeDuotone/>,t("المجتمع والتشارك"),t("نؤمن أن التعلم التشاركي يصنع فرقًا حقيقيًا في مسيرة الطالب.")],
            [<PiRocketLaunchDuotone/>,t("الابتكار المستمر"),t("نطوّر أدواتنا باستمرار لمواكبة أحدث تقنيات الذكاء الاصطناعي.")]
          ].map(([ic,title,desc], i) => (
            <Card key={title} style={{ textAlign:"center", padding:30 }}>
              <div style={{ fontSize:"2.2rem", marginBottom:14, color: i===0?C.blue:i===1?C.green:C.orange, display:"flex", justifyContent:"center" }}>{ic}</div>
              <h3 style={{ fontWeight:700, color:C.dark, margin:"0 0 10px" }}>{title}</h3>
              <p style={{ color:C.muted, fontSize:"0.85rem", lineHeight:1.8, margin:0 }}>{desc}</p>
            </Card>
          ))}
        </div>
      </div>
    </div>
  );
}
