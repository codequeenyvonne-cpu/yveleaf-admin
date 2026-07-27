import { FileText, ImagePlus, X } from 'lucide-react'
import { driveThumbnailUrl } from '../../lib/upload'

type ImagePickCardProps = {
  label: string
  hint?: string
  previewUrl?: string | null
  driveId?: string
  heightClass?: string
  onPick: (file: File) => void
  onClear?: () => void
  disabled?: boolean
}

export function ImagePickCard({
  label,
  hint,
  previewUrl,
  driveId,
  heightClass = 'h-32',
  onPick,
  onClear,
  disabled,
}: ImagePickCardProps) {
  const thumb = previewUrl || (driveId ? driveThumbnailUrl(driveId) : '')

  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPick(file)
  }

  return (
    <div className="space-y-2">
      <div className="relative">
        <label
          className={`border-cream-deep bg-surface hover:border-leaf/40 group relative flex ${heightClass} cursor-pointer items-center justify-center overflow-hidden rounded-2xl border-2 border-dashed transition ${disabled ? 'pointer-events-none opacity-60' : ''}`}
        >
          <input
            type="file"
            accept="image/*"
            className="sr-only"
            disabled={disabled}
            onChange={onFileChange}
          />
          {thumb ? (
            <img src={thumb} alt="" className="size-full object-cover" />
          ) : (
            <div className="text-ink-soft flex flex-col items-center gap-2 px-4 text-center text-sm">
              <ImagePlus className="text-leaf size-6" />
              <span>{label}</span>
            </div>
          )}
          {!thumb && (
            <span className="bg-leaf/0 group-hover:bg-leaf/5 absolute inset-0 transition" />
          )}
        </label>
        {thumb && onClear && !disabled && (
          <button
            type="button"
            onClick={onClear}
            className="bg-forest/80 absolute top-2 right-2 rounded-full p-1.5 text-white"
            aria-label="Remove image"
          >
            <X className="size-4" />
          </button>
        )}
      </div>
      {hint && <p className="text-ink-soft text-xs leading-relaxed">{hint}</p>}
    </div>
  )
}

type FilePickTileProps = {
  label: string
  subtitle?: string
  done?: boolean
  progress?: number | null
  accept: string
  onPick: (file: File) => void
  disabled?: boolean
}

export function FilePickTile({
  label,
  subtitle,
  done,
  progress,
  accept,
  onPick,
  disabled,
}: FilePickTileProps) {
  function onFileChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    e.target.value = ''
    if (file) onPick(file)
  }

  return (
    <label
      className={`yve-card flex cursor-pointer items-center gap-4 p-4 transition ${disabled ? 'pointer-events-none opacity-60' : 'hover:border-leaf/30'}`}
    >
      <input type="file" accept={accept} className="sr-only" disabled={disabled} onChange={onFileChange} />
      <div
        className={`flex size-12 shrink-0 items-center justify-center rounded-2xl ${done ? 'bg-leaf/15 text-leaf' : 'bg-cream-deep text-ink-soft'}`}
      >
        <FileText className="size-6" />
      </div>
      <div className="min-w-0 flex-1">
        <p className="text-ink font-bold">{label}</p>
        {subtitle && <p className="text-ink-soft truncate text-xs">{subtitle}</p>}
        {progress != null && progress < 100 && (
          <div className="bg-cream-deep mt-2 h-2 overflow-hidden rounded-full">
            <div className="bg-leaf h-full transition-all" style={{ width: `${progress}%` }} />
          </div>
        )}
      </div>
    </label>
  )
}
