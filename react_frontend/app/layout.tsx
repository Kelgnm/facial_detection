'use client'

import { ChakraProvider, defaultSystem } from "@chakra-ui/react"
import { system } from "../src/theme"
export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <ChakraProvider value={defaultSystem}>
          {children}
        </ChakraProvider>
      </body>
    </html>
  )
}