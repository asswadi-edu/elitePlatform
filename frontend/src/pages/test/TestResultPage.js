import React, { useState, useContext, useEffect } from "react";
import { C } from "../../tokens";
import { MajorCard, MajorDetailsModal, Btn, Card, Badge, AVAILABLE_ICONS } from "../../components/Common";
import { FadeIn } from "../../utils";
import { 
  PiTargetDuotone, 
  PiTimerDuotone, 
  PiTrendUpDuotone,
  PiSparkleDuotone,
  PiArrowRightBold,
  PiCertificateDuotone
} from "react-icons/pi";

import { LanguageContext } from "../../LanguageContext";
import DashboardLayout from "../../layouts/DashboardLayout";
import { getApiUrl } from "../../api";

const normalizeStr = (s) => {
  if (!s) return "";
  return s.trim()
    .replace(/[أإآ]/g, "ا")
    .replace(/ة/g, "ه")
    .replace(/^ال/g, "")
    .replace(/\s+/g, "");
};

export default function TestResultPage({ setPage, elapsed = 0, uuid = null, requestAnswers = null, testId = null, inDashboard = false, isEmbedded = false, isUniversity, userName = "محمد العلي", onLogout }) {
  const { t, lang } = useContext(LanguageContext);
  const [selectedMajor, setSelectedMajor] = useState(null);
  const [result, setResult] = useState(null);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [allMajors, setAllMajors] = useState([]);
  const [canDelete, setCanDelete] = useState(true);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    fetch(`${getApiUrl()}/api/majors`)
      .then(r => r.json())
      .then(d => setAllMajors(d))
      .catch(e => console.error(e));
  }, []);

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (uuid) {
        fetchExistingResult();
    } else if (requestAnswers) {
        submitAndFetchPredict();
    } else {
        setLoading(false);
    }
  }, [uuid, requestAnswers]);

  const fetchExistingResult = async () => {
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/aptitude-test/results/${uuid}`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
        setCanDelete(data.can_delete_results);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const submitAndFetchPredict = async () => {
    try {
      const token = localStorage.getItem("elite_token");
      const payload = {
         ...requestAnswers,
         time_taken: elapsed,
         test_id: testId
      };
      
      const res = await fetch(`${getApiUrl()}/api/aptitude-test/predict`, {
        method: "POST",
        headers: { 
            "Authorization": `Bearer ${token}`,
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify(payload)
      });
      if (res.ok) {
        const data = await res.json();
        setResult(data.result);
      } else {
        const errorText = await res.text();
        console.error("Predict error", errorText);
        try {
           const errObj = JSON.parse(errorText);
           setErrorMsg(errObj.message || "فشل التحليل بسبب خطأ في الخادم.");
        } catch(e) {
           setErrorMsg("تعذر إكمال التحليل. قد يكون محرك الذكاء الاصطناعي غير متصل.");
        }
      }
    } catch (err) {
      console.error(err);
      setErrorMsg("انقطع الاتصال بالخادم الداخلي.");
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async () => {
    if (!window.confirm(t("هل أنت متأكد من حذف هذه النتيجة وإعادة إجراء الاختبار؟"))) return;
    setDeleting(true);
    try {
      const token = localStorage.getItem("elite_token");
      const res = await fetch(`${getApiUrl()}/api/aptitude-test/results/${uuid}`, {
        method: "DELETE",
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (res.ok) {
        // Refresh page or go back to intro
        if (inDashboard) setPage("dash-test-intro");
        else setPage("test-intro");
      } else {
        const data = await res.json();
        alert(data.message || t("فشل الحذف"));
      }
    } catch (err) {
      console.error(err);
    } finally {
      setDeleting(false);
    }
  };

  if (loading) {
     return (
       <div style={{ display: "flex", justifyContent: "center", alignItems: "center", minHeight: "80vh", direction: "rtl", background: inDashboard ? "transparent" : C.bg }}>
         <div style={{ textAlign: "center" }}>
           <div style={{ width: 40, height: 40, border: `3px solid ${C.blueLight}`, borderTopColor: C.blue, borderRadius: "50%", animation: "spin 1s linear infinite", margin: "0 auto 16px" }} />
           <p style={{ color: C.muted }}>جاري تحليل إجاباتك باستخدام الذكاء الاصطناعي...</p>
         </div>
       </div>
     );
  }

  // Map result data to UI structure
  const best = result ? {
    icon: result.best_field_icon ? (AVAILABLE_ICONS[result.best_field_icon] || <PiTargetDuotone/>) : <PiTargetDuotone/>,
    label: result.best_field_name,
    score: result.match_percentage,
    color: result.best_field_color || C.blue,
    desc: t("بناءً على ميولك، هذا هو المجال الأكثر توافقاً مع اهتماماتك الشخصية والمهنية."),
  } : null;

  const displayMajors = allMajors.filter(m => {
    if (!result) return false;
    // 1. Exact ID match (Best)
    if (result.best_field_id && String(m.field_id) === String(result.best_field_id)) return true;
    
    // 2. Normalized Name match
    const target = normalizeStr(result.best_field_name);
    const majorFieldName = normalizeStr(m.field?.name);
    if (target && majorFieldName && (target === majorFieldName || majorFieldName.includes(target) || target.includes(majorFieldName))) return true;

    return false;
  });

  if (displayMajors.length === 0 && result && allMajors.length > 0) {
    // 3. Last resort: Fuzzy match on any field content
    const target = normalizeStr(result.best_field_name);
    const filtered = allMajors.filter(m => {
       const fn = normalizeStr(m.field?.name);
       return fn.includes(target) || target.includes(fn);
    });
    if (filtered.length > 0) displayMajors.push(...filtered);
  }

  if (!best && !loading) {
    return (
      <div style={{ textAlign: 'center', padding: "80px 20px" }}>
         <div style={{ fontSize: "4rem", marginBottom: 16 }}>⚠️</div>
         <h2 style={{ fontSize: "1.5rem", color: C.dark, marginBottom: 12 }}>{errorMsg || t("لم يتم العثور على النتيجة")}</h2>
         <p style={{ color: C.muted, marginBottom: 24, maxWidth: "400px", margin: "0 auto 24px" }}>
           {errorMsg ? t("لم نتمكن من تحليل إجاباتك بسبب المشكلة التقنية الموضحة أعلاه. يرجى إبلاغ الإدارة أو إعادة النقر لتجربة الاختبار مرة أخرى لاحقاً.") : t("عذراً، لم نتمكن من معالجة نتيجتك. تأكد من أن جميع الإجابات تم إرسالها بشكل صحيح.")}
         </p>
         <Btn onClick={() => setPage(inDashboard ? "dash-test-intro" : "test-intro")}>{t("العودة للاختبار")}</Btn>
      </div>
    );
  }

  const fmt = (s) => `${Math.floor(s/60).toString().padStart(2,"0")}:${(s%60).toString().padStart(2,"0")}`;
  
  const content = (
    <div style={{ direction:"rtl", background: inDashboard ? "transparent" : C.bg, padding: inDashboard ? "0" : "40px 20px" }}>
      <div style={{ maxWidth: 840, margin: "0 auto" }}>
        
        {!isEmbedded && (
          <FadeIn>
            <div style={{ textAlign:"center", marginBottom:40 }}>
              <Badge color={C.blue} style={{ padding:'6px 16px', borderRadius:20, marginBottom:16 }}>
                <PiSparkleDuotone /> {t("تحليل الذكاء الاصطناعي مكتمل")}
              </Badge>
              <h1 style={{ fontSize:"2.2rem", fontWeight:900, color:C.dark, margin:"0 0 12px" }}>نتائج مقياس الميول المهنية</h1>
              <p style={{ color:C.muted, fontSize:"1rem", maxWidth:500, margin:'0 auto' }}>بناءً على تفضيلاتك ومهاراتك التي شاركتنا بها، قمنا بتحديد المسار الأكاديمي الأكثر توافقاً مع شغفك.</p>
            </div>
          </FadeIn>
        )}

        <FadeIn delay={0.1}>
          <div style={{ 
            background:`linear-gradient(135deg, ${best?.color || C.blue}, #1a2a6c)`, 
            borderRadius:28, 
            padding: isEmbedded ? "30px" : "50px 40px", 
            marginBottom:32, 
            color:C.white, 
            textAlign:"center", 
            position:"relative", 
            overflow:"hidden",
            boxShadow: `0 20px 50px color-mix(in srgb, ${best?.color || C.blue} 30%, transparent)`
          }}>
            {/* Background Decorations */}
            <div style={{ position:"absolute", top:-40, right:-40, width:200, height:200, borderRadius:"50%", background:"rgba(255,255,255,0.05)" }} />
            <div style={{ position:"absolute", bottom:-60, left:-60, width:150, height:150, borderRadius:"50%", background:"rgba(255,255,255,0.03)" }} />
            <div style={{ position:"absolute", top:'10%', left:'5%', fontSize:'5rem', color:'rgba(255,255,255,0.05)', transform:'rotate(-15deg)' }}><PiCertificateDuotone/></div>

            <div style={{ position:"relative", zIndex:1 }}>
              <div style={{ 
                width:100, height:100, borderRadius:24, 
                background:"rgba(255,255,255,0.15)", 
                backdropFilter:'blur(10px)',
                display:"flex", alignItems:"center", justifyContent:"center", 
                fontSize:"3.5rem", margin:"0 auto 24px",
                boxShadow:'0 10px 30px rgba(0,0,0,0.1)',
                border:'1px solid rgba(255,255,255,0.2)'
              }}>
                {best?.icon || <PiTargetDuotone/>}
              </div>
              
              <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:'rgba(255,255,255,0.1)', padding:'6px 14px', borderRadius:50, fontSize:'0.85rem', fontWeight:700, marginBottom:12 }}>
                <PiTrendUpDuotone /> {t("التوافق المهني")}
              </div>
              
              <h2 style={{ fontSize: isEmbedded ? "1.8rem" : "2.8rem", fontWeight: 900, margin: "0 0 12px", letterSpacing:'-0.5px' }}>{best?.label}</h2>
              <p style={{ opacity:.9, fontSize: isEmbedded ? "0.9rem" : "1.05rem", margin: "0 auto 30px", maxWidth: 550, lineHeight: 1.7 }}>{best?.desc}</p>
              
              <div style={{ display:"flex", gap:20, justifyContent:"center", flexWrap:"wrap", marginBottom:32 }}>
                <div style={{ textAlign:'start', background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"12px 24px", minWidth:160, border:'1px solid rgba(255,255,255,0.05)' }}>
                  <div style={{ opacity:.7, fontSize:"0.75rem", fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>{t("نسبة المطابقة")}</div>
                  <div style={{ fontSize:"1.8rem", fontWeight:900, display:'flex', alignItems:'baseline', gap:4 }}>{best.score}<span style={{ fontSize:'1rem', opacity:.7 }}>%</span></div>
                </div>
                {elapsed > 0 && (
                  <div style={{ textAlign:'start', background:"rgba(255,255,255,0.12)", borderRadius:20, padding:"12px 24px", minWidth:160, border:'1px solid rgba(255,255,255,0.05)' }}>
                    <div style={{ opacity:.7, fontSize:"0.75rem", fontWeight:700, marginBottom:4, textTransform:'uppercase' }}>{t("وقت الإنجاز")}</div>
                    <div style={{ fontWeight:900, fontSize:"1.6rem", fontFamily:"monospace", display:'flex', alignItems:'center', gap:8 }}>
                      <PiTimerDuotone size={20} style={{ opacity:.7 }} /> {fmt(elapsed)}
                    </div>
                  </div>
                )}
              </div>
              
              <div style={{ display:"flex", gap:14, justifyContent:"center" }}>
                {isEmbedded ? (
                  <Btn onClick={() => setPage(inDashboard ? "dash-test-result" : "test-result", { uuid })} 
                    style={{ background:C.white, color:best?.color || C.blue, padding:"12px 32px", fontSize:"0.95rem", borderRadius:14, display:'flex', alignItems:'center', gap:8 }}>
                    {t("استعرض التخصصات المقترحة")} <PiArrowRightBold style={{ transform: lang==='ar' ? 'scaleX(-1)' : 'none' }} />
                  </Btn>
                ) : (
                  <>
                     <Btn variant="outline" onClick={() => window.print()} style={{ borderRadius:14, padding:'12px 24px' }}>{t("تحميل التقرير")}</Btn>
                     {canDelete && (
                      <Btn 
                        variant="secondary" 
                        onClick={handleDelete} 
                        disabled={deleting}
                        style={{ background:"rgba(255,255,255,0.15)", color:C.white, border:"1px solid rgba(255,255,255,0.2)", borderRadius:14, padding:"12px 24px" }}
                      >
                        {deleting ? t("جاري المعالجة...") : t("إعادة التقييم")}
                      </Btn>
                    )}
                  </>
                )}
              </div>
            </div>
          </div>
        </FadeIn>

        {/* Suggestion List - Hidden in Embedded Mode per user request */}
        {!isEmbedded && (
          <FadeIn delay={0.2}>
            <div style={{ marginBottom: 40 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-end', marginBottom:24 }}>
                <div>
                   <h3 style={{ fontWeight: 900, color: C.dark, fontSize: "1.4rem", margin:0 }}>{t("خارطة تخصصاتك المستقبلية")}</h3>
                   <p style={{ color:C.muted, fontSize:'0.9rem', marginTop:4 }}>إليك تخصصات منتقاة بعناية تتناسب مع طبيعة مجالك الأنسب</p>
                </div>
              </div>

              <div className="majors-grid" style={{ 
                display: "grid", 
                gridTemplateColumns: "repeat(auto-fill, minmax(280px, 1fr))", 
                gap: 24 
              }}>
                {displayMajors.map((m, i) => (
                  <FadeIn key={m.id || i} delay={i * 0.05}>
                    <MajorCard major={m} t={t} onClick={() => setSelectedMajor(m)} />
                  </FadeIn>
                ))}
              </div>
            </div>
          </FadeIn>
        )}
        
        {!isEmbedded && (
          <FadeIn delay={0.3}>
            <Card style={{ textAlign:'center', padding:'32px', border:'none', background:`linear-gradient(135deg, ${C.blue}08, transparent)`, borderRadius:24 }}>
               <h4 style={{ fontWeight:800, color:C.dark, marginBottom:12 }}>{t("هل تريد استكشاف المزيد؟")}</h4>
               <p style={{ color:C.muted, fontSize:'0.9rem', marginBottom:20 }}>يمكنك تصفح دليل التخصصات الكامل للتعرف على كافة الخيارات المتاحة في الجامعات.</p>
               <Btn onClick={() => setPage(inDashboard ? "dash-majors" : "majors")} style={{ padding:'12px 30px' }}>{t("دليل التخصصات الكامل")}</Btn>
            </Card>
          </FadeIn>
        )}

        <MajorDetailsModal major={selectedMajor} t={t} onClose={() => setSelectedMajor(null)} />
      </div>
    </div>
  );

  if (isEmbedded) {
    return content;
  }

  if (inDashboard) {
    return (
      <DashboardLayout activeSub="dashboard" setPage={setPage} isUniversity={isUniversity} userName={userName} onLogout={onLogout}>
        {content}
      </DashboardLayout>
    );
  }

  return content;
}
