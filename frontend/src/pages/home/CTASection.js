import React, { useContext } from "react";
import { C } from "../../tokens";
import { Btn } from "../../components/Common";
import { FadeIn } from "../../utils";
import { PiStarDuotone } from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";

export default function CTASection({ setPage }) {
  const { t } = useContext(LanguageContext);
  return (
    <section style={{ padding:"0 0 64px" }}>
      <div className="container">
        <FadeIn>
          <div style={{ background:`linear-gradient(135deg, ${C.blue} 0%, ${C.blueDark} 100%)`, borderRadius:24, padding:"clamp(32px, 8vw, 68px) clamp(20px, 5vw, 48px)", textAlign:"center", position:"relative", overflow:"hidden" }}>
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.06)" }} />
            <div style={{ position:"absolute", bottom:-60, left:-30, width:250, height:250, borderRadius:"50%", background:"rgba(255,255,255,0.04)" }} />
            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ display:"inline-flex", alignItems:"center", gap:8, background:"rgba(255,255,255,0.14)", borderRadius:20, padding:"5px 16px", marginBottom:24 }}>
                <span style={{color:C.gold, display:"flex"}}><PiStarDuotone/></span><span style={{ color:C.white, fontSize:"0.82rem" }}>{t("منصة النخبة الأكاديمية")}</span>
              </div>
              <h2 style={{ fontSize:"clamp(1.5rem, 6vw, 2.3rem)", fontWeight:900, color:C.white, margin:"0 0 16px", lineHeight:1.3 }}>{t("ابدأ رحلتك الأكاديمية اليوم")}</h2>
              <p style={{ color:"rgba(255,255,255,0.8)", fontSize:"1rem", lineHeight:1.85, maxWidth:560, margin:"0 auto 36px" }}>{t("لا تضيع المزيد من الوقت في الحيرة. انضم إلى منصة النخبة الآن واكتشف المسار الذي سيقودك إلى النجاح والتميز.")}</p>
              <div style={{ display:"flex", gap:16, justifyContent:"center", flexWrap: "wrap" }}>
                <Btn style={{ background:C.white, color:C.blue, boxShadow:"0 4px 20px rgba(0,0,0,0.14)" }} onClick={() => setPage("register")}>{t("إنشاء حساب مجاني")}</Btn>
                <Btn variant="outline" onClick={() => setPage("contact")}>{t("تواصل معنا")}</Btn>
              </div>
            </div>
          </div>
        </FadeIn>
      </div>
    </section>
  );
}
