# Funkcionalno rukovanje greškama

> [!NOTE]
> Poglavlje 9 originalnog prevoda. Tekst je neizmenjen — prilagođene su samo putanje do slika i koda i interne veze između poglavlja. [Sadržaj originalnog prevoda](index.md)
>
> Prerada ovog poglavlja planirana je u Celini 2 — Modelovanje podataka i grešaka (vidi [mapu sadržaja](../mapa-sadrzaja.md)).


Pogledajmo kako da rukujemo greškama na funkcionalan način.

Funkcija koja vraća grešku ili baca izuzetak je primer parcijalne funkcije.

U poglavlju [Čiste funkcije i parcijalne funkcije](07-ciste-i-parcijalne-funkcije.md) videli smo da se svaka parcijalna funkcija `f` uvek može svesti na totalnu funkciju `f'`

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

---

[← Prethodno poglavlje](08-algebarski-tipovi-podataka.md) · [Sadržaj](index.md) · [Sledeće poglavlje →](10-teorija-kategorija.md)
