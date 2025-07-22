"use client";

import * as React from "react"
import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes"
import { type ThemeProviderProps } from "next-themes"
import { useEffect } from "react"

// This wrapper ensures the theme is properly applied to the document
function ThemeWrapper({ children }: { children: React.ReactNode }) {
  const { resolvedTheme } = useNextTheme()
  
  useEffect(() => {
    const root = window.document.documentElement
    
    // Remove all theme classes
    root.classList.remove('light', 'dark')
    
    // Add the current theme class
    if (resolvedTheme) {
      root.classList.add(resolvedTheme)
    }
  }, [resolvedTheme])
  
  return <>{children}</>
}

export function ThemeProvider({ children, ...props }: ThemeProviderProps) {
  return (
    <NextThemesProvider 
      attribute="class"
      defaultTheme="system"
      enableSystem
      disableTransitionOnChange
      storageKey="baby-theme"
      {...props}
    >
      <ThemeWrapper>
        {children}
      </ThemeWrapper>
    </NextThemesProvider>
  )
}
