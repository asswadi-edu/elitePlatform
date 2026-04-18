import React, { useContext } from "react";
import { C } from "../../tokens";
import { Btn, Pill } from "../../components/Common";
import { PiBooksDuotone, PiCheckCircleDuotone } from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";
import { SettingsContext } from "../../SettingsContext";

export default function Hero({ setPage }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  return (
    <section style={{ background:C.white, padding:"64px 0 80px" }}>
      <div className="container" style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(280px, 1fr))", gap:56, alignItems:"center" }}>
        <div>
          <Pill>{t("مستقبلك يبدأ من هنا")}</Pill>
          <h1 style={{ fontSize:"clamp(2rem, 5vw, 3.1rem)", fontWeight:900, color:C.dark, lineHeight:1.22, margin:"0 0 20px" }}>
            {t("اختر تخصصك")}<br />{t("الجامعي ")}<span style={{ color:C.blue }}>{t("بثقة")}</span>
          </h1>
          <p style={{ color:C.body, fontSize:"1.02rem", lineHeight:1.85, marginBottom:38, maxWidth:440 }}>
            {settings.site_slogan || t("منصة النخبة تساعدك على اكتشاف تخصصك المناسب بناءً على ميولك وقدراتك، وترافقك للنجاح في دراستك الجامعية عبر أدوات ذكية وموارد تعليمية متميزة.")}
          </p>
          <div style={{ display:"flex", gap:14, marginBottom:40, flexWrap: "wrap" }}>
            <Btn onClick={() => setPage("test-intro")}>← {t("ابدأ اختبار الميول")}</Btn>
            <Btn variant="secondary" onClick={() => setPage("majors")}>{t("استكشف التخصصات")}</Btn>
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap: "wrap" }}>
            <div style={{ display:"flex" }}>
              {["#F97316","#3B5BDB","#8B5CF6","#10B981"].map((c,i) => (
                <div key={i} style={{ width:35, height:35, borderRadius:"50%", background:c, border:"2.5px solid #fff", marginLeft: i>0 ? -10 : 0, display:"flex", alignItems:"center", justifyContent:"center", color:"#fff", fontWeight:800, fontSize:"0.72rem" }}>
                  {["أ","م","س","ف"][i]}
                </div>
              ))}
            </div>
            <div>
              <span style={{ color:C.blue, fontWeight:800, fontSize:"0.9rem" }}>2k+ </span>
              <span style={{ color:C.muted, fontSize:"0.85rem" }}>{t("انضم لأكثر من 2000 طالب وطالبة")}</span>
            </div>
          </div>
        </div>
        <div style={{ position:"relative", width: "100%" }}>
          <div style={{ borderRadius:22, background:"linear-gradient(135deg,#E8F0FE,#F0F4FF)", padding:10, boxShadow:`0 24px 64px color-mix(in srgb, ${C.blue} 13%, transparent)` }}>
            <div style={{ borderRadius:14, height:310, background:"linear-gradient(135deg,#C5D3FF,#A5B8F5)", display:"flex", alignItems:"center", justifyContent:"center", position:"relative" }}>
              <div style={{ textAlign:"center" }}>
                <div style={{ fontSize:"4.5rem", marginBottom:10, color:C.blue, display:"flex", justifyContent:"center" }}><PiBooksDuotone/></div>
                <div style={{ color:"#5B7FDB", fontSize:"0.9rem", fontWeight:600 }}>{t("طلاب يدرسون معًا")}</div>
              </div>
              <div style={{ position:"absolute", bottom:20, left:"50%", transform:"translateX(-50%)", background:C.white, borderRadius:13, padding:"11px 20px", boxShadow:"0 8px 32px rgba(0,0,0,0.13)", display:"flex", alignItems:"center", gap:12, whiteSpace:"nowrap" }}>
                <div style={{ width:30, height:30, borderRadius:"50%", background:"#D1FAE5", color:C.green, fontSize:"1.2rem", display:"flex", alignItems:"center", justifyContent:"center" }}><PiCheckCircleDuotone/></div>
                <div>
                  <div style={{ fontWeight:700, fontSize:"0.82rem", color:C.dark }}>{t("تم تحديد التخصص")}</div>
                  <div style={{ fontSize:"0.72rem", color:C.muted }}>{t("علوم الحاسب — 98% توافق")}</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
