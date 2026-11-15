# Funkcionalno programiranje u TypeScript-u

Kurs funkcionalnog programiranja na srpskom jeziku, zasnovan na kursu koji je napisao [Giulio Canti](https://github.com/gcanti), autor biblioteke [`fp-ts`](https://github.com/gcanti/fp-ts).

Kurs kreće od osnova — čistih funkcija, referencijalne transparentnosti i kompozicije — i postepeno vodi ka algebarskim strukturama, funktorima, monadama i upravljanju efektima. Svaka lekcija prvo gradi intuiciju na konkretnom problemu, zatim daje preciznu definiciju (formalne definicije i algebarski zakoni iz originala su sačuvani), a na kraju proverava razumevanje kroz vežbu.

**Portal sa kursom: <https://savkelita.github.io/functional-programming/>**

Lekcije možete čitati i direktno na GitHub-u, u folderu [`docs/`](docs/) — portal i GitHub koriste iste Markdown fajlove.

## Za koga je kurs?

Za programere koji poznaju osnove TypeScript-a (tipovi, funkcije, generici). Prethodno znanje funkcionalnog programiranja, teorije kategorija ili matematike nije potrebno.

## Sadržaj

| Celina                                                                    | Teme                                                                                                 | Status      |
| ------------------------------------------------------------------------- | ---------------------------------------------------------------------------------------------------- | ----------- |
| [1. Temelji funkcionalnog programiranja](docs/01-osnove/index.md)         | čiste funkcije, sporedni efekti, referencijalna transparentnost, nepromenljivost, kompozicija, `pipe` i `flow`, totalne i parcijalne funkcije | dostupna    |
| [2. Modelovanje podataka i grešaka](docs/02-modelovanje/index.md)         | tipovi proizvoda i sume, discriminated unions, pattern matching, `Option`, `Either`                   | u pripremi  |
| [3. Algebra i matematički zakoni](docs/03-algebre/index.md)               | `Magma`, `Semigroup`, `Monoid`, `Eq`, `Ord`, asocijativnost, neutralni element                        | u pripremi  |
| [4. Apstrakcije i kompozicija](docs/04-apstrakcije/index.md)              | `Functor`, `map`, `Apply`, `Applicative`, `of`                                                        | u pripremi  |
| [5. Monade i efekti](docs/05-efekti/index.md)                             | `Monad`, `chain`, `flatten`, monadski zakoni, `IO`, `Task`, `Reader`                                  | u pripremi  |

Gradivo celina koje su u pripremi dostupno je u [originalnom prevodu](docs/original/index.md). [Mapa sadržaja](docs/mapa-sadrzaja.md) pokazuje gde je koje poglavlje originala prerađeno ili gde će biti.

## Originalni prevod

Kompletan srpski prevod originalnog kursa, koji se ranije nalazio u ovom README-u, sada je u folderu [`docs/original/`](docs/original/index.md), podeljen po poglavljima. Tekst prevoda nije menjan. Primeri i vežbe iz originala nalaze se u folderu [`src/`](src/).

## Pokretanje

```sh
git clone https://github.com/savkelita/functional-programming.git
cd functional-programming
npm install
```

| Komanda                | Šta radi                                                                         |
| ---------------------- | -------------------------------------------------------------------------------- |
| `npm run docs:dev`     | pokreće portal lokalno, sa automatskim osvežavanjem                              |
| `npm run docs:build`   | pravi statičku verziju portala u `docs/.vitepress/dist`                          |
| `npm run docs:preview` | prikazuje napravljenu verziju portala                                            |
| `npm run docs:check`   | proverava interne linkove i sidra, i TypeScript primere u lekcijama              |
| `npm run build`        | proverava tipove u primerima iz `src/` (i u folderu `dev/` za vaše eksperimente) |

Portal se objavljuje na GitHub Pages automatski, pri svakoj izmeni grane `master` (videti [`.github/workflows/deploy.yml`](.github/workflows/deploy.yml)).

## Struktura repozitorijuma

```text
functional-programming/
├── README.md                ulazna stranica (ovaj fajl)
├── CONTRIBUTING.md          uputstvo za autore lekcija
├── docs/                    sadržaj portala (Markdown)
│   ├── index.md             početna strana portala
│   ├── 01-osnove/           Celina 1 — lekcije
│   ├── 02-modelovanje/      Celina 2 — u pripremi
│   ├── 03-algebre/          Celina 3 — u pripremi
│   ├── 04-apstrakcije/      Celina 4 — u pripremi
│   ├── 05-efekti/           Celina 5 — u pripremi
│   ├── original/            originalni prevod, po poglavljima
│   ├── images/              slike iz originalnog kursa
│   ├── mapa-sadrzaja.md     veza između originala i nove strukture
│   └── .vitepress/          konfiguracija portala (VitePress)
├── src/                     primeri i vežbe iz originalnog kursa
├── scripts/check-docs.mjs   provera linkova i TypeScript primera
└── .github/workflows/       automatsko objavljivanje portala
```

## Doprinos

Uputstvo za pisanje i proveru lekcija nalazi se u [CONTRIBUTING.md](CONTRIBUTING.md).

## Autorstvo i licenca

- Originalni kurs (na italijanskom): [gcanti/functional-programming](https://github.com/gcanti/functional-programming), autor Giulio Canti.
- Druge adaptacije originala: [na engleskom](https://github.com/enricopolanski/functional-programming), [na korejskom](https://github.com/alstn2468/functional-programming).
- Srpski prevod i prerada: [savkelita/functional-programming](https://github.com/savkelita/functional-programming).

Objavljeno pod [MIT licencom](LICENSE) — Copyright (c) 2019-present Giulio Canti.
