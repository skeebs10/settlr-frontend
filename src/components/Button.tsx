import React from 'react';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'primary' | 'secondary' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  loading?: boolean;
  className?: string;
}

export function Button({ 
  children, 
  onClick, 
  variant = 'primary', 
  size = 'md',
  disabled = false,
  loading = false,
  className = "",
  ...props
}: ButtonProps) {
  const baseClasses = "font-bold rounded-lg transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 transform hover:scale-105 shadow-lg hover:shadow-xl font-sans tap-feedback";
  
  const variantClasses = {
    primary: "btn-primary",
    secondary: "btn-outlined",
    danger: "bg-gradient-to-r from-red-600 to-red-700 hover:from-red-700 hover:to-red-800 text-white focus:ring-red-500 shadow-red-500/25"
  };
  
  const sizeClasses = {
    sm: "px-3 py-2 text-sm md:px-4 md:py-2 md:text-sm",
    md: "px-4 py-3 text-sm md:px-6 md:py-3 md:text-base",
    lg: "px-6 py-4 text-base md:px-8 md:py-4 md:text-lg"
  };

  const disabledClasses = disabled || loading ? "cursor-not-allowed transform-none hover:scale-100 hover:shadow-lg" : "";

  return (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`${baseClasses} ${variantClasses[variant]} ${sizeClasses[size]} ${disabledClasses} ${className}`}
      {...props}
    >
      {loading ? (
        <div className="flex items-center justify-center">
          <div className="w-4 h-4 md:w-5 md:h-5 border-2 border-current border-t-transparent rounded-full animate-spin mr-2"></div>
          Loading...
        </div>
      ) : children}
    </button>
  );
}