import React from 'react';

interface SwitchProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string; // 可选的 label
  size?: 'small' | 'medium' | 'large'; // 可控大小
  className?: string; // 允许自定义样式
}

const Switch: React.FC<SwitchProps> = ({
                                         checked,
                                         onChange,
                                         label,
                                         size = 'medium',
                                         className = '',
                                       }) => {
  // 根据 size 来动态调整开关和滑块的大小
  const sizes = {
    small: { width: 'w-10', height: 'h-6', slider: 'w-4 h-4' },
    medium: { width: 'w-14', height: 'h-8', slider: 'w-6 h-6' },
    large: { width: 'w-20', height: 'h-10', slider: 'w-8 h-8' },
  };

  const { width, height, slider } = sizes[size];

  return (
    <div className={`flex items-center space-x-2 ${className}`}>
      {label && <span className="text-sm">{label}</span>} {/* 显示标签 */}

      <div
        onClick={() => onChange(!checked)}
        className={`relative inline-flex items-center cursor-pointer rounded-full transition-all duration-200 ${width} ${height} ${
          checked ? 'bg-primary-600' : 'bg-slate-400'
        }`}
      >
        <span
          className={`absolute top-1 left-1 ${slider} rounded-full bg-white shadow-lg transition-transform duration-200 ${
            checked ? 'translate-x-full' : 'translate-x-0'
          }`}
        />
      </div>
    </div>
  );
};

export default Switch;
