import React, { ReactNode } from 'react';
import * as TooltipPrimitive from '@radix-ui/react-tooltip';

export function Tooltip({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Provider>
      <TooltipPrimitive.Root>
        {children}
      </TooltipPrimitive.Root>
    </TooltipPrimitive.Provider>
  );
}

export function TooltipTrigger({ children }: { children: ReactNode }) {
  return (
    <TooltipPrimitive.Trigger asChild>
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
          bg-blue-800 
          text-white 
          text-xs 
          rounded-md 
          p-2 
          max-w-xs 
          shadow-lg
          animate-fade-in
        "
        sideOffset={5}
      >
        {children}
        <TooltipPrimitive.Arrow className="fill-blue-800" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  );
}
