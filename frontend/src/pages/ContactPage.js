import React, { useContext } from "react";
import { C, inputStyle } from "../tokens";
import { Btn, Card, SectionHead, Field } from "../components/Common";
import { LanguageContext } from "../LanguageContext";
import { PiMapPinLineDuotone, PiEnvelopeDuotone, PiPhoneDuotone, PiClockDuotone } from "react-icons/pi";

export default function ContactPage() {
  const { t } = useContext(LanguageContext);
  return (
    <div style={{ background:C.bg, padding:"64px 0" }}>
      <div className="container">
        <SectionHead title={t("تواصل معنا")} sub={t("نحن هنا للمساعدة — تواصل معنا في أي وقت")} />
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:32 }}>
          <div style={{ display:"flex", flexDirection:"column", gap:18 }}>
            {[[<PiMapPinLineDuotone/>,t("الموقع"),t("صنعاء، اليمن")],
              [<PiEnvelopeDuotone/>,t("البريد الإلكتروني"),"support@nukhba.edu.sa"],
              [<PiPhoneDuotone/>,t("رقم الهاتف"),"966+ 50 000 0000"],
              [<PiClockDuotone/>,t("أوقات العمل"),t("الأحد – الخميس: 9 صباحًا – 5 مساءً")]
            ].map(([ic,label,val]) => (
              <Card key={label} style={{ padding:"20px 22px", display:"flex", gap:16, alignItems:"flex-start" }}>
                <div style={{ width:42, height:42, borderRadius:11, background:C.blueLight, color:C.blue, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.5rem", flexShrink:0 }}>{ic}</div>
                <div>
                  <div style={{ fontWeight:700, color:C.dark, marginBottom:4, fontSize:"0.88rem" }}>{label}</div>
                  <div style={{ color:C.muted, fontSize:"0.84rem" }}>{val}</div>
                </div>
              </Card>
            ))}
          </div>
          <Card style={{ padding:"clamp(24px, 5vw, 32px) clamp(20px, 5vw, 36px)" }}>
            <h3 style={{ fontWeight:700, color:C.dark, margin:"0 0 22px" }}>{t("أرسل لنا رسالة")}</h3>
            {[[t("الاسم الكامل"),t("أدخل اسمك")],[t("البريد الإلكتروني"),t("أدخل بريدك")],[t("الموضوع"),t("موضوع الرسالة")]].map(([label,placeholder]) => (
              <Field key={label} label={label}>
                <input placeholder={placeholder} style={inputStyle}
                  onFocus={e => e.target.style.borderColor = C.blue}
                  onBlur={e => e.target.style.borderColor = C.border} />
              </Field>
            ))}
            <Field label={t("الرسالة")}>
              <textarea placeholder={t("اكتب رسالتك هنا...")} rows={4} style={{ ...inputStyle, resize:"vertical" }} />
            </Field>
            <Btn style={{ width:"100%" }}>{t("← إرسال الرسالة")}</Btn>
          </Card>
        </div>
      </div>
    </div>
  );
}
