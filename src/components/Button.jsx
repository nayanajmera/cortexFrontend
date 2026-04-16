import React from 'react';
import { Loader2 } from 'lucide-react';

const Button = ({ 
  children, 
  isLoading, 
  loadingText, 
  type = 'button', 
  onClick, 
  disabled, 
  className = '', 
  variant = 'primary',
  ...props 
}) => {
  const baseStyles = "flex items-center justify-center gap-2 px-4 py-2 font-bold rounded-lg transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed transform active:scale-[0.98]";
  
  const variants = {
    primary: "bg-black text-white hover:bg-stone-800 shadow-sm",
    secondary: "bg-white text-stone-800 border border-stone-300 hover:bg-stone-50",
    danger: "bg-red-600 text-white hover:bg-red-700 shadow-sm",
    outline: "bg-transparent text-stone-600 border border-stone-200 hover:border-stone-400 hover:text-stone-800"
  };

  const variantStyles = variants[variant] || variants.primary;

  return (
    <button
      type={type}
      onClick={onClick}
      disabled={disabled || isLoading}
      className={`${baseStyles} ${variantStyles} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <Loader2 className="w-4 h-4 animate-spin" />
          <span>{loadingText || children}</span>
        </>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
