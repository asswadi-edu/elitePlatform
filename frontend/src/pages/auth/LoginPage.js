import React, { useState, useContext } from "react";
import { C, inputStyle } from "../../tokens";
import { Btn, Card, Field } from "../../components/Common";
import { FadeIn } from "../../utils";
import { 
  PiXCircleDuotone, PiSpinnerGapDuotone,
  PiEyeDuotone, PiEyeSlashDuotone
} from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";
import { SettingsContext } from "../../SettingsContext";
import { getApiUrl } from "../../api";



export default function LoginPage({ setPage, onLogin }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const [remember, setRemember] = useState(false);
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);



  async function handleLogin() {
    setError("");
    setLoading(true);

    try {
      const response = await fetch(`${getApiUrl()}/api/login`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ email: email.trim().toLowerCase(), password: pass }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data.message || t("البريد الإلكتروني أو كلمة المرور غير صحيحة"));
        setLoading(false);
        return;
      }

      // Store token
      localStorage.setItem("elite_token", data.access_token);
      
      const user = data.user;
      const fullName = `${user.profile.first_name} ${user.profile.last_name}`;
      
      // Determine destination
      let dest = "dashboard";
      const roleName = user.roles && user.roles.length > 0 ? user.roles[0].name : "student_school";
      if (roleName === "admin") dest = "admin";
      else if (roleName === "moderator") dest = "mod-resources";

      onLogin(user);
      setPage(dest);
    } catch (err) {
      setError(t("حدث خطأ في الاتصال بالخادم"));
      setLoading(false);
    }
  }

  return (
    <div style={{ minHeight:"80vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
      <div style={{ width:"100%", maxWidth:480 }}>
        <FadeIn>
          <Card style={{ padding:"44px 40px" }}>
            <div style={{ textAlign:"center", marginBottom:28 }}>
              <div style={{ width:52, height:52, borderRadius:13, background:settings.primary_color || C.blue, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:C.white, overflow:'hidden' }}>
                {settings.site_logo ? (
                  <img src={settings.site_logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                ) : (
                  <img src="/logo192.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
                )}
              </div>
              <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("تسجيل الدخول")}</h1>
              <p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("أهلًا بعودتك إلى النخبة")}</p>
            </div>



            <Field label={t("البريد الإلكتروني")}>
              <input type="email" value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder={t("أدخل بريدك الإلكتروني")} style={{ ...inputStyle, borderColor: error?C.red:C.border }}
                onFocus={e => e.target.style.borderColor = error?C.red:C.blue}
                onBlur={e => e.target.style.borderColor = error?C.red:C.border}
                onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
            </Field>

            <Field label={t("كلمة المرور")}>
              <div style={{ position: "relative" }}>
                <input type={showPass ? "text" : "password"} value={pass} onChange={e=>{setPass(e.target.value);setError("");}} placeholder={t("أدخل كلمة المرور")} 
                  style={{ ...inputStyle, borderColor: error?C.red:C.border, paddingLeft: 44 }}
                  onFocus={e => e.target.style.borderColor = error?C.red:C.blue}
                  onBlur={e => e.target.style.borderColor = error?C.red:C.border}
                  onKeyDown={e=>e.key==="Enter"&&handleLogin()} />
                <div onClick={() => setShowPass(!showPass)} 
                  style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center", justifyContent: "center", transition: "all .2s" }}
                  onMouseEnter={e => e.currentTarget.style.color = C.blue}
                  onMouseLeave={e => e.currentTarget.style.color = C.muted}>
                  {showPass ? <PiEyeSlashDuotone size={20}/> : <PiEyeDuotone size={20}/>}
                </div>
              </div>
            </Field>

            {error && (
              <div style={{ background:C.redBg, border:`1px solid color-mix(in srgb, ${C.red} 19%, transparent)`, borderRadius:9, padding:"10px 14px", marginBottom:16, display:"flex", gap:8, alignItems:"center" }}>
                <span style={{ color:C.red, fontSize:"1.2rem", display:"flex" }}><PiXCircleDuotone/></span>
                <span style={{ color:C.red, fontSize:"0.84rem", fontWeight:600 }}>{error}</span>
              </div>
            )}

            <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:20 }}>
              <label style={{ display:"flex", alignItems:"center", gap:8, cursor:"pointer" }}>
                <input type="checkbox" checked={remember} onChange={e=>setRemember(e.target.checked)} style={{ accentColor:C.blue, width:16, height:16 }} />
                <span style={{ fontSize:"0.84rem", color:C.body }}>{t("تذكرني")}</span>
              </label>
              <span onClick={()=>setPage("forgot")} style={{ color:C.blue, fontSize:"0.84rem", cursor:"pointer" }}>{t("نسيت كلمة المرور؟")}</span>
            </div>

            <button onClick={handleLogin} disabled={loading || !email || !pass}
              style={{ width:"100%", background: loading||!email||!pass ? C.muted : `linear-gradient(135deg,${C.blue},${C.blueDark})`, color:C.white, border:"none", borderRadius:9, padding:"13px", fontSize:"0.98rem", fontWeight:700, fontFamily:"inherit", cursor: loading||!email||!pass?"not-allowed":"pointer", display:"flex", alignItems:"center", justifyContent:"center", gap:10, marginBottom:16 }}>
              {loading ? <><span style={{ display:"inline-flex", alignItems:"center", animation:"spin 1s linear infinite" }}><PiSpinnerGapDuotone size={18}/></span> {t("جاري الدخول...")}</> : t("← تسجيل الدخول")}
            </button>

            <div style={{ textAlign:"center", marginTop:20, fontSize:"0.85rem", color:C.muted }}>
              {t("ليس لديك حساب؟ ")}
              <span onClick={()=>setPage("register")} style={{ color:C.blue, fontWeight:700, cursor:"pointer" }}>{t("إنشاء حساب")}</span>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
