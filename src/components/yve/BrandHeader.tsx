import { BRAND, IMAGES } from '../../lib/brand'
import { GoldDivider } from './GoldDivider'

export function BrandLogo({ size = 48 }: { size?: number }) {
  return (
    <img
      src={IMAGES.logo}
      alt={BRAND.name}
      width={size}
      height={size}
      className="object-contain"
    />
  )
}

export function BrandHeader({
  title,
  subtitle,
  showTagline = false,
  compact = false,
}: {
  title: string
  subtitle?: string
  showTagline?: boolean
  compact?: boolean
}) {
  return (
    <div className={compact ? 'text-left' : 'text-center'}>
      <h1 className={`font-display ${compact ? 'text-2xl' : 'text-3xl'}`}>{title}</h1>
      {showTagline && (
        <>
          <div className="my-3">
            <GoldDivider className={compact ? 'mx-0' : ''} />
          </div>
          <p className="text-ink-soft text-sm tracking-wide">{BRAND.tagline}</p>
        </>
      )}
      {subtitle && (
        <p className={`text-ink-soft mt-2 ${compact ? 'text-sm' : 'text-[15px]'} leading-relaxed`}>
          {subtitle}
        </p>
      )}
    </div>
  )
}
