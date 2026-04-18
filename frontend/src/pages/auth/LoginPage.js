import React, { useState, useContext } from "react";
import { C, inputStyle } from "../../tokens";
import { Btn, Card, Field } from "../../components/Common";
import { FadeIn } from "../../utils";
import { 
  PiGraduationCapDuotone, PiShieldCheckDuotone, 
  PiGearDuotone, PiFlaskDuotone, PiXCircleDuotone, PiSpinnerGapDuotone,
  PiEyeDuotone, PiEyeSlashDuotone
} from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";
import { getApiUrl } from "../../api";



export default function LoginPage({ setPage, onLogin }) {
  const { t } = useContext(LanguageContext);
  const [remember, setRemember] = useState(false);
  const [email,    setEmail]    = useState("");
  const [pass,     setPass]     = useState("");
  const [loading,  setLoading]  = useState(false);
  const [error,    setError]    = useState("");
  const [showPass, setShowPass] = useState(false);

  const DEMO_ACCOUNTS = {
    "student@elite.com": { pass: "student123", role: "student", dest: "dashboard", name: "طالب تجريبي", badge: t("طالب"), uni: false },
    "uni_student@elite.com": { pass: "student123", role: "student", dest: "dashboard", name: "طالب جامعي", badge: t("جامعي"), uni: true },
    "mod@elite.com":     { pass: "mod123",     role: "moderator", dest: "mod-resources", name: "مشرف المحتوى", badge: t("مشرف"), uni: false },
    "admin@elite.com":   { pass: "admin123",   role: "admin", dest: "admin", name: t("مدير النظام"), badge: t("أدمن"), uni: false },
  };

  const roleIcons = { student: <PiGraduationCapDuotone />, moderator: <PiShieldCheckDuotone />, admin: <PiGearDuotone /> };
  const roleColors = { student: C.blue, moderator: C.green, admin: C.red };

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
              <div style={{ width:52, height:52, borderRadius:13, background:C.blue, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 16px", color:C.white }}><span style={{ fontSize:"1.8rem" }}><PiGraduationCapDuotone/></span></div>
              <h1 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, margin:"0 0 6px" }}>{t("تسجيل الدخول")}</h1>
              <p style={{ color:C.muted, fontSize:"0.88rem" }}>{t("أهلًا بعودتك إلى النخبة")}</p>
            </div>

            {/* Demo accounts hint */}
            <div style={{ background:C.blueLight, border:`1px solid ${C.blueMid}`, borderRadius:12, padding:"14px 16px", marginBottom:22 }}>
              <div style={{ fontWeight:700, color:C.blue, fontSize:"0.82rem", marginBottom:10, display:"flex", alignItems:"center", gap:6 }}><PiFlaskDuotone size={16}/> {t("حسابات تجريبية")}</div>
              <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
                {Object.entries(DEMO_ACCOUNTS).map(([em, acc]) => (
                  <div key={em} onClick={() => { setEmail(em); setPass(acc.pass); setError(""); }}
                    style={{ display:"flex", alignItems:"center", gap:10, padding:"8px 12px", borderRadius:9, cursor:"pointer", background:"rgba(255,255,255,0.7)", border:`1px solid ${roleColors[acc.role]}25`, transition:"all .15s" }}
                    onMouseEnter={e => e.currentTarget.style.background=C.white}
                    onMouseLeave={e => e.currentTarget.style.background="rgba(255,255,255,0.7)"}>
                    <span style={{ fontSize:"1.1rem" }}>{roleIcons[acc.role]}</span>
                    <div style={{ flex:1 }}>
                      <div style={{ fontWeight:700, fontSize:"0.82rem", color:C.dark }}>{acc.name}</div>
                      <div style={{ fontSize:"0.73rem", color:C.muted }}>{em}</div>
                    </div>
                    <span style={{ background:roleColors[acc.role]+"18", color:roleColors[acc.role], border:`1px solid ${roleColors[acc.role]}30`, borderRadius:12, padding:"2px 10px", fontSize:"0.72rem", fontWeight:700 }}>{acc.badge}</span>
                  </div>
                ))}
              </div>
            </div>

            <Field label={t("البريد الإلكتروني")}>
              <input value={email} onChange={e=>{setEmail(e.target.value);setError("");}} placeholder={t("أدخل بريدك الإلكتروني")} style={{ ...inputStyle, borderColor: error?C.red:C.border }}
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
