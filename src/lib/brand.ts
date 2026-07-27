/** Resolve public asset paths (GitHub Pages base-aware). */
export function asset(path: string) {
  const base = import.meta.env.BASE_URL
  return `${base}${path.replace(/^\//, '')}`
}

export const BRAND = {
  name: 'YveLeaf',
  tagline: 'Turn the Page. Live the Story.',
  adminSubtitle: 'Administrator portal',
} as const

export const IMAGES = {
  logo: asset('assets/images/logo.png'),
  welcome: asset('assets/images/yvonne_welcome.png'),
  bookshelf: asset('assets/images/yvonne_bookshelf.png'),
  reading: asset('assets/images/yvonne_reading.png'),
  portrait: asset('assets/images/yvonne_portrait.png'),
  dreamy: asset('assets/images/yvonne_dreamy.png'),
  celebration: asset('assets/images/yvonne_celebration.png'),
  medallion: asset('assets/images/yvonne_medallion.png'),
} as const
