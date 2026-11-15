# Dva stuba funkcionalnog programiranja

> [!NOTE]
> Poglavlje 2 originalnog prevoda. Tekst je neizmenjen — prilagođene su samo putanje do slika i koda i interne veze između poglavlja. [Sadržaj originalnog prevoda](index.md)
>
> Ovo poglavlje je prerađeno u novoj strukturi kursa: [Referencijalna transparentnost](../01-osnove/04-referencijalna-transparentnost.md), [Kompozicija funkcija](../01-osnove/06-kompozicija-funkcija.md).


Funkcionalno programiranje počiva na sledeća dva stuba:

- referencijalna transparentnost
- kompozicija kao univerzalni design pattern

Sve što ćemo kasnije videti u kursu proizilazi, direktno ili indirektno, iz ova dva stuba.

Počnimo od referencijalne transparentnosti.

## Referencijalna transparentnost

> **Definition**. An **expression** is said to be _referentially transparent_ if it can be replaced with its corresponding value without changing the program's behavior

**Primer** (referencijalna transparentnost podrazumeva korišćenje čistih funkcija)

```ts
const double = (n: number): number => n * 2

const x = double(2)
const y = double(2)
```

Izraz `double(2)` ima svojstvo referencijalne transparentnosti jer mogu da ga zamenim njegovom vrednošću `4`.

Stoga mogu bez brige da izvršim sledeće refaktorisanje

```ts
const x = 4
const y = x
```

Nemaju svi izrazi svojstvo referencijalne transparentnosti, pogledajmo nekoliko primera

**Primer** (referencijalna transparentnost podrazumeva da se ne bacaju izuzeci)

```ts
const inverse = (n: number): number => {
  if (n === 0) throw new Error('cannot divide by zero')
  return 1 / n
}

const x = inverse(0) + 1
```

Ne mogu da zamenim izraz `inverse(0)` njegovom vrednošću, pa stoga ovaj izraz nema svojstvo referencijalne transparentnosti.

**Primer** (referencijalna transparentnost može da podrazumeva korišćenje nepromenljivih struktura podataka)

```ts
const xs = [1, 2, 3]

const append = (xs: Array<number>): void => {
  xs.push(4)
}

append(xs)

const ys = xs
```

U poslednjem redu ne mogu da zamenim izraz `xs` njegovom početnom vrednošću `[1, 2, 3]` jer je njegovu trenutnu vrednost promenio poziv funkcije `append`.

Zašto je referencijalna transparentnost toliko važna? Zato što omogućava da:

- **rezonujemo lokalno** o kodu (odnosno, za razumevanje dela koda nije mi potrebno poznavanje šireg konteksta)
- **refaktorišemo** bez promene ponašanja programa (po samoj definiciji referencijalne transparentnosti)

**Kviz**. Pretpostavimo da imamo sledeći program:

```ts
// U TypeScript-u `declare` omogućava uvođenje definicije bez navođenja njene implementacije.
declare const question: (message: string) => Promise<string>

const x = await question('What is your name?')
const y = await question('What is your name?')
```

Mogu li da ga refaktorišem na ovaj način? Da li je ponašanje programa isto ili se promenilo?

```ts
const x = await question('What is your name?')
const y = x
```

Kao što vidite, refaktorisanju programa koji sadrži izraze bez svojstva referencijalne transparentnosti treba pristupiti s velikim oprezom. U funkcionalnom programiranju, gde svaki izraz ima svojstvo referencijalne transparentnosti, kognitivno opterećenje pri refaktorisanju je manje.

Pređimo sada na drugi stub, kompoziciju.

## Kompozicija

Osnovni obrazac funkcionalnog programiranja je _kompozabilnost_, odnosno građenje malih jedinica
koje rade nešto specifično i koje se mogu međusobno kombinovati kako bi se dobile veće i složenije celine.

Kao primere, idući "od manjeg ka većem", možemo da zamislimo:

- kompoziciju dve jednostavne vrednosti (kao što su dva broja ili dva stringa)
- ili kompoziciju funkcija
- ili čak kompoziciju čitavih programa

U ovom poslednjem slučaju možemo da govorimo o "modularnom programiranju":

> By modular programming I mean the process of building large programs by gluing together smaller programs - Simon Peyton Jones

Pogledajmo u praksi kako je moguće približiti se ovom stilu programiranja korišćenjem onoga što se naziva kombinatorima.

Termin **kombinator** odnosi se na [combinator pattern](https://wiki.haskell.org/Combinator):

> A style of organizing libraries centered around the idea of combining things. Usually there is some type `T`, some "primitive" values of type `T`, and some "combinators" which can combine values of type `T` in various ways to build up more complex values of type `T`

Pojam kombinatora je prilično neodređen i može da se javi u različitim oblicima, ali njegov najjednostavniji oblik je sledeći:

```ts
combinator: Thing -> Thing
```

**Primer**. Funkciju `double` možemo da posmatramo kao kombinator brojeva.

Svrha kombinatora je da pravi nove "stvari" od prethodno definisanih "stvari".

Primetite da se rezultat kombinatora ponovo može proslediti kao ulaz, pa se tako dobija kombinatorna eksplozija mogućnosti, što ovaj obrazac čini veoma moćnim.

**Primer**

```ts
import { pipe } from 'fp-ts/function'

const double = (n: number): number => n * 2

console.log(pipe(2, double, double, double)) // => 16
```

Stoga je opšti dizajn koji često možete da sretnete u funkcionalnom modulu sledeći:

- model za `T`
- skup jednostavnih "primitiva" tipa `T`
- skup kombinatora za kombinovanje primitiva u složenije strukture

Pokušajmo da implementiramo jedan takav modul:

**Demo**

[`01_retry.ts`](../../src/01_retry.ts)

Kao što vidite iz prethodnog demoa, sa samo tri primitive i dva kombinatora uspeli smo da izrazimo prilično složenu politiku (policy).

Zamislite kako, dodavanjem makar samo jedne nove primitive (ili novog kombinatora) onima koji su već definisani, izražajne mogućnosti rastu eksponencijalno.

Od dva kombinatora definisana u `01_retry.ts` posebno treba pomenuti `concat`, jer ga je moguće povezati sa jednom važnom apstrakcijom funkcionalnog programiranja: polugrupama.

---

[← Prethodno poglavlje](01-sta-je-funkcionalno-programiranje.md) · [Sadržaj](index.md) · [Sledeće poglavlje →](03-polugrupe.md)
