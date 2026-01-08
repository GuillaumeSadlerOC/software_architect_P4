import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function toSlug(text: string): string {
  return text
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD') // Decompose the accents (é -> e + ')
    .replace(/[\u0300-\u036f]/g, '') // Remove isolated accents
    .replace(/\s+/g, '-') // Replace the spaces with dashes
    .replace(/[^\w\-]+/g, '-') // Replaces non-alphanumeric characters (except -) with hyphens
    .replace(/\-\-+/g, '-') // Replace the multiple dashes with a single one
    .replace(/^-+/, '') // Cut the dashes at the beginning
    .replace(/-+$/, ''); // Cut off the dashes at the end
}
