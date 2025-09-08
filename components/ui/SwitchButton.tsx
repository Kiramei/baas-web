import React from 'react';

interface SwitchButtonProps {
  checked: boolean;
  labels: { on: string; off: string }; // 按钮文字变化
  onChange: (checked: boolean) => void; // 状态切换的回调
  className?: string;
}

const SwitchButton: React.FC<SwitchButtonProps> = ({checked, labels, onChange, className = '', ...props}) => {
  return (
    <button
      onClick={() => onChange(!checked)}
      className={`px-6 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
        checked
          ? 'bg-primary-600 text-white hover:bg-primary-700 focus:ring-primary-500'
          : 'bg-slate-200 text-slate-800 hover:bg-slate-300 dark:bg-slate-700 dark:text-slate-100 dark:hover:bg-slate-600 focus:ring-slate-500'
      } ${className}`}
      {...props}
    >
      {checked ? labels.on : labels.off}
    </button>
  );
};

export default SwitchButton;
