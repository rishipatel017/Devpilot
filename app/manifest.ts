import { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: 'DevPilot - AI-Powered Developer Tools',
    short_name: 'DevPilot',
    description: 'Supercharge your development workflow with 5 intelligent AI tools. Get AI-powered resume analysis, GitHub repository explanations, bug fixing, code documentation, and SQL query generation.',
    start_url: '/',
    display: 'standalone',
    background_color: '#0f172a',
    theme_color: '#2563eb',
    orientation: 'portrait-primary',
    icons: [
      {
        src: '/devpilot_logo.png',
        sizes: 'any',
        type: 'image/png',
        purpose: 'any',
      },
    ],
  }
}
