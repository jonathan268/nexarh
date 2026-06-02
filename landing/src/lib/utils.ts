export type ClassValue = string | null | undefined | false | ClassValue[]

export function cn(...inputs: ClassValue[]) {
  return inputs.filter(Boolean).join(' ')
}
