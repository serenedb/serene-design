import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Join class names, letting a caller's utility win over the kit's default. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
