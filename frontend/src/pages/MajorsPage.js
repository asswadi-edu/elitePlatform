import React, { useState, useEffect, useContext } from "react";
import DashboardLayout from "../layouts/DashboardLayout";
import { C } from "../tokens";
import { Btn, Badge, Card, Pill, Skeleton, MajorCard, MajorDetailsModal } from "../components/Common";
import { FadeIn } from "../utils";
import { 
  PiDesktopDuotone, PiRobotDuotone, PiHeartbeatDuotone, 
  PiPillDuotone, PiChartBarDuotone, PiPaletteDuotone, 
  PiMagnifyingGlassDuotone, PiLightningDuotone, PiMonitorDuotone,
  PiFirstAidKitDuotone, PiAtomDuotone, PiFlaskDuotone, PiGavelDuotone,
  PiGlobeDuotone, PiLightbulbDuotone, PiStethoscopeDuotone, PiShapesDuotone,
  PiTargetDuotone
} from "react-icons/pi";
import { LanguageContext } from "../LanguageContext";
import { getApiUrl } from "../api";

const AVAILABLE_ICONS = {
  Monitor: <PiMonitorDuotone />,
  Medical: <PiFirstAidKitDuotone />,
  Business: <PiChartBarDuotone />,
  Creative: <PiPaletteDuotone />,
  Science: <PiAtomDuotone />,
  Lab: <PiFlaskDuotone />,
  Law: <PiGavelDuotone />,
  Global: <PiGlobeDuotone />,
  Idea: <PiLightbulbDuotone />,
  Health: <PiStethoscopeDuotone />,
  General: <PiShapesDuotone />,
  // Compatibility with old hardcoded ones if any
  Desktop: <PiDesktopDuotone />,
  Robot: <PiRobotDuotone />,
  Heartbeat: <PiHeartbeatDuotone />,
  Pill: <PiPillDuotone />,
};

export default function MajorsPage({ setPage, inDashboard = false, isUniversity, userName = "محمد العلي", onLogout }) {
  const { t } = useContext(LanguageContext);
  const [activeFilter, setActiveFilter] = useState("all");
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [majors, setMajors] = useState([]);
  const [fields, setFields] = useState([]);
  const [loading, setLoading] = useState(true);
  const [testResult, setTestResult] = useState(null);
  const [hasTakenTest, setHasTakenTest] = useState(false);

  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    setLoading(true);
    try {
      const token = localStorage.getItem("elite_token");
      const [fRes, mRes, tRes] = await Promise.all([
        fetch(`${apiUrl}/api/fields`),
        fetch(`${apiUrl}/api/majors`),
        fetch(`${apiUrl}/api/aptitude-test`, {
          headers: token ? { "Authorization": `Bearer ${token}` } : {}
        })
      ]);
      
      if (fRes.ok && mRes.ok) {
        const fData = await fRes.json();
        const mData = await mRes.json();
        setFields(fData);
        setMajors(mData);
      }
      
      if (tRes.ok) {
        const tData = await tRes.json();
        setHasTakenTest(tData.has_taken_test);
        if (tData.has_taken_test && tData.past_results?.length > 0) {
           // past_results are attempts which have the uuid
           setTestResult(tData.past_results[0]);
        }
      }
    } catch (err) {
      console.error("Failed to fetch majors", err);
    } finally {
      setLoading(false);
    }
  }

  const getMajorIcon = (m, isLarge = false) => {
    if (m.image_url) {
      return <img src={m.image_url} alt={m.name} style={{ width: isLarge ? 80 : 48, height: isLarge ? 80 : 48, objectFit: "contain" }} />;
    }
    const key = m.field?.icon_key || "General";
    return AVAILABLE_ICONS[key] || <PiShapesDuotone />;
  };

  const filteredMajors = activeFilter === "all" 
    ? majors 
    : majors.filter(m => m.field_id === parseInt(activeFilter));

  const content = (
    <>
      <div style={{ padding: inDashboard ? "0" : "60px 28px" }}>
        <div style={{ maxWidth: 1100, margin: "0 auto" }}>
          <FadeIn>
            <div style={{ textAlign: "center", marginBottom: 52 }}>
              <Pill>{t("التخصصات المتاحة")}</Pill>
              <h1 style={{ fontSize: "2rem", fontWeight: 900, color: C.dark, margin: "0 0 12px" }}>{t("اختر تخصصك المناسب")}</h1>
              <p style={{ color: C.muted, fontSize: "0.95rem", marginBottom:28 }}>{t("اكتشف التخصصات الأكاديمية ومجالاتها المهنية والمواد الدراسية.")}</p>
              
              {/* Interest Test CTA - Only show if test NOT taken */}
              {!hasTakenTest && (
                <Card style={{ maxWidth:700, margin:'0 auto 40px', padding:'20px 24px', background:C.goldBg, border:`1px solid ${C.gold}40`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:15, textAlign:'start' }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:C.gold, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}><PiLightningDuotone/></div>
                    <div>
                      <h3 style={{ fontSize:'1rem', fontWeight:800, color:C.dark, margin:0 }}>{t("هل أنت محتار في اختيار تخصصك؟")}</h3>
                      <p style={{ fontSize:'0.84rem', color:C.muted, marginTop:4 }}>{t("قم بإجراء اختبار تحديد الميول المهنية لنساعدك في اختيار المسار الأنسب لشخصيتك.")}</p>
                    </div>
                  </div>
                  <Btn onClick={() => setPage(inDashboard ? "dash-test-intro" : "test-intro")} style={{ background:C.gold, color:C.white, border:'none', padding:'10px 22px' }}>{t("ابدأ اختبار الميول الآن")}</Btn>
                </Card>
              )}

              {hasTakenTest && testResult && (
                <Card style={{ maxWidth:700, margin:'0 auto 40px', padding:'20px 24px', background:C.blueLight, border:`1px solid ${C.blueMid}`, display:'flex', alignItems:'center', justifyContent:'space-between', gap:20, flexWrap:'wrap' }}>
                  <div style={{ display:'flex', alignItems:'center', gap:15, textAlign:'start' }}>
                    <div style={{ width:48, height:48, borderRadius:12, background:C.blue, color:C.white, display:'flex', alignItems:'center', justifyContent:'center', fontSize:'1.5rem' }}><PiTargetDuotone/></div>
                    <div>
                      <h3 style={{ fontSize:'1rem', fontWeight:800, color:C.dark, margin:0 }}>{t("مجالك الأكاديمي الأنسب هو: ")} <span style={{ color:C.blue }}>{testResult.result?.best_field_name}</span></h3>
                      <p style={{ fontSize:'0.84rem', color:C.muted, marginTop:4 }}>{t("بناءً على نتائج اختبارك السابق، إليك التخصصات المقترحة لك في هذا المجال.")}</p>
                    </div>
                  </div>
                  <Btn onClick={() => setPage(inDashboard ? "dash-test-result" : "test-result", { uuid: testResult.uuid })} style={{ background:C.blue, color:C.white, border:'none', padding:'10px 22px' }}>{t("عرض كامل النتيجة")}</Btn>
                </Card>
              )}
            </div>
            
            {/* Filter Bar */}
            <div style={{ display: "flex", justifyContent: "center", flexWrap: "wrap", gap: 10, marginBottom: 36 }}>
              <div onClick={() => setActiveFilter("all")}
                style={{ 
                  padding: "8px 20px", borderRadius: 20, cursor: "pointer", transition: "all .2s", fontSize: "0.9rem", fontWeight: 700,
                  background: activeFilter === "all" ? C.blue : C.white,
                  color: activeFilter === "all" ? C.white : C.muted,
                  border: `1px solid ${activeFilter === "all" ? C.blue : C.border}`,
                  boxShadow: activeFilter === "all" ? "0 4px 12px rgba(59,91,219,0.2)" : "none"
                }}>{t("الكل")}</div>
              
              {fields.map(f => (
                <div key={f.id} onClick={() => setActiveFilter(f.id.toString())}
                  style={{ 
                    padding: "8px 20px", borderRadius: 20, cursor: "pointer", transition: "all .2s", fontSize: "0.9rem", fontWeight: 700,
                    background: activeFilter === f.id.toString() ? C.blue : C.white,
                    color: activeFilter === f.id.toString() ? C.white : C.muted,
                    border: `1px solid ${activeFilter === f.id.toString() ? C.blue : C.border}`,
                    boxShadow: activeFilter === f.id.toString() ? "0 4px 12px rgba(59,91,219,0.2)" : "none"
                  }}>
                  {f.name}
                </div>
              ))}
            </div>
          </FadeIn>

          <div className="majors-grid" style={{ 
            display: "grid", 
            gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
            gap: 24 
          }}>
            {loading ? (
              Array(6).fill(0).map((_, i) => <Skeleton key={i} height="320px" borderRadius="16px" />)
            ) : (
              filteredMajors.map((m, i) => (
                <FadeIn key={m.id} delay={i * 0.05}>
                  <MajorCard major={m} t={t} onClick={() => setSelectedMajor(m)} />
                </FadeIn>
              ))
            )}
          </div>
          {!loading && filteredMajors.length === 0 && (
            <div style={{ textAlign: "center", padding: "60px 20px", color: C.muted }}>
              <div style={{ fontSize: "3rem", marginBottom: 16 }}><PiMagnifyingGlassDuotone /></div>
              <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 8 }}>{t("لا توجد تخصصات")}</h3>
              <p>{t("لم نجد تخصصات مطابقة لهذا المجال حالياً.")}</p>
            </div>
          )}
        </div>
      </div>

      <MajorDetailsModal major={selectedMajor} t={t} onClose={() => setSelectedMajor(null)} />
    </>
  );

  if (inDashboard) {
    return (
      <DashboardLayout activeSub="majors" setPage={setPage} isUniversity={isUniversity} userName={userName} onLogout={onLogout}>
        {content}
      </DashboardLayout>
    );
  }

  return (
    <div style={{ background: C.bg, minHeight: "100vh", position: "relative" }}>
      {content}
    </div>
  );
}
