// app/layout.tsx
'use client';

import { ChakraProvider, defaultSystem } from '@chakra-ui/react';

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={defaultSystem}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  );
}
