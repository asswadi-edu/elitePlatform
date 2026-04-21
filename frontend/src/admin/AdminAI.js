import React, { useState, useEffect, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field, Badge, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { 
  PiRobotDuotone, PiKeyDuotone, PiNotePencilDuotone, 
  PiMonitorDuotone, PiCheckCircleDuotone, PiXCircleDuotone,
  PiFileArrowUpDuotone, PiBooksDuotone
} from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminAI({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [settings, setSettings] = useState({});
  const [plans, setPlans] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const token = localStorage.getItem('elite_token');
      const [resSett, resPlans] = await Promise.all([
        fetch(`${getApiUrl()}/api/admin/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${getApiUrl()}/api/admin/subscription-plans`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);
      
      if (resSett.ok && resPlans.ok) {
        const settData = await resSett.json();
        // Convert array to key-value object
        const sObj = {};
        settData.forEach(s => sObj[s.key] = s.value);
        setSettings(sObj);
        
        const plansData = await resPlans.json();
        setPlans(plansData);
      }
    } catch (e) {
      console.error(e);
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateSetting = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleUpdatePlanLimit = (planId, value) => {
    setPlans(prev => prev.map(p => p.id === planId ? { ...p, max_ai_tests: parseInt(value) || 0 } : p));
  };

  const saveAll = async () => {
    setSaving(true);
    try {
      const token = localStorage.getItem('elite_token');
      
      // Update System Settings
      const settingsToSave = Object.keys(settings)
        .filter(k => k.startsWith('ai_'))
        .map(k => ({ key: k, value: settings[k] }));

      const resSett = await fetch(`${getApiUrl()}/api/admin/settings/bulk`, {
        method: 'POST',
        headers: { 
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ settings: settingsToSave })
      });

      // Update Plan Limits
      await Promise.all(plans.map(p => 
        fetch(`${getApiUrl()}/api/admin/subscription-plans/${p.id}`, {
          method: 'PUT',
          headers: { 
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(p)
        })
      ));

      if (resSett.ok) {
        alert(t("تم حفظ الإعدادات بنجاح!"));
      }
    } catch (e) {
      console.error(e);
    } finally {
      setSaving(false);
    }
  };

  if (loading) return (
    <div style={{ padding: 0 }}>
      {/* Page Header Skeleton */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <Skeleton width="280px" height="32px" margin="0 0 10px 0" />
          <Skeleton width="400px" height="18px" />
        </div>
        <Skeleton width="180px" height="42px" borderRadius="10px" />
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main AI Configuration Skeleton */}
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <Skeleton width="40px" height="40px" borderRadius="10px" />
              <Skeleton width="180px" height="24px" />
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <div>
                <Skeleton width="150px" height="14px" margin="0 0 8px 0" />
                <Skeleton width="100%" height="42px" borderRadius="10px" />
              </div>
              <div>
                <Skeleton width="150px" height="14px" margin="0 0 8px 0" />
                <Skeleton width="100%" height="42px" borderRadius="10px" />
              </div>
            </div>
            <Skeleton width="200px" height="14px" margin="0 0 8px 0" />
            <Skeleton width="100%" height="42px" borderRadius="10px" margin="0 0 24px 0" />
            <Skeleton width="150px" height="14px" margin="0 0 8px 0" />
            <Skeleton width="100%" height="160px" borderRadius="12px" />
          </Card>

          {/* Plan Limits Skeleton */}
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <Skeleton width="40px" height="40px" borderRadius="10px" />
              <Skeleton width="220px" height="24px" />
            </div>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '16px 0', borderBottom: `1px solid ${C.bg}` }}>
                <Skeleton width="30%" height="20px" />
                <Skeleton width="20%" height="32px" />
                <Skeleton width="15%" height="24px" />
              </div>
            ))}
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Sidebar Skeletons */}
          <Card style={{ padding: 24 }}>
            <Skeleton width="100px" height="20px" margin="0 0 20px 0" />
            <Skeleton width="100%" height="60px" borderRadius="12px" margin="0 0 20px 0" />
            <Skeleton width="120px" height="14px" margin="0 0 8px 0" />
            <Skeleton width="100%" height="42px" borderRadius="10px" />
          </Card>
          
          <Card style={{ padding: 24, height: 180 }}>
            <Skeleton width="120px" height="20px" margin="0 0 20px 0" />
            <Skeleton width="100%" height="14px" margin="0 0 10px 0" />
            <Skeleton width="100%" height="14px" margin="0 0 20px 0" />
            <Skeleton width="100%" height="8px" borderRadius="4px" />
          </Card>
        </div>
      </div>
    </div>
  );

  return (
    <>
      <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: C.dark, margin: '0 0 6px' }}>{t("إعدادات الذكاء الاصطناعي")}</h1>
          <p style={{ color: C.muted, fontSize: '0.88rem' }}>{t("التحكم بمنظومة توليد الاختبارات الذكية وإعدادات الـ API")}</p>
        </div>
        <Btn onClick={saveAll} disabled={saving} style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '10px 24px' }}>
          {saving ? t("جاري الحفظ...") : <><PiCheckCircleDuotone size={20}/> {t("حفظ كافة التغييرات")}</>}
        </Btn>
      </div>

      <div className="admin-two-col" style={{ display: 'grid', gridTemplateColumns: '2fr 1fr', gap: 24 }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Main AI Configuration */}
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiRobotDuotone size={24}/>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.dark, margin: 0 }}>{t("تكوين المحرك الذكي")}</h2>
            </div>

            <div className="admin-form-grid-2" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 24 }}>
              <Field label={t("مفتاح API الخاص بالمنصة")}>
                <div style={{ position: 'relative' }}>
                  <input 
                    type="password" 
                    value={settings.ai_test_api_key || ''} 
                    onChange={e => handleUpdateSetting('ai_test_api_key', e.target.value)}
                    style={{ ...inputStyle, paddingInlineStart: 40 }}
                    placeholder={t("أدخل مفتاح OpenAi أو Gemini...")}
                  />
                  <PiKeyDuotone style={{ position: 'absolute', left: 12, top: 12, color: C.muted }} size={18}/>
                </div>
              </Field>
              <Field label={t("موديل الذكاء الاصطناعي")}>
                <select 
                  value={settings.ai_test_model || 'gpt-4o'} 
                  onChange={e => handleUpdateSetting('ai_test_model', e.target.value)}
                  style={{ ...inputStyle, appearance: 'auto' }}
                >
                  <option value="llama-3.3-70b-versatile">Groq: Llama 3.3 70B (مفتوح وسريع العقل الساطع)</option>
                  <option value="llama-3.1-8b-instant">Groq: Llama 3.1 8B (سريع جداً)</option>
                  <option value="gpt-4o">OpenAI: GPT-4o (أفضل جودة)</option>
                  <option value="gpt-4o-mini">OpenAI: GPT-4o Mini (أسرع وأرخص)</option>
                  <option value="gemini-1.5-pro">Google: Gemini 1.5 Pro</option>
                  <option value="gemini-1.5-flash">Google: Gemini 1.5 Flash</option>
                </select>
              </Field>
            </div>

            <div style={{ marginBottom: 24 }}>
              <Field label={t("رابط الـ API الأساسي (Base URL / Proxy) - اختياري")}>
                <input 
                  type="text" 
                  value={settings.ai_api_base_url || ''} 
                  onChange={e => handleUpdateSetting('ai_api_base_url', e.target.value)}
                  style={inputStyle}
                  placeholder={t("اتركه فارغاً، أو ضع رابط الـ Proxy هنا لتجاوز الحظر...")}
                />
              </Field>
            </div>

            <Field label={t("البرومبت الأساسي (System Prompt)")}>
              <textarea 
                value={settings.ai_quiz_prompt || ''} 
                onChange={e => handleUpdateSetting('ai_quiz_prompt', e.target.value)}
                style={{ ...inputStyle, height: 160, padding: 16, lineHeight: 1.6, fontFamily: 'inherit' }}
                placeholder={t("اكتب التعليمات التي سيوجهها النظام للذكاء الاصطناعي...")}
              />
              <div style={{ marginTop: 8, fontSize: '0.75rem', color: C.muted, display: 'flex', alignItems: 'center', gap: 5 }}>
                <PiNotePencilDuotone size={14}/> {t("يمكنك استخدام المتغيرات مثل @count لعدد الأسئلة و @difficulty للصعوبة.")}
              </div>
            </Field>
          </Card>

          {/* Plan Limits */}
          <Card style={{ padding: 28 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 24, borderBottom: `1px solid ${C.border}`, paddingBottom: 16 }}>
              <div style={{ width: 40, height: 40, borderRadius: 10, background: C.goldBg, color: C.gold, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <PiBooksDuotone size={24}/>
              </div>
              <h2 style={{ fontSize: '1.1rem', fontWeight: 800, color: C.dark, margin: 0 }}>{t("حدود الباقات (عدد الاختبارات)")}</h2>
            </div>

            <div className="admin-table-wrap">
              <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                <thead>
                  <tr style={{ textAlign: 'start', borderBottom: `2px solid ${C.bg}` }}>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: C.muted }}>{t("اسم الباقة")}</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: C.muted }}>{t("الحد الشهري للاختبارات")}</th>
                    <th style={{ padding: '12px 8px', fontSize: '0.85rem', color: C.muted }}>{t("الحالة")}</th>
                  </tr>
                </thead>
                <tbody>
                  {plans.map(plan => (
                    <tr key={plan.id} style={{ borderBottom: `1px solid ${C.bg}` }}>
                      <td style={{ padding: '16px 8px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                          <div style={{ width: 12, height: 12, borderRadius: '50%', background: plan.color_hex }} />
                          <span style={{ fontWeight: 700, color: C.dark }}>{plan.name}</span>
                        </div>
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        <input 
                          type="number" 
                          value={plan.max_ai_tests} 
                          onChange={e => handleUpdatePlanLimit(plan.id, e.target.value)}
                          style={{ ...inputStyle, width: 120, height: 38, textAlign: 'center' }}
                        />
                      </td>
                      <td style={{ padding: '16px 8px' }}>
                        {plan.is_active ? <Badge color={C.green}>{t("نشطة")}</Badge> : <Badge color={C.red}>{t("غير نشطة")}</Badge>}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
          {/* Status & Quick Toggle */}
          <Card style={{ padding: 24 }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, color: C.dark, marginBottom: 20 }}>{t("حالة الخدمة")}</h3>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 20, padding: 16, borderRadius: 12, background: settings.ai_test_enabled === 'true' ? C.green + '10' : C.red + '10', border: `1px solid ${settings.ai_test_enabled === 'true' ? C.green + '30' : C.red + '30'}` }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                {settings.ai_test_enabled === 'true' ? <PiCheckCircleDuotone size={20} color={C.green}/> : <PiXCircleDuotone size={20} color={C.red}/>}
                <span style={{ fontWeight: 700, color: settings.ai_test_enabled === 'true' ? C.green : C.red }}>
                  {settings.ai_test_enabled === 'true' ? t("الخدمة تعمل") : t("الخدمة متوقفة")}
                </span>
              </div>
              <button 
                onClick={() => handleUpdateSetting('ai_test_enabled', settings.ai_test_enabled === 'true' ? 'false' : 'true')}
                style={{ border: 'none', background: 'transparent', color: C.blue, fontWeight: 700, fontSize: '0.82rem', cursor: 'pointer', textDecoration: 'underline' }}
              >
                {t("تغيير")}
              </button>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <Field label={t("أقصى حجم للملف (MB)")}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <input 
                    type="number" 
                    value={settings.ai_test_max_file_size || 10} 
                    onChange={e => handleUpdateSetting('ai_test_max_file_size', e.target.value)}
                    style={inputStyle}
                  />
                  <PiFileArrowUpDuotone size={24} color={C.muted}/>
                </div>
              </Field>
              
              <div style={{ padding: 12, background: C.bg, borderRadius: 10, fontSize: '0.78rem', color: C.muted, border: `1px solid ${C.border}`, lineHeight: 1.5 }}>
                 💡 {t("ينصح بجعل حجم الملف معقولاً (عشرة ميجا أو أقل) لضمان سرعة الاستجابة وتقليل استهلاك الـ API.")}
              </div>
            </div>
          </Card>

          {/* Quick Stats Summary */}
          <Card style={{ padding: 24, background: `linear-gradient(135deg, ${C.blue}, ${C.blueDark})`, color: C.white }}>
            <h3 style={{ fontSize: '0.95rem', fontWeight: 800, marginBottom: 16 }}>{t("إحصائيات سريعة")}</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                <span>{t("الباقات المدعومة:")}</span>
                <span style={{ fontWeight: 700 }}>{plans.length}</span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', opacity: 0.9 }}>
                <span>{t("الموديل الحالي:")}</span>
                <span style={{ fontWeight: 700 }}>{settings.ai_test_model}</span>
              </div>
              <div style={{ borderTop: '1px solid rgba(255,255,255,0.1)', paddingTop: 12, marginTop: 4 }}>
                <div style={{ fontSize: '0.7rem', opacity: 0.8, marginBottom: 6 }}>{t("استهلاك الـ API (تقديري)")}</div>
                <div style={{ width: '100%', height: 6, background: 'rgba(255,255,255,0.1)', borderRadius: 3 }}>
                   <div style={{ width: '45%', height: '100%', background: C.white, borderRadius: 3 }} />
                </div>
              </div>
            </div>
          </Card>
        </div>
      </div>
    </>
  );
}
