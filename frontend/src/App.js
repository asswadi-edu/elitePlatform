import React, { useState, useEffect, Suspense, lazy } from "react";
import { Routes, Route, useNavigate, useLocation, Navigate } from "react-router-dom";
import { C } from "./tokens";
import { Btn } from "./components/Common";
import { ThemeContext } from "./ThemeContext";
import { LanguageProvider, LanguageContext } from "./LanguageContext";
import { CurrencyProvider } from "./CurrencyContext";
import { SettingsProvider, SettingsContext } from "./SettingsContext";
import { UserProvider, UserContext } from "./UserContext";
import { getApiUrl } from "./api";

/* ─── Components ─── */
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import DashboardLayout from "./layouts/DashboardLayout";

/* ─── Public Pages (Lazy) ─── */
const Hero = lazy(() => import("./pages/home/Hero"));
const Features = lazy(() => import("./pages/home/Features"));
const HowItWorks = lazy(() => import("./pages/home/HowItWorks"));
const RolesSection = lazy(() => import("./pages/home/RolesSection"));
const CTASection = lazy(() => import("./pages/home/CTASection"));
const AboutPage = lazy(() => import("./pages/AboutPage"));
const ContactPage = lazy(() => import("./pages/ContactPage"));
const MajorsPage = lazy(() => import("./pages/MajorsPage"));

/* ─── Auth Pages (Lazy) ─── */
const LoginPage = lazy(() => import("./pages/auth/LoginPage"));
const RegisterPage = lazy(() => import("./pages/auth/RegisterPage"));
const ForgotPage = lazy(() => import("./pages/auth/ForgotPage"));
const VerifyEmail = lazy(() => import("./pages/auth/VerifyEmail"));
const ResetPassword = lazy(() => import("./pages/auth/ResetPassword"));

/* ─── Interest Test Pages (Lazy) ─── */
const TestIntroPage = lazy(() => import("./pages/test/TestIntroPage"));
const TestPage = lazy(() => import("./pages/test/TestPage"));
const TestResultPage = lazy(() => import("./pages/test/TestResultPage"));

/* ─── Dashboard Pages (Lazy) ─── */
const DashboardHome = lazy(() => import("./dashboard/DashboardHome"));
const DashSubjects = lazy(() => import("./dashboard/DashSubjects"));
const DashQuizzesList = lazy(() => import("./dashboard/DashQuizzesList"));
const DashGenerate = lazy(() => import("./dashboard/DashGenerate"));
const DashQuiz = lazy(() => import("./dashboard/DashQuiz"));
const DashResult = lazy(() => import("./dashboard/DashResult"));
const DashChallengeResult = lazy(() => import("./dashboard/DashChallengeResult"));
const DashResources = lazy(() => import("./dashboard/DashResources"));
const DashNotifications = lazy(() => import("./dashboard/DashNotifications"));
const DashAccountSettings = lazy(() => import("./dashboard/DashAccountSettings"));
const DashActivate = lazy(() => import("./dashboard/DashActivate"));
const DashSubjectDetails = lazy(() => import("./dashboard/DashSubjectDetails"));
const DashSubjectSelection = lazy(() => import("./dashboard/DashSubjectSelection"));
const DashChallenges = lazy(() => import("./dashboard/DashChallenges"));
const DashSuggestions = lazy(() => import("./dashboard/DashSuggestions"));
const DashChallengeView = lazy(() => import("./dashboard/DashChallengeView"));

/* ─── Admin Pages (Lazy) ─── */
const AdminLayout = lazy(() => import("./layouts/AdminLayout"));
const ModeratorLayout = lazy(() => import("./layouts/ModeratorLayout"));
const AdminDashboard = lazy(() => import("./admin/AdminDashboard"));
const AdminUsers = lazy(() => import("./admin/AdminUsers"));
const AdminResources = lazy(() => import("./admin/AdminResources"));
const AdminSubscriptions = lazy(() => import("./admin/AdminSubscriptions"));
const AdminCardsV2 = lazy(() => import("./admin/AdminCardsV2"));
const AdminMajors = lazy(() => import("./admin/AdminMajors"));
const AdminReports = lazy(() => import("./admin/AdminReports"));
const AdminSuggestions = lazy(() => import("./admin/AdminSuggestions"));
const AdminChallenges = lazy(() => import("./admin/AdminChallenges"));
const SystemSettings = lazy(() => import("./admin/SystemSettings"));
const AdminPlans = lazy(() => import("./admin/AdminPlans"));
const AdminActivityLog = lazy(() => import("./admin/AdminActivityLog"));
const AdminAptitude = lazy(() => import("./admin/AdminAptitude"));
const AdminMajorDetails = lazy(() => import("./admin/AdminMajorDetails"));
const AdminAI = lazy(() => import("./admin/AdminAI"));

/* ─── Moderator Pages (Lazy) ─── */
const ModResources = lazy(() => import("./moderator/ModResources"));
const ModReported = lazy(() => import("./moderator/ModReported"));
const ModContributors = lazy(() => import("./moderator/ModContributors"));
const ModLog = lazy(() => import("./moderator/ModLog"));

/* ═══════════════════════════════════════════
   Page groups for layout detection
═══════════════════════════════════════════ */
const adminPaths = ["/admin","/admin-users","/admin-academic","/admin-universities","/admin-fields","/admin-faculties","/admin-majors","/admin-subjects","/admin-resources","/admin-reports","/admin-subscriptions","/admin-cards","/admin-plans","/admin-settings","/admin-suggestions","/admin-challenges","/admin-contributors","/admin-activity","/admin-aptitude","/admin-major-details","/admin-ai"];
const dashPaths  = ["/dashboard","/dash-subjects","/dash-subjects-selection","/dash-subject-details","/dash-quizzes","/dash-challenges","/dash-generate","/dash-quiz","/dash-result","/dash-resources","/dash-notifications","/dash-settings","/dash-activate","/dash-suggestions","/dash-challenge-view","/dash-challenge-result","/dash-majors","/dash-test-intro","/dash-test","/dash-test-result"];
const modPaths   = ["/mod-resources","/mod-reported","/mod-log","/mod-settings","/mod-contributors"];

/* ─── Inner App (has access to Router hooks) ─── */
export default function App() {
  const navigate = useNavigate();
  const location = useLocation();

  const { user, setUser, loggedIn, setLoggedIn, userRole, setUserRole, isUniversity, setIsUniversity, logout: handleLogout } = React.useContext(UserContext);
  const [mustChangePassword, setMustChangePassword] = useState(false);
  const [isDark, setIsDark]     = useState(false);
  const { settings } = React.useContext(SettingsContext);
  const { t } = React.useContext(LanguageContext);

  // pageData stored in location.state
  const pageData = location.state || {};

  useEffect(() => {
    if (isDark) document.documentElement.setAttribute('data-theme', 'dark');
    else document.documentElement.removeAttribute('data-theme');
  }, [isDark]);

  // Load user from token on mount
  useEffect(() => {
    const token = localStorage.getItem("elite_token");
    if (token) {
      fetchUser(token);
    }
  }, []);

  async function fetchUser(token) {
    try {
      const response = await fetch(`${getApiUrl()}/api/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      if (response.ok) {
        const data = await response.json();
        const u = data.user;
        handleLogin(u);
      } else {
        localStorage.removeItem("elite_token");
      }
    } catch (e) {
      console.error("Auth error", e);
    }
  }

  useEffect(() => {
    if (loggedIn && location.pathname === "/") {
      const target = userRole === "admin" ? "/admin" : (userRole === "moderator" ? "/mod-resources" : "/dashboard");
      navigate(target, { replace: true });
    }
  }, [loggedIn, userRole]);

  function handleLogin(u) {
    setUser(u);
    setMustChangePassword(u.must_change_password);
  }

  function nav(path, data = {}) {
    navigate(path, { state: data });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  function handleUserUpdate(u) {
    setUser(u);
  }

  const path = location.pathname;
  const showNav     = ![...dashPaths, ...adminPaths, ...modPaths].some(p => path === p || path.startsWith(p + "/"));
  const isAdminPage = adminPaths.some(p => path === p || path.startsWith(p + "/"));
  const isModPage   = modPaths.some(p => path === p || path.startsWith(p + "/"));

  function ForceChangePassword() {
    const { t } = React.useContext(LanguageContext);
    const [currentPassword, setCurrentPassword] = useState("");
    const [newPassword, setNewPassword] = useState("");
    const [confirmPassword, setConfirmPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = async (e) => {
      e.preventDefault();
      if (newPassword !== confirmPassword) { setError(t("كلمات المرور غير متوافقة")); return; }
      if (newPassword.length < 8) { setError(t("يجب أن تكون كلمة المرور 8 أحرف على الأقل")); return; }
      setLoading(true); setError("");
      try {
        const token = localStorage.getItem("elite_token");
        const res = await fetch(`${getApiUrl()}/api/change-password`, {
          method: "POST",
          headers: { "Authorization": `Bearer ${token}`, "Content-Type": "application/json", "Accept": "application/json" },
          body: JSON.stringify({ current_password: currentPassword, new_password: newPassword })
        });
        const data = await res.json();
        if (res.ok) {
          setMustChangePassword(false);
          navigate(userRole === "admin" ? "/admin" : userRole === "moderator" ? "/mod-resources" : "/dashboard", { replace: true });
        } else {
          setError(data.message || t("فشل تعيين كلمة المرور"));
        }
      } catch (err) {
        setError(t("حدث خطأ في الاتصال"));
      } finally {
        setLoading(false);
      }
    };

    return (
      <div style={{ minHeight: "100vh", display: "flex", alignItems: "center", justifyContent: "center", background: C.bg, padding: 20 }}>
        <div style={{ background: C.white, padding: 40, borderRadius: 24, width: 450, maxWidth: "100%", boxShadow: "0 20px 40px rgba(0,0,0,0.05)", textAlign: "center", border: `1px solid ${C.border}` }}>
          <div style={{ width: 80, height: 80, background: C.blueLight, borderRadius: "50%", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 24px", fontSize: "2rem" }}>🛡️</div>
          <h2 style={{ fontSize: "1.6rem", fontWeight: 900, color: C.dark, marginBottom: 12 }}>{t("تعيين كلمة مرور جديدة")}</h2>
          <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.6, marginBottom: 32 }}>{t("لحماية خصوصيتك، يرجى تغيير كلمة المرور المؤقتة التي تم تزويدك بها من قبل الإدارة.")}</p>
          <form onSubmit={handleSubmit} style={{ textAlign: "start" }}>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: C.muted }}>{t("كلمة المرور الحالية")}</label>
              <input type="password" required value={currentPassword} onChange={e => setCurrentPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, fontSize: "1rem" }} placeholder="••••••••"/>
            </div>
            <div style={{ marginBottom: 20 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: C.muted }}>{t("كلمة المرور الجديدة")}</label>
              <input type="password" required value={newPassword} onChange={e => setNewPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, fontSize: "1rem" }} placeholder="••••••••"/>
            </div>
            <div style={{ marginBottom: 28 }}>
              <label style={{ display: "block", fontSize: "0.85rem", fontWeight: 700, marginBottom: 8, color: C.muted }}>{t("تأكيد كلمة المرور")}</label>
              <input type="password" required value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} style={{ width: "100%", padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}`, background: C.bg, fontSize: "1rem" }} placeholder="••••••••"/>
            </div>
            {error && <div style={{ color: C.red, fontSize: "0.85rem", marginBottom: 20, textAlign: "center", background: "#FFF5F5", padding: "10px", borderRadius: 8 }}>{error}</div>}
            <Btn style={{ width: "100%", padding: "14px", fontSize: "1.05rem" }} disabled={loading}>{loading ? t("جاري الحفظ...") : t("حفظ وتأمين الحساب")}</Btn>
            <div onClick={handleLogout} style={{ marginTop: 20, color: C.muted, fontSize: "0.85rem", cursor: "pointer", textDecoration: "underline", textAlign: "center" }}>{t("تسجيل الخروج")}</div>
          </form>
        </div>
      </div>
    );
  }

  /* ── Guards ── */
  function GuardLogin({ children }) {
    const { t } = React.useContext(LanguageContext);
    if (!loggedIn) {
      return (
        <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
          <div style={{ maxWidth:460, width:"100%", textAlign:"center" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", fontSize:"2.2rem" }}>🔐</div>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, marginBottom:10 }}>{t("يلزم تسجيل الدخول")}</h2>
            <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.8, marginBottom:32 }}>{t("سجّل دخولك أو أنشئ حساباً مجانياً للبدء.")}</p>
            <div style={{ display:"flex", gap:14, justifyContent:"center", marginBottom:16 }}>
              <Btn onClick={() => nav("/login")}>{t("← تسجيل الدخول")}</Btn>
              <Btn variant="secondary" onClick={() => nav("/register")}>{t("إنشاء حساب مجاني")}</Btn>
            </div>
            <span onClick={() => nav("/")} style={{ color:C.muted, fontSize:"0.85rem", cursor:"pointer", textDecoration:"underline" }}>{t("العودة للصفحة الرئيسية")}</span>
          </div>
        </div>
      );
    }
    if (user && !user.email_verified_at) {
      return <VerifyEmail setPage={nav} />;
    }
    return children;
  }

  function GuardStudent({ children }) {
    const { t } = React.useContext(LanguageContext);
    if (!loggedIn) {
      return (
        <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
          <div style={{ maxWidth:460, width:"100%", textAlign:"center" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:C.blueLight, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", fontSize:"2.2rem" }}>🔐</div>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, marginBottom:10 }}>{t("يلزم تسجيل الدخول")}</h2>
            <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.8, marginBottom:28 }}>{t("هذا القسم متاح للطلاب المسجلين فقط.")}</p>
            <div style={{ display:"flex", gap:14, justifyContent:"center" }}>
              <Btn onClick={() => nav("/login")}>{t("← تسجيل الدخول")}</Btn>
              <Btn variant="secondary" onClick={() => nav("/register")}>{t("إنشاء حساب")}</Btn>
            </div>
          </div>
        </div>
      );
    }
    if (userRole !== "student" && userRole !== "subscriber" && userRole !== "admin" && userRole !== "moderator") {
      return (
        <div style={{ minHeight:"70vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.bg, padding:"60px 28px" }}>
          <div style={{ maxWidth:500, width:"100%", textAlign:"center" }}>
            <div style={{ width:76, height:76, borderRadius:"50%", background:C.goldBg, display:"flex", alignItems:"center", justifyContent:"center", margin:"0 auto 22px", fontSize:"2.2rem" }}>🛑</div>
            <h2 style={{ fontSize:"1.5rem", fontWeight:800, color:C.dark, marginBottom:10 }}>{t("غير مسموح بالدخول")}</h2>
            <p style={{ color:C.muted, fontSize:"0.95rem", lineHeight:1.8, marginBottom:28 }}>{t("هذا القسم مخصص للطلاب فقط.")}</p>
            <Btn onClick={() => nav("/")}>{t("العودة للرئيسية")}</Btn>
          </div>
        </div>
      );
    }
    return children;
  }

  function GuardSubscription({ children, inDashboard = false, activeSub = "", permission = null }) {
    const { isSubscribed, user } = React.useContext(UserContext);
    const { t } = React.useContext(LanguageContext);
    
    // Check permission if provided, otherwise fallback to isSubscribed
    const perms = user?.user_permissions || user?.permissions || [];
    const hasAccess = isSubscribed || (permission ? perms.includes(permission) : false);
    
    if (hasAccess) return children;
    const blockedUI = (
      <div style={{ minHeight: "70vh", display: "flex", alignItems: "center", justifyContent: "center", background: inDashboard ? "transparent" : C.bg, padding: "60px 28px" }}>
        <div style={{ maxWidth: 500, width: "100%", textAlign: "center" }}>
          <div style={{ width: 76, height: 76, borderRadius: "50%", background: C.goldBg, display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 22px", fontSize: "2.2rem" }}>💎</div>
          <h2 style={{ fontSize: "1.5rem", fontWeight: 800, color: C.dark, marginBottom: 10 }}>{t("ميزة للمشتركين فقط")}</h2>
          <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8, marginBottom: 28 }}>{t("هذه الميزة متاحة فقط للمشتركين في باقات النخبة.")}</p>
          <div style={{ display: "flex", gap: 14, justifyContent: "center" }}>
            <Btn onClick={() => nav("/dash-activate")}>{t("تفعيل الاشتراك الآن")}</Btn>
            <Btn variant="secondary" onClick={() => nav("/dashboard")}>{t("العودة للرئيسية")}</Btn>
          </div>
        </div>
      </div>
    );
    if (inDashboard) {
      return <DashboardLayout activeSub={activeSub} setPage={nav} onLogout={handleLogout}>{blockedUI}</DashboardLayout>;
    }
    return blockedUI;
  }

  function MaintenanceScreen() {
    return (
      <div style={{ minHeight:"100vh", display:"flex", alignItems:"center", justifyContent:"center", background:C.white, padding:40, textAlign:'center' }}>
        <div style={{ maxWidth:500 }}>
          <div style={{ fontSize:'5rem', marginBottom:20 }}>🛠️</div>
          <h1 style={{ fontSize:'2rem', fontWeight:900, color:C.dark, marginBottom:16 }}>{t("المنصة تحت الصيانة")}</h1>
          <p style={{ fontSize:'1.1rem', color:C.muted, lineHeight:1.8, marginBottom:30 }}>{t("نحن نقوم حالياً ببعض التحسينات لضمان أفضل تجربة تعليمية لك. سنعود قريباً جداً!")}</p>
          <div style={{ padding:20, borderRadius:16, background:C.bg, border:`1px solid ${C.border}`, display:'inline-block' }}>
            <div style={{ fontWeight:800, color:C.blue, fontSize:'0.9rem' }}>{settings.site_name}</div>
            <div style={{ fontSize:'0.75rem', color:C.muted, marginTop:4 }}>{settings.site_slogan}</div>
          </div>
          {loggedIn && userRole === 'admin' && (
            <div style={{ marginTop:30 }}><Btn onClick={() => nav("/admin")}>{t("الدخول كمسؤول")}</Btn></div>
          )}
          {!loggedIn && (
            <div style={{ marginTop:20 }}>
              <span onClick={() => nav("/login")} style={{ color:C.blue, fontWeight:700, cursor:'pointer', fontSize:'0.9rem' }}>{t("تسجيل دخول المسؤول")}</span>
            </div>
          )}
        </div>
      </div>
    );
  }

  const cp = { setPage: nav, user, setUser: handleUserUpdate, onLogout: handleLogout };

  /* ─────────────── ROUTES ─────────────── */
  function renderRoutes() {
    if (settings.maintenance_mode && userRole !== 'admin') {
      if (path !== "/login") return <Route path="*" element={<MaintenanceScreen />} />;
    }
    if (loggedIn && mustChangePassword) {
      return <Route path="*" element={<ForceChangePassword />} />;
    }
    return null;
  }

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800;900&display=swap');
        * { box-sizing: border-box; margin: 0; padding: 0; }
        body { font-family: 'Tajawal', sans-serif; background: var(--bg); color: var(--body); }
        @keyframes spin { to { transform: rotate(360deg); } }
        ::-webkit-scrollbar { width: 5px; }
        ::-webkit-scrollbar-thumb { background: #3B5BDB; border-radius: 3px; }
        select { appearance: none; }
      `}</style>

      <ThemeContext.Provider value={{ isDark, toggleTheme: () => setIsDark(!isDark) }}>
        <div style={{ fontFamily:"'Tajawal', sans-serif", paddingTop: showNav ? 66 : 0 }}>
          {showNav && <Navbar setPage={nav} loggedIn={loggedIn} userRole={userRole} user={user} onLogout={handleLogout}/>}

          <Suspense fallback={
            <div style={{ minHeight: "80vh", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: C.bg }}>
              <div style={{ width: 40, height: 40, border: `3px solid ${C.blueLight}`, borderTop: `3px solid ${C.blue}`, borderRadius: "50%", animation: "spin 1s linear infinite", marginBottom: 16 }}></div>
              <div style={{ color: C.muted, fontSize: "0.9rem", fontWeight: 600 }}>{t("جاري التحميل...")}</div>
            </div>
          }>
            {(settings.maintenance_mode && userRole !== 'admin' && path !== "/login") ? (
              <MaintenanceScreen />
            ) : (loggedIn && mustChangePassword) ? (
              <ForceChangePassword />
            ) : (
              <Routes>
              {/* ─── Public ─── */}
              <Route path="/" element={<><Hero setPage={nav} loggedIn={loggedIn}/><Features/><HowItWorks/><RolesSection setPage={nav} loggedIn={loggedIn}/><CTASection setPage={nav}/></>} />
              <Route path="/about" element={<AboutPage setPage={nav}/>} />
              <Route path="/contact" element={<ContactPage/>} />

              {/* ─── Auth ─── */}
              <Route path="/login"          element={<LoginPage setPage={nav} onLogin={handleLogin}/>} />
              <Route path="/register"       element={<RegisterPage setPage={nav} onLogin={handleLogin}/>} />
              <Route path="/forgot"         element={<ForgotPage setPage={nav}/>} />
              <Route path="/verify-email"   element={<VerifyEmail setPage={nav}/>} />
              <Route path="/reset-password" element={<ResetPassword setPage={nav}/>} />

              {/* ─── Interest Test (public) ─── */}
              <Route path="/test-intro"  element={<GuardLogin><TestIntroPage setPage={nav}/></GuardLogin>} />
              <Route path="/test"        element={<GuardLogin><TestPage setPage={nav}/></GuardLogin>} />
              <Route path="/test-result" element={<GuardLogin><TestResultPage setPage={nav} elapsed={pageData.elapsed||0} uuid={pageData.uuid} requestAnswers={pageData.requestAnswers} testId={pageData.testId}/></GuardLogin>} />
              <Route path="/majors"      element={<GuardLogin><MajorsPage setPage={nav}/></GuardLogin>} />

              {/* ─── Student Dashboard ─── */}
              <Route path="/dashboard"          element={<GuardLogin><DashboardHome {...cp}/></GuardLogin>} />
              <Route path="/dash-majors"        element={<GuardLogin><MajorsPage {...cp} inDashboard={true}/></GuardLogin>} />
              <Route path="/dash-test-intro"    element={<GuardLogin><TestIntroPage {...cp} inDashboard={true}/></GuardLogin>} />
              <Route path="/dash-test"          element={<GuardLogin><TestPage {...cp} inDashboard={true}/></GuardLogin>} />
              <Route path="/dash-test-result"   element={<GuardLogin><TestResultPage {...cp} elapsed={pageData.elapsed||0} uuid={pageData.uuid} requestAnswers={pageData.requestAnswers} testId={pageData.testId} inDashboard={true}/></GuardLogin>} />
              <Route path="/dash-subjects"      element={<GuardLogin><GuardStudent><DashSubjects {...cp}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-subjects-selection" element={<GuardLogin><GuardStudent><DashSubjectSelection {...cp}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-subject-details"    element={<GuardLogin><GuardStudent><DashSubjectDetails {...cp} subject={pageData.subject}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-quizzes"       element={<GuardLogin><GuardStudent><DashQuizzesList {...cp}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-challenges"    element={<GuardLogin><GuardStudent><DashChallenges {...cp}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-generate"      element={<GuardLogin><GuardStudent><GuardSubscription inDashboard activeSub="generate" permission="access_ai_quizzes"><DashGenerate {...cp} pageData={pageData}/></GuardSubscription></GuardStudent></GuardLogin>} />
              <Route path="/dash-quiz"          element={<GuardLogin><GuardStudent><GuardSubscription inDashboard activeSub="quiz" permission="access_ai_quizzes"><DashQuiz {...cp} pageData={pageData}/></GuardSubscription></GuardStudent></GuardLogin>} />
              <Route path="/dash-result"        element={<GuardLogin><GuardStudent><GuardSubscription inDashboard activeSub="result" permission="access_ai_quizzes"><DashResult {...cp} pageData={pageData}/></GuardSubscription></GuardStudent></GuardLogin>} />
              <Route path="/dash-challenge-result" element={<GuardLogin><GuardStudent><GuardSubscription inDashboard activeSub="challenge-result" permission="access_challenges"><DashChallengeResult {...cp} pageData={pageData}/></GuardSubscription></GuardStudent></GuardLogin>} />
              <Route path="/dash-resources"     element={<GuardLogin><GuardStudent><DashResources {...cp}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-notifications" element={<GuardLogin><DashNotifications {...cp}/></GuardLogin>} />
              <Route path="/dash-settings"      element={<GuardLogin><DashAccountSettings {...cp} setIsUniversity={(val) => setIsUniversity(val)}/></GuardLogin>} />
              <Route path="/dash-activate"      element={<GuardLogin><GuardStudent><DashActivate {...cp} onActivated={() => fetchUser(localStorage.getItem("elite_token"))}/></GuardStudent></GuardLogin>} />
              <Route path="/dash-suggestions"   element={<GuardLogin><DashSuggestions {...cp}/></GuardLogin>} />
              <Route path="/dash-challenge-view" element={<GuardLogin><GuardStudent><GuardSubscription inDashboard activeSub="challenge-view" permission="access_challenges"><DashChallengeView {...cp} data={pageData}/></GuardSubscription></GuardStudent></GuardLogin>} />

              {/* ─── Admin ─── */}
              <Route path="/admin"              element={<AdminLayout activeSub="admin" {...cp}><AdminDashboard {...cp}/></AdminLayout>} />
              <Route path="/admin-users"        element={<AdminLayout activeSub="admin-users" {...cp}><AdminUsers {...cp}/></AdminLayout>} />
              <Route path="/admin-resources"    element={<AdminLayout activeSub="admin-resources" {...cp}><AdminResources {...cp} userFilter={pageData.userFilter}/></AdminLayout>} />
              <Route path="/admin-subscriptions" element={<AdminLayout activeSub="admin-subscriptions" {...cp}><AdminSubscriptions {...cp}/></AdminLayout>} />
              <Route path="/admin-cards"        element={<AdminLayout activeSub="admin-cards" {...cp}><AdminCardsV2 {...cp}/></AdminLayout>} />
              <Route path="/admin-plans"        element={<AdminLayout activeSub="admin-plans" {...cp}><AdminPlans {...cp}/></AdminLayout>} />
              <Route path="/admin-academic"     element={<AdminLayout activeSub="admin-academic" {...cp}><AdminMajors {...cp} tab="universities"/></AdminLayout>} />
              <Route path="/admin-universities" element={<AdminLayout activeSub="admin-academic" {...cp}><AdminMajors {...cp} tab="universities"/></AdminLayout>} />
              <Route path="/admin-fields"       element={<AdminLayout activeSub="admin-fields" {...cp}><AdminMajors {...cp} tab="fields"/></AdminLayout>} />
              <Route path="/admin-faculties"    element={<AdminLayout activeSub="admin-faculties" {...cp}><AdminMajors {...cp} tab="faculties"/></AdminLayout>} />
              <Route path="/admin-majors"       element={<AdminLayout activeSub="admin-majors" {...cp}><AdminMajors {...cp} tab="majors"/></AdminLayout>} />
              <Route path="/admin-settings"     element={<AdminLayout activeSub="admin-settings" {...cp}><SystemSettings {...cp} isAdmin={true} initialTab={pageData.tab}/></AdminLayout>} />
              <Route path="/admin-reports"      element={<AdminLayout activeSub="admin-reports" {...cp}><AdminReports {...cp}/></AdminLayout>} />
              <Route path="/admin-suggestions"  element={<AdminLayout activeSub="admin-suggestions" {...cp}><AdminSuggestions {...cp}/></AdminLayout>} />
              <Route path="/admin-challenges"   element={<AdminLayout activeSub="admin-challenges" {...cp}><AdminChallenges {...cp}/></AdminLayout>} />
              <Route path="/admin-contributors" element={<AdminLayout activeSub="admin-contributors" {...cp}><ModContributors {...cp} isAdmin={true}/></AdminLayout>} />
              <Route path="/admin-activity"     element={<AdminLayout activeSub="admin-activity" {...cp}><AdminActivityLog {...cp}/></AdminLayout>} />
              <Route path="/admin-subjects"     element={<AdminLayout activeSub="admin-subjects" {...cp}><AdminMajors {...cp} tab="subjects"/></AdminLayout>} />
              <Route path="/admin-aptitude"     element={<AdminLayout activeSub="admin-aptitude" {...cp}><AdminAptitude {...cp}/></AdminLayout>} />
              <Route path="/admin-major-details" element={<AdminLayout activeSub="admin-faculties" {...cp}><AdminMajorDetails {...cp} selectedId={pageData.id}/></AdminLayout>} />
              <Route path="/admin-ai"           element={<AdminLayout activeSub="admin-ai" {...cp}><AdminAI {...cp}/></AdminLayout>} />

              {/* ─── Moderator ─── */}
              <Route path="/mod-resources"   element={<ModeratorLayout activeSub="mod-resources" {...cp}><ModResources {...cp} userFilter={pageData.userFilter}/></ModeratorLayout>} />
              <Route path="/mod-reported"    element={<ModeratorLayout activeSub="mod-reported" {...cp}><ModReported {...cp}/></ModeratorLayout>} />
              <Route path="/mod-contributors" element={<ModeratorLayout activeSub="mod-contributors" {...cp}><ModContributors {...cp}/></ModeratorLayout>} />
              <Route path="/mod-log"         element={<ModeratorLayout activeSub="mod-log" {...cp}><ModLog {...cp}/></ModeratorLayout>} />
              <Route path="/mod-settings"    element={<ModeratorLayout activeSub="mod-settings" {...cp}><SystemSettings {...cp} isAdmin={false}/></ModeratorLayout>} />

              {/* ─── Fallback ─── */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          )}
          </Suspense>

          {showNav && !isAdminPage && !isModPage && <Footer setPage={nav}/>}
        </div>
      </ThemeContext.Provider>
    </>
  );
}
