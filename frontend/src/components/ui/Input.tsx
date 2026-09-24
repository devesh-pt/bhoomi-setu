import React, { useState } from 'react';
import { Eye, EyeOff } from 'lucide-react';

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  shake?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({
  label,
  error,
  shake = false,
  leftIcon,
  rightIcon,
  type = 'text',
  className = '',
  id,
  value,
  placeholder,
  ...props
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isPasswordType = type === 'password';
  const inputType = isPasswordType ? (showPassword ? 'text' : 'password') : type;
  const inputId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className={`space-y-1.5 ${shake ? 'animate-shake' : ''}`}>
      {label && (
        <label htmlFor={inputId} className="block text-xs font-semibold text-slate-300">
          {label}
        </label>
      )}
      <div className="relative flex items-center">
        {leftIcon && (
          <div className="absolute left-3 text-slate-400 pointer-events-none">
            {leftIcon}
          </div>
        )}
        <input
          id={inputId}
          type={inputType}
          value={value}
          placeholder={placeholder}
          className={`w-full bg-slate-900/90 text-slate-100 border text-xs font-medium rounded-xl px-3.5 py-2.5 outline-none transition placeholder-slate-500 focus:ring-2 focus:ring-emerald-500/40 ${
            leftIcon ? 'pl-9' : ''
          } ${isPasswordType || rightIcon ? 'pr-10' : ''} ${
            error
              ? 'border-rose-500 focus:border-rose-500'
              : 'border-slate-700/80 focus:border-emerald-500'
          } ${className}`}
          {...props}
        />
        {isPasswordType ? (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 text-slate-400 hover:text-slate-200 transition focus:outline-none"
            tabIndex={-1}
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        ) : (
          rightIcon && <div className="absolute right-3 text-slate-400 pointer-events-none">{rightIcon}</div>
        )}
      </div>
      {error && <p className="text-[11px] font-semibold text-rose-400">{error}</p>}
    </div>
  );
};
