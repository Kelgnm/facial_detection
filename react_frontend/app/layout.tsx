'use client'

import { ChakraProvider, defaultSystem } from '@chakra-ui/react'
import { ColorModeProvider } from "../src/components/ui/color-mode"

export default function RootLayout({
  children,
}) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={defaultSystem}>
          <ColorModeProvider>{children}</ColorModeProvider>
        </ChakraProvider>
      </body>
    </html>
  )
}
