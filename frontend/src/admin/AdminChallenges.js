import React, { useState, useEffect, useContext } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Card, Field, Badge, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { PiTrophyDuotone, PiStarDuotone, PiChartLineUpDuotone, PiTrashDuotone, PiCheckCircleDuotone } from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminChallenges({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [loading, setLoading] = useState(true);
  
  const [settings, setSettings] = useState({
    bronze_to_silver: 50,
    silver_to_gold: 10,
    speed_bonus_bronze: 10,
    combo_bonus_bronze: 2
  });
  
  const [levels, setLevels] = useState([]);
  const [leaderboard, setLeaderboard] = useState([]);
  const [stats, setStats] = useState({});
  const [newLevel, setNewLevel] = useState({ level_number: '', name: '', required_gold_stars: '' });

  useEffect(() => {
    fetchData();
  }, []);

  async function fetchData() {
    try {
      const token = localStorage.getItem('elite_token');
      const [resSettings, resLeaderboard] = await Promise.all([
        fetch(`${getApiUrl()}/api/admin/challenges/settings`, { headers: { 'Authorization': `Bearer ${token}` } }),
        fetch(`${getApiUrl()}/api/admin/challenges/leaderboard`, { headers: { 'Authorization': `Bearer ${token}` } })
      ]);

      if (resSettings.ok) {
        const data = await resSettings.json();
        setSettings(data.settings);
        setLevels(data.levels);
        setStats(data.stats);
      }
      if (resLeaderboard.ok) {
        const lbData = await resLeaderboard.json();
        setLeaderboard(lbData.leaderboard);
      }
    } catch (err) {
      console.error(err);
    }
    setLoading(false);
  }

  async function handleSaveSettings(e) {
    if(e) e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/challenges/settings`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          challenge_bronze_to_silver: settings.bronze_to_silver,
          challenge_silver_to_gold: settings.silver_to_gold,
          challenge_speed_bonus_bronze: settings.speed_bonus_bronze,
          challenge_combo_bonus_bronze: settings.combo_bonus_bronze
        })
      });
      if (res.ok) alert(t("تم حفظ إعدادات النجوم بنجاح!"));
    } catch (err) {
      console.error(err);
    }
  }

  async function handleSaveLevel(e) {
    e.preventDefault();
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/challenges/levels`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('elite_token')}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(newLevel)
      });
      if (res.ok) {
        alert(t("تم إضافة/تعديل المستوى!"));
        setNewLevel({ level_number: '', name: '', required_gold_stars: '' });
        fetchData();
      }
    } catch(err) {}
  }

  async function handleDeleteLevel(id) {
    if (!window.confirm(t("هل أنت متأكد من حذف هذا المستوى؟"))) return;
    try {
      const res = await fetch(`${getApiUrl()}/api/admin/challenges/levels/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${localStorage.getItem('elite_token')}` }
      });
      if (res.ok) fetchData();
    } catch (e) {}
  }

  if (loading) return (
    <div style={{ padding: 0 }}>
      {/* Page Header Skeleton */}
      <div style={{ marginBottom: 32 }}>
        <Skeleton width="300px" height="32px" margin="0 0 10px 0" />
        <Skeleton width="450px" height="18px" />
      </div>

      {/* Grid Cards Skeleton */}
      <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <Skeleton width="200px" height="24px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
            <div>
              <Skeleton width="150px" height="14px" margin="0 0 8px 0" />
              <Skeleton width="100%" height="42px" borderRadius="10px" />
            </div>
            <div>
              <Skeleton width="150px" height="14px" margin="0 0 8px 0" />
              <Skeleton width="100%" height="42px" borderRadius="10px" />
            </div>
            <Skeleton width="140px" height="42px" borderRadius="10px" />
          </div>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <Skeleton width="180px" height="24px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Skeleton width="100%" height="60px" borderRadius="12px" />
            <Skeleton width="100%" height="60px" borderRadius="12px" />
            <Skeleton width="100%" height="42px" borderRadius="10px" />
          </div>
        </Card>
      </div>

      <div style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
        {/* Levels Area Skeleton */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <Skeleton width="150px" height="24px" />
          </div>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 10, marginBottom: 24 }}>
            <Skeleton width="100%" height="50px" borderRadius="8px" />
            <Skeleton width="100%" height="50px" borderRadius="8px" />
            <Skeleton width="100%" height="50px" borderRadius="8px" />
          </div>
          <Skeleton width="100%" height="200px" borderRadius="12px" />
        </Card>

        {/* Global Leaderboard Area Skeleton */}
        <Card style={{ padding: '24px' }}>
           <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <Skeleton width="40px" height="40px" borderRadius="10px" />
                 <Skeleton width="280px" height="24px" />
              </div>
              <Skeleton width="60px" height="24px" borderRadius="6px" />
           </div>
           {[...Array(6)].map((_, i) => (
             <div key={i} style={{ display: 'flex', gap: 16, padding: '14px 0', borderBottom: `1px solid ${C.border}` }}>
               <Skeleton width="30px" height="20px" />
               <Skeleton width="40%" height="20px" />
               <Skeleton width="20%" height="20px" />
               <Skeleton width="10%" height="20px" />
               <Skeleton width="10%" height="20px" />
               <Skeleton width="10%" height="20px" />
             </div>
           ))}
        </Card>
      </div>

      {/* Global Stats Area Skeleton */}
      <Card style={{ padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <Skeleton width="40px" height="40px" borderRadius="10px" />
            <Skeleton width="220px" height="24px" />
         </div>
         <div style={{ display: 'flex', gap: 24, justifyContent: 'space-around' }}>
            {[...Array(4)].map((_, i) => (
              <div key={i} style={{ textAlign: 'center' }}>
                <Skeleton width="80px" height="32px" margin="0 0 8px 0" />
                <Skeleton width="120px" height="14px" />
              </div>
            ))}
         </div>
      </Card>
    </div>
  );

  return (
    <>
      <div className="admin-page-header" style={{ marginBottom: 32 }}>
        <h1 style={{ fontSize: '1.6rem', fontWeight: 800, color: C.dark, marginBottom: 8 }}>{t("إدارة نظام الجوائز والترتيب")}</h1>
        <p style={{ color: C.muted }}>{t("إدارة اقتصاد النجوم ومكافآت التحديات ولوحات الشرف")}</p>
      </div>

      <div className="admin-challenges-grid" style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiStarDuotone size={20} />
            </div>
            <h3 style={{ fontWeight: 700, margin: 0 }}>{t("جدول تحويل النجوم والعملات")}</h3>
          </div>

          <form onSubmit={handleSaveSettings}>
            <Field label={t("كم نجمة برونزية تعادل نجمة فضية واحدة؟")}>
              <input type="number" value={settings.bronze_to_silver} onChange={e => setSettings({...settings, bronze_to_silver: e.target.value})} style={inputStyle} />
            </Field>
            <Field label={t("كم نجمة فضية تعادل نجمة ذهبية واحدة؟")}>
              <input type="number" value={settings.silver_to_gold} onChange={e => setSettings({...settings, silver_to_gold: e.target.value})} style={inputStyle} />
            </Field>
            <Btn type="submit" style={{ marginTop: 10 }}>{t("حفظ التحويلات")}</Btn>
          </form>
        </Card>

        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenBg, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
               <PiTrophyDuotone size={20} />
            </div>
            <h3 style={{ fontWeight: 700, margin: 0 }}>{t("قواعد المكافآت الإضافية")}</h3>
          </div>
          
          <form style={{ display: 'flex', flexDirection: 'column', gap: 16 }} onSubmit={handleSaveSettings}>
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${C.border}`, borderRadius: 12, background: C.bg, gap: 12 }}>
               <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.dark }}>{t("مكافأة السرعة (< 10 ثواني)")}</div>
                  <div style={{ fontSize: '0.72rem', color: C.muted }}>{t("كم نجمة برونزية تُضاف كحد أقصى؟")}</div>
               </div>
               <input type="number" value={settings.speed_bonus_bronze} onChange={e => setSettings({...settings, speed_bonus_bronze: e.target.value})} style={{...inputStyle, width:80}} />
            </div>
            
            <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: `1px solid ${C.border}`, borderRadius: 12, background: C.bg, gap: 12 }}>
               <div>
                  <div style={{ fontWeight: 700, fontSize: '0.88rem', color: C.dark }}>{t("مكافأة التوالي (Combo)")}</div>
                  <div style={{ fontSize: '0.72rem', color: C.muted }}>{t("كم نجمة برونزية عن كل إجابة متتالية؟")}</div>
               </div>
               <input type="number" value={settings.combo_bonus_bronze} onChange={e => setSettings({...settings, combo_bonus_bronze: e.target.value})} style={{...inputStyle, width:80}} />
            </div>
            
            <Btn type="submit" variant="secondary" style={{ width: '100%', fontSize: '0.8rem' }}>{t("حفظ قواعد البونص")}</Btn>
          </form>
        </Card>
      </div>

      <div className="admin-challenges-grid" style={{ display: 'grid', gridTemplateColumns: "repeat(auto-fit, minmax(280px, 1fr))", gap: 24, marginBottom: 24 }}>
        {/* Levels Area */}
        <Card style={{ padding: '24px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 24 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.orangeBg, color: C.orange, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiTrophyDuotone size={20} />
            </div>
            <h3 style={{ fontWeight: 700, margin: 0 }}>{t("إدارة المستويات والتسلسل")}</h3>
          </div>

          <div style={{ display:'flex', flexDirection:'column', gap:8, marginBottom: 24 }}>
            {levels.map(lvl => (
                <div key={lvl.id} style={{ display:'flex', flexWrap: 'wrap', justifyContent:'space-between', alignItems:'center', background: C.bg, padding: '10px 14px', borderRadius: 8, border: `1px solid ${C.border}`, gap: 12 }}>
                   <div>
                     <span style={{ fontWeight:800, color:C.dark, display:'block' }}>{t("مستوى")} {lvl.level_number}: {lvl.name}</span>
                     <span style={{ fontSize:'0.75rem', color: C.orange }}>⭐ {lvl.required_gold_stars} {t("ذهبية")}</span>
                   </div>
                   <div style={{ display: 'flex', gap: 12 }}>
                       <div style={{ cursor: 'pointer', color: C.blue }} onClick={() => setNewLevel(lvl)}>
                          <span style={{ fontSize: '0.8rem' }}>{t("تعديل")}</span>
                       </div>
                       <div style={{ cursor: 'pointer', color: C.red }} onClick={() => handleDeleteLevel(lvl.id)}>
                          <PiTrashDuotone size={18} />
                       </div>
                   </div>
                </div>
            ))}
            {levels.length === 0 && <div style={{ color: C.muted, fontSize: '0.85rem' }}>{t("لا توجد مستويات، أضف المستوى الأول")}</div>}
          </div>

          <h4 style={{ fontSize:'0.9rem', marginBottom: 12 }}>{t("إضافة مستوى جديد")}</h4>
          <form style={{ display:'flex', flexDirection:'column', gap: 10 }} onSubmit={handleSaveLevel}>
             <input placeholder={t("رقم المستوى (مثال: 1)")} value={newLevel.level_number} onChange={e=>setNewLevel({...newLevel, level_number:e.target.value})} style={inputStyle} required />
             <input placeholder={t("اسم المستوى (مثال: متدرب)")} value={newLevel.name} onChange={e=>setNewLevel({...newLevel, name:e.target.value})} style={inputStyle} required />
             <input placeholder={t("عدد النجوم الذهبية المطلوبة")} value={newLevel.required_gold_stars} onChange={e=>setNewLevel({...newLevel, required_gold_stars:e.target.value})} style={inputStyle} required />
             <Btn type="submit">{t("حفظ المستوى")}</Btn>
          </form>
        </Card>

        {/* Global Leaderboard Area */}
        <Card style={{ padding: '24px' }}>
           <div style={{ display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, gap: 14 }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                 <div style={{ width: 40, height: 40, borderRadius: 10, background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                   <PiTrophyDuotone size={20} />
                 </div>
                 <h3 style={{ fontWeight: 700, margin: 0 }}>{t("لوحة الشرف للمنصة العامة (Live Leaderboard)")}</h3>
              </div>
              <Badge color={C.green}>{t("مباشر")}</Badge>
           </div>
           
           <div className="admin-table-wrap">
             <table style={{ width: '100%', textAlign: 'left', borderCollapse: 'collapse' }}>
               <thead>
                  <tr style={{ background: C.bg }}>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: C.muted, fontSize: '0.8rem' }}>#</th>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: C.muted, fontSize: '0.8rem', textAlign: 'right' }}>{t("اسم الطالب")}</th>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: C.muted, fontSize: '0.8rem' }}>{t("المستوى الحالي")}</th>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: C.gold, fontSize: '0.8rem' }}>🥇 {t("الذهبية")}</th>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: C.muted, fontSize: '0.8rem' }}>🥈 {t("الفضية")}</th>
                     <th style={{ padding: '12px 14px', borderBottom: `2px solid ${C.border}`, color: '#cd7f32', fontSize: '0.8rem' }}>🥉 {t("البرونزية")}</th>
                  </tr>
               </thead>
               <tbody>
                  {leaderboard.map((u, i) => (
                    <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}` }}>
                       <td style={{ padding: '12px 14px', fontWeight: 800, color: i < 3 ? C.blue : C.dark }}>{i + 1}</td>
                       <td style={{ padding: '12px 14px', fontWeight: 700, textAlign: 'right' }}>{u.name}</td>
                       <td style={{ padding: '12px 14px' }}><Badge color={C.orange}>{u.level_name}</Badge></td>
                       <td style={{ padding: '12px 14px', fontWeight: 800 }}>{u.stars_gold || 0}</td>
                       <td style={{ padding: '12px 14px', color: C.muted }}>{u.stars_silver || 0}</td>
                       <td style={{ padding: '12px 14px', color: C.muted }}>{u.stars_bronze || 0}</td>
                    </tr>
                  ))}
                  {leaderboard.length === 0 && (
                     <tr><td colSpan="6" style={{ padding: 20, textAlign: 'center', color: C.muted }}>{t("لا يوجد طلاب متصدرين في المنصة حتى الآن.")}</td></tr>
                  )}
               </tbody>
             </table>
           </div>
        </Card>
      </div>

      {/* Global Stats Area */}
      <Card style={{ padding: '24px' }}>
         <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 20 }}>
            <div style={{ width: 40, height: 40, borderRadius: 10, background: C.greenBg, color: C.green, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PiChartLineUpDuotone size={20} />
            </div>
            <h3 style={{ fontWeight: 700, margin: 0 }}>{t("إحصائيات النظام العام (حية)")}</h3>
         </div>
         
         <div className="admin-kpi-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(4, 1fr)', gap: 16 }}>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 900, color: C.dark }}>{stats.totalChallenges || 0}</div>
               <div style={{ fontSize: '0.8rem', color: C.muted }}>{t("إجمالي التحديات")}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 900, color: C.blue }}>{stats.totalStars || 0}</div>
               <div style={{ fontSize: '0.8rem', color: C.muted }}>{t("إجمالي النجوم المكتسبة بجميع الألوان")}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 900, color: C.green }}>{t("مستوى ")}{stats.averageLevel || 1}</div>
               <div style={{ fontSize: '0.8rem', color: C.muted }}>{t("متوسط المستويات للطلاب")}</div>
            </div>
            <div style={{ textAlign: 'center' }}>
               <div style={{ fontSize: '1.5rem', fontWeight: 900, color: C.orange }}>{stats.todayChallenges || 0}</div>
               <div style={{ fontSize: '0.8rem', color: C.muted }}>{t("تحديات تم انشاؤها اليوم")}</div>
            </div>
         </div>
      </Card>
    </>
  );
}
