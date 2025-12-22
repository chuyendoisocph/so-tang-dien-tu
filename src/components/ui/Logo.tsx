import React from 'react';
import logoImage from '@/assets/images/logos/CPH LOGO 1.png';

interface LogoProps {
  variant?: 'default' | 'dark' | 'light' | 'icon';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
}

const Logo: React.FC<LogoProps> = ({ 
  size = 'md', 
  className = '' 
}) => {
  const sizeClasses = {
    sm: 'h-6 w-auto',
    md: 'h-8 w-auto',
    lg: 'h-12 w-auto',
    xl: 'h-16 w-auto'
  };

  return (
    <img
      src={logoImage}
      alt="CPHACO Logo"
      className={`${sizeClasses[size]} ${className}`}
    />
  );
};

export default Logo;