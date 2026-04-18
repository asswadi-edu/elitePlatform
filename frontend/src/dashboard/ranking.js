import React, { useContext } from "react";
import { C } from "../tokens";
import { LanguageContext } from "../LanguageContext";
import { SettingsContext } from "../SettingsContext";
import { 
  PiGraduationCapDuotone, PiLightningDuotone, PiStarDuotone, 
  PiThumbsUpDuotone, PiUserCircleDuotone, PiClockDuotone 
} from "react-icons/pi";

export const RANKS = [
  { name:"طالب",  minPts:0,  maxPts:24,  color:"#6B7280", bg:"#F3F4F6", icon:<PiGraduationCapDuotone size={18}/>, likesNeeded:0,   borderColor:"#D1D5DB", useColor:true, useFrame:false, frameUrl:"" },
  { name:"نشط",   minPts:25, maxPts:49,  color:"#3B82F6", bg:"#EFF6FF", icon:<PiLightningDuotone size={18}/>, likesNeeded:250, borderColor:"#3B82F6", useColor:true, useFrame:false, frameUrl:"" },
  { name:"متميز", minPts:50, maxPts:74,  color:"#F59E0B", bg:"#FFFBEB", icon:<PiStarDuotone size={18}/>, likesNeeded:500, borderColor:"#F59E0B", useColor:true, useFrame:false, frameUrl:"" },
  { name:"VIP",   minPts:75, maxPts:100, color:"#8B5CF6", bg:"#F5F3FF", icon:<PiStarDuotone size={18}/>, likesNeeded:750, borderColor:"#8B5CF6", useColor:true, useFrame:true,  frameUrl:"https://cdn-icons-png.flaticon.com/512/610/610120.png" }, // Mock frame for VIP
];

export function likesToPoints(likes) { return Math.min(100, Math.floor(likes / 10)); }

const renderRankIcon = (r, size = 18) => {
  if (typeof r.icon === 'object') return React.cloneElement(r.icon, { size });
  const IconMap = { PiGraduationCapDuotone, PiLightningDuotone, PiStarDuotone, PiThumbsUpDuotone };
  const Icon = IconMap[r.icon] || PiUserCircleDuotone;
  return <Icon size={size} />;
}

/**
 * Enhanced getRank that attempts to use dynamic ranks first, then falls back to hardcoded.
 */
export function getRank(pts, dynamicRanks = null) { 
  const currentRanks = dynamicRanks || RANKS;
  return currentRanks.slice().sort((a,b) => b.minPts - a.minPts).find(r => pts >= r.minPts) || currentRanks[0]; 
}

export function RankBadge({ points, compact = false }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const dynamicRanks = settings?.ranking_system;
  const rank = getRank(points, dynamicRanks);
  
  return (
    <span style={{ 
      background:rank.bg, 
      color:rank.color, 
      border:`1px solid ${rank.color}30`, 
      borderRadius:20, 
      padding: compact ? "1px 8px" : "3px 12px", 
      fontSize: compact ? "0.68rem" : "0.76rem", 
      fontWeight: 700, 
      display: "inline-flex", 
      alignItems: "center", 
      gap: compact ? 4 : 6 
    }}>
      {renderRankIcon(rank, compact ? 12 : 14)} {t(rank.name)}
    </span>
  );
}

export function RankCard({ likes = 0 }) {
  const { t } = useContext(LanguageContext);
  const { settings } = useContext(SettingsContext);
  const dynamicRanks = settings?.ranking_system;
  const points = likesToPoints(likes);
  const rank   = getRank(points, dynamicRanks);
  const next   = (dynamicRanks || RANKS).find(r => r.minPts > points);
  const pct    = next ? Math.round(((points - rank.minPts) / (next.minPts - rank.minPts)) * 100) : 100;
  
  // Real logic from settings or fallback
  const likesPerPoint = settings?.likes_per_point || 10;
  const likesForNext = next ? ((next.minPts - points) * likesPerPoint) : 0;

  return (
    <div style={{ background:`linear-gradient(135deg, ${rank.color}18, ${rank.color}06)`, border:`1.5px solid ${rank.color}30`, borderRadius:14, padding:"18px 20px" }}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
        <div>
          <div style={{ fontSize:"0.74rem", color:C.muted, marginBottom:4 }}>{t("مستواك الحالي")}</div>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <span style={{ color:rank.color, display:'flex' }}>{renderRankIcon(rank, 28)}</span>
            <span style={{ fontWeight:800, color:rank.color, fontSize:"1.2rem" }}>{t(rank.name)}</span>
          </div>
        </div>
        <div style={{ textAlign:"center", background:rank.color+"15", border:`1.5px solid ${rank.color}30`, borderRadius:12, padding:"8px 16px" }}>
          <div style={{ fontWeight:900, color:rank.color, fontSize:"1.8rem", lineHeight:1 }}>{points}</div>
          <div style={{ fontSize:"0.7rem", color:C.muted, marginTop:2 }}>{t("نقطة")}</div>
        </div>
      </div>
      <div style={{ display:"flex", gap:14, marginBottom:12, flexWrap:"wrap" }}>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:C.white, borderRadius:8, padding:"5px 10px", border:`1px solid ${C.border}` }}>
          <PiThumbsUpDuotone size={16} color={C.blue}/>
          <span style={{ fontSize:"0.78rem", color:C.dark, fontWeight:600 }}>{likes}{t(" إعجاب")}</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:6, background:C.white, borderRadius:8, padding:"5px 10px", border:`1px solid ${C.border}` }}>
          <span style={{ fontSize:"0.78rem", color:C.muted }}>{t(`كل ${likesPerPoint} إعجابات = نقطة واحدة`)}</span>
        </div>
      </div>
      {next && (
        <>
          <div style={{ background:"rgba(0,0,0,0.07)", borderRadius:6, height:8, marginBottom:6, overflow:"hidden" }}>
            <div style={{ background:`linear-gradient(90deg,${rank.color},${rank.color}BB)`, width:`${pct}%`, height:"100%", borderRadius:6, transition:"width .6s ease" }} />
          </div>
          <div style={{ display:"flex", justifyContent:"space-between" }}>
            <span style={{ fontSize:"0.72rem", color:C.muted }}>{points - rank.minPts} / {next.minPts - rank.minPts}{t(" نقطة")}</span>
            <span style={{ fontSize:"0.72rem", color:rank.color, fontWeight:600, display:'flex', alignItems:'center', gap:4 }}>{renderRankIcon(next, 14)} {t(next.name)}{t(" — يحتاج ")}{likesForNext}{t(" إعجاب إضافي")}</span>
          </div>
        </>
      )}
      {!next && (
        <div style={{ textAlign:"center", padding:"6px 0", fontSize:"0.82rem", color:rank.color, fontWeight:700, display:'flex', alignItems:'center', justifyContent:'center', gap:8 }}>
          {t("وصلت للمستوى الأعلى! أنت الآن ")} <span style={{ display:'flex' }}>{renderRankIcon(rank, 18)}</span> {t(rank.name)}
        </div>
      )}
    </div>
  );
}
