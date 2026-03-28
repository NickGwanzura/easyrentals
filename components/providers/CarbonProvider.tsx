'use client';

import React from 'react';
import { Theme } from '@carbon/react';

interface CarbonProviderProps {
  children: React.ReactNode;
}

export function CarbonProvider({ children }: CarbonProviderProps) {
  return (
    <Theme theme="white">
      {children}
    </Theme>
  );
}

export default CarbonProvider;
