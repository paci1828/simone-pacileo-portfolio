import type { SVGProps } from 'react'
type Props = SVGProps<SVGSVGElement> & { size?: number }
export function Github({ size = 20, ...props }: Props) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><path d="M9 19c-4.3 1.3-4.3-2.2-6-2.7m12 5v-3.8c0-1.1-.4-1.8-.8-2.2 2.8-.3 5.8-1.4 5.8-6.3 0-1.4-.5-2.5-1.3-3.4.1-.3.6-1.6-.1-3.4 0 0-1.1-.3-3.5 1.3a12 12 0 0 0-6.2 0C6.5 1.9 5.4 2.2 5.4 2.2c-.7 1.8-.2 3.1-.1 3.4A4.9 4.9 0 0 0 4 9c0 4.9 3 6 5.8 6.3-.4.4-.8 1.1-.8 2.2v3.8"/></svg>
}
export function Linkedin({ size = 20, ...props }: Props) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true" {...props}><rect x="3" y="3" width="18" height="18" rx="3"/><path d="M7.5 10v7M11.5 17v-7m0 3a3 3 0 0 1 6 0v4"/><circle cx="7.5" cy="7" r=".7" fill="currentColor" stroke="none"/></svg>
}
