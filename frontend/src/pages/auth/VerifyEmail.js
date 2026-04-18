import React, { useState } from "react";
import { C } from "../../tokens";
import { Btn, Card } from "../../components/Common";
import { FadeIn } from "../../utils";
import { PiEnvelopeOpenDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone, PiSpinnerGapDuotone } from "react-icons/pi";
import { getApiUrl } from "../../api";

export default function VerifyEmail({ setPage }) {
  const [loading, setLoading] = useState(false);
  const [otp, setOtp] = useState("");
  const [status, setStatus] = useState("pending"); // pending, success, error
  const [message, setMessage] = useState("");
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleVerify = async () => {
    if (otp.length !== 6) return;
    setLoading(true);
    setMessage("");
    try {
      const token = localStorage.getItem("elite_token");
      const response = await fetch(`${getApiUrl()}/api/email/verify-otp`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json",
            "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ code: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
        // Refresh page to update user state in App.js after a short delay
        setTimeout(() => {
            window.location.reload();
        }, 2000);
      } else {
        setStatus("error");
        setMessage(data.message || "الرمز غير صحيح أو انتهت صلاحيته.");
      }
    } catch (err) {
      setStatus("error");
      setMessage("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  };

  const resend = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem("elite_token");
      const response = await fetch(`${getApiUrl()}/api/email/verification-notification`, {
        method: "POST",
        headers: { 
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json"
        }
      });
      const data = await response.json();
      if (response.ok) {
        setMessage(data.message || "تم إعادة إرسال الرمز بنجاح.");
        setTimer(60);
        setStatus("pending");
      } else {
        setMessage(data.message || "حدث خطأ أثناء محاولة إعادة الإرسال.");
      }
    } catch (err) {
        setMessage("حدث خطأ أثناء محاولة إعادة الإرسال.");
    }
    setLoading(false);
  };

  if (status === "success") {
    return (
      <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
        <FadeIn>
           <Card style={{ padding:"44px 40px", maxWidth:440, textAlign:"center", direction:"rtl" }}>
              <div style={{ width:64, height:64, borderRadius:"50%", background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 24px", color:C.green, fontSize:"2.2rem" }}><PiCheckCircleDuotone/></div>
              <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, marginBottom:12 }}>تم التفعيل بنجاح!</h2>
              <p style={{ color:C.muted, marginBottom:24 }}>شكراً لك على تفعيل بريدك الإلكتروني. يتم الآن توجيهك إلى لوحة التحكم...</p>
           </Card>
        </FadeIn>
      </div>
    );
  }

  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
      <FadeIn>
        <Card style={{ padding:"44px 40px", maxWidth:460, width:"100%", direction:"rtl" }}>
          <div style={{ textAlign:"center", marginBottom:32 }}>
            <div style={{ width:60, height:60, borderRadius:15, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:C.white, fontSize:"2rem" }}><PiEnvelopeOpenDuotone/></div>
            <h2 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, marginBottom:8 }}>تفعيل الحساب</h2>
            <p style={{ color:C.muted, fontSize:"0.9rem" }}>أدخل رمز التحقق (OTP) المكون من 6 أرقام المرسل إلى بريدك الإلكتروني</p>
          </div>

          <div style={{ marginBottom:24 }}>
            <input 
              type="text" 
              maxLength="6" 
              value={otp} 
              onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
              placeholder="- - - - - -"
              style={{ width:"100%", height:56, textAlign:"center", fontSize:"1.8rem", letterSpacing:"0.6em", fontWeight:"bold", borderRadius:12, border:`2px solid ${status === "error" ? C.red : C.border}`, outline:"none", color:C.blue, direction:"ltr" }}
              onKeyDown={e => e.key === "Enter" && handleVerify()}
            />
          </div>

          {message && (
            <div style={{ background: status === "error" ? C.redBg : C.blueLight, borderRadius:9, padding:"12px 14px", marginBottom:20, display:"flex", gap:10, alignItems:"center", textAlign:"right" }}>
              <span style={{ color: status === "error" ? C.red : C.blue, display:"flex", fontSize:"1.2rem" }}>
                {status === "error" ? <PiWarningCircleDuotone/> : <PiCheckCircleDuotone/>}
              </span>
              <span style={{ color: status === "error" ? C.red : C.blue, fontSize:"0.88rem", fontWeight:600 }}>{message}</span>
            </div>
          )}

          <Btn disabled={loading || otp.length !== 6} style={{ width:"100%", marginBottom:16 }} onClick={handleVerify}>
            {loading ? <><PiSpinnerGapDuotone className="spin" style={{marginRight:8}}/> جاري التحقق...</> : "التحقق من الرمز"}
          </Btn>

          <div style={{ textAlign:"center", fontSize:"0.88rem", color:C.muted }}>
            لم يصلك الرمز؟{" "}
            {timer > 0 ? (
                <span style={{ color:C.muted, fontWeight:700 }}>إعادة الإرسال خلال {timer} ثانية</span>
            ) : (
                <span onClick={resend} style={{ color:C.blue, fontWeight:700, cursor:"pointer", textDecoration:"underline" }}>إعادة إرسال الرمز</span>
            )}
          </div>

          <div style={{ textAlign:"center", marginTop:24 }}>
            <span onClick={() => { localStorage.removeItem("elite_token"); window.location.href="/"; }} style={{ color:C.muted, fontSize:"0.85rem", cursor:"pointer" }}>← الخروج والعودة للرئيسية</span>
          </div>
        </Card>
      </FadeIn>
    </div>
  );
}
