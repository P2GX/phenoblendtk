import { defineConfig } from 'vitepress'

export default defineConfig({
  title: "phenoblendtk",
  description: "Phenoblend Toolkit",
  base: '/phenoblendtk/', // Matches your GitHub Pages repository subfolder URL path
  
  themeConfig: {
    nav: [
      { text: 'Home', link: '/' },
      { text: 'Guides', link: '/guides/installation' }
    ],
    sidebar: [
      {
        text: 'Getting Started',
        items: [
          { text: 'Installation & Setup', link: '/guides/installation' },
        
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/P2GX/phenoblendtk' }
    ]
  }
})