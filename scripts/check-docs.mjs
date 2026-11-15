// Provera dokumentacije, bez dodatnih zavisnosti.
//
//   1. Relativni linkovi i sidra (#naslov) u svim Markdown fajlovima.
//   2. TypeScript primeri u lekcijama (docs/0*-*/): svaki ```ts blok se izdvaja
//      u poseban modul i proverava kompajlerom (tsconfig.json iz korena).
//      Blok koji namerno nije potpun kod označava se sa ```ts nocheck
//
// Upotreba:
//   npm run docs:check
//   npm run docs:check -- --all      (proverava i TypeScript primere u docs/original/)
import fs from 'node:fs'
import path from 'node:path'
import { execFileSync } from 'node:child_process'
import { fileURLToPath } from 'node:url'

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..')
const docsDir = path.join(root, 'docs')
const checkDir = path.join(root, '.docs-check')
const includeOriginal = process.argv.includes('--all')

const rel = (p) => path.relative(root, p).split(path.sep).join('/')

const walk = (dir) =>
  fs.readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
    const p = path.join(dir, e.name)
    if (e.isDirectory()) return e.name.startsWith('.') || e.name === 'node_modules' ? [] : walk(p)
    return e.name.endsWith('.md') ? [p] : []
  })

const markdownFiles = [
  ...walk(docsDir),
  ...['README.md', 'CONTRIBUTING.md'].map((f) => path.join(root, f)).filter((f) => fs.existsSync(f))
]

const read = (f) => fs.readFileSync(f, 'utf8').replace(/\r/g, '')

// Uklanja ograđene blokove koda, ali zadržava broj linija.
const stripFences = (text) => {
  let inFence = false
  return text
    .split('\n')
    .map((line) => {
      if (/^\s*(```|~~~)/.test(line)) {
        inFence = !inFence
        return ''
      }
      return inFence ? '' : line
    })
    .join('\n')
}

// Isti algoritam kao `slugify` u docs/.vitepress/config.mts (GitHub / github-slugger).
const slugify = (s) =>
  s
    .trim()
    .toLowerCase()
    .replace(/[^\p{L}\p{M}\p{N}\p{Pc} -]/gu, '')
    .replace(/ /g, '-')

const headingText = (raw) =>
  raw
    .replace(/!?\[([^\]]*)\]\([^)]*\)/g, '$1')
    .replace(/<[^>]+>/g, '')
    .replace(/`/g, '')
    .replace(/\*\*?/g, '')
    .replace(/(^|\s)_([^_]+)_(?=\s|$)/g, '$1$2')

const anchorCache = new Map()
const anchorsOf = (file) => {
  if (!anchorCache.has(file)) {
    const seen = new Map()
    const anchors = new Set()
    for (const line of stripFences(read(file)).split('\n')) {
      const m = /^(#{1,6})\s+(.*?)\s*#*\s*$/.exec(line)
      if (!m) continue
      const base = slugify(headingText(m[2]))
      const n = seen.get(base) ?? 0
      seen.set(base, n + 1)
      anchors.add(n === 0 ? base : `${base}-${n}`)
    }
    anchorCache.set(file, anchors)
  }
  return anchorCache.get(file)
}

// -------------------------------------------------------------------------------------
// 1. Linkovi
// -------------------------------------------------------------------------------------

const linkErrors = []

const resolveTarget = (from, href) => {
  if (href.startsWith('/')) {
    // apsolutna putanja na portalu (npr. u frontmatter-u početne strane)
    const p = path.join(docsDir, decodeURI(href))
    if (href.endsWith('/')) return path.join(p, 'index.md')
    return fs.existsSync(p + '.md') ? p + '.md' : p
  }
  return path.resolve(path.dirname(from), decodeURI(href))
}

for (const file of markdownFiles) {
  const text = read(file)
  const lines = stripFences(text).split('\n')
  lines.forEach((line, i) => {
    const code = line.replace(/`[^`]*`/g, '')
    const hrefs = [
      ...[...code.matchAll(/\]\(([^)\s]+)(?:\s+"[^"]*")?\)/g)].map((m) => m[1]),
      ...[...code.matchAll(/\s(?:src|href)="([^"]+)"/g)].map((m) => m[1]),
      ...[...code.matchAll(/^\s*-?\s*link:\s*(\S+)\s*$/g)].map((m) => m[1])
    ]
    for (const href of hrefs) {
      if (/^[a-z][a-z0-9+.-]*:/i.test(href)) continue
      const [target, hash] = href.split('#')
      const targetFile = target === '' ? file : resolveTarget(file, target)
      const where = `${rel(file)}:${i + 1}`
      if (!fs.existsSync(targetFile)) {
        linkErrors.push(`${where}  ne postoji: ${href}`)
        continue
      }
      if (hash !== undefined && targetFile.endsWith('.md') && !anchorsOf(targetFile).has(decodeURIComponent(hash))) {
        linkErrors.push(`${where}  ne postoji sidro: ${href}`)
      }
    }
  })
}

// -------------------------------------------------------------------------------------
// 2. TypeScript primeri
// -------------------------------------------------------------------------------------

const isLesson = (f) => /^docs\/0\d-[^/]+\//.test(rel(f))
const isOriginal = (f) => rel(f).startsWith('docs/original/')

fs.rmSync(checkDir, { recursive: true, force: true })
fs.mkdirSync(checkDir)

const blocks = []
for (const file of markdownFiles.filter((f) => isLesson(f) || (includeOriginal && isOriginal(f)))) {
  const lines = read(file).split('\n')
  for (let i = 0; i < lines.length; i++) {
    const open = /^```(ts|typescript)(\s.*)?$/.exec(lines[i].trim())
    if (!open) continue
    let j = i + 1
    while (j < lines.length && !/^```\s*$/.test(lines[j].trim())) j++
    if (!/\bnocheck\b/.test(open[2] ?? '')) {
      const name = `${rel(file).replace(/[/.]/g, '_')}__L${i + 2}.ts`
      fs.writeFileSync(path.join(checkDir, name), lines.slice(i + 1, j).join('\n') + '\nexport {}\n')
      blocks.push({ name, file: rel(file), line: i + 2 })
    }
    i = j
  }
}

fs.writeFileSync(
  path.join(checkDir, 'tsconfig.json'),
  JSON.stringify({ extends: '../tsconfig.json', compilerOptions: { noEmit: true }, include: ['*.ts'] }, null, 2)
)

let typeErrors = []
if (blocks.length > 0) {
  try {
    execFileSync(process.execPath, [path.join(root, 'node_modules/typescript/bin/tsc'), '-p', checkDir, '--pretty', 'false'], {
      encoding: 'utf8'
    })
  } catch (e) {
    const byName = new Map(blocks.map((b) => [b.name, b]))
    for (const l of String(e.stdout).split(/\r?\n/)) {
      if (l.trim() === '') continue
      const m = /([^\\/(]+\.ts)\((\d+),(\d+)\): (.*)$/.exec(l)
      const b = m && byName.get(m[1])
      if (b) typeErrors.push(`${b.file}:${b.line + Number(m[2]) - 1}  ${m[4]}`)
      else if (typeErrors.length > 0 && /^\s/.test(l)) typeErrors[typeErrors.length - 1] += `\n    ${l.trim()}`
      else typeErrors.push(l)
    }
  }
}

// -------------------------------------------------------------------------------------
// Izveštaj
// -------------------------------------------------------------------------------------

console.log(`Markdown fajlova: ${markdownFiles.length}, TypeScript blokova: ${blocks.length}`)
if (linkErrors.length) console.log(`\nNeispravni linkovi (${linkErrors.length}):\n  ` + linkErrors.join('\n  '))
if (typeErrors.length) console.log(`\nGreške u TypeScript primerima (${typeErrors.length}):\n  ` + typeErrors.join('\n  '))
if (linkErrors.length === 0 && typeErrors.length === 0) {
  console.log('Sve provere su prošle.')
  fs.rmSync(checkDir, { recursive: true, force: true })
} else {
  process.exitCode = 1
}
