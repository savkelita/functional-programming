import fs from 'node:fs'
import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig, type DefaultTheme } from 'vitepress'

// -------------------------------------------------------------------------------------
// Repozitorijum
// -------------------------------------------------------------------------------------

// U GitHub Actions-u repozitorijum i grana čitaju se iz okruženja, pa linkovi
// ("Uredi stranicu", linkovi ka `src/`) i bazna putanja rade i u fork-ovima.
const repo = process.env.GITHUB_REPOSITORY ?? 'savkelita/functional-programming'
const branch = process.env.GITHUB_HEAD_REF || process.env.GITHUB_REF_NAME || 'master'
const repoUrl = `https://github.com/${repo}`
const repoName = repo.split('/')[1]
const base = repoName.endsWith('.github.io') ? '/' : `/${repoName}/`

const repoRoot = fileURLToPath(new URL('../../', import.meta.url))

// -------------------------------------------------------------------------------------
// Markdown
// -------------------------------------------------------------------------------------

// Isti algoritam za sidra naslova koji koristi GitHub (github-slugger), da bi
// linkovi poput `#čiste-funkcije` radili i na GitHub-u i na portalu.
const slugify = (s: string): string =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-')

// Relativni linkovi iz Markdown-a ka fajlovima van `docs/` (npr. `../../src/01_retry.ts`)
// rade na GitHub-u, ali ne postoje na portalu, pa ih na portalu preusmeravamo na GitHub.
const toGitHubUrl = (relativePath: string, href: string): string | undefined => {
  if (/^([a-z][a-z0-9+.-]*:|#|\/)/i.test(href)) return undefined
  const [file, hash] = href.split('#')
  const target = path.posix.normalize(path.posix.join('docs', path.posix.dirname(relativePath), file))
  if (target.startsWith('docs/')) return undefined
  const isDir = fs.existsSync(path.join(repoRoot, target)) && fs.statSync(path.join(repoRoot, target)).isDirectory()
  const url = `${repoUrl}/${isDir ? 'tree' : 'blob'}/${branch}/${target.replace(/\/$/, '')}`
  return hash ? `${url}#${hash}` : url
}

const alertTitles: Record<string, string> = {
  note: 'Napomena',
  tip: 'Savet',
  important: 'Važno',
  warning: 'Upozorenje',
  caution: 'Oprez'
}

// -------------------------------------------------------------------------------------
// Navigacija
// -------------------------------------------------------------------------------------

const sidebarKurs: DefaultTheme.SidebarItem[] = [
  {
    text: 'Celina 1 — Temelji',
    items: [
      { text: 'Celina 1: pregled', link: '/01-osnove/' },
      { text: '1. Uvod u funkcionalno programiranje', link: '/01-osnove/01-uvod' },
      { text: '2. Čiste funkcije', link: '/01-osnove/02-ciste-funkcije' },
      { text: '3. Sporedni efekti', link: '/01-osnove/03-sporedni-efekti' },
      { text: '4. Referencijalna transparentnost', link: '/01-osnove/04-referencijalna-transparentnost' },
      { text: '5. Nepromenljivost podataka', link: '/01-osnove/05-nepromenljivost' },
      { text: '6. Kompozicija funkcija', link: '/01-osnove/06-kompozicija-funkcija' },
      { text: '7. pipe i flow', link: '/01-osnove/07-pipe-i-flow' },
      { text: '8. Totalne i parcijalne funkcije', link: '/01-osnove/08-totalne-i-parcijalne-funkcije' }
    ]
  },
  {
    text: 'Celina 2 — Modelovanje podataka i grešaka',
    items: [{ text: 'Celina 2: pregled (u pripremi)', link: '/02-modelovanje/' }]
  },
  {
    text: 'Celina 3 — Algebra i matematički zakoni',
    items: [{ text: 'Celina 3: pregled (u pripremi)', link: '/03-algebre/' }]
  },
  {
    text: 'Celina 4 — Apstrakcije i kompozicija',
    items: [{ text: 'Celina 4: pregled (u pripremi)', link: '/04-apstrakcije/' }]
  },
  {
    text: 'Celina 5 — Monade i efekti',
    items: [{ text: 'Celina 5: pregled (u pripremi)', link: '/05-efekti/' }]
  },
  {
    text: 'O kursu',
    items: [
      { text: 'Mapa sadržaja', link: '/mapa-sadrzaja' },
      { text: 'Originalni prevod', link: '/original/' }
    ]
  }
]

const sidebarOriginal: DefaultTheme.SidebarItem[] = [
  {
    text: 'Originalni prevod',
    items: [
      { text: 'Sadržaj', link: '/original/' },
      { text: '1. Šta je funkcionalno programiranje', link: '/original/01-sta-je-funkcionalno-programiranje' },
      { text: '2. Dva stuba funkcionalnog programiranja', link: '/original/02-dva-stuba-funkcionalnog-programiranja' },
      { text: '3. Polugrupe', link: '/original/03-polugrupe' },
      { text: '4. Jednakost (Eq)', link: '/original/04-jednakost-eq' },
      { text: '5. Uređenje (Ord)', link: '/original/05-uredjenje-ord' },
      { text: '6. Monoidi', link: '/original/06-monoidi' },
      { text: '7. Čiste i parcijalne funkcije', link: '/original/07-ciste-i-parcijalne-funkcije' },
      { text: '8. Algebarski tipovi podataka', link: '/original/08-algebarski-tipovi-podataka' },
      { text: '9. Funkcionalno rukovanje greškama', link: '/original/09-funkcionalno-rukovanje-greskama' },
      { text: '10. Teorija kategorija', link: '/original/10-teorija-kategorija' },
      { text: '11. Funktori', link: '/original/11-funktori' },
      { text: '12. Aplikativni funktori', link: '/original/12-aplikativni-funktori' },
      { text: '13. Monade', link: '/original/13-monade' }
    ]
  },
  {
    text: 'Dodaci',
    items: [
      { text: 'A. Monad transformeri', link: '/original/dodatak-monad-transformeri' },
      { text: 'B. Task naspram Promise', link: '/original/dodatak-task-vs-promise' }
    ]
  },
  {
    text: 'Novi kurs',
    items: [{ text: 'Lekcije novog kursa', link: '/01-osnove/' }]
  }
]

// -------------------------------------------------------------------------------------
// Konfiguracija
// -------------------------------------------------------------------------------------

export default defineConfig({
  lang: 'sr-Latn',
  title: 'Funkcionalno programiranje',
  description:
    'Kurs funkcionalnog programiranja u TypeScript-u na srpskom jeziku, zasnovan na kursu Giulija Cantija.',
  base,
  cleanUrls: true,
  lastUpdated: true,

  vue: {
    template: {
      compilerOptions: {
        // Originalni prevod oko slika koristi zastareli HTML element <center>. Vue ga
        // inače tretira kao (nepostojeću) komponentu i ne prikazuje njegov sadržaj.
        isCustomElement: (tag) => tag === 'center'
      }
    }
  },

  markdown: {
    anchor: { slugify },
    container: {
      tipLabel: 'Savet',
      warningLabel: 'Upozorenje',
      dangerLabel: 'Opasnost',
      infoLabel: 'Info',
      detailsLabel: 'Detalji'
    },
    config(md) {
      const linkOpen = md.renderer.rules.link_open
      md.renderer.rules.link_open = (tokens, idx, options, env, self) => {
        const href = tokens[idx].attrGet('href')
        const url = href ? toGitHubUrl(env.relativePath, href) : undefined
        if (url) tokens[idx].attrSet('href', url)
        return linkOpen ? linkOpen(tokens, idx, options, env, self) : self.renderToken(tokens, idx, options)
      }

      const alertOpen = md.renderer.rules.github_alert_open
      if (alertOpen) {
        md.renderer.rules.github_alert_open = (tokens, idx, options, env, self) => {
          const meta = tokens[idx].meta
          if (meta && meta.title === String(meta.type).toUpperCase() && alertTitles[meta.type]) {
            meta.title = alertTitles[meta.type]
          }
          return alertOpen(tokens, idx, options, env, self)
        }
      }
    }
  },

  themeConfig: {
    nav: [
      { text: 'Kurs', link: '/01-osnove/', activeMatch: '^/0[1-5]-' },
      { text: 'Originalni prevod', link: '/original/', activeMatch: '^/original/' },
      { text: 'Mapa sadržaja', link: '/mapa-sadrzaja' }
    ],

    sidebar: {
      '/original/': sidebarOriginal,
      '/': sidebarKurs
    },

    socialLinks: [{ icon: 'github', link: repoUrl }],

    editLink: {
      pattern: `${repoUrl}/edit/${branch}/docs/:path`,
      text: 'Uredi ovu stranicu na GitHub-u'
    },

    search: {
      provider: 'local',
      options: {
        translations: {
          button: { buttonText: 'Pretraga', buttonAriaLabel: 'Pretraga' },
          modal: {
            displayDetails: 'Prikaži detalje',
            resetButtonTitle: 'Obriši upit',
            backButtonTitle: 'Zatvori pretragu',
            noResultsText: 'Nema rezultata za',
            footer: {
              selectText: 'izaberi',
              selectKeyAriaLabel: 'enter',
              navigateText: 'kretanje',
              navigateUpKeyAriaLabel: 'strelica gore',
              navigateDownKeyAriaLabel: 'strelica dole',
              closeText: 'zatvori',
              closeKeyAriaLabel: 'escape'
            }
          }
        }
      }
    },

    outline: { level: [2, 3], label: 'Na ovoj stranici' },
    docFooter: { prev: 'Prethodno', next: 'Sledeće' },
    lastUpdated: { text: 'Poslednja izmena', formatOptions: { dateStyle: 'medium' } },

    darkModeSwitchLabel: 'Tema',
    lightModeSwitchTitle: 'Uključi svetlu temu',
    darkModeSwitchTitle: 'Uključi tamnu temu',
    sidebarMenuLabel: 'Meni',
    returnToTopLabel: 'Nazad na vrh',
    langMenuLabel: 'Promeni jezik',
    skipToContentLabel: 'Pređi na sadržaj',

    notFound: {
      title: 'STRANICA NIJE PRONAĐENA',
      quote: 'Ova stranica ne postoji ili je premeštena.',
      linkLabel: 'idi na početnu stranicu',
      linkText: 'Nazad na početnu'
    },

    footer: {
      message:
        'Zasnovano na kursu <a href="https://github.com/gcanti/functional-programming">Giulija Cantija</a>. Objavljeno pod MIT licencom.'
    }
  }
})
