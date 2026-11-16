# 5. Option

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 5 od 7
>
> **Predznanje:** [Totalne i parcijalne funkcije](../01-osnove/08-totalne-i-parcijalne-funkcije.md) (zapis `Option(Y) = Y ∪ None`), [Sum tipovi](02-sum-tipovi.md), [Pattern matching](04-pattern-matching.md).

## Šta ćemo naučiti?

- kako se tip `Option` definiše kao tip sume, sa konstruktorima i funkcijom `match`
- kako `Option` parcijalnu funkciju pretvara u totalnu, a da tip „govori istinu“
- zašto je `Option` bolji od `undefined` (dva problema iz Celine 1)
- kako da `Option` povežemo sa kodom koji koristi `null` i `undefined`
- najvažnije funkcije iz modula `fp-ts/Option`

## Intuitivno objašnjenje

`Option<A>` je kutija koja je ili **prazna**, ili sadrži **tačno jednu** vrednost tipa `A`. Ne možete da izvadite vrednost a da prethodno ne pogledate da li kutija nešto sadrži — i baš u tome je poenta: odgovor na pitanje „šta ako ničega nema?“ postaje obavezan.

## Problem koji rešavamo

Funkcija koja baca izuzetak, ili „vraća grešku“ kao specijalnu vrednost koju tip ne pominje, primer je parcijalne funkcije. U [lekciji 8 prve celine](../01-osnove/08-totalne-i-parcijalne-funkcije.md) videli smo da se svaka parcijalna funkcija `f` uvek može svesti na totalnu funkciju `f'`

```text
f': X ⟶ Option(Y)
```

i probali smo da `Option(Y)` predstavimo kao `Y | undefined`. To je radilo, ali uz dva problema:

1. `undefined` može biti i **legitimna vrednost**: za niz `[undefined, 'b']`, `head` vraća `undefined` — da li je niz prazan ili mu je prvi element `undefined`?
2. **neuspeh u neuspehu** se ne razlikuje od običnog neuspeha, jer se `A | undefined | undefined` svodi na `A | undefined`.

Sada kada znamo nešto više o tipovima sume u TypeScript-u, možemo bez daljeg odlaganja da definišemo pravi `Option`.

## Primer bez biblioteka

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

Pogledajmo i njegove konstruktore i njegovu funkciju `match` za „pattern matching“:

```ts
interface None {
  readonly _tag: 'None'
}

interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}

type Option<A> = None | Some<A>

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

console.log(match(() => 'prazno', (n: number) => `ima: ${n}`)(some(1))) // => ima: 1
console.log(match(() => 'prazno', (n: number) => `ima: ${n}`)(none)) // => prazno
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
  s = e instanceof Error ? e.message : String(e)
}
```

gde sistem tipova ne zna ništa o mogućem neuspehu, na:

```ts
import { pipe } from 'fp-ts/function'

interface None {
  readonly _tag: 'None'
}
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}
type Option<A> = None | Some<A>

const none: Option<never> = { _tag: 'None' }
const some = <A>(value: A): Option<A> => ({ _tag: 'Some', value })
const match = <R, A>(onNone: () => R, onSome: (a: A) => R) => (
  fa: Option<A>
): R => (fa._tag === 'None' ? onNone() : onSome(fa.value))

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
interface None {
  readonly _tag: 'None'
}
interface Some<A> {
  readonly _tag: 'Some'
  readonly value: A
}
type Option<A> = None | Some<A>

declare const head: <A>(as: ReadonlyArray<A>) => Option<A>
declare const numbers: ReadonlyArray<number>

const result = head(numbers)
// @ts-expect-error — Property 'value' does not exist on type 'Option<number>'
result.value
```

Jedini način da pristupimo vrednosti sadržanoj u `Option` jeste da obradimo i slučaj neuspeha pomoću funkcije `match` (ili proverom taga, npr. funkcijom `O.isSome`, koju ćemo videti u nastavku; `match` je najpraktičniji način):

```ts nocheck
pipe(result, match(
  () => ...handle error...
  (n) => ...go on with my business logic...
))
```

### Oba problema iz Celine 1 su rešena

```ts
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'

// 1. `undefined` kao legitimna vrednost
const xs: ReadonlyArray<string | undefined> = [undefined, 'b']
console.log(RA.head(xs)) // => { _tag: 'Some', value: undefined } — prvi element postoji
console.log(RA.head([])) // => { _tag: 'None' } — niz je prazan

// 2. neuspeh u neuspehu
const firstOfFirst = (
  yss: ReadonlyArray<ReadonlyArray<number>>
): O.Option<O.Option<number>> =>
  O.match(
    (): O.Option<O.Option<number>> => O.none, // spoljni niz je prazan
    (ys: ReadonlyArray<number>) => O.some(RA.head(ys)) // unutrašnji može biti prazan
  )(RA.head(yss))

console.log(firstOfFirst([])) // => { _tag: 'None' }
console.log(firstOfFirst([[]])) // => { _tag: 'Some', value: { _tag: 'None' } }
```

`Some(undefined)` i `None` su različite vrednosti, kao i `None` i `Some(None)`: informacija se ne gubi. (Kardinalnost to potvrđuje: `C(Option<A>) = 1 + C(A)` dodaje novu vrednost čak i kada `A` već sadrži `undefined` ili je i sam `Option` — videti [lekciju 2](02-sum-tipovi.md#odakle-naziv-tipovi-sume).)

U drugom primeru `O.match` vraća `Option` u kome je još jedan `Option`. Kako se ovakvo „pakovanje u pakovanje“ radi kraće (`map`), i kako se ugnežđeni `Option` „izravnava“ (`flatten`, `chain`), videćemo u Celinama 4 i 5.

## Formalna definicija

```text
Option(A) = A ∪ None
```

U TypeScript-u: `Option<A>` je tip sume dve alternative, `None` (bez polja) i `Some<A>` (jedno polje tipa `A`), sa:

- konstruktorima `none: Option<never>` i `some: <A>(a: A) => Option<A>`
- funkcijom `match: <R, A>(onNone: () => R, onSome: (a: A) => R) => (fa: Option<A>) => R`

Kardinalnost: `C(Option<A>) = 1 + C(A)`.

Parcijalna funkcija `f: X ⟶ Y` postaje totalna `f': X ⟶ Option<Y>`: za ulaze za koje `f` nije definisana, `f'` vraća `None`.

## Primer sa fp-ts

Najvažnije funkcije iz modula `fp-ts/Option`:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RR from 'fp-ts/ReadonlyRecord'

// funkcije koje vraćaju Option
console.log(RA.head([1, 2, 3])) // => { _tag: 'Some', value: 1 }
console.log(pipe([1, 2, 3], RA.findFirst((n) => n > 1))) // => { _tag: 'Some', value: 2 }
console.log(pipe({ a: 1 }, RR.lookup('b'))) // => { _tag: 'None' }

// izlazak iz Option-a: obe grane, ili podrazumevana vrednost
const label = pipe(
  RA.head(['Ana']),
  O.match(
    () => 'nepoznat',
    (name) => `zdravo, ${name}`
  )
)
const count = pipe(RA.head([]), O.getOrElse(() => 0))
console.log(label, count) // => zdravo, Ana 0

// provera alternative (sužava tip, kao provera taga)
const o: O.Option<number> = O.some(5)
if (O.isSome(o)) {
  console.log(o.value) // => 5
}
```

### Granica sa `null` i `undefined`

Mnogi postojeći API-ji za „nema vrednosti“ koriste `null` ili `undefined`: `Map.prototype.get`, `Array.prototype.find`, `document.getElementById`. Na granici sa takvim kodom koristimo `fromNullable`, a unutar našeg koda radimo sa `Option`-om:

```ts
import * as O from 'fp-ts/Option'

const prices = new Map([
  ['knjiga', 1200],
  ['olovka', 80]
])

const priceOf = (product: string): O.Option<number> =>
  O.fromNullable(prices.get(product))

console.log(priceOf('knjiga')) // => { _tag: 'Some', value: 1200 }
console.log(priceOf('gumica')) // => { _tag: 'None' }

// i nazad, za API koji očekuje `undefined`
console.log(O.toUndefined(priceOf('gumica'))) // => undefined
```

U biblioteci Effect postoji modul `Option` sa istom idejom: `Option.some(1)`, `Option.none()`, `Option.getOrElse` i `Option.match(o, { onNone, onSome })`.

### Instance za `Eq`, `Semigroup` i `Monoid`

Originalni kurs u ovom poglavlju pokazuje i kako se za `Option<A>` definišu jednakost (`Eq`) i kombinovanje (`Semigroup`, `Monoid`). Te apstrakcije upoznajemo u Celini 3, pa su ti odeljci premešteni tamo; do tada su dostupni u [originalnom prevodu](../original/09-funkcionalno-rukovanje-greskama.md#instanca-za-eq).

## Najčešće greške

- **Pristup polju `value` bez provere.** Kompajler to sprečava; ne zaobilazite ga kastovanjem (`(o as Some<A>).value`).
- **`undefined` koji se na granici ne pretvori u `None`.** Ako vrednost iz API-ja koji koristi `undefined` umotamo sa `some(...)` umesto sa `fromNullable`, dobijamo `Option<A | undefined>`, pa „nema“ može da se kaže na dva načina (`None` i `Some(undefined)`). Na granici koristite `fromNullable`, koji `null` i `undefined` pretvara u `None`.
- **`Option` kada je potreban razlog neuspeha.** `Option` kaže samo „nema“. Ako pozivalac treba da zna _zašto_ (neispravan format, broj van opsega…), potreban je `Either` ([sledeća lekcija](06-either.md)).
- **`Option` za svako opciono polje.** Za polja podataka koja se šalju i čuvaju (JSON, baza) opciono polje `email?: string` je često prirodnije; `Option` je najkorisniji kao **rezultat** funkcija.
- **`getOrElse` sa vrednošću koja „glumi“ neuspeh.** `getOrElse(() => -1)` vraća nas na specijalne vrednosti iz Celine 1; podrazumevana vrednost treba da bude zaista ispravan rezultat.

## Vežba

1. Napišite totalnu funkciju `parseNumber: (s: string) => Option<number>` koja vraća `None` za string koji nije broj (pazite na prazan string).
2. Funkcija `indexOf` vraća `-1` kada element ne postoji. Napišite `findIndex: <A>(as: ReadonlyArray<A>, predicate: (a: A) => boolean) => Option<number>`.
3. Pomoću `fp-ts`-a napišite `greet: (users: ReadonlyMap<number, string>, id: number) => string` koja vraća `'Zdravo, <ime>!'` ili `'Nepoznat korisnik'`.

<details>
<summary>Rešenje</summary>

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

// 1.
const parseNumber = (s: string): O.Option<number> => {
  const trimmed = s.trim()
  const n = Number(trimmed)
  return trimmed === '' || Number.isNaN(n) ? O.none : O.some(n)
}

console.log(parseNumber('42')) // => { _tag: 'Some', value: 42 }
console.log(parseNumber('abc')) // => { _tag: 'None' }
console.log(parseNumber('')) // => { _tag: 'None' }

// 2.
const findIndex = <A>(
  as: ReadonlyArray<A>,
  predicate: (a: A) => boolean
): O.Option<number> => {
  const i = as.findIndex(predicate)
  return i === -1 ? O.none : O.some(i)
}

console.log(findIndex([5, 8, 13], (n) => n > 6)) // => { _tag: 'Some', value: 1 }

// 3.
const greet = (users: ReadonlyMap<number, string>, id: number): string =>
  pipe(
    O.fromNullable(users.get(id)),
    O.match(
      () => 'Nepoznat korisnik',
      (name) => `Zdravo, ${name}!`
    )
  )

const users = new Map([[1, 'Ana']])
console.log(greet(users, 1), greet(users, 2)) // => Zdravo, Ana! Nepoznat korisnik
```

U drugom zadatku `-1` ostaje zarobljen unutar funkcije: pozivalac dobija `Option` i ne može da zaboravi proveru. (`fp-ts` ima gotovu funkciju `RA.findIndex`.)

</details>

## Sažetak

- `Option<A>` je tip sume: `None` (nema vrednosti) ili `Some<A>` (tačno jedna vrednost).
- Parcijalna funkcija `X ⟶ Y` postaje totalna `X ⟶ Option<Y>`, a mogućnost neuspeha postaje **vidljiva u tipu**.
- Vrednosti se pristupa samo preko `match` (ili `getOrElse`, `isSome`), pa se slučaj „nema“ ne može zaboraviti.
- Za razliku od `undefined`, `Option` razlikuje `Some(undefined)` od `None` i `Some(None)` od `None`.
- Na granici sa `null`/`undefined` koristimo `fromNullable` i `toUndefined`.

## Izvori

- Originalni prevod: uvod poglavlja i odeljak [Tip `Option`](../original/09-funkcionalno-rukovanje-greskama.md#tip-option) (definicija, konstruktori, `match`, prelaz sa `head` koji baca izuzetak na `head` koji vraća `Option`, greška pri pristupu polju `value`); kardinalnost `Option`-a iz poglavlja [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md#odakle-naziv-tipovi-sume). Odeljci o instancama `Eq`, `Semigroup` i `Monoid` prelaze u Celinu 3.
- Novo u ovoj verziji: analogija sa kutijom, rešenje dva problema sa `undefined` iz Celine 1, formalni sažetak, pregled funkcija iz `fp-ts/Option`, granica sa `null`/`undefined`, napomena o Effect-u, najčešće greške i vežba. Primeri iz originala dopunjeni su definicijama da bi bili samostalni.

## Sledeća lekcija

`Option` kaže da li vrednost postoji, ali ne i **zašto** je nema. U [lekciji 6 — Either](06-either.md) upoznajemo tip koji uz neuspeh nosi i razlog.
