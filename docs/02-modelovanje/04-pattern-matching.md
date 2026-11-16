# 4. Pattern matching

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 4 od 7
>
> **Predznanje:** [Discriminated unions](03-discriminated-unions.md) (tag, sužavanje tipa, provera iscrpnosti), [`pipe` i `flow`](../01-osnove/07-pipe-i-flow.md) (data-last funkcije).

## Šta ćemo naučiti?

- šta je **pattern matching** i kako ga simuliramo u TypeScript-u funkcijom `match`
- zašto je `match` bolji od ponavljanja `switch` naredbi
- kako se `match` piše za rekurzivne tipove (lista)
- kako `match` izgleda u `fp-ts`-u (`match` i `matchW`)

## Intuitivno objašnjenje

U sortirnici pošte za svaku vrstu pošiljke postoji jedan šalter: pisma idu na jedan, paketi na drugi, preporučene pošiljke na treći. Pošiljka uvek završi na tačno jednom šalteru, i ne postoji pošiljka za koju šaltera nema.

`match` je takva sortirnica za tip sume: za **svaku** alternativu zadajemo po jednu funkciju („šalter“), a `match` za datu vrednost poziva tačno onu koja joj odgovara.

## Problem koji rešavamo

U [prethodnoj lekciji](03-discriminated-unions.md#sužavanje-tipa-narrowing) svaka funkcija nad unijom imala je svoj `switch`. U pravom programu takvih funkcija su desetine, a `switch`:

- je **naredba**, a ne izraz: ne može se staviti u `pipe` ni proslediti kao vrednost
- ponavlja istu strukturu (tag, grane) na svakom mestu gde se unija koristi
- oslanja se na disciplinu: jedna `default` grana i provera iscrpnosti nestaje

Želimo da strukturu „po jedna grana za svaku alternativu“ napišemo **jednom**, kao funkciju, a zatim je koristimo kao izraz.

## Primer bez biblioteka

JavaScript nema [pattern matching](https://github.com/tc39/proposal-pattern-matching) (pa ga nema ni TypeScript); postoji samo predlog da se uvede u jezik.

**Primer** (Haskell, linked lists)

```haskell
data List a = Nil | Cons a (List a)

-- vraća `True` ako je lista prazna
isEmpty :: List a -> Bool
isEmpty Nil = True
isEmpty (Cons _ _) = False
```

U Haskell-u se funkcija nad tipom sume piše „po alternativama“: jedan red za `Nil`, jedan za `Cons`. TypeScript takvu sintaksu nema, ali pattern matching možemo da simuliramo pomoću funkcije `match`.

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

// -------------------
// primer upotrebe
// -------------------

const nil: List<never> = { _tag: 'Nil' }
const cons = <A>(head: A, tail: List<A>): List<A> => ({ _tag: 'Cons', head, tail })

const myList = cons(1, cons(2, cons(3, nil)))

console.log(isEmpty(myList), isEmpty(nil)) // => false true
console.log(length(myList)) // => 3
```

Šta smo dobili:

- `switch` postoji na **jednom** mestu — unutar `match`
- `isEmpty`, `head` i `length` su **izrazi**: definisani su kao rezultat poziva `match`, bez ijedne naredbe
- **iscrpnost je obavezna**: `match` traži obe funkcije, pa slučaj ne možemo da zaboravimo
- `match` je **data-last** (prvo funkcije, pa vrednost), pa se uklapa u `pipe` i `flow`

**Kviz**. Zašto je API `head` suboptimalan?

<details>
<summary>Odgovor</summary>

Zato što neuspeh kodira pomoću `undefined` — slabom oznakom iz [lekcije 8 prve celine](../01-osnove/08-totalne-i-parcijalne-funkcije.md#način-1-proširiti-kodomen): ne razlikujemo praznu listu od liste čiji je prvi element `undefined`. (TypeScript ovde za rezultat čak zaključuje tip `unknown`, jer iz grana ne može da odredi tip elemenata.) Bolje je da `head` vraća `Option<A>` ([lekcija 5](05-option.md)).

</details>

**Napomena**. TypeScript nudi odličnu mogućnost vezanu za tipove sume: **exhaustive check**. Naime, type checker može da utvrdi da li su svi slučajevi obrađeni u naredbi `switch` definisanoj u telu funkcije `match` ([lekcija 3](03-discriminated-unions.md#provera-iscrpnosti-exhaustive-check)).

### Dva stila: pozicioni i objektni

`match` iznad prima funkcije **po poziciji** (`onNil`, pa `onCons`). Kod tipova sa više alternativa preglednije je proslediti **objekat** sa imenovanim granama:

```ts
type RemoteData =
  | { readonly _tag: 'Loading' }
  | { readonly _tag: 'Success'; readonly data: string }
  | { readonly _tag: 'Failure'; readonly error: string }

const match = <R>(cases: {
  readonly Loading: () => R
  readonly Success: (data: string) => R
  readonly Failure: (error: string) => R
}) => (rd: RemoteData): R => {
  switch (rd._tag) {
    case 'Loading':
      return cases.Loading()
    case 'Success':
      return cases.Success(rd.data)
    case 'Failure':
      return cases.Failure(rd.error)
  }
}

const render = match({
  Loading: () => 'Učitavanje...',
  Success: (data) => `Podaci: ${data}`,
  Failure: (error) => `Greška: ${error}`
})

console.log(render({ _tag: 'Success', data: '42' })) // => Podaci: 42
console.log(render({ _tag: 'Loading' })) // => Učitavanje...
```

I ovde kompajler traži sve tri grane: ako izostavimo `Failure`, objekat nije odgovarajućeg tipa.

## Formalna definicija

Vrednost tipa sume u potpunosti je određena time **koja je alternativa** u pitanju i **koja polja** ta alternativa nosi. Zato je za definisanje funkcije `T → R` nad tipom sume `T` dovoljno (i potrebno) zadati po jednu funkciju za svaku alternativu: od polja te alternative do `R`.

Za tip sume sa alternativama `A₁ | A₂ | ... | Aₙ`, funkcija `match` ima oblik:

```ts nocheck
match: <R>(onA1: (fields of A1) => R, ..., onAn: (fields of An) => R) => (t: T) => R
```

i svaka funkcija nad `T` može se napisati kao `match(...)` sa odgovarajućim granama. Za rekurzivne tipove (kao `List`), grana može ponovo da pozove funkciju nad ostatkom strukture — tako je napisana `length`.

Za nerekurzivne tipove (`Option`, `Either`) ovakva funkcija se zove i `fold` (tako se zvala u starijim verzijama `fp-ts`-a); kod rekurzivnih tipova `fold` obično znači funkciju koja sama obilazi celu strukturu.

## Primer sa fp-ts

Moduli `fp-ts`-a imaju funkciju `match` za svoje tipove sume. Za `Option`, prva grana je za `None`, druga za `Some`:

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'

const describeFirst = (ns: ReadonlyArray<number>): string =>
  pipe(
    RA.head(ns),
    O.match(
      () => 'niz je prazan',
      (n) => `prvi element je ${n}`
    )
  )

console.log(describeFirst([3, 2, 1])) // => prvi element je 3
console.log(describeFirst([])) // => niz je prazan
```

`match` zahteva da obe grane vraćaju isti tip. Kada grane prirodno vraćaju različite tipove, postoji varijanta `matchW` („W“ od _widen_, proširi): rezultat je unija tipova grana.

```ts
import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

const result: number | string = pipe(
  O.some(42),
  O.matchW(
    () => 'nema vrednosti', // string
    (n) => n * 2 // number
  )
)

console.log(result) // => 84
```

U biblioteci Effect, `Option.match` i slične funkcije primaju objekat sa granama (`{ onNone, onSome }`), a modul `Match` omogućava pattern matching i nad proizvoljnim discriminated union-ima, uz proveru iscrpnosti.

## Najčešće greške

- **Pogrešan redosled grana u pozicionom stilu.** U `fp-ts`-u je za `Option` prva grana `None`, a za `Either` prva grana `Left` (neuspeh), pa tek onda uspeh.
- **Sporedni efekti u granama.** `match` je za izračunavanje vrednosti; grana koja samo poziva `console.log` i vraća `undefined` krije pravu nameru.
- **Duboko ugnežđeni `match`-evi.** Kada je rezultat jednog `match`-a ulaz u sledeći, kod brzo postaje nečitljiv. To je problem koji rešavaju `map` i `chain` (Celine 4 i 5).
- **„Univerzalna“ grana.** Ako vaš `match` prihvata `otherwise` granu, gubite proveru iscrpnosti, kao sa `default` u `switch`-u.

## Vežba

1. Napišite funkciju `sum: (list: List<number>) => number` pomoću funkcije `match` za listu.
2. Napišite funkciju `toArray: <A>(list: List<A>) => ReadonlyArray<A>`.
3. ★ Vežbe iz originalnog kursa:
   - modelujte binarno stablo, njegove konstruktore, funkciju `match` i funkciju koja stablo pretvara u niz: [`src/exercises/ADT01.ts`](../../src/exercises/ADT01.ts) ([rešenje](../../src/solutions/ADT01.ts))
   - uklonite grešku pri kompajliranju u kodu koji koristi `match` iz `fp-ts`-a (savet: `matchW`): [`src/exercises/ADT03.ts`](../../src/exercises/ADT03.ts) ([rešenje](../../src/solutions/ADT03.ts))

<details>
<summary>Rešenje (zadaci 1 i 2)</summary>

```ts
type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }

const nil: List<never> = { _tag: 'Nil' }
const cons = <A>(head: A, tail: List<A>): List<A> => ({ _tag: 'Cons', head, tail })

const match = <R, A>(onNil: () => R, onCons: (head: A, tail: List<A>) => R) => (
  fa: List<A>
): R => (fa._tag === 'Nil' ? onNil() : onCons(fa.head, fa.tail))

const sum: (list: List<number>) => number = match(
  () => 0,
  (head, tail) => head + sum(tail)
)

const toArray = <A>(list: List<A>): ReadonlyArray<A> =>
  match<ReadonlyArray<A>, A>(
    () => [],
    (head, tail) => [head, ...toArray(tail)]
  )(list)

const myList = cons(1, cons(2, cons(3, nil)))

console.log(sum(myList)) // => 6
console.log(toArray(myList)) // => [ 1, 2, 3 ]
```

Kod `toArray` tipske parametre navodimo eksplicitno (`match<ReadonlyArray<A>, A>`), jer TypeScript iz prazne grane `() => []` ne može sam da zaključi tip elemenata.

</details>

## Sažetak

- **Pattern matching** znači definisati funkciju nad tipom sume zadavanjem po jedne grane za svaku alternativu.
- U TypeScript-u ga simuliramo funkcijom **`match`**, koja prima po jednu funkciju za svaku alternativu i vraća funkciju nad celim tipom.
- `match` je **izraz**, **data-last** i **iscrpan**: slučaj se ne može zaboraviti.
- Grane se mogu zadati po poziciji ili kao objekat sa imenima.
- U `fp-ts`-u: `O.match`, `E.match` i `matchW` kada grane vraćaju različite tipove.

## Izvori

- Originalni prevod: odeljak [Pattern matching](../original/08-algebarski-tipovi-podataka.md#pattern-matching) (predlog za JavaScript, Haskell primer, `match` za listu sa `isEmpty`, `head` i `length`, kviz o `head`, napomena o proveri iscrpnosti); vežbe [`ADT01.ts`](../../src/exercises/ADT01.ts) i [`ADT03.ts`](../../src/exercises/ADT03.ts).
- Novo u ovoj verziji: analogija sa sortirnicom, problem sa ponavljanjem `switch`-a, primer upotrebe liste, objektni stil sa `RemoteData`, formalni opis, primeri sa `O.match` i `O.matchW`, napomena o Effect-u, odgovor na kviz, najčešće greške i vežba.

## Sledeća lekcija

Imamo sve alate da tačno definišemo tip koji smo do sada samo pominjali. U [lekciji 5 — Option](05-option.md) pravimo tip za vrednost koja možda postoji, i pomoću njega parcijalne funkcije pretvaramo u totalne.
