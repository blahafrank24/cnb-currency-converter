export const theme = {
  color: {
    background: '#f4f6fb',
    surface: '#ffffff',
    text: '#1b2333',
    muted: '#5a6478',
    border: '#d5dbe8',
    accent: '#1d4ed8',
    accentText: '#ffffff',
    danger: '#b42318',
    dangerBackground: '#fef3f2',
  },
  space: (n: number) => `${n * 0.25}rem`,
  radius: '0.5rem',
  maxWidth: '44rem',
} as const
