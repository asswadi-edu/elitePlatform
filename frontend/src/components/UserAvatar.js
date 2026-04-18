import React, { useContext, useState } from 'react';
import { C } from '../tokens';
import { getApiUrl } from '../api';
import { SettingsContext } from '../SettingsContext';
import { getRank } from '../dashboard/ranking';
import { PiUserCircleDuotone } from 'react-icons/pi';

/**
 * Resolves an image path to a full URL.
 * If it's already absolute (http/https), use as-is.
 * If relative (/storage/...), prefix with apiUrl.
 */
function resolveUrl(path) {
  if (!path) return null;
  if (path.startsWith('http://') || path.startsWith('https://')) return path;
  return getApiUrl() + path;
}

export default function UserAvatar({ user, size = 40, style = {} }) {
  const { settings } = useContext(SettingsContext);
  const [frameError, setFrameError] = useState(false);

  const points = user?.points?.balance || 0;
  const dynamicRanks = settings?.ranking_system;
  const rank = getRank(points, dynamicRanks);

  const hasAvatar = !!(user?.profile?.avatar_url);
  const avatarSrc = hasAvatar ? resolveUrl(user.profile.avatar_url) : null;

  const useColor = !!(rank?.useColor && rank?.borderColor);
  const useFrame = !!(rank?.useFrame && rank?.frameUrl && !frameError);
  const frameUrl = useFrame ? resolveUrl(rank.frameUrl) : null;
  const borderColor = rank?.borderColor || C.border;

  // When a frame is active, remove the border (frame replaces it visually)
  const borderWidth = useColor && !useFrame ? Math.max(2, Math.round(size * 0.055)) : 0;
  // Slightly shrink the avatar to give the frame visual room to breathe
  const avatarPad = useFrame ? Math.round(size * 0.1) : 0;
  const innerSize = size - avatarPad * 2;

  return (
    <div style={{
      position: 'relative',
      width: size,
      height: size,
      flexShrink: 0,
      display: 'inline-flex',
      alignItems: 'center',
      justifyContent: 'center',
      ...style
    }}>
      {/* ── Avatar circle ── */}
      <div style={{
        position: 'absolute',
        top: avatarPad,
        left: avatarPad,
        width: innerSize,
        height: innerSize,
        borderRadius: '50%',
        overflow: 'hidden',
        background: C.bg,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        border: borderWidth > 0 ? `${borderWidth}px solid ${borderColor}` : `1px solid ${C.border}`,
        boxShadow: useColor && !useFrame
          ? `0 0 0 ${Math.max(1, Math.round(borderWidth / 2))}px ${C.white}, 0 0 ${Math.round(size * 0.25)}px ${borderColor}40`
          : 'none',
        transition: 'all 0.3s ease',
      }}>
        {hasAvatar ? (
          <img
            src={avatarSrc}
            style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block' }}
            alt="avatar"
          />
        ) : (
          <div style={{
            width: '100%',
            height: '100%',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 900,
            color: useColor ? borderColor : C.blue,
            fontSize: innerSize * 0.4,
            background: useColor ? `${borderColor}18` : C.blueLight,
            userSelect: 'none',
          }}>
            {user?.profile?.first_name
              ? user.profile.first_name[0].toUpperCase()
              : <PiUserCircleDuotone size={innerSize * 0.6} />}
          </div>
        )}
      </div>

      {/* ── Rank frame PNG overlay ── */}
      {useFrame && frameUrl && (
        <img
          key={frameUrl}
          src={frameUrl}
          onError={() => setFrameError(true)}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            objectFit: 'contain',
            pointerEvents: 'none',
            zIndex: 2,
            animation: 'rankFrameIn 0.35s ease-out both',
          }}
          alt="rank frame"
        />
      )}

      <style>{`
        @keyframes rankFrameIn {
          from { opacity: 0; transform: scale(0.85); }
          to   { opacity: 1; transform: scale(1);    }
        }
      `}</style>
    </div>
  );
}
