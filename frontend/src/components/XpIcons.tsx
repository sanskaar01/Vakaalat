import React from 'react';

interface IconProps {
  className?: string;
}

/* Crisp Pixel / Windows XP Style Icons */
export const XpScalesIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="11" y="3" width="2" height="15" fill="#D9A441" />
    <rect x="7" y="18" width="10" height="2" fill="#9E7121" />
    <rect x="5" y="20" width="14" height="2" fill="#735015" />
    <rect x="4" y="6" width="16" height="2" fill="#F3D285" />
    <rect x="5" y="8" width="1" height="5" fill="#C49234" />
    <rect x="8" y="8" width="1" height="5" fill="#C49234" />
    <rect x="3" y="13" width="7" height="2" fill="#E6B856" />
    <rect x="15" y="8" width="1" height="5" fill="#C49234" />
    <rect x="18" y="8" width="1" height="5" fill="#C49234" />
    <rect x="14" y="13" width="7" height="2" fill="#E6B856" />
  </svg>
);

export const XpFolderIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="2" y="5" width="8" height="3" fill="#E5B24C" />
    <rect x="2" y="8" width="20" height="12" fill="#F5CB6C" />
    <rect x="2" y="8" width="20" height="2" fill="#FFE49E" />
    <rect x="2" y="19" width="20" height="1" fill="#B88428" />
    <rect x="21" y="8" width="1" height="12" fill="#B88428" />
    <rect x="2" y="5" width="1" height="15" fill="#C79232" />
  </svg>
);

export const XpShieldIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <path d="M12 2L4 5v6c0 5 3.4 9.3 8 11 4.6-1.7 8-6 8-11V5l-8-3z" fill="#2E7D32" />
    <path d="M12 4L6 6.3V11c0 3.9 2.6 7.3 6 8.8V4z" fill="#4CAF50" />
    <rect x="10" y="9" width="2" height="6" fill="#FFFFFF" />
    <rect x="12" y="11" width="4" height="2" fill="#FFFFFF" />
    <rect x="8" y="11" width="2" height="2" fill="#FFFFFF" />
  </svg>
);

export const XpNotepadIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="4" y="3" width="16" height="19" fill="#FFFFFF" />
    <rect x="4" y="3" width="16" height="4" fill="#2B6BE0" />
    <rect x="4" y="3" width="1" height="19" fill="#6B7B8F" />
    <rect x="19" y="3" width="1" height="19" fill="#6B7B8F" />
    <rect x="4" y="21" width="16" height="1" fill="#6B7B8F" />
    <rect x="7" y="10" width="10" height="2" fill="#8EA8C3" />
    <rect x="7" y="14" width="8" height="2" fill="#8EA8C3" />
    <rect x="7" y="18" width="6" height="2" fill="#8EA8C3" />
  </svg>
);

export const XpTrophyIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="6" y="4" width="12" height="8" fill="#F2BE42" />
    <rect x="8" y="4" width="4" height="7" fill="#FFE082" />
    <rect x="3" y="5" width="3" height="5" fill="#D49B2A" />
    <rect x="18" y="5" width="3" height="5" fill="#D49B2A" />
    <rect x="10" y="12" width="4" height="5" fill="#D49B2A" />
    <rect x="7" y="17" width="10" height="3" fill="#8C6214" />
  </svg>
);

export const XpMailIcon: React.FC<IconProps> = ({ className = 'h-5 w-5' }) => (
  <svg viewBox="0 0 24 24" className={className} shapeRendering="crispEdges">
    <rect x="2" y="5" width="20" height="14" fill="#FAF8F0" />
    <rect x="2" y="5" width="20" height="1" fill="#6B7B8F" />
    <rect x="2" y="18" width="20" height="1" fill="#6B7B8F" />
    <rect x="2" y="5" width="1" height="14" fill="#6B7B8F" />
    <rect x="21" y="5" width="1" height="14" fill="#6B7B8F" />
    <path d="M3 6l9 7 9-7" stroke="#2B6BE0" strokeWidth="2" fill="none" />
  </svg>
);

export const XpWindow: React.FC<{
  title: string;
  icon?: React.ReactNode;
  rightSlot?: React.ReactNode;
  children: React.ReactNode;
  className?: string;
}> = ({ title, icon, rightSlot, children, className = '' }) => (
  <div className={`xp-window ${className}`}>
    <div className="xp-titlebar">
      <div className="flex items-center gap-2 min-w-0">
        {icon}
        <span className="truncate text-xs font-bold tracking-wide drop-shadow-sm">{title}</span>
      </div>
      <div className="flex items-center gap-1.5 shrink-0">
        {rightSlot}
        <span className="xp-win-ctrl" aria-hidden="true">_</span>
        <span className="xp-win-ctrl" aria-hidden="true">□</span>
        <span className="xp-win-ctrl xp-win-ctrl-close" aria-hidden="true">×</span>
      </div>
    </div>
    <div>{children}</div>
  </div>
);
