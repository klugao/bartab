import React from 'react';

interface IconInputProps {
  icon: React.ReactNode;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  className?: string;
  iconSize?: 'sm' | 'md' | 'lg';
  disabled?: boolean;
  required?: boolean;
}

const IconInput: React.FC<IconInputProps> = ({
  icon,
  placeholder = '',
  value,
  onChange,
  type = 'text',
  className = '',
  iconSize = 'md',
  disabled = false,
  required = false,
}) => {
  const getIconSizeClass = () => {
    switch (iconSize) {
      case 'sm':
        return 'w-4 h-4';
      case 'md':
        return 'w-5 h-5';
      case 'lg':
        return 'w-6 h-6';
      default:
        return 'w-5 h-5';
    }
  };

  return (
    <div className={`flex flex-col items-center gap-2 ${className}`}>
      {/* Ícone */}
      <div className={`${getIconSizeClass()} text-gray-400 flex-shrink-0`}>
        {icon}
      </div>
      
      {/* Input */}
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        disabled={disabled}
        required={required}
        className="w-full px-3 py-2 border border-gray-300 rounded-md leading-5 bg-white placeholder-gray-500 focus:outline-none focus:placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:bg-gray-50 disabled:text-gray-500"
      />
    </div>
  );
};

export default IconInput;
