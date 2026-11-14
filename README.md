> Ovo je prevod kursa na srpski jezik (latinica). Original na italijanskom: https://github.com/gcanti/functional-programming (autor: Giulio Canti).

**Note**.

- There is an adaptation written in english: https://github.com/enricopolanski/functional-programming
- 한글 번역본이 있습니다: https://github.com/alstn2468/functional-programming

---

Setup

```sh
git clone https://github.com/gcanti/functional-programming.git
cd functional-programming
npm i
```

# Šta je funkcionalno programiranje

> Functional Programming is programming with pure functions. Mathematical functions.

Brza pretraga na internetu može vas dovesti do sledeće definicije:

> (Čista) funkcija je procedura koja za isti ulaz uvek vraća isti izlaz i nema nikakav uočljiv sporedni efekat (side effect).

Termin "sporedni efekat" još uvek nema precizno značenje (kasnije ćemo videti kako da mu damo formalnu definiciju); za sada je važno da o njemu imamo neku intuiciju, zamislite na primer otvaranje fajla da biste pročitali njegov sadržaj, ili upis u bazu podataka.

Za sada možemo da se ograničimo na to da kažemo da je sporedni efekat bilo šta što procedura radi pored toga što vraća vrednost.

Ali kako je strukturiran program koji koristi samo čiste funkcije?

Program u funkcionalnom stilu obično se piše kao **pipeline** (cevovod):

```ts
const program = pipe(
  input,
  f1, // čista funkcija
  f2, // čista funkcija
  f3, // čista funkcija
  ...
)
```

Ono što se dešava jeste da se `input` prosleđuje kao ulaz prvoj funkciji `f1`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz drugoj funkciji `f2`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz trećoj funkciji `f3`, i tako dalje.

**Demo**

[`00_pipe_and_flow.ts`](src/00_pipe_and_flow.ts)

Videćemo kako nam funkcionalno programiranje pruža sredstva da svoj kod strukturiramo u ovom stilu.

Pored toga što treba razumeti šta je funkcionalno programiranje, podjednako je važno razumeti koja je njegova svrha.

Cilj funkcionalnog programiranja je **ovladavanje složenošću sistema** korišćenjem formalnih modela, uz posebnu pažnju posvećenu **svojstvima koda** i lakoći refaktorisanja.

> Functional programming will help teach people the mathematics behind program construction:
>
> - how to write composable code
> - how to reason about side effects
> - how to write consistent, general, less ad-hoc APIs

Šta znači posvetiti pažnju svojstvima koda? Pogledajmo jedan primer

**Primer**

Zašto možemo da kažemo da je funkcija `map` za `Array` "funkcionalnija" od `for` petlje?

```ts
// ulaz
const xs: Array<number> = [1, 2, 3]

// transformacija
const double = (n: number): number => n * 2

// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  ys.push(double(xs[i]))
}
```

`for` petlja je veoma fleksibilna, mogu da izmenim:

- početni indeks
- uslov završetka
- korak

Ali to takođe znači da postoji više mogućnosti da se unesu **greške** i da nemam nikakvu **garanciju za rezultat**.

**Kviz**. Da li ste proverili da li je moja petlja dobro napisana?

Pogledajmo sada kako se koristi `map`

```ts
// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys = xs.map(double)
```

Primetite da je `map` manje fleksibilna, ali zato pruža više garancija:

- svi elementi ulaza biće obrađeni, od prvog do poslednjeg
- kakva god da je operacija koja se izvršava u callback-u, rezultat će uvek biti niz sa istim brojem elemenata
  kao ulazni niz

Sa funkcionalne tačke gledišta, gde su važnija svojstva koda nego detalji implementacije, operacija `map` je zanimljiva **upravo zato što je ograničena**.

Zamislite, na primer, koliko je lakši pregled (review) PR-a koji sadrži `map` nego onog koji sadrži `for` petlju.

# Dva stuba funkcionalnog programiranja

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

[`01_retry.ts`](src/01_retry.ts)

Kao što vidite iz prethodnog demoa, sa samo tri primitive i dva kombinatora uspeli smo da izrazimo prilično složenu politiku (policy).

Zamislite kako, dodavanjem makar samo jedne nove primitive (ili novog kombinatora) onima koji su već definisani, izražajne mogućnosti rastu eksponencijalno.

Od dva kombinatora definisana u `01_retry.ts` posebno treba pomenuti `concat`, jer ga je moguće povezati sa jednom važnom apstrakcijom funkcionalnog programiranja: polugrupama.

# Modelovanje kompozicije pomoću polugrupa

Polugrupa (semigroup) je recept za kombinovanje dve (ili više) vrednosti.

Tehnički, polugrupa je algebra; uopšteno, pod terminom "algebra" podrazumeva se određena kombinacija:

- jednog ili više skupova
- jedne ili više operacija nad tim skupovima
- nula ili više zakona kojima te operacije moraju da se povinuju

Algebre su način na koji matematičari obuhvataju neki pojam na najdirektniji mogući način, uklanjajući sve što je suvišno.

> Kada se radi sa algebrom, dozvoljene su samo operacije koje definiše sama algebra i to u skladu sa njenim zakonima

Ekvivalent algebri u programiranju su **interfejsi**:

> Kada se radi sa interfejsom, dozvoljene su samo operacije koje definiše sam interfejs i to u skladu sa njegovim zakonima.

Pre nego što se pozabavimo polugrupama, pogledajmo prvi jednostavan primer algebre koja im prethodi: magmu.

## Definicija magme

Možemo da koristimo TypeScript `interface` za modelovanje magme:

```ts
interface Magma<A> {
  readonly concat: (first: A, second: A) => A
}
```

Dakle, imamo operaciju `concat` koja uzima dve vrednosti nekog tipa `A` i vraća novu vrednost istog tipa (svojstvo zatvorenosti). Pošto i sam rezultat može da se koristi kao ulaz, operacija može da se ponavlja po želji. Drugim rečima, `concat` je [kombinator](#kompozicija) za tip `A`.

**Kviz**. To što je neka operacija zatvorena nije trivijalno svojstvo; možete li da navedete primer operacije nad prirodnim brojevima (odnosno pozitivnim celim brojevima) za koju svojstvo zatvorenosti ne važi?

Da bismo imali konkretnu instancu magme za određeni tip, potrebno je, dakle, definisati objekat koji odgovara ovom interfejsu.

**Primer** (instanca `Magma` za tip `number`)

```ts
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}

console.log(
  MagmaSub.concat(
    MagmaSub.concat(MagmaSub.concat(MagmaSub.concat(10, 2), 3), 1),
    2
  )
)
// => 2

// helper
const getPipeableConcat = <A>(M: Magma<A>) => (second: A) => (first: A): A =>
  M.concat(first, second)

const concat = getPipeableConcat(MagmaSub)

// primer upotrebe

import { pipe } from 'fp-ts/function'

pipe(10, concat(2), concat(3), concat(1), concat(2), console.log)
// => 2
```

Primetite da je definicija `concat` osmišljena tako da olakša njegovu upotrebu sa `pipe`.

**Kviz**. Posmatrajmo sledeću funkciju koja pretvara listu u rečnik; zašto se kao parametar zahteva `Magma`?

```ts
import { pipe } from 'fp-ts/function'
import { Magma } from 'fp-ts/Magma'

declare const fromReadonlyArray: <A>(
  M: Magma<A>
) => (as: ReadonlyArray<readonly [string, A]>) => Record<string, A>

// primer upotrebe

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}

pipe(
  [
    ['a', 1],
    ['b', 2]
  ],
  fromReadonlyArray(MagmaSub),
  console.log
) // => { a: 1, b: 2 }
pipe(
  [
    ['a', 1],
    ['b', 2],
    ['a', 3]
  ],
  fromReadonlyArray(MagmaSub),
  console.log
) // => { a: -2, b: 2 }
```

`Magma<A>` je veoma jednostavna algebra:

- skup (`A`)
- operacija (`concat`)
- nijedan zakon

pogledajmo sada algebru koja definiše jedan zakon: polugrupe.

## Definicija polugrupe

Ako je operacija `concat` neke `Magma` uz to i **asocijativna**, onda govorimo o polugrupi.

Za binarnu operaciju `*` kaže se da je "asocijativna" ako važi:

```ts
(x * y) * z = x * (y * z)
```

za svako `x`, `y`, `z`.

Asocijativnost nam govori da ne moramo da brinemo o zagradama u izrazima i da, ako želimo, možemo jednostavno da napišemo `x * y * z` (nema dvosmislenosti).

**Primer**

Spajanje (konkatenacija) stringova (`+`) ima svojstvo asocijativnosti.

```ts
("a" + "b") + "c" = "a" + ("b" + "c") = "abc"
```

Svaka polugrupa je magma, ali nije svaka magma polugrupa.

<center>
<img src="images/semigroup.png" width="300" alt="Magma vs Semigroup" />
</center>

**Primer**

Magma `MagmaSub` koju smo videli u prethodnom odeljku nije polugrupa jer njena operacija `concat` nije asocijativna:

```ts
import { pipe } from 'fp-ts/function'
import { Magma } from 'fp-ts/Magma'

const MagmaSub: Magma<number> = {
  concat: (first, second) => first - second
}

pipe(MagmaSub.concat(MagmaSub.concat(1, 2), 3), console.log) // => -4
pipe(MagmaSub.concat(1, MagmaSub.concat(2, 3)), console.log) // => 2
```

Polugrupe obuhvataju suštinu operacija koje mogu da se paralelizuju.

Zaista, ako znamo da neka operacija `*` ima svojstvo asocijativnosti, možemo da podelimo izračunavanje na dva podizračunavanja, od kojih svako može dalje da se deli

```ts
a * b * c * d * e * f * g * h = ((a * b) * (c * d)) * ((e * f) * (g * h))
```

Podizračunavanja mogu da se raspodele i izvrše paralelno, a zatim se prikupe njihovi delimični rezultati i od njih sastavi konačan rezultat.

Kao što je već bio slučaj sa `Magma`, polugrupe mogu da se modeluju pomoću TypeScript `interface`:

```ts
interface Semigroup<A> {
  readonly concat: (first: A, second: A) => A
}
```

Kao što vidite, definicija je identična onoj za `Magma`, ali postoji važna razlika: mora da važi sledeći zakon (koji, nažalost, ne može da se kodira u sistemu tipova TypeScript-a):

**Associativity**. Ako je `S` polugrupa, mora da važi:

```ts
S.concat(S.concat(x, y), z) = S.concat(x, S.concat(y, z))
```

za svako `x`, `y`, `z` iz `A`

**Primer**

Implementirajmo polugrupu za `ReadonlyArray<string>`

```ts
import * as Se from 'fp-ts/Semigroup'

const Semigroup: Se.Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second)
}
```

Kao što vidite, naziv `concat` ima naročito smisla za `ReadonlyArray`, ali, u zavisnosti od konteksta i tipa `A` za koji implementiramo instancu, operacija polugrupe `concat` može da se tumači na različite načine:

- "nadovezivati"
- "kombinovati"
- "merging"
- "stapati"
- "birati"
- "sabirati"
- "zamenjivati"

i još mnogo toga.

**Primer**

Evo kako se implementira polugrupa `(number, +)` gde je `+` uobičajeno sabiranje brojeva:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** number `Semigroup` under addition */
const SemigroupSum: Semigroup<number> = {
  concat: (first, second) => first + second
}
```

**Kviz**. Da li kombinator `concat` definisan u demou [`01_retry.ts`](src/01_retry.ts) može da se iskoristi za definisanje instance `Semigroup` za tip `RetryPolicy`?

Primetite da se, kada je tip fiksiran, može definisati **više instanci** interfejsa `Semigroup`.

Na primer, ako ponovo posmatramo tip `number`, možemo da definišemo polugrupu `(number, *)` gde je `*` uobičajeno množenje brojeva:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** number `Semigroup` under multiplication */
const SemigroupProduct: Semigroup<number> = {
  concat: (first, second) => first * second
}
```

Još jedan primer, ovog puta sa stringovima:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupString: Semigroup<string> = {
  concat: (first, second) => first + second
}
```

I još dva primera, sa `boolean`:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupAll: Semigroup<boolean> = {
  concat: (first, second) => first && second
}

const SemigroupAny: Semigroup<boolean> = {
  concat: (first, second) => first || second
}
```

## Funkcija `concatAll`

Po definiciji, `concat` kombinuje samo dva elementa iz `A` odjednom; da li je moguće kombinovati više elemenata?

Funkcija `concatAll` kao ulaz prima instancu polugrupe, početnu vrednost i niz elemenata koje treba kombinovati:

```ts
import * as S from 'fp-ts/Semigroup'
import * as N from 'fp-ts/number'

const sum = S.concatAll(N.SemigroupSum)(2)

console.log(sum([1, 2, 3, 4])) // => 12

const product = S.concatAll(N.SemigroupProduct)(3)

console.log(product([1, 2, 3, 4])) // => 72
```

**Kviz**. Zašto mi je potrebna početna vrednost?

**Primer**

Kao dodatne primere primene `concatAll`, možemo ponovo da implementiramo neke popularne funkcije iz standardne biblioteke JavaScript-a:

```ts
import * as B from 'fp-ts/boolean'
import { concatAll } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/struct'

const every = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => concatAll(B.SemigroupAll)(true)(as.map(predicate))

const some = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): boolean => concatAll(B.SemigroupAny)(false)(as.map(predicate))

const assign: (as: ReadonlyArray<object>) => object = concatAll(
  S.getAssignSemigroup<object>()
)({})
```

**Kviz**. Da li je sledeća instanca "legalna" (odnosno, da li poštuje zakone polugrupa)?

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** Always return the first argument */
const first = <A>(): Semigroup<A> => ({
  concat: (first, _second) => first
})
```

**Kviz**. Da li je sledeća instanca legalna?

```ts
import { Semigroup } from 'fp-ts/Semigroup'

/** Always return the second argument */
const last = <A>(): Semigroup<A> => ({
  concat: (_first, second) => second
})
```

## Dualna polugrupa

Kada je data instanca polugrupe, moguće je dobiti drugu instancu jednostavnom zamenom redosleda u kom se elementi kombinuju:

```ts
import { pipe } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

// ovo je kombinator polugrupa...
const reverse = <A>(S: Semigroup<A>): Semigroup<A> => ({
  concat: (first, second) => S.concat(second, first)
})

pipe(S.Semigroup.concat('a', 'b'), console.log) // => 'ab'
pipe(reverse(S.Semigroup).concat('a', 'b'), console.log) // => 'ba'
```

**Kviz**. Ovaj kombinator ima smisla zato što operacija `concat` u opštem slučaju nije **komutativna**, odnosno ne važi nužno uvek `concat(x, y) = concat(y, x)`; možete li da navedete primer u kom `concat` nije komutativna? A primer u kom jeste?

## Polugrupa proizvoda

Pokušajmo da definišemo instance polugrupe za složenije tipove:

```ts
import * as N from 'fp-ts/number'
import { Semigroup } from 'fp-ts/Semigroup'

// modeluje vektor koji polazi iz koordinatnog početka
type Vector = {
  readonly x: number
  readonly y: number
}

// modeluje zbir dva vektora
const SemigroupVector: Semigroup<Vector> = {
  concat: (first, second) => ({
    x: N.SemigroupSum.concat(first.x, second.x),
    y: N.SemigroupSum.concat(first.y, second.y)
  })
}
```

**Primer**

```ts
const v1: Vector = { x: 1, y: 1 }
const v2: Vector = { x: 1, y: 2 }

console.log(SemigroupVector.concat(v1, v2)) // => { x: 2, y: 3 }
```

<center>
<img src="images/semigroupVector.png" width="300" alt="SemigroupVector" />
</center>

Previše boilerplate-a? Dobra vest je da nam **matematička teorija** koja stoji iza pojma polugrupe kaže da možemo da konstruišemo instancu polugrupe za struct kao što je `Vector` ako smo u stanju da obezbedimo instancu polugrupe za svako njegovo polje.

Zgodno je to što modul `fp-ts/Semigroup` izvozi kombinator `struct`:

```ts
import { struct } from 'fp-ts/Semigroup'

// modeluje zbir dva vektora
const SemigroupVector: Semigroup<Vector> = struct({
  x: N.SemigroupSum,
  y: N.SemigroupSum
})
```

**Napomena**. Postoji kombinator sličan kombinatoru `struct`, ali koji radi sa torkama: `tuple`

```ts
import * as N from 'fp-ts/number'
import { Semigroup, tuple } from 'fp-ts/Semigroup'

// modeluje vektor koji polazi iz koordinatnog početka
type Vector = readonly [number, number]

// modeluje zbir dva vektora
const SemigroupVector: Semigroup<Vector> = tuple(N.SemigroupSum, N.SemigroupSum)

const v1: Vector = [1, 1]
const v2: Vector = [1, 2]

console.log(SemigroupVector.concat(v1, v2)) // => [2, 3]
```

**Kviz**. Da li je tačno da, ako imam polugrupu za `A` i izaberem bilo koji element `middle` iz `A`, pa ga umetnem između dva parametra funkcije `concat`, ponovo dobijam polugrupu?

```ts
import { pipe } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

export const intercalate = <A>(middle: A) => (
  S: Semigroup<A>
): Semigroup<A> => ({
  concat: (first, second) => S.concat(S.concat(first, middle), second)
})

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'))

pipe(
  SemigroupIntercalate.concat('a', SemigroupIntercalate.concat('b', 'c')),
  console.log
) // => 'a|b|c'
```

## Ne mogu da pronađem instancu!

Asocijativnost je veoma jako svojstvo; šta se dešava ako, za neki određeni tip `A`, ne uspemo da pronađemo asocijativnu operaciju nad `A`?

Pretpostavimo da imamo tip `User` definisan ovako:

```ts
type User = {
  readonly id: number
  readonly name: string
}
```

i da se u mojoj bazi podataka nalazi mnogo kopija istog `User` (na primer, to bi mogla da bude istorija njegovih izmena)

```ts
// interni API-ji
declare const getCurrent: (id: number) => User
declare const getHistory: (id: number) => ReadonlyArray<User>
```

i da treba da osmislim javni API

```ts
export declare const getUser: (id: number) => User
```

koji uzima u obzir sve kopije na osnovu nekog kriterijuma; na primer, kriterijum bi mogao da bude da se vrati najnovija kopija, ili najstarija, ili uvek trenutna kopija, itd...

Naravno, možemo da definišemo posebne API-je za svaki kriterijum, dakle:

```ts
export declare const getMostRecentUser: (id: number) => User
export declare const getLeastRecentUser: (id: number) => User
export declare const getCurrentUser: (id: number) => User
// itd...
```

Ovde ću, međutim, o ovom problemu dizajna govoriti sa što opštije tačke gledišta.

Dakle, da bi se vratila vrednost tipa `User`, moram da uzmem u obzir sve kopije i da napravim njihov "merge" (ili "izbor").

Drugim rečima, kriterijum možemo da modelujemo polugrupom!

Međutim, nije očigledno šta znači "napraviti merge dva korisnika", niti kako ta operacija merge-a može da bude asocijativna.

**Uvek** možete da definišete instancu polugrupe za **bilo koji** tip tako što ćete konstruisati instancu polugrupe ne za `A`, već za `ReadonlyNonEmptyArray<A>` (neprazan niz elemenata tipa `A`), koja se naziva **slobodna polugrupa** nad `A`.

```ts
import { Semigroup } from 'fp-ts/Semigroup'

// modeluje neprazan niz, odnosno niz sa bar jednim elementom
type ReadonlyNonEmptyArray<A> = ReadonlyArray<A> & {
  readonly 0: A
}

// nadovezivanje dva neprazna niza je ponovo neprazan niz
const getSemigroup = <A>(): Semigroup<ReadonlyNonEmptyArray<A>> => ({
  concat: (first, second) => [first[0], ...first.slice(1), ...second]
})
```

a zatim preslikati elemente iz `A` u "singltone" tipa `ReadonlyNonEmptyArray<A>`, odnosno u nizove sa samo jednim elementom:

```ts
// ubacuje vrednost u neprazan niz
const of = <A>(a: A): ReadonlyNonEmptyArray<A> => [a]
```

Primenimo ovu tehniku na tip `User`:

```ts
import {
  getSemigroup,
  of,
  ReadonlyNonEmptyArray
} from 'fp-ts/ReadonlyNonEmptyArray'
import { Semigroup } from 'fp-ts/Semigroup'

type User = {
  readonly id: number
  readonly name: string
}

// ovo je polugrupa ne za `User`, već za `ReadonlyNonEmptyArray<User>`
const S: Semigroup<ReadonlyNonEmptyArray<User>> = getSemigroup<User>()

declare const user1: User
declare const user2: User
declare const user3: User

// const merge: ReadonlyNonEmptyArray<User>
const merge = S.concat(S.concat(of(user1), of(user2)), of(user3))

// isti rezultat dobijam "ručnim pakovanjem" korisnika
const merge2: ReadonlyNonEmptyArray<User> = [user1, user2, user3]
```

Slobodna polugrupa nad `A`, dakle, nije ništa drugo nego polugrupa čiji su elementi svi mogući konačni i neprazni nizovi elemenata iz `A`.

Slobodna polugrupa nad `A` može da se posmatra kao _lenj_ (lazy) način nadovezivanja elemenata iz `A`, kojim se čuva celokupan informacioni sadržaj.

Zaista, vrednost `merge`, koja sadrži `[user1, user2, user3]`, i dalje mi govori koje elemente treba nadovezati i kojim redosledom.

Sada imam tri moguće opcije prilikom dizajniranja API-ja `getUser`:

1. u stanju sam da definišem `Semigroup<User>` i želim odmah da izvršim merging

```ts
declare const SemigroupUser: Semigroup<User>

export const getUser = (id: number): User => {
  const current = getCurrent(id)
  const history = getHistory(id)
  // odmah vršim merging
  return concatAll(SemigroupUser)(current)(history)
}
```

2. nisam u stanju da definišem `Semigroup<User>` ili želim da strategiju merging-a ostavim podesivom, pa je tražim od onoga ko koristi moj API (consumer)

```ts
export const getUser = (SemigroupUser: Semigroup<User>) => (
  id: number
): User => {
  const current = getCurrent(id)
  const history = getHistory(id)
  // odmah vršim merging
  return concatAll(SemigroupUser)(current)(history)
}
```

3. nisam u stanju da definišem `Semigroup<User>` i ne želim da ga tražim od onoga ko koristi moj API

Ovo je slučaj u kom nam slobodna polugrupa nad `User` može pomoći.

```ts
export const getUser = (id: number): ReadonlyNonEmptyArray<User> => {
  const current = getCurrent(id)
  const history = getHistory(id)
  // odlučujem da NE izvršim merging i vraćam slobodnu polugrupu nad `User`
  return [current, ...history]
}
```

Osim toga, čak i ako imam na raspolaganju instancu polugrupe za `A`, ipak mogu da odlučim da koristim slobodnu polugrupu iz sledećih razloga:

- izbegava se izvršavanje možda nepotrebnih izračunavanja (pretpostavite da je merging skup)
- izbegava se prosleđivanje instance polugrupe unaokolo
- i dalje se omogućava onome ko koristi moje API-je da odredi strategiju merging-a (pomoću `concatAll`)

## Polugrupe izvedene iz uređenja

Pošto je `number` **totalno uređen** (odnosno, za bilo koja dva broja `x` i `y` važi jedan od sledećih uslova: `x <= y` ili `y <= x`), možemo da definišemo još dve njegove instance polugrupe koristeći `min` i `max` kao operacije:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupMin: Semigroup<number> = {
  concat: (first, second) => Math.min(first, second)
}

const SemigroupMax: Semigroup<number> = {
  concat: (first, second) => Math.max(first, second)
}
```

**Kviz**. Zašto je važno da `number` bude _totalno_ uređen?

Bilo bi korisno da ove dve polugrupe (`SemigroupMin` i `SemigroupMax`) možemo da definišemo i za druge tipove osim `number`.

Da li je moguće obuhvatiti pojam totalne uređenosti i za druge tipove? Da bismo to uradili, najpre moramo da obuhvatimo pojam _jednakosti_.

# Modelovanje jednakosti pomoću `Eq`

Još jednom možemo da modelujemo pojam jednakosti pomoću TypeScript interfejsa (`interface`):

```ts
interface Eq<A> {
  readonly equals: (first: A, second: A) => boolean
}
```

Intuitivno:

- ako je `equals(x, y)` jednako `true`, onda kažemo da su `x` i `y` jednaki
- ako je `equals(x, y)` jednako `false`, onda kažemo da su `x` i `y` različiti

**Primer**

Pokušajmo da definišemo instancu `Eq` za tip `number`:

```ts
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'

const EqNumber: Eq<number> = {
  equals: (first, second) => first === second
}

pipe(EqNumber.equals(1, 1), console.log) // => true
pipe(EqNumber.equals(1, 2), console.log) // => false
```

Moraju da važe sledeći zakoni:

1. **Reflexivity**: `equals(a, a) === true`, za svako `a` iz `A`
2. **Symmetry**: `equals(a, b) === equals(b, a)`, za svako `a`, `b` iz `A`
3. **Transitivity**: ako je `equals(a, b) === true` i `equals(b, c) === true`, onda je `equals(a, c) === true`, za svako `a`, `b`, `c` iz `A`

**Kviz**. Da li ima smisla kombinator `reverse: <A>(E: Eq<A>) => Eq<A>`?

**Kviz**. Da li ima smisla kombinator `not: <A>(E: Eq<A>) => Eq<A>`?

```ts
import { Eq } from 'fp-ts/Eq'

export const not = <A>(E: Eq<A>): Eq<A> => ({
  equals: (first, second) => !E.equals(first, second)
})
```

**Primer**

Kao prvi primer upotrebe apstrakcije `Eq`, definišimo funkciju `elem` koja pokazuje da li je data vrednost element nekog `ReadonlyArray`:

```ts
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'

// vraća `true` ako se element `a` nalazi u listi `as`
const elem = <A>(E: Eq<A>) => (a: A) => (as: ReadonlyArray<A>): boolean =>
  as.some((e) => E.equals(a, e))

pipe([1, 2, 3], elem(N.Eq)(2), console.log) // => true
pipe([1, 2, 3], elem(N.Eq)(4), console.log) // => false
```

Ali zašto ne bismo koristili nativnu metodu nizova `includes`?

```ts
console.log([1, 2, 3].includes(2)) // => true
console.log([1, 2, 3].includes(4)) // => false
```

Da bismo dobili odgovor, pokušajmo da definišemo instancu za složeniji tip:

```ts
import { Eq } from 'fp-ts/Eq'

type Point = {
  readonly x: number
  readonly y: number
}

const EqPoint: Eq<Point> = {
  equals: (first, second) => first.x === second.x && first.y === second.y
}

console.log(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: 2 })) // => true
console.log(EqPoint.equals({ x: 1, y: 2 }, { x: 1, y: -2 })) // => false
```

i da uporedo koristimo `elem` i `includes`

```ts
const points: ReadonlyArray<Point> = [
  { x: 0, y: 0 },
  { x: 1, y: 1 },
  { x: 2, y: 2 }
]

const search: Point = { x: 1, y: 1 }

console.log(points.includes(search)) // => false :(
console.log(pipe(points, elem(EqPoint)(search))) // => true :)
```

**Kviz** (JavaScript). Zašto pomoću `includes` dobijam `false`?

To što smo uhvatili koncept jednakosti od suštinskog je značaja, naročito u jeziku kao što je JavaScript, u kome neke strukture podataka imaju API-je koji su slabo upotrebljivi kada nam treba prilagođen (custom) koncept jednakosti. To je, na primer, slučaj i sa `Set`:

```ts
type Point = {
  readonly x: number
  readonly y: number
}

const points: Set<Point> = new Set([{ x: 0, y: 0 }])

points.add({ x: 0, y: 0 })

console.log(points)
// => Set { { x: 0, y: 0 }, { x: 0, y: 0 } }
```

Pošto `Set` koristi `===` ("strict equality") kao (fiksni) koncept jednakosti, `points` sada sadrži **dve identične kopije** od `{ x: 0, y: 0 }`, što svakako nije željeni rezultat. Zato se isplati definisati novi API za dodavanje elementa u `Set` koji koristi apstrakciju `Eq`.

**Kviz**. Kakav bi potpis mogao da ima ovaj novi API?

Da li je za definisanje `EqPoint` potrebno previše boilerplate koda? Dobra vest je da nam teorija kaže da možemo da konstruišemo instancu `Eq` za struct kao što je `Point` ako možemo da obezbedimo instancu `Eq` za svako njegovo polje.

Zgodno je to što modul `fp-ts/Eq` izvozi kombinator `struct`:

```ts
import { Eq, struct } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

type Point = {
  readonly x: number
  readonly y: number
}

const EqPoint: Eq<Point> = struct({
  x: N.Eq,
  y: N.Eq
})
```

**Napomena**. Postoji kombinator sličan kombinatoru `struct` koji radi sa torkama: `tuple`

```ts
import { Eq, tuple } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'

type Point = readonly [number, number]

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq)

console.log(EqPoint.equals([1, 2], [1, 2])) // => true
console.log(EqPoint.equals([1, 2], [1, -2])) // => false
```

Biblioteka `fp-ts` stavlja na raspolaganje i druge kombinatore; evo kombinatora koji omogućava da se izvede instanca `Eq` za `ReadonlyArray`:

```ts
import { Eq, tuple } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'
import * as RA from 'fp-ts/ReadonlyArray'

type Point = readonly [number, number]

const EqPoint: Eq<Point> = tuple(N.Eq, N.Eq)

const EqPoints: Eq<ReadonlyArray<Point>> = RA.getEq(EqPoint)
```

Kao i kod polugrupa, možete da definišete više od jedne instance `Eq` za isti tip. Pretpostavimo da smo modelovali korisnika sledećim tipom

```ts
type User = {
  readonly id: number
  readonly name: string
}
```

možemo da definišemo "standardnu" instancu `Eq` pomoću kombinatora `struct`:

```ts
import { Eq, struct } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'
import * as S from 'fp-ts/string'

type User = {
  readonly id: number
  readonly name: string
}

const EqStandard: Eq<User> = struct({
  id: N.Eq,
  name: S.Eq
})
```

**Napomena**. U jeziku kao što je Haskell, standardnu instancu `Eq` za struct kao što je `User` kompajler može da proizvede automatski.

```haskell
data User = User Int String
     deriving (Eq)
```

Međutim, mogu se javiti posebne situacije u kojima nam je potrebna drugačija vrsta jednakosti između korisnika; na primer, mogli bismo da smatramo da su dva korisnika jednaka ako imaju jednako polje `id`

```ts
/** dva korisnika su jednaka ako su im polja `id` jednaka */
const EqID: Eq<User> = {
  equals: (first, second) => N.Eq.equals(first.id, second.id)
}
```

Pošto smo "reifikovali" radnju poređenja dve vrednosti, odnosno učinili je konkretnom predstavljajući je kao strukturu podataka, možemo **programski da manipulišemo** instancama `Eq` kao što to radimo i sa drugim strukturama podataka. Pogledajmo primer.

**Primer**. Umesto da `EqId` definišemo "ručno", možemo da iskoristimo koristan kombinator `contramap`: ako imamo instancu `Eq` za `A` i funkciju iz `B` u `A`, možemo da izvedemo instancu `Eq` za `B`

```ts
import { Eq, struct, contramap } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as S from 'fp-ts/string'

type User = {
  readonly id: number
  readonly name: string
}

const EqStandard: Eq<User> = struct({
  id: N.Eq,
  name: S.Eq
})

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((_: User) => _.id)
)

console.log(
  EqStandard.equals({ id: 1, name: 'Giulio' }, { id: 1, name: 'Giulio Canti' })
) // => false (svojstva `name` su različita)

console.log(
  EqID.equals({ id: 1, name: 'Giulio' }, { id: 1, name: 'Giulio Canti' })
) // => true (iako su svojstva `name` različita)

console.log(EqID.equals({ id: 1, name: 'Giulio' }, { id: 2, name: 'Giulio' }))
// => false (iako su svojstva `name` jednaka)
```

**Kviz**. Za dati tip `A`, da li je moguće definisati instancu polugrupe za `Eq<A>`? Šta bi ona mogla da predstavlja?

# Modelovanje uređenja pomoću `Ord`

Sada kada smo modelovali koncept jednakosti, u ovom poglavlju videćemo kako da modelujemo koncept **uređenja**.

Relacija totalnog uređenja može se u TypeScript-u modelovati sledećim tipovima:

```ts
import { Eq } from 'fp-ts/Eq'

type Ordering = -1 | 0 | 1

interface Ord<A> extends Eq<A> {
  readonly compare: (first: A, second: A) => Ordering
}
```

Intuitivno:

- `x < y` ako i samo ako je `compare(x, y) = -1`
- `x = y` ako i samo ako je `compare(x, y) = 0`
- `x > y` ako i samo ako je `compare(x, y) = 1`

**Primer**

Pokušajmo da definišemo instancu `Ord` za tip `number`:

```ts
import { Ord } from 'fp-ts/Ord'

const OrdNumber: Ord<number> = {
  equals: (first, second) => first === second,
  compare: (first, second) => (first < second ? -1 : first > second ? 1 : 0)
}
```

Moraju da važe sledeći zakoni:

1. **Reflexivity**: `compare(x, x) <= 0`, za svako `x` iz `A`
2. **Antisymmetry**: ako je `compare(x, y) <= 0` i `compare(y, x) <= 0`, onda je `x = y`, za svako `x`, `y` iz `A`
3. **Transitivity**: ako je `compare(x, y) <= 0` i `compare(y, z) <= 0`, onda je `compare(x, z) <= 0`, za svako `x`, `y`, `z` iz `A`

Pored toga, `compare` mora da bude kompatibilan sa operacijom `equals` iz `Eq`:

`compare(x, y) === 0` ako i samo ako je `equals(x, y) === true`, za svako `x`, `y` iz `A`

**Napomena**. `equals` se može izvesti iz `compare` na sledeći način

```ts
equals: (first, second) => compare(first, second) === 0
```

Zato modul `fp-ts/Ord` izvozi zgodnu pomoćnu funkciju (helper) `fromCompare` koja omogućava da se instanca `Ord` definiše samo navođenjem funkcije `compare`:

```ts
import { Ord, fromCompare } from 'fp-ts/Ord'

const OrdNumber: Ord<number> = fromCompare((first, second) =>
  first < second ? -1 : first > second ? 1 : 0
)
```

**Kviz**. Da li je moguće definisati uređenje za igru Kamen-Papir-Makaze koje je kompatibilno sa pobedničkim potezima (tj. `move1 <= move2` ako `move2` pobeđuje `move1`)?

Kao prvi primer upotrebe, definišimo funkciju `sort` koja sortira elemente jednog `ReadonlyArray`

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { Ord } from 'fp-ts/Ord'

export const sort = <A>(O: Ord<A>) => (
  as: ReadonlyArray<A>
): ReadonlyArray<A> => as.slice().sort(O.compare)

pipe([3, 1, 2], sort(N.Ord), console.log) // => [1, 2, 3]
```

**Kviz** (JavaScript). Zašto se u implementaciji poziva metoda `slice`?

Kao još jedan primer upotrebe, definišimo funkciju `min` koja vraća manju od dve vrednosti:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { Ord } from 'fp-ts/Ord'

const min = <A>(O: Ord<A>) => (second: A) => (first: A): A =>
  O.compare(first, second) === 1 ? second : first

pipe(2, min(N.Ord)(1), console.log) // => 1
```

## Dualno uređenje

Kao što možemo da obrnemo operaciju `concat` da bismo dobili dualnu polugrupu (pomoću kombinatora [`reverse`](#dualna-polugrupa)), tako se i operacija `compare` može obrnuti da bismo dobili dualno uređenje.

Definišimo zato kombinator `reverse` za `Ord`:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { fromCompare, Ord } from 'fp-ts/Ord'

export const reverse = <A>(O: Ord<A>): Ord<A> =>
  fromCompare((first, second) => O.compare(second, first))
```

Kao primer upotrebe kombinatora `reverse`, možemo da izvedemo funkciju `max` iz funkcije `min`:

```ts
import { flow, pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { Ord, reverse } from 'fp-ts/Ord'

const min = <A>(O: Ord<A>) => (second: A) => (first: A): A =>
  O.compare(first, second) === 1 ? second : first

// const max: <A>(O: Ord<A>) => (second: A) => (first: A) => A
const max = flow(reverse, min)

pipe(2, max(N.Ord)(1), console.log) // => 2
```

**Totalnost** uređenja (tj. za bilo koja dva `x` i `y` važi jedan od sledećih uslova: `x <= y` ili `y <= x`) može da izgleda očigledno kada govorimo o brojevima, ali nije uvek tako. Razmotrimo složeniji slučaj

```ts
type User = {
  readonly name: string
  readonly age: number
}
```

Nije baš jasno kada je jedan korisnik "manji ili jednak" drugom korisniku.

Kako možemo da definišemo `Ord<User>`?

To zaista zavisi od konteksta, ali jedan mogući izbor bio bi, na primer, da korisnike poređamo prema njihovim godinama:

```ts
import * as N from 'fp-ts/number'
import { fromCompare, Ord } from 'fp-ts/Ord'

type User = {
  readonly name: string
  readonly age: number
}

const byAge: Ord<User> = fromCompare((first, second) =>
  N.Ord.compare(first.age, second.age)
)
```

Možemo da eliminišemo deo boilerplate koda pomoću kombinatora `contramap`: ako imamo instancu `Ord` za `A` i funkciju iz `B` u `A`, možemo da izvedemo instancu `Ord` za `B`:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { contramap, Ord } from 'fp-ts/Ord'

type User = {
  readonly name: string
  readonly age: number
}

const byAge: Ord<User> = pipe(
  N.Ord,
  contramap((_: User) => _.age)
)
```

Sada možemo da dobijemo mlađeg od dva korisnika pomoću funkcije `min` koju smo ranije definisali

```ts
// const getYounger: (second: User) => (first: User) => User
const getYounger = min(byAge)

pipe(
  { name: 'Guido', age: 50 },
  getYounger({ name: 'Giulio', age: 47 }),
  console.log
) // => { name: 'Giulio', age: 47 }
```

**Kviz**. Modul `fp-ts/ReadonlyMap` sadrži sledeći API

```ts
/**
 * Get a sorted `ReadonlyArray` of the keys contained in a `ReadonlyMap`.
 */
declare const keys: <K>(
  O: Ord<K>
) => <A>(m: ReadonlyMap<K, A>) => ReadonlyArray<K>
```

iz kog razloga ovaj API zahteva `Ord<K>`?

Vratimo se konačno početnom pitanju: kako definisati dve polugrupe `SemigroupMin` i `SemigroupMax` i za druge tipove osim `number`:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const SemigroupMin: Semigroup<number> = {
  concat: (first, second) => Math.min(first, second)
}

const SemigroupMax: Semigroup<number> = {
  concat: (first, second) => Math.max(first, second)
}
```

Sada kada nam je na raspolaganju apstrakcija `Ord`, to možemo da uradimo:

```ts
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { Ord, contramap } from 'fp-ts/Ord'
import { Semigroup } from 'fp-ts/Semigroup'

export const min = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? second : first)
})

export const max = <A>(O: Ord<A>): Semigroup<A> => ({
  concat: (first, second) => (O.compare(first, second) === 1 ? first : second)
})

type User = {
  readonly name: string
  readonly age: number
}

const byAge: Ord<User> = pipe(
  N.Ord,
  contramap((_: User) => _.age)
)

console.log(
  min(byAge).concat({ name: 'Guido', age: 50 }, { name: 'Giulio', age: 47 })
) // => { name: 'Giulio', age: 47 }
console.log(
  max(byAge).concat({ name: 'Guido', age: 50 }, { name: 'Giulio', age: 47 })
) // => { name: 'Guido', age: 50 }
```

**Primer**

Rezimirajmo sve jednim završnim primerom (prilagođeno prema [Fantas, Eel, and Specification 4: Semigroup](http://www.tomharding.me/2017/03/13/fantas-eel-and-specification-4/))

Pretpostavimo da treba da napravimo sistem u kome se u bazi podataka čuvaju zapisi (record) o klijentima, modelovani na sledeći način

```ts
interface Customer {
  readonly name: string
  readonly favouriteThings: ReadonlyArray<string>
  readonly registeredAt: number // since epoch
  readonly lastUpdatedAt: number // since epoch
  readonly hasMadePurchase: boolean
}
```

Iz nekog razloga može vam se desiti da imate duplirane zapise za istu osobu.

Potrebna nam je strategija spajanja (merging). A upravo time se bave polugrupe!

```ts
import * as B from 'fp-ts/boolean'
import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import { contramap } from 'fp-ts/Ord'
import * as RA from 'fp-ts/ReadonlyArray'
import { max, min, Semigroup, struct } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

interface Customer {
  readonly name: string
  readonly favouriteThings: ReadonlyArray<string>
  readonly registeredAt: number // since epoch
  readonly lastUpdatedAt: number // since epoch
  readonly hasMadePurchase: boolean
}

const SemigroupCustomer: Semigroup<Customer> = struct({
  // keep the longer name
  name: max(pipe(N.Ord, contramap(S.size))),
  // accumulate things
  favouriteThings: RA.getSemigroup<string>(),
  // keep the least recent date
  registeredAt: min(N.Ord),
  // keep the most recent date
  lastUpdatedAt: max(N.Ord),
  // boolean semigroup under disjunction
  hasMadePurchase: B.SemigroupAny
})

console.log(
  SemigroupCustomer.concat(
    {
      name: 'Giulio',
      favouriteThings: ['math', 'climbing'],
      registeredAt: new Date(2018, 1, 20).getTime(),
      lastUpdatedAt: new Date(2018, 2, 18).getTime(),
      hasMadePurchase: false
    },
    {
      name: 'Giulio Canti',
      favouriteThings: ['functional programming'],
      registeredAt: new Date(2018, 1, 22).getTime(),
      lastUpdatedAt: new Date(2018, 2, 9).getTime(),
      hasMadePurchase: true
    }
  )
)
/*
{ name: 'Giulio Canti',
  favouriteThings: [ 'math', 'climbing', 'functional programming' ],
  registeredAt: 1519081200000, // new Date(2018, 1, 20).getTime()
  lastUpdatedAt: 1521327600000, // new Date(2018, 2, 18).getTime()
  hasMadePurchase: true
}
*/
```

**Kviz**. Za dati tip `A`, da li je moguće definisati instancu polugrupe za `Ord<A>`? Šta bi ona mogla da predstavlja?

**Demo**

[`02_ord.ts`](src/02_ord.ts)

# Modelovanje kompozicije pomoću monoida

Ako definiciji polugrupe dodamo još jedan uslov, naime da postoji element `empty` u `A`
takav da za svaki element `a` iz `A` važi

- **Right identity**: `concat(a, empty) = a`
- **Left identity**: `concat(empty, a) = a`

onda govorimo o monoidu, a element `empty` nazivamo **neutralni element** (ili "jedinica").

Kao i kod `Magma` i `Semigroup`, monoidi se mogu modelovati pomoću TypeScript interfejsa (`interface`):

```ts
import { Semigroup } from 'fp-ts/Semigroup'

interface Monoid<A> extends Semigroup<A> {
  readonly empty: A
}
```

Mnoge polugrupe koje smo videli u prethodnim odeljcima mogu se obogatiti tako da postanu instance `Monoid`:

```ts
import { Monoid } from 'fp-ts/Monoid'

/** number `Monoid` under addition */
const MonoidSum: Monoid<number> = {
  concat: (first, second) => first + second,
  empty: 0
}

/** number `Monoid` under multiplication */
const MonoidProduct: Monoid<number> = {
  concat: (first, second) => first * second,
  empty: 1
}

const MonoidString: Monoid<string> = {
  concat: (first, second) => first + second,
  empty: ''
}

/** boolean monoid under conjunction */
const MonoidAll: Monoid<boolean> = {
  concat: (first, second) => first && second,
  empty: true
}

/** boolean monoid under disjunction */
const MonoidAny: Monoid<boolean> = {
  concat: (first, second) => first || second,
  empty: false
}
```

**Kviz**. U odeljku o polugrupama videli smo da `ReadonlyArray<string>` ima instancu `Semigroup`:

```ts
import { Semigroup } from 'fp-ts/Semigroup'

const Semigroup: Semigroup<ReadonlyArray<string>> = {
  concat: (first, second) => first.concat(second)
}
```

da li postoji i neutralni element? Da li je moguće uopštiti rezultat na `ReadonlyArray<A>` za bilo koji tip `A`?

**Kviz** (teško). Dokažite da je, za dati monoid, neutralni element jedinstven.

Praktična posledica je sledeća: ako ste pronašli neutralni element, prestanite da tražite!

Svaki monoid je polugrupa, ali nije svaka polugrupa monoid.

<center>
<img src="images/monoid.png" width="300" alt="Magma vs Semigroup vs Monoid" />
</center>

**Primer**

Razmotrite sledeći primer:

```ts
import { pipe } from 'fp-ts/function'
import { intercalate } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'

const SemigroupIntercalate = pipe(S.Semigroup, intercalate('|'))

console.log(S.Semigroup.concat('a', 'b')) // => 'ab'
console.log(SemigroupIntercalate.concat('a', 'b')) // => 'a|b'
console.log(SemigroupIntercalate.concat('a', '')) // => 'a|'
```

Primetite da nije moguće pronaći vrednost `empty` tipa `string` takvu da je `concat(a, empty) = a`.

Na kraju, jedan "egzotičniji" primer, sa funkcijama:

**Primer**

**Endomorfizam** je funkcija kod koje se ulazni i izlazni tip poklapaju:

```ts
type Endomorphism<A> = (a: A) => A
```

Za dati tip `A`, endomorfizmi na `A` čine monoid, takav da:

- operacija `concat` je uobičajena kompozicija funkcija
- neutralni element je funkcija identiteta

```ts
import { Endomorphism, flow, identity } from 'fp-ts/function'
import { Monoid } from 'fp-ts/Monoid'

export const getEndomorphismMonoid = <A>(): Monoid<Endomorphism<A>> => ({
  concat: flow,
  empty: identity
})
```

## Funkcija `concatAll`

Kada koristimo monoid umesto polugrupe, konkatenacija više elemenata je još jednostavnija: nije potrebno eksplicitno navesti početnu vrednost.

**Kviz**. Zašto nije potrebno navesti početnu vrednost?

```ts
import { concatAll } from 'fp-ts/Monoid'
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

console.log(concatAll(N.MonoidSum)([1, 2, 3, 4])) // => 10
console.log(concatAll(N.MonoidProduct)([1, 2, 3, 4])) // => 24
console.log(concatAll(S.Monoid)(['a', 'b', 'c'])) // => 'abc'
console.log(concatAll(B.MonoidAll)([true, false, true])) // => false
console.log(concatAll(B.MonoidAny)([true, false, true])) // => true
```

## Monoid proizvoda

Kao što smo već videli kod polugrupa, moguće je konstruisati instancu monoida za struct ako možemo da obezbedimo instancu monoida za svako njegovo polje.

**Primer**

```ts
import { Monoid, struct } from 'fp-ts/Monoid'
import * as N from 'fp-ts/number'

type Point = {
  readonly x: number
  readonly y: number
}

const Monoid: Monoid<Point> = struct({
  x: N.MonoidSum,
  y: N.MonoidSum
})
```

**Napomena**. Postoji kombinator sličan kombinatoru `struct` koji radi sa torkama: `tuple`.

```ts
import { Monoid, tuple } from 'fp-ts/Monoid'
import * as N from 'fp-ts/number'

type Point = readonly [number, number]

const Monoid: Monoid<Point> = tuple(N.MonoidSum, N.MonoidSum)
```

**Kviz**. Da li je moguće definisati "slobodni monoid" proizvoljnog tipa `A`?

**Demo** (implementacija sistema za crtanje geometrijskih oblika na canvas-u)

[`03_shapes.ts`](src/03_shapes.ts)

# Čiste funkcije i parcijalne funkcije

U prvom poglavlju kursa videli smo neformalnu definiciju čiste funkcije:

> Čista funkcija je procedura koja za isti ulaz uvek vraća isti izlaz i nema nikakav uočljiv sporedni efekat.

Ovakva formulacija može da ostavi prostora za nedoumice (na primer, šta je to "sporedni efekat"?)

Pogledajmo zato formalnu definiciju:

Podsetimo se da, ako su `X` i `Y` dva skupa, onda se sa `X × Y` označava njihov _Dekartov proizvod_, odnosno skup

```
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

**Definicija**. _Funkcija_ `f: X ⟶ Y` je podskup `f` skupa `X × Y` takav da
za svako `x ∈ X` postoji tačno jedno `y ∈ Y` takvo da par `(x, y) ∈ f`.

Skup `X` naziva se _domen_ funkcije `f`, a `Y` njen _kodomen_.

Primetite da skup `f` mora da bude opisan _statički_ u trenutku definisanja funkcije
(odnosno elementi tog skupa ne mogu da se menjaju tokom vremena niti pod uticajem bilo kakvog unutrašnjeg ili spoljašnjeg uslova).

**Primer**

Funkcija `double: Nat ⟶ Nat`, gde je `Nat` skup prirodnih brojeva, jeste podskup Dekartovog proizvoda `Nat × Nat` koji čine parovi `{ (1, 2), (2, 4), (3, 6), ...}`.

U TypeScript-u bi `f` mogla da se definiše ovako:

```ts
const f: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6
  ...
}
```

Definicija iz primera naziva se _ekstenzionalna_ definicija funkcije, odnosno elementi domena se nabrajaju jedan po jedan i za svaki od njih se navodi odgovarajući element kodomena.
Naravno, kada je skup beskonačan, kao u ovom slučaju, ovakva definicija može da bude pomalo "nezgodna".

Ovaj problem može da se zaobiđe uvođenjem takozvane _intenzionalne_ definicije,
odnosno izražava se uslov koji mora da važi za sve parove `(x, y)` koji pripadaju skupu `f`, a to je `y = x * 2`. To je poznati oblik u kome pišemo funkciju `double` i način na koji je definišemo u TypeScript-u:

```ts
const double = (x: number): number => x * 2
```

Definicija funkcije kao podskupa Dekartovog proizvoda pokazuje da su u matematici sve funkcije čiste:
nema akcije, promene stanja niti izmene elemenata (koji se smatraju nepromenljivim) skupova o kojima je reč.
U funkcionalnom programiranju implementacija funkcija treba da teži ovom idealnom modelu.

**Kviz**. Koje od sledećih procedura su čiste funkcije?

```ts
const coefficient1 = 2
export const f1 = (n: number) => n * coefficient1

// ------------------------------------------------------

let coefficient2 = 2
export const f2 = (n: number) => n * coefficient2++

// ------------------------------------------------------

let coefficient3 = 2
export const f3 = (n: number) => n * coefficient3

// ------------------------------------------------------

export const f4 = (n: number) => {
  const out = n * 2
  console.log(out)
  return out
}

// ------------------------------------------------------

interface User {
  readonly id: number
  readonly name: string
}

export declare const f5: (id: number) => Promise<User>

// ------------------------------------------------------

import * as fs from 'fs'

export const f6 = (path: string): string =>
  fs.readFileSync(path, { encoding: 'utf8' })

// ------------------------------------------------------

export const f7 = (
  path: string,
  callback: (err: Error | null, data: string) => void
): void => fs.readFile(path, { encoding: 'utf8' }, callback)
```

To što je funkcija čista ne znači nužno da je mutabilnost zabranjena: lokalno je dozvoljena
ako ne izlazi van granica implementacije.

![mutable / immutable](images/mutable-immutable.jpg)

**Primer** (Implementacija funkcije `concatAll` za monoide)

```ts
import { Monoid } from 'fp-ts/Monoid'

const concatAll = <A>(M: Monoid<A>) => (as: ReadonlyArray<A>): A => {
  let out: A = M.empty // <= lokalna mutabilnost
  for (const a of as) {
    out = M.concat(out, a)
  }
  return out
}
```

Pravi cilj je uvek da se obezbedi osnovno svojstvo **referencijalne transparentnosti**.

Ugovor koji sklapamo sa korisnikom našeg API-ja definisan je njegovim potpisom:

```ts
declare const concatAll: <A>(M: Monoid<A>) => (as: ReadonlyArray<A>) => A
```

i obećanjem da ćemo poštovati referencijalnu transparentnost; tehnički detalji o tome kako je funkcija konkretno implementirana nisu bitni i nisu predmet razmatranja, tako da postoji potpuna sloboda.

Dakle, kako se definiše "sporedni efekat"? Jednostavno, kao negacija referencijalne transparentnosti:

> Izraz sadrži "sporedni efekat" ako nije referencijalno transparentan.

Funkcije se ne oslanjaju samo na prvi od dva stuba funkcionalnog programiranja, već su i primer
drugog stuba: **kompozicije**.

Funkcije se, naime, komponuju:

**Definicija**. Neka su `f: Y ⟶ Z` i `g: X ⟶ Y` dve funkcije; tada se funkcija `h: X ⟶ Z` definisana sa

```
h(x) = f(g(x))
```

naziva _kompozicija_ funkcija `f` i `g` i piše se `h = f ∘ g`

Primetite: da bi dve funkcije `f` i `g` mogle da se komponuju, domen funkcije `f` mora da se poklapa sa kodomenom funkcije `g`.

**Definicija**. _Parcijalna_ funkcija je funkcija koja nije definisana za sve vrednosti domena.

Obrnuto, funkcija koja je definisana za sve vrednosti domena naziva se _totalna_.

**Primer**

```ts
// Get the first element of a `ReadonlyArray`
declare const head: <A>(as: ReadonlyArray<A>) => A
```

**Kviz**. Zašto je funkcija `head` parcijalna?

**Kviz**. Da li je funkcija `JSON.parse` totalna?

```ts
parse: (text: string, reviver?: (this: any, key: string, value: any) => any) =>
  any
```

**Kviz**. Da li je funkcija `JSON.stringify` totalna?

```ts
stringify: (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
) => string
```

U funkcionalnom programiranju teži se tome da se definišu samo **čiste i totalne funkcije** (od sada ću termin "funkcija" koristiti kao sinonim za "čista i totalna funkcija"), pa kako onda postupiti kada imamo posla sa parcijalnom funkcijom?

Srećom, parcijalna funkcija `f: X ⟶ Y` uvek može da se svede na totalnu funkciju tako što se kodomenu doda posebna vrednost koja **ne pripada** skupu `Y`, nazovimo je `None`, i pridruži se svakoj vrednosti iz `X` za koju `f` nije definisana

```
f': X ⟶ Y ∪ None
```

Uvedimo oznaku `Option(Y) = Y ∪ None`.

```
f': X ⟶ Option(Y)
```

Da li je moguće definisati `Option(Y)` u TypeScript-u? U naredna dva poglavlja videćemo kako to može da se uradi.

# Algebarski tipovi podataka

Dobar prvi korak pri izgradnji nove aplikacije jeste definisanje njenog domenskog modela. TypeScript nudi mnogo alata koji pomažu u tom zadatku. **Algebarski tipovi podataka** (Algebraic Data Types, skraćeno ADT) jedan su od tih alata.

## Šta je algebarski tip podataka?

> In computer programming, especially functional programming and type theory, an algebraic data type is a kind of composite type, i.e., a type formed by combining other types.

Dve česte familije algebarskih tipova podataka su: **tipovi proizvoda** (product types) i **tipovi sume** (sum types).

<center>
<img src="images/adt.png" width="400" alt="ADT" />
</center>

Počnimo od onih poznatijih: tipova proizvoda.

## Tipovi proizvoda

Tip proizvoda je kolekcija tipova T<sub>i</sub> indeksiranih skupom `I`.

Dva česta člana ove familije su `n`-torke, gde je `I` interval prirodnih brojeva:

```ts
type Tuple1 = [string] // I = [0]
type Tuple2 = [string, number] // I = [0, 1]
type Tuple3 = [string, number, boolean] // I = [0, 1, 2]

// Accessing by index
type Fst = Tuple2[0] // string
type Snd = Tuple2[1] // number
```

i struct-ovi, gde je `I` skup labela:

```ts
// I = {"name", "age"}
interface Person {
  name: string
  age: number
}

// Accessing by label
type Name = Person['name'] // string
type Age = Person['age'] // number
```

Tipovi proizvoda mogu biti **polimorfni**.

**Primer**

```ts
//                ↓ type parameter
type HttpResponse<A> = {
  readonly code: number
  readonly body: A
}
```

### Odakle naziv "tipovi proizvoda"?

Ako sa `C(A)` označimo broj stanovnika tipa `A`, što nazivamo **kardinalnost**, onda važi sledeća jednakost:

```ts
C([A, B]) = C(A) * C(B)
```

> kardinalnost proizvoda je proizvod kardinalnosti

**Primer**

Tip `null` ima kardinalnost `1` jer ima samo jednog stanovnika: `null`.

**Primer**

Tip `boolean` ima kardinalnost `2` jer ima dva stanovnika: `true` i `false`.

**Primer**

```ts
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
type Period = 'AM' | 'PM'
type Clock = readonly [Hour, Period]
```

Tip `Hour` ima `12` stanovnika.
Tip `Period` ima `2` stanovnika.
Tip `Clock` ima `12 * 2 = 24` stanovnika.

**Kviz**. Koliko stanovnika ima sledeći tip `Clock`?

```ts
// same as before
type Hour = 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12
// same as before
type Period = 'AM' | 'PM'

type Clock = {
  readonly hour: Hour
  readonly period: Period
}
```

### Kada mogu da koristim tip proizvoda?

Kad god su njegove komponente **nezavisne**.

```ts
type Clock = readonly [Hour, Period]
```

Ovde su `Hour` i `Period` nezavisni, odnosno vrednost `Hour` ne utiče na vrednost `Period` i obrnuto; svi parovi su legalni i imaju smisla.

## Tipovi sume

Tip sume je struktura podataka koja sadrži vrednost koja može biti jednog od nekoliko različitih (ali fiksnih) tipova. U datom trenutku samo jedan od tipova može biti u upotrebi, a polje koje služi kao "tag" pokazuje koji je od njih u upotrebi.

U zvaničnoj dokumentaciji TypeScript-a nazivaju se [discriminated union](https://www.typescriptlang.org/docs/handbook/unions-and-intersections.html).

Važno je naglasiti da članovi unije koja čini tip sume moraju biti **disjunktni**, odnosno ne smeju da postoje vrednosti koje pripadaju više nego jednom članu.

**Primer**

Tip

```ts
type StringsOrNumbers = ReadonlyArray<string> | ReadonlyArray<number>
```

nije disjunktna unija jer vrednost `[]` (prazan niz) pripada i jednom i drugom članu unije.

**Kviz**. Da li je sledeća unija disjunktna?

```ts
type Member1 = { readonly a: string }
type Member2 = { readonly b: number }
type MyUnion = Member1 | Member2
```

U funkcionalnom programiranju teži se tome da se uvek koriste disjunktne unije.

Srećom, u TypeScript-u postoji siguran način da se garantuje da je unija disjunktna: dodavanje posebnog polja koje služi kao **tag**.

**Primer** (redux actions)

Tip sume `Action` modeluje deo operacija koje mogu da se izvrše u jednoj [todo aplikaciji](https://todomvc.com/).

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }
```

Polje `type`, budući da je obavezno i da ima različit tip za svaki član unije, može da se izabere za tag i obezbeđuje da članovi budu disjunktni.

**Napomena**. Ime polja koje služi kao tag bira programer, ono ne mora nužno da bude "type" (u `fp-ts`, na primer, po konvenciji se koristi ime "\_tag").

Sada kada smo videli nekoliko primera, možemo eksplicitnije da preformulišemo šta je algebarski tip podataka:

> In general, an algebraic data type specifies a sum of one or more alternatives, where each alternative is a product of zero or more fields.

Tipovi sume mogu biti **polimorfni** i **rekurzivni**.

**Primer** (linked lists)

```ts
//               ↓ type parameter
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }
//                                                              ↑ recursion
```

**Kviz** (TypeScript). Za sledeće strukture podataka odredite da li su tipovi proizvoda ili tipovi sume

- `ReadonlyArray<A>`
- `Record<string, A>`
- `Record<'k1' | 'k2', A>`
- `ReadonlyMap<string, A>`
- `ReadonlyMap<'k1' | 'k2', A>`

### Konstruktori

Tip sume sa `n` članova zahteva (najmanje) `n` **konstruktora**, po jedan za svaki član.

**Primer** (redux action creators)

```ts
export type Action =
  | {
      readonly type: 'ADD_TODO'
      readonly text: string
    }
  | {
      readonly type: 'UPDATE_TODO'
      readonly id: number
      readonly text: string
      readonly completed: boolean
    }
  | {
      readonly type: 'DELETE_TODO'
      readonly id: number
    }

export const add = (text: string): Action => ({
  type: 'ADD_TODO',
  text
})

export const update = (
  id: number,
  text: string,
  completed: boolean
): Action => ({
  type: 'UPDATE_TODO',
  id,
  text,
  completed
})

export const del = (id: number): Action => ({
  type: 'DELETE_TODO',
  id
})
```

**Primer** (TypeScript, linked lists)

```ts
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }

// a nullary constructor can be implemented as a constant
export const nil: List<never> = { _tag: 'Nil' }

export const cons = <A>(head: A, tail: List<A>): List<A> => ({
  _tag: 'Cons',
  head,
  tail
})

// ekvivalentno nizu [1, 2, 3]
const myList = cons(1, cons(2, cons(3, nil)))
```

**Primer** (Haskell, linked lists)

```haskell
data List a = Nil | Cons a (List a)

myList :: List Int
myList = Cons 1 (Cons 2 (Cons 3 Nil))
```

### Pattern matching

JavaScript nema [pattern matching](https://github.com/tc39/proposal-pattern-matching) (pa ga nema ni TypeScript).

**Primer** (Haskell, linked lists)

```haskell
data List a = Nil | Cons a (List a)

-- vraća `True` ako je lista prazna
isEmpty :: List a -> Bool
isEmpty Nil = True
isEmpty (Cons _ _) = False
```

Ipak, pattern matching možemo da simuliramo pomoću funkcije `match`.

**Primer** (TypeScript, linked lists)

```ts
interface Nil {
  readonly _tag: 'Nil'
}

interface Cons<A> {
  readonly _tag: 'Cons'
  readonly head: A
  readonly tail: List<A>
}

export type List<A> = Nil | Cons<A>

export const match = <R, A>(
  onNil: () => R,
  onCons: (head: A, tail: List<A>) => R
) => (fa: List<A>): R => {
  switch (fa._tag) {
    case 'Nil':
      return onNil()
    case 'Cons':
      return onCons(fa.head, fa.tail)
  }
}

// vraća `true` ako je lista prazna
export const isEmpty = match(
  () => true,
  () => false
)

// vraća prvi element liste ili `undefined`
export const head = match(
  () => undefined,
  (head, _tail) => head
)

// računa dužinu liste (rekurzivno)
export const length: <A>(fa: List<A>) => number = match(
  () => 0,
  (_, tail) => 1 + length(tail)
)
```

**Kviz**. Zašto je API `head` suboptimalan?

**Napomena**. TypeScript nudi odličnu mogućnost vezanu za tipove sume: **exhaustive check**. Naime, type checker može da utvrdi da li su svi slučajevi obrađeni u naredbi `switch` definisanoj u telu funkcije `match`.

### Odakle naziv "tipovi sume"?

Važi sledeća jednakost:

```ts
C(A | B) = C(A) + C(B)
```

> kardinalnost sume je suma kardinalnosti

**Primer** (the `Option` type)

```ts
interface None {
  readonly _tag: 'None'
}

interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>
```

Iz opšte formule dobijam `C(Option<A>) = C(None) + C(Some<A>) = 1 + C(A)`, iz čega možemo da izvedemo, na primer, kardinalnost tipa `Option<boolean>`, odnosno `1 + 2 = 3` stanovnika:

- `{ _tag: 'None' }`
- `{ _tag: 'Some', value: true }`
- `{ _tag: 'Some', value: false }`

### Kada treba da koristim tip sume?

Kada bi njegove komponente bile **zavisne** ako bi se implementirale pomoću tipa proizvoda.

**Primer** (`React` props)

```ts
import * as React from 'react'

interface Props {
  readonly editable: boolean
  readonly onChange?: (text: string) => void
}

class Textbox extends React.Component<Props> {
  render() {
    if (this.props.editable) {
      // error: Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange('a')
    }
    return <div />
  }
}
```

Problem je ovde to što je `Props` modelovan kao proizvod, ali `onChange` **zavisi** od `editable`.

Tip sume je bolji izbor:

```ts
import * as React from 'react'

type Props =
  | {
      readonly type: 'READONLY'
    }
  | {
      readonly type: 'EDITABLE'
      readonly onChange: (text: string) => void
    }

class Textbox extends React.Component<Props> {
  render() {
    switch (this.props.type) {
      case 'EDITABLE':
        this.props.onChange('a') // :)
    }
    return <div />
  }
}
```

**Primer** (node callbacks)

```ts
declare function readFile(
  path: string,
  //         ↓ ---------- ↓ CallbackArgs
  callback: (err?: Error, data?: string) => void
): void
```

Rezultat operacije `readFile` modelovan je tipom proizvoda (preciznije, torkom) koji se prosleđuje kao ulaz funkciji `callback`:

```ts
type CallbackArgs = [Error | undefined, string | undefined]
```

međutim, njegove komponente su **zavisne**: dobija se greška **ili** string:

| err         | data        | legalno? |
| ----------- | ----------- | -------- |
| `Error`     | `undefined` | ✓        |
| `undefined` | `string`    | ✓        |
| `Error`     | `string`    | ✘        |
| `undefined` | `undefined` | ✘        |

Ovaj API nije modelovan u skladu sa sledećom maksimom:

> Make impossible state unrepresentable

Tip sume bi bio bolji izbor, ali koji? Pogledajmo kako se greškama rukuje na funkcionalan način.

**Kviz**. U poslednje vreme se umesto API-ja zasnovanih na callback-ovima sve više koriste API-ji koji vraćaju `Promise`

```ts
declare function readFile(path: string): Promise<string>
```

možete li da navedete jednu manu ovog drugog rešenja kada se koristi statički tipiziran jezik kao što je TypeScript?

# Funkcionalno rukovanje greškama

Pogledajmo kako da rukujemo greškama na funkcionalan način.

Funkcija koja vraća grešku ili baca izuzetak je primer parcijalne funkcije.

U poglavlju [Čiste funkcije i parcijalne funkcije](#čiste-funkcije-i-parcijalne-funkcije) videli smo da se svaka parcijalna funkcija `f` uvek može svesti na totalnu funkciju `f'`

```
f': X ⟶ Option(Y)
```

Sada kada znamo nešto više o tipovima sume u TypeScript-u, možemo bez daljeg odlaganja da definišemo `Option`.

## Tip `Option`

Tip `Option<A>` predstavlja efekat izračunavanja koje može da ne uspe (slučaj `None`) ili da vrati vrednost tipa `A` (slučaj `Some`):

```ts
// represents a failure
interface None {
  readonly _tag: 'None'
}

// represents a success
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>
```

Pogledajmo i njegove konstruktore i njegovu funkciju `match` za "pattern matching":

```ts
const none: Option<never> = { _tag: 'None' }

const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })

const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (
  fa: Option<A>
): R => {
  switch (fa._tag) {
    case 'None':
      return onNone()
    case 'Some':
      return onSome(fa.value)
  }
}
```

Tip `Option` može da se koristi da bismo izbegli bacanje izuzetaka i/ili predstavili opcione vrednosti, pa tako možemo da pređemo sa:

```ts
//                        this is a lie ↓
const head = <A>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}

let s: string
try {
  s = String(head([]))
} catch (e) {
  s = e.message
}
```

gde sistem tipova ne zna ništa o mogućem neuspehu, na:

```ts
import { pipe } from 'fp-ts/function'

//                                      ↓ the type system "knows" that this computation may fail
const head = <A>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])

declare const numbers: ReadonlyArray<number>

const result = pipe(
  head(numbers),
  match(
    () => 'Empty array',
    (n) => String(n)
  )
)
```

gde je mogućnost greške kodirana u sistemu tipova.

Zaista, ako pokušamo da pristupimo svojstvu `value` neke `Option` vrednosti bez provere u kom smo od dva slučaja, sistem tipova nas upozorava na moguću grešku:

```ts
declare const numbers: ReadonlyArray<number>

const result = head(numbers)
result.value // type checker error: Property 'value' does not exist on type 'Option<number>'
```

Jedini način da pristupimo vrednosti sadržanoj u `Option` jeste da obradimo i slučaj neuspeha pomoću funkcije `match`

```ts
pipe(result, match(
  () => ...handle error...
  (n) => ...go on with my business logic...
))
```

Da li je moguće definisati instance za apstrakcije koje smo videli u prethodnim poglavljima? Počnimo od `Eq`.

### Instanca za `Eq`

Pretpostavimo da imamo dve vrednosti tipa `Option<string>` i da želimo da ih uporedimo kako bismo utvrdili da li su jednake:

```ts
import { pipe } from 'fp-ts/function'
import { match, Option } from 'fp-ts/Option'

declare const o1: Option<string>
declare const o2: Option<string>

const result: boolean = pipe(
  o1,
  match(
    // onNone o1
    () =>
      pipe(
        o2,
        match(
          // onNone o2
          () => true,
          // onSome o2
          () => false
        )
      ),
    // onSome o1
    (s1) =>
      pipe(
        o2,
        match(
          // onNone o2
          () => false,
          // onSome o2
          (s2) => s1 === s2 // <= ovde koristim jednakost stringova
        )
      )
  )
)
```

A šta ako imamo dve `Option<number>` vrednosti? Kod bi bio gotovo isti, osim na kraju, kada poredim vrednosti sadržane u dve `Option`, za šta ću koristiti jednakost brojeva.

Ali onda možemo da generalizujemo kod tako što ćemo od korisnika zahtevati instancu `Eq` za `A` i iz nje izvesti instancu `Eq` za `Option<A>`.

Drugim rečima, možemo da definišemo **kombinator** `getEq`: za dati `Eq<A>` kombinator vraća `Eq<Option<A>>`:

```ts
import { Eq } from 'fp-ts/Eq'
import { pipe } from 'fp-ts/function'
import { match, Option, none, some } from 'fp-ts/Option'

export const getEq = <A>(E: Eq<A>): Eq<Option<A>> => ({
  equals: (first, second) =>
    pipe(
      first,
      match(
        () =>
          pipe(
            second,
            match(
              () => true,
              () => false
            )
          ),
        (a1) =>
          pipe(
            second,
            match(
              () => false,
              (a2) => E.equals(a1, a2) // <= ovde koristim jednakost za `A`
            )
          )
      )
    )
})

import * as S from 'fp-ts/string'

const EqOptionString = getEq(S.Eq)

console.log(EqOptionString.equals(none, none)) // => true
console.log(EqOptionString.equals(none, some('b'))) // => false
console.log(EqOptionString.equals(some('a'), none)) // => false
console.log(EqOptionString.equals(some('a'), some('b'))) // => false
console.log(EqOptionString.equals(some('a'), some('a'))) // => true
```

Naravno, možemo da koristimo sve kombinatore koje smo već videli za `Eq`; na primer, evo kako se definiše instanca `Eq` za `Option<readonly [string, number]>`:

```ts
import { tuple } from 'fp-ts/Eq'
import * as N from 'fp-ts/number'
import { getEq, Option, some } from 'fp-ts/Option'
import * as S from 'fp-ts/string'

type MyTuple = readonly [string, number]

const EqMyTuple = tuple<MyTuple>(S.Eq, N.Eq)

const EqOptionMyTuple = getEq(EqMyTuple)

const o1: Option<MyTuple> = some(['a', 1])
const o2: Option<MyTuple> = some(['a', 2])
const o3: Option<MyTuple> = some(['b', 1])

console.log(EqOptionMyTuple.equals(o1, o1)) // => true
console.log(EqOptionMyTuple.equals(o1, o2)) // => false
console.log(EqOptionMyTuple.equals(o1, o3)) // => false
```

Ako malo izmenimo import-e u prethodnom primeru koda, možemo da dobijemo analogan rezultat za `Ord`:

```ts
import * as N from 'fp-ts/number'
import { getOrd, Option, some } from 'fp-ts/Option'
import { tuple } from 'fp-ts/Ord'
import * as S from 'fp-ts/string'

type MyTuple = readonly [string, number]

const OrdMyTuple = tuple<MyTuple>(S.Ord, N.Ord)

const OrdOptionMyTuple = getOrd(OrdMyTuple)

const o1: Option<MyTuple> = some(['a', 1])
const o2: Option<MyTuple> = some(['a', 2])
const o3: Option<MyTuple> = some(['b', 1])

console.log(OrdOptionMyTuple.compare(o1, o1)) // => 0
console.log(OrdOptionMyTuple.compare(o1, o2)) // => -1
console.log(OrdOptionMyTuple.compare(o1, o3)) // => -1
```

### Instance za `Semigroup` i `Monoid`

Pretpostavimo sada da želimo da spojimo ("merge") dve `Option<A>` vrednosti; postoje četiri slučaja:

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | none         |
| none     | some(a2) | none         |
| some(a1) | some(a2) | ?            |

U poslednjem slučaju postoji problem: potreban nam je način da spojimo ("merge") dve vrednosti tipa `A`.

Ali upravo je to posao za `Semigroup`!

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

Možemo da zahtevamo instancu polugrupe za `A` i iz nje izvedemo instancu polugrupe za `Option<A>`

```ts
// implementacija je ostavljena kao vežba
declare const getApplySemigroup: <A>(S: Semigroup<A>) => Semigroup<Option<A>>
```

**Kviz**. Da li je moguće dodati neutralni element prethodnoj polugrupi i tako je pretvoriti u monoid?

```ts
// implementacija je ostavljena kao vežba
declare const getApplicativeMonoid: <A>(M: Monoid<A>) => Monoid<Option<A>>
```

Moguće je definisati instancu monoida za `Option<A>` koja se ponaša na sledeći način:

| x        | y        | concat(x, y)           |
| -------- | -------- | ---------------------- |
| none     | none     | none                   |
| some(a1) | none     | some(a1)               |
| none     | some(a2) | some(a2)               |
| some(a1) | some(a2) | some(S.concat(a1, a2)) |

```ts
// implementacija je ostavljena kao vežba
declare const getMonoid: <A>(S: Semigroup<A>) => Monoid<Option<A>>
```

**Kviz**. Koji je neutralni element `empty` ovog monoida?

**Primer**

Pomoću `getMonoid` možemo da izvedemo još dva korisna monoida:

(Monoid returning the left-most non-`None` value)

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a1)     |

```ts
import { Monoid } from 'fp-ts/Monoid'
import { getMonoid, Option } from 'fp-ts/Option'
import { first } from 'fp-ts/Semigroup'

export const getFirstMonoid = <A = never>(): Monoid<Option<A>> =>
  getMonoid(first())
```

i njegov dualni monoid:

(Monoid returning the right-most non-`None` value)

| x        | y        | concat(x, y) |
| -------- | -------- | ------------ |
| none     | none     | none         |
| some(a1) | none     | some(a1)     |
| none     | some(a2) | some(a2)     |
| some(a1) | some(a2) | some(a2)     |

```ts
import { Monoid } from 'fp-ts/Monoid'
import { getMonoid, Option } from 'fp-ts/Option'
import { last } from 'fp-ts/Semigroup'

export const getLastMonoid = <A = never>(): Monoid<Option<A>> =>
  getMonoid(last())
```

**Primer**

Konkretno, `getLastMonoid` može da bude koristan za rukovanje opcionim vrednostima:

```ts
import { Monoid, struct } from 'fp-ts/Monoid'
import { getMonoid, none, Option, some } from 'fp-ts/Option'
import { last } from 'fp-ts/Semigroup'

/** VSCode settings */
interface Settings {
  /** Controls the font family */
  readonly fontFamily: Option<string>
  /** Controls the font size in pixels */
  readonly fontSize: Option<number>
  /** Limit the width of the minimap to render at most a certain number of columns. */
  readonly maxColumn: Option<number>
}

const monoidSettings: Monoid<Settings> = struct({
  fontFamily: getMonoid(last()),
  fontSize: getMonoid(last()),
  maxColumn: getMonoid(last())
})

const workspaceSettings: Settings = {
  fontFamily: some('Courier'),
  fontSize: none,
  maxColumn: some(80)
}

const userSettings: Settings = {
  fontFamily: some('Fira Code'),
  fontSize: some(12),
  maxColumn: none
}

/** userSettings overrides workspaceSettings */
console.log(monoidSettings.concat(workspaceSettings, userSettings))
/*
{ fontFamily: some("Fira Code"),
  fontSize: some(12),
  maxColumn: some(80) }
*/
```

**Kviz**. Pretpostavimo da VSCode ne može da prikaže kolone šire od `80`. Kako bismo mogli da izmenimo definiciju `monoidSettings` da bismo to uzeli u obzir?

## Tip `Either`

Jedna česta upotreba tipa `Either` jeste kao alternativa za `Option` pri rukovanju efektom izračunavanja koje može da ne uspe, ali uz mogućnost da navedemo razlog neuspeha.

U ovoj upotrebi, `None` je zamenjen sa `Left`, koji sadrži korisne informacije o grešci. `Right` pak zamenjuje `Some`.

```ts
// represents a failure
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}

// represents a success
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}

type Either<E, A> = Left<E> | Right<A>
```

Konstruktori i pattern matching:

```ts
const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })

const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right })

const match = <E, R, A>(onLeft: (left: E) => R, onRight: (right: A) => R) => (
  fa: Either<E, A>
): R => {
  switch (fa._tag) {
    case 'Left':
      return onLeft(fa.left)
    case 'Right':
      return onRight(fa.right)
  }
}
```

Vratimo se na primer sa callback-om:

```ts
declare function readFile(
  path: string,
  callback: (err?: Error, data?: string) => void
): void

readFile('./myfile', (err, data) => {
  let message: string
  if (err !== undefined) {
    message = `Error: ${err.message}`
  } else if (data !== undefined) {
    message = `Data: ${data.trim()}`
  } else {
    // should never happen
    message = 'The impossible happened'
  }
  console.log(message)
})
```

možemo da promenimo njen potpis u:

```ts
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

i da koristimo API na ovaj način:

```ts
readFile('./myfile', (e) =>
  pipe(
    e,
    match(
      (err) => `Error: ${err.message}`,
      (data) => `Data: ${data.trim()}`
    ),
    console.log
  )
)
```

# Teorija kategorija

Videli smo da je **kompozicija** kamen temeljac funkcionalnog programiranja.

> And how do we solve problems? We decompose bigger problems into smaller problems. If the smaller problems are still too big,
> we decompose them further, and so on. Finally, we write code that solves all the small problems. And then comes the essence of programming: we compose those pieces of code to create solutions to larger problems. Decomposition wouldn't make sense if we weren't able to put the pieces back together. - Bartosz Milewski

Ali šta to tačno znači? Kada možemo da kažemo da se dve stvari _komponuju_? I kada možemo da kažemo da se dve stvari komponuju _dobro_?

> Entities are composable if we can easily and generally combine their behaviors in some way without having to modify the entities being combined. I think of composability as being the key ingredient necessary for acheiving reuse, and for achieving a combinatorial expansion of what is succinctly expressible in a programming model. - Paul Chiusano

U prvom poglavlju smo naučili da se program u funkcionalnom stilu obično piše kao pipeline:

```ts
const program = pipe(
  input,
  f1, // čista funkcija
  f2, // čista funkcija
  f3, // čista funkcija
  ...
)
```

Ali koliko je lako pridržavati se ovog stila? Da li je to zaista izvodljivo? Hajde da probamo:

```ts
import { pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'

const double = (n: number): number => n * 2

/**
 * Za dati ReadonlyArray<number> program vraća udvostručen prvi element
 */
const program = (input: ReadonlyArray<number>): number =>
  pipe(
    input,
    RA.head, // greška pri kompajliranju! Type 'Option<number>' is not assignable to type 'number'
    double
  )
```

Zašto dobijam grešku pri kompajliranju?

Stvar je u tome što se `head` i `double` ne komponuju!

```ts
head: (as: ReadonlyArray<number>) => Option<number>
double: (n: number) => number
```

kodomen funkcije `head` se ne poklapa sa domenom funkcije `double`.

Šta onda da radimo? Da odustanemo?

Trebalo bi da možemo da se oslonimo na neku **rigoroznu teoriju** koja može da pruži odgovore na tako fundamentalna pitanja.
Potrebna nam je **formalna definicija** pojma kompozicije.

Srećom, već više od 70 godina velika grupa naučnika koji pripadaju najdugovečnijem i najogromnijem open source projektu u istoriji
čovečanstva (matematici) bavi se razvojem teorije posvećene upravo ovoj temi: **teorije kategorija**, koju je osnovao Saunders Mac Lane, zajedno sa Samuelom Eilenbergom (1945).

<center>
<img src="images/maclane.jpg" width="300" alt="Saunders Mac Lane" />

(Saunders Mac Lane)

<img src="images/eilenberg.jpg" width="300" alt="Samuel Eilenberg" />

(Samuel Eilenberg)

</center>

U narednim poglavljima videćemo kako kategorija može da predstavlja:

- model nekog opšteg **programskog jezika**
- model pojma **kompozicije**

## Definicija

> Categories capture the essence of composition.

Definicija kategorije, iako nije naročito komplikovana, malo je duga, pa ću je podeliti na dva dela:

- prvi deo je tehnički (pre svega moramo da definišemo njene sastavne delove)
- drugi deo sadrži ono što nas najviše zanima: pojam kompozicije

**Deo I (Sastavni delovi)**

Kategorija je par `(Objects, Morphisms)` gde je:

- `Objects` kolekcija **objekata**
- `Morphisms` kolekcija **morfizama** (koji se nazivaju i "strelice") između objekata

<img src="images/objects-morphisms.png" width="300" alt="Objects and Morphisms" />

**Napomena**. Termin "objekat" nema nikakve veze sa OOP-om; zamislite objekte kao crne kutije koje ne možete da pregledate, ili kao obične placeholder-e koji služe za definisanje morfizama.

Svaki morfizam `f` ima izvorni objekat `A` i ciljni objekat `B`, pri čemu su i `A` i `B` sadržani u `Objects`. Pišemo `f: A ⟼ B` i kažemo da je "f morfizam iz A u B"

<img src="images/morphism.png" width="300" alt="A morphism" />

**Napomena**. Radi jednostavnosti, od sada ću na dijagramima koristiti samo oznake za objekte, bez kružića.

**Deo II (Kompozicija)**

Postoji operacija `∘`, koja se naziva "kompozicija", takva da važe sledeća svojstva:

(**composition of morphisms**) kad god su `f: A ⟼ B` i `g: B ⟼ C` dva morfizma u `Morphisms`, mora da postoji i treći morfizam `g ∘ f: A ⟼ C` u `Morphisms`, koji se naziva _kompozicija_ morfizama `f` i `g`

<img src="images/composition.png" width="300" alt="composition" />

(**associativity**) ako su `f: A ⟼ B`, `g: B ⟼ C` i `h: C ⟼ D`, onda je `h ∘ (g ∘ f) = (h ∘ g) ∘ f`

<img src="images/associativity.png" width="500" alt="associativity" />

(**identity**) za svaki objekat `X` postoji morfizam `idX: X ⟼ X`, koji se naziva _morfizam identiteta_ objekta `X`, takav da za svaki morfizam `f: A ⟼ X` i svaki morfizam `g: X ⟼ B` važi `idX ∘ f = f` i `g ∘ idX = g`.

<img src="images/identity.png" width="300" alt="identity" />

Pogledajmo mali primer

**Primer**

<img src="images/category.png" width="300" alt="a simple category" />

Ova kategorija je veoma jednostavna: ima samo tri objekta i šest morfizama (idA, idB, idC su morfizmi identiteta objekata `A`, `B`, `C`).

## Modelovanje programskih jezika pomoću kategorija

Kategorija se može tumačiti kao pojednostavljeni model **tipiziranog programskog jezika** (typed programming language), gde:

- objekti su **tipovi**
- morfizmi su **funkcije**
- `∘` je uobičajena **kompozicija funkcija**

Dijagram:

<img src="images/category.png" width="300" alt="a simple programming language" />

stoga se može tumačiti kao zamišljeni (i veoma jednostavan) programski jezik sa samo tri tipa i šest funkcija.

Na primer, mogli bismo da zamislimo:

- `A = string`
- `B = number`
- `C = boolean`
- `f = string => number`
- `g = number => boolean`
- `g ∘ f = string => boolean`

Implementacija bi mogla da izgleda otprilike ovako:

```ts
const idA = (s: string): string => s

const idB = (n: number): number => n

const idC = (b: boolean): boolean => b

const f = (s: string): number => s.length

const g = (n: number): boolean => n > 2

// gf = g ∘ f
const gf = (s: string): boolean => g(f(s))
```

## Kategorija za TypeScript

Možemo da definišemo kategoriju, nazovimo je _TS_, kao pojednostavljeni model jezika TypeScript, gde:

- **objekti** su svi tipovi TypeScript-a: `string`, `number`, `ReadonlyArray<string>`, itd...
- **morfizmi** su sve TypeScript funkcije: `(a: A) => B`, `(b: B) => C`, itd... gde su `A`, `B`, `C`, ... TypeScript tipovi
- **morfizmi identiteta** su svi kodirani jednom polimorfnom funkcijom `const identity = <A>(a: A): A => a`
- **kompozicija morfizama** je uobičajena kompozicija funkcija (koja je asocijativna)

Kao model TypeScript-a, kategorija _TS_ na prvi pogled može da deluje previše ograničeno: nema petlji, nema `if`, nema _skoro_ ničega... pa ipak, ovaj pojednostavljeni model je dovoljno bogat da ispuni naš glavni cilj: da rezonujemo o dobro definisanom pojmu kompozicije.

Sada kada imamo jednostavan model za naš programski jezik, pozabavimo se centralnim problemom kompozicije.

## Centralni problem kompozicije funkcija

U _TS_ možemo da komponujemo dve generičke funkcije `f: (a: A) => B` i `g: (c: C) => D` sve dok je `C = B`.

Ako je ovaj uslov ispunjen, možemo da koristimo funkcije `flow` (ili `pipe`):

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}

function pipe<A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C {
  return flow(f, g)(a)
}
```

Ali šta se dešava ako je `B != C`? Kako možemo da komponujemo dve funkcije sa takvim osobinama?

U narednim poglavljima videćemo pod kojim uslovima je takva kompozicija moguća.

**Spoiler**

- da bismo komponovali `f: (a: A) => B` sa `g: (b: B) => C`, potrebna nam je samo uobičajena kompozicija funkcija
- da bismo komponovali `f: (a: A) => F<B>` sa `g: (b: B) => C`, potrebna nam je instanca **funktora** za `F`
- da bismo komponovali `f: (a: A) => F<B>` sa `g: (b: B, c: C) => D`, potrebna nam je instanca **aplikativnog funktora** za `F`
- da bismo komponovali `f: (a: A) => F<B>` sa `g: (b: B) => F<C>`, potrebna nam je instanca **monade** za `F`

<img src="images/spoiler.png" width="900" alt="Četiri recepta za kompoziciju" />

Problem od kog smo krenuli na početku poglavlja odgovara situaciji ②, kada umesto generičkog `F` stavimo `Option`:

```ts
// A = ReadonlyArray<number>, B = number, F = Option
head: (as: ReadonlyArray<number>) => Option<number>
double: (n: number) => number
```

Da bismo ga rešili, u sledećem poglavlju govorićemo o funktorima.

# Funktori

U prethodnom poglavlju predstavljena je kategorija _TS_ (kategorija TypeScript-a) i centralni problem kompozicije funkcija:

> Kako možemo da komponujemo dve generičke funkcije `f: (a: A) => B` i `g: (c: C) => D`?

Ali zašto je toliko važno pronaći rešenja za ovaj problem?

Zato što, ako je tačno da se kategorije mogu koristiti za modelovanje programskih jezika, morfizmi (tj. funkcije u _TS_) mogu se koristiti za modelovanje **programa**.

Stoga rešavanje tog apstraktnog problema znači i pronalaženje načina da se **programi komponuju na generički način**.
A _to_ je zaista veoma zanimljivo za jednog programera, zar ne?

## Funkcije kao programi

Ako želimo da koristimo funkcije za modelovanje programa, odmah moramo da se suočimo sa jednim problemom:

> Kako je moguće čistom funkcijom modelovati program koji proizvodi sporedne efekte?

Odgovor je da se sporedni efekti modeluju pomoću onoga što nazivamo **efektima**, odnosno pomoću tipova koji **predstavljaju** sporedne efekte.

Pogledajmo dve moguće tehnike da se to uradi u JavaScript-u:

- definisati DSL (domain specific language) za efekte
- koristiti _thunk_-ove

Prva tehnika, dakle korišćenje DSL-a, znači izmeniti program kao što je:

```ts
const log = (message: string): void => {
  console.log(message) // sporedni efekat
}
```

menjajući njegov kodomen tako da postane funkcija koja vraća **opis** sporednog efekta:

```ts
type DSL = ... // tip sume svih mogućih efekata kojima upravlja sistem

const log = (message: string): DSL => {
  return { _tag: 'log', message } // efekat koji opisuje čin pisanja na konzolu
}
```

**Kviz** (JavaScript). Da li je upravo definisana funkcija `log` zaista čista? A ipak `log('foo') !== log('foo')`!

Ova prva tehnika pretpostavlja postojanje načina za kombinovanje efekata, kao i definiciju interpretera koji je u stanju da konkretno izvrši efekte kada želimo da pokrenemo konačni program.

Druga tehnika, jednostavnija i izvodljiva u TypeScript-u, jeste da se izračunavanje obavije u _thunk_:

```ts
// thunk koji predstavlja sinhroni sporedni efekat
type IO<A> = () => A

const log = (message: string): IO<void> => {
  return () => console.log(message) // vraća thunk
}
```

Program `log`, kada se izvrši, ne izaziva odmah sporedni efekat, već vraća **vrednost koja predstavlja izračunavanje**.

```ts
import { IO } from 'fp-ts/IO'

export const log = (message: string): IO<void> => {
  return () => console.log(message) // vraća thunk
}

export const main = log('hello!')
// u ovom trenutku ne vidim ništa na konzoli
// zato što je `main` samo inertna vrednost
// koja predstavlja izračunavanje

main()
// tek kada eksplicitno pokrenem program
// vidim rezultat na konzoli
```

U funkcionalnom programiranju sporedni efekti (u obliku efekata) obično se potiskuju na granice sistema (tj. u funkciju `main`),
gde se izvršavaju, pa se tako dobija sledeća šema:

> system = pure core + imperative shell

U _čisto funkcionalnim_ jezicima (kao što su Haskell, PureScript ili Elm) ova podela je jasna i nameće je sam jezik.

I uz ovu drugu tehniku (onu koju koristi `fp-ts`) potreban je način za kombinovanje efekata, što nas vraća našoj želji da programe komponujemo na generički način; pogledajmo kako se to radi.

Pre svega, malo (neformalne) terminologije: **čistim programom** nazivamo funkciju sa sledećim potpisom:

```
(a: A) => B
```

Takav potpis modeluje program koji prihvata ulaz tipa `A` i vraća rezultat tipa `B`, bez ikakvog efekta.

**Primer**

Program `len`:

```ts
const len = (s: string): number => s.length
```

**Programom sa efektima** nazivamo funkciju sa sledećim potpisom:

```
(a: A) => F<B>
```

za neki konstruktor tipa `F`.

Podsetimo se da je [konstruktor tipa](https://en.wikipedia.org/wiki/Type_constructor) `n`-arni operator na nivou tipova koji kao argument prima nula ili više tipova i vraća tip (primeri: `Option`, `ReadonlyArray`).

Takav potpis modeluje program koji prihvata ulaz tipa `A` i vraća rezultat tipa `B` zajedno sa **efektom** `F`.

**Primer**

Program `head`

```ts
import { Option, some, none } from 'fp-ts/Option'

const head = <A>(as: ReadonlyArray<A>): Option<A> =>
  as.length === 0 ? none : some(as[0])
```

je program sa efektom `Option`.

Kada govorimo o efektima, zanimaju nas `n`-arni konstruktori tipa sa `n >= 1`, na primer:

| Type constructor   | Effect (interpretation)                        |
| ------------------ | ---------------------------------------------- |
| `ReadonlyArray<A>` | a non deterministic computation                |
| `Option<A>`        | a computation that may fail                    |
| `Either<E, A>`     | a computation that may fail                    |
| `IO<A>`            | a synchronous computation that **never fails** |
| `Task<A>`          | an asynchronous computation **never fails**    |
| `Reader<R, A>`     | reading from an environment                    |

gde je

```ts
// thunk koji vraća `Promise`
type Task<A> = () => Promise<A>
```

```ts
// `R` represents an "environment" needed for the computation
// (we can "read" from it) and `A` is the result
type Reader<R, A> = (r: R) => A
```

Vratimo se sada našem glavnom problemu:

> Kako možemo da komponujemo dve generičke funkcije `f: (a: A) => B` i `g: (c: C) => D`?

Pošto opšti problem nije moguće rešiti, moramo da uvedemo neko **ograničenje** za `B` i `C`.

Već znamo da je, ako je `B = C`, rešenje uobičajena kompozicija funkcija

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}
```

Ali šta raditi u ostalim slučajevima?

## Ograničenje koje vodi do funktora

Razmotrimo sledeće ograničenje: `B = F<C>` za neki konstruktor tipa `F`; tako imamo sledeću situaciju:

- `f: (a: A) => F<B>` je program sa efektima
- `g: (b: B) => C` je čist program

Da bismo mogli da komponujemo `f` sa `g`, moramo da pronađemo postupak koji omogućava da se `g` pretvori iz funkcije `(b: B) => C` u funkciju `(fb: F<B>) => F<C>`, tako da možemo da koristimo običnu kompoziciju funkcija (naime, na taj način bi kodomen funkcije `f` bio isti skup koji je domen nove funkcije).

<img src="images/map.png" width="500" alt="map" />

Tako smo originalni problem pretvorili u novi i drugačiji: da li možemo da pronađemo funkciju, nazovimo je `map`, koja deluje na ovaj način?

Pogledajmo nekoliko praktičnih primera:

**Primer** (`F = ReadonlyArray`)

```ts
import { flow, pipe } from 'fp-ts/function'

// transformiše funkcije `B -> C` u funkcije `ReadonlyArray<B> -> ReadonlyArray<C>`
const map = <B, C>(g: (b: B) => C) => (
  fb: ReadonlyArray<B>
): ReadonlyArray<C> => fb.map(g)

// -------------------
// primer upotrebe
// -------------------

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers
const getName = (user: User): string => user.name

// getFollowersNames: User -> ReadonlyArray<string>
const getFollowersNames = flow(getFollowers, map(getName))

// ili, ako vam je draže da koristite `pipe` umesto `flow`...
export const getFollowersNames2 = (user: User) =>
  pipe(user, getFollowers, map(getName))

const user: User = {
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [
    { id: 2, name: 'Terry R. Emerson', followers: [] },
    { id: 3, name: 'Marsha J. Joslyn', followers: [] }
  ]
}

console.log(getFollowersNames(user)) // => [ 'Terry R. Emerson', 'Marsha J. Joslyn' ]
```

**Primer** (`F = Option`)

```ts
import { flow } from 'fp-ts/function'
import { none, Option, match, some } from 'fp-ts/Option'

// transformiše funkcije `B -> C` u funkcije `Option<B> -> Option<C>`
const map = <B, C>(g: (b: B) => C): ((fb: Option<B>) => Option<C>) =>
  match(
    () => none,
    (b) => {
      const c = g(b)
      return some(c)
    }
  )

// -------------------
// primer upotrebe
// -------------------

import * as RA from 'fp-ts/ReadonlyArray'

const head: (input: ReadonlyArray<number>) => Option<number> = RA.head
const double = (n: number): number => n * 2

// getDoubleHead: ReadonlyArray<number> -> Option<number>
const getDoubleHead = flow(head, map(double))

console.log(getDoubleHead([1, 2, 3])) // => some(2)
console.log(getDoubleHead([])) // => none
```

**Primer** (`F = IO`)

```ts
import { flow } from 'fp-ts/function'
import { IO } from 'fp-ts/IO'

// transformiše funkcije `B -> C` u funkcije `IO<B> -> IO<C>`
const map = <B, C>(g: (b: B) => C) => (fb: IO<B>): IO<C> => () => {
  const b = fb()
  return g(b)
}

// -------------------
// primer upotrebe
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// a dummy in memory database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): IO<User> => () => database[id]
const getName = (user: User): string => user.name

// getUserName: number -> IO<string>
const getUserName = flow(getUser, map(getName))

console.log(getUserName(1)()) // => Ruth R. Gonzalez
```

**Primer** (`F = Task`)

```ts
import { flow } from 'fp-ts/function'
import { Task } from 'fp-ts/Task'

// transformiše funkcije `B -> C` u funkcije `Task<B> -> Task<C>`
const map = <B, C>(g: (b: B) => C) => (fb: Task<B>): Task<C> => () => {
  const promise = fb()
  return promise.then(g)
}

// -------------------
// primer upotrebe
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// a dummy remote database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): Task<User> => () => Promise.resolve(database[id])
const getName = (user: User): string => user.name

// getUserName: number -> Task<string>
const getUserName = flow(getUser, map(getName))

getUserName(1)().then(console.log) // => Ruth R. Gonzalez
```

**Primer** (`F = Reader`)

```ts
import { flow } from 'fp-ts/function'
import { Reader } from 'fp-ts/Reader'

// transformiše funkcije `B -> C` u funkcije `Reader<R, B> -> Reader<R, C>`
const map = <B, C>(g: (b: B) => C) => <R>(fb: Reader<R, B>): Reader<R, C> => (
  r
) => {
  const b = fb(r)
  return g(b)
}

// -------------------
// primer upotrebe
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

interface Env {
  // a dummy in memory database
  readonly database: Record<string, User>
}

const getUser = (id: number): Reader<Env, User> => (env) => env.database[id]
const getName = (user: User): string => user.name

// getUserName: number -> Reader<Env, string>
const getUserName = flow(getUser, map(getName))

console.log(
  getUserName(1)({
    database: {
      1: { id: 1, name: 'Ruth R. Gonzalez' },
      2: { id: 2, name: 'Terry R. Emerson' },
      3: { id: 3, name: 'Marsha J. Joslyn' }
    }
  })
) // => Ruth R. Gonzalez
```

Uopšteno govoreći, kada za neki konstruktor tipa `F` postoji `map` koja deluje na ovaj način, kažemo da on ima **instancu funktora**.

Sa matematičke tačke gledišta, funktori su **preslikavanja između kategorija** koja čuvaju kategorijsku strukturu, odnosno čuvaju morfizme identiteta i operaciju kompozicije.

Pošto se kategorije sastoje od dve stvari (objekata i morfizama), i funktor se sastoji od dve stvari:

- **preslikavanja između objekata** koje svakom objektu `X` u _C_ pridružuje objekat `F<X>` u _D_
- **preslikavanja između morfizama** koje svakom morfizmu `f` u _C_ pridružuje morfizam `map(f)` u _D_

gde su _C_ i _D_ dve kategorije (alias dva programska jezika).

<img src="images/functor.png" width="500" alt="functor" />

Iako je preslikavanje između dva programska jezika intrigantna ideja, više nas zanima preslikavanje u kojem se _C_ i _D_ poklapaju (sa kategorijom _TS_). U tom slučaju govorimo o **endofunktorima** ("endo" znači "unutar", "unutrašnji").

Od sada, ako nije drugačije naznačeno, kada napišem "funktor" mislim na endofunktor u _TS_.

Sada kada znamo koji nas praktični aspekt funktora zanima, pogledajmo njihovu formalnu definiciju.

**Definicija**. Funktor je par `(F, map)` gde je:

- `F` `n`-arni (`n >= 1`) konstruktor tipa koji svaki tip `X` preslikava u tip `F<X>` (**preslikavanje između objekata**)
- `map` funkcija sa sledećim potpisom:

```ts
map: <A, B>(f: (a: A) => B) => ((fa: F<A>) => F<B>)
```

koja svaku funkciju `f: (a: A) => B` preslikava u funkciju `map(f): (fa: F<A>) => F<B>` (**preslikavanje između morfizama**)

Moraju da važe sledeći zakoni:

- `map(1`<sub>X</sub>`)` = `1`<sub>F(X)</sub> (**identiteti se preslikavaju u identitete**)
- `map(g ∘ f) = map(g) ∘ map(f)` (**slika kompozicije je kompozicija slika**)

Drugi zakon vam omogućava da refaktorisanjem optimizujete izračunavanje:

```ts
import { flow, increment, pipe } from 'fp-ts/function'
import { map } from 'fp-ts/ReadonlyArray'

const double = (n: number): number => n * 2

// dva prolaza kroz niz
console.log(pipe([1, 2, 3], map(double), map(increment))) // => [ 3, 5, 7 ]

// samo jedan prolaz kroz niz
console.log(pipe([1, 2, 3], map(flow(double, increment)))) // => [ 3, 5, 7 ]
```

## Funktori i funkcionalno rukovanje greškama

Funktori imaju pozitivan uticaj na funkcionalno rukovanje greškama; pogledajmo praktičan primer:

```ts
declare const doSomethingWithIndex: (index: number) => string

export const program = (ns: ReadonlyArray<number>): string => {
  // rezultat -1 označava da nijedan element nije pronađen
  const i = ns.findIndex((n) => n > 0)
  if (i !== -1) {
    return doSomethingWithIndex(i)
  }
  throw new Error('cannot find a positive number')
}
```

Kada koristimo nativni API `findIndex`, da bismo nastavili tok programa moramo da proverimo parcijalni rezultat pomoću `if` (pod uslovom da se toga setimo! Rezultat `findIndex` može nehotice da bude prosleđen kao ulaz funkciji `doSomethingWithIndex`).

Pogledajmo umesto toga kako se analogan rezultat može lakše postići korišćenjem `Option` i njegove instance funktora:

```ts
import { pipe } from 'fp-ts/function'
import { map, Option } from 'fp-ts/Option'
import { findIndex } from 'fp-ts/ReadonlyArray'

declare const doSomethingWithIndex: (index: number) => string

export const program = (ns: ReadonlyArray<number>): Option<string> =>
  pipe(
    ns,
    findIndex((n) => n > 0),
    map(doSomethingWithIndex)
  )
```

U praksi, kada koristimo `Option`, pred sobom uvek imamo _happy path_, a rukovanje greškom odvija se iza scene zahvaljujući njegovoj funkciji `map`.

**Kviz**. `Task<A>` predstavlja asinhrono izračunavanje koje ne može da se završi neuspehom; kako bismo onda modelovali asinhrono izračunavanje koje može da se završi neuspehom?

## Funktori se komponuju

Funktori se komponuju, tj. ako su data dva funktora `F` i `G`, onda je i kompozicija `F<G<A>>` funktor, a `map` kompozicije je kompozicija `map` funkcija.

**Primer** (`F = Task`, `G = Option`)

```ts
import { flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

type TaskOption<A> = T.Task<O.Option<A>>

export const map: <A, B>(
  f: (a: A) => B
) => (fa: TaskOption<A>) => TaskOption<B> = flow(O.map, T.map)

// -------------------
// primer upotrebe
// -------------------

interface User {
  readonly id: number
  readonly name: string
}

// a dummy remote database
const database: Record<number, User> = {
  1: { id: 1, name: 'Ruth R. Gonzalez' },
  2: { id: 2, name: 'Terry R. Emerson' },
  3: { id: 3, name: 'Marsha J. Joslyn' }
}

const getUser = (id: number): TaskOption<User> => () =>
  Promise.resolve(O.fromNullable(database[id]))
const getName = (user: User): string => user.name

// getUserName: number -> TaskOption<string>
const getUserName = flow(getUser, map(getName))

getUserName(1)().then(console.log) // => some('Ruth R. Gonzalez')
getUserName(4)().then(console.log) // => none
```

## Kontravarijantni funktori

Pre nego što nastavimo, želim da vam pokažem jednu varijantu koncepta funktora koji smo videli u prethodnom odeljku: **kontravarijantne funktore**.

Da budemo sasvim precizni, ono što smo do sada jednostavno nazivali "funktorima" trebalo bi ispravnije nazivati **kovarijantnim funktorima**.

Definicija kontravarijantnog funktora potpuno je analogna definiciji kovarijantnog funktora, osim potpisa njegove osnovne operacije (koja se naziva `contramap` umesto `map`)

<img src="images/contramap.png" width="300" alt="contramap" />

**Primer**

```ts
import { map } from 'fp-ts/Option'
import { contramap } from 'fp-ts/Eq'

type User = {
  readonly id: number
  readonly name: string
}

const getId = (_: User): number => _.id

// kako radi `map`...
// const getIdOption: (fa: Option<User>) => Option<number>
const getIdOption = map(getId)

// kako radi `contramap`...
// const getIdEq: (fa: Eq<number>) => Eq<User>
const getIdEq = contramap(getId)

import * as N from 'fp-ts/number'

const EqID = getIdEq(N.Eq)

/*

U poglavlju o `Eq` uradili smo:

const EqID: Eq<User> = pipe(
  N.Eq,
  contramap((_: User) => _.id)
)
*/
```

## Funktori u `fp-ts`

Kako da definišemo instancu funktora u `fp-ts`? Pogledajmo nekoliko praktičnih primera.

Sledeća deklaracija definiše model odgovora na poziv nekog API-ja:

```ts
interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}
```

Primetite da je polje `body` parametarsko; ta činjenica čini `Response` dobrim kandidatom za traženje instance funktora, pošto je `Response` `n`-arni konstruktor tipa sa `n >= 1` (neophodan uslov).

Da bismo mogli da definišemo instancu funktora za `Response`, moramo da definišemo funkciju `map` zajedno sa nekim [tehničkim detaljima](https://gcanti.github.io/fp-ts/recipes/HKT.html) koje zahteva `fp-ts`.

```ts
// `Response.ts` module

import { pipe } from 'fp-ts/function'
import { Functor1 } from 'fp-ts/Functor'

declare module 'fp-ts/HKT' {
  interface URItoKind<A> {
    readonly Response: Response<A>
  }
}

export interface Response<A> {
  readonly url: string
  readonly status: number
  readonly headers: Record<string, string>
  readonly body: A
}

export const map = <A, B>(f: (a: A) => B) => (
  fa: Response<A>
): Response<B> => ({
  ...fa,
  body: f(fa.body)
})

// functor instance for `Response<A>`
export const Functor: Functor1<'Response'> = {
  URI: 'Response',
  map: (fa, f) => pipe(fa, map(f))
}
```

## Da li funktori rešavaju centralni problem?

Još ne. Funktori nam omogućavaju da komponujemo program sa efektima `f` sa čistim programom `g`, ali `g` mora biti **unarna** funkcija, odnosno funkcija koja prihvata samo jedan argument. Šta se dešava ako `g` prihvata dva ili više argumenata?

| Program f | Program g               | Composition  |
| --------- | ----------------------- | ------------ |
| pure      | pure                    | `g ∘ f`      |
| effectful | pure (unary)            | `map(g) ∘ f` |
| effectful | pure (`n`-ary, `n > 1`) | ?            |

Da bismo izašli na kraj sa ovom situacijom, potrebno nam je nešto više; u sledećem poglavlju videćemo još jednu važnu apstrakciju funkcionalnog programiranja: **aplikativne funktore**.

# Aplikativni funktori

U odeljku o funktorima videli smo da možemo da komponujemo program sa efektima `f: (a: A) => F<B>` sa čistim programom `g: (b: B) => C` tako što `g` transformišemo u funkciju `map(g): (fb: F<B>) => F<C>`, pod uslovom da `F` ima instancu funktora.

| Program f | Program g    | Composition  |
| --------- | ------------ | ------------ |
| pure      | pure         | `g ∘ f`      |
| effectful | pure (unary) | `map(g) ∘ f` |

Međutim, `g` mora da bude unarna, odnosno mora da prima samo jedan ulazni parametar. Šta se dešava ako `g` prima dva parametra? Možemo li i dalje da transformišemo `g` koristeći samo instancu funktora?

## Currying

Pre svega, treba da modelujemo funkciju koja prima dva parametra, recimo tipa `B` i `C`, i vraća vrednost tipa `D`:

```ts
g: (b: B, c: C) => D
```

Možemo da prepišemo `g` koristeći tehniku koja se zove **currying**.

> Currying is the technique of translating the evaluation of a function that takes multiple parameters into evaluating a sequence of functions, **each with a single parameter**. For example, a function that takes two parameters, one from `B` and one from `C`, and produces outputs in `D`, by currying is translated into a function that takes a single parameter from `B` and produces as outputs functions from `C` to `D`.

(source: [currying on wikipedia.org](https://en.wikipedia.org/wiki/Currying))

Dakle, pomoću currying-a možemo da prepišemo `g` kao:

```ts
g: (b: B) => (c: C) => D
```

**Primer**

```ts
interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User, user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})
```

Prepišimo `addFollower` pomoću currying-a

```ts
interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

// -------------------
// primer upotrebe
// -------------------

const user: User = { id: 1, name: 'Ruth R. Gonzalez', followers: [] }
const follower: User = { id: 3, name: 'Marsha J. Joslyn', followers: [] }

console.log(addFollower(follower)(user))
/*
{
  id: 1,
  name: 'Ruth R. Gonzalez',
  followers: [ { id: 3, name: 'Marsha J. Joslyn', followers: [] } ]
}
*/
```

## Operacija `ap`

Pretpostavimo sada:

- da nemamo na raspolaganju `follower`, već samo njegov `id`
- da nemamo na raspolaganju `user`, već samo njegov `id`
- da imamo na raspolaganju API `fetchUser` koji, za dati `id`, poziva endpoint koji vraća odgovarajući `User`

```ts
import * as T from 'fp-ts/Task'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

declare const fetchUser: (id: number) => T.Task<User>

const userId = 1
const followerId = 3

const result = addFollower(fetchUser(followerId))(fetchUser(userId)) // ne kompajlira se!
```

Više ne mogu da koristim `addFollower`! Kako da nastavimo?

Kada bismo imali na raspolaganju funkciju sa sledećim potpisom:

```ts
declare const addFollowerAsync: (
  follower: T.Task<User>
) => (user: T.Task<User>) => T.Task<User>
```

mogli bismo lako da nastavimo:

```ts
import * as T from 'fp-ts/Task'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

declare const fetchUser: (id: number) => T.Task<User>

declare const addFollowerAsync: (
  follower: T.Task<User>
) => (user: T.Task<User>) => T.Task<User>

const userId = 1
const followerId = 3

// const result: T.Task<User>
const result = addFollowerAsync(fetchUser(followerId))(fetchUser(userId)) // sada se kompajlira
```

Naravno, možemo da pokušamo da ručno implementiramo `addFollowerAsync`, ali da li je umesto toga moguće pronaći transformaciju koja, polazeći od funkcije kao što je `addFollower: (follower: User) => (user: User): User`, vraća funkciju kao što je `addFollowerAsync: (follower: Task<User>) => (user: Task<User>) => Task<User>`?

Uopštenije, ono što bismo želeli jeste transformacija, nazovimo je `liftA2`, koja polazeći od funkcije `g: (b: B) => (c: C) => D` vraća funkciju sa sledećim potpisom:

```ts
liftA2(g): (fb: F<B>) => (fc: F<C>) => F<D>
```

<img src="images/liftA2.png" width="500" alt="liftA2" />

Kako da je dobijemo? Pošto je `g` sada unarna, možemo da iskoristimo instancu funktora i našu staru funkciju `map`:

```ts
map(g): (fb: F<B>) => F<(c: C) => D>
```

<img src="images/liftA2-first-step.png" width="500" alt="liftA2 (first step)" />

Ali sada smo zaglavljeni: instanca funktora ne pruža nijednu legalnu operaciju koja bi nam omogućila da "raspakujemo" tip `F<(c: C) => D>` u tip `(fc: F<C>) => F<D>`.

Zato uvodimo novu operaciju `ap` koja ostvaruje to raspakivanje:

```ts
declare const ap: <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>) => Task<B>
```

**Napomena**. Zašto baš ime "ap"? Zato što se može posmatrati kao neka vrsta primene funkcije

```ts
// `apply` primenjuje funkciju na vrednost
declare const apply: <A>(a: A) => <B>(f: (a: A) => B) => B

declare const ap: <A>(a: Task<A>) => <B>(f: Task<(a: A) => B>) => Task<B>
// `ap` primenjuje funkciju upakovanu u efekat na vrednost upakovanu u efekat
```

Sada, kada imamo operaciju `ap`, možemo da definišemo `liftA2`:

```ts
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA2 = <B, C, D>(g: (b: B) => (c: C) => D) => (fb: T.Task<B>) => (
  fc: T.Task<C>
): T.Task<D> => pipe(fb, T.map(g), T.ap(fc))

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

// const addFollowerAsync: (fb: T.Task<User>) => (fc: T.Task<User>) => T.Task<User>
const addFollowerAsync = liftA2(addFollower)
```

i na kraju, da komponujemo `fetchUser` sa prethodnim rezultatom:

```ts
import { flow, pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA2 = <B, C, D>(g: (b: B) => (c: C) => D) => (fb: T.Task<B>) => (
  fc: T.Task<C>
): T.Task<D> => pipe(fb, T.map(g), T.ap(fc))

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const addFollower = (follower: User) => (user: User): User => ({
  ...user,
  followers: [...user.followers, follower]
})

declare const fetchUser: (id: number) => T.Task<User>

// const program: (id: number) => (fc: T.Task<User>) => T.Task<User>
const program = flow(fetchUser, liftA2(addFollower))

const userId = 1
const followerId = 3

// const result: T.Task<User>
const result = program(followerId)(fetchUser(userId))
```

Pronašli smo standardnu proceduru za kompoziciju dve funkcije `f: (a: A) => F<B>`, `g: (b: B, c: C) => D`:

1. `g` se pomoću currying-a transformiše u funkciju `g: (b: B) => (c: C) => D`
2. definiše se funkcija `ap` za efekat `F` (bibliotečka funkcija)
3. definiše se pomoćna (utility) funkcija `liftA2` za efekat `F` (bibliotečka funkcija)
4. kompozicija se dobija pomoću `flow(f, liftA2(g))`

Pogledajmo kako je definisana operacija `ap` za neke već poznate konstruktore tipa:

**Primer** (`F = ReadonlyArray`)

```ts
import { increment, pipe } from 'fp-ts/function'

const ap = <A>(fa: ReadonlyArray<A>) => <B>(
  fab: ReadonlyArray<(a: A) => B>
): ReadonlyArray<B> => {
  const out: Array<B> = []
  for (const f of fab) {
    for (const a of fa) {
      out.push(f(a))
    }
  }
  return out
}

const double = (n: number): number => n * 2

pipe([double, increment], ap([1, 2, 3]), console.log) // => [ 2, 4, 6, 2, 3, 4 ]
```

**Primer** (`F = Option`)

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

const ap = <A>(fa: O.Option<A>) => <B>(
  fab: O.Option<(a: A) => B>
): O.Option<B> =>
  pipe(
    fab,
    O.match(
      () => O.none,
      (f) =>
        pipe(
          fa,
          O.match(
            () => O.none,
            (a) => O.some(f(a))
          )
        )
    )
  )

const double = (n: number): number => n * 2

pipe(O.some(double), ap(O.some(1)), console.log) // => some(2)
pipe(O.some(double), ap(O.none), console.log) // => none
pipe(O.none, ap(O.some(1)), console.log) // => none
pipe(O.none, ap(O.none), console.log) // => none
```

**Primer** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO'

const ap = <A>(fa: IO<A>) => <B>(fab: IO<(a: A) => B>): IO<B> => () => {
  const f = fab()
  const a = fa()
  return f(a)
}
```

**Primer** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task'

const ap = <A>(fa: Task<A>) => <B>(fab: Task<(a: A) => B>): Task<B> => () =>
  Promise.all([fab(), fa()]).then(([f, a]) => f(a))
```

**Primer** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader'

const ap = <R, A>(fa: Reader<R, A>) => <B>(
  fab: Reader<R, (a: A) => B>
): Reader<R, B> => (r) => {
  const f = fab(r)
  const a = fa(r)
  return f(a)
}
```

Videli smo da pomoću `ap` možemo da radimo sa funkcijama koje imaju dva parametra, ali šta se dešava sa funkcijama koje primaju **tri** parametra? Da li nam je potrebna _još jedna apstrakcija_?

Dobra vest je da je odgovor ne, `map` + `ap` su dovoljni:

```ts
import { pipe } from 'fp-ts/function'
import * as T from 'fp-ts/Task'

const liftA3 = <B, C, D, E>(f: (b: B) => (c: C) => (d: D) => E) => (
  fb: T.Task<B>
) => (fc: T.Task<C>) => (fd: T.Task<D>): T.Task<E> =>
  pipe(fb, T.map(f), T.ap(fc), T.ap(fd))

const liftA4 = <B, C, D, E, F>(
  f: (b: B) => (c: C) => (d: D) => (e: E) => F
) => (fb: T.Task<B>) => (fc: T.Task<C>) => (fd: T.Task<D>) => (
  fe: T.Task<E>
): T.Task<F> => pipe(fb, T.map(f), T.ap(fc), T.ap(fd), T.ap(fe))

// itd...
```

Sada možemo da ažuriramo našu "tabelu kompozicije":

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

## Operacija `of`

Sada znamo da, ako imamo dve funkcije `f: (a: A) => F<B>`, `g: (b: B, c: C) => D`, možemo da dobijemo njihovu kompoziciju `h`:

```ts
h: (a: A) => (fc: F<C>) => F<D>
```

Da bismo izvršili `h`, potrebna nam je, dakle, vrednost tipa `A` i vrednost tipa `F<C>`.

Ali šta se dešava ako umesto vrednosti tipa `F<C>` za drugi parametar `fc` imamo na raspolaganju samo vrednost tipa `C`?

Bila bi korisna operacija koja može da transformiše vrednost tipa `C` u vrednost tipa `F<C>`, tako da zatim možemo da koristimo `h`.

Zato uvodimo takvu operaciju, nazvanu `of` (mogući sinonimi su **pure**, **return**):

```ts
declare const of: <C>(c: C) => F<C>
```

U literaturi se o **aplikativnim funktorima** govori za konstruktore tipa koji, pored `map`, podržavaju i obe operacije `ap` i `of`.

Pogledajmo kako je definisana operacija `of` za neke poznate konstruktore tipa:

**Primer** (`F = ReadonlyArray`)

```ts
const of = <A>(a: A): ReadonlyArray<A> => [a]
```

**Primer** (`F = Option`)

```ts
import * as O from 'fp-ts/Option'

const of = <A>(a: A): O.Option<A> => O.some(a)
```

**Primer** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO'

const of = <A>(a: A): IO<A> => () => a
```

**Primer** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task'

const of = <A>(a: A): Task<A> => () => Promise.resolve(a)
```

**Primer** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader'

const of = <R, A>(a: A): Reader<R, A> => () => a
```

## Aplikativni funktori se komponuju

Aplikativni funktori se komponuju, odnosno, za data dva aplikativna funktora `F` i `G`, njihova kompozicija `F<G<A>>` je i dalje aplikativni funktor.

**Primer** (`F = Task`, `G = Option`)

Operacija `of` kompozicije je kompozicija operacija `of`:

```ts
import { flow } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as T from 'fp-ts/Task'

type TaskOption<A> = T.Task<O.Option<A>>

const of: <A>(a: A) => TaskOption<A> = flow(O.of, T.of)
```

a operacija `ap` kompozicije dobija se po sledećem obrascu:

```ts
const ap = <A>(
  fa: TaskOption<A>
): (<B>(fab: TaskOption<(a: A) => B>) => TaskOption<B>) =>
  flow(
    T.map((gab) => (ga: O.Option<A>) => O.ap(ga)(gab)),
    T.ap(fa)
  )
```

## Da li aplikativni funktori rešavaju centralni problem?

Još ne. Preostaje još jedan, poslednji važan slučaj koji treba razmotriti: kada **oba** programa imaju efekte.

Još jednom nam je potrebno nešto više; u sledećem poglavlju govorićemo o jednoj od najvažnijih apstrakcija u funkcionalnom programiranju: o **monadama**.

# Monade

<center>
<img src="images/moggi.jpg" width="300" alt="Heinrich Kleisli" />

(Eugenio Moggi is a professor of computer science at the University of Genoa, Italy. He first described the general use of monads to structure programs)

<img src="images/wadler.jpg" width="300" alt="Heinrich Kleisli" />

(Philip Lee Wadler is an American computer scientist known for his contributions to programming language design and type theory)

</center>

U prethodnom poglavlju videli smo da možemo da komponujemo program sa efektima `f: (a: A) => F<B>` sa čistim `n`-arnim programom `g`, pod uslovom da `F` ima instancu aplikativnog funktora:

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |

Međutim, moramo da rešimo još jedan, poslednji (i čest) slučaj: kada **oba** programa imaju efekat:

```ts
f: (a: A) => F<B>
g: (b: B) => F<C>
```

Šta je kompozicija funkcija `f` i `g`?

## Problem ugnežđenih konteksta

Da bismo bolje pokazali zašto nam je potrebno nešto više, pogledajmo nekoliko primera.

**Primer** (`F = Array`)

Pretpostavimo da želimo da dobijemo pratioce pratilaca (followers of followers):

```ts
import { pipe } from 'fp-ts/function'
import * as A from 'fp-ts/ReadonlyArray'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers

declare const user: User

// followersOfFollowers: ReadonlyArray<ReadonlyArray<User>>
const followersOfFollowers = pipe(user, getFollowers, A.map(getFollowers))
```

Nešto nije u redu: `followersOfFollowers` ima tip `ReadonlyArray<ReadonlyArray<User>>`, a mi bismo želeli `ReadonlyArray<User>`.

Potrebno je da izravnamo (**flatten**) ugnežđene nizove.

Funkcija `flatten: <A>(mma: ReadonlyArray<ReadonlyArray<A>>) => ReadonlyArray<A>` koju izvozi modul `fp-ts/ReadonlyArray` upravo je ono što nam treba:

```ts
// followersOfFollowers: ReadonlyArray<User>
const followersOfFollowers = pipe(
  user,
  getFollowers,
  A.map(getFollowers),
  A.flatten
)
```

Odlično! Pogledajmo sada neku drugu strukturu podataka.

**Primer** (`F = Option`)

Pretpostavimo da želimo da izračunamo recipročnu vrednost prvog elementa niza brojeva:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n)

// inverseHead: O.Option<O.Option<number>>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse))
```

Ups, opet se desilo: `inverseHead` ima tip `Option<Option<number>>`, a mi želimo `Option<number>`.

Potrebno je da izravnamo ugnežđene `Option` vrednosti.

Funkcija `flatten: <A>(mma: Option<Option<A>>) => Option<A>` koju izvozi modul `fp-ts/Option` upravo je ono što nam treba:

```ts
// inverseHead: O.Option<number>
const inverseHead = pipe([1, 2, 3], A.head, O.map(inverse), O.flatten)
```

Sve te funkcije `flatten`... Nisu slučajnost, iza kulisa se krije funkcionalni obrazac: oba konstruktora tipa, `ReadonlyArray` i `Option` (i mnogi drugi), imaju **instancu monade**, a

> `flatten` is the most peculiar operation of monads

**Napomena**. Mogući sinonim za `flatten` je **join**.

Dakle, šta je monada?

Evo kako se monade često predstavljaju...

## Definicija monade

**Definicija**. Monada je definisana sa tri stvari:

(1) konstruktorom tipa `M` koji ima instancu funktora

(2) funkcijom `of` (mogući sinonimi su **pure**, **return**) sa sledećim potpisom:

```ts
of: <A>(a: A) => M<A>
```

(3) funkcijom `chain` (mogući sinonimi su **flatMap**, **bind**) sa sledećim potpisom:

```ts
chain: <A, B>(f: (a: A) => M<B>) => (ma: M<A>) => M<B>
```

Funkcije `of` i `chain` moraju da poštuju tri zakona:

- `chain(of) ∘ f = f` (**Left identity**)
- `chain(f) ∘ of = f` (**Right identity**)
- `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` (**Associativity**)

gde su `f`, `g`, `h` funkcije sa efektom `M`, a `∘` je uobičajena kompozicija funkcija.

Pri prvom susretu sa ovom definicijom u glavi mi se rojilo mnogo pitanja:

- zašto baš te dve operacije, `of` i `chain`? I zašto imaju baš takav potpis?
- zašto sinonimi "pure" i "flatMap"?
- zašto moraju da važe ti zakoni? Šta oni znače?
- ako je `flatten` toliko važan za monade, zašto se ne pojavljuje u njihovoj definiciji?

Ovo poglavlje će pokušati da odgovori na sva ta pitanja.

Vratimo se sada našem centralnom problemu: šta je kompozicija dve funkcije sa efektom, `f` i `g`?

<img src="images/kleisli_arrows.png" alt="two Kleisli arrows, what's their composition?" width="450px" />

<center>(dve Kleisli strelice)</center>

**Napomena**. Funkcija sa efektom naziva se i **Kleisli strelica** (**Kleisli arrow**).

Za sada ne znam čak ni koji **tip** takva kompozicija ima.

Samo trenutak... već smo se sreli sa apstrakcijom koja govori upravo o kompoziciji. Sećate li se šta smo rekli o kategorijama?

> Categories capture the essence of composition

Možemo li da pretvorimo naš problem u kategorijski problem, odnosno: možemo li da pronađemo kategoriju koja modeluje kompoziciju Kleisli strelica?

## Kleisli kategorija

<center>
<img src="images/kleisli.jpg" width="300" alt="Heinrich Kleisli" />

(Heinrich Kleisli, Swiss mathematician)

</center>

Pokušajmo da konstruišemo kategoriju _K_ (koja se zove **Kleisli kategorija**) koja sadrži _samo_ Kleisli strelice:

- **objekti** su isti objekti kao u kategoriji _TS_, odnosno svi TypeScript tipovi.
- **morfizmi** se konstruišu ovako: svaki put kada u _TS_ postoji Kleisli strelica `f: A ⟼ M<B>`, u _K_ crtamo strelicu `f': A ⟼ B`

<center>
<img src="images/kleisli_category.png" alt="above the TS category, below the K construction" width="400px" />

(gore kategorija _TS_, dole konstrukcija _K_)

</center>

Dakle, šta bi bila kompozicija `f` i `g` u _K_? To je crvena strelica nazvana `h'` na slici ispod:

<center>
<img src="images/kleisli_composition.png" alt="above the composition in the TS category, below the composition in the K construction" width="400px" />

(gore kategorija _TS_, dole konstrukcija _K_)

</center>

Pošto je `h'` strelica koja ide od `A` do `C` u `K`, možemo da joj pridružimo funkciju `h` koja ide od `A` do `M<C>` u `TS`.

Dakle, dobar kandidat za kompoziciju `f` i `g` u _TS_ je ponovo Kleisli strelica sa sledećim potpisom: `(a: A) => M<C>`.

Kako konkretno da konstruišemo takvu funkciju? Pa, hajde da pokušamo!

## Definicija operacije `chain` korak po korak

Tačka (1) definicije monade kaže nam da `M` ima instancu funktora, pa možemo da iskoristimo `map` da transformišemo funkciju `g: (b: B) => M<C>` u funkciju `map(g): (mb: M<B>) => M<M<C>>`

<center>
<img src="images/flatMap.png" alt="where chain comes from" width="450px" />

(kako dobiti funkciju `h`)

</center>

Ali sada smo zaglavljeni: instanca funktora nema nijednu legalnu operaciju koja bi nam omogućila da izravnamo vrednost tipa `M<M<C>>` u vrednost tipa `M<C>`; potrebna nam je dodatna operacija, nazovimo je `flatten`.

Ako uspemo da definišemo takvu operaciju, onda možemo da dobijemo kompoziciju koju smo tražili:

```
h = flatten ∘ map(g) ∘ f
```

Ali čekajte... kada skratimo `flatten ∘ map(g)`, dobijamo "flatMap", eto odakle potiče ime!

Dakle, `chain` možemo da dobijemo na ovaj način

```
chain = flatten ∘ map(g)
```

<center>
<img src="images/chain.png" alt="kako `chain` deluje na funkciju `g`" width="400px" />

(kako `chain` deluje na funkciju `g`)

</center>

Sada možemo da ažuriramo našu "tabelu kompozicije"

| Program f | Program g     | Composition     |
| --------- | ------------- | --------------- |
| pure      | pure          | `g ∘ f`         |
| effectful | pure (unary)  | `map(g) ∘ f`    |
| effectful | pure, `n`-ary | `liftAn(g) ∘ f` |
| effectful | effectful     | `chain(g) ∘ f`  |

A šta je sa operacijom `of`? Pa, `of` potiče od morfizama identiteta u _K_: za svaki morfizam identiteta 1<sub>A</sub> u _K_ mora da postoji odgovarajuća funkcija od `A` do `M<A>` (odnosno `of: <A>(a: A) => M<A>`).

<center>
<img src="images/of.png" alt="where of comes from" width="300px" />

(kako dobiti `of`)

</center>

Činjenica da je `of` neutralni element u odnosu na `chain` omogućava ovakvu (prilično čestu) kontrolu toka:

```ts
pipe(
  mb,
  M.chain((b) => (predicate(b) ? M.of(b) : g(b)))
)
```

gde je `predicate: (b: B) => boolean`, `mb: M<B>` i `g: (b: B) => M<B>`.

Poslednje pitanje: odakle potiču zakoni? Oni nisu ništa drugo nego zakoni kategorije _K_ prevedeni u _TS_:

| Law            | _K_                               | _TS_                                                    |
| -------------- | --------------------------------- | ------------------------------------------------------- |
| Left identity  | 1<sub>B</sub> ∘ `f'` = `f'`       | `chain(of) ∘ f = f`                                     |
| Right identity | `f'` ∘ 1<sub>A</sub> = `f'`       | `chain(f) ∘ of = f`                                     |
| Associativity  | `h' ∘ (g' ∘ f') = (h' ∘ g') ∘ f'` | `chain(h) ∘ (chain(g) ∘ f) = chain((chain(h) ∘ g)) ∘ f` |

Ako se sada vratimo na primere koji su pokazivali problem sa ugnežđenim kontekstima, možemo da ih rešimo pomoću `chain`:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as A from 'fp-ts/ReadonlyArray'

interface User {
  readonly id: number
  readonly name: string
  readonly followers: ReadonlyArray<User>
}

const getFollowers = (user: User): ReadonlyArray<User> => user.followers

declare const user: User

const followersOfFollowers: ReadonlyArray<User> = pipe(
  user,
  getFollowers,
  A.chain(getFollowers)
)

const inverse = (n: number): O.Option<number> =>
  n === 0 ? O.none : O.some(1 / n)

const inverseHead: O.Option<number> = pipe([1, 2, 3], A.head, O.chain(inverse))
```

Pogledajmo kako je definisana operacija `chain` za neke poznate konstruktore tipa:

**Primer** (`F = ReadonlyArray`)

```ts
// transformiše funkcije `B -> ReadonlyArray<C>` u funkcije `ReadonlyArray<B> -> ReadonlyArray<C>`
const chain = <B, C>(g: (b: B) => ReadonlyArray<C>) => (
  mb: ReadonlyArray<B>
): ReadonlyArray<C> => {
  const out: Array<C> = []
  for (const b of mb) {
    out.push(...g(b))
  }
  return out
}
```

**Primer** (`F = Option`)

```ts
import { match, none, Option } from 'fp-ts/Option'

// transformiše funkcije `B -> Option<C>` u funkcije `Option<B> -> Option<C>`
const chain = <B, C>(g: (b: B) => Option<C>): ((mb: Option<B>) => Option<C>) =>
  match(() => none, g)
```

**Primer** (`F = IO`)

```ts
import { IO } from 'fp-ts/IO'

// transformiše funkcije `B -> IO<C>` u funkcije `IO<B> -> IO<C>`
const chain = <B, C>(g: (b: B) => IO<C>) => (mb: IO<B>): IO<C> => () =>
  g(mb())()
```

**Primer** (`F = Task`)

```ts
import { Task } from 'fp-ts/Task'

// transformiše funkcije `B -> Task<C>` u funkcije `Task<B> -> Task<C>`
const chain = <B, C>(g: (b: B) => Task<C>) => (mb: Task<B>): Task<C> => () =>
  mb().then((b) => g(b)())
```

**Primer** (`F = Reader`)

```ts
import { Reader } from 'fp-ts/Reader'

// transformiše funkcije `B -> Reader<R, C>` u funkcije `Reader<R, B> -> Reader<R, C>`
const chain = <B, R, C>(g: (b: B) => Reader<R, C>) => (
  mb: Reader<R, B>
): Reader<R, C> => (r) => g(mb(r))(r)
```

## Manipulacija programima

Pogledajmo sada kako, zahvaljujući referencijalnoj transparentnosti i pojmu monade, možemo programski da manipulišemo programima.

Evo malog programa koji čita iz fajla / piše u fajl:

```ts
import { log } from 'fp-ts/Console'
import { IO, chain } from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'
import * as fs from 'fs'

// -----------------------------------------
// bibliotečke funkcije
// -----------------------------------------

const readFile = (filename: string): IO<string> => () =>
  fs.readFileSync(filename, 'utf-8')

const writeFile = (filename: string, data: string): IO<void> => () =>
  fs.writeFileSync(filename, data, { encoding: 'utf-8' })

// API izveden iz prethodnih
const modifyFile = (filename: string, f: (s: string) => string): IO<void> =>
  pipe(
    readFile(filename),
    chain((s) => writeFile(filename, f(s)))
  )

// -----------------------------------------
// program
// -----------------------------------------

const program1 = pipe(
  readFile('file.txt'),
  chain(log),
  chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
  chain(() => readFile('file.txt')),
  chain(log)
)
```

Akcija:

```ts
pipe(readFile('file.txt'), chain(log))
```

ponavlja se dva puta u programu, ali pošto važi referencijalna transparentnost, možemo da je izdvojimo kao zajednički deo tako što ćemo je dodeliti konstanti:

```ts
const read = pipe(readFile('file.txt'), chain(log))
const modify = modifyFile('file.txt', (s) => s + '\n// eof')

const program2 = pipe(
  read,
  chain(() => modify),
  chain(() => read)
)
```

Možemo čak da definišemo kombinator i da ga iskoristimo da bi kod bio kompaktniji:

```ts
const interleave = <A, B>(action: IO<A>, middle: IO<B>): IO<A> =>
  pipe(
    action,
    chain(() => middle),
    chain(() => action)
  )

const program3 = interleave(read, modify)
```

Još jedan primer: implementirati za `IO` funkciju sličnu Unix komandi `time` (deo koji se odnosi na stvarno vreme izvršavanja).

```ts
import * as IO from 'fp-ts/IO'
import { now } from 'fp-ts/Date'
import { log } from 'fp-ts/Console'
import { pipe } from 'fp-ts/function'

// loguje trajanje izračunavanja u milisekundama
export const time = <A>(ma: IO.IO<A>): IO.IO<A> =>
  pipe(
    now,
    IO.chain((startMillis) =>
      pipe(
        ma,
        IO.chain((a) =>
          pipe(
            now,
            IO.chain((endMillis) =>
              pipe(
                log(`Elapsed: ${endMillis - startMillis}`),
                IO.map(() => a)
              )
            )
          )
        )
      )
    )
  )
```

**Ekskurs**. Kao što možete da primetite, korišćenje `chain` kada treba sačuvati opseg (scope) dovodi do opširnog koda.
U jezicima koji nativno podržavaju monadički stil obično postoje sintaksne konstrukcije koje
nose naziv "do notation" i koje olakšavaju ovakve situacije.

Pogledajmo primer u Haskell-u

```haskell
now :: IO Int
now = undefined -- korišćenje `undefined` je Haskell ekvivalent korišćenja `declare` u TypeScript-u

log :: String -> IO ()
log = undefined

time :: IO a -> IO a
time ma = do
  startMillis <- now
  a <- ma
  endMillis <- now
  log ("Elapsed:" ++ show (endMillis - startMillis))
  return a
```

U TypeScript-u nemamo nijednu takvu konstrukciju, ali se može simulirati nešto slično:

```ts
import { log } from 'fp-ts/Console'
import { now } from 'fp-ts/Date'
import { pipe } from 'fp-ts/function'
import * as IO from 'fp-ts/IO'

// loguje trajanje izračunavanja u milisekundama
export const time = <A>(ma: IO.IO<A>): IO.IO<A> =>
  pipe(
    IO.Do,
    IO.bind('startMillis', () => now),
    IO.bind('a', () => ma),
    IO.bind('endMillis', () => now),
    IO.chainFirst(({ endMillis, startMillis }) =>
      log(`Elapsed: ${endMillis - startMillis}`)
    ),
    IO.map(({ a }) => a)
  )
```

Pogledajmo sada primer upotrebe kombinatora `time`:

```ts
import { randomInt } from 'fp-ts/Random'
import { Monoid, concatAll } from 'fp-ts/Monoid'
import { replicate } from 'fp-ts/ReadonlyArray'

const fib = (n: number): number => (n <= 1 ? 1 : fib(n - 1) + fib(n - 2))

// pokreće `fib` sa slučajnim celim brojem između 30 i 35
// i loguje i ulaz i izlaz
const randomFib: IO.IO<void> = pipe(
  randomInt(30, 35),
  IO.chain((n) => log([n, fib(n)]))
)

// instanca monoida za `IO<void>`
const MonoidIO: Monoid<IO.IO<void>> = {
  concat: (first, second) => () => {
    first()
    second()
  },
  empty: IO.of(undefined)
}

// izvršava izračunavanje `mv` `n` puta
const replicateIO = (n: number, mv: IO.IO<void>): IO.IO<void> =>
  concatAll(MonoidIO)(replicate(n, mv))

// -------------------
// primer upotrebe
// -------------------

time(replicateIO(3, randomFib))()
/*
[ 31, 2178309 ]
[ 33, 5702887 ]
[ 30, 1346269 ]
Elapsed: 89
*/
```

Uz ispisivanje i međurezultata

```ts
time(replicateIO(3, time(randomFib)))()
/*
[ 33, 5702887 ]
Elapsed: 54
[ 30, 1346269 ]
Elapsed: 13
[ 32, 3524578 ]
Elapsed: 39
Elapsed: 106
*/
```

Jedna zanimljiva stvar u radu sa monadičkim interfejsom (`map`, `of`, `chain`) jeste mogućnost da ubrizgamo zavisnosti koje su programu potrebne, uključujući i **način na koji se nadovezuju različita izračunavanja**.

Da bismo to videli, vratimo se malom programu koji čita iz fajla i piše u fajl i izvedimo sledeće refaktorisanje:

```ts
import { IO } from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

// -----------------------------------------
// zavisnosti ("port" u nomenklaturi Hexagonal Architecture)
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => IO<string>
  readonly writeFile: (filename: string, data: string) => IO<void>
  readonly log: <A>(a: A) => IO<void>
  readonly chain: <A, B>(f: (a: A) => IO<B>) => (ma: IO<A>) => IO<B>
}

// -----------------------------------------
// program
// -----------------------------------------

const program4 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log)
  )
}

// -----------------------------------------
// instanca za `Deps` ("adapter" u nomenklaturi Hexagonal Architecture)
// -----------------------------------------

import * as fs from 'fs'
import { log } from 'fp-ts/Console'
import { chain } from 'fp-ts/IO'

const DepsSync: Deps = {
  readFile: (filename) => () => fs.readFileSync(filename, 'utf-8'),
  writeFile: (filename: string, data: string) => () =>
    fs.writeFileSync(filename, data, { encoding: 'utf-8' }),
  log,
  chain
}

// dependency injection
program4(DepsSync)()
```

Instanca `DepsSync` je "produkciona" (čita i piše po pravom fajl sistemu), ali je relativno jednostavno definisati instancu pogodnu za proveru ponašanja programa i za pisanje testova:

```ts
import { log } from 'fp-ts/Console'
import { chain, of } from 'fp-ts/IO'

// test instanca
const DepsTest: Deps = {
  readFile: (filename) =>
    pipe(
      log(`calling readFile(${filename})...`),
      chain(() => of('content'))
    ),
  writeFile: (filename: string, data: string) =>
    log(`calling writeFile(${filename}, ${data})...`),
  log: (message) => log(`calling log(${message})...`),
  chain
}

program4(DepsTest)()
/*
calling readFile(file.txt)...
calling log(content)...
calling readFile(file.txt)...
calling writeFile(file.txt, content
// eof)...
calling readFile(file.txt)...
calling log(content)...
*/
```

Ali to nije sve: možemo čak da apstrahujemo i efekat u kome se program izvršava. Definišimo sopstveni efekat `FileSystem` (efekat čitanja / pisanja po fajl sistemu):

```ts
import { IO } from 'fp-ts/IO'
import { pipe } from 'fp-ts/function'

// -----------------------------------------
// efekat našeg programa
// -----------------------------------------

interface FileSystem<A> extends IO<A> {}

// -----------------------------------------
// zavisnosti
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>
  readonly writeFile: (filename: string, data: string) => FileSystem<void>
  readonly log: <A>(a: A) => FileSystem<void>
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>
  ) => (ma: FileSystem<A>) => FileSystem<B>
}

// -----------------------------------------
// program
// -----------------------------------------

const program4 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log)
  )
}
```

Sada, jednostavnom izmenom definicije efekta `FileSystem`, možemo da izmenimo program tako da može da se izvršava u asinhronom kontekstu:

```diff
// -----------------------------------------
// efekat našeg programa
// -----------------------------------------

-interface FileSystem<A> extends IO<A> {}
+interface FileSystem<A> extends Task<A> {}
```

nakon čega nam preostaje samo da izmenimo instancu za `Deps` kako bi se prilagodila novoj definiciji:

```ts
import { Task } from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'

// -----------------------------------------
// efekat našeg programa (izmenjeno)
// -----------------------------------------

interface FileSystem<A> extends Task<A> {}

// -----------------------------------------
// zavisnosti (NIJE izmenjeno)
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>
  readonly writeFile: (filename: string, data: string) => FileSystem<void>
  readonly log: <A>(a: A) => FileSystem<void>
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>
  ) => (ma: FileSystem<A>) => FileSystem<B>
}

// -----------------------------------------
// program (NIJE izmenjeno)
// -----------------------------------------

const program5 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return pipe(
    D.readFile('file.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log)
  )
}

// -----------------------------------------
// instanca za `Deps` (izmenjeno)
// -----------------------------------------

import * as fs from 'fs'
import { log } from 'fp-ts/Console'
import { chain, fromIO } from 'fp-ts/Task'

const DepsAsync: Deps = {
  readFile: (filename) => () =>
    new Promise((resolve) =>
      fs.readFile(filename, { encoding: 'utf-8' }, (_, s) => resolve(s))
    ),
  writeFile: (filename: string, data: string) => () =>
    new Promise((resolve) => fs.writeFile(filename, data, () => resolve())),
  log: (a) => fromIO(log(a)),
  chain
}

// dependency injection
program5(DepsAsync)()
```

**Kviz**. Prethodni primeri (namerno) ne uzimaju u obzir moguće greške (na primer, to da fajl iz kog čitamo ne postoji). Kako bi se efekat `FileSystem` mogao izmeniti da bi ih uzeo u obzir?

```ts
import { Task } from 'fp-ts/Task'
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'

// -----------------------------------------
// efekat našeg programa (izmenjeno)
// -----------------------------------------

interface FileSystem<A> extends Task<E.Either<Error, A>> {}

// -----------------------------------------
// zavisnosti (NIJE izmenjeno)
// -----------------------------------------

interface Deps {
  readonly readFile: (filename: string) => FileSystem<string>
  readonly writeFile: (filename: string, data: string) => FileSystem<void>
  readonly log: <A>(a: A) => FileSystem<void>
  readonly chain: <A, B>(
    f: (a: A) => FileSystem<B>
  ) => (ma: FileSystem<A>) => FileSystem<B>
}

// -----------------------------------------
// program (NIJE izmenjeno)
// -----------------------------------------

const program5 = (D: Deps) => {
  const modifyFile = (filename: string, f: (s: string) => string) =>
    pipe(
      D.readFile(filename),
      D.chain((s) => D.writeFile(filename, f(s)))
    )

  return pipe(
    D.readFile('-.txt'),
    D.chain(D.log),
    D.chain(() => modifyFile('file.txt', (s) => s + '\n// eof')),
    D.chain(() => D.readFile('file.txt')),
    D.chain(D.log)
  )
}

// -----------------------------------------
// instanca za `Deps` (izmenjeno)
// -----------------------------------------

import * as fs from 'fs'
import { log } from 'fp-ts/Console'
import { chain, fromIO } from 'fp-ts/TaskEither'

const DepsAsync: Deps = {
  readFile: (filename) => () =>
    new Promise((resolve) =>
      fs.readFile(filename, { encoding: 'utf-8' }, (err, s) => {
        if (err !== null) {
          resolve(E.left(err))
        } else {
          resolve(E.right(s))
        }
      })
    ),
  writeFile: (filename: string, data: string) => () =>
    new Promise((resolve) =>
      fs.writeFile(filename, data, (err) => {
        if (err !== null) {
          resolve(E.left(err))
        } else {
          resolve(E.right(undefined))
        }
      })
    ),
  log: (a) => fromIO(log(a)),
  chain
}

// dependency injection
program5(DepsAsync)().then(console.log)
```

**Demo**

[`06_game.ts`](src/06_game.ts)
