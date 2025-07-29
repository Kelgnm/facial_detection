'use client'

import { Button } from '@chakra-ui/react'
import { useColorMode } from "./color-mode"

export default function ThemeToggle() {
  const { colorMode, toggleColorMode } = useColorMode()

  return (
    <Button onClick={toggleColorMode}>
      Toggle to {colorMode === 'light' ? 'dark' : 'light'}
    </Button>
  )
}
