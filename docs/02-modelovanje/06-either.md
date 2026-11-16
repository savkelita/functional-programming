# 6. Either

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 6 od 7
>
> **Predznanje:** [Option](05-option.md), [Discriminated unions](03-discriminated-unions.md), [Pattern matching](04-pattern-matching.md).

## Šta ćemo naučiti?

- kako se definiše tip `Either<E, A>` i po čemu se razlikuje od `Option<A>`
- kako se greške domena modeluju kao **tip sume grešaka**
- kako `Either` popravlja API zasnovan na node callback-ovima
- kako se funkcija koja baca izuzetak pretvara u funkciju koja vraća `Either`
- najvažnije funkcije iz modula `fp-ts/Either`

## Intuitivno objašnjenje

Kada aparat za kafu ne može da vam da kafu, dobar aparat ne samo da ne izbaci kafu, već i kaže **zašto**: „nema vode“, „nema zrna“, „ubacite još 20 dinara“. Na osnovu razloga znate šta da uradite.

`Option` je aparat koji samo ćuti. `Either` je aparat koji objašnjava: rezultat je ili **uspeh** sa vrednošću, ili **neuspeh** sa informacijom o grešci.

## Problem koji rešavamo

U [prethodnoj lekciji](05-option.md#vežba) `parseNumber` vraća `None` i za `''` i za `'abc'`. Za funkciju koja proverava godine korisnika to nije dovoljno: poruka „unesite broj“ i poruka „godine moraju biti između 0 i 150“ traže različite reakcije, a `None` ih ne razlikuje.

Isto važi i za API sa callback-om iz [lekcije 2](02-sum-tipovi.md#kada-treba-da-koristim-tip-sume), u kome su greška i podaci modelovani kao dva nezavisna opciona argumenta, iako je uvek prisutan tačno jedan od njih.

## Primer bez biblioteka

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

Po konvenciji, uspeh je „desno“ — kao igra reči u engleskom, gde _right_ znači i „desno“ i „ispravno“.

Konstruktori i pattern matching:

```ts
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}
type Either<E, A> = Left<E> | Right<A>

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

const show = match(
  (error: string) => `greška: ${error}`,
  (n: number) => `rezultat: ${n}`
)

console.log(show(right(42))) // => rezultat: 42
console.log(show(left('nema vode'))) // => greška: nema vode
```

### Greške domena kao tip sume

Šta staviti u `Left`? Najkorisnije je da i greška bude **tip sume** (discriminated union), sa po jednom alternativom za svaku vrstu neuspeha:

```ts
interface Left<E> {
  readonly _tag: 'Left'
  readonly left: E
}
interface Right<A> {
  readonly _tag: 'Right'
  readonly right: A
}
type Either<E, A> = Left<E> | Right<A>

const left = <E, A>(left: E): Either<E, A> => ({ _tag: 'Left', left })
const right = <A, E>(right: A): Either<E, A> => ({ _tag: 'Right', right })

type AgeError =
  | { readonly _tag: 'NotANumber'; readonly input: string }
  | { readonly _tag: 'OutOfRange'; readonly value: number }

const parseAge = (input: string): Either<AgeError, number> => {
  const n = Number(input.trim())
  if (input.trim() === '' || !Number.isInteger(n)) {
    return left({ _tag: 'NotANumber', input })
  }
  if (n < 0 || n > 150) {
    return left({ _tag: 'OutOfRange', value: n })
  }
  return right(n)
}

// poruka za korisnika: provera iscrpnosti nad greškama
const message = (error: AgeError): string => {
  switch (error._tag) {
    case 'NotANumber':
      return `„${error.input}“ nije ceo broj`
    case 'OutOfRange':
      return `${error.value} nije između 0 i 150`
  }
}

const describe = (input: string): string => {
  const result = parseAge(input)
  return result._tag === 'Right' ? `godine: ${result.right}` : message(result.left)
}

console.log(describe('42')) // => godine: 42
console.log(describe('abc')) // => „abc“ nije ceo broj
console.log(describe('200')) // => 200 nije između 0 i 150
```

Tip `Either<AgeError, number>` je kompletna dokumentacija funkcije: kaže šta se dobija u slučaju uspeha i tačno koje greške su moguće. Kada dodamo novu vrstu greške, provera iscrpnosti u funkciji `message` pokazaće gde treba dopuniti kod.

### Primer: callback API

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

```ts nocheck
declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void
```

i da koristimo API na ovaj način:

```ts
import { pipe } from 'fp-ts/function'
import { Either, match } from 'fp-ts/Either'

declare function readFile(
  path: string,
  callback: (result: Either<Error, string>) => void
): void

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

Grana „should never happen“ je nestala, jer nemoguća stanja više ne mogu da se predstave.

## Formalna definicija

`Either<E, A>` je tip sume dve alternative: `Left<E>` (neuspeh sa vrednošću tipa `E`) i `Right<A>` (uspeh sa vrednošću tipa `A`), sa:

- konstruktorima `left: <E, A>(e: E) => Either<E, A>` i `right: <A, E>(a: A) => Either<E, A>`
- funkcijom `match: <E, R, A>(onLeft: (e: E) => R, onRight: (a: A) => R) => (fa: Either<E, A>) => R`

Kardinalnost: `C(Either<E, A>) = C(E) + C(A)`.

Veza sa `Option`-om: ako je `E` tip sa jednim stanovnikom (na primer `undefined`), `Either<undefined, A>` ima `1 + C(A)` stanovnika, kao i `Option<A>`. Drugim rečima, `Option` je `Either` koji ne nosi informaciju o grešci.

## Primer sa fp-ts

Najvažnije funkcije iz modula `fp-ts/Either`:

```ts
import { pipe } from 'fp-ts/function'
import * as E from 'fp-ts/Either'
import * as O from 'fp-ts/Option'

// konstruktori
const ok: E.Either<string, number> = E.right(1)
const ko: E.Either<string, number> = E.left('greška')

// izlazak iz Either-a
console.log(pipe(ok, E.match((e) => `greška: ${e}`, (n) => `broj: ${n}`))) // => broj: 1
console.log(pipe(ko, E.getOrElse(() => 0))) // => 0

// iz vrednosti koja može biti null/undefined, uz razlog
const fromMap = (m: ReadonlyMap<string, number>, key: string) =>
  pipe(m.get(key), E.fromNullable(`ključ ${key} ne postoji`))

console.log(fromMap(new Map([['a', 1]]), 'b')) // => { _tag: 'Left', left: 'ključ b ne postoji' }

// iz Option-a, uz razlog
console.log(pipe(O.none, E.fromOption(() => 'nema vrednosti'))) // => { _tag: 'Left', left: 'nema vrednosti' }

// provera alternative
if (E.isRight(ok)) {
  console.log(ok.right) // => 1
}
```

### Funkcije koje bacaju izuzetke

Postojeći kod često prijavljuje greške izuzecima. `E.tryCatch` takav poziv pretvara u `Either`: prvi argument je thunk koji izvršava rizičan poziv, a drugi pretvara uhvaćenu grešku (tipa `unknown`) u vrednost za `Left`:

```ts
import * as E from 'fp-ts/Either'

const parseJSON = (input: string): E.Either<Error, unknown> =>
  E.tryCatch(() => JSON.parse(input), E.toError)

console.log(parseJSON('{"a":1}')) // => { _tag: 'Right', right: { a: 1 } }
console.log(E.isLeft(parseJSON('{'))) // => true
```

`E.toError` pretvara bilo šta u `Error` (ako već nije). Modul `fp-ts/Json` sadrži gotove totalne verzije: `parse: (s: string) => Either<unknown, Json>` i `stringify: <A>(a: A) => Either<unknown, string>`.

U biblioteci Effect (verzija 3) postoji modul `Either` sa istom idejom, ali pažnja: redosled tipskih parametara je obrnut, `Either<R, L>` — prvo uspeh, pa greška. Za modelovanje grešaka u programima sa efektima Effect se uglavnom oslanja na sam tip `Effect` ([lekcija 7](07-neuspeh-bez-izuzetaka.md)).

## Najčešće greške

- **Uspeh u `Left`, greška u `Right`.** Konvencija je čvrsta: sve funkcije biblioteke (`getOrElse`, a kasnije `map` i `chain`) „nastavljaju“ sa `Right` vrednošću.
- **`Either<string, A>` ili `Either<Error, A>` za sve.** Poruka kao string ili generički `Error` ne govori koje greške su moguće. Za greške domena koristite tip sume, kao `AgeError`.
- **Bacanje izuzetka unutar funkcije koja vraća `Either`.** Potpis tada laže: pozivalac očekuje da su sve greške u `Left`.
- **Prerano pretvaranje u `Option`.** `O.fromEither` (ili `getOrElse`) odbacuje razlog greške; uradite to tek kada razlog zaista više nije potreban.
- **`tryCatch` oko čistog koda.** `tryCatch` služi za granicu sa kodom koji baca izuzetke; čista totalna funkcija ga ne treba.

## Vežba

1. Napišite totalnu funkciju `safeDivide: (a: number, b: number) => Either<DivisionError, number>`, gde je `DivisionError` tip sume sa alternativama `DivisionByZero` i `NotFinite` (rezultat nije konačan broj).
2. ★ Vežba iz originalnog kursa: prepišite funkciju `parseJSON` u funkcionalnom stilu pomoću `Either` iz `fp-ts`-a — [`src/exercises/FEH05.ts`](../../src/exercises/FEH05.ts) ([rešenje](../../src/solutions/FEH05.ts)).

<details>
<summary>Rešenje (zadatak 1)</summary>

```ts
import * as E from 'fp-ts/Either'

type DivisionError =
  | { readonly _tag: 'DivisionByZero' }
  | { readonly _tag: 'NotFinite'; readonly a: number; readonly b: number }

const safeDivide = (a: number, b: number): E.Either<DivisionError, number> => {
  if (b === 0) {
    return E.left({ _tag: 'DivisionByZero' })
  }
  const result = a / b
  return Number.isFinite(result) ? E.right(result) : E.left({ _tag: 'NotFinite', a, b })
}

console.log(safeDivide(10, 4)) // => { _tag: 'Right', right: 2.5 }
console.log(safeDivide(1, 0)) // => { _tag: 'Left', left: { _tag: 'DivisionByZero' } }
console.log(safeDivide(1e308, 1e-10)) // => { _tag: 'Left', left: { _tag: 'NotFinite', a: 1e+308, b: 1e-10 } }
```

</details>

## Sažetak

- `Either<E, A>` je tip sume: `Left<E>` (neuspeh sa razlogom) ili `Right<A>` (uspeh). Po konvenciji, uspeh je desno.
- Za razliku od `Option`-a, `Either` kaže **zašto** nešto nije uspelo; `Option` je `Either` bez informacije o grešci.
- Greške domena najbolje je modelovati kao **tip sume grešaka**, uz proveru iscrpnosti pri obradi.
- Na granici sa kodom koji koristi izuzetke ili `null` koriste se `E.tryCatch`, `E.fromNullable` i `E.fromOption`.

## Izvori

- Originalni prevod: odeljak [Tip `Either`](../original/09-funkcionalno-rukovanje-greskama.md#tip-either) (upotreba kao alternativa za `Option`, definicija, konstruktori, `match`, primer sa `readFile` callback-om); vežba [`FEH05.ts`](../../src/exercises/FEH05.ts).
- Novo u ovoj verziji: analogija sa aparatom za kafu, problem sa `parseNumber`, konvencija „right = ispravno“, greške domena kao tip sume (`AgeError`), formalni sažetak i veza sa `Option`-om, pregled funkcija iz `fp-ts/Either`, `tryCatch` i `toError`, napomena o Effect-u, najčešće greške i vežba.

## Sledeća lekcija

Sada imamo oba alata. U [lekciji 7 — Modelovanje neuspeha bez izuzetaka](07-neuspeh-bez-izuzetaka.md) ih spajamo u celinu: kada koristiti `Option`, kada `Either`, a kada je izuzetak ipak pravi izbor — i šta se dešava kada treba povezati više koraka koji mogu da ne uspeju.
