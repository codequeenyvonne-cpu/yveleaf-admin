import { Leaf } from 'lucide-react'

export function GoldDivider({ className = '' }: { className?: string }) {
  return (
    <div className={`mx-auto flex h-[18px] max-w-[190px] items-center gap-1.5 ${className}`}>
      <span className="h-[1.2px] flex-1 bg-gradient-to-r from-transparent to-gold" />
      <Leaf className="text-gold size-3.5 -rotate-[28deg]" strokeWidth={2.2} />
      <span className="h-[1.2px] flex-1 bg-gradient-to-l from-transparent to-gold" />
    </div>
  )
}
