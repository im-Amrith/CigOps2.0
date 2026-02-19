import React from 'react';

const BentoCard = ({ 
  children, 
  title = '', 
  subtitle = '',
  className = '', 
  delay = '0s',
  noPadding = false 
}) => {
  return (
    <div 
      className={`glass-card rounded-xl shadow-sm flex flex-col transition-all duration-500 hover:shadow-lg hover:border-orange-500/20 ${className}`}
      style={{ animationDelay: delay }}
    >
      {(title || subtitle) && (
        <div className="px-6 pt-5 pb-3">
          {title && (
            <div className="flex items-center gap-2">
              <span className="text-[10px] font-black uppercase tracking-[0.2em] text-[#fe7902]">
                {title}
              </span>
            </div>
          )}
          {subtitle && (
            <p className="text-sm font-medium text-gray-400 mt-0.5">{subtitle}</p>
          )}
        </div>
      )}
      <div className={`flex-1 ${noPadding ? '' : 'px-6 pb-6 pt-2'}`}>
        {children}
      </div>
    </div>
  );
};

export default BentoCard;
