/**
 * Level Badge Component
 * Displays user's current level with icon and color
 */

import { LEVEL_PROGRESSION } from '@/lib/gamification/xp-calculator';

interface LevelBadgeProps {
  level: number;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  showTitle?: boolean;
  className?: string;
  onClick?: () => void;
}

export default function LevelBadge({
  level,
  size = 'md',
  showTitle = false,
  className = '',
  onClick,
}: LevelBadgeProps) {
  const levelData = LEVEL_PROGRESSION.find(l => l.level_number === level) || LEVEL_PROGRESSION[0];

  const sizeClasses = {
    sm: 'w-8 h-8 text-lg',
    md: 'w-12 h-12 text-2xl',
    lg: 'w-16 h-16 text-3xl',
    xl: 'w-20 h-20 text-4xl',
  };

  const borderSize = {
    sm: 'border-2',
    md: 'border-3',
    lg: 'border-4',
    xl: 'border-4',
  };

  return (
    <div
      className={`flex items-center gap-3 ${className} ${onClick ? 'cursor-pointer' : ''}`}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
    >
      {/* Badge Icon */}
      <div
        className={`
          ${sizeClasses[size]} 
          ${borderSize[size]}
          rounded-full 
          flex items-center justify-center 
          font-bold 
          shadow-lg 
          transition-all 
          hover:scale-110
          border-white
        `}
        style={{
          backgroundColor: levelData.badge_color,
          boxShadow: `0 4px 15px ${levelData.badge_color}40`,
        }}
      >
        <span className="drop-shadow-md">{levelData.badge_icon}</span>
      </div>

      {/* Level Info */}
      {showTitle && (
        <div className="flex flex-col">
          <span className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
            Level {level}
          </span>
          <span className="text-sm font-bold text-gray-800">
            {levelData.title}
          </span>
        </div>
      )}
    </div>
  );
}

