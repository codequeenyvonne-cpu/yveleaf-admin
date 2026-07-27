import { useEffect, useState } from 'react'
import { Link, useNavigate, useParams } from 'react-router-dom'
import { ArrowLeft, Save } from 'lucide-react'
import { deleteNovel, fetchAdminNovels, saveNovel } from '../lib/api'
import { loadSession } from '../lib/auth'
import type { AccessLevel, Novel, NovelStatus } from '../lib/types'

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

export function NovelFormPage() {
  const { novelId } = useParams()
  const navigate = useNavigate()
  const isNew = !novelId || novelId === 'new'

  const [form, setForm] = useState<Partial<Novel>>({
    title: '',
    author: '',
    genre: '',
    description: '',
    access_level: 'offline',
    status: 'draft',
    featured: false,
    sort_order: 0,
    pdf_drive_id: '',
    cover_drive_id: '',
    gallery_drive_ids: '',
    total_pages: 0,
  })
  const [loading, setLoading] = useState(!isNew)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    if (isNew) return
    const session = loadSession()
    if (!session) return
    fetchAdminNovels(session.idToken)
      .then((novels) => novels.find((n) => n.novel_id === novelId))
      .then((novel) => {
        if (novel) setForm(novel)
      })
      .catch((e: Error) => setError(e.message))
      .finally(() => setLoading(false))
  }, [isNew, novelId])

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    const session = loadSession()
    if (!session) return

    setSaving(true)
    setError('')
    try {
      await saveNovel(session.idToken, {
        ...form,
        novel_id: isNew ? undefined : novelId,
        title: form.title?.trim() ?? '',
        author: form.author?.trim() ?? '',
        access_level: form.access_level ?? 'offline',
        status: form.status ?? 'draft',
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
    return <p className="text-forest/70">Loading novel…</p>
  }

  return (
    <div className="space-y-6">
      <Link to="/novels" className="text-forest/70 inline-flex items-center gap-2 text-sm hover:text-forest">
        <ArrowLeft className="size-4" />
        Back to novels
      </Link>

      <div>
        <h1 className="font-display text-3xl">{isNew ? 'Add novel' : 'Edit novel'}</h1>
        <p className="text-forest/70 mt-1">Upload files to Google Drive first, then paste the file IDs here.</p>
      </div>

      {error && (
        <div className="border-burgundy/20 bg-burgundy/5 text-burgundy rounded-xl border px-4 py-3 text-sm">
          {error}
        </div>
      )}

      <form onSubmit={onSubmit} className="space-y-6">
        <section className="border-cream-deep grid gap-4 rounded-2xl border bg-surface p-5 shadow-sm md:grid-cols-2">
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
        </section>

        <section className="border-cream-deep grid gap-4 rounded-2xl border bg-surface p-5 shadow-sm md:grid-cols-2">
          <Field label="Access level">
            <select
              value={form.access_level}
              onChange={(e) => setForm({ ...form, access_level: e.target.value as AccessLevel })}
              className="field"
            >
              {accessLevels.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.label}
                </option>
              ))}
            </select>
            <p className="text-forest/60 mt-2 text-xs">
              {accessLevels.find((o) => o.value === form.access_level)?.hint}
            </p>
          </Field>
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
          <Field label="Featured on home">
            <label className="flex items-center gap-3 text-sm">
              <input
                type="checkbox"
                checked={!!form.featured}
                onChange={(e) => setForm({ ...form, featured: e.target.checked })}
                className="size-4 accent-forest"
              />
              Show in featured carousel
            </label>
          </Field>
          <Field label="Sort order">
            <input
              type="number"
              value={form.sort_order ?? 0}
              onChange={(e) => setForm({ ...form, sort_order: Number(e.target.value) })}
              className="field"
            />
          </Field>
        </section>

        <section className="border-cream-deep grid gap-4 rounded-2xl border bg-surface p-5 shadow-sm md:grid-cols-2">
          <Field label="PDF Drive file ID">
            <input
              value={form.pdf_drive_id ?? ''}
              onChange={(e) => setForm({ ...form, pdf_drive_id: e.target.value })}
              className="field"
              placeholder="Paste from Drive share link"
            />
          </Field>
          <Field label="Cover Drive file ID">
            <input
              value={form.cover_drive_id ?? ''}
              onChange={(e) => setForm({ ...form, cover_drive_id: e.target.value })}
              className="field"
            />
          </Field>
          <Field label="Gallery Drive IDs" className="md:col-span-2">
            <input
              value={form.gallery_drive_ids ?? ''}
              onChange={(e) => setForm({ ...form, gallery_drive_ids: e.target.value })}
              className="field"
              placeholder="id1,id2,id3"
            />
          </Field>
        </section>

        <div className="flex flex-wrap gap-3">
          <button
            type="submit"
            disabled={saving}
            className="bg-forest text-cream inline-flex items-center gap-2 rounded-full px-6 py-3 text-sm font-semibold disabled:opacity-60"
          >
            <Save className="size-4" />
            {saving ? 'Saving…' : 'Save novel'}
          </button>
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
      </form>
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
      <span className="mb-2 block text-sm font-semibold">{label}</span>
      {children}
    </label>
  )
}
