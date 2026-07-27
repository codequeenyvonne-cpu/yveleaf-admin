import type { LucideIcon } from 'lucide-react'
import type { ButtonHTMLAttributes, ReactNode } from 'react'

export function YvePrimaryButton({
  children,
  leadingIcon: Icon,
  className = '',
  type = 'button',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & {
  leadingIcon?: LucideIcon
  children: ReactNode
}) {
  return (
    <button type={type} className={`yve-pill-btn ${className}`} {...props}>
      {Icon && <Icon className="text-gold-soft size-5" />}
      {children}
    </button>
  )
}

export function YveLinkButton({
  children,
  className = '',
  ...props
}: ButtonHTMLAttributes<HTMLButtonElement> & { children: ReactNode }) {
  return (
    <button
      type="button"
      className={`text-leaf text-[15px] font-bold hover:underline ${className}`}
      {...props}
    >
      {children}
    </button>
  )
}
