import React, { useContext } from "react";
import { C } from "../../tokens";
import { Btn, Card, SectionHead } from "../../components/Common";
import { FadeIn } from "../../utils";
import { PiBackpackDuotone, PiBankDuotone, PiStarDuotone } from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";

export default function RolesSection({ setPage, loggedIn = false }) {
  const { t } = useContext(LanguageContext);
  const roles = [
    { icon:<PiBackpackDuotone/>, color:C.blue, bg:C.blueLight, title:t("طالب ما قبل الجامعة"), desc:t("اكتشف تخصصك المثالي عبر اختبار الاهتمامات الذكي واطلع على التخصصات المناسبة لك."), cta:t("ابدأ اختبار الميول"), page:"test-intro" },
    { icon:<PiBankDuotone/>, color:C.green, bg:C.greenBg, title:t("طالب جامعي"), desc:t("حسّن مستواك الأكاديمي عبر اختبارات AI وموارد دراسية تشاركية مع زملائك."), cta:t("دخول لوحة التحكم"), page:"dashboard" },
    { icon:<PiStarDuotone/>, color:C.gold, bg:C.goldBg, title:t("مساهم VIP"), desc:t("انشر ملخصاتك ومواردك مباشرةً وابنِ سمعتك الأكاديمية في مجتمع النخبة."), cta:t("انضم الآن"), page:"register" },
  ];
  return (
    <section style={{ background:C.bg, padding:"64px 0" }}>
      <div className="container">
        <FadeIn><SectionHead title={t("المنصة تخدم الجميع")} sub={t("سواء كنت تختار تخصصك أو تحسّن مستواك — النخبة معك في كل خطوة")} /></FadeIn>
        <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fit, minmax(300px, 1fr))", gap:24 }}>
          {roles.map((r,i) => (
            <FadeIn key={r.title} delay={i*0.13}>
              <Card style={{ padding:32, height: "100%" }}>
                <div style={{ width:54, height:54, borderRadius:14, background:r.bg, display:"flex", alignItems:"center", justifyContent:"center", fontSize:"1.6rem", marginBottom:18 }}>{r.icon}</div>
                <h3 style={{ fontSize:"1rem", fontWeight:700, color:C.dark, margin:"0 0 10px" }}>{r.title}</h3>
                <p style={{ color:C.muted, fontSize:"0.86rem", lineHeight:1.85, marginBottom:22 }}>{r.desc}</p>
                <Btn variant="ghost" style={{ color:r.color, background:r.bg, fontSize:"0.85rem", padding:"8px 18px" }}
                  onClick={() => {
                    if (r.page === "dashboard" && !loggedIn) { setPage("login"); return; }
                    setPage(r.page);
                  }}>{r.cta} ←</Btn>
              </Card>
            </FadeIn>
          ))}
        </div>
      </div>
    </section>
  );
}
