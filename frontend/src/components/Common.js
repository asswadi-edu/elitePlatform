import React, { useState } from "react";
import { C, inputStyle } from "../tokens";
import { PiCaretDownBold, PiMonitorDuotone, PiFirstAidKitDuotone, PiChartBarDuotone, PiPaletteDuotone, PiAtomDuotone, PiFlaskDuotone, PiGavelDuotone, PiGlobeDuotone, PiLightbulbDuotone, PiStethoscopeDuotone, PiShapesDuotone, PiDesktopDuotone, PiRobotDuotone, PiHeartbeatDuotone, PiPillDuotone } from "react-icons/pi";

export function SearchableSelect({ value, onChange, options = [], placeholder, disabled, t, style = {} }) {
  const [isOpen, setIsOpen] = useState(false);
  const [search, setSearch] = useState("");
  const safeOptions = Array.isArray(options) ? options : [];
  const selectedOption = safeOptions.find(o => String(o.id) === String(value));

  const filtered = safeOptions.filter(o => 
    o.name && o.name.toLowerCase().includes(search.toLowerCase())
  );

  return (
    <div style={{ position: 'relative', width: '100%', ...style }}>
      <div 
        onClick={() => !disabled && setIsOpen(!isOpen)}
        style={{ 
          ...inputStyle, 
          background: C.white, 
          cursor: disabled ? 'not-allowed' : 'pointer',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          opacity: disabled ? 0.6 : 1,
          gap: 10
        }}
      >
        <span style={{ 
          color: selectedOption ? C.dark : C.muted, 
          whiteSpace: 'nowrap', 
          overflow: 'hidden', 
          textOverflow: 'ellipsis',
          fontSize: '0.88rem'
        }}>
          {selectedOption ? selectedOption.name : placeholder}
        </span>
        <PiCaretDownBold size={12} color={C.muted} style={{ minWidth: 12 }} />
      </div>

      {isOpen && (
        <>
          <div 
            style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, zIndex: 99 }} 
            onClick={() => setIsOpen(false)} 
          />
          <div style={{ 
            position: 'absolute', top: '100%', left: 0, right: 0, zIndex: 100, 
            background: C.white, borderRadius: 12, marginTop: 6,
            boxShadow: '0 12px 40px rgba(0,0,0,0.18)', border: `1px solid ${C.border}`,
            maxHeight: 280, overflowY: 'auto'
          }}>
            <div style={{ padding: 10, borderBottom: `1px solid ${C.border}`, position: 'sticky', top: 0, background: C.white, zIndex: 1 }}>
              <input 
                autoFocus
                value={search}
                onChange={e => setSearch(e.target.value)}
                placeholder={t ? t("بحث...") : "Search..."}
                style={{ ...inputStyle, padding: '8px 12px', fontSize: '0.82rem', height: 36 }}
                onClick={e => e.stopPropagation()}
              />
            </div>
            <div style={{ padding: '4px 0' }}>
              {filtered.length > 0 ? filtered.map(o => (
                <div 
                  key={o.id}
                  onClick={() => { onChange(o.id); setIsOpen(false); setSearch(""); }}
                  style={{ 
                    padding: '10px 15px', cursor: 'pointer', fontSize: '0.86rem',
                    background: String(o.id) === String(value) ? C.blueLight : 'transparent',
                    color: String(o.id) === String(value) ? C.blue : C.dark,
                    fontWeight: String(o.id) === String(value) ? 700 : 400
                  }}
                  onMouseEnter={e => e.currentTarget.style.background = C.bg}
                  onMouseLeave={e => e.currentTarget.style.background = String(o.id) === String(value) ? C.blueLight : 'transparent'}
                >
                  {o.name}
                </div>
              )) : (
                <div style={{ padding: 20, fontSize: '0.82rem', color: C.muted, textAlign: 'center' }}>
                  {t ? t("لا توجد نتائج") : "No results"}
                </div>
              )}
            </div>
          </div>
        </>
      )}
    </div>
  );
}

// Professional Shimmer Animation
const shimmerStyle = `
  @keyframes shimmer {
    0% { background-position: -468px 0; }
    100% { background-position: 468px 0; }
  }
`;
if (typeof document !== 'undefined') {
  const style = document.createElement('style');
  style.innerHTML = shimmerStyle;
  document.head.appendChild(style);
}

export function Skeleton({ width = "100%", height = "20px", borderRadius = "8px", margin = "0" }) {
  return (
    <div style={{
      width, height, borderRadius, margin,
      background: "#f6f7f8",
      backgroundImage: "linear-gradient(to right, #f6f7f8 0%, #edeef1 20%, #f6f7f8 40%, #f6f7f8 100%)",
      backgroundRepeat: "no-repeat",
      backgroundSize: "800px 104px",
      display: "inline-block",
      animation: "shimmer 1.5s infinite linear forwards"
    }} />
  );
}

export function Btn({ children, variant = "primary", onClick, style = {}, disabled = false }) {
  const base = { fontFamily:"inherit", fontWeight:700, fontSize:"0.92rem", borderRadius:9, padding:"11px 26px", cursor: disabled ? "not-allowed" : "pointer", border:"none", transition:"all .2s", opacity: disabled ? 0.5 : 1, ...style };
  const styles = {
    primary:   { background:C.blue, color:C.white, boxShadow:`0 4px 18px color-mix(in srgb, ${C.blue} 27%, transparent)` },
    secondary: { background:C.white, color:C.dark, border:`1.5px solid ${C.border}` },
    outline:   { background:"transparent", color:C.white, border:"1.5px solid rgba(255,255,255,0.5)" },
    ghost:     { background:C.blueLight, color:C.blue },
    danger:    { background:C.red, color:C.white },
    success:   { background:C.green, color:C.white },
  };
  return (
    <button style={{ ...base, ...styles[variant] }} onClick={!disabled ? onClick : undefined}
      onMouseEnter={e => { if (!disabled) { e.currentTarget.style.opacity=".85"; e.currentTarget.style.transform="translateY(-1px)"; }}}
      onMouseLeave={e => { if (!disabled) { e.currentTarget.style.opacity="1"; e.currentTarget.style.transform="none"; }}}>
      {children}
    </button>
  );
}

export function Badge({ children, color = C.blue, style = {} }) {
  return <span style={{ background:color, color:C.white, borderRadius:6, padding:"3px 10px", fontSize:"0.72rem", fontWeight:800, display:'inline-flex', alignItems:'center', gap:4, ...style }}>{children}</span>;
}

export function Card({ children, style = {}, hover = true, ...props }) {
  const [hov, setHov] = useState(false);
  return (
    <div {...props} onMouseEnter={() => hover && setHov(true)} onMouseLeave={() => setHov(false)}
      style={{ background:C.white, borderRadius:16, border:`1px solid ${C.border}`, padding:24, transition:"all .25s", boxShadow: hov ? "0 12px 40px rgba(0,0,0,0.09)" : "0 2px 8px rgba(0,0,0,0.04)", transform: hov ? "translateY(-3px)" : "none", ...style }}>
      {children}
    </div>
  );
}

export function SectionHead({ title, sub, align = "center" }) {
  return (
    <div style={{ textAlign:align, marginBottom:56 }}>
      <h2 style={{ fontSize:"1.95rem", fontWeight:800, color:C.dark, margin:"0 0 10px", lineHeight:1.3 }}>{title}</h2>
      {sub && <p style={{ color:C.muted, fontSize:"1rem", lineHeight:1.7, maxWidth:560, margin: align==="center" ? "0 auto" : 0 }}>{sub}</p>}
    </div>
  );
}

export function Pill({ children }) {
  return (
    <div style={{ display:"inline-flex", alignItems:"center", gap:7, background:C.blueLight, color:C.blue, borderRadius:20, padding:"5px 14px", fontSize:"0.8rem", fontWeight:700, marginBottom:20, border:`1px solid ${C.blueMid}` }}>
      <span style={{ width:7, height:7, borderRadius:"50%", background:C.blue, display:"inline-block" }} />
      {children}
    </div>
  );
}

export function Divider() {
  return <div style={{ height:1, background:C.border }} />;
}

export function Field({ label, children }) {
  return (
    <div style={{ marginBottom:18 }}>
      <label style={{ display:"block", fontWeight:600, fontSize:"0.86rem", color:C.dark, marginBottom:8 }}>{label}</label>
      {children}
    </div>
  );
}

export const AVAILABLE_ICONS = {
  Monitor: <PiMonitorDuotone />,
  Medical: <PiFirstAidKitDuotone />,
  Business: <PiChartBarDuotone />,
  Creative: <PiPaletteDuotone />,
  Science: <PiAtomDuotone />,
  Lab: <PiFlaskDuotone />,
  Law: <PiGavelDuotone />,
  Global: <PiGlobeDuotone />,
  Idea: <PiLightbulbDuotone />,
  Health: <PiStethoscopeDuotone />,
  General: <PiShapesDuotone />,
  Desktop: <PiDesktopDuotone />,
  Robot: <PiRobotDuotone />,
  Heartbeat: <PiHeartbeatDuotone />,
  Pill: <PiPillDuotone />,
};

const getMajorIcon = (m, isLarge = false) => {
  if (m.image_url) {
    return <img src={m.image_url} alt={m.name} style={{ width: isLarge ? 80 : 48, height: isLarge ? 80 : 48, objectFit: "cover", borderRadius: 8 }} />;
  }
  const key = m.field?.icon_key || "General";
  return AVAILABLE_ICONS[key] || <PiShapesDuotone />;
};

export function MajorCard({ major, onClick, t }) {
  const m = major;
  const fieldColor = m.field?.color || C.blue;
  
  return (
    <Card style={{ 
      padding: 0, 
      overflow: "hidden", 
      height: "100%", 
      display: "flex", 
      flexDirection: "column",
      borderRadius: 20,
      border: `1px solid ${C.border}`,
      boxShadow: "0 4px 12px rgba(0,0,0,0.03)",
      transition: "all 0.3s ease"
    }} hover onClick={onClick}>
      <div style={{ 
        height: 130, 
        background: `linear-gradient(135deg, ${fieldColor}20, ${fieldColor}05)`, 
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center", 
        fontSize: "3.2rem", 
        color: fieldColor,
        position: 'relative',
        overflow: 'hidden'
      }}>
        {m.image_url ? (
            <img src={m.image_url} alt={m.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
        ) : (
            <>
                <div style={{ position: 'absolute', inset: 0, opacity: 0.1, background: `radial-gradient(circle at center, ${fieldColor} 0%, transparent 70%)` }} />
                <div style={{ position: 'relative', zIndex: 1 }}>{getMajorIcon(m)}</div>
            </>
        )}
      </div>
      
      <div style={{ padding: "24px", flex: 1, display: "flex", flexDirection: "column" }}>
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
          <Badge color={fieldColor} style={{ fontSize:'0.7rem', padding:'4px 10px' }}>{m.field?.name}</Badge>
          {m.duration && <span style={{ fontSize:'0.75rem', color:C.muted, fontWeight:700 }}>{m.duration}</span>}
        </div>
        
        <h3 style={{ fontSize: "1.1rem", fontWeight: 900, color: C.dark, margin: "0 0 8px" }}>{m.name}</h3>
        
        {m.job_title && m.job_title.length > 0 && (
          <div style={{ fontSize: "0.8rem", color: fieldColor, fontWeight: 700, marginBottom: 12, display: "flex", flexWrap: "wrap", gap: "4px 8px" }}>
            {m.job_title.slice(0, 2).map((title, idx) => (
              <span key={idx} style={{ background: fieldColor + "10", padding: "2px 8px", borderRadius: 6 }}>{title}</span>
            ))}
            {m.job_title.length > 2 && <span style={{ color: C.muted }}>+{m.job_title.length - 2}</span>}
          </div>
        )}
        
        <p style={{ color: C.muted, fontSize: "0.88rem", lineHeight: 1.7, marginBottom: 20, flex: 1, display: "-webkit-box", WebkitLineClamp: 3, WebkitBoxOrient: "vertical", overflow: "hidden" }}>
          {m.description || (t ? t("اكتشف آفاق هذا التخصص ومساراته المهنية الواعدة.") : "Explore the horizons of this promising major.")}
        </p>
        
        <Btn variant="ghost" style={{ 
          width: '100%',
          color: fieldColor, 
          background: fieldColor + "10", 
          fontSize: "0.88rem", 
          fontWeight: 800,
          padding: "10px 16px", 
          marginTop: "auto",
          borderRadius: 12,
          border: `1px solid ${fieldColor}20`
        }} onClick={onClick}>
          {t ? t("استكشف التخصص") : "Explore Major"}
        </Btn>
      </div>
    </Card>
  );
}

export function MajorDetailsModal({ major, onClose, t }) {
  if (!major) return null;
  const m = major;
  const fieldColor = m.field?.color || C.blue;

  return (
    <div style={{ 
      position: "fixed", top: 0, left: 0, right: 0, bottom: 0, 
      background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)", 
      zIndex: 10000, display: "flex", alignItems: "center", 
      justifyContent: "center", padding: 20 
    }} onClick={onClose}>
      <div style={{ 
        background: C.white, borderRadius: 24, width: "100%", 
        maxWidth: 650, maxHeight: "90vh", overflowY: "auto", 
        boxShadow: "0 20px 40px rgba(0,0,0,0.15)", position: "relative" 
      }} onClick={e => e.stopPropagation()}>
        <div style={{ 
          position: "sticky", top: 16, right: 16, width: 32, height: 32, 
          borderRadius: "50%", background: C.white, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", 
          display: "flex", alignItems: "center", justifyContent: "center", 
          cursor: "pointer", color: C.dark, fontWeight: 800, zIndex: 10, marginInlineStart: "auto" 
        }} onClick={onClose}>×</div>
        
        <div style={{ 
          height: 160, 
          background: `linear-gradient(135deg, ${fieldColor}33, ${fieldColor}10)`, 
          display: "flex", alignItems: "center", justifyContent: "center", 
          fontSize: "4.5rem", color: fieldColor, position: 'relative', overflow: 'hidden'
        }}>
          {m.image_url ? (
             <img src={m.image_url} alt={m.name} style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', zIndex: 1 }} />
          ) : (
             <div style={{ position: 'relative', zIndex: 1 }}>{getMajorIcon(m, true)}</div>
          )}
        </div>
        
        <div style={{ padding: "32px" }}>
          <div style={{ marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12, marginBottom: 6 }}>
              <h2 style={{ fontSize: "1.75rem", fontWeight: 900, color: C.dark, margin: 0 }}>{m.name}</h2>
              <Badge color={fieldColor}>{m.field?.name}</Badge>
            </div>
            {m.job_title && m.job_title.length > 0 && (
              <div style={{ display: "flex", flexWrap: "wrap", gap: 8, marginTop: 4 }}>
                {m.job_title.map((title, idx) => (
                  <span key={idx} style={{ 
                    fontSize: "0.9rem", fontWeight: 700, 
                    color: fieldColor, background: fieldColor + "10", 
                    padding: "4px 12px", borderRadius: 8 
                  }}>
                    {title}
                  </span>
                ))}
              </div>
            )}
          </div>

          <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(130px, 1fr))", gap: 16, marginBottom: 32 }}>
            <div style={{ background: C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 700, marginBottom: 4 }}>{t ? t("مدة الدراسة") : "Duration"}</div>
              <div style={{ fontWeight: 800, color: C.dark }}>{m.duration || (t ? t("غير محدد") : "Not specified")}</div>
            </div>
            <div style={{ background: C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 700, marginBottom: 4 }}>{t ? t("نوع الدرجة") : "Degree"}</div>
              <div style={{ fontWeight: 800, color: C.dark }}>{m.degree_type || (t ? t("غير محدد") : "Not specified")}</div>
            </div>
            <div style={{ background: C.bg, padding: "12px 16px", borderRadius: 12, border: `1px solid ${C.border}` }}>
              <div style={{ fontSize: "0.75rem", color: C.muted, fontWeight: 700, marginBottom: 4 }}>{t ? t("طبيعة الدراسة") : "Nature of Study"}</div>
              <div style={{ fontWeight: 800, color: C.dark }}>{m.study_nature || (t ? t("غير محدد") : "Not specified")}</div>
            </div>
          </div>
          
          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
            {m.description && (
              <div>
                <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 10, fontSize: "1rem" }}>{t ? t("نبذة عن التخصص") : "About Major"}</h4>
                <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8 }}>{m.description}</p>
              </div>
            )}

            {m.why_choose_major && (
              <div>
                <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 10, fontSize: "1rem" }}>{t ? t("لماذا تختار هذا التخصص؟") : "Why Choose This"}</h4>
                <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8 }}>{m.why_choose_major}</p>
              </div>
            )}

            {m.future_of_major && (
              <div>
                <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 10, fontSize: "1rem" }}>{t ? t("مستقبل التخصص") : "Future of Major"}</h4>
                <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8 }}>{m.future_of_major}</p>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
            {m.core_subjects?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("أبرز المواد الدراسية") : "Core Subjects"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.core_subjects.map((s, i) => (
                     <span key={i} style={{ padding: "6px 14px", background: C.blueLight, color: C.blue, borderRadius: 20, fontSize: "0.84rem", fontWeight: 700 }}>{s}</span>
                   ))}
                 </div>
              </div>
            )}

            {m.required_skills?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("المهارات المطلوبة قبل دخول التخصص") : "Required Skills"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.required_skills.map((s, i) => (
                     <span key={i} style={{ padding: "6px 14px", background: "#e8f5e9", color: "#2e7d32", borderRadius: 20, fontSize: "0.84rem", fontWeight: 700 }}>{s}</span>
                   ))}
                 </div>
              </div>
            )}

            {m.acquired_skills?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("مواصفات الخريج (المهارات المكتسبة)") : "Acquired Skills"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.acquired_skills.map((s, i) => (
                     <span key={i} style={{ padding: "6px 14px", background: C.blueLight, color: C.blue, borderRadius: 20, fontSize: "0.84rem", fontWeight: 700 }}>{s}</span>
                   ))}
                 </div>
              </div>
            )}

            {m.sustaining_skills?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("المهارات التي تبقيك مطلوباً") : "Sustaining Skills"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.sustaining_skills.map((s, i) => (
                     <span key={i} style={{ padding: "6px 14px", background: "#fff9db", color: "#f59f00", borderRadius: 20, fontSize: "0.84rem", fontWeight: 700 }}>{s}</span>
                   ))}
                 </div>
              </div>
            )}
          </div>

          <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32 }}>
            {m.workplaces?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("أين سيعمل الخريجون") : "Workplaces"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.workplaces.map((w, i) => (
                     <div key={i} style={{ padding: "8px 16px", background: C.white, borderRadius: 10, fontSize: "0.86rem", color: C.dark, fontWeight: 700, border: `1px solid ${C.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>{w}</div>
                   ))}
                 </div>
              </div>
            )}

            {m.in_demand_jobs?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("أكثر الوظائف طلباً محلياً وإقليمياً") : "In-Demand Jobs"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.in_demand_jobs.map((j, i) => (
                     <div key={i} style={{ padding: "8px 16px", background: "#e8f5e9", color: "#2e7d32", borderRadius: 10, fontSize: "0.86rem", fontWeight: 700, border: `1px solid #2e7d3230` }}>{j}</div>
                   ))}
                 </div>
              </div>
            )}

            {m.careers?.length > 0 && (
              <div>
                 <h4 style={{ fontWeight: 800, color: C.dark, marginBottom: 12, fontSize: "1rem" }}>{t ? t("المستقبل الوظيفي (مسميات أخرى)") : "Other Career Paths"}</h4>
                 <div style={{ display: "flex", flexWrap: "wrap", gap: 8 }}>
                   {m.careers.map((career, i) => (
                     <div key={i} style={{ padding: "8px 16px", background: C.white, borderRadius: 10, fontSize: "0.86rem", color: C.dark, fontWeight: 700, border: `1px solid ${C.border}`, boxShadow: "0 2px 4px rgba(0,0,0,0.02)" }}>
                       {career}
                     </div>
                   ))}
                 </div>
              </div>
            )}
          </div>

          {(m.when_not_suitable || m.global_opportunities) && (
            <div style={{ display: "flex", flexDirection: "column", gap: 24, marginBottom: 32, background: C.bg, padding: 24, borderRadius: 16, border: `1px solid ${C.border}` }}>
              {m.when_not_suitable && (
                <div>
                  <h4 style={{ fontWeight: 800, color: "#e03131", marginBottom: 10, fontSize: "1rem" }}>{t ? t("متى لا يكون مناسباً لك؟") : "When is it not suitable"}</h4>
                  <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8 }}>{m.when_not_suitable}</p>
                </div>
              )}
              
              {m.global_opportunities && (
                <div>
                  <h4 style={{ fontWeight: 800, color: C.blue, marginBottom: 10, fontSize: "1rem" }}>{t ? t("فرص العمل عالمياً") : "Global Opportunities"}</h4>
                  <p style={{ color: C.muted, fontSize: "0.95rem", lineHeight: 1.8 }}>{m.global_opportunities}</p>
                </div>
              )}
            </div>
          )}
          
          <div style={{ display: "flex", justifyContent: "center" }}>
            <Btn variant="secondary" onClick={onClose} style={{ height: 48, padding: "0 40px", fontSize: "1rem" }}>{t ? t("إغلاق") : "Close"}</Btn>
          </div>
        </div>
      </div>
    </div>
  );
}

export function Pagination({ meta, onPageChange }) {
  const { current_page, last_page } = meta;
  if (last_page <= 1) return null;

  const pages = [];
  let start = Math.max(1, current_page - 2);
  let end = Math.min(last_page, start + 4);
  if (end === last_page) start = Math.max(1, end - 4);

  for (let i = start; i <= end; i++) pages.push(i);

  return (
    <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 24, padding: '10px 0' }}>
      <Btn variant="secondary" onClick={() => onPageChange(current_page - 1)} disabled={current_page === 1} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
        &larr;
      </Btn>

      {start > 1 && (
        <>
          <Btn variant={current_page === 1 ? 'primary' : 'secondary'} onClick={() => onPageChange(1)} style={{ padding: '8px 12px', minWidth: 38, fontSize: '0.8rem' }}>1</Btn>
          {start > 2 && <span style={{ color: C.muted }}>...</span>}
        </>
      )}

      {pages.map(p => (
        <Btn 
          key={p} 
          variant={current_page === p ? 'primary' : 'secondary'} 
          onClick={() => onPageChange(p)} 
          style={{ padding: '8px 12px', minWidth: 38, fontSize: '0.8rem' }}
        >
          {p}
        </Btn>
      ))}

      {end < last_page && (
        <>
          {end < last_page - 1 && <span style={{ color: C.muted }}>...</span>}
          <Btn variant={current_page === last_page ? 'primary' : 'secondary'} onClick={() => onPageChange(last_page)} style={{ padding: '8px 12px', minWidth: 38, fontSize: '0.8rem' }}>{last_page}</Btn>
        </>
      )}

      <Btn variant="secondary" onClick={() => onPageChange(current_page + 1)} disabled={current_page === last_page} style={{ padding: '8px 14px', fontSize: '0.8rem' }}>
        &rarr;
      </Btn>
    </div>
  );
}
