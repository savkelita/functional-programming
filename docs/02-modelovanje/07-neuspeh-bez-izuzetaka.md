# 7. Modelovanje neuspeha bez izuzetaka

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 7 od 7
>
> **Predznanje:** [Option](05-option.md) i [Either](06-either.md); [Referencijalna transparentnost](../01-osnove/04-referencijalna-transparentnost.md) i [Sporedni efekti](../01-osnove/03-sporedni-efekti.md) (čisto jezgro, imperativna ljuska).

> [!NOTE]
> Originalni kurs nema posebno poglavlje sa ovim naslovom. Lekcija objedinjuje delove originala (uvod poglavlja o rukovanju greškama, `head` koji baca izuzetak, maksimu „make impossible state unrepresentable“ i kviz o `Promise`-u) u celinu; podela grešaka, smernice za izbor i većina primera su novi.

## Šta ćemo naučiti?

- razliku između **očekivanih** grešaka i **neočekivanih** grešaka (defekata)
- kada koristiti `Option`, kada `Either`, a kada je izuzetak ipak opravdan
- kako se izuzeci i `null` na **granicama** sistema pretvaraju u vrednosti
- šta se dešava kada treba povezati više koraka koji mogu da ne uspeju — i zašto nas to vodi u Celine 4 i 5

## Intuitivno objašnjenje

Kiša je **očekivana**: zato postoji prognoza, a vi nosite kišobran. Pad meteora nije: ne planirate ga u svakodnevnom životu, i ako se desi, ne pokušavate da nastavite sa danom kao da se ništa nije desilo.

Isto je sa greškama u programu:

- **očekivane greške** su deo domena: korisnik unese neispravan broj, traženi korisnik ne postoji, fajl je prazan. One se dešavaju redovno i program mora da ih obradi. Zato treba da budu **vidljive u tipu**.
- **neočekivane greške (defekti)** su posledica grešaka u programu ili okruženju: funkcija pozvana sa argumentima koje „nikad ne bi smela da dobije“, nestanak memorije. Njih ne obrađujemo na svakom koraku; program se prekida ili ih hvata jedan centralni mehanizam na granici.

## Problem koji rešavamo

Funkcija koja baca izuzetak (ili „tiho“ vraća specijalnu vrednost koju tip ne pominje) je primer parcijalne funkcije. Izuzeci za očekivane greške imaju tri problema koje smo već sreli:

1. **Tipovi lažu.** Potpis `head: <A>(as: ReadonlyArray<A>) => A` ne pominje da za prazan niz nema rezultata ([Celina 1, lekcija 8](../01-osnove/08-totalne-i-parcijalne-funkcije.md)).
2. **Izraz koji baca izuzetak nije referencijalno transparentan** — nema vrednost kojom bi se zamenio ([Celina 1, lekcija 4](../01-osnove/04-referencijalna-transparentnost.md)).
3. **Kompajler ne prati izuzetke.** Ništa nas ne tera da napišemo `try/catch`, a kada ga napišemo, uhvaćena vrednost je `unknown` (ili `any`) — ne znamo koje greške su moguće.

Treći problem važi i za `Promise`: tip `Promise<string>` opisuje samo uspeh, a razlog odbijanja nije deo tipa (kviz iz [lekcije 2](02-sum-tipovi.md#kada-treba-da-koristim-tip-sume)).

## Primer bez biblioteka: kako izabrati

| Situacija                                              | Alat                         | Primer                                                    |
| ------------------------------------------------------ | ---------------------------- | --------------------------------------------------------- |
| vrednost možda ne postoji, razlog nije važan           | `Option<A>`                  | prvi element niza, korisnik po ID-ju, ključ u mapi         |
| očekivana greška čiji razlog pozivalac treba da zna     | `Either<E, A>`, `E` tip sume | validacija unosa, parsiranje, pravila poslovne logike     |
| greška u programu ili nemoguće stanje                  | izuzetak                     | prekršena invarijanta, „ovo ne bi smelo da se desi“       |

Ako vam se čini da „nemoguće stanje“ mora da se proverava na mnogo mesta, obično je to znak da tip nije dobro modelovan. Maksima iz [lekcije 2](02-sum-tipovi.md#kada-treba-da-koristim-tip-sume) važi i ovde:

> Make impossible state unrepresentable

Najbolja obrada greške je ona koja nije potrebna, jer tip ne dozvoljava da se stanje uopšte pojavi (kao `ReadonlyNonEmptyArray` u [Celini 1](../01-osnove/08-totalne-i-parcijalne-funkcije.md#način-2-suziti-domen)).

### Granice sistema

U [lekciji o sporednim efektima](../01-osnove/03-sporedni-efekti.md#program-ne-može-bez-efekata) videli smo obrazac „čisto jezgro, imperativna ljuska“. Za greške on izgleda ovako:

- **na granici** (ulaz korisnika, mreža, fajl sistem, biblioteke koje bacaju izuzetke ili vraćaju `null`) svaki neuspeh pretvaramo u **vrednost**: `Option` ili `Either`
- **u jezgru** pišemo čiste i totalne funkcije koje primaju i vraćaju te vrednosti
- **na izlazu** (odgovor korisniku, HTTP odgovor, log) vrednost „raspakujemo“ funkcijom `match`

```ts
type ConfigError =
  | { readonly _tag: 'InvalidJson'; readonly message: string }
  | { readonly _tag: 'MissingPort' }

interface Config {
  readonly port: number
}

type Result<E, A> =
  | { readonly _tag: 'Left'; readonly left: E }
  | { readonly _tag: 'Right'; readonly right: A }

// granica: JSON.parse baca izuzetak — pretvaramo ga u vrednost
const parseJson = (text: string): Result<ConfigError, unknown> => {
  try {
    return { _tag: 'Right', right: JSON.parse(text) }
  } catch (e) {
    return { _tag: 'Left', left: { _tag: 'InvalidJson', message: String(e) } }
  }
}

// jezgro: čista, totalna funkcija
const toConfig = (json: unknown): Result<ConfigError, Config> => {
  const port = (json as { port?: unknown } | null)?.port
  return typeof port === 'number'
    ? { _tag: 'Right', right: { port } }
    : { _tag: 'Left', left: { _tag: 'MissingPort' } }
}

console.log(toConfig({ port: 8080 })) // => { _tag: 'Right', right: { port: 8080 } }
console.log(parseJson('{')._tag) // => Left
```

(Ovde smo `Either` napisali ručno kao `Result`, da bi primer bio bez biblioteka; sa `fp-ts`-om bi `parseJson` bio jedan poziv `E.tryCatch`.)

## Problem: više koraka koji mogu da ne uspeju

Pravi programi retko imaju samo jedan korak. Učitavanje konfiguracije zapravo se sastoji od više koraka — parsiranje JSON-a, čitanje porta, provera porta — i svaki sledeći treba da se izvrši samo ako je prethodni uspeo. Sa alatima koje imamo, to izgleda ovako:

```ts
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

type ConfigError =
  | { readonly _tag: 'InvalidJson' }
  | { readonly _tag: 'MissingPort' }
  | { readonly _tag: 'InvalidPort'; readonly port: number }

interface Config {
  readonly port: number
}

const parseJson = (text: string): E.Either<ConfigError, unknown> =>
  E.tryCatch(
    () => JSON.parse(text),
    (): ConfigError => ({ _tag: 'InvalidJson' })
  )

const getPort = (json: unknown): E.Either<ConfigError, number> => {
  const port = (json as { port?: unknown } | null)?.port
  return typeof port === 'number' ? E.right(port) : E.left({ _tag: 'MissingPort' })
}

const validatePort = (port: number): E.Either<ConfigError, Config> =>
  Number.isInteger(port) && port > 0 && port < 65536
    ? E.right({ port })
    : E.left({ _tag: 'InvalidPort', port })

// tri koraka, svaki može da ne uspe: "piramida" match-eva
const loadConfig = (text: string): E.Either<ConfigError, Config> =>
  pipe(
    parseJson(text),
    E.match(
      (e) => E.left(e),
      (json) =>
        pipe(
          getPort(json),
          E.match(
            (e) => E.left(e),
            (port) => validatePort(port)
          )
        )
    )
  )

console.log(loadConfig('{"port": 8080}')) // => { _tag: 'Right', right: { port: 8080 } }
console.log(loadConfig('{"port": 99999}')) // => { _tag: 'Left', left: { _tag: 'InvalidPort', port: 99999 } }
console.log(loadConfig('{')) // => { _tag: 'Left', left: { _tag: 'InvalidJson' } }
```

Radi, i potpuno je tipski bezbedno — ali obratite pažnju na **obrazac koji se ponavlja**: u svakom koraku grana za grešku samo prosleđuje grešku dalje (`(e) => E.left(e)`), a grana za uspeh pokreće sledeći korak. Sa deset koraka, piramida bi bila neupotrebljiva.

Taj obrazac je toliko čest da ima ime: „nastavi sa sledećim korakom samo ako je prethodni uspeo“ zove se **`chain`** (ili `flatMap`). Kao pogled unapred, evo istog programa:

```ts
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

type ConfigError =
  | { readonly _tag: 'InvalidJson' }
  | { readonly _tag: 'MissingPort' }
  | { readonly _tag: 'InvalidPort'; readonly port: number }

interface Config {
  readonly port: number
}

declare const parseJson: (text: string) => E.Either<ConfigError, unknown>
declare const getPort: (json: unknown) => E.Either<ConfigError, number>
declare const validatePort: (port: number) => E.Either<ConfigError, Config>

// pogled unapred: `chain` detaljno učimo u Celini 5
const loadConfig = (text: string): E.Either<ConfigError, Config> =>
  pipe(parseJson(text), E.chain(getPort), E.chain(validatePort))
```

Zašto `chain` radi i koji zakoni ga čine pouzdanim, tema su Celina 4 (funktori, `map`) i Celina 5 (monade, `chain`). Za sada je važna ideja: kada su greške **vrednosti**, i način na koji se koraci nadovezuju može da bude obična funkcija — a ne skriveni skok kroz `try/catch`.

## Formalna definicija

Funkcija koja za neke ulaze baca izuzetak je **parcijalna**. Funkcionalno modelovanje neuspeha je primena konstrukcije iz Celine 1 — **proširivanja kodomena**:

```text
f: X ⟶ Y              (parcijalna, baca izuzetak)
f': X ⟶ Option(Y)     (totalna, bez razloga neuspeha)
f'': X ⟶ Either(E, Y) (totalna, sa razlogom neuspeha iz skupa E)
```

Tako dobijena funkcija je totalna i, ako je i čista, njeni pozivi su referencijalno transparentni izrazi.

## Primer sa fp-ts

Pregled prelaza između „sveta izuzetaka i `null`-a“ i „sveta vrednosti“:

| Od                                 | Ka                | Funkcija                                  |
| ---------------------------------- | ----------------- | ----------------------------------------- |
| vrednost koja može biti `null`/`undefined` | `Option`  | `O.fromNullable`                          |
| vrednost koja može biti `null`/`undefined` | `Either`  | `E.fromNullable(e)`                       |
| poziv koji baca izuzetak           | `Either`          | `E.tryCatch(f, onThrow)`                  |
| `Option`                           | `Either`          | `E.fromOption(() => e)`                   |
| `Either`                           | `Option`          | `O.fromEither` (odbacuje grešku)          |
| `Option` / `Either`                | obična vrednost   | `match`, `getOrElse`                      |
| `Option`                           | `undefined`       | `O.toUndefined`                           |

```ts
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'

const env: Readonly<Record<string, string | undefined>> = { PORT: '8080' }

const port = pipe(
  O.fromNullable(env['PORT']), // granica: možda ne postoji
  E.fromOption(() => 'PORT nije podešen'), // dodajemo razlog
  E.map(Number), // pogled unapred: map iz Celine 4
  E.getOrElse(() => 3000) // izlaz: podrazumevana vrednost
)

console.log(port) // => 8080
```

Biblioteka Effect ide korak dalje: tip `Effect<A, E, R>` opisuje program koji može da uspe sa vrednošću `A`, da ne uspe sa **očekivanom** greškom tipa `E`, i kome je potrebno okruženje `R`. Effect pritom pravi istu razliku kao ova lekcija: očekivane greške su u tipu (`E`), a neočekivane („defekti“) nisu.

## Najčešće greške

- **Prazan `catch`.** `catch (e) {}` pretvara grešku u tišinu; program nastavlja u nepoznatom stanju.
- **Izuzeci za kontrolu toka.** Bacanje izuzetka da bi se „izašlo“ iz validacije čini tok programa nevidljivim u tipovima.
- **Generičke greške.** `Either<Error, A>` ili `Either<string, A>` ne kažu koje greške su moguće; za očekivane greške koristite tip sume.
- **Mešanje stilova.** Funkcija koja vraća `Either`, a ponekad i baca izuzetak, gora je od obe varijante pojedinačno.
- **Obrada defekata kao očekivanih grešaka.** Ne treba svaka funkcija da vraća `Either` za „nemoguće“ slučajeve; bolje je modelovati tip tako da takvi slučajevi ne postoje.

## Vežba

1. Za svaki scenario izaberite `Option`, `Either` ili izuzetak, i obrazložite:
   - pronalaženje proizvoda po šifri u katalogu
   - validacija formulara za registraciju (email, lozinka, godine)
   - deljenje u kalkulatoru koji koristi korisnik (deljenje nulom je moguće)
   - pristup elementu niza po indeksu za koji je program upravo proverio da postoji
   - čitanje obaveznog konfiguracionog fajla pri pokretanju aplikacije
2. Prepišite funkciju `loadConfig` iz odeljka [Problem: više koraka](#problem-više-koraka-koji-mogu-da-ne-uspeju) tako da proverava i polje `host` (obavezan neprazan string). Proširite `ConfigError` i dodajte funkciju koja grešku pretvara u poruku za korisnika, sa proverom iscrpnosti. Koristite samo `match` (bez `chain`).

<details>
<summary>Rešenje</summary>

1.
   - **Proizvod po šifri** — `Option`: proizvod ili postoji ili ne; razlog je očigledan.
   - **Validacija formulara** — `Either` sa tipom sume grešaka: korisnik mora da zna šta da ispravi.
   - **Deljenje u kalkulatoru** — `Either` (ili `Option`): deljenje nulom je očekivan ulaz korisnika, ne greška u programu.
   - **Indeks koji je upravo proveren** — ako ste ga proverili, `Option` je suvišan; ako se to ipak desi, u pitanju je greška u programu (izuzetak). Još bolje: restrukturirajte kod tako da provera i pristup budu jedno (npr. `RA.lookup` vraća `Option`).
   - **Obavezna konfiguracija pri pokretanju** — na granici je pročitajte u `Either`; ako nedostaje, aplikacija ne može da radi, pa je opravdano prekinuti pokretanje jasnom porukom. Bitno je da odluka bude doneta na jednom mestu, na granici.

2.

```ts
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

type ConfigError =
  | { readonly _tag: 'InvalidJson' }
  | { readonly _tag: 'MissingPort' }
  | { readonly _tag: 'InvalidPort'; readonly port: number }
  | { readonly _tag: 'MissingHost' }

interface Config {
  readonly host: string
  readonly port: number
}

const parseJson = (text: string): E.Either<ConfigError, unknown> =>
  E.tryCatch(
    () => JSON.parse(text),
    (): ConfigError => ({ _tag: 'InvalidJson' })
  )

const field = (json: unknown, key: string): unknown =>
  (json as Record<string, unknown> | null)?.[key]

const getHost = (json: unknown): E.Either<ConfigError, string> => {
  const host = field(json, 'host')
  return typeof host === 'string' && host.trim() !== ''
    ? E.right(host)
    : E.left({ _tag: 'MissingHost' })
}

const getPort = (json: unknown): E.Either<ConfigError, number> => {
  const port = field(json, 'port')
  if (typeof port !== 'number') return E.left({ _tag: 'MissingPort' })
  return Number.isInteger(port) && port > 0 && port < 65536
    ? E.right(port)
    : E.left({ _tag: 'InvalidPort', port })
}

const loadConfig = (text: string): E.Either<ConfigError, Config> =>
  pipe(
    parseJson(text),
    E.match(
      (e) => E.left(e),
      (json) =>
        pipe(
          getHost(json),
          E.match(
            (e) => E.left(e),
            (host) =>
              pipe(
                getPort(json),
                E.match(
                  (e) => E.left(e),
                  (port) => E.right({ host, port })
                )
              )
          )
        )
    )
  )

const message = (error: ConfigError): string => {
  switch (error._tag) {
    case 'InvalidJson':
      return 'Konfiguracija nije ispravan JSON.'
    case 'MissingHost':
      return 'Nedostaje polje "host".'
    case 'MissingPort':
      return 'Nedostaje polje "port".'
    case 'InvalidPort':
      return `Port ${error.port} nije ispravan.`
  }
}

const report = (text: string): string =>
  pipe(
    loadConfig(text),
    E.match(message, (c) => `${c.host}:${c.port}`)
  )

console.log(report('{"host": "localhost", "port": 8080}')) // => localhost:8080
console.log(report('{"port": 8080}')) // => Nedostaje polje "host".
console.log(report('{"host": "localhost", "port": 0}')) // => Port 0 nije ispravan.
```

Primetite koliko je piramida već sa tri koraka teška za čitanje — i koliko bi kraća bila sa `chain`. To je motivacija za naredne celine.

</details>

## Sažetak

- **Očekivane greške** (deo domena) treba da budu **vrednosti vidljive u tipu**: `Option` kada razlog nije važan, `Either` sa tipom sume grešaka kada jeste.
- **Neočekivane greške** (defekti) ostaju izuzeci i obrađuju se centralno, na granici.
- Na **granicama** sistema izuzetke i `null` pretvaramo u vrednosti; **jezgro** čine čiste i totalne funkcije.
- Najbolja obrada greške je tip u kome nemoguće stanje ne može da se predstavi.
- Nadovezivanje koraka pomoću `match` radi, ali stvara „piramidu“; `map` i `chain` (Celine 4 i 5) rešavaju upravo taj problem.

## Izvori

- Originalni prevod: uvodna rečenica i primer `head` iz poglavlja [Funkcionalno rukovanje greškama](../original/09-funkcionalno-rukovanje-greskama.md); maksima i kviz o `Promise`-u iz poglavlja [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md#kada-treba-da-koristim-tip-sume).
- Novo u ovoj verziji: podela na očekivane greške i defekte, tabela za izbor alata, granice sistema sa primerom konfiguracije, „piramida“ `match`-eva i pogled unapred na `chain`, formalni sažetak, tabela prelaza u `fp-ts`-u, napomena o Effect-u, najčešće greške i vežba.

## Sledeća lekcija

Ovim se završava Celina 2. Sledeća je [Celina 3 — Algebra i matematički zakoni](../03-algebre/index.md), u kojoj upoznajemo strukture za kombinovanje i poređenje vrednosti (`Semigroup`, `Monoid`, `Eq`, `Ord`) — i tamo se vraćamo na `Option` da bismo za njega definisali jednakost i kombinovanje. Celina je u pripremi; do tada je gradivo dostupno u originalnom prevodu, počev od poglavlja [Modelovanje kompozicije pomoću polugrupa](../original/03-polugrupe.md).
