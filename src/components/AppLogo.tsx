import { motion } from 'framer-motion';
import logo from '@/assets/logo.png';

interface AppLogoProps {
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}

export const AppLogo = ({ size = 'md', className = '' }: AppLogoProps) => {
  const sizeClasses = {
    sm: 'h-10 w-10',
    md: 'h-16 w-16',
    lg: 'h-24 w-24',
  };

  return (
    <motion.img
      src={logo}
      alt="موسیقی"
      className={`${sizeClasses[size]} object-contain ${className}`}
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.3 }}
    />
  );
};