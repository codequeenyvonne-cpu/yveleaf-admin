import { useEffect, useState, type ReactNode } from 'react'

export function FadeSlideIn({
  children,
  delay = 0,
  className = '',
}: {
  children: ReactNode
  delay?: number
  className?: string
}) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const t = window.setTimeout(() => setVisible(true), delay)
    return () => window.clearTimeout(t)
  }, [delay])

  return (
    <div
      className={[
        'transition-all duration-[600ms] ease-[cubic-bezier(0.33,1,0.68,1)]',
        visible ? 'translate-y-0 opacity-100' : 'translate-y-7 opacity-0',
        className,
      ].join(' ')}
    >
      {children}
    </div>
  )
}
