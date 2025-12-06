import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

/**
 * Compose CSS class names and resolve Tailwind CSS class conflicts.
 *
 * @param inputs - One or more class value arguments (strings, arrays, objects, etc.) to be combined
 * @returns A single class string with merged Tailwind classes and conflicts resolved
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}