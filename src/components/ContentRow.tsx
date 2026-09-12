import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface ContentRowProps {
  title: string;
  subtitle?: string;
  icon?: React.ReactNode;
  children: React.ReactNode;
  onSeeAll?: () => void;
}

export const ContentRow: React.FC<ContentRowProps> = ({
  title,
  subtitle,
  icon,
  children,
  onSeeAll,
}) => {
  const rowRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (rowRef.current) {
      const scrollAmount = rowRef.current.clientWidth * 0.75;
      rowRef.current.scrollBy({
        left: direction === 'left' ? -scrollAmount : scrollAmount,
        behavior: 'smooth',
      });
    }
  };

  return (
    <section className="my-8 sm:my-10">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-end justify-between mb-4">
          <div>
            <div className="flex items-center gap-2">
              {icon && <span className="text-pink-500">{icon}</span>}
              <h2 className="text-xl sm:text-2xl font-extrabold text-white tracking-tight">
                {title}
              </h2>
            </div>
            {subtitle && (
              <p className="text-xs sm:text-sm text-neutral-400 mt-0.5">
                {subtitle}
              </p>
            )}
          </div>

          {/* Desktop Arrow Controls & View All */}
          <div className="flex items-center gap-2">
            {onSeeAll && (
              <button
                onClick={onSeeAll}
                className="text-xs font-semibold text-pink-400 hover:text-pink-300 transition-colors mr-2"
              >
                See All
              </button>
            )}
            <button
              onClick={() => scroll('left')}
              className="hidden sm:flex w-8 h-8 rounded-full bg-neutral-900 border border-white/10 items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Scroll left"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
            <button
              onClick={() => scroll('right')}
              className="hidden sm:flex w-8 h-8 rounded-full bg-neutral-900 border border-white/10 items-center justify-center text-neutral-300 hover:text-white hover:bg-neutral-800 transition-colors"
              aria-label="Scroll right"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Scrollable Container */}
        <div
          ref={rowRef}
          className="flex gap-3 sm:gap-4 overflow-x-auto no-scrollbar scroll-smooth pb-2 pt-1"
        >
          {children}
        </div>
      </div>
    </section>
  );
};
