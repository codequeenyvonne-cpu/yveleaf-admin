import { useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Plus, Save } from 'lucide-react'
import { FilePickTile, ImagePickCard } from '../components/novel/MediaPickers'
import { deleteNovel, fetchAdminNovels, saveNovel } from '../lib/api'
import { loadSession } from '../lib/auth'
import { IMAGES } from '../lib/brand'
import type { AccessLevel, Novel, NovelStatus } from '../lib/types'
import { READING_STYLE_OPTIONS } from '../lib/types'
import { uploadAdminFile } from '../lib/upload'
import { BrandHeader } from '../components/yve/BrandHeader'
import { FadeSlideIn } from '../components/yve/FadeSlideIn'
import { YvePrimaryButton } from '../components/yve/YveButton'
import { YveCard } from '../components/yve/YveCard'

const accessLevels: { value: AccessLevel; label: string; hint: string }[] = [
  { value: 'offline', label: 'Offline', hint: 'Can be downloaded and read without internet.' },
  { value: 'online', label: 'Online', hint: 'Requires internet (and sign-in when enabled in app).' },
  { value: 'premium', label: 'Premium', hint: 'Reserved for paid or special access later.' },
]

const statuses: { value: NovelStatus; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'published', label: 'Published' },
  { value: 'archived', label: 'Archived' },
]

type GallerySlot = {
  driveId: string
  previewUrl?: string
}

const MIN_GALLERY = 3

function parseGalleryIds(raw: string | undefined): string[] {
  if (!raw) return []
  return raw.split(',').map((id) => id.trim()).filter(Boolean)
}

function joinGalleryIds(slots: GallerySlot[]): string {
  return slots.map((s) => s.driveId).filter(Boolean).join(',')
}

export function NovelFormPage() {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const isNew = !novelId || novelId === 'new'
  const draftNovelId = useMemo(
    () => (isNew ? `nvl_${crypto.randomUUID().replace(/-/g, '').slice(0, 12)}` : novelId!),
    [isNew, novelId],
  )

  const [form, setForm] = useState<Partial<Novel>>({
    title: '',
    author: '',
    genre: '',
    description: '',
    publication_year: '',
    access_level: 'offline',
    status: 'draft',
    featured: true,
    sort_order: 1,
    pdf_drive_id: '',
    cover_drive_id: '',
    gallery_drive_ids: '',
    total_pages: 0,
    default_reading_style: null,
    allow_offline_download: true,
    carousel_interval_sec: 5,
  })
  const [gallerySlots, setGallerySlots] = useState<GallerySlot[]>(
    Array.from({ length: MIN_GALLERY }, () => ({ driveId: '' })),
  )
  const [coverPreview, setCoverPreview] = useState<string | null>(null)
  const [pdfName, setPdfName] = useState('')
  const [pdfProgress, setPdfProgress] = useState<number | null>(null)
  const [coverProgress, setCoverProgress] = useState<number | null>(null)
  const [galleryProgress, setGalleryProgress] = useState<number | null>(null)
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [uploading, setUploading] = useState(false)
  const [error, setError] = useState('')

  const galleryCount = gallerySlots.filter((s) => s.driveId).length
  const busy = saving || uploading

  useEffect(() => {
    if (isNew) return
    const session = loadSession()
    if (!session) return
    fetchAdminNovels(session.idToken)
      .then((novels) => novels.find((n) => n.novel_id === novelId))
      .then((novel) => {
        if (!novel) return
        setForm(novel)
        const ids = parseGalleryIds(novel.gallery_drive_ids)
        const slots =
          ids.length >= MIN_GALLERY
            ? ids.map((driveId) => ({ driveId }))
            : [...ids.map((driveId) => ({ driveId })), ...Array.from({ length: MIN_GALLERY - ids.length }, () => ({ driveId: '' }))]
        setGallerySlots(slots)
        if (novel.pdf_drive_id) setPdfName('PDF attached')
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isNew, novelId])

  async function uploadPdf(file: File) {
    const session = loadSession()
    if (!session) return
    setUploading(true)
    setError('')
    setPdfProgress(0)
    try {
      const result = await uploadAdminFile(session.idToken, file, {
        kind: 'pdf',
        novelId: draftNovelId,
        onProgress: setPdfProgress,
      })
      setForm((prev) => ({ ...prev, pdf_drive_id: result.drive_id }))
      setPdfName(file.name)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'PDF upload failed')
    } finally {
      setPdfProgress(null)
      setUploading(false)
    }
  }

  async function uploadCover(file: File) {
    const session = loadSession()
    if (!session) return
    setUploading(true)
    setError('')
    setCoverProgress(0)
    setCoverPreview(URL.createObjectURL(file))
    try {
      const result = await uploadAdminFile(session.idToken, file, {
        kind: 'cover',
        novelId: draftNovelId,
        onProgress: setCoverProgress,
      })
      setForm((prev) => ({ ...prev, cover_drive_id: result.drive_id }))
    } catch (err) {
      setCoverPreview(null)
      setError(err instanceof Error ? err.message : 'Cover upload failed')
    } finally {
      setCoverProgress(null)
      setUploading(false)
    }
  }

  async function uploadGallery(index: number, file: File) {
    const session = loadSession()
    if (!session) return
    setUploading(true)
    setError('')
    setGalleryProgress(0)
    const previewUrl = URL.createObjectURL(file)
    try {
      const result = await uploadAdminFile(session.idToken, file, {
        kind: 'gallery',
        novelId: draftNovelId,
        onProgress: setGalleryProgress,
      })
      setGallerySlots((prev) => {
        const next = [...prev]
        next[index] = { driveId: result.drive_id, previewUrl }
        return next
      })
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gallery upload failed')
    } finally {
      setGalleryProgress(null)
      setUploading(false)
    }
  }

  function validateBeforeSave(): string | null {
    if (!form.title?.trim() || !form.author?.trim()) {
      return 'Title and author are required.'
    }
    if (form.status === 'published' || form.featured) {
      if (!form.pdf_drive_id) return 'Upload the PDF before publishing or featuring this novel.'
      if (!form.cover_drive_id) return 'Upload a cover image before publishing or featuring this novel.'
      if (galleryCount < MIN_GALLERY) {
        return `Add at least ${MIN_GALLERY} featured gallery images. They rotate every 5 seconds on the home card.`
      }
    }
    return null
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = loadSession()
    if (!session) return

    const validationError = validateBeforeSave()
    if (validationError) {
      setError(validationError)
      return
    }

    setSaving(true)
    setError('')
    try {
      await saveNovel(session.idToken, {
        ...form,
        novel_id: isNew ? draftNovelId : novelId,
        title: form.title?.trim() ?? '',
        author: form.author?.trim() ?? '',
        access_level: form.access_level ?? 'offline',
        status: form.status ?? 'draft',
        gallery_drive_ids: joinGalleryIds(gallerySlots),
        publication_year: form.publication_year ?? '',
        default_reading_style: form.default_reading_style ?? null,
        allow_offline_download: form.allow_offline_download !== false,
        carousel_interval_sec: form.carousel_interval_sec ?? 5,
        sort_order: form.sort_order ?? 1,
      })
      navigate('/novels')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Save failed')
    } finally {
      setSaving(false)
    }
  }

  async function onArchive() {
    const session = loadSession()
    if (!session || !novelId || isNew) return
    if (!confirm('Archive this novel? It will be hidden from the app.')) return
    await deleteNovel(session.idToken, novelId)
    navigate('/novels')
  }

  if (loading) {
    return <p className="text-ink-soft">Loading novel…</p>
  }

  return (
    <div className="space-y-6">
      <FadeSlideIn>
        <Link
          to="/novels"
          className="text-leaf inline-flex items-center gap-2 text-sm font-bold hover:underline"
        >
          <ArrowLeft className="size-4" />
          Back to novels
        </Link>

        <div className="mt-4 flex flex-col gap-4 sm:flex-row sm:items-center">
          <img src={IMAGES.medallion} alt="" className="max-h-32 w-auto object-contain" aria-hidden />
          <BrandHeader
            compact
            title={isNew ? 'Add novel' : 'Edit novel'}
            subtitle="Upload the PDF, cover, and featured gallery — same order as the mobile app."
          />
        </div>
      </FadeSlideIn>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <FadeSlideIn delay={80}>
          <Section title="1. Novel PDF">
            <FilePickTile
              label={form.pdf_drive_id ? 'PDF uploaded' : 'Choose PDF file'}
              subtitle={pdfName || 'The full novel file readers will open'}
              done={!!form.pdf_drive_id}
              progress={pdfProgress}
              accept="application/pdf,.pdf"
              disabled={busy}
              onPick={uploadPdf}
            />
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={140}>
          <Section title="2. Details">
            <YveCard className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Title">
                <input
                  required
                  value={form.title ?? ''}
                  onChange={(e) => setForm({ ...form, title: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Author">
                <input
                  required
                  value={form.author ?? ''}
                  onChange={(e) => setForm({ ...form, author: e.target.value })}
                  className="field"
                />
              </Field>
              <Field label="Genre">
                <input
                  value={form.genre ?? ''}
                  onChange={(e) => setForm({ ...form, genre: e.target.value })}
                  className="field"
                  placeholder="Romance, Drama…"
                />
              </Field>
              <Field label="Publication year">
                <input
                  type="number"
                  min={1800}
                  max={2100}
                  value={form.publication_year ?? ''}
                  onChange={(e) => setForm({ ...form, publication_year: e.target.value })}
                  className="field"
                  placeholder="2024"
                />
              </Field>
              <Field label="Total pages">
                <input
                  type="number"
                  min={0}
                  value={form.total_pages ?? 0}
                  onChange={(e) => setForm({ ...form, total_pages: Number(e.target.value) })}
                  className="field"
                />
              </Field>
              <Field label="Description" className="md:col-span-2">
                <textarea
                  rows={4}
                  value={form.description ?? ''}
                  onChange={(e) => setForm({ ...form, description: e.target.value })}
                  className="field resize-y"
                />
              </Field>
            </YveCard>
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={200}>
          <Section
            title="3. Cover picture"
            hint="This appears on the library shelf and on the small animated inset on the featured home card."
          >
            <ImagePickCard
              label="Tap to choose cover"
              previewUrl={coverPreview}
              driveId={!coverPreview ? form.cover_drive_id : undefined}
              heightClass="h-44"
              disabled={busy}
              onPick={uploadCover}
              onClear={() => {
                setCoverPreview(null)
                setForm((prev) => ({ ...prev, cover_drive_id: '' }))
              }}
            />
            {coverProgress != null && coverProgress < 100 && (
              <p className="text-ink-soft text-xs">Uploading cover… {coverProgress}%</p>
            )}
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={260}>
          <Section
            title="4. Featured gallery"
            hint={`Minimum ${MIN_GALLERY} images. Add more if you like — they rotate every 5 seconds on the home featured card.`}
          >
            <div className="space-y-3">
              {gallerySlots.map((slot, index) => (
                <ImagePickCard
                  key={`gallery-${index}`}
                  label={
                    index === 0
                      ? `Gallery image ${index + 1} — landscape recommended`
                      : index === 1
                        ? `Gallery image ${index + 1} — landscape or portrait`
                        : `Gallery image ${index + 1}${index >= MIN_GALLERY ? '' : ' — required'}`
                  }
                  previewUrl={slot.previewUrl}
                  driveId={!slot.previewUrl ? slot.driveId : undefined}
                  heightClass="h-28"
                  disabled={busy}
                  onPick={(file) => uploadGallery(index, file)}
                  onClear={() => {
                    setGallerySlots((prev) => {
                      const next = [...prev]
                      next[index] = { driveId: '' }
                      return next
                    })
                  }}
                />
              ))}
              {galleryProgress != null && galleryProgress < 100 && (
                <p className="text-ink-soft text-xs">Uploading gallery image… {galleryProgress}%</p>
              )}
              <button
                type="button"
                disabled={busy}
                onClick={() => setGallerySlots((prev) => [...prev, { driveId: '' }])}
                className="text-leaf inline-flex items-center gap-2 text-sm font-bold hover:underline disabled:opacity-50"
              >
                <Plus className="size-4" />
                Add another gallery image
              </button>
              <p className="text-ink-soft text-xs">
                {galleryCount} of {Math.max(MIN_GALLERY, gallerySlots.length)} slots filled
                {galleryCount < MIN_GALLERY ? ` · need ${MIN_GALLERY - galleryCount} more for featured/publish` : ''}
              </p>
            </div>
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={320}>
          <Section
            title="5. Visibility and access"
            hint="Control where this novel appears in the app and whether readers can download it."
          >
            <YveCard className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Status">
                <select
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value as NovelStatus })}
                  className="field"
                >
                  {statuses.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Display priority">
                <input
                  type="number"
                  min={1}
                  value={form.sort_order ?? 1}
                  onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
                  className="field"
                />
                <p className="text-ink-soft mt-2 text-xs">
                  1 = appears first in library and featured lists. 2 = second, and so on.
                </p>
              </Field>
              <Field label="Home featured carousel" className="md:col-span-2">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={!!form.featured}
                    onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                    className="mt-1 size-4 accent-forest"
                  />
                  <span>
                    Show in the animated home featured carousel
                    <span className="text-ink-soft mt-1 block text-xs leading-relaxed">
                      Requires cover + {MIN_GALLERY}+ gallery images. Uncheck to keep on the library
                      shelf only.
                    </span>
                  </span>
                </label>
              </Field>
              <Field label="Access level">
                <select
                  value={form.access_level}
                  onChange={(e) => {
                    const access_level = e.target.value as AccessLevel
                    setForm({
                      ...form,
                      access_level,
                      allow_offline_download: access_level === 'offline',
                    })
                  }}
                  className="field"
                >
                  {accessLevels.map((o) => (
                    <option key={o.value} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
                <p className="text-ink-soft mt-2 text-xs">
                  {accessLevels.find((o) => o.value === form.access_level)?.hint}
                </p>
              </Field>
              <Field label="Offline download">
                <label className="flex items-start gap-3 text-sm">
                  <input
                    type="checkbox"
                    checked={form.allow_offline_download !== false}
                    onChange={(e) => setForm({ ...form, allow_offline_download: e.target.checked })}
                    className="mt-1 size-4 accent-forest"
                  />
                  <span>
                    Allow PDF download for offline reading
                    <span className="text-ink-soft mt-1 block text-xs">
                      Turn off for online-only streaming when sign-in is enabled later.
                    </span>
                  </span>
                </label>
              </Field>
            </YveCard>
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={380}>
          <Section
            title="6. Reader experience"
            hint="Optional defaults when someone opens this novel in the app."
          >
            <YveCard className="grid gap-4 p-5 md:grid-cols-2">
              <Field label="Suggested reading mode">
                <select
                  value={form.default_reading_style ?? ''}
                  onChange={(e) =>
                    setForm({
                      ...form,
                      default_reading_style:
                        e.target.value === '' ? null : Number(e.target.value),
                    })
                  }
                  className="field"
                >
                  {READING_STYLE_OPTIONS.map((o) => (
                    <option key={String(o.value)} value={o.value}>
                      {o.label}
                    </option>
                  ))}
                </select>
              </Field>
              <Field label="Featured carousel speed (seconds)">
                <input
                  type="number"
                  min={3}
                  max={30}
                  value={form.carousel_interval_sec ?? 5}
                  onChange={(e) =>
                    setForm({ ...form, carousel_interval_sec: Number(e.target.value) })
                  }
                  className="field"
                />
                <p className="text-ink-soft mt-2 text-xs">
                  How long each gallery image shows on the home featured card (default 5).
                </p>
              </Field>
            </YveCard>
          </Section>
        </FadeSlideIn>

        <FadeSlideIn delay={440}>
          <div className="flex flex-wrap gap-3">
            <YvePrimaryButton type="submit" disabled={busy} leadingIcon={Save} className="!w-auto px-8">
              {saving ? 'Saving…' : uploading ? 'Uploading…' : 'Save novel'}
            </YvePrimaryButton>
            {!isNew && (
              <button
                type="button"
                onClick={onArchive}
                className="border-burgundy/30 text-burgundy rounded-full border px-6 py-3 text-sm font-semibold"
              >
                Archive
              </button>
            )}
          </div>
        </FadeSlideIn>
      </form>
    </div>
  )
}

function Section({
  title,
  hint,
  children,
}: {
  title: string
  hint?: string
  children: React.ReactNode
}) {
  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-ink font-[family-name:var(--font-display)] text-xl font-bold">{title}</h2>
        {hint && <p className="text-ink-soft mt-1 text-sm leading-relaxed">{hint}</p>}
      </div>
      {children}
    </div>
  )
}

function Field({
  label,
  children,
  className = '',
}: {
  label: string
  children: React.ReactNode
  className?: string
}) {
  return (
    <label className={`block ${className}`}>
      <span className="text-ink mb-2 block text-sm font-bold">{label}</span>
      {children}
    </label>
  )
}
