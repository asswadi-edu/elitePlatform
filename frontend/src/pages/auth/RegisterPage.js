import React, { useState, useContext, useEffect } from "react";
import { C, inputStyle } from "../../tokens";
import { Btn, Card, Field } from "../../components/Common";
import { FadeIn } from "../../utils";
import { 
  PiCheckCircleDuotone, PiXCircleDuotone, 
  PiEyeDuotone, PiEyeSlashDuotone, PiEnvelopeOpenDuotone, PiSpinnerGapDuotone
} from "react-icons/pi";
import { LanguageContext } from "../../LanguageContext";
import { SettingsContext } from "../../SettingsContext";
import { getApiUrl } from "../../api";



export default function RegisterPage({ setPage, onLogin }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const [step, setStep] = useState(1); // 1: Form, 2: OTP
  const [isUniversity, setIsUniversity] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [message, setMessage] = useState("");
  const [showPass, setShowPass] = useState(false);
  const [showConfirmPass, setShowConfirmPass] = useState(false);
  const [formData, setFormData] = useState({
    first_name: "", father_name: "", grandfather_name: "", last_name: "",
    email: "", password: "", password_confirmation: "",
    phone: "", birth_date: "",
    gender: "male",
    university_id: "", college_id: "", major_id: "", study_level: 1
  });

  const [universities, setUniversities] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [majors, setMajors] = useState([]);

  // OTP Stepper State
  const [otp, setOtp] = useState("");
  const [timer, setTimer] = useState(0);

  useEffect(() => {
    fetch(`${getApiUrl()}/api/universities`)
      .then(res => res.json())
      .then(setUniversities);
      
    fetch(`${getApiUrl()}/api/colleges`)
      .then(res => res.json())
      .then(setColleges);
  }, []);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => setTimer(t => t - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleUniChange = (id) => {
    setFormData({ ...formData, university_id: id });
  };

  const handleCollegeChange = (id) => {
    setFormData({ ...formData, college_id: id, major_id: "" });
    setMajors([]);
    if (id) {
      fetch(`${getApiUrl()}/api/majors?college_id=${id}`)
        .then(res => res.json())
        .then(setMajors);
    }
  };

  async function handleRegisterRequest() {
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/register`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ ...formData, is_university: isUniversity }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || t("حدث خطأ أثناء إرسال البيانات"));
        setLoading(false);
        return;
      }
      setStep(2);
      setTimer(60);
      setMessage(t("تم إرسال رمز التحقق إلى بريدك الإلكتروني"));
    } catch (err) {
      setError(t("حدث خطأ في الاتصال بالخادم"));
    }
    setLoading(false);
  }

  async function handleVerifyOTP() {
    if (otp.length !== 6) return;
    setError("");
    setLoading(true);
    try {
      const response = await fetch(`${getApiUrl()}/api/register/verify`, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ email: formData.email, code: otp }),
      });
      const data = await response.json();
      if (!response.ok) {
        setError(data.message || t("الرمز غير صحيح"));
        setLoading(false);
        return;
      }
      localStorage.setItem("elite_token", data.access_token);
      onLogin(data.user);
      setPage("dashboard");
    } catch (err) {
      setError(t("حدث خطأ في الاتصال بالخادم"));
    }
    setLoading(false);
  }

  async function handleResend() {
    if (timer > 0) return;
    handleRegisterRequest();
  }

  return (
    <div style={{ background: C.bg, padding: "60px 28px" }}>
      <div style={{ width: "100%", maxWidth: 580, margin: "0 auto" }}>
        <FadeIn>
          <Card style={{ padding: "44px 40px" }}>
            
            {step === 1 ? (
              <>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ width: 52, height: 52, borderRadius: 13, background: settings.primary_color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px", color:C.white, overflow: 'hidden' }}>
                    {settings.site_logo ? (
                      <img src={settings.site_logo} style={{ width: '100%', height: '100%', objectFit: 'cover' }} alt="logo" />
                    ) : (
                      <img src="/logo192.png" style={{ width: '80%', height: '80%', objectFit: 'contain' }} alt="logo" onError={(e) => { e.target.style.display = 'none'; }} />
                    )}
                  </div>
                  <h1 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إنشاء حساب جديد")}</h1>
                  <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("انضم إلى مجتمع النخبة الأكاديمي")}</p>
                </div>

                {error && (
                  <div style={{ background:C.redBg, color:C.red, padding:"12px 16px", borderRadius:10, marginBottom:20, fontSize:"0.86rem", display:'flex', alignItems:'center', gap:8 }}>
                    <PiXCircleDuotone size={20}/> {error}
                  </div>
                )}

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                   <Field label={t("الاسم الأول")}><input value={formData.first_name} onChange={e=>setFormData({...formData, first_name:e.target.value})} placeholder={t("الاسم الأول")} style={inputStyle} /></Field>
                   <Field label={t("اسم الأب")}><input value={formData.father_name} onChange={e=>setFormData({...formData, father_name:e.target.value})} placeholder={t("اسم الأب")} style={inputStyle} /></Field>
                   <Field label={t("اسم الجد")}><input value={formData.grandfather_name} onChange={e=>setFormData({...formData, grandfather_name:e.target.value})} placeholder={t("اسم الجد")} style={inputStyle} /></Field>
                   <Field label={t("الاسم الأخير")}><input value={formData.last_name} onChange={e=>setFormData({...formData, last_name:e.target.value})} placeholder={t("الاسم الأخير")} style={inputStyle} /></Field>
                </div>

                <Field label={t("البريد الإلكتروني")}>
                  <input value={formData.email} onChange={e=>setFormData({...formData, email:e.target.value})} placeholder="example@email.com" style={inputStyle} />
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <Field label={t("رقم الهاتف")}>
                    <input value={formData.phone} onChange={e=>setFormData({...formData, phone:e.target.value})} placeholder="777 000 000" style={{ ...inputStyle, direction: "ltr", textAlign: "right" }} />
                  </Field>
                  <Field label={t("تاريخ الميلاد")}>
                    <input type="date" value={formData.birth_date} onChange={e=>setFormData({...formData, birth_date:e.target.value})} style={inputStyle} />
                  </Field>
                </div>

                <Field label={t("النوع (الجنس)")}>
                  <div style={{ display: "flex", gap: 12, flexWrap: "wrap" }}>
                    {[{ id: "male", label: t("ذكر") }, { id: "female", label: t("أنثى") }].map(g => (
                      <div key={g.id} onClick={() => setFormData({ ...formData, gender: g.id })}
                        style={{ flex: 1, minWidth: 120, padding: "10px 16px", borderRadius: 10, cursor: "pointer", textAlign: "center", fontSize: "0.9rem", fontWeight: 700,
                          background: formData.gender === g.id ? C.blue : C.bg, color: formData.gender === g.id ? C.white : C.dark,
                          border: `1.5px solid ${formData.gender === g.id ? C.blue : C.border}`, transition: "all .2s" }}>
                        {g.label}
                      </div>
                    ))}
                  </div>
                </Field>

                <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                  <Field label={t("كلمة المرور")}>
                     <div style={{ position: "relative" }}>
                        <input type={showPass ? "text" : "password"} value={formData.password} onChange={e=>setFormData({...formData, password:e.target.value})} placeholder="••••••••" style={{ ...inputStyle, paddingLeft: 44 }} />
                        <div onClick={() => setShowPass(!showPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center" }}>
                          {showPass ? <PiEyeSlashDuotone size={19}/> : <PiEyeDuotone size={19}/>}
                        </div>
                     </div>
                  </Field>
                  <Field label={t("تأكيد كلمة المرور")}>
                     <div style={{ position: "relative" }}>
                        <input type={showConfirmPass ? "text" : "password"} value={formData.password_confirmation} onChange={e=>setFormData({...formData, password_confirmation:e.target.value})} placeholder="••••••••" style={{ ...inputStyle, paddingLeft: 44 }} />
                        <div onClick={() => setShowConfirmPass(!showConfirmPass)} style={{ position: "absolute", left: 14, top: "50%", transform: "translateY(-50%)", cursor: "pointer", color: C.muted, display: "flex", alignItems: "center" }}>
                          {showConfirmPass ? <PiEyeSlashDuotone size={19}/> : <PiEyeDuotone size={19}/>}
                        </div>
                     </div>
                  </Field>
                </div>

                <div style={{ background: C.blueLight, borderRadius: 12, padding: "14px 18px", marginBottom: 18, border: `1px solid ${C.blueMid}`, marginTop:18 }}>
                  <label style={{ display: "flex", alignItems: "center", gap: 10, cursor: "pointer" }}>
                    <input type="checkbox" checked={isUniversity} onChange={e => setIsUniversity(e.target.checked)} style={{ accentColor: C.blue, width: 18, height: 18 }} />
                    <span style={{ fontWeight: 700, fontSize: "0.9rem", color: C.dark }}>{t("هل أنت طالب جامعي حالياً؟")}</span>
                  </label>
                </div>

                {isUniversity && (
                  <div style={{ background: C.greenBg, borderRadius: 12, padding: "18px 20px", marginBottom: 18, border: `1px solid color-mix(in srgb, ${C.green} 15%, transparent)` }}>
                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(200px, 1fr))", gap: 14 }}>
                      <Field label={t("الجامعة")}>
                        <select value={formData.university_id} onChange={e=>handleUniChange(e.target.value)} style={{ ...inputStyle, background: C.white }}>
                          <option value="">{t("اختر الجامعة")}</option>
                          {universities.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                        </select>
                      </Field>
                      <Field label={t("الكلية")}>
                        <select value={formData.college_id} onChange={e=>handleCollegeChange(e.target.value)} style={{ ...inputStyle, background: C.white }}>
                          <option value="">{t("اختر الكلية")}</option>
                          {colleges.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                        </select>
                      </Field>
                    </div>

                    <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(180px, 1fr))", gap: 14, marginTop: 14 }}>
                      <Field label={t("التخصص")}>
                        <select value={formData.major_id} onChange={e=>setFormData({...formData, major_id: e.target.value})} style={{ ...inputStyle, background: C.white }}>
                          <option value="">{t("اختر التخصص")}</option>
                          {majors.map(m => <option key={m.id} value={m.id}>{m.name}</option>)}
                        </select>
                      </Field>
                      <Field label={t("المستوى الدراسي")}>
                        <select value={formData.study_level} onChange={e=>setFormData({...formData, study_level: e.target.value})} style={{ ...inputStyle, background: C.white }}>
                          {[1,2,3,4,5,6].map(l => <option key={l} value={l}>{t("المستوى")} {l}</option>)}
                        </select>
                      </Field>
                    </div>
                  </div>
                )}

                <Btn disabled={loading} style={{ width: "100%", marginTop: 8 }} onClick={handleRegisterRequest}>
                  {loading ? t("جاري المعالجة...") : t("← الخطوة التالية")}
                </Btn>
              </>
            ) : (
              /* Step 2: OTP Verification */
              <div style={{ direction: "rtl" }}>
                <div style={{ textAlign: "center", marginBottom: 32 }}>
                  <div style={{ width: 60, height: 60, borderRadius: 15, background: settings.primary_color || C.blue, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 18px", color: C.white, fontSize: "2rem" }}><PiEnvelopeOpenDuotone/></div>
                  <h2 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, marginBottom: 8 }}>{t("تفعيل الحساب")}</h2>
                  <p style={{ color: C.muted, fontSize: "0.9rem" }}>{t("أدخل رمز التحقق (OTP) المكون من 6 أرقام المرسل إلى بريدك الإلكتروني")}</p>
                   <b style={{ color: C.dark, fontSize: "0.9rem" }}>{formData.email}</b>
                </div>

                {error && (
                  <div style={{ background: C.redBg, color: C.red, padding: "12px 14px", borderRadius: 9, marginBottom: 20, display: "flex", gap: 10, alignItems: "center" }}>
                    <PiXCircleDuotone size={20}/> <span style={{ fontSize: "0.88rem", fontWeight: 600 }}>{error}</span>
                  </div>
                )}

                <div style={{ marginBottom: 24 }}>
                  <input type="text" maxLength="6" value={otp} onChange={e => setOtp(e.target.value.replace(/[^0-9]/g, ""))} placeholder="- - - - - -"
                    style={{ width: "100%", height: 56, textAlign: "center", fontSize: "1.8rem", letterSpacing: "0.6em", fontWeight: "bold", borderRadius: 12, border: `2px solid ${error ? C.red : C.border}`, outline: "none", color: C.blue, direction: "ltr" }} />
                </div>

                <Btn disabled={loading || otp.length !== 6} style={{ width: "100%", marginBottom: 16 }} onClick={handleVerifyOTP}>
                  {loading ? <><PiSpinnerGapDuotone className="spin" style={{marginLeft:8}}/> {t("جاري التحقق...")}</> : t("إنشاء الحساب")}
                </Btn>

                <div style={{ textAlign: "center", fontSize: "0.88rem", color: C.muted }}>
                  {t("لم يصلك الرمز؟")}{" "}
                  {timer > 0 ? (
                    <span style={{ color: C.muted, fontWeight: 700 }}>{t("إعادة الإرسال خلال")} {timer} {t("ثانية")}</span>
                  ) : (
                    <span onClick={handleResend} style={{ color: C.blue, fontWeight: 700, cursor: "pointer", textDecoration: "underline" }}>{t("إعادة إرسال الرمز")}</span>
                  )}
                </div>

                <div style={{ textAlign: "center", marginTop: 24 }}>
                  <span onClick={() => setStep(1)} style={{ color: C.muted, fontSize: "0.85rem", cursor: "pointer" }}>← {t("تعديل البيانات")}</span>
                </div>
              </div>
            )}

            <div style={{ textAlign: "center", marginTop: 20, fontSize: "0.85rem", color: C.muted }}>
              {t("لديك حساب بالفعل؟ ")}
              <span onClick={() => setPage("login")} style={{ color: C.blue, fontWeight: 700, cursor: "pointer" }}>{t("تسجيل الدخول")}</span>
            </div>
          </Card>
        </FadeIn>
      </div>
    </div>
  );
}
