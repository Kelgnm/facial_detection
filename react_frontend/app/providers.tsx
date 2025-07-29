'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

const config = {
  initialColorMode: 'light',
  useSystemColorMode: false,
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <>
      <ChakraProvider value={defaultSystem}>{children}</ChakraProvider>
    </>
  );
}
