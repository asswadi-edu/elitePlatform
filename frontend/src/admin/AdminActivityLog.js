import React, { useContext, useState, useEffect } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { 
  PiUsersDuotone, PiCreditCardDuotone, PiFolderOpenDuotone, 
  PiChartBarDuotone, PiShieldCheckDuotone, PiTicketDuotone,
  PiLightbulbDuotone, PiFlagDuotone, PiBankDuotone, PiTrophyDuotone,
  PiGearDuotone, PiMagnifyingGlassDuotone
} from "react-icons/pi";
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminActivityLog({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [filter, setFilter] = useState('all');
  const [search, setSearch] = useState('');
  const [logs, setLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });
  const [stats, setStats] = useState({ total: 0, successRate: '99.9%', alerts: 0 });

  useEffect(() => {
    fetchLogs(1);
  }, [filter, search]);

  const fetchLogs = async (page = 1) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const queryParams = new URLSearchParams({
        page,
        type: filter,
        search
      }).toString();

      const response = await fetch(`${apiUrl}/api/admin/logs?${queryParams}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });

      if (!response.ok) throw new Error('Failed to fetch logs');
      
      const data = await response.json();

      setLogs(data.data);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page
      });
      setStats(prev => ({ ...prev, total: data.total }));
    } catch (error) {
      console.error("Error fetching logs:", error);
    } finally {
      setLoading(false);
    }
  };

  const types = [
    { id: 'all', label: t('الكل') },
    { id: 'users', label: t('المستخدمين') },
    { id: 'content', label: t('المحتوى') },
    { id: 'finance', label: t('المالية') },
    { id: 'security', label: t('الأمن') },
    { id: 'social', label: t('التفاعل') },
  ];

  const formatAction = (log) => {
    const { action, auditable_type, target_user, metadata, user } = log;
    
    const userName = user ? user.name : t('النظام');
    const targetName = target_user ? target_user.name : '';
    const itemTitle = metadata?.title || '';

    const modelTrans = {
      'User': t('المستخدم'),
      'UserProfile': t('الملف الشخصي'),
      'Resource': t('المورد'),
      'University': t('الجامعة'),
      'College': t('الكلية'),
      'Major': t('التخصص'),
      'Subject': t('المادة'),
      'SubscriptionPlan': t('الخطة'),
      'ActivationCard': t('البطاقة'),
      'UserSubscription': t('الاشتراك'),
      'UserPoints': t('النقاط'),
      'PointRule': t('قاعدة النقاط'),
      'SystemSetting': t('الإعدادات')
    };

    const modelName = auditable_type ? (modelTrans[auditable_type.split('\\').pop()] || auditable_type.split('\\').pop()) : '';
    
    switch (action) {
      case 'created': 
        return `${userName} ${t('قام بإضافة')} ${modelName} ${itemTitle ? `(${itemTitle})` : ''} ${targetName ? `${t('للمستخدم')} ${targetName}` : ''}`;
      case 'updated': 
        return `${userName} ${t('قام بتعديل')} ${modelName} ${itemTitle ? `(${itemTitle})` : ''} ${targetName ? `${t('الخاص بـ')} ${targetName}` : ''}`;
      case 'deleted': 
        return `${userName} ${t('قام بحذف')} ${modelName} ${itemTitle ? `(${itemTitle})` : ''} ${targetName ? `${t('الخاص بـ')} ${targetName}` : ''}`;
      case 'approved':
        return `${userName} ${t('قام بقبول')} ${modelName} ${itemTitle ? `(${itemTitle})` : ''} ${targetName ? `${t('المرفوع من قبل')} ${targetName}` : ''}`;
      case 'unapproved':
        return `${userName} ${t('قام بإلغاء قبول')} ${modelName} ${itemTitle ? `(${itemTitle})` : ''} ${targetName ? `${t('الخاص بـ')} ${targetName}` : ''}`;
      case 'login': return `${userName} ${t('سجل دخوله إلى النظام')}`;
      case 'logout': return `${userName} ${t('سجل خروجه من النظام')}`;
      case 'failed_login': return t('محاولة دخول فاشلة من بريد غير معروف أو كلمة مرور خاطئة');
      case 'password_changed': return `${userName} ${t('قام بتغيير كلمة المرور الخاصة به')}`;
      default: return `${userName} ${t(action)} ${modelName}`;
    }
  };

  const filteredLogs = logs; // Filtering is done on server side now

  return (
    <>
      <div style={{ marginBottom: 28 }}>
        <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("سجل النشاطات العام")}</h1>
        <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("مراقبة وتحليل كافة العمليات التي تتم داخل النظام من قبل المشرفين والمستخدمين")}</p>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 16, marginBottom: 24 }}>
         <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.blue}12`, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><PiChartBarDuotone/></div>
               <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: C.dark }}>{stats.total}</div>
                  <div style={{ fontSize: '0.74rem', color: C.muted, fontWeight: 600 }}>{t("إجمالي العمليات")}</div>
               </div>
            </div>
         </Card>
         <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.green}12`, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><PiShieldCheckDuotone/></div>
               <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: C.dark }}>{stats.successRate}</div>
                  <div style={{ fontSize: '0.74rem', color: C.muted, fontWeight: 600 }}>{t("معدل النجاح")}</div>
               </div>
            </div>
         </Card>
         <Card style={{ padding: 20 }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
               <div style={{ width: 44, height: 44, borderRadius: 12, background: `${C.red}12`, color: C.red, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}><PiFlagDuotone/></div>
               <div>
                  <div style={{ fontSize: '1.4rem', fontWeight: 900, color: C.dark }}>{stats.alerts}</div>
                  <div style={{ fontSize: '0.74rem', color: C.muted, fontWeight: 600 }}>{t("تنبيهات حرجة")}</div>
               </div>
            </div>
         </Card>
      </div>

      <Card style={{ padding: 20, marginBottom: 24 }}>
         <div style={{ display: 'flex', gap: 16, alignItems: 'center', flexWrap: 'wrap' }}>
            <div style={{ position: 'relative', flex: 1, minWidth: 200 }}>
               <PiMagnifyingGlassDuotone style={{ position: 'absolute', right: 12, top: '50%', transform: 'translateY(-50%)', color: C.muted }}/>
               <input 
                  type="text" 
                  placeholder={t("البحث في السجلات...")} 
                  style={{ ...inputStyle, paddingRight: 36 }}
                  value={search}
                  onChange={e => setSearch(e.target.value)}
               />
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
               {types.map(t => (
                  <button 
                    key={t.id}
                    onClick={() => setFilter(t.id)}
                    style={{ padding: '8px 16px', borderRadius: 8, border: filter === t.id ? `1px solid ${C.blue}` : `1px solid ${C.border}`, background: filter === t.id ? C.blueLight : C.white, color: filter === t.id ? C.blue : C.body, fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer', transition: 'all .2s' }}
                  >
                    {t.label}
                  </button>
               ))}
            </div>
         </div>
      </Card>

      <Card style={{ padding: 0 }}>
         <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: '0.86rem' }}>
            <thead>
               <tr style={{ background: C.bg, borderBottom: `1px solid ${C.border}` }}>
                  <th style={{ padding: '14px 22px', textAlign: 'right', fontWeight: 700, color: C.muted }}>{t("المسؤول")}</th>
                  <th style={{ padding: '14px 22px', textAlign: 'right', fontWeight: 700, color: C.muted }}>{t("الإجراء")}</th>
                  <th style={{ padding: '14px 22px', textAlign: 'right', fontWeight: 700, color: C.muted }}>{t("النوع")}</th>
                  <th style={{ padding: '14px 22px', textAlign: 'right', fontWeight: 700, color: C.muted }}>{t("الحالة")}</th>
                  <th style={{ padding: '14px 22px', textAlign: 'right', fontWeight: 700, color: C.muted }}>{t("الوقت")}</th>
               </tr>
            </thead>
            <tbody>
               {loading ? (
                  Array(6).fill(0).map((_, i) => (
                    <tr key={i} style={{ borderBottom: `1px solid ${C.border}` }}>
                       <td style={{ padding: '14px 22px' }}><div style={{ display: 'flex', alignItems: 'center', gap: 8 }}><Skeleton width="28px" height="28px" borderRadius="50%" /><Skeleton width="80px" /></div></td>
                       <td style={{ padding: '14px 22px' }}><Skeleton width="180px" /></td>
                       <td style={{ padding: '14px 22px' }}><Skeleton width="70px" height="20px" borderRadius="6px" /></td>
                       <td style={{ padding: '14px 22px' }}><Skeleton width="50px" height="15px" /></td>
                       <td style={{ padding: '14px 22px' }}><Skeleton width="120px" /></td>
                    </tr>
                  ))
               ) : filteredLogs.map((l, i) => (
                  <tr key={l.id} style={{ borderBottom: i === filteredLogs.length - 1 ? 'none' : `1px solid ${C.border}` }}>
                     <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                           <div style={{ width: 28, height: 28, borderRadius: '50%', background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem', fontWeight: 800 }}>
                              {l.user ? (l.user.name ? l.user.name[0].toUpperCase() : 'U') : 'S'}
                           </div>
                           <span style={{ fontWeight: 800, color: C.dark }}>{l.user ? l.user.name : t('النظام')}</span>
                        </div>
                     </td>
                     <td style={{ padding: '14px 22px' }}>
                        <div style={{ color: C.blue, fontWeight: 700, fontSize: '0.92rem', lineHeight: 1.5 }}>{formatAction(l)}</div>
                        <div style={{ fontSize: '0.72rem', color: C.muted, marginTop: 2 }}>
                           {l.auditable_id ? `${t('رقم')}: ${l.auditable_id} | ` : ''}
                           {l.ip_address}
                        </div>
                     </td>
                     <td style={{ padding: '14px 22px' }}>
                        <Badge color={l.action.includes('login') ? C.orange : (l.auditable_type ? C.blue : C.muted)}>
                           {l.auditable_type ? l.auditable_type.split('\\').pop() : (l.action.includes('login') ? t('أمن') : '-')}
                        </Badge>
                     </td>
                     <td style={{ padding: '14px 22px' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 6, color: l.action === 'failed_login' ? C.red : C.green, fontWeight: 700, fontSize: '0.78rem' }}>
                           <div style={{ width: 6, height: 6, borderRadius: '50%', background: l.action === 'failed_login' ? C.red : C.green }}></div>
                           {l.action === 'failed_login' ? t("تنبيه") : t("ناجح")}
                        </div>
                     </td>
                     <td style={{ padding: '14px 22px', color: C.muted, fontSize: '0.78rem' }}>
                        {new Date(l.created_at).toLocaleString()}
                     </td>
                  </tr>
               ))}
            </tbody>
         </table>
         {filteredLogs.length === 0 && !loading && (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>{t("لا توجد نتائج تطابق البحث")}</div>
         )}
         {loading && filteredLogs.length === 0 && (
            <div style={{ padding: 40, textAlign: 'center', color: C.muted }}>{t("جاري التحميل...")}</div>
         )}
      </Card>
      
      <Pagination meta={meta} onPageChange={fetchLogs} />
    </>
  );
}
