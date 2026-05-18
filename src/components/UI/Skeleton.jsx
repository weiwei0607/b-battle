import React, { useState } from 'react';

/**
 * Skeleton
 * 骨架屏元件，用於資料載入中的佔位顯示
 *
 * @param {string} variant - 'text' | 'circle' | 'rect' | 'pill'
 * @param {string} width - 寬度（tailwind class 或 css value）
 * @param {string} height - 高度
 * @param {string} className - 額外樣式
 */
const Skeleton = ({
  variant = 'text',
  width,
  height,
  className = '',
}) => {
  const baseStyles = 'bg-stone-200 animate-pulse rounded';

  const variantStyles = {
    text: 'h-4 rounded-md',
    circle: 'rounded-full',
    rect: 'rounded-xl',
    pill: 'rounded-full',
  };

  const style = {};
  if (width) style.width = width;
  if (height) style.height = height;

  return (
    <div
      className={`${baseStyles} ${variantStyles[variant] || variantStyles.text} ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
};

/**
 * SkeletonCard
 * 卡片骨架屏組合
 */
export const SkeletonCard = ({ lines = 3 }) => {
  const [widths] = useState(() => Array.from({ length: lines }, () => `${70 + Math.random() * 30}%`));
  return (
    <div className="bg-white border border-stone-100 p-6 rounded-[2.5rem] shadow-sm space-y-3">
      <div className="flex items-center gap-3">
        <Skeleton variant="circle" width="48px" height="48px" />
        <div className="flex-1 space-y-2">
          <Skeleton variant="text" width="60%" />
          <Skeleton variant="text" width="40%" />
        </div>
      </div>
      {widths.map((width, i) => (
        <Skeleton key={i} variant="text" width={width} />
      ))}
    </div>
  );
};

/**
 * SkeletonPillar
 * 對戰柱狀圖骨架屏
 */
export const SkeletonPillar = () => (
  <div className="flex items-center justify-between gap-4 mt-4 px-4">
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`left-${i}`} className="flex flex-col items-center gap-2">
          <Skeleton variant="text" width="24px" height="4px" className="rounded-full" />
          <Skeleton variant="rect" width="24px" height="128px" />
          <Skeleton variant="text" width="32px" height="8px" />
          <Skeleton variant="text" width="20px" height="12px" />
        </div>
      ))}
    </div>
    <Skeleton variant="circle" width="40px" height="40px" />
    <div className="grid grid-cols-2 gap-x-4 gap-y-6 flex-1">
      {Array.from({ length: 4 }).map((_, i) => (
        <div key={`right-${i}`} className="flex flex-col items-center gap-2">
          <Skeleton variant="text" width="24px" height="4px" className="rounded-full" />
          <Skeleton variant="rect" width="24px" height="128px" />
          <Skeleton variant="text" width="32px" height="8px" />
          <Skeleton variant="text" width="20px" height="12px" />
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
