import React, { useState, useRef, useContext, useEffect } from 'react';
import { C } from '../tokens';
import { Btn, Card } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { PiTicketDuotone, PiConfettiDuotone, PiXCircleDuotone, PiSpinnerGapDuotone } from "react-icons/pi";
import { LanguageContext } from '../LanguageContext';
import { CurrencyContext } from '../CurrencyContext';
import { getApiUrl } from '../api';

export default function DashActivate({ setPage, onActivated, user }) {
  const activeSubscription = user?.active_subscription;
  const { t } = useContext(LanguageContext);
  const { formatPrice } = useContext(CurrencyContext);
  const [code, setCode] = useState(["","","",""]);
  const [status, setStatus] = useState("idle");
  const [errorMsg, setErrorMsg] = useState("");
  const [plans, setPlans] = useState([]);
  const [forceShowForm, setForceShowForm] = useState(false);
  const inputRefs = [useRef(),useRef(),useRef(),useRef()];

  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchPlans();
  }, []);

  async function fetchPlans() {
    try {
      const res = await fetch(`${apiUrl}/api/subscriptions/plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (!res.ok) throw new Error();
      const data = await res.json();
      setPlans(data);
    } catch (err) { console.error(err); }
  }

  function handleInput(i, val) {
    const clean = val.toUpperCase().replace(/[^A-Z0-9]/g,"").slice(0,4);
    const next = [...code]; next[i] = clean; setCode(next); setStatus("idle");
    if (clean.length===4 && i<3) inputRefs[i+1].current?.focus();
  }
  function handleKeyDown(i, e) { if (e.key==="Backspace" && code[i]==="" && i>0) inputRefs[i-1].current?.focus(); }
  function handlePaste(e) {
    const pasted = e.clipboardData.getData("text").toUpperCase().replace(/[^A-Z0-9-]/g,"");
    const parts = pasted.split("-").filter(p=>p.length>0).slice(0,4);
    const next = ["","","",""];
    parts.forEach((p,i) => { if(i<4) next[i] = p.slice(0,4); });
    setCode(next); e.preventDefault();
  }

  async function activate() {
    const fullCode = code.join("-");
    if (fullCode.replace(/-/g, "").length !== 16) return;
    
    setStatus("loading");
    try {
      const res = await fetch(`${apiUrl}/api/subscriptions/activate`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
          'Accept': 'application/json'
        },
        body: JSON.stringify({ code: fullCode })
      });
      
      const data = await res.json();
      
      if (!res.ok) {
        setStatus("error");
        setErrorMsg(data.message || t("الكود غير صحيح أو مستخدم مسبقاً — تحقق من الكود وأعد المحاولة"));
        return;
      }

      setStatus("success");
      if (onActivated) onActivated();
    } catch (err) {
      setStatus("error");
      setErrorMsg(t("تعذر الاتصال بالسيرفر، يرجى المحاولة لاحقاً"));
    }
  }

  const full = code.join("-");
  const isComplete = code.every(p=>p.length===4);

  return (
    <DashboardLayout activeSub="activate" setPage={setPage} user={user}>
      <div style={{ maxWidth:540, margin:'0 auto' }}>
        <div style={{ textAlign:'center', marginBottom:32 }}>
          <div style={{ width:72, height:72, borderRadius:'50%', background:C.goldBg, display:'flex', alignItems:'center', justifyContent:'center', margin:'0 auto 18px', color:C.gold, fontSize:'2rem' }}><PiTicketDuotone/></div>
          <h1 style={{ fontSize:'1.5rem', fontWeight:800, color:C.dark, margin:'0 0 8px' }}>{activeSubscription && !forceShowForm ? t("إدارة الاشتراك") : t("تفعيل الاشتراك")}</h1>
          {(!activeSubscription || forceShowForm) && <p style={{ color:C.muted, fontSize:'0.9rem' }}>{t("أدخل كود البطاقة المكون من 16 خانة لتفعيل اشتراكك")}</p>}
        </div>

        {status === "success" ? (
          <Card style={{ padding: '44px 36px', textAlign: 'center', border: `2px solid color-mix(in srgb, ${C.green} 25%, transparent)`, background: C.greenBg }}>
            <div style={{ fontSize: '3rem', marginBottom: 16, color: C.green }}><PiConfettiDuotone /></div>
            <h2 style={{ fontWeight: 900, color: C.green, marginBottom: 8 }}>{t("تم التفعيل بنجاح!")}</h2>
            <p style={{ color: C.body, marginBottom: 6 }}>{t("تم تفعيل اشتراكك بنجاح")}</p>
            <p style={{ color: C.muted, fontSize: '0.86rem', marginBottom: 28 }}>{t("يمكنك الآن الوصول إلى جميع الميزات المميزة")}</p>
            <div style={{ display: 'flex', gap: 12, justifyContent: 'center' }}>
              <Btn onClick={() => setPage('dashboard')}>{t("← الذهاب للوحة التحكم")}</Btn>
              <Btn variant="secondary" onClick={() => { setCode(["", "", "", ""]); setStatus("idle"); setForceShowForm(false); }}>{t("إغلاق")}</Btn>
            </div>
          </Card>
        ) : activeSubscription && !forceShowForm ? (
          <Card style={{ padding: '36px 32px', textAlign: 'center', border: `1.5px solid ${activeSubscription.plan?.color_hex || C.gold}40` }}>
            <div style={{ width: 64, height: 64, borderRadius: '50%', background: `${activeSubscription.plan?.color_hex || C.gold}15`, display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 20px', color: activeSubscription.plan?.color_hex || C.gold, fontSize: '1.8rem' }}>
              <PiTicketDuotone />
            </div>
            <h2 style={{ fontWeight: 800, color: C.dark, marginBottom: 6 }}>{t("اشتراكك الحالي")}</h2>
            <div style={{ display: 'inline-block', padding: '6px 16px', borderRadius: 50, background: `${activeSubscription.plan?.color_hex || C.gold}15`, color: activeSubscription.plan?.color_hex || C.gold, fontWeight: 800, fontSize: '0.9rem', marginBottom: 12 }}>
              {activeSubscription.plan?.name || t("باقة النخبة")}
            </div>
            <div style={{ color: C.muted, fontSize: '0.78rem', fontWeight: 600, marginBottom: 20 }}>
              {t("رقم البطاقة: ")} <span style={{ fontFamily: 'monospace', fontSize: '0.85rem' }}>{activeSubscription.masked_code || "NKBH-****-****-" + (activeSubscription.activation_card?.code_suffix || "****")}</span>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28, textAlign: 'start' }}>
              <div style={{ background: C.bg, padding: '12px 16px', borderRadius: 12 }}>
                <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 600, marginBottom: 4 }}>{t("سعر الاشتراك")}</div>
                <div style={{ fontWeight: 800, color: C.dark }}>{formatPrice(activeSubscription.plan?.price || 0)}</div>
              </div>
              <div style={{ background: C.bg, padding: '12px 16px', borderRadius: 12 }}>
                <div style={{ fontSize: '0.72rem', color: C.muted, fontWeight: 600, marginBottom: 4 }}>{t("الأيام المتبقية")}</div>
                <div style={{ fontWeight: 800, color: C.blue }}>
                   {activeSubscription.ends_at ? Math.max(0, Math.ceil((new Date(activeSubscription.ends_at) - new Date()) / (1000 * 60 * 60 * 24))) : 0} {t("يوم")}
                </div>
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12 }}>
              <Btn onClick={() => setPage('dashboard')} style={{ flex: 1 }}>{t("تصفح المواد")}</Btn>
              <Btn variant="secondary" onClick={() => setForceShowForm(true)} style={{ flex: 1 }}>{t("تغيير الباقة")}</Btn>
            </div>
          </Card>
        ) : (
          <Card style={{ padding: '36px 32px' }}>
            <div style={{ background: C.bg, borderRadius: 10, padding: '10px 16px', marginBottom: 26, textAlign: 'center' }}>
              <span style={{ color: C.muted, fontSize: '0.8rem' }}>{t("صيغة الكود: ")}</span>
              <code style={{ color: C.blue, fontWeight: 700, fontSize: '0.88rem', fontFamily: 'monospace' }}>NKBH-XXXX-XXXX-XXXX</code>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, marginBottom: 28, direction: 'ltr' }} onPaste={handlePaste}>
              {code.map((seg, i) => (
                <React.Fragment key={i}>
                  <input ref={inputRefs[i]} value={seg} onChange={e => handleInput(i, e.target.value)} onKeyDown={e => handleKeyDown(i, e)} maxLength={4} placeholder="XXXX"
                    style={{ width: 80, height: 56, textAlign: 'center', fontSize: '1.1rem', fontFamily: 'monospace', fontWeight: 700, letterSpacing: '0.12em', borderRadius: 10, border: `2px solid ${status === "error" ? C.red : seg.length === 4 ? C.blue : C.border}`, outline: 'none', background: seg.length === 4 ? C.blueLight : C.white, color: C.dark, transition: 'all .2s', textTransform: 'uppercase' }}
                    onFocus={e => { if (status !== "error") e.target.style.borderColor = C.blue; }}
                    onBlur={e => { if (e.target.value.length !== 4) e.target.style.borderColor = C.border; }} />
                  {i < 3 && <span style={{ color: C.muted, fontWeight: 700, fontSize: '1.1rem' }}>—</span>}
                </React.Fragment>
              ))}
            </div>
            {status === "error" && (
              <div style={{ background: C.redBg, border: `1px solid color-mix(in srgb, ${C.red} 19%, transparent)`, borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', gap: 10, alignItems: 'center' }}>
                <span style={{ color: C.red, fontSize: "1.2rem", display: "flex" }}><PiXCircleDuotone /></span><span style={{ color: C.red, fontSize: '0.86rem', fontWeight: 600 }}>{errorMsg}</span>
              </div>
            )}
            {isComplete && status !== "error" && (
              <div style={{ background: C.goldBg, border: `1px solid color-mix(in srgb, ${C.gold} 19%, transparent)`, borderRadius: 10, padding: '12px 16px', marginBottom: 18, display: 'flex', alignItems: 'center', gap: 12 }}>
                <span style={{ fontSize: '1.4rem', color: C.gold, display: "flex" }}><PiTicketDuotone /></span>
                <div><div style={{ fontWeight: 700, color: C.dark, fontSize: '0.88rem' }}>{t("الكود: NKBH-")}{full}</div><div style={{ color: C.muted, fontSize: '0.78rem', marginTop: 2 }}>{t("جاهز للتفعيل — اضغط تفعيل الاشتراك")}</div></div>
              </div>
            )}
            <button onClick={activate} disabled={!isComplete || status === "loading"}
              style={{ width: '100%', background: !isComplete || status === "loading" ? C.muted : `linear-gradient(135deg, ${C.gold}, #E67E00)`, color: C.white, border: 'none', borderRadius: 11, padding: '14px', fontSize: '1rem', fontWeight: 700, fontFamily: 'inherit', cursor: !isComplete || status === "loading" ? 'not-allowed' : 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 10, transition: 'opacity .2s' }}>
              {status === "loading" ? <><span style={{ display: 'inline-flex', alignItems: "center", animation: 'spin 1s linear infinite' }}><PiSpinnerGapDuotone /></span> {t("جاري التحقق...")}</> : <><PiTicketDuotone size={18} /> {t("تفعيل الاشتراك")}</>}
            </button>
            {forceShowForm && (
              <div style={{ textAlign: 'center', marginTop: 16 }}>
                <span onClick={() => setForceShowForm(false)} style={{ color: C.muted, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}>{t("إلغاء والعودة لبيانات اشتراكي")}</span>
              </div>
            )}
            <p style={{ textAlign: 'center', color: C.muted, fontSize: '0.78rem', marginTop: 16 }}>
              {!forceShowForm && (<>{t("لا تملك بطاقة اشتراك؟")}{" "}<span style={{ color: C.blue, cursor: 'pointer', fontWeight: 600 }}>{t("تواصل مع الدعم")}</span></>)}
            </p>
          </Card>
        )}

        <div style={{ marginTop:28 }}>
          <h3 style={{ fontWeight:700, color:C.dark, textAlign:'center', marginBottom:16, fontSize:'0.95rem' }}>{t("خطط الاشتراك المتاحة")}</h3>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:14 }}>
            {plans.map(p => (
              <div key={p.id} style={{ background: `${p.color_hex}15`, border:`1.5px solid ${p.color_hex}30`, borderRadius:14, padding:'16px 14px', textAlign:'center' }}>
                <div style={{ fontWeight:800, color:p.color_hex, fontSize:'1rem', marginBottom:4 }}>{p.name}</div>
                <div style={{ fontWeight:900, color:C.dark, fontSize:'1.4rem' }}>{formatPrice(p.price)}</div>
                <div style={{ color:C.muted, fontSize:'0.76rem', marginTop:4 }}>{p.duration_days} {t("يوم")}</div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
