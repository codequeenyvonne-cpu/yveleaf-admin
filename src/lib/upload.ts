import { completeAdminUpload, initAdminUpload, uploadAdminFilePart } from './api'

const RAW_CHUNK_SIZE = 70000

function readFileAsBytes(file: File): Promise<Uint8Array> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onload = () => resolve(new Uint8Array(reader.result as ArrayBuffer))
    reader.onerror = () => reject(new Error('Could not read file'))
    reader.readAsArrayBuffer(file)
  })
}

function bytesToBase64(bytes: Uint8Array): string {
  let binary = ''
  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i])
  return btoa(binary)
}

function splitBytes(bytes: Uint8Array, chunkSize = RAW_CHUNK_SIZE): string[] {
  const parts: string[] = []
  for (let i = 0; i < bytes.length; i += chunkSize) {
    parts.push(bytesToBase64(bytes.subarray(i, i + chunkSize)))
  }
  return parts.length ? parts : [bytesToBase64(new Uint8Array())]
}

export async function compressImageFile(
  file: File,
  maxWidth = 1400,
  quality = 0.86,
): Promise<File> {
  if (!file.type.startsWith('image/')) return file

  const bitmap = await createImageBitmap(file)
  const scale = Math.min(1, maxWidth / bitmap.width)
  const width = Math.round(bitmap.width * scale)
  const height = Math.round(bitmap.height * scale)

  const canvas = document.createElement('canvas')
  canvas.width = width
  canvas.height = height
  const ctx = canvas.getContext('2d')
  if (!ctx) return file
  ctx.drawImage(bitmap, 0, 0, width, height)
  bitmap.close()

  const blob = await new Promise<Blob | null>((resolve) =>
    canvas.toBlob(resolve, 'image/jpeg', quality),
  )
  if (!blob) return file

  const baseName = file.name.replace(/\.[^.]+$/, '') || 'image'
  return new File([blob], `${baseName}.jpg`, { type: 'image/jpeg' })
}

export function driveThumbnailUrl(fileId: string, width = 480) {
  if (!fileId) return ''
  return `https://drive.google.com/thumbnail?id=${encodeURIComponent(fileId)}&sz=w${width}`
}

export async function uploadAdminFile(
  token: string,
  file: File,
  options: {
    kind: 'pdf' | 'cover' | 'gallery'
    novelId?: string
    onProgress?: (pct: number) => void
  },
): Promise<{ drive_id: string; download_url: string }> {
  const prepared =
    options.kind === 'pdf' ? file : await compressImageFile(file, options.kind === 'cover' ? 1200 : 1600)

  const bytes = await readFileAsBytes(prepared)
  const parts = splitBytes(bytes)

  const { upload_id } = await initAdminUpload(token, {
    filename: prepared.name,
    mimeType: prepared.type || 'application/octet-stream',
    total_parts: parts.length,
    kind: options.kind,
    novel_id: options.novelId,
  })

  for (let i = 0; i < parts.length; i++) {
    await uploadAdminFilePart(token, { upload_id, index: i, data: parts[i] })
    options.onProgress?.(Math.round(((i + 1) / parts.length) * 100))
  }

  return completeAdminUpload(token, upload_id)
}
