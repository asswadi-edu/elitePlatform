import React, { useState } from "react";
import { C, inputStyle } from "../../tokens";
import { Btn, Card, Field } from "../../components/Common";
import { FadeIn } from "../../utils";
import { 
  PiLockDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone, 
  PiEnvelopeOpenDuotone, PiKeyDuotone, PiSpinnerGapDuotone,
  PiEyeDuotone, PiEyeSlashDuotone
} from "react-icons/pi";
import { getApiUrl } from "../../api";

export default function ForgotPage({ setPage }) {
  const [step, setStep] = useState(1); // 1: Email, 2: OTP, 3: New Password
  const [email, setEmail] = useState("");
  const [otp, setOtp] = useState("");
  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [timer, setTimer] = useState(0);

  React.useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  // Step 1: Request OTP
  const handleRequestOTP = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${getApiUrl()}/api/password/forgot`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(2);
        setTimer(60);
        setMessage("تم إرسال رمز التحقق إلى بريدك الإلكتروني.");
      } else {
        setError(data.message || "البريد الإلكتروني غير مسجل لدينا.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  };

  // Step 2: Verify OTP
  const handleVerifyOTP = async (e) => {
    e.preventDefault();
    if (otp.length !== 6) return;
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${getApiUrl()}/api/password/verify-code`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, code: otp }),
      });
      const data = await response.json();
      if (response.ok) {
        setStep(3);
        setError("");
      } else {
        setError(data.message || "الرمز غير صحيح أو انتهت صلاحيته.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  };

  // Step 3: Reset Password
  const handleResetPassword = async (e) => {
    e.preventDefault();
    if (password !== passwordConfirmation) {
        setError("كلمات المرور غير متطابقة.");
        return;
    }
    setLoading(true);
    setError("");
    try {
      const response = await fetch(`${getApiUrl()}/api/password/reset`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email, code: otp, password, password_confirmation: passwordConfirmation }),
      });
      const data = await response.json();
      if (response.ok) {
        setMessage("تم تغيير كلمة المرور بنجاح. يمكنك الآن تسجيل الدخول.");
        setTimeout(() => setPage("login"), 3000);
      } else {
        setError(data.message || "حدث خطأ أثناء تغيير كلمة المرور.");
      }
    } catch (err) {
      setError("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  };

  return (
    <div style={{ direction:"rtl", minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
      <div style={{ width:"100%", maxWidth:460 }}>
        <FadeIn>
          <Card style={{ padding:"44px 40px" }}>
            
            {/* Step 1: Email Input */}
            {step === 1 && (
              <>
                <div style={{ textAlign:"center", marginBottom:32 }}>
                  <div style={{ width:60, height:60, borderRadius:15, background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:C.blue }}>
                    <PiLockDuotone size={34}/>
                  </div>
                  <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, margin:"0 0 8px" }}>استعادة كلمة المرور</h1>
                  <p style={{ color:C.muted, fontSize:"0.9rem" }}>أدخل بريدك الإلكتروني وسنرسل لك رمزاً لتغيير كلمة المرور</p>
                </div>
                <form onSubmit={handleRequestOTP}>
                  {error && (
                      <div style={{ background:C.redBg, color:C.red, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                          <PiWarningCircleDuotone size={20}/> {error}
                      </div>
                  )}
                  <Field label="البريد الإلكتروني">
                    <input placeholder="example@email.com" style={inputStyle}
                      type="email" value={email} onChange={e => setEmail(e.target.value)} required />
                  </Field>
                  <Btn type="submit" style={{ width:"100%", marginBottom:16 }} loading={loading}>إرسال رمز التحقق</Btn>
                </form>
              </>
            )}

            {/* Step 2: OTP Verification */}
            {step === 2 && (
              <>
                <div style={{ textAlign:"center", marginBottom:32 }}>
                  <div style={{ width:60, height:60, borderRadius:15, background:C.goldBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:C.gold }}>
                    <PiEnvelopeOpenDuotone size={34}/>
                  </div>
                  <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 8px" }}>تحقق من الرمز</h1>
                  <p style={{ color:C.muted, fontSize:"0.9rem" }}>أدخل الرمز المكون من 6 أرقام المرسل إلى <br/> <b>{email}</b></p>
                </div>
                <form onSubmit={handleVerifyOTP}>
                  {error && (
                      <div style={{ background:C.redBg, color:C.red, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                          <PiWarningCircleDuotone size={20}/> {error}
                      </div>
                  )}
                  <div style={{ marginBottom:24 }}>
                    <input 
                      type="text" maxLength="6" value={otp} 
                      onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))}
                      placeholder="- - - - - -"
                      style={{ width:"100%", height:56, textAlign:"center", fontSize:"1.8rem", letterSpacing:"0.6em", fontWeight:"bold", borderRadius:12, border:`2px solid ${error ? C.red : C.border}`, outline:"none", color:C.blue, direction:"ltr" }}
                    />
                  </div>
                  <Btn type="submit" style={{ width:"100%", marginBottom:16 }} loading={loading} disabled={otp.length !== 6}>تأكيد الرمز</Btn>
                  
                  <div style={{ textAlign:"center", fontSize:"0.88rem", color:C.muted, marginBottom: 12 }}>
                    لم يصلك الرمز؟{" "}
                    {timer > 0 ? (
                      <span style={{ color:C.muted, fontWeight:700 }}>إعادة الإرسال خلال {timer} ثانية</span>
                    ) : (
                      <span onClick={handleRequestOTP} style={{ color:C.blue, fontWeight:700, cursor:"pointer", textDecoration:"underline" }}>إعادة إرسال الرمز</span>
                    )}
                  </div>

                  <div style={{ textAlign:"center", fontSize:"0.88rem", color:C.muted }}>
                    <span onClick={() => setStep(1)} style={{ color:C.blue, cursor:"pointer" }}>تغيير البريد الإلكتروني</span>
                  </div>
                </form>
              </>
            )}

            {/* Step 3: New Password */}
            {step === 3 && (
              <>
                <div style={{ textAlign:"center", marginBottom:32 }}>
                  <div style={{ width:60, height:60, borderRadius:15, background:C.greenBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 18px", color:C.green }}>
                    <PiKeyDuotone size={34}/>
                  </div>
                  <h1 style={{ fontSize:"1.4rem", fontWeight:800, color:C.dark, margin:"0 0 8px" }}>كلمة مرور جديدة</h1>
                  <p style={{ color:C.muted, fontSize:"0.9rem" }}>أدخل كلمة المرور الجديدة لحسابك</p>
                </div>
                <form onSubmit={handleResetPassword}>
                  {error && (
                      <div style={{ background:C.redBg, color:C.red, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                          <PiWarningCircleDuotone size={20}/> {error}
                      </div>
                  )}
                  {message && (
                      <div style={{ background:C.greenBg, color:C.green, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                          <PiCheckCircleDuotone size={20}/> {message}
                      </div>
                  )}
                  
                  <Field label="كلمة المرور الجديدة">
                    <div style={{ position: "relative" }}>
                      <input type={showPass ? "text" : "password"} value={password} onChange={e => setPassword(e.target.value)} required
                        style={{ ...inputStyle, paddingLeft: 44 }} />
                      <div onClick={() => setShowPass(!showPass)} 
                        style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center" }}>
                        {showPass ? <PiEyeSlashDuotone size={19}/> : <PiEyeDuotone size={19}/>}
                      </div>
                    </div>
                  </Field>

                  <Field label="تأكيد كلمة المرور">
                    <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} required
                      style={inputStyle} />
                  </Field>

                  <Btn type="submit" style={{ width:"100%", marginBottom:16 }} loading={loading}>تغيير كلمة المرور</Btn>
                </form>
              </>
            )}

            <div style={{ textAlign:"center", marginTop:12 }}>
              <span onClick={() => setPage("login")} style={{ color:C.blue, fontSize:"0.86rem", cursor:"pointer" }}>← العودة لتسجيل الدخول</span>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
