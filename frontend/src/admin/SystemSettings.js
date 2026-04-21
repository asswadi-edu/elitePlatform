import React, { useState, useContext, useRef, useEffect } from 'react';
import { CurrencyContext } from '../CurrencyContext';
import { SettingsContext } from '../SettingsContext';
import { C } from '../tokens';
import { Btn, Card } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import ModeratorLayout from '../layouts/ModeratorLayout';
import { RANKS } from '../dashboard/ranking';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';
import { 
  PiPaperclipDuotone, PiFilePdfDuotone, PiFileTextDuotone, 
  PiPresentationChartDuotone, PiFileVideoDuotone, PiFileArchiveDuotone,
  PiSlidersHorizontalDuotone, PiStarDuotone, PiThumbsDownDuotone,
  PiProhibitDuotone, PiLockKeyDuotone, PiCheckCircleDuotone,
  PiCheckFatDuotone, PiXDuotone, PiGlobeDuotone, PiMonitorDuotone,
  PiCurrencyDollarDuotone, PiHardDriveDuotone, PiUsersFourDuotone,
  PiEnvelopeDuotone, PiPhoneDuotone, PiShareNetworkDuotone, PiShieldCheckDuotone,
  PiWarningDuotone, PiBookOpenDuotone, PiLayoutDuotone, PiDatabaseDuotone,
  PiMagicWandDuotone, PiFramerLogoDuotone, PiCloudArrowUpDuotone, PiDesktopDuotone,
  PiKeyDuotone, PiPlusCircleDuotone, PiTrashDuotone, PiPencilSimpleDuotone, PiClockDuotone,
  PiCalendarDuotone, PiClockCounterClockwiseDuotone, PiTrendUpDuotone
} from "react-icons/pi";

const Counter = ({val, setVal, min=1, max=9999, unit=""}) => (
  <div style={{ display:"flex", alignItems:"center", gap:12 }}>
    <button onClick={()=>setVal(n=>Math.max(min,n-1))} style={{ width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:"1rem",fontWeight:700,color:C.dark }}>−</button>
    <input type="text" value={val} readOnly style={{ width:50, textAlign:"center", fontSize:"1.2rem", fontWeight:800, color:C.blue, border:'none', background:'none' }} />
    <button onClick={()=>setVal(n=>Math.min(max,n+1))} style={{ width:34,height:34,borderRadius:8,border:`1px solid ${C.border}`,background:C.white,cursor:"pointer",fontSize:"1rem",fontWeight:700,color:C.dark }}>+</button>
    {unit && <span style={{ color:C.muted, fontSize:"0.84rem" }}>{unit}</span>}
  </div>
);

const Toggle = ({on, setOn}) => (
  <div onClick={()=>setOn(!on)} style={{ width:46,height:26,borderRadius:13,background:on?C.blue:C.border,cursor:"pointer",position:"relative",transition:"background .25s",flexShrink:0 }}>
    <div style={{ width:20,height:20,borderRadius:"50%",background:C.white,position:"absolute",top:3,left:on?23:3,transition:"left .25s",boxShadow:"0 1px 4px rgba(0,0,0,0.15)" }} />
  </div>
);

const SettingRow = ({label, desc, children}) => (
  <div className="admin-setting-row" style={{ display:"flex", justifyContent:"space-between", alignItems:"center", padding:"16px 0", borderBottom:`1px solid ${C.border}60` }}>
    <div style={{ flex:1 }}>
      <div style={{ fontWeight:700, color:C.dark, fontSize:"0.9rem" }}>{label}</div>
      <div style={{ color:C.muted, fontSize:"0.78rem", marginTop:3, maxWidth:'85%' }}>{desc}</div>
    </div>
    <div style={{ flexShrink:0 }}>{children}</div>
  </div>
);

const InputField = ({value, onChange, placeholder, icon, readOnly}) => (
  <div style={{ position:'relative' }}>
     {icon && <div style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:C.muted }}>{icon}</div>}
     <input 
       value={value} 
       onChange={e => onChange(e.target.value)}
       placeholder={placeholder}
       readOnly={readOnly}
       style={{ width:'100%', padding:`12px 14px 12px ${icon ? '38px' : '14px'}`, borderRadius:10, border:`1px solid ${C.border}`, fontSize:'0.9rem', color:C.dark, outline:'none', background: readOnly ? C.bg : C.white }}
       onFocus={e => !readOnly && (e.target.style.borderColor = C.blue)}
       onBlur={e => e.target.style.borderColor = C.border}
     />
  </div>
);

const Badge = ({children, color}) => (
  <span style={{ padding:"4px 10px", borderRadius:6, fontSize:"0.72rem", fontWeight:800, background:`${color}15`, color:color, whiteSpace:'nowrap' }}>{children}</span>
);

export default function SystemSettings({ setPage, isAdmin=false, initialTab }) {
  const { t } = useContext(LanguageContext);
  const { activeCurrency, setActiveCurrency, exchangeRates, setExchangeRates, formatPrice } = useContext(CurrencyContext);
  const { refreshSettings } = useContext(SettingsContext);
  const [activeTab, setActiveTab] = useState(initialTab || (isAdmin ? 'identity' : 'content'));
  const fileInputRef = useRef(null);

  // --- Platform Identity & Branding ---
  const [siteName, setSiteName] = useState(t("منصة النخبة")); 
  const [siteSlogan, setSiteSlogan] = useState(t("منصة النخبة للتعليم الأكاديمي"));
  const [logoUrl, setLogoUrl] = useState("");
  const [primaryColor, setPrimaryColor] = useState("#2563EB");
  const [maintenanceMode, setMaintenanceMode] = useState(false);
  const [allowRegistration, setAllowRegistration] = useState(true);

  // --- Content & Limits (Existing) ---
  const [allowedTypes, setAllowedTypes] = useState({ pdf:true, docx:true, pptx:false, mp4:false, zip:false });
  const [newExt, setNewExt] = useState("");
  const [freeTests, setFreeTests] = useState(3);
  const [maxFileSize, setMaxFileSize] = useState(10);
  const [requireApproval, setRequireApproval] = useState(true);
  const [vipDirectPost, setVipDirectPost] = useState(true);
  const [vipThreshold] = useState(75);

  // --- Monetization & Academic ---
  const [localCurrency, setLocalCurrency] = useState("YER");
  const [localRates, setLocalRates] = useState({ SAR: 140, USD: 530 });
  const [academicYear, setAcademicYear] = useState("2023/2024");
  const [currentSemester, setCurrentSemester] = useState(1);
  const [maxLevels, setMaxLevels] = useState(4);
  const [generalDates, setGeneralDates] = useState({ s1Start: "2023-09-01", s1End: "2024-01-15", s2Start: "2024-02-10", s2End: "2024-06-30" });
  const [level1Dates, setLevel1Dates] = useState({ s1Start: "2023-10-01", s1End: "2024-01-30", s2Start: "2024-02-20", s2End: "2024-07-15" });
  const [useSpecialL1, setUseSpecialL1] = useState(true);
  const [yearHistory, setYearHistory] = useState([
    { year: "2022/2023", s1: "2022-09-01/01-10", s2: "2023-02-05/06-25", specialL1: false, status: t("مكتمل") },
    { year: "2021/2022", s1: "2021-09-15/01-30", s2: "2022-02-20/06-30", specialL1: true, status: t("مكتمل") },
  ]);

  // --- Plans Management ---
  const [plans, setPlans] = useState([]);
  const [showPlanModal, setShowPlanModal] = useState(false);
  const [editingPlan, setEditingPlan] = useState(null);
  const [planFormData, setPlanFormData] = useState({ name: '', price: '', duration_days: '30', color_hex: C.blue });

  // --- Social & Contact ---
  const [contactEmail, setContactEmail] = useState("support@elite.edu");
  const [contactPhone, setContactPhone] = useState("+967 7xx xxx xxx");
  const [links, setLinks] = useState({ fb: "facebook.com/elite", tg: "t.me/elite_edu", wa: "wa.me/..." });

  // --- Profile Editable Fields ---
  const [editableFields, setEditableFields] = useState({
    first_name: true, father_name: true, grandfather_name: true, last_name: true,
    phone: true, email: true, gender: true,
    university_id: true, college_id: true, major_id: true, academic_number: true, study_level: true
  });

  // --- System & Tech ---
  const [backupLoading, setBackupLoading] = useState(false);
  const [cacheLoading, setCacheLoading] = useState(false);
  const [smtp, setSmtp] = useState({ host:'smtp.elite.edu', port:'587', user:'admin@elite.edu', pass:'********' });

  // --- Trust & Ranking (Existing) ---
  const [editableRanks, setEditableRanks] = useState(RANKS);
  const [likesPerPoint, setLikesPerPoint] = useState(10);
  const [trustDeduct, setTrustDeduct] = useState(5);
  const [maxDislike, setMaxDislike] = useState(20);
  const [maxDislikeInput, setMaxDislikeInput] = useState("20");

  const [saved, setSaved] = useState(false);
  const token = localStorage.getItem('elite_token');
  const apiUrl = getApiUrl();

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const sRes = await fetch(`${apiUrl}/api/admin/settings`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (sRes.ok) {
        const settings = await sRes.json();
        applySettings(settings);
      }
      const pRes = await fetch(`${apiUrl}/api/admin/subscription-plans`, {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (pRes.ok) setPlans(await pRes.json());
    } catch (e) { console.error(e); }
  }

  function applySettings(data) {
    const find = (k) => data.find(s => s.key === k)?.value;
    
    // Identity
    const name = find('site_name'); if (name) setSiteName(name);
    const slogan = find('site_slogan'); if (slogan) setSiteSlogan(slogan);
    const logo = find('site_logo'); if (logo) setLogoUrl(logo);
    const color = find('primary_color'); if (color) setPrimaryColor(color);
    const maintenance = find('maintenance_mode'); if (maintenance) setMaintenanceMode(maintenance === 'true' || maintenance === '1');
    const registration = find('allow_registration'); if (registration) setAllowRegistration(registration === 'true' || registration === '1');

    // Social & Contact
    const email = find('contact_email'); if (email) setContactEmail(email);
    const phone = find('contact_phone'); if (phone) setContactPhone(phone);
    const fb = find('social_facebook'); if (fb) setLinks(prev => ({ ...prev, fb }));
    const tg = find('social_telegram'); if (tg) setLinks(prev => ({ ...prev, tg }));
    const wa = find('social_whatsapp'); if (wa) setLinks(prev => ({ ...prev, wa }));

    // Monetization
    const cur = find('selected_currency');
    const r = find('exchange_rates');
    if (cur) { setLocalCurrency(cur); setActiveCurrency(cur); }
    if (r) { try { const parsed = JSON.parse(r); setLocalRates(parsed); setExchangeRates(parsed); } catch(e){} }

    const fields = find('user_editable_fields');
    if (fields) { try { setEditableFields(JSON.parse(fields)); } catch(e){} }

    // Trust & Ranking
    const ranks = find('ranking_system');
    if (ranks) { try { setEditableRanks(JSON.parse(ranks)); } catch(e){} }

    const lpp = find('likes_per_point');
    if (lpp) setLikesPerPoint(parseInt(lpp));

    const ptsSusp = find('points_to_suspend');
    if (ptsSusp) setMaxDislike(parseInt(ptsSusp));
  }

  async function save() {
    try {
      const bulkSettings = [
        // Identity
        { key: 'site_name', value: siteName, group: 'identity' },
        { key: 'site_slogan', value: siteSlogan, group: 'identity' },
        { key: 'site_logo', value: logoUrl, group: 'identity' },
        { key: 'primary_color', value: primaryColor, group: 'identity' },
        { key: 'maintenance_mode', value: maintenanceMode ? '1' : '0', type: 'boolean', group: 'identity' },
        { key: 'allow_registration', value: allowRegistration ? '1' : '0', type: 'boolean', group: 'access' },

        // Social & Contact
        { key: 'contact_email', value: contactEmail, group: 'social' },
        { key: 'contact_phone', value: contactPhone, group: 'social' },
        { key: 'social_facebook', value: links.fb, group: 'social' },
        { key: 'social_telegram', value: links.tg, group: 'social' },
        { key: 'social_whatsapp', value: links.wa, group: 'social' },

        // Monetization
        { key: 'selected_currency', value: localCurrency, group: 'monetization' },
        { key: 'exchange_rates', value: JSON.stringify(localRates), type: 'json', group: 'monetization' },

        // User Permissions
        { key: 'user_editable_fields', value: JSON.stringify(editableFields), type: 'json', group: 'user_permissions' },

        // Trust & Ranking
        { key: 'ranking_system', value: JSON.stringify(editableRanks), type: 'json', group: 'trust' },
        { key: 'likes_per_point', value: likesPerPoint.toString(), type: 'integer', group: 'trust' },
        { key: 'points_to_suspend', value: maxDislike.toString(), type: 'integer', group: 'trust' },
      ];

      const res = await fetch(`${apiUrl}/api/admin/settings/bulk`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: bulkSettings })
      });

      if (res.ok) {
        setActiveCurrency(localCurrency);
        setExchangeRates(localRates);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);
        refreshSettings();
        alert(t("تم حفظ الإعدادات بنجاح"));
      } else {
        const err = await res.json();
        alert(t("خطأ في الحفظ: ") + (err.message || res.statusText));
      }
    } catch (e) { 
      console.error(e);
      alert(t("حدث خطأ غير متوقع أثناء الحفظ")); 
    }
  }

  const tabs = [
    { id: 'identity', label: t('الهوية والصيانة'), icon: PiMonitorDuotone, roles:['admin'] },
    { id: 'content', label: t('المحتوى والحدود'), icon: PiPaperclipDuotone, roles:['admin', 'moderator'] },
    { id: 'monetization', label: t('المالية والخطط'), icon: PiCurrencyDollarDuotone, roles:['admin'] },
    { id: 'academic', label: t('النظام الأكاديمي'), icon: PiBookOpenDuotone, roles:['admin'] },
    { id: 'social', label: t('التواصل والاجتماع'), icon: PiShareNetworkDuotone, roles:['admin'] },
    { id: 'trust', label: t('النقاط والترقية'), icon: PiStarDuotone, roles:['admin'] },
    { id: 'access', label: t('الأمان والوصول'), icon: PiShieldCheckDuotone, roles:['admin'] },
  ].filter(t => t.roles.includes(isAdmin ? 'admin' : 'moderator'));

  const renderTabContent = () => {
    switch (activeTab) {
      case 'identity':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
             <Card style={{ padding:24 }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem" }}>{t("تعريف المنصة والبراند")}</h3>
                <div className="admin-identity-row" style={{ display:'flex', alignItems:'flex-start', gap:24, marginBottom:20 }}>
                   <div style={{ flexShrink:0 }}>
                      <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:C.muted, marginBottom:8 }}>{t("شعار المنصة")}</label>
                      <input 
                        type="file" 
                        ref={fileInputRef} 
                        style={{ display:'none' }} 
                        accept="image/*" 
                        onChange={(e) => {
                          const file = e.target.files[0];
                          if (file) {
                             const reader = new FileReader();
                             reader.onloadend = () => {
                                setLogoUrl(reader.result); // Base64 string
                             };
                             reader.readAsDataURL(file);
                          }
                        }}
                      />
                      <div 
                        onClick={() => fileInputRef.current?.click()}
                        style={{ width:120, height:120, borderRadius:16, border:`2px dashed ${C.border}`, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', background:C.bg, cursor:'pointer', position:'relative', overflow:'hidden', transition:'all .2s' }}
                        onMouseOver={e => e.currentTarget.style.borderColor = C.blue}
                        onMouseOut={e => e.currentTarget.style.borderColor = C.border}
                      >
                         {logoUrl ? <img src={logoUrl} alt="Logo" style={{ width:'100%', height:'100%', objectFit:'contain' }} /> : (
                            <>
                               <PiCloudArrowUpDuotone size={32} color={C.muted}/>
                               <span style={{ fontSize:'0.7rem', color:C.muted, marginTop:4 }}>{t("رفع شعار")}</span>
                            </>
                         )}
                      </div>
                   </div>
                   <div style={{ flex:1, display:'flex', flexDirection:'column', gap:16 }}>
                      <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, alignItems:'flex-end' }}>
                         <div>
                            <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:C.muted, marginBottom:6 }}>{t("اسم الموقع")}</label>
                            <InputField value={siteName} onChange={setSiteName} placeholder={t("اسم المنصة...")} />
                         </div>
                         <div>
                            <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:C.muted, marginBottom:6 }}>{t("اللون الأساسي (Primary)")}</label>
                            <div style={{ display:'flex', gap:8 }}>
                               <input type="color" value={primaryColor} onChange={e=>setPrimaryColor(e.target.value)} style={{ width:44, height:44, padding:0, border:'none', borderRadius:8, cursor:'pointer' }} />
                               <InputField value={primaryColor} onChange={setPrimaryColor} placeholder="#2563EB" />
                            </div>
                         </div>
                      </div>
                      <div>
                         <label style={{ display:'block', fontSize:'0.85rem', fontWeight:600, color:C.muted, marginBottom:6 }}>{t("شعار المنصة (Slogan)")}</label>
                         <InputField value={siteSlogan} onChange={setSiteSlogan} placeholder="Slogan..." icon={<PiLayoutDuotone/>}/>
                      </div>
                   </div>
                </div>
             </Card>
             <Card style={{ padding:24, border:`1px solid ${maintenanceMode ? C.orange : C.border}40` }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 6px", fontSize:"1rem" }}>{t("حالة الخدمة")}</h3>
                <SettingRow label={t("وضع الصيانة العالمي")} desc={t("عند تفعيل هذا الوضع، سيتم إغلاق المنصة وعرض صفحة 'تحت الصيانة' للجميع")}>
                   <Toggle on={maintenanceMode} setOn={setMaintenanceMode} />
                </SettingRow>
             </Card>
          </div>
        );
      case 'content':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Card style={{ padding:24 }}>
              <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 14px", fontSize:"1rem" }}>{t("أنواع الملفات والحدود")}</h3>
              <div style={{ display:"flex", flexWrap:"wrap", gap:10, marginBottom:20 }}>
                {Object.entries(allowedTypes).map(([type,on])=>(
                  <div key={type} onClick={()=>setAllowedTypes(t=>({...t,[type]:!t[type]}))} style={{ padding:"10px 14px", borderRadius:12, border:`2px solid ${on?C.blue:C.border}`, background:on?C.blueLight:C.white, cursor:"pointer", display:'flex', alignItems:'center', gap:8, transition:"all .2s" }}>
                    <div style={{ fontSize:"1.2rem", display:"flex" }}>{{pdf:<PiFilePdfDuotone/>,docx:<PiFileTextDuotone/>,pptx:<PiPresentationChartDuotone/>,mp4:<PiFileVideoDuotone/>,zip:<PiFileArchiveDuotone/>}[type] || <PiPaperclipDuotone/>}</div>
                    <div style={{ fontWeight:700, fontSize:"0.8rem", color:on?C.blue:C.muted }}>.{type.toUpperCase()}</div>
                    {on && <PiCheckFatDuotone size={12} color={C.blue}/>}
                  </div>
                ))}
              </div>
              <div style={{ display:'flex', gap:10, marginBottom:24, padding:14, background:C.bg, borderRadius:12 }}>
                 <div style={{ flex:1 }}>
                    <InputField value={newExt} onChange={setNewExt} placeholder={t("أضف صيغة جديدة (مثلاً: rar)")} />
                 </div>
                 <Btn variant="secondary" onClick={() => { if(newExt){ setAllowedTypes({...allowedTypes, [newExt.toLowerCase().replace('.','')]: true}); setNewExt(""); } }}>{t("إضافة")}</Btn>
              </div>
              <SettingRow label={t("الحد الأقصى لحجم الملف")} desc={t("ميجابايت لكل ملف يتم رفعه")}>
                  <Counter val={maxFileSize} setVal={setMaxFileSize} min={1} max={100} unit="MB" />
              </SettingRow>
              <SettingRow label={t("عدد اختبارات الميول المجانية")} desc={t("عدد الاختبارات المتاحة لكل مستخدم جديد مجاناً")}>
                  <Counter val={freeTests} setVal={setFreeTests} min={0} max={50} />
              </SettingRow>
            </Card>
            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 6px", fontSize:"1rem" }}>{t("إعدادات النشر والموافقة")}</h3>
               <SettingRow label={t("موافقة المشرف مطلوبة")} desc={t("كل المواد تمر على مراجعة المشرف قبل النشر")}>
                  <Toggle on={requireApproval} setOn={setRequireApproval} />
               </SettingRow>
               <SettingRow label={t("نشر VIP مباشر بدون مراجعة")} desc={t("الطلاب الذين حصلوا على ") + vipThreshold + t("+ نقطة ينشرون مباشرة")}>
                  <Toggle on={vipDirectPost} setOn={setVipDirectPost} />
               </SettingRow>
            </Card>
          </div>
        );
      case 'monetization':
        const openModal = (plan = null) => {
          if (plan) {
            setEditingPlan(plan);
            setPlanFormData({ 
              name: plan.name, 
              price: plan.price.toString(), 
              duration_days: plan.duration_days.toString(), 
              color_hex: plan.color_hex 
            });
          } else {
            setEditingPlan(null);
            setPlanFormData({ name: '', price: '', duration_days: '30', color_hex: C.blue });
          }
          setShowPlanModal(true);
        };

        const savePlan = async (e) => {
          e.preventDefault();
          const isEdit = !!editingPlan;
          const url = isEdit ? `${apiUrl}/api/admin/subscription-plans/${editingPlan.id}` : `${apiUrl}/api/admin/subscription-plans`;
          const method = isEdit ? 'PUT' : 'POST';

          try {
            const res = await fetch(url, {
              method,
              headers: {
                'Authorization': `Bearer ${token}`,
                'Content-Type': 'application/json'
              },
              body: JSON.stringify(planFormData)
            });

            if (res.ok) {
              fetchData(); // Refresh list
              setShowPlanModal(false);
            }
          } catch (e) { alert("Error saving plan"); }
        };

        const deletePlanLocally = async (id) => {
          if (!window.confirm(t("هل أنت متأكد من حذف هذه الخطة؟"))) return;
          try {
            const res = await fetch(`${apiUrl}/api/admin/subscription-plans/${id}`, {
              method: 'DELETE',
              headers: { 'Authorization': `Bearer ${token}` }
            });
            if (res.ok) {
              setPlans(plans.filter(p => p.id !== id));
            } else {
              alert(t("حدث خطأ أثناء الحذف"));
            }
          } catch (e) { alert("Error deleting plan"); }
        };

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            {showPlanModal && (
              <div style={{ position:'fixed', top:0, left:0, width:'100%', height:'100%', background:'rgba(0,0,0,0.4)', backdropFilter:'blur(4px)', display:'flex', alignItems:'center', justifyContent:'center', zIndex:1000, padding:20 }}>
                 <Card style={{ width:450, padding:32, position:'relative' }}>
                    <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:24 }}>
                       <h2 style={{ fontWeight:900, color:C.dark, margin:0, fontSize:'1.2rem' }}>{editingPlan ? t("تعديل الخطة") : t("إضافة خطة جديدة")}</h2>
                       <button onClick={()=>setShowPlanModal(false)} style={{ background:C.bg, border:'none', width:36, height:36, borderRadius:'50%', cursor:'pointer', display:'flex', alignItems:'center', justifyContent:'center' }}><PiXDuotone/></button>
                    </div>
                    <form onSubmit={savePlan}>
                       <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                          <div>
                             <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("اسم الخطة")}</label>
                             <InputField value={planFormData.name} onChange={v=>setPlanFormData({...planFormData, name:v})} placeholder={t("شهري، سنوي...")} />
                          </div>
                          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                             <div>
                                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("السعر (بالريال اليمني)")}</label>
                                <InputField value={planFormData.price} onChange={v=>setPlanFormData({...planFormData, price:v})} placeholder="5000" type="number" />
                             </div>
                             <div>
                                <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("المدة (بالأيام)")}</label>
                                <InputField value={planFormData.duration_days} onChange={v=>setPlanFormData({...planFormData, duration_days:v})} placeholder="30" type="number" />
                             </div>
                          </div>
                          <div>
                             <label style={{ display:'block', fontSize:'0.85rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("لون الخطة")}</label>
                             <div style={{ display:'flex', flexWrap:'wrap', gap:8 }}>
                                {[C.blue, C.green, C.gold, C.orange, C.red, '#9C27B0'].map(c => (
                                   <div key={c} onClick={()=>setPlanFormData({...planFormData, color_hex:c})} style={{ width:34, height:34, borderRadius:8, background:c, cursor:'pointer', border:`2px solid ${planFormData.color_hex===c ? C.dark : 'transparent'}`, boxShadow:planFormData.color_hex===c ? '0 0 10px rgba(0,0,0,0.1)' : 'none' }} />
                                ))}
                             </div>
                          </div>
                          <Btn style={{ marginTop:12 }}>{editingPlan ? t("تحديث الخطة") : t("إنشاء الخطة")}</Btn>
                       </div>
                    </form>
                 </Card>
              </div>
            )}

            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem" }}>{t("إعدادات الدفع والاشتراك")}</h3>
               <SettingRow label={t("العملة النشطة")} desc={t("تغيير العملة سيقوم بتحويل كافة الأسعار في النظام بناءً على سعر الصرف")}>
                  <select value={localCurrency} onChange={e=>setLocalCurrency(e.target.value)} style={{ padding:'8px 12px', borderRadius:8, border:`1px solid ${C.border}`, outline:'none', fontWeight:700, color:C.dark }}>
                     <option value="YER">YER (ر.ي)</option>
                     <option value="SAR">SAR (ر.س)</option>
                     <option value="USD">USD ($)</option>
                  </select>
               </SettingRow>

               <div style={{ padding:16, borderTop:`1px solid ${C.border}60`, display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                  <div>
                     <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("سعر صرف السعودي (SAR)")}</label>
                     <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <InputField value={localRates.SAR} onChange={v => setLocalRates({...localRates, SAR: v})} placeholder="140" type="number" />
                        <span style={{ fontSize:'0.8rem', fontWeight:600, color:C.muted }}>YER</span>
                     </div>
                  </div>
                  <div>
                     <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("سعر صرف الدولار (USD)")}</label>
                     <div style={{ display:'flex', alignItems:'center', gap:8 }}>
                        <InputField value={localRates.USD} onChange={v => setLocalRates({...localRates, USD: v})} placeholder="530" type="number" />
                        <span style={{ fontSize:'0.8rem', fontWeight:600, color:C.muted }}>YER</span>
                     </div>
                  </div>
               </div>
            </Card>

            <div style={{ display:'flex', justifyContent:'flex-end', marginTop:0, marginBottom:10 }}>
               <Btn onClick={save} variant={saved?"success":"primary"} style={{ padding:'12px 30px' }}>
                  <PiCheckCircleDuotone size={18}/> {saved ? t("تم الحفظ بنجاح!") : t("حفظ إعدادات العملة والتحويل")}
               </Btn>
            </div>

            <Card style={{ padding:24 }}>
               <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                  <h3 style={{ fontWeight:800, color:C.dark, margin:0, fontSize:"1rem" }}>{t("إدارة خطط الاشتراك")}</h3>
                  <Btn onClick={() => openModal()} variant="secondary" style={{ fontSize:'0.75rem', padding:'6px 12px' }}>
                    <PiPlusCircleDuotone size={16}/> {t("إضافة خطة")}
                  </Btn>
               </div>
               <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fill, minmax(240px, 1fr))', gap:12 }}>
                  {plans.map(plan => (
                    <div key={plan.id} style={{ padding:16, borderRadius:16, border:`1.5px solid ${plan.color_hex}20`, background:C.white, display:'flex', flexDirection:'column', gap:10 }}>
                        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                           <div style={{ width:36, height:36, borderRadius:10, background:`${plan.color_hex}15`, color:plan.color_hex, display:'flex', alignItems:'center', justifyContent:'center' }}>
                              <PiClockDuotone size={18}/>
                           </div>
                           <div style={{ display:'flex', gap:6 }}>
                              <button onClick={() => openModal(plan)} style={{ background:'none', border:'none', color:C.muted, cursor:'pointer' }}><PiPencilSimpleDuotone size={16}/></button>
                              <button onClick={() => deletePlanLocally(plan.id)} style={{ background:'none', border:'none', color:C.red, cursor:'pointer' }}><PiTrashDuotone size={16}/></button>
                           </div>
                        </div>
                        <div>
                           <div style={{ fontWeight:800, color:C.dark, fontSize:'0.9rem' }}>{plan.name}</div>
                           <div style={{ fontSize:'1.2rem', fontWeight:900, color:plan.color_hex, marginTop:4 }}>{formatPrice(plan.price)}</div>
                        </div>
                        <div style={{ fontSize:'0.75rem', color:C.muted, borderTop:`1px solid ${C.border}60`, paddingTop:8 }}>
                           {plan.duration_days} {t("يوم")}
                        </div>
                    </div>
                  ))}
               </div>
            </Card>
          </div>
        );
      case 'academic':
        const DateRow = ({label, start, end, onStart, onEnd}) => (
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:20, padding:16, background:C.white, borderRadius:12, border:`1px solid ${C.border}40`, marginBottom:12 }}>
            <div style={{ gridColumn:'1 / span 2', fontWeight:800, color:C.blue, fontSize:'0.8rem', opacity:0.8 }}>{label}</div>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("بداية الترم")}</label>
              <input type="date" value={start} onChange={e=>onStart(e.target.value)} style={{ width:'100%', padding:10, borderRadius:8, border:`1px solid ${C.border}`, outline:'none', fontSize:'0.85rem' }} />
            </div>
            <div>
              <label style={{ display:'block', fontSize:'0.75rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("نهاية الترم")}</label>
              <input type="date" value={end} onChange={e=>onEnd(e.target.value)} style={{ width:'100%', padding:10, borderRadius:8, border:`1px solid ${C.border}`, outline:'none', fontSize:'0.85rem' }} />
            </div>
          </div>
        );

        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem", display:'flex', alignItems:'center', gap:10 }}>
                  <PiCalendarDuotone size={20} color={C.blue}/> {t("إدارة التقويم الدراسي")}
               </h3>
               
               <div style={{ background:C.bg, padding:20, borderRadius:16, marginBottom:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                     <div>
                        <div style={{ fontWeight:800, color:C.dark }}>{t("التقويم العام (لكافة المستويات)")}</div>
                        <div style={{ fontSize:'0.72rem', color:C.muted }}>{t("مواعيد الدراسة والامتحانات للفصلين الأول والثاني")}</div>
                     </div>
                     <div style={{ width:120 }}>
                        <InputField value={academicYear} onChange={setAcademicYear} placeholder="2024/2025" />
                     </div>
                  </div>
                  
                  <DateRow label={t("الفصل الدراسي الأول")} start={generalDates.s1Start} end={generalDates.s1End} onStart={v=>setGeneralDates({...generalDates, s1Start:v})} onEnd={v=>setGeneralDates({...generalDates, s1End:v})} />
                  <DateRow label={t("الفصل الدراسي الثاني")} start={generalDates.s2Start} end={generalDates.s2End} onStart={v=>setGeneralDates({...generalDates, s2Start:v})} onEnd={v=>setGeneralDates({...generalDates, s2End:v})} />
               </div>

               <div style={{ borderTop:`1.5px dashed ${C.border}`, paddingTop:20 }}>
                  <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:16 }}>
                     <div>
                        <div style={{ fontWeight:800, color:C.dark }}>{t("مواعيد خاصة لطلاب المستوى الأول")}</div>
                        <div style={{ fontSize:'0.72rem', color:C.muted }}>{t("تفعيل مواعيد دراسية مختلفة عن بقية المستويات")}</div>
                     </div>
                     <Toggle on={useSpecialL1} setOn={setUseSpecialL1} />
                  </div>

                  {useSpecialL1 && (
                    <div style={{ animation:'fadeIn 0.3s ease-out' }}>
                       <DateRow label={t("المستوى الأول - الفصل الأول")} start={level1Dates.s1Start} end={level1Dates.s1End} onStart={v=>setLevel1Dates({...level1Dates, s1Start:v})} onEnd={v=>setLevel1Dates({...level1Dates, s1End:v})} />
                       <DateRow label={t("المستوى الأول - الفصل الثاني")} start={level1Dates.s2Start} end={level1Dates.s2End} onStart={v=>setLevel1Dates({...level1Dates, s2Start:v})} onEnd={v=>setLevel1Dates({...level1Dates, s2End:v})} />
                    </div>
                  )}
               </div>

               <div style={{ display:'flex', alignItems:'center', gap:10, padding:'15px', background:`${C.blue}10`, borderRadius:12 }}>
                  <PiWarningDuotone size={20} color={C.blue}/>
                  <span style={{ fontSize:'0.75rem', color:C.blue, fontWeight:600 }}>
                    {t("بداية السنة الدراسية:")} {generalDates.s1Start} | {t("نهاية السنة:")} {generalDates.s2End}
                  </span>
               </div>

               <div style={{ marginTop:24, display:'flex', justifyContent:'flex-end' }}>
                  <Btn onClick={() => {
                    const newEntry = {
                      year: academicYear,
                      s1: `${generalDates.s1Start} / ${generalDates.s1End}`,
                      s2: `${generalDates.s2Start} / ${generalDates.s2End}`,
                      specialL1: useSpecialL1,
                      status: t("نشط")
                    };
                    setYearHistory([newEntry, ...yearHistory]);
                    alert(t("تم حفظ البيانات بنجاح وإضافتها إلى السجل."));
                  }} style={{ padding:'10px 30px' }}>
                    <PiCheckCircleDuotone size={18}/> {t("حفظ واعتماد السنة الدراسية")}
                  </Btn>
               </div>
            </Card>

            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 16px", fontSize:"1rem", display:'flex', alignItems:'center', gap:10 }}>
                  <PiTrendUpDuotone size={20} color={C.blue}/> {t("هيكلية المستويات الدراسية")}
               </h3>
               <SettingRow label={t("أقصى عدد من المستويات")} desc={t("تحديد عدد السنوات الدراسية التي تدعمها المنصة (مثلاً الطب 7 سنوات)")}>
                  <Counter val={maxLevels} setVal={setMaxLevels} min={1} max={10} unit={t("مستوى")} />
               </SettingRow>
               <SettingRow label={t("الفصل الدراسي النشط")} desc={t("تغيير الفصل الدراسي يغير المواد المعروضة للمستخدمين")}>
                   <div style={{ display:'flex', gap:8 }}>
                      {[1, 2].map(s => (
                         <button key={s} onClick={()=>setCurrentSemester(s)} style={{ padding:'8px 16px', borderRadius:8, border:`1px solid ${currentSemester===s ? C.blue : C.border}`, background:currentSemester===s ? C.blueLight : C.white, color:currentSemester===s ? C.blue : C.muted, fontWeight:700, cursor:'pointer' }}>
                            {t("الفصل")} {s}
                         </button>
                      ))}
                   </div>
               </SettingRow>
            </Card>

            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 16px", fontSize:"1rem", display:'flex', alignItems:'center', gap:10 }}>
                  <PiClockCounterClockwiseDuotone size={20} color={C.blue}/> {t("سجل السنوات الدراسية")}
               </h3>
               <div style={{ borderRadius:12, border:`1px solid ${C.border}`, overflow:'hidden' }}>
                  <table style={{ width:'100%', borderCollapse:'collapse', fontSize:'0.85rem' }}>
                     <thead style={{ background:C.bg, color:C.muted, textAlign:'start' }}>
                        <tr>
                           <th style={{ padding:12, fontWeight:700 }}>{t("السنة")}</th>
                           <th style={{ padding:12, fontWeight:700 }}>{t("الترم الأول")}</th>
                           <th style={{ padding:12, fontWeight:700 }}>{t("الترم الثاني")}</th>
                           <th style={{ padding:12, fontWeight:700 }}>{t("استثناء م1")}</th>
                           <th style={{ padding:12, fontWeight:700 }}>{t("الحالة")}</th>
                        </tr>
                     </thead>
                     <tbody>
                        {yearHistory.map((h, i) => (
                           <tr key={i} style={{ borderTop:`1px solid ${C.border}60` }}>
                              <td style={{ padding:12, fontWeight:800, color:C.dark }}>{h.year}</td>
                              <td style={{ padding:12, color:C.muted, fontSize:'0.75rem' }}>{h.s1}</td>
                              <td style={{ padding:12, color:C.muted, fontSize:'0.75rem' }}>{h.s2}</td>
                              <td style={{ padding:12, textAlign:'center' }}>
                                 {h.specialL1 ? <PiCheckCircleDuotone color={C.green} size={20}/> : <PiXDuotone color={C.muted} size={18}/>}
                              </td>
                              <td style={{ padding:12 }}>
                                 <Badge color={h.status === t("نشط") ? C.green : C.muted}>{h.status}</Badge>
                              </td>
                           </tr>
                        ))}
                     </tbody>
                  </table>
               </div>
            </Card>
          </div>
        );
      case 'social':
        return (
          <Card style={{ padding:24 }}>
             <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem" }}>{t("روابط التواصل والدعم")}</h3>
             <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                <InputField value={contactEmail} onChange={setContactEmail} placeholder="Email" icon={<PiEnvelopeDuotone/>}/>
                <InputField value={contactPhone} onChange={setContactPhone} placeholder="Phone" icon={<PiPhoneDuotone/>}/>
                <InputField value={links.tg} onChange={v => setLinks({...links, tg: v})} placeholder="Telegram Link" icon={<PiShareNetworkDuotone/>}/>
                <InputField value={links.fb} onChange={v => setLinks({...links, fb: v})} placeholder="Facebook Page" icon={<PiShareNetworkDuotone/>}/>
             </div>
          </Card>
        );
      case 'trust':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
            <Card style={{ padding:24 }}>
              <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
                 <h3 style={{ fontWeight:800, color:C.dark, margin:0, fontSize:"1rem" }}>{t("نظام الرتب والترقية")}</h3>
                 <div style={{ display:'flex', gap:10 }}>
                    <Btn onClick={() => {
                       const newRank = {
                          name: t("رتبة جديدة"),
                          minPts: 101,
                          maxPts: 150,
                          color: "#6366f1",
                          bg: "#eef2ff",
                          icon: 'PiStarDuotone',
                          likesNeeded: 1000,
                          borderColor: "#6366f1",
                          useColor: true,
                          useFrame: false,
                          frameUrl: ""
                       };
                       setEditableRanks([...editableRanks, newRank]);
                    }} variant="secondary" style={{ fontSize:'0.75rem', padding:'6px 12px' }}>
                       <PiPlusCircleDuotone size={16}/> {t("إضافة رتبة")}
                    </Btn>
                    <Badge color={C.blue}>{t("إعدادات تفاعلية")}</Badge>
                 </div>
              </div>
              <div style={{ display:"grid", gridTemplateColumns:"repeat(auto-fill, minmax(220px, 1fr))", gap:12, marginBottom:24 }}>
                {editableRanks.map((r, i)=>(
                  <div key={i} style={{ background:r.bg, border:`1.5px solid ${r.color}40`, borderRadius:16, padding:16, position:'relative' }}>
                    <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                       <div style={{ width:36, height:36, borderRadius:10, background:C.white, display:'flex', alignItems:'center', justifyContent:'center', color:r.color, boxShadow:`0 2px 4px ${r.color}20` }}>
                          { (typeof r.icon === 'string') ? <PiStarDuotone size={18}/> : r.icon }
                       </div>
                       <input 
                         value={r.name} 
                         onChange={e => {
                           const newRanks = [...editableRanks];
                           newRanks[i].name = e.target.value;
                           setEditableRanks(newRanks);
                         }}
                         placeholder={t("اسم الرتبة")}
                         style={{ fontWeight:800, color:r.color, background:'none', border:'none', outline:'none', width:'100%', fontSize:'0.9rem' }} 
                       />
                       {i > 0 && (
                          <button 
                            onClick={() => {
                               if (window.confirm(t("هل أنت متأكد من حذف هذه الرتبة؟"))) {
                                  setEditableRanks(editableRanks.filter((_, idx) => idx !== i));
                               }
                            }}
                            style={{ background:'none', border:'none', color:C.red, cursor:'pointer', padding:4, borderRadius:6, transition:'all .2s' }}
                            onMouseEnter={e => e.currentTarget.style.background = `${C.red}15`}
                            onMouseLeave={e => e.currentTarget.style.background = 'none'}
                          >
                             <PiTrashDuotone size={16}/>
                          </button>
                       )}
                    </div>
                    <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                       <div>
                          <label style={{ display:'block', fontSize:'0.7rem', color:C.muted, marginBottom:4, fontWeight:700 }}>{t("بداية النقاط")}</label>
                          <input type="number" value={r.minPts} onChange={e => {
                            const newRanks = [...editableRanks];
                            newRanks[i].minPts = parseInt(e.target.value) || 0;
                            setEditableRanks(newRanks);
                          }} style={{ width:'100%', padding:'8px 10px', borderRadius:8, border:`1px solid ${C.border}`, fontSize:'0.85rem', fontWeight:800, outline:'none' }} />
                       </div>
                       <div>
                          <label style={{ display:'block', fontSize:'0.7rem', color:C.muted, marginBottom:6, fontWeight:700 }}>{t("خيارات الإطار")}</label>
                          <div style={{ display:'flex', flexDirection:'column', gap:10 }}>
                             <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                <input type="color" value={r.borderColor || "#D1D5DB"} onChange={e => {
                                  const newRanks = [...editableRanks];
                                  newRanks[i].borderColor = e.target.value;
                                  setEditableRanks(newRanks);
                                }} style={{ width:28, height:28, padding:0, border:'none', borderRadius:6, cursor:'pointer' }} />
                                <span style={{ fontSize:'0.75rem', fontWeight:600, color:C.dark, flex:1 }}>{t("إطار ملون")}</span>
                                <Toggle on={r.useColor} setOn={v => {
                                  const newRanks = [...editableRanks];
                                  newRanks[i].useColor = v;
                                  setEditableRanks(newRanks);
                                }} />
                             </div>
                             
                             <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                                {/* Upload button */}
                                <div
                                  style={{
                                    width:36, height:36, borderRadius:8, cursor:'pointer',
                                    border: r.frameUrl ? `2px solid ${r.color}60` : `1.5px dashed ${C.muted}`,
                                    background: r.frameUrl ? `${r.color}10` : C.bg,
                                    display:'flex', alignItems:'center', justifyContent:'center',
                                    overflow:'hidden', flexShrink:0, transition:'all .2s'
                                  }}
                                  onClick={() => document.getElementById(`frame-upload-${i}`).click()}
                                  title={t("انقر لرفع إطار PNG")}
                                >
                                  {r.frameUrl
                                    ? <img
                                        src={r.frameUrl.startsWith('http') ? r.frameUrl : apiUrl + r.frameUrl}
                                        style={{ width:'100%', height:'100%', objectFit:'contain' }}
                                        onError={e => { e.target.style.display='none'; }}
                                        alt="frame thumb"
                                      />
                                    : <PiPaperclipDuotone size={16} color={C.muted}/>}
                                  <input
                                    type="file"
                                    id={`frame-upload-${i}`}
                                    style={{ display:'none' }}
                                    accept="image/png"
                                    onChange={async (e) => {
                                      const file = e.target.files[0];
                                      if (!file) return;
                                      const fd = new FormData();
                                      fd.append('frame', file);
                                      try {
                                        const res = await fetch(`${apiUrl}/api/admin/settings/rank-frames/upload`, {
                                          method: 'POST',
                                          headers: { 'Authorization': `Bearer ${token}` },
                                          body: fd
                                        });
                                        if (res.ok) {
                                          const data = await res.json();
                                          const newRanks = [...editableRanks];
                                          newRanks[i] = { ...newRanks[i], frameUrl: data.url, useFrame: true };
                                          setEditableRanks(newRanks);
                                        }
                                      } catch (err) { console.error('Frame upload error:', err); }
                                    }}
                                  />
                                </div>
                                <span style={{ fontSize:'0.75rem', fontWeight:600, color:C.dark, flex:1 }}>{t("إطار PNG")}</span>
                                <Toggle on={r.useFrame} setOn={v => {
                                  const newRanks = [...editableRanks];
                                  newRanks[i].useFrame = v;
                                  setEditableRanks(newRanks);
                                }} />
                             </div>

                             {/* Live Preview */}
                             <div style={{ marginTop:6, padding:10, background:C.bg, borderRadius:12, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
                                <div style={{ fontSize:'0.6rem', color:C.muted, fontWeight:700, textTransform:'uppercase', letterSpacing:1 }}>{t("معاينة")}</div>
                                <div style={{ position:'relative', width:64, height:64 }}>
                                   <div style={{
                                     position:'absolute',
                                     top: r.useFrame && r.frameUrl ? 6 : 0,
                                     left: r.useFrame && r.frameUrl ? 6 : 0,
                                     width: r.useFrame && r.frameUrl ? 52 : 64,
                                     height: r.useFrame && r.frameUrl ? 52 : 64,
                                     borderRadius:'50%', background:C.white,
                                     display:'flex', alignItems:'center', justifyContent:'center',
                                     fontWeight:900, color: r.color || C.blue, fontSize:'1.4rem',
                                     border: r.useColor && !(r.useFrame && r.frameUrl) ? `2.5px solid ${r.borderColor}` : `1px solid ${C.border}`,
                                     boxShadow: r.useColor && !(r.useFrame && r.frameUrl) ? `0 0 0 2px ${C.white}, 0 0 10px ${r.borderColor}50` : 'none',
                                   }}>م</div>
                                   {r.useFrame && r.frameUrl && (
                                     <img
                                       src={r.frameUrl.startsWith('http') ? r.frameUrl : apiUrl + r.frameUrl}
                                       style={{ position:'absolute', top:0, left:0, width:'100%', height:'100%', objectFit:'contain', pointerEvents:'none', zIndex:2 }}
                                       onError={e => { e.target.style.display='none'; }}
                                       alt="frame preview"
                                     />
                                   )}
                                </div>
                                {r.useFrame && !r.frameUrl && (
                                  <div style={{ fontSize:'0.68rem', color:C.muted, textAlign:'center' }}>{t("ارفع صورة PNG للإطار")}</div>
                                )}
                             </div>
                          </div>
                       </div>
                    </div>
                  </div>
                ))}
              </div>
              <SettingRow label={t("تحويل الإعجابات إلى نقاط")} desc={t("عدد الإعجابات التي يحصل عليها الطالب مقابل زيادة رصيده بنقطة واحدة")}>
                 <Counter val={likesPerPoint} setVal={setLikesPerPoint} min={1} max={100} unit={t("إعجاب / نقطة")} />
              </SettingRow>
              <SettingRow label={t("عدد عدم الإعجابات لخصم نقطة")} desc={t("عند وصول عدم الإعجابات لهذا العدد يُرسَل طلب للمشرف لخصم نقطة من رصيد الطالب")}>
                 <Counter val={trustDeduct} setVal={setTrustDeduct} min={1} max={50} unit={t("عدم إعجاب")} />
              </SettingRow>
            </Card>

            <Card style={{ padding:24 }}>
               <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 6px", fontSize:"1rem" }}>{t("حدود الإيقاف التلقائي")}</h3>
               <SettingRow label={t("عدد النقاط المخصومة لإيقاف الطالب")} desc={t("الحد الأقصى للنقاط المخصومة قبل تجميد الحساب تلقائياً")}>
                  <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                    <input type="number" value={maxDislike} onChange={e=>setMaxDislike(e.target.value)} style={{ width:80, padding:'8px', borderRadius:8, border:`1px solid ${C.border}`, textAlign:'center', fontWeight:800 }} />
                    <span style={{ fontSize:'0.8rem', fontWeight:600, color:C.red }}>{t("نقطة")}</span>
                  </div>
               </SettingRow>
            </Card>

            <div style={{ display:'flex', justifyContent:'flex-end' }}>
               <Btn onClick={save} variant={saved?"success":"primary"} style={{ padding:'12px 40px' }}>
                  <PiCheckCircleDuotone size={20}/> {saved ? t("تم الحفظ بنجاح!") : t("حفظ إعدادات الرتب")}
               </Btn>
            </div>
          </div>
        );
      case 'system':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
             <Card style={{ padding:24 }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem" }}>{t("إعدادات الخادم والبريد (SMTP)")}</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
                   <InputField value={smtp.host} onChange={v => setSmtp({...smtp, host:v})} placeholder="SMTP Host" icon={<PiDesktopDuotone/>}/>
                   <InputField value={smtp.port} onChange={v => setSmtp({...smtp, port:v})} placeholder="Port" />
                   <InputField value={smtp.user} onChange={v => setSmtp({...smtp, user:v})} placeholder="Username" icon={<PiUsersFourDuotone/>}/>
                   <InputField value={smtp.pass} onChange={v => setSmtp({...smtp, pass:v})} placeholder="Password" icon={<PiKeyDuotone/>}/>
                </div>
                <Btn variant="secondary" style={{ marginTop:20, width:'100%' }}>{t("اختبار اتصال البريد")}</Btn>
             </Card>
             <Card style={{ padding:24 }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem" }}>{t("أدوات الصيانة المتقدمة")}</h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                   <div style={{ padding:16, background:C.bg, borderRadius:12 }}>
                      <div style={{ fontWeight:700, marginBottom:10 }}>{t("قاعدة البيانات")}</div>
                      <Btn onClick={() => { setBackupLoading(true); setTimeout(() => setBackupLoading(false), 2000); }} disabled={backupLoading} variant="primary" style={{ width:'100%' }}>
                         {backupLoading ? t("جاري النسخ...") : <><PiDatabaseDuotone size={16}/> {t("نسخة احتياطية الآن")}</>}
                      </Btn>
                   </div>
                   <div style={{ padding:16, background:C.bg, borderRadius:12 }}>
                      <div style={{ fontWeight:700, marginBottom:10 }}>{t("تخزين الكاش (Cache)")}</div>
                      <Btn onClick={() => { setCacheLoading(true); setTimeout(() => setCacheLoading(false), 1500); }} disabled={cacheLoading} variant="secondary" style={{ width:'100%' }}>
                         {cacheLoading ? t("جاري الإفراغ...") : <><PiMagicWandDuotone size={16}/> {t("تفريغ الكاش")}</>}
                      </Btn>
                   </div>
                </div>
                <SettingRow label={t("تحسين قاعدة البيانات")} desc={t("يقوم بإعادة بناء الفهارس وتحسين أداء الاستعلامات")}>
                   <Btn variant="outline" style={{ fontSize:'0.75rem' }}>{t("بدء التحسين")}</Btn>
                </SettingRow>
             </Card>
          </div>
        );
      case 'social':
        return (
          <div style={{ display:'flex', flexDirection:'column', gap:20 }}>
             <Card style={{ padding:24 }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem", display:'flex', alignItems:'center', gap:10 }}>
                   <PiEnvelopeDuotone size={20} color={C.blue}/> {t("بيانات التواصل الأساسية")}
                </h3>
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16, marginBottom:20 }}>
                   <div>
                      <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("البريد الإلكتروني لللدعم")}</label>
                      <InputField value={contactEmail} onChange={setContactEmail} placeholder="support@elite.edu" icon={<PiEnvelopeDuotone/>}/>
                   </div>
                   <div>
                      <label style={{ display:'block', fontSize:'0.82rem', fontWeight:700, color:C.muted, marginBottom:6 }}>{t("رقم خدمة العملاء")}</label>
                      <InputField value={contactPhone} onChange={setContactPhone} placeholder="+967 7..." icon={<PiPhoneDuotone/>}/>
                   </div>
                </div>
             </Card>

             <Card style={{ padding:24 }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 20px", fontSize:"1rem", display:'flex', alignItems:'center', gap:10 }}>
                   <PiShareNetworkDuotone size={20} color={C.blue}/> {t("روابط الشبكات الاجتماعية")}
                </h3>
                <div style={{ display:'flex', flexDirection:'column', gap:16 }}>
                   <SettingRow label={t("Facebook")} desc={t("رابط صفحة الفيسبوك الرسمية")}>
                      <div style={{ width:300 }}>
                         <InputField value={links.fb} onChange={v => setLinks({...links, fb:v})} placeholder="https://facebook.com/..." />
                      </div>
                   </SettingRow>
                   <SettingRow label={t("Telegram")} desc={t("رابط قناة التيليجرام الرسمية")}>
                      <div style={{ width:300 }}>
                         <InputField value={links.tg} onChange={v => setLinks({...links, tg:v})} placeholder="https://t.me/..." />
                      </div>
                   </SettingRow>
                   <SettingRow label={t("WhatsApp")} desc={t("رابط أو رقم الواتساب المباشر")}>
                      <div style={{ width:300 }}>
                         <InputField value={links.wa} onChange={v => setLinks({...links, wa:v})} placeholder="https://wa.me/..." />
                      </div>
                   </SettingRow>
                </div>
             </Card>
          </div>
        );
      case 'access':
        return (
          <Card style={{ padding:24 }}>
             <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 6px", fontSize:"1rem" }}>{t("إعدادات الدخول والأمان")}</h3>
             <SettingRow label={t("تفعيل التسجيل العام")} desc={t("السماح للمستخدمين الجدد بإنشاء حسابات في المنصة")}>
                <Toggle on={allowRegistration} setOn={setAllowRegistration} />
             </SettingRow>
             <SettingRow label={t("طلب موافقة على سياسة الخصوصية")} desc={t("إجبار المستخدمين على قراءة السياسة قبل إتمام التسجيل")}>
                <Toggle on={true} setOn={()=>{}} />
             </SettingRow>
             <SettingRow label={t("السماح بحذف الحساب")} desc={t("إعطاء الطالب خيار حذف حسابه وبياناته نهائياً")}>
                <Toggle on={false} setOn={()=>{}} />
             </SettingRow>
             
             <div style={{ marginTop:32, paddingTop:24, borderTop:`1.5px dashed ${C.border}` }}>
                <h3 style={{ fontWeight:800, color:C.dark, margin:"0 0 6px", fontSize:"13px", display:'flex', alignItems:'center', gap:8 }}><PiLockKeyDuotone color={C.blue}/> {t("صلاحيات تعديل الملف الشخصي")}</h3>
                <p style={{ color:C.muted, fontSize:'0.78rem', marginBottom:20 }}>{t("حدد الحقول التي يمكن للمستخدمين تعديلها بأنفسهم من صفحة الإعدادات")}</p>
                
                <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:10 }}>
                   {[
                      ['first_name', t('الاسم الأول')],
                      ['father_name', t('اسم الأب')],
                      ['grandfather_name', t('اسم الجد')],
                      ['last_name', t('الاسم الأخير')],
                      ['phone', t('رقم الهاتف')],
                      ['email', t('البريد الإلكتروني')],
                      ['gender', t('النوع (الجنس)')]
                   ].map(([id, label]) => (
                      <div key={id} style={{ padding:'12px 16px', borderRadius:12, background:C.bg, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
                         <span style={{ fontSize:'0.85rem', fontWeight:700, color:C.dark }}>{label}</span>
                         <Toggle on={editableFields[id]} setOn={v => setEditableFields({...editableFields, [id]:v})} />
                      </div>
                   ))}
                </div>
             </div>
          </Card>
        );
      default: return null;
    }
  };

  const nav = tabs.length > 1 && (
    <div className="admin-settings-tabs" style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit, minmax(120px, 1fr))', gap:10, marginBottom:24 }}>
       {tabs.map(t => (
          <button 
            key={t.id} 
            onClick={() => setActiveTab(t.id)}
            style={{ 
              display:'flex', flexDirection:'column', alignItems:'center', gap:8, padding:'16px 10px', borderRadius:16, border:`1px solid ${activeTab===t.id ? C.blue : C.border}`, 
              background: activeTab===t.id ? C.blueLight : C.white, color: activeTab===t.id ? C.blue : C.muted, cursor:'pointer', transition:'all .2s'
            }}
          >
             <t.icon size={22}/>
             <span style={{ fontSize:'0.78rem', fontWeight: activeTab===t.id ? 800 : 600 }}>{t.label}</span>
          </button>
       ))}
    </div>
  );

  const mainView = (
    <div style={{ maxWidth: 840, margin:'0 auto' }}>
      <div className="admin-page-header" style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:28 }}>
         <div>
            <h1 style={{ fontSize:"1.6rem", fontWeight:800, color:C.dark, margin:"0 0 4px" }}>{isAdmin ? t("مركز إدارة المنصة") : t("إعدادات المحتوى")}</h1>
            <p style={{ color:C.muted, fontSize:"0.9rem" }}>{isAdmin ? t("تحكم كامل في كافة ميزات وإعدادات منصة النخبة") : t("إدارة حدود الرفع وأنواع الملفات المسموح بها")}</p>
         </div>
         <Btn onClick={save} variant={saved?"success":"primary"} style={{ minWidth:140 }}>{saved ? t("تم الحفظ!") : t("حفظ التغييرات")}</Btn>
      </div>

      {nav}

      <div style={{ minHeight: 400 }}>
         {renderTabContent()}
      </div>

      <div style={{ marginTop:40, padding:24, background:C.bg, borderRadius:20, display:'flex', justifyContent:'space-between', alignItems:'center' }}>
         <div>
            <div style={{ fontWeight:800, color:C.dark }}>{t("هل تحتاج للمساعدة؟")}</div>
            <div style={{ fontSize:'0.8rem', color:C.muted }}>{t("راجع دليل استخدام لوحة التحكم لمزيد من التفاصيل")}</div>
         </div>
         <Btn variant="secondary">{t("فتح دليل الاستخدام")}</Btn>
      </div>

      {/* {showPlanModal && ... } - Removed redundant modal block already handled in monetization tab */}
    </div>
  );

  return mainView;
}
