import React, { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function Tooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider delayDuration={0}>
      <TooltipPrimitive.Root>
        {children}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function TooltipTrigger({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Trigger>
      {children}
    </TooltipPrimitive.Trigger>
  );
}

export function TooltipContent({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        className="
          z-50 
          bg-gray-900 
          text-white 
          text-xs 
          rounded-lg 
          p-3 
          max-w-xs 
          shadow-lg
          animate-fade-in
          border border-gray-800
        "
        sideOffset={5}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-gray-900" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
