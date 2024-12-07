import React from 'react';
import * as SwitchPrimitive from '@radix-ui/react-switch';

interface SwitchProps {
  checked: boolean;
  onCheckedChange: (checked: boolean) => void;
  className?: string;
  activeColor?: string;
  inactiveColor?: string;
}

export function Switch({ 
  checked, 
  onCheckedChange, 
  className,
  activeColor = 'bg-green-500', 
  inactiveColor = 'bg-red-500'
}: SwitchProps) {
  return (
    <SwitchPrimitive.Root
      checked={checked}
      onCheckedChange={onCheckedChange}
      className={`
        w-[42px] h-[25px] rounded-full relative 
        focus:shadow-[0_0_0_2px] focus:shadow-black 
        ${checked ? activeColor : inactiveColor}
        ${className || ''}
      `}
    >
      <SwitchPrimitive.Thumb
        className={`
          block w-[21px] h-[21px] bg-white rounded-full 
          transition-transform duration-100 
          translate-x-0.5 will-change-transform 
          data-[state=checked]:translate-x-[19px]
        `}
      />
    </SwitchPrimitive.Root>
  );
}
