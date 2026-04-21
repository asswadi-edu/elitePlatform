import React, { useState, useContext, useEffect, useCallback } from 'react';
import { C, inputStyle } from '../tokens';
import { Btn, Badge, Card, Pagination, Skeleton } from '../components/Common';
import AdminLayout from '../layouts/AdminLayout';
import { 
  PiMagnifyingGlassDuotone, PiUserDuotone, PiUsersDuotone, 
  PiUserPlusDuotone, PiShieldCheckDuotone, PiProhibitDuotone,
  PiPencilSimpleDuotone, PiTrashDuotone, PiCoinsDuotone,
  PiFolderSimpleDuotone, PiCreditCardDuotone, PiDotsThreeVerticalDuotone,
  PiBellRingingDuotone
} from 'react-icons/pi';
import { LanguageContext } from '../LanguageContext';
import { getApiUrl } from '../api';

export default function AdminUsers({ setPage }) {
  const { t } = useContext(LanguageContext);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [meta, setMeta] = useState({ current_page: 1, last_page: 1 });

  const roleMap = {
    'student_school': t("مستخدم مهتم"),
    'student_university': t("طالب جامعي"),
    'moderator': t("مشرف"),
    'admin': t("أدمن"),
    'vip': t("مساهم VIP")
  };

  const statusMap = {
    'active': 'active',
    'banned': 'banned',
    'pending': 'pending'
  };

  const fetchUsers = useCallback(async (page = 1) => {
    try {
      setLoading(true);
      const token = localStorage.getItem('elite_token');
      if (!token) {
        showToast(t("لم يتم العثور على توكن تسجيل الدخول"), C.orange);
      }
      
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/admin/users?page=${page}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to fetch');
      
      const data = await res.json();
      
      // Map roles to translations for display
      const mapped = data.data.map(u => ({
        ...u,
        role: roleMap[u.role] || u.role,
      }));
      
      setUsers(mapped);
      setMeta({
        current_page: data.current_page,
        last_page: data.last_page
      });
    } catch (err) {
      console.error(err);
      showToast(t("خطأ في تحميل البيانات"), C.red);
    } finally {
      setLoading(false);
    }
  }, [t]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const [selectedUser, setSelectedUser] = useState(null);
  const [toast, setToast] = useState(null);

  // Notification States
  const [showNotif, setShowNotif] = useState(false);
  const [notifTitle, setNotifTitle] = useState("");
  const [notifBody, setNotifBody] = useState("");
  const [sendingNotif, setSendingNotif] = useState(false);

  // Add User States
  const [showAdd, setShowAdd] = useState(false);
  const [fName, setFName] = useState("");
  const [mName, setMName] = useState("");
  const [gName, setGName] = useState("");
  const [lName, setLName] = useState("");
  const [newEmail, setNewEmail] = useState("");
  const [tempPass, setTempPass] = useState("");
  const [newRole, setNewRole] = useState("user");
  const [newGender, setNewGender] = useState("male");

  function showToast(msg, color = C.green) { setToast({ msg, color }); setTimeout(() => setToast(null), 3000); }

  async function handleStatusToggle(id) {
    const user = users.find(u => u.id === id);
    if (!user || user.is_super_admin) return;

    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${getApiUrl()}/api/admin/users/${id}/toggle-status`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to toggle status');
      const data = await res.json();
      
      setUsers(arr => arr.map(u => u.id === id ? { ...u, status: data.status } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, status: data.status }));
      showToast(data.status === "active" ? t("تم تنشيط الحساب") : t("تم حظر الحساب"), data.status === "active" ? C.green : C.red);
    } catch (err) {
      console.error(err);
      showToast(t("فشل في تحديث الحالة"), C.red);
    }
  }

  async function handleRoleChange(id, newRoleRaw) {
    const user = users.find(u => u.id === id);
    if (!user || user.is_super_admin) return;

    console.log(`Changing role for user ${id} (${user.name}) to ${newRoleRaw}`);

    // Map translated role back to raw role for backend
    const rawRole = Object.keys(roleMap).find(key => roleMap[key] === newRoleRaw) || 'student_school';

    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/admin/users/${id}/change-role`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ role: rawRole })
      });
      if (!res.ok) throw new Error('Failed to change role');
      
      setUsers(arr => arr.map(u => u.id === id ? { ...u, role: newRoleRaw } : u));
      if (selectedUser?.id === id) {
        setSelectedUser(prev => {
          if (!prev) return null;
          console.log("Updating selectedUser from:", prev);
          return { ...prev, role: newRoleRaw };
        });
      }
      showToast(t("تم تغيير دور المستخدم بنجاح"));
    } catch (err) {
      console.error(err);
      showToast(t("فشل في تغيير الدور"), C.red);
    }
  }

  async function adjustPoints(id, amount) {
    const user = users.find(u => u.id === id);
    if (!user || user.is_super_admin) return;

    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${getApiUrl()}/api/admin/users/${id}/adjust-points`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ amount })
      });
      if (!res.ok) throw new Error('Failed to adjust points');
      const data = await res.json();
      
      setUsers(arr => arr.map(u => u.id === id ? { ...u, points: data.balance } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, points: data.balance }));
      showToast(amount > 0 ? t("تم إضافة نقاط") : t("تم خصم نقاط"), amount > 0 ? C.green : C.orange);
    } catch (err) {
      console.error(err);
      showToast(t("فشل في تحديث النقاط"), C.red);
    }
  }

  async function handleToggleTrust(id) {
    const user = users.find(u => u.id === id);
    if (!user || user.is_super_admin) return;

    try {
      const token = localStorage.getItem('elite_token');
      const res = await fetch(`${getApiUrl()}/api/admin/users/${id}/toggle-trust`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json'
        }
      });
      if (!res.ok) throw new Error('Failed to toggle trust');
      const data = await res.json();
      
      setUsers(arr => arr.map(u => u.id === id ? { ...u, is_trusted: data.is_trusted } : u));
      if (selectedUser?.id === id) setSelectedUser(prev => ({ ...prev, is_trusted: data.is_trusted }));
      showToast(data.is_trusted ? t("تم منح الثقة للطالب") : t("تم سحب الثقة"), data.is_trusted ? C.green : C.red);
    } catch (err) {
      console.error(err);
      showToast(t("فشل في تحديث حالة الثقة"), C.red);
    }
  }

  async function handleSendNotification() {
    if (!notifTitle.trim() || !notifBody.trim()) {
      showToast(t("يرجى إدخال العنوان والمحتوى"), C.orange);
      return;
    }
    setSendingNotif(true);
    try {
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/admin/users/${selectedUser.id}/notify`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          message: notifBody,
          title: notifTitle 
        })
      });
      if (!res.ok) throw new Error('Failed to send notification');
      showToast(`${t("تم إرسال الإشعار لـ ")} ${selectedUser.name}`);
      setShowNotif(false);
      setNotifTitle("");
      setNotifBody("");
    } catch (err) {
      console.error(err);
      showToast(t("فشل إرسال الإشعار"), C.red);
    } finally {
      setSendingNotif(false);
    }
  }

  const [addingUser, setAddingUser] = useState(false);

  async function handleAddUser() {
    if (!fName.trim() || !mName.trim() || !gName.trim() || !lName.trim() || !newEmail.trim() || !tempPass.trim()) {
      showToast(t("يرجى إكمال جميع البيانات المطلوبة"), C.orange);
      return;
    }

    // No mapping needed since we'll use keys in the select
    const rawRole = newRole;

    try {
      setAddingUser(true);
      const token = localStorage.getItem('elite_token');
      const apiUrl = getApiUrl();
      const res = await fetch(`${apiUrl}/api/admin/users`, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          role: rawRole,
          first_name: fName,
          father_name: mName,
          grandfather_name: gName,
          last_name: lName,
          email: newEmail,
          password: tempPass,
          gender: newGender
        })
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.message || 'Failed to create user');
      }

      showToast(t("تم إنشاء الحساب بنجاح. يرجى تزويد المستخدم بكلمة المرور المؤقتة"));
      setShowAdd(false);
      setFName(""); setMName(""); setGName(""); setLName("");
      setNewEmail(""); setTempPass("");
      setNewRole("user"); setNewGender("male");
      fetchUsers(); // Refresh list
    } catch (err) {
      console.error(err);
      showToast(err.message || t("فشل في إنشاء الحساب"), C.red);
    } finally {
      setAddingUser(false);
    }
  }

  const roleColors = { [t("مستخدم مهتم")]: C.muted, [t("طالب جامعي")]: C.blue, [t("مساهم VIP")]: C.gold, [t("مشرف")]: C.orange, [t("أدمن")]: C.red };
  
  const stats = {
    total: users.length,
    active: users.filter(u => u.status === "active").length,
    banned: users.filter(u => u.status === "banned").length,
    vip: users.filter(u => u.role === t("مساهم VIP")).length
  };

  const filtered = users.filter(u => {
    const matchSearch = u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase());
    const matchRole = roleFilter === "all" || u.role === roleFilter;
    const matchStatus = statusFilter === "all" || u.status === statusFilter;
    return matchSearch && matchRole && matchStatus;
  });

  return (
    <>
      {toast && <div style={{ position: "fixed", top: 72, left: "50%", transform: "translateX(-50%)", background: C.dark, color: C.white, padding: "12px 24px", borderRadius: 12, fontSize: "0.9rem", fontWeight: 600, zIndex: 1001, borderRight: `4px solid ${toast.color}`, boxShadow: "0 8px 32px rgba(0,0,0,0.18)" }}>{toast.msg}</div>}

      <div className="admin-page-header" style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 28 }}>
        <div>
          <h1 style={{ fontSize: "1.4rem", fontWeight: 800, color: C.dark, margin: "0 0 6px" }}>{t("إدارة المستخدمين")}</h1>
          <p style={{ color: C.muted, fontSize: "0.88rem" }}>{t("متابعة نشاط الطلاب، تغيير الأدوار، وإدارة صلاحيات الوصول")}</p>
        </div>
        <Btn onClick={() => setShowAdd(true)} style={{ display: 'flex', alignItems: 'center', gap: 8 }}><PiUserPlusDuotone size={20}/> {t("إضافة مستخدم جديد")}</Btn>
      </div>

      <div className="admin-kpi-grid" style={{ display: "grid", gridTemplateColumns: "repeat(4, 1fr)", gap: 16, marginBottom: 24 }}>
        {[
          [t("إجمالي المستخدمين"), stats.total, C.blue, <PiUsersDuotone/>],
          [t("حسابات نشطة"), stats.active, C.green, <PiShieldCheckDuotone/>],
          [t("حسابات محظورة"), stats.banned, C.red, <PiProhibitDuotone/>],
          [t("مساهمين VIP"), stats.vip, C.gold, <PiUserDuotone/>]
        ].map(([label, val, col, icon]) => (
          <Card key={label} style={{ padding: 18 }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div>
                <div style={{ color: C.muted, fontSize: '0.75rem', marginBottom: 6 }}>{label}</div>
                <div style={{ fontSize: '1.6rem', fontWeight: 900, color: col }}>{val}</div>
              </div>
              <div style={{ width: 42, height: 42, borderRadius: 12, background: `${col}12`, color: col, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.4rem' }}>{icon}</div>
            </div>
          </Card>
        ))}
      </div>

      <Card style={{ padding: 20, marginBottom: 20 }}>
        <div className="admin-filter-bar" style={{ display: "flex", gap: 12 }}>
          <div style={{ flex: 1, position: "relative" }}>
            <input value={search} onChange={e => setSearch(e.target.value)} placeholder={t("البحث بالاسم أو البريد...")} style={{ ...inputStyle, paddingRight: 40 }} />
            <span style={{ position: "absolute", right: 14, top: "50%", transform: "translateY(-50%)", color: C.muted, display: 'flex' }}><PiMagnifyingGlassDuotone size={18}/></span>
          </div>
          <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} style={{ ...inputStyle, width: 160 }}>
            <option value="all">{t("كل الأدوار")}</option>
            <option value={t("مستخدم مهتم")}>{t("مستخدم مهتم")}</option>
            <option value={t("طالب جامعي")}>{t("طالب جامعي")}</option>
            <option value={t("مساهم VIP")}>{t("مساهم VIP")}</option>
            <option value={t("مشرف")}>{t("مشرف")}</option>
            <option value={t("أدمن")}>{t("أدمن")}</option>
          </select>
          <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} style={{ ...inputStyle, width: 140 }}>
            <option value="all">{t("كل الحالات")}</option>
            <option value="active">{t("نشط")}</option>
            <option value="banned">{t("محظور")}</option>
          </select>
        </div>
      </Card>

      <Card style={{ padding: 0, overflow: 'hidden' }}>
        <div className="admin-table-wrap">
          <table style={{ width: "100%", borderCollapse: "collapse", fontSize: "0.86rem" }}>
            <thead>
              <tr style={{ background: C.bg, borderBottom: `2px solid ${C.border}` }}>
                {[t("المستخدم"), t("الدور"), t("النقاط"), t("الموارد"), t("الاشتراك"), t("الحالة"), t("إجراءات")].map(h => (
                  <th key={h} style={{ padding: "14px 20px", textAlign: "start", fontWeight: 700, color: C.muted, fontSize: '0.8rem' }}>{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                Array(5).fill(0).map((_, i) => (
                  <tr key={i} style={{ borderBottom: `1px solid ${C.bg}` }}>
                    <td style={{ padding: "14px 20px" }}><Skeleton width="36px" height="36px" borderRadius="10px" /></td>
                    <td><Skeleton width="120px" height="15px" /><br /><Skeleton width="80px" height="10px" margin="4px 0 0" /></td>
                    <td><Skeleton width="80px" height="20px" /></td>
                    <td><Skeleton width="50px" height="15px" /></td>
                    <td><Skeleton width="100px" height="15px" /></td>
                    <td><Skeleton width="60px" height="22px" borderRadius="6px" /></td>
                    <td style={{ padding: "14px 20px" }}><Skeleton width="32px" height="32px" borderRadius="8px" /></td>
                  </tr>
                ))
              ) : filtered.length === 0 ? (
                <tr>
                  <td colSpan="7" style={{ padding: 60, textAlign: 'center', color: C.muted }}>{t("لم يتم العثور على مستخدمين يطابقون البحث")}</td>
                </tr>
              ) : filtered.map(u => (
                <tr key={u.id} style={{ borderBottom: `1px solid ${C.border}`, transition: "all .2s", opacity: u.status === "banned" ? 0.6 : 1 }} onMouseEnter={e => e.currentTarget.style.background = C.bg} onMouseLeave={e => e.currentTarget.style.background = "transparent"}>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
                      <div style={{ width: 36, height: 36, borderRadius: 10, background: `${roleColors[u.role] || C.muted}15`, color: roleColors[u.role] || C.muted, display: "flex", alignItems: "center", justifyContent: "center", fontWeight: 800, fontSize: "0.9rem", position: 'relative' }}>
                        {(u.name || "?")[0]}
                        {u.is_super_admin && <div style={{ position: 'absolute', bottom: -4, right: -4, background: C.white, borderRadius: '50%', color: C.gold, fontSize: '0.65rem', border: `1px solid ${C.border}`, padding: 1 }}><PiShieldCheckDuotone/></div>}
                      </div>
                      <div>
                        <div style={{ fontWeight: 700, color: C.dark, display: 'flex', alignItems: 'center', gap: 6 }}>
                          {u.name || t("مستخدم")}
                          {u.is_super_admin && <Badge color={C.gold} style={{ fontSize: '0.6rem', padding: '1px 6px' }}>{t("مؤسس")}</Badge>}
                        </div>
                        <div style={{ fontSize: '0.74rem', color: C.muted }}>{u.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><Badge color={roleColors[u.role] || C.blue}>{u.role}</Badge></td>
                  <td style={{ fontWeight: 700, color: C.dark }}>{(u.points || 0).toLocaleString()}</td>
                  <td style={{ color: C.muted }}>{u.resources || 0} {t("مورد")}</td>
                  <td><span style={{ fontSize: '0.8rem', color: C.body }}>{u.sub}</span></td>
                  <td><Badge color={u.status === "active" ? C.green : C.red}>{u.status === "active" ? t("نشط") : t("محظور")}</Badge></td>
                  <td style={{ padding: "14px 20px" }}>
                    <div style={{ display: 'flex', gap: 8 }}>
                      <button 
                        onClick={() => !u.is_super_admin && setSelectedUser(u)} 
                        style={{ background: 'none', border: `1px solid ${C.border}`, borderRadius: 8, padding: '6px', cursor: u.is_super_admin ? 'not-allowed' : 'pointer', color: C.muted, opacity: u.is_super_admin ? 0.4 : 1 }}
                        title={u.is_super_admin ? t("حساب محمي") : ""}
                      >
                        <PiDotsThreeVerticalDuotone/>
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1000, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(4px)' }} onClick={() => setSelectedUser(null)}>
          <div style={{ background: C.white, borderRadius: 24, width: 500, maxWidth: '95%', overflow: 'hidden', boxShadow: "0 25px 50px rgba(0,0,0,0.2)" }} onClick={e => e.stopPropagation()}>
            <div style={{ background: `linear-gradient(135deg, ${roleColors[selectedUser.role] || C.dark}, ${C.dark})`, padding: 32, color: C.white, position: 'relative' }}>
              <div onClick={() => setSelectedUser(null)} style={{ position: 'absolute', top: 20, right: 20, background: 'rgba(255,255,255,0.2)', width: 32, height: 32, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}>✕</div>
              <div style={{ display: 'flex', alignItems: 'center', gap: 20 }}>
                <div style={{ width: 64, height: 64, borderRadius: 18, background: C.white, color: roleColors[selectedUser.role] || C.dark, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', fontWeight: 900 }}>{(selectedUser.name || "?")[0]}</div>
                <div>
                  <h2 style={{ margin: 0, fontSize: '1.4rem', fontWeight: 800 }}>{selectedUser.name || t("مستخدم")}</h2>
                  <div style={{ opacity: 0.8, fontSize: '0.9rem' }}>{selectedUser.email}</div>
                </div>
              </div>
            </div>
            
            <div style={{ padding: 28 }}>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 24 }}>
                <div style={{ background: C.bg, padding: 16, borderRadius: 12 }}>
                  <div style={{ color: C.muted, fontSize: '0.75rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><PiCoinsDuotone/> {t("النقاط الحالية")}</div>
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <span style={{ fontWeight: 800, fontSize: '1.2rem', color: C.dark }}>{selectedUser.points}</span>
                    <div style={{ display: 'flex', gap: 4 }}>
                       <button onClick={() => adjustPoints(selectedUser.id, 50)} style={{ border: 'none', background: C.greenBg, color: C.green, width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 800 }}>+</button>
                       <button onClick={() => adjustPoints(selectedUser.id, -50)} style={{ border: 'none', background: C.redBg, color: C.red, width: 24, height: 24, borderRadius: 6, cursor: 'pointer', fontWeight: 800 }}>-</button>
                    </div>
                  </div>
                </div>
                <div style={{ background: C.bg, padding: 16, borderRadius: 12 }}>
                  <div style={{ color: C.muted, fontSize: '0.75rem', marginBottom: 4, display: 'flex', alignItems: 'center', gap: 4 }}><PiFolderSimpleDuotone/> {t("الموارد")}</div>
                  <div style={{ fontWeight: 800, fontSize: '1.2rem', color: C.dark }}>{selectedUser.resources} <span style={{ fontSize: '0.8rem', fontWeight: 400 }}>{t("ملف")}</span></div>
                </div>
              </div>

              <div style={{ marginBottom: 24 }}>
                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 700, color: C.dark, marginBottom: 10 }}>{t("إجراءات إدارية سريعة")}</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 10 }}>
                  <Btn variant="secondary" onClick={() => handleStatusToggle(selectedUser.id)} style={{ color: selectedUser.status === "active" ? C.red : C.green, background: selectedUser.status === "active" ? C.redBg : C.greenBg, border: 'none', flex: 1, fontSize: '0.84rem' }}>
                    {selectedUser.status === "active" ? <><PiProhibitDuotone/> {t("حظر المستخدم")}</> : <><PiShieldCheckDuotone/> {t("إلغاء الحظر")}</>}
                  </Btn>
                  <Btn variant="secondary" onClick={() => setShowNotif(true)} style={{ color: C.blue, background: C.blueLight, border: 'none', flex: 1, fontSize: '0.84rem' }}>
                    <PiBellRingingDuotone/> {t("إرسال تنبيه")}
                  </Btn>
                  <Btn variant="secondary" onClick={() => handleToggleTrust(selectedUser.id)} style={{ color: selectedUser.is_trusted ? C.red : C.green, background: selectedUser.is_trusted ? C.redBg : C.greenBg, border: 'none', flex: 1, fontSize: '0.84rem' }}>
                    {selectedUser.is_trusted ? <><PiProhibitDuotone/> {t("سحب الثقة")}</> : <><PiShieldCheckDuotone/> {t("منح الثقة")}</>}
                  </Btn>
                  <select 
                    value={selectedUser.role} 
                    onChange={(e) => handleRoleChange(selectedUser.id, e.target.value)}
                    style={{ ...inputStyle, flex: 1, height: 'auto', padding: '10px 14px', fontSize: '0.84rem' }}
                  >
                    <option value={t("مستخدم مهتم")}>{t("مستخدم مهتم")}</option>
                    <option value={t("طالب جامعي")}>{t("طالب جامعي")}</option>
                    <option value={t("مساهم VIP")}>{t("مساهم VIP")}</option>
                    <option value={t("مشرف")}>{t("مشرف")}</option>
                    <option value={t("أدمن")}>{t("أدمن")}</option>
                  </select>
                </div>
              </div>

              <div style={{ display: 'flex', gap: 12, paddingTop: 10 }}>
                <Btn variant="primary" style={{ flex: 1 }} onClick={() => setSelectedUser(null)}>{t("حفظ وإغلاق")}</Btn>
                <Btn variant="secondary" onClick={() => setSelectedUser(null)}>{t("إلغاء")}</Btn>
              </div>
            </div>
          </div>
        </div>
      )}

      {showNotif && selectedUser && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(6px)' }} onClick={() => setShowNotif(false)}>
          <Card style={{ background: C.white, borderRadius: 24, width: 440, padding: 32, boxShadow: "0 30px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
               <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}><PiBellRingingDuotone/></div>
               <h3 style={{ margin: 0, color: C.dark, fontWeight: 800 }}>{t("إرسال إشعار مخصص")}</h3>
               <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: 6 }}>{t("إلى:")} <span style={{ fontWeight: 700, color: C.blue }}>{selectedUser.name}</span></p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("عنوان الإشعار")}</label>
                <input type="text" value={notifTitle} onChange={e => setNotifTitle(e.target.value)} placeholder={t("مثلاً: تنبيه هام، تحديث الحساب...")} style={{ ...inputStyle, background: C.bg }} />
              </div>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("محتوى الإشعار")}</label>
                <textarea value={notifBody} onChange={e => setNotifBody(e.target.value)} placeholder={t("اكتب نص الإشعار هنا...")} style={{ ...inputStyle, background: C.bg, height: 120, resize: 'none', paddingTop: 12 }} />
              </div>
              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <Btn onClick={handleSendNotification} style={{ flex: 1 }}>{t("إرسال الآن")}</Btn>
                <Btn variant="secondary" onClick={() => setShowNotif(false)}>{t("إلغاء")}</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}

      {showAdd && (
        <div style={{ position: "fixed", inset: 0, background: "rgba(0,0,0,0.6)", zIndex: 1100, display: "flex", alignItems: "center", justifyContent: "center", backdropFilter: 'blur(6px)' }} onClick={() => setShowAdd(false)}>
          <Card style={{ background: C.white, borderRadius: 24, width: 440, padding: 32, boxShadow: "0 30px 60px rgba(0,0,0,0.25)" }} onClick={e => e.stopPropagation()}>
            <div style={{ textAlign: 'center', marginBottom: 24 }}>
               <div style={{ width: 60, height: 60, borderRadius: '50%', background: C.blueLight, color: C.blue, display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '1.8rem', margin: '0 auto 16px' }}><PiUserPlusDuotone/></div>
               <h3 style={{ margin: 0, color: C.dark, fontWeight: 800 }}>{t("إضافة مستخدم جديد")}</h3>
               <p style={{ color: C.muted, fontSize: '0.85rem', marginTop: 6 }}>{t("قم بتعبئة بيانات الحساب الجديد أدناه")}</p>
            </div>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("دور المستخدم")}</label>
                <select value={newRole} onChange={e => setNewRole(e.target.value)} style={{ ...inputStyle, background: C.bg }}>
                   <option value="student_school">{t("مستخدم مهتم")}</option>
                   <option value="student_university">{t("طالب جامعي")}</option>
                   <option value="vip">{t("مساهم VIP")}</option>
                   <option value="moderator">{t("مشرف")}</option>
                   <option value="admin">{t("أدمن")}</option>
                </select>
              </div>
              
              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("الجنس")}</label>
                <select value={newGender} onChange={e => setNewGender(e.target.value)} style={{ ...inputStyle, background: C.bg }}>
                   <option value="male">{t("ذكر")}</option>
                   <option value="female">{t("أنثى")}</option>
                </select>
              </div>

              <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr", gap: 12 }}>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("الاسم الأول")}</label>
                  <input type="text" value={fName} onChange={e => setFName(e.target.value)} style={{ ...inputStyle, background: C.bg }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("اسم الأب")}</label>
                  <input type="text" value={mName} onChange={e => setMName(e.target.value)} style={{ ...inputStyle, background: C.bg }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("اسم الجد")}</label>
                  <input type="text" value={gName} onChange={e => setGName(e.target.value)} style={{ ...inputStyle, background: C.bg }} />
                </div>
                <div>
                  <label style={{ fontSize: "0.8rem", fontWeight: 700, color: C.muted, marginBottom: 6 }}>{t("العائلة / اللقب")}</label>
                  <input type="text" value={lName} onChange={e => setLName(e.target.value)} style={{ ...inputStyle, background: C.bg }} />
                </div>
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("البريد الإلكتروني")}</label>
                <input type="email" value={newEmail} onChange={e => setNewEmail(e.target.value)} placeholder="user@example.com" style={{ ...inputStyle, background: C.bg }} />
              </div>

              <div>
                <label style={{ display: "block", fontSize: "0.82rem", fontWeight: 700, color: C.muted, marginBottom: 8 }}>{t("كلمة مرور مؤقتة")}</label>
                <input type="text" value={tempPass} onChange={e => setTempPass(e.target.value)} placeholder="Elite@2024" style={{ ...inputStyle, background: C.bg }} />
                <p style={{ color: C.muted, fontSize: '0.7rem', marginTop: 4 }}>{t("سيُطلب من المستخدم تغييرها عند أول دخول")}</p>
              </div>

              <div style={{ display: 'flex', gap: 12, marginTop: 10 }}>
                <Btn onClick={handleAddUser} style={{ flex: 1, opacity: addingUser ? 0.7 : 1, cursor: addingUser ? 'wait' : 'pointer' }} disabled={addingUser}>
                  {addingUser ? t("جاري الإنشاء...") : t("إنشاء الحساب")}
                </Btn>
                <Btn variant="secondary" onClick={() => setShowAdd(false)} disabled={addingUser}>{t("إلغاء")}</Btn>
              </div>
            </div>
          </Card>
        </div>
      )}
      <Pagination meta={meta} onPageChange={fetchUsers} />
    </>
  );
}
