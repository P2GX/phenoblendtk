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
          { text: 'Tutorial', link: '/tutorial/index',
            items: [
          { text: 'HPO(A) Data', link: '/tutorial/data' },
          { text: 'Input data', link: '/tutorial/input' },
          { text: 'Visualizing data', link: '/tutorial/visualizations' },
          { text: 'Overlap plot', link: '/tutorial/overlap' },
          { text: 'Upset plot', link: '/tutorial/upset' },
          { text: 'Phenotypic profile plot', link: '/tutorial/profile' },
        
        ]
           },
        
        ]
      }
    ],
    socialLinks: [
      { icon: 'github', link: 'https://github.com/P2GX/phenoblendtk' }
    ]
  }
})