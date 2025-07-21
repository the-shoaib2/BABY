import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"
import { prisma } from "@/lib/prisma"
import { useRouter } from "next/navigation"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Validates if a string is a valid MongoDB ObjectId
 * @param id The string to validate
 * @returns boolean indicating if the string is a valid ObjectId
 */
export function isValidObjectId(id: string): boolean {
  return /^[0-9a-fA-F]{24}$/.test(id);
}

export function assertOnline() {
  if (typeof window !== 'undefined' && (window as any).__APP_OFFLINE) {
    throw new Error('No internet connection');
  }
}




/**
 * Handles navigation with route change event
 * @param href The target URL
 */
export function handleNavigation(href: string) {
  if (href.startsWith('/')) {
    window.dispatchEvent(new CustomEvent('routeChangeStart'));
    window.location.assign(href);
  } else {
    window.open(href, '_blank');
  }
}
