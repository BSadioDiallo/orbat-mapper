import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

/** Same helper as `cn` in src/lib/utils.ts (shadcn): merge Tailwind classes, later ones win. */
export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}
