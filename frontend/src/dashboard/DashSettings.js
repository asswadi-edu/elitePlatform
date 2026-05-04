import React, { useState, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field, SearchableSelect, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { getRank } from './ranking';
import { PiSealCheckFill, PiCameraDuotone, PiWarningDuotone } from 'react-icons/pi';
import { UserContext } from '../UserContext';
import { getApiUrl } from '../api';
import UserAvatar from '../components/UserAvatar';
import { RankBadge } from './ranking';

function NotifToggles() {
  const { t } = useContext(LanguageContext);
  const items = [[t('إشعارات قبول/رفض الموارد'),true],[t('إعجابات على ملخصاتي'),true],[t('رسائل من المشرفين'),true],[t('تذكيرات الاختبارات'),false],[t('النشرة الأسبوعية'),false]];
  const [toggles, setToggles] = useState(items.map(([,v])=>v));
  return (
    <Card style={{ padding:32 }}>
      <h3 style={{ fontWeight:700, color:C.dark, marginBottom:22 }}>{t("تفضيلات الإشعارات")}</h3>
      {items.map(([l],i) => (
        <div key={l} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 0', borderBottom:`1px solid ${C.border}` }}>
          <span style={{ fontSize:'0.9rem', color:C.dark }}>{l}</span>
          <div onClick={() => setToggles(t => t.map((v,j) => j===i?!v:v))} style={{ width:44, height:24, borderRadius:12, background:toggles[i]?C.blue:C.border, cursor:'pointer', position:'relative', transition:'background .2s' }}>
            <div style={{ width:18, height:18, borderRadius:'50%', background:C.white, position:'absolute', top:3, right:toggles[i]?3:23, transition:'right .2s' }} />
          </div>
        </div>
      ))}
    </Card>
  );
}

export default function DashSettings({ setPage, isUniversity: propIsUniversity, setIsUniversity }) {
  const { user: globalUser, setUser: setGlobalUser, isUniversity: contextIsUniversity } = useContext(UserContext);
  const isUniversity = propIsUniversity !== undefined ? propIsUniversity : contextIsUniversity;
  const { t } = useContext(LanguageContext);
  const [tab, setTab] = useState(isUniversity ? 'profile' : 'university');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [user, setUser] = useState(null);
  const [editableSettings, setEditableSettings] = useState({});
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const tabs = [
    ['profile', t('الملف الشخصي')],
    ['university', t('الملف الجامعي')],
    ['security', t('الأمان')],
    ['notifications', t('الإشعارات')]
  ];

  const [formData, setFormData] = useState({
    first_name: '', father_name: '', grandfather_name: '', last_name: '',
    phone: '', email: '', gender: 'male', birth_date: ''
  });

  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [uniData, setUniData] = useState({ 
    university_id: '', college_id: '', major_id: '', 
    academic_number: '', study_level: 1 
  });
  const [unis, setUnis] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [majors, setMajors] = useState([]);

  React.useEffect(() => {
    fetchInitialData();
  }, []);

  React.useEffect(() => {
    if (uniData.college_id) {
      fetchMajors(uniData.college_id);
    } else {
      setMajors([]);
    }
  }, [uniData.college_id]);

  const fetchColleges = async () => {
    try {
      const res = await fetch(`${getApiUrl()}/api/colleges`);
      const list = await res.json();
      setColleges(list);
    } catch (e) { console.error(e); }
  };

  const fetchMajors = async (collegeId) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/majors?college_id=${collegeId}`);
      const list = await res.json();
      setMajors(list);
    } catch (e) { console.error(e); }
  };

  const handleUpdatePassword = async () => {
    if (passData.new !== passData.confirm) return setError(t("كلمات المرور الجديدة غير متطابقة"));
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/change-password`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({
          current_password: passData.current,
          new_password: passData.new
        })
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess(t("تم تغيير كلمة المرور بنجاح"));
        setPassData({ current: '', new: '', confirm: '' });
      } else {
        setError(result.message || (result.errors?.current_password?.[0]) || t("فشل تعيين كلمة المرور"));
      }
    } catch (e) {
      setError(t("كلمة المرور الحالية غير صحيحة أو هناك خطأ في الاتصال"));
    } finally {
      setSaving(false);
    }
  };

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("elite_token");
    
    try {
      // 1. Fetch User (Essential)
      const userRes = await fetch(`${getApiUrl()}/api/me`, {
        headers: { "Authorization": `Bearer ${token}` }
      });
      
      if (!userRes.ok) {
        setLoading(false);
        return;
      }
      
      const userData = await userRes.json();
      const u = userData?.user;

      if (u) {
        setUser(u);
        setGlobalUser(u);
        
        // Defensive mapping for formData
        const p = u.profile || {};
        setFormData({
          first_name: p.first_name || '',
          father_name: p.father_name || '',
          grandfather_name: p.grandfather_name || '',
          last_name: p.last_name || '',
          phone: p.phone || '',
          email: u.email || '',
          gender: p.gender === 1 ? 'male' : (p.gender === 2 ? 'female' : 'male'),
          birth_date: p.birth_date || ''
        });

        if (u.university_info) {
          setUniData({
            university_id: u.university_info.university_id || '',
            college_id: u.university_info.college_id || '',
            major_id: u.university_info.major_id || '',
            study_level: u.university_info.study_level || 1,
            academic_number: u.university_info.academic_number || '',
          });
        }
      }

      // 2. Fetch Universities
      try {
        const uniRes = await fetch(`${getApiUrl()}/api/universities`);
        if (uniRes.ok) {
          const uniList = await uniRes.json();
          if (Array.isArray(uniList)) setUnis(uniList);
        }
      } catch (e) { console.error("Unis fetch failed", e); }

      // 3. Fetch Colleges
      try {
        const collRes = await fetch(`${getApiUrl()}/api/colleges`);
        if (collRes.ok) {
          const collList = await collRes.json();
          if (Array.isArray(collList)) setColleges(collList);
        }
      } catch (e) { console.error("Colleges fetch failed", e); }

      // 4. Fetch Settings
      try {
        const settingsRes = await fetch(`${getApiUrl()}/api/settings`);
        if (settingsRes.ok) {
          const allSettings = await settingsRes.json();
          if (Array.isArray(allSettings)) {
            const editableFields = allSettings.find(s => s.key === 'user_editable_fields');
            if (editableFields) {
              try {
                setEditableSettings(JSON.parse(editableFields.value));
              } catch(e) { 
                // Fallback if already an object
                if (typeof editableFields.value === 'object') setEditableSettings(editableFields.value);
              }
            }
          }
        }
      } catch (e) { console.error("Settings fetch failed", e); }

    } catch (e) {
      console.error("Initial data load failed", e);
      setError(t("حدث خطأ أثناء تحميل البيانات"));
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateProfile = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(t("تم تحديث الملف الشخصي بنجاح"));
        setUser(data.user);
        setGlobalUser(data.user);
      } else {
        setError(data.message || t("حدث خطأ أثناء التحديث"));
      }
    } catch (e) {
      setError(t("خطأ في الاتصال بالخادم"));
    } finally {
      setSaving(false);
    }
  };

  const handleAvatarUpload = async (e) => {
    const file = e.target.files[0];
    if (!file) return;

    const token = localStorage.getItem("elite_token");
    const data = new FormData();
    data.append('avatar', file);

    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/upload-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` },
        body: data
      });
      const result = await res.json();
      if (res.ok) {
        const newUser = { ...user, profile: { ...user.profile, avatar_url: result.avatar_url } };
        setUser(newUser);
        setGlobalUser(newUser);
        setSuccess(t("تم رفع الصورة بنجاح"));
      } else {
        const errMsg = result.errors?.avatar?.[0] || result.message || t("فشل رفع الصورة");
        setError(errMsg);
      }
    } catch (e) {
      setError(t("خطأ أثناء الرفع"));
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm(t("هل أنت متأكد من حذف الصورة الشخصية؟"))) return;
    const token = localStorage.getItem("elite_token");
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/delete-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        const newUser = { ...user, profile: { ...user.profile, avatar_url: null } };
        setUser(newUser);
        setGlobalUser(newUser);
        setSuccess(t("تم حذف الصورة بنجاح"));
      } else {
        const result = await res.json();
        setError(result.message || t("فشل حذف الصورة"));
      }
    } catch (e) {
      setError(t("خطأ أثناء الحذف"));
    } finally {
      setSaving(false);
    }
  };

  const handleUpdateUniversity = async () => {
    setSaving(true);
    setError("");
    setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/university-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(uniData)
      });
      const result = await res.json();
      if (res.ok) {
        setSuccess(t("تم تحديث بيانات الجامعة بنجاح"));
        setGlobalUser(result.user);
        setUser(result.user);
      } else {
        setError(result.message || t("فشل تحديث البيانات"));
      }
    } catch (e) {
      setError(t("خطأ في الاتصال بالسيرفر"));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <DashboardLayout activeSub="settings" setPage={setPage} isUniversity={isUniversity}>
      <Card style={{ padding: 32, maxWidth: 580 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28 }}>
          <Skeleton width="80px" height="80px" borderRadius="50%" />
          <div>
            <Skeleton width="150px" height="24px" margin="0 0 8px" />
            <Skeleton width="100px" height="16px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
          {[1, 2, 3, 4].map(i => (
            <div key={i}>
              <Skeleton width="60px" height="14px" margin="0 0 8px" />
              <Skeleton width="100%" height="42px" />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 24 }}>
          <Skeleton width="120px" height="42px" />
        </div>
      </Card>
    </DashboardLayout>
  );

  if (!user) return (
    <DashboardLayout activeSub="settings" setPage={setPage} isUniversity={isUniversity}>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '60vh', gap: 20 }}>
        <PiWarningDuotone size={64} color={C.orange} />
        <div style={{ fontSize: '1.2rem', fontWeight: 700, color: C.dark }}>{t("حدث خطأ في تحميل بيانات المستخدم")}</div>
        <p style={{ color: C.muted }}>{t("يرجى التأكد من تسجيل الدخول والمحاولة مرة أخرى")}</p>
        <Btn onClick={() => setPage('login')}>{t("تسجيل الدخول")}</Btn>
      </div>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeSub="settings" setPage={setPage} isUniversity={isUniversity}>
      <div style={{ marginBottom: 28 }}><h1 style={{ fontSize: '1.4rem', fontWeight: 800, color: C.dark, margin: '0 0 6px' }}>{t("إعدادات الحساب")}</h1><p style={{ color: C.muted, fontSize: '0.88rem' }}>{t("إدارة معلوماتك الشخصية وإعدادات الحساب")}</p></div>
      <div style={{ display: 'flex', gap: 0, borderBottom: `1px solid ${C.border}`, marginBottom: 28, overflowX: 'auto' }}>
        {tabs.map(([id, l]) => (
          <div key={id} onClick={() => setTab(id)}
            style={{ padding: '10px 24px', cursor: 'pointer', fontWeight: tab === id ? 700 : 400, color: tab === id ? C.blue : C.muted, borderBottom: `2px solid ${tab === id ? C.blue : 'transparent'}`, marginBottom: -1, fontSize: '0.9rem', whiteSpace: 'nowrap' }}>
            {l}
            {!isUniversity && id === 'university' && <span style={{ marginInlineStart: 8, background: C.red, color: C.white, borderRadius: 10, padding: "1px 6px", fontSize: "0.65rem", fontWeight: 700 }}>!</span>}
          </div>
        ))}
      </div>
      <div style={{ maxWidth: 580 }}>
        {tab === 'profile' && (
          <Card style={{ padding: 32 }}>
            {error && <div style={{ color: C.red, background: C.redBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{success}</div>}

            <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 28, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
              <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-input').click()}>
                <UserAvatar user={user} size={80} />
                <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />
                <div style={{ position: 'absolute', bottom: 0, right: 0, background: C.blue, color: C.white, width: 24, height: 24, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: "center", fontSize: '0.8rem', border: `2px solid ${C.white}`, zIndex: 5 }}>
                  <PiCameraDuotone />
                </div>
              </div>
              <div>
                <div style={{ fontWeight: 800, color: C.dark, marginBottom: 4, display: 'flex', alignItems: 'center', gap: 6 }}>
                  {user.profile?.first_name} {user.profile?.last_name}
                  {user.is_trusted && <PiSealCheckFill size={18} color={C.blue} title={t("موثق")} />}
                </div>
                <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom:12 }}>
                  <div style={{ fontSize: '0.75rem', color: C.muted }}>{user.roles && user.roles.length > 0 && user.roles[0].name === 'admin' ? t("مسؤول النظام") : user.is_university ? t("طالب جامعي") : t("طالب ثانوي")}</div>
                  <RankBadge points={user.points?.balance || 0} />
                </div>
                <div style={{ display: 'flex', gap: 10 }}>
                  <Btn variant="ghost" style={{ fontSize: '0.82rem', padding: '7px 14px' }} onClick={() => document.getElementById('avatar-input').click()}>{t("تغيير الصورة")}</Btn>
                  {user.profile?.avatar_url && (
                    <Btn variant="secondary" style={{ fontSize: '0.82rem', padding: '7px 14px' }} onClick={handleDeleteAvatar}>{t("حذف")}</Btn>
                  )}
                </div>
              </div>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
              {[
                ['first_name', t('الاسم الأول')],
                ['father_name', t('اسم الأب')],
                ['grandfather_name', t('اسم الجد')],
                ['last_name', t('الاسم الأخير')]
              ].map(([key, label]) => (
                <Field key={key} label={label}>
                  <input
                    value={formData[key]}
                    onChange={e => setFormData({ ...formData, [key]: e.target.value })}
                    disabled={editableSettings[key] === false}
                    style={{ ...inputStyle, opacity: editableSettings[key] === false ? 0.6 : 1 }}
                    onFocus={e => e.target.style.borderColor = C.blue}
                    onBlur={e => e.target.style.borderColor = C.border}
                  />
                </Field>
              ))}
            </div>

            <Field label={t("النوع (الجنس)")}>
              <select
                value={formData.gender}
                onChange={e => setFormData({ ...formData, gender: e.target.value })}
                disabled={editableSettings.gender === false}
                style={{ ...inputStyle, background: C.white, opacity: editableSettings.gender === false ? 0.6 : 1 }}
              >
                <option value="male">{t("ذكر")}</option>
                <option value="female">{t("أنثى")}</option>
              </select>
            </Field>

            <Field label={t("رقم الهاتف")}>
              <input
                value={formData.phone}
                onChange={e => setFormData({ ...formData, phone: e.target.value })}
                disabled={editableSettings.phone === false}
                style={{ ...inputStyle, opacity: editableSettings.phone === false ? 0.6 : 1 }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </Field>

            <Field label={t("تاريخ الميلاد")}>
              <input
                type="date"
                value={formData.birth_date}
                onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
                disabled={editableSettings.birth_date === false}
                style={{ ...inputStyle, opacity: editableSettings.birth_date === false ? 0.6 : 1 }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </Field>

            <Field label={t("البريد الإلكتروني")}>
              <input
                value={formData.email}
                onChange={e => setFormData({ ...formData, email: e.target.value })}
                disabled={editableSettings.email === false}
                style={{ ...inputStyle, opacity: editableSettings.email === false ? 0.6 : 1 }}
                onFocus={e => e.target.style.borderColor = C.blue}
                onBlur={e => e.target.style.borderColor = C.border}
              />
            </Field>

            <div style={{ marginTop: 8 }}>
              <Btn onClick={handleUpdateProfile} disabled={saving}>
                {saving ? t("جاري الحفظ...") : t("← حفظ التغييرات")}
              </Btn>
            </div>
            {!Object.values(editableSettings).every(v=>v) && (
               <p style={{ marginTop:16, fontSize:'0.75rem', color:C.muted, textAlign:'center' }}>
                 {t("بعض الحقول مقفلة من قبل الإدارة. للتعديل، يرجى التواصل مع الدعم.")}
               </p>
            )}
          </Card>
        )}
        {tab === 'university' && (
          <Card style={{ padding: 32 }}>
            {error && <div style={{ color: C.red, background: C.redBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{success}</div>}

            <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 10 }}>{t("بيانات الطالب الجامعي")}</h3>
            <p style={{ color: C.muted, fontSize: '0.84rem', marginBottom: 24 }}>{t("أكمل هذه البيانات لتفعيل ميزات المواد الأكاديمية والاختبارات")}</p>

            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 14 }}>
              <Field label={t("الجامعة")}>
                <SearchableSelect 
                  value={uniData.university_id} 
                  onChange={id => setUniData({ ...uniData, university_id: id })} 
                  options={unis}
                  placeholder={t("اختر الجامعة")}
                  disabled={editableSettings.university_id === false}
                  t={t}
                />
              </Field>

              <Field label={t("الكلية")}>
                <SearchableSelect 
                  value={uniData.college_id} 
                  onChange={id => setUniData({ ...uniData, college_id: id, major_id: '' })} 
                  options={colleges}
                  placeholder={t("اختر الكلية")}
                  disabled={editableSettings.college_id === false}
                  t={t}
                />
              </Field>

              <Field label={t("التخصص")}>
                <SearchableSelect 
                  value={uniData.major_id} 
                  onChange={id => setUniData({ ...uniData, major_id: id })} 
                  options={majors}
                  placeholder={t("اختر التخصص")}
                  disabled={!uniData.college_id || editableSettings.major_id === false}
                  t={t}
                />
              </Field>

              <Field label={t("المستوى الدراسي")}>
                <select 
                  value={uniData.study_level} 
                  onChange={e => setUniData({ ...uniData, study_level: e.target.value })} 
                  disabled={editableSettings.study_level === false}
                  style={{ ...inputStyle, background: C.white, opacity: editableSettings.study_level === false ? 0.6 : 1 }}
                >
                  {[1, 2, 3, 4, 5, 6, 7, 8].map(l => (
                    <option key={l} value={l}>{t("المستوى")} {l}</option>
                  ))}
                </select>
              </Field>

              <Field label={t("الرقم الأكاديمي")}>
                <input 
                  value={uniData.academic_number} 
                  onChange={e => setUniData({ ...uniData, academic_number: e.target.value })} 
                  placeholder="XXXXXXXXXX" 
                  disabled={editableSettings.academic_number === false}
                  style={{ ...inputStyle, opacity: editableSettings.academic_number === false ? 0.6 : 1 }} 
                  onFocus={e => e.target.style.borderColor = C.blue} 
                  onBlur={e => e.target.style.borderColor = C.border} 
                />
              </Field>
            </div>

            <div style={{ marginTop: 24 }}>
              <Btn style={{ width: '100%' }} onClick={handleUpdateUniversity} disabled={saving || !uniData.university_id || !uniData.major_id}>
                {saving ? t("جاري الحفظ...") : (isUniversity ? t("تحديث بيانات الجامعة") : t("تفعيل حساب الطالب الجامعي"))}
              </Btn>
            </div>
            {!Object.values(editableSettings).every(v=>v) && (
               <p style={{ marginTop:16, fontSize:'0.75rem', color:C.muted, textAlign:'center' }}>
                 {t("بعض الحقول مقفلة من قبل الإدارة. للتعديل، يرجى التواصل مع الدعم.")}
               </p>
            )}
          </Card>
        )}
        {tab === 'security' && (
          <Card style={{ padding: 32 }}>
            {error && <div style={{ color: C.red, background: C.redBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{error}</div>}
            {success && <div style={{ color: C.green, background: C.greenBg, padding: 12, borderRadius: 8, marginBottom: 20, fontSize: '0.85rem' }}>{success}</div>}

            <h3 style={{ fontWeight: 700, color: C.dark, marginBottom: 22 }}>{t("تغيير كلمة المرور")}</h3>
            <Field label={t("كلمة المرور الحالية")}>
              <input 
                type="password" 
                value={passData.current}
                onChange={e => setPassData({ ...passData, current: e.target.value })}
                placeholder="••••••••" 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = C.blue} 
                onBlur={e => e.target.style.borderColor = C.border} 
              />
            </Field>
            <Field label={t("كلمة المرور الجديدة")}>
              <input 
                type="password" 
                value={passData.new}
                onChange={e => setPassData({ ...passData, new: e.target.value })}
                placeholder="••••••••" 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = C.blue} 
                onBlur={e => e.target.style.borderColor = C.border} 
              />
            </Field>
            <Field label={t("تأكيد كلمة المرور الجديدة")}>
              <input 
                type="password" 
                value={passData.confirm}
                onChange={e => setPassData({ ...passData, confirm: e.target.value })}
                placeholder="••••••••" 
                style={inputStyle} 
                onFocus={e => e.target.style.borderColor = C.blue} 
                onBlur={e => e.target.style.borderColor = C.border} 
              />
            </Field>
            <Btn onClick={handleUpdatePassword} disabled={saving || !passData.current || !passData.new}>
              {saving ? t("جاري التحديث...") : t("← تحديث كلمة المرور")}
            </Btn>
          </Card>
        )}
        {tab === 'notifications' && <NotifToggles />}
      </div>
    </DashboardLayout>
  );
}
