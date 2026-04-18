import React, { useState } from "react";
import { C, inputStyle } from "../../tokens";
import { Btn, Card, Field } from "../../components/Common";
import { FadeIn, useQuery } from "../../utils";
import { PiLockKeyDuotone, PiCheckCircleDuotone, PiWarningCircleDuotone } from "react-icons/pi";
import { getApiUrl } from "../../api";

export default function ResetPassword({ setPage }) {
  const query = useQuery();
  const token = query.get("token");
  const email = query.get("email");

  const [password, setPassword] = useState("");
  const [passwordConfirmation, setPasswordConfirmation] = useState("");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState("idle"); // idle, success, error
  const [message, setMessage] = useState("");
  const [errors, setErrors] = useState({});

  const handleReset = async (e) => {
    e.preventDefault();
    setLoading(true);
    setErrors({});
    try {
      const response = await fetch(`${getApiUrl()}/api/password/reset`, {
        method: "POST",
        headers: { 
            "Content-Type": "application/json",
            "Accept": "application/json"
        },
        body: JSON.stringify({
            token,
            email,
            password,
            password_confirmation: passwordConfirmation,
        }),
      });
      const data = await response.json();
      if (response.ok) {
        setStatus("success");
        setMessage(data.message);
      } else {
        if (response.status === 422) {
          setErrors(data.errors);
        } else {
          setStatus("error");
          setMessage(data.message || "حدث خطأ أثناء إعادة تعيين كلمة المرور.");
        }
      }
    } catch (err) {
      setStatus("error");
      setMessage("حدث خطأ في الاتصال بالخادم.");
    }
    setLoading(false);
  };

  return (
    <div style={{ direction:"rtl", minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
      <div style={{ width:"100%", maxWidth:440 }}>
        <FadeIn>
          <Card style={{ padding:"44px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:32 }}>
              <div style={{ width:52, height:52, borderRadius:13, background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:C.blue }}>
                <PiLockKeyDuotone size={34}/>
              </div>
              <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>تغيير كلمة المرور</h1>
              <p style={{ color:C.muted, fontSize:"0.88rem" }}>أدخل كلمة المرور الجديدة لحسابك</p>
            </div>

            {status === "success" ? (
              <div style={{ background:C.greenBg, border:`1px solid color-mix(in srgb, ${C.green} 19%, transparent)`, borderRadius:12, padding:"22px 20px", textAlign:"center" }}>
                <div style={{ color:C.green, marginBottom:10, display:'flex', justifyContent:'center' }}><PiCheckCircleDuotone size={32}/></div>
                <div style={{ fontWeight:700, color:C.dark, marginBottom:6 }}>تم التغيير بنجاح!</div>
                <div style={{ color:C.muted, fontSize:"0.86rem", marginBottom:12 }}>{message}</div>
                <Btn style={{ width:"100%" }} onClick={() => setPage("login")}>الذهاب لتسجيل الدخول</Btn>
              </div>
            ) : (
              <form onSubmit={handleReset}>
                {status === "error" && (
                    <div style={{ background:C.redBg, color:C.red, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                        <PiWarningCircleDuotone size={20}/> {message}
                    </div>
                )}
                
                <Field label="كلمة المرور الجديدة" error={errors.password?.[0]}>
                  <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="8 أحرف على الأقل" style={inputStyle} required />
                </Field>

                <Field label="تأكيد كلمة المرور" error={errors.password_confirmation?.[0]}>
                  <input type="password" value={passwordConfirmation} onChange={e => setPasswordConfirmation(e.target.value)} placeholder="أعد إدخال كلمة المرور" style={inputStyle} required />
                </Field>

                <Btn type="submit" style={{ width:"100%" }} loading={loading}>
                  تحديث كلمة المرور
                </Btn>

                <div style={{ textAlign:"center", marginTop:16 }}>
                    <span onClick={() => setPage("login")} style={{ color:C.blue, fontSize:"0.86rem", cursor:"pointer" }}>← العودة لتسجيل الدخول</span>
                </div>
              </form>
            )}
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
