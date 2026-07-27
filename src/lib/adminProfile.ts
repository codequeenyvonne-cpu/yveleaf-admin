export type AdminProfile = {
  displayName: string
  phone: string
  joinedDate: string
  bio: string
}

const PROFILE_KEY = 'yveleaf_admin_profile'

export const defaultAdminProfile: AdminProfile = {
  displayName: 'Yvonne',
  phone: '',
  joinedDate: new Date().toISOString().slice(0, 10),
  bio: 'Curator of stories and keeper of the leaf.',
}

export function loadAdminProfile(): AdminProfile {
  try {
    const raw = localStorage.getItem(PROFILE_KEY)
    if (!raw) return { ...defaultAdminProfile }
    return { ...defaultAdminProfile, ...(JSON.parse(raw) as Partial<AdminProfile>) }
  } catch {
    return { ...defaultAdminProfile }
  }
}

export function saveAdminProfile(profile: AdminProfile) {
  localStorage.setItem(PROFILE_KEY, JSON.stringify(profile))
}

export function adminDisplayName(fallback?: string | null) {
  const profile = loadAdminProfile()
  const trimmed = profile.displayName.trim()
  if (trimmed) return trimmed
  return fallback?.trim() || 'Administrator'
}
