import React, { useState, useEffect, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field, SearchableSelect, Skeleton } from '../components/Common';
import DashboardLayout from '../layouts/DashboardLayout';
import { LanguageContext } from '../LanguageContext';
import { UserContext } from '../UserContext';
import { getApiUrl } from '../api';
import UserAvatar from '../components/UserAvatar';
import { RankBadge } from './ranking';
import { PiSealCheckFill, PiCameraDuotone, PiWarningDuotone, PiUserDuotone, PiGraduationCapDuotone, PiShieldCheckDuotone, PiBellDuotone } from 'react-icons/pi';

/* ─── Sub-Components ─── */

function ProfileTab({ user, formData, setFormData, editableSettings, saving, handleUpdateProfile, handleAvatarUpload, handleDeleteAvatar, t }) {
  const fields = [
    { key: 'first_name', label: t('الاسم الأول') },
    { key: 'father_name', label: t('اسم الأب') },
    { key: 'grandfather_name', label: t('اسم الجد') },
    { key: 'last_name', label: t('الاسم الأخير') },
  ];

  return (
    <Card style={{ padding: 32 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginBottom: 32, paddingBottom: 24, borderBottom: `1px solid ${C.border}` }}>
        <div style={{ position: 'relative', cursor: 'pointer' }} onClick={() => document.getElementById('avatar-input').click()}>
          <UserAvatar user={user} size={90} />
          <input type="file" id="avatar-input" hidden accept="image/*" onChange={handleAvatarUpload} />
          <div style={{ position: 'absolute', bottom: 2, right: 2, background: C.blue, color: C.white, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: "center", fontSize: '0.9rem', border: `2px solid ${C.white}`, boxShadow: '0 4px 10px rgba(0,0,0,0.1)', zIndex: 5 }}>
            <PiCameraDuotone />
          </div>
        </div>
        <div>
          <h2 style={{ fontWeight: 800, color: C.dark, marginBottom: 6, display: 'flex', alignItems: 'center', gap: 8, fontSize: '1.25rem' }}>
            {user.profile?.first_name} {user.profile?.last_name}
            {user.is_trusted && <PiSealCheckFill size={20} color={C.blue} title={t("موثق")} />}
          </h2>
          <div style={{ display:'flex', alignItems:'center', gap:10, marginBottom: 16 }}>
            <p style={{ fontSize: '0.85rem', color: C.muted, margin:0 }}>{user.is_university ? t("طالب جامعي") : t("طالب ثانوي")}</p>
            <RankBadge points={user.points?.balance || 0} />
          </div>
          <div style={{ display: 'flex', gap: 10 }}>
            <Btn variant="ghost" style={{ fontSize: '0.8rem', padding: '6px 14px' }} onClick={() => document.getElementById('avatar-input').click()}>{t("تغيير الصورة")}</Btn>
            {user.profile?.avatar_url && (
              <Btn variant="secondary" style={{ fontSize: '0.8rem', padding: '6px 14px', color: C.red }} onClick={handleDeleteAvatar}>{t("حذف")}</Btn>
            )}
          </div>
        </div>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(240px, 1fr))', gap: 20, marginBottom: 24 }}>
        {fields.map(f => (
          <Field key={f.key} label={f.label}>
            <input
              value={formData[f.key] || ''}
              onChange={e => setFormData({ ...formData, [f.key]: e.target.value })}
              disabled={editableSettings[f.key] === false}
              style={{ ...inputStyle, opacity: editableSettings[f.key] === false ? 0.6 : 1 }}
              onFocus={e => e.target.style.borderColor = C.blue}
              onBlur={e => e.target.style.borderColor = C.border}
            />
          </Field>
        ))}
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
        <Field label={t("النوع (الجنس)")}>
          <select
            value={formData.gender || 'male'}
            onChange={e => setFormData({ ...formData, gender: e.target.value })}
            disabled={editableSettings.gender === false}
            style={{ ...inputStyle, background: C.white, opacity: editableSettings.gender === false ? 0.6 : 1 }}
          >
            <option value="male">{t("ذكر")}</option>
            <option value="female">{t("أنثى")}</option>
          </select>
        </Field>

        <Field label={t("تاريخ الميلاد")}>
          <input
            type="date"
            value={formData.birth_date || ''}
            onChange={e => setFormData({ ...formData, birth_date: e.target.value })}
            disabled={editableSettings.birth_date === false}
            style={{ ...inputStyle, opacity: editableSettings.birth_date === false ? 0.6 : 1 }}
            onFocus={e => e.target.style.borderColor = C.blue}
            onBlur={e => e.target.style.borderColor = C.border}
          />
        </Field>
      </div>

      <Field label={t("رقم الهاتف")}>
        <input
          value={formData.phone || ''}
          onChange={e => setFormData({ ...formData, phone: e.target.value })}
          disabled={editableSettings.phone === false}
          style={{ ...inputStyle, opacity: editableSettings.phone === false ? 0.6 : 1 }}
          onFocus={e => e.target.style.borderColor = C.blue}
          onBlur={e => e.target.style.borderColor = C.border}
        />
      </Field>

      <div style={{ marginTop: 32, padding: 12, background: C.bg, borderRadius: 12, border: `1px solid ${C.border}`, display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
        <div style={{ width: 40, height: 40, borderRadius: '50%', background: C.white, display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 2px 5px rgba(0,0,0,0.05)' }}>
          📧
        </div>
        <div style={{ flex: 1 }}>
          <div style={{ fontSize: '0.75rem', color: C.muted, fontWeight: 700 }}>{t("البريد الإلكتروني")}</div>
          <div style={{ fontSize: '0.9rem', color: C.dark, fontWeight: 600 }}>{formData.email}</div>
        </div>
        <span style={{ fontSize: '0.7rem', color: C.muted, fontStyle: 'italic' }}>{t("لا يمكن تعديله حالياً")}</span>
      </div>

      <Btn onClick={handleUpdateProfile} disabled={saving} style={{ width: '100%', height: 48 }}>
        {saving ? t("جاري الحفظ...") : t("← حفظ التغييرات")}
      </Btn>
    </Card>
  );
}

function UniversityTab({ uniData, setUniData, unis, colleges, majors, editableSettings, saving, handleUpdateUniversity, t }) {
  return (
    <Card style={{ padding: 32 }}>
       <div style={{ marginBottom: 24 }}>
          <h3 style={{ fontWeight: 800, color: C.dark, marginBottom: 8, fontSize: '1.2rem' }}>{t("بيانات الطالب الجامعي")}</h3>
          <p style={{ color: C.muted, fontSize: '0.88rem' }}>{t("أكمل هذه البيانات لتفعيل ميزات المواد الأكاديمية والاختبارات المخصصة لك.")}</p>
       </div>

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginBottom: 20 }}>
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
       </div>

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

       <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20, marginTop: 20, marginBottom: 32 }}>
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

       <Btn style={{ width: '100%', height: 48 }} onClick={handleUpdateUniversity} disabled={saving || !uniData.university_id || !uniData.major_id}>
          {saving ? t("جاري الحفظ...") : t("← تحديث البيانات الجامعية")}
       </Btn>
    </Card>
  );
}

function SecurityTab({ passData, setPassData, saving, handleUpdatePassword, t }) {
  return (
    <Card style={{ padding: 32 }}>
      <div style={{ marginBottom: 28 }}>
        <h3 style={{ fontWeight: 800, color: C.dark, marginBottom: 8, fontSize: '1.2rem' }}>{t("تحديث كلمة المرور")}</h3>
        <p style={{ color: C.muted, fontSize: '0.88rem' }}>{t("تأكد من استخدام كلمة مرور قوية تحتوي على حروف وأرقام.")}</p>
      </div>

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

      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginTop: 10 }}>
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
        <Field label={t("تأكيد كلمة المرور")}>
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
      </div>

      <div style={{ marginTop: 32 }}>
        <Btn onClick={handleUpdatePassword} disabled={saving || !passData.current || !passData.new} style={{ width: '100%', height: 48 }}>
          {saving ? t("جاري التحديث...") : t("تحديث كلمة المرور")}
        </Btn>
      </div>
    </Card>
  );
}

/* ─── Main Component ─── */

export default function DashAccountSettings({ setPage, isUniversity: propIsUniversity, setIsUniversity }) {
  const { user: globalUser, setUser: setGlobalUser, isUniversity: contextIsUniversity, logout: handleLogout } = useContext(UserContext);
  const isUniversity = propIsUniversity !== undefined ? propIsUniversity : contextIsUniversity;
  const { t } = useContext(LanguageContext);
  
  const [tab, setTab] = useState('profile');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const [formData, setFormData] = useState({
    first_name: '', father_name: '', grandfather_name: '', last_name: '',
    phone: '', email: '', gender: 'male', birth_date: ''
  });
  const [uniData, setUniData] = useState({ 
    university_id: '', college_id: '', major_id: '', 
    academic_number: '', study_level: 1 
  });
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [editableSettings, setEditableSettings] = useState({});
  
  const [unis, setUnis] = useState([]);
  const [colleges, setColleges] = useState([]);
  const [majors, setMajors] = useState([]);

  useEffect(() => {
    fetchInitialData();
  }, []);

  useEffect(() => {
    if (uniData.college_id) fetchMajors(uniData.college_id);
    else setMajors([]);
  }, [uniData.college_id]);

  const fetchInitialData = async () => {
    setLoading(true);
    setError("");
    const token = localStorage.getItem("elite_token");
    const apiUrl = getApiUrl();

    try {
      // 1. Fetch User
      const userRes = await fetch(`${apiUrl}/api/me`, { headers: { "Authorization": `Bearer ${token}` } });
      if (!userRes.ok) { setLoading(false); return; }
      const userData = await userRes.json();
      const u = userData?.user;

      if (u) {
        setFormData({
          first_name: u.profile?.first_name || '',
          father_name: u.profile?.father_name || '',
          grandfather_name: u.profile?.grandfather_name || '',
          last_name: u.profile?.last_name || '',
          phone: u.profile?.phone || '',
          email: u.email || '',
          gender: u.profile?.gender === 1 ? 'male' : (u.profile?.gender === 2 ? 'female' : 'male'),
          birth_date: u.profile?.birth_date || ''
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

      // Parallel secondary fetches (non-blocking)
      const fetchSecondary = async () => {
        try {
          const [uRes, cRes, sRes] = await Promise.all([
            fetch(`${apiUrl}/api/universities`),
            fetch(`${apiUrl}/api/colleges`),
            fetch(`${apiUrl}/api/settings`)
          ]);

          if (uRes.ok) setUnis(await uRes.json());
          if (cRes.ok) setColleges(await cRes.json());
          if (sRes.ok) {
            const sets = await sRes.json();
            const editable = sets.find(s => s.key === 'user_editable_fields');
            if (editable) {
              try { setEditableSettings(JSON.parse(editable.value)); }
              catch(e) { if (typeof editable.value === 'object') setEditableSettings(editable.value); }
            }
          }
        } catch (e) { console.error("Secondary fetch error", e); }
      };
      
      fetchSecondary();
      setLoading(false);

    } catch (e) { 
        console.error("Settings load failed", e); 
        setError(t("خطأ في تحميل البيانات")); 
        setLoading(false);
    }
  };

  const fetchMajors = async (collegeId) => {
    try {
      const res = await fetch(`${getApiUrl()}/api/majors?college_id=${collegeId}`);
      if (res.ok) setMajors(await res.json());
    } catch (e) { console.error(e); }
  };

  const handleUpdateProfile = async () => {
    setSaving(true); setError(""); setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(formData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(t("تم تحديث الملف الشخصي بنجاح"));
        setGlobalUser(data.user);
      } else setError(data.message || t("حدث خطأ أثناء التحديث"));
    } catch (e) { setError(t("خطأ في الاتصال بالخادم")); }
    finally { setSaving(false); }
  };

  const handleUpdateUniversity = async () => {
    setSaving(true); setError(""); setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/university-update`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify(uniData)
      });
      const data = await res.json();
      if (res.ok) {
        setSuccess(t("تم تحديث البيانات الجامعية بنجاح"));
        setGlobalUser(data.user);
      } else setError(data.message || t("فشل التحديث"));
    } catch (e) { setError(t("خطأ في الاتصال")); }
    finally { setSaving(false); }
  };

  const handleUpdatePassword = async () => {
    if (passData.new !== passData.confirm) return setError(t("كلمات المرور غير متطابقة"));
    setSaving(true); setError(""); setSuccess("");
    const token = localStorage.getItem("elite_token");
    try {
      const res = await fetch(`${getApiUrl()}/api/change-password`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
        body: JSON.stringify({ current_password: passData.current, new_password: passData.new })
      });
      if (res.ok) {
        setSuccess(t("تم تغيير كلمة المرور بنجاح"));
        setPassData({ current: '', new: '', confirm: '' });
      } else {
        const result = await res.json();
        setError(result.message || t("فشل تغيير كلمة المرور"));
      }
    } catch (e) { setError(t("كلمة المرور الحالية غير صحيحة")); }
    finally { setSaving(false); }
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
        setGlobalUser({ ...globalUser, profile: { ...globalUser.profile, avatar_url: result.avatar_url } });
        setSuccess(t("تم رفع الصورة بنجاح"));
      } else setError(result.message || t("فشل الرفع"));
    } catch (e) { setError(t("خطأ أثناء الرفع")); }
    finally { setSaving(false); }
  };

  const handleDeleteAvatar = async () => {
    if (!window.confirm(t("حذف الصورة؟"))) return;
    const token = localStorage.getItem("elite_token");
    setSaving(true);
    try {
      const res = await fetch(`${getApiUrl()}/api/profile/delete-avatar`, {
        method: 'POST',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (res.ok) {
        setGlobalUser({ ...globalUser, profile: { ...globalUser.profile, avatar_url: null } });
        setSuccess(t("تم حذف الصورة"));
      }
    } catch (e) { setError(t("خطأ أثناء الحذف")); }
    finally { setSaving(false); }
  };

  const tabList = [
    { id: 'profile', label: t('الملف الشخصي'), icon: <PiUserDuotone /> },
    { id: 'university', label: t('الملف الجامعي'), icon: <PiGraduationCapDuotone />, warning: !isUniversity },
    { id: 'security', label: t('الأمان'), icon: <PiShieldCheckDuotone /> },
    { id: 'notifs', label: t('الإشعارات'), icon: <PiBellDuotone /> },
  ];

  /* ─── Render States ─── */

  if (loading) return (
    <DashboardLayout activeSub="settings" setPage={setPage} isUniversity={isUniversity} onLogout={handleLogout}>
      <Card style={{ padding: 32, maxWidth: 650, margin: '0 auto' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 20, marginBottom: 32 }}>
          <Skeleton width="90px" height="90px" borderRadius="50%" />
          <div style={{ flex: 1 }}>
            <Skeleton width="200px" height="28px" margin="0 0 10px" />
            <Skeleton width="120px" height="18px" />
          </div>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          {[1, 2, 3, 4, 5, 6].map(i => (
            <div key={i}>
              <Skeleton width="80px" height="15px" margin="0 0 8px" />
              <Skeleton width="100%" height="45px" borderRadius="10px" />
            </div>
          ))}
        </div>
        <div style={{ marginTop: 32 }}>
           <Skeleton width="100%" height="50px" borderRadius="12px" />
        </div>
      </Card>
    </DashboardLayout>
  );

  return (
    <DashboardLayout activeSub="settings" setPage={setPage} isUniversity={isUniversity} onLogout={handleLogout}>
      <div style={{ maxWidth: 800, margin: '0 auto' }}>
        <div style={{ marginBottom: 32 }}>
          <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: C.dark, margin: '0 0 8px' }}>{t("إعدادات الحساب")}</h1>
          <p style={{ color: C.muted, fontSize: '0.92rem' }}>{t("إدارة معلوماتك الشخصية، البيانات الجامعية، وإعدادات الأمان.")}</p>
        </div>

        <div style={{ display: 'flex', gap: 8, marginBottom: 28, background: C.white, padding: 6, borderRadius: 16, border: `1px solid ${C.border}`, overflowX: 'auto' }}>
          {tabList.map(tItem => (
            <div 
              key={tItem.id} 
              onClick={() => setTab(tItem.id)}
              style={{ 
                padding: '10px 20px', cursor: 'pointer', borderRadius: 12, fontSize: '0.88rem', fontWeight: 700,
                display: 'flex', alignItems: 'center', gap: 10, whiteSpace: 'nowrap', transition: 'all 0.2s',
                background: tab === tItem.id ? C.blue : 'transparent',
                color: tab === tItem.id ? C.white : C.muted
              }}
            >
              <span style={{ fontSize: '1.1rem' }}>{tItem.icon}</span>
              {tItem.label}
              {tItem.warning && <span style={{ width: 6, height: 6, borderRadius: '50%', background: C.red }} />}
            </div>
          ))}
        </div>

        {error && <div style={{ color: C.red, background: '#FFF5F5', padding: '14px 20px', borderRadius: 12, marginBottom: 24, fontSize: '0.88rem', border: `1px solid ${C.red}15`, display: 'flex', alignItems: 'center', gap: 10 }}><PiWarningDuotone size={18}/>{error}</div>}
        {success && <div style={{ color: C.green, background: '#F0FFF4', padding: '14px 20px', borderRadius: 12, marginBottom: 24, fontSize: '0.88rem', border: `1px solid ${C.green}15`, display: 'flex', alignItems: 'center', gap: 10 }}>✅ {success}</div>}

        <div className="settings-content-anim" key={tab}>
          {tab === 'profile' && <ProfileTab user={globalUser} formData={formData} setFormData={setFormData} editableSettings={editableSettings} saving={saving} handleUpdateProfile={handleUpdateProfile} handleAvatarUpload={handleAvatarUpload} handleDeleteAvatar={handleDeleteAvatar} t={t} />}
          {tab === 'university' && <UniversityTab uniData={uniData} setUniData={setUniData} unis={unis} colleges={colleges} majors={majors} editableSettings={editableSettings} saving={saving} handleUpdateUniversity={handleUpdateUniversity} t={t} />}
          {tab === 'security' && <SecurityTab passData={passData} setPassData={setPassData} saving={saving} handleUpdatePassword={handleUpdatePassword} t={t} />}
          {tab === 'notifs' && (
            <Card style={{ padding: 40, textAlign: 'center' }}>
               <PiBellDuotone size={48} color={C.blue} style={{ marginBottom: 16, opacity: 0.3 }} />
               <h3 style={{ fontWeight: 800, color: C.dark, marginBottom: 8 }}>{t("إعدادات الإشعارات")}</h3>
               <p style={{ color: C.muted }}>{t("ستتوفر هذه الميزة قريباً للتحكم الدقيق في التنبيهات.")}</p>
            </Card>
          )}
        </div>
      </div>

      <style>{`
        .settings-content-anim {
          animation: slideUp 0.35s ease-out;
        }
        @keyframes slideUp {
          from { opacity: 0; transform: translateY(12px); }
          to { opacity: 1; transform: translateY(0); }
        }
      `}</style>
    </DashboardLayout>
  );
}
