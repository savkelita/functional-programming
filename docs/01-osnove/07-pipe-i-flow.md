# 7. `pipe` i `flow`

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 7 od 8
>
> **Predznanje:** [Kompozicija funkcija](06-kompozicija-funkcija.md) (`compose`, identitet, asocijativnost), generici u TypeScript-u.

## Šta ćemo naučiti?

- zašto su ugnežđeni pozivi teški za čitanje i kako ih `pipe` i `flow` čine čitljivim
- razliku između `pipe` (provlači **vrednost** kroz funkcije) i `flow` (pravi **novu funkciju**)
- kako da obe funkcije sami napišemo i zašto biblioteke koriste _overload_-e
- **currying** i **„data-last“** funkcije: kako se funkcije prilagođavaju pipeline stilu
- kada koristiti `pipe`, a kada `flow`

## Intuitivno objašnjenje

Zamislite pokretnu traku u fabrici. Proizvod ulazi na jednom kraju i prolazi kroz stanice redom kojim su postavljene: sečenje, bušenje, farbanje.

- `pipe` je **puštanje jednog proizvoda kroz traku**: imate vrednost odmah i provlačite je kroz korake.
- `flow` je **sklapanje same trake**: definišete redosled stanica sada, a proizvode puštate kasnije — dobijate novu funkciju.

U oba slučaja koraci se čitaju **sleva nadesno**, redom kojim se izvršavaju.

## Problem koji rešavamo

Ugnežđeni pozivi se čitaju iznutra ka spolja, suprotno od redosleda izvršavanja:

```ts
const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const exclaim = (s: string): string => s + '!'

// izvršava se: trim → toUpperCase → exclaim; čita se obrnuto
const result = exclaim(toUpperCase(trim('  zdravo  ')))

console.log(result) // => ZDRAVO!
```

Alternativa sa privremenim promenljivama je čitljivija, ali zatrpava kod imenima koja nikome ne trebaju:

```ts
const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const exclaim = (s: string): string => s + '!'

const step1 = trim('  zdravo  ')
const step2 = toUpperCase(step1)
const result = exclaim(step2)

console.log(result) // => ZDRAVO!
```

U [prethodnoj lekciji](06-kompozicija-funkcija.md#primer-politika-ponavljanja-retry) videli smo još gori slučaj: izraz koji gradi politiku ponavljanja od pet ugnežđenih poziva. Želimo zapis koji je i kratak i čita se redom izvršavanja.

## Primer bez biblioteka

### Dve funkcije

Najjednostavnije verzije, za dve funkcije, preuzete su iz originalnog kursa:

```ts
function flow<A, B, C>(f: (a: A) => B, g: (b: B) => C): (a: A) => C {
  return (a) => g(f(a))
}

function pipe<A, B, C>(a: A, f: (a: A) => B, g: (b: B) => C): C {
  return flow(f, g)(a)
}

const trim = (s: string): string => s.trim()
const length = (s: string): number => s.length

const trimmedLength = flow(trim, length) // nova funkcija: (a: string) => number

console.log(trimmedLength('  abc  ')) // => 3
console.log(pipe('  abc  ', trim, length)) // => 3
```

Primetite:

- `flow(f, g)` je kompozicija iz prethodne lekcije, samo sa obrnutim redosledom argumenata: `flow(f, g) = compose(g, f) = g ∘ f`.
- `pipe(a, f, g)` je jednostavno `flow(f, g)` primenjena na `a`.

### Proizvoljan broj funkcija

Želimo da `pipe` radi sa jednom, dve, tri ili više funkcija, ali tako da TypeScript i dalje proverava da se svaki korak poklapa sa sledećim. Tip „lanca“ u kom izlaz svakog koraka mora biti ulaz sledećeg ne može se praktično izraziti jednim generičkim potpisom (napredni tipovi to teorijski omogućavaju, ali uz loše zaključivanje tipova i nerazumljive poruke o greškama), pa biblioteke koriste **overload**-e: po jedan potpis za svaki broj funkcija.

```ts
function pipe<A>(a: A): A
function pipe<A, B>(a: A, ab: (a: A) => B): B
function pipe<A, B, C>(a: A, ab: (a: A) => B, bc: (b: B) => C): C
function pipe<A, B, C, D>(
  a: A,
  ab: (a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): D
function pipe(a: unknown, ...fns: Array<(x: unknown) => unknown>): unknown {
  return fns.reduce((acc, f) => f(acc), a)
}

const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const exclaim = (s: string): string => s + '!'

console.log(pipe('  zdravo  ', trim, toUpperCase, exclaim)) // => ZDRAVO!
```

Implementacija (poslednji potpis, koji pozivaoci ne vide) je obična petlja koja vrednost provlači kroz funkcije. Sva „pamet“ je u overload-ima, koji kompajleru opisuju kako tipovi teku kroz lanac. Na isti način se piše i `flow`.

## Currying i „data-last“ funkcije

`pipe` i `flow` rade sa funkcijama **jednog** parametra: svaki korak prima tačno jednu vrednost — izlaz prethodnog koraka. Šta sa funkcijama koje primaju više parametara?

```ts
const add = (a: number, b: number): number => a + b
```

Ovakvu funkciju ne možemo direktno da stavimo u pipeline. Rešenje je da je prepišemo tako da prima parametre **jedan po jedan**, vraćajući funkciju za svaki sledeći. Ta tehnika se zove **currying**:

```ts
import { pipe } from 'fp-ts/function'

// prima `b` i vraća funkciju koja čeka `a`
const add = (b: number) => (a: number): number => a + b
const multiply = (b: number) => (a: number): number => a * b

console.log(add(2)(1)) // => 3

// `add(2)` je funkcija jednog parametra, pa može da bude korak u pipeline-u
console.log(pipe(1, add(2), multiply(10))) // => 30
```

Obratite pažnju na redosled parametara: **podatak** sa kojim radimo (`a`) dolazi **poslednji**, a podešavanja (`b`) prva. Takve funkcije zovemo **„data-last“**. Tada poziv sa podešavanjima (`add(2)`) daje tačno ono što pipeline traži — funkciju koja čeka podatak.

Isti obrazac pravi „pipeline“ verzije poznatih operacija:

```ts
import { pipe } from 'fp-ts/function'

const map = <A, B>(f: (a: A) => B) => (as: ReadonlyArray<A>): ReadonlyArray<B> =>
  as.map(f)

const filter = <A>(predicate: (a: A) => boolean) => (
  as: ReadonlyArray<A>
): ReadonlyArray<A> => as.filter(predicate)

const result = pipe(
  [1, 2, 3, 4, 5, 6],
  filter((n) => n % 2 === 0),
  map((n) => n * 10)
)

console.log(result) // => [ 20, 40, 60 ]
```

Tako su napisani gotovo svi moduli biblioteke `fp-ts`. Formalna definicija currying-a i njegova uloga u aplikativnim funktorima obrađene su u Celini 4 (u originalnom kursu: odeljak [Currying](../original/12-aplikativni-funktori.md#currying) poglavlja Aplikativni funktori). U Celini 3 videćemo isti trik primenjen na operaciju `concat`.

## Formalna definicija

Za funkcije `f1: A ⟶ B`, `f2: B ⟶ C`, …, `fn: Y ⟶ Z` i vrednost `a: A`:

```text
pipe(a, f1, f2, ..., fn) = fn( ... f2(f1(a)) ... )
flow(f1, f2, ..., fn)    = fn ∘ ... ∘ f2 ∘ f1
pipe(a, f1, ..., fn)     = flow(f1, ..., fn)(a)
```

Zbog **asocijativnosti** kompozicije ([lekcija 6](06-kompozicija-funkcija.md#zakoni-kompozicije)) zagrade nisu potrebne: svejedno je da li dugačak `flow` delimo na manje delove i kako ih grupišemo. Zbog **identiteta**, dodavanje koraka `identity` ništa ne menja.

## Primer sa fp-ts

Modul `fp-ts/function` izvozi obe funkcije. Ovo je demo [`00_pipe_and_flow.ts`](../../src/00_pipe_and_flow.ts) iz originalnog kursa:

```ts
import { pipe, flow } from 'fp-ts/function'

const double = (n: number): number => n * 2

const increment = (n: number): number => n + 1

const decrement = (n: number): number => n - 1

/*
    pipe operator:

    def program1 (n) do
      n
        |> increment
        |> double
        |> decrement
    end

    method chaining:

    n
      .andThen(increment)
      .andThen(double)
      .andThen(decrement)
*/
const program1 = (n: number): number => pipe(n, increment, double, decrement)

console.log(program1(10)) // 21

// const program2: (n: number) => number
const program2 = flow(increment, double, decrement)

console.log(program2(10)) // 21
```

Komentar u demou pokazuje istu ideju u drugim jezicima: operator `|>` (ovde u sintaksi jezika Elixir) i nadovezivanje metoda. Za JavaScript postoji predlog operatora `|>`, ali on još nije deo jezika.

Moduli `fp-ts`-a su pisani u data-last stilu, pa se prirodno uklapaju u pipeline:

```ts
import { flow, pipe } from 'fp-ts/function'
import * as RA from 'fp-ts/ReadonlyArray'
import * as S from 'fp-ts/string'

const words = pipe(
  '  Funkcionalno   programiranje  u TypeScript-u ',
  S.trim,
  S.split(' '),
  RA.filter((w) => w.length > 0)
)

console.log(words) // => [ 'Funkcionalno', 'programiranje', 'u', 'TypeScript-u' ]

// ista transformacija kao nova funkcija
const slugify = flow(
  S.trim,
  S.toLowerCase,
  S.split(' '),
  RA.filter((w) => w.length > 0),
  (ws) => ws.join('-')
)

console.log(slugify('  Zdravo   Svete ')) // => zdravo-svete
```

U `fp-ts` verziji 2.11 `pipe` prima vrednost i do 19 funkcija, a `flow` do 9 funkcija. Prva funkcija u `flow` sme da ima i više parametara: `flow((a: number, b: number) => a + b, double)`.

Biblioteka **Effect** ima funkcije `pipe` i `flow` istog imena i ponašanja (modul `effect/Function`). Pored toga, njeni tipovi imaju i metodu `.pipe(...)`, a većina funkcija je „dvojna“ (dual): može se pozvati i sa podatkom kao prvim argumentom i u data-last obliku, unutar pipeline-a.

## Kada `pipe`, a kada `flow`?

- **`pipe`** kada vrednost već imate — na primer, u telu funkcije. To je najčešći slučaj i obično najčitljiviji.
- **`flow`** kada želite da definišete novu funkciju kao niz koraka, bez imenovanja parametra.

Jedna praktična razlika tiče se zaključivanja tipova. U `pipe` svaka lambda dobija tip iz prethodnog koraka; u `flow` prva funkcija nema odakle da „sazna“ tip ulaza, pa njen parametar mora biti anotiran:

```ts
import { flow, pipe } from 'fp-ts/function'

// u pipe: `s` je string, jer je ulaz string
const n1 = pipe('  abc ', (s) => s.trim(), (s) => s.length)

// u flow: prvom koraku treba anotacija; ostali tipovi se zaključuju
const trimmedLength = flow((s: string) => s.trim(), (s) => s.length)

console.log(n1, trimmedLength('  abc ')) // => 3 3
```

## Najčešće greške

- **Funkcija kao prvi argument funkcije `pipe`.** Prvi argument je **vrednost**. `pipe(trim, length)` ne pravi kompoziciju, već poziva `length(trim)` — srećom, TypeScript to prijavljuje kao grešku. Za kompoziciju koristite `flow(trim, length)`.
- **Funkcije sa više parametara u pipeline-u.** Korak mora da prima jednu vrednost. Funkciju prepišite u curried, data-last obliku ili je obavijte lambdom: `(a) => add(a, 2)`.
- **Pogrešan redosled parametara.** Funkcija `(as, f) => ...` (data-first) ne može direktno u pipeline; potrebna je `(f) => (as) => ...`.
- **Previše „point-free“ koda.** „Point-free“ je stil u kom se funkcija definiše bez imenovanja parametara, npr. `flow(f, g)` umesto `(x) => g(f(x))`. Elegantan je, ali dugi lanci bez ijednog imena mogu biti nečitljivi. Imenujte međukorake kada to pomaže razumevanju.
- **Neanotirana prva lambda u `flow`.** `flow((s) => s.trim(), ...)` daje grešku (`s` implicitno ima tip `any`); anotirajte parametar ili koristite `pipe`.

## Vežba

1. Prepišite `formatRSD(addVat(parseAmount(input)))` iz prethodne lekcije pomoću `pipe`, a zatim definišite funkciju `priceLabel` pomoću `flow`.
2. Napišite curried, data-last funkciju `clamp(min, max)` koja broj ograničava na interval `[min, max]`, tako da `pipe(15, clamp(0, 10))` vrati `10`.
3. ★ Napišite sopstvenu funkciju `flow` sa overload-ima za jednu, dve i tri funkcije.

<details>
<summary>Rešenje</summary>

1.

```ts
import { flow, pipe } from 'fp-ts/function'

const parseAmount = (s: string): number => Number(s.trim().replace(',', '.'))
const addVat = (n: number): number => n * 1.2
const formatRSD = (n: number): string => `${n.toFixed(2)} RSD`

console.log(pipe(' 12,5 ', parseAmount, addVat, formatRSD)) // => 15.00 RSD

const priceLabel = flow(parseAmount, addVat, formatRSD)

console.log(priceLabel(' 12,5 ')) // => 15.00 RSD
```

2.

```ts
import { pipe } from 'fp-ts/function'

const clamp = (min: number, max: number) => (n: number): number =>
  Math.min(max, Math.max(min, n))

console.log(pipe(15, clamp(0, 10))) // => 10
console.log(pipe(-3, clamp(0, 10))) // => 0
console.log(pipe(7, clamp(0, 10))) // => 7
```

3.

```ts
function flow<A extends ReadonlyArray<unknown>, B>(
  ab: (...a: A) => B
): (...a: A) => B
function flow<A extends ReadonlyArray<unknown>, B, C>(
  ab: (...a: A) => B,
  bc: (b: B) => C
): (...a: A) => C
function flow<A extends ReadonlyArray<unknown>, B, C, D>(
  ab: (...a: A) => B,
  bc: (b: B) => C,
  cd: (c: C) => D
): (...a: A) => D
function flow(
  first: (...args: ReadonlyArray<unknown>) => unknown,
  ...rest: Array<(x: unknown) => unknown>
): (...args: ReadonlyArray<unknown>) => unknown {
  return (...args) => rest.reduce((acc, f) => f(acc), first(...args))
}

const add = (a: number, b: number): number => a + b
const double = (n: number): number => n * 2

console.log(flow(add, double)(1, 2)) // => 6
```

Tip `A extends ReadonlyArray<unknown>` omogućava da prva funkcija ima proizvoljan broj parametara — tako je `flow` definisana i u `fp-ts`-u.

</details>

## Sažetak

- `pipe(a, f, g, h)` provlači **vrednost** `a` kroz funkcije sleva nadesno; to je `h(g(f(a)))`.
- `flow(f, g, h)` pravi **novu funkciju** `h ∘ g ∘ f`; `pipe(a, ...fns) = flow(...fns)(a)`.
- Biblioteke ih tipizuju **overload-ima**, kako bi kompajler proverio svaki spoj u lancu.
- Pipeline zahteva funkcije jednog parametra: koristite **currying** i **data-last** redosled parametara.
- `pipe` kada vrednost već imate; `flow` kada definišete novu funkciju.

## Izvori

- Originalni prevod: pipeline iz poglavlja [Šta je funkcionalno programiranje](../original/01-sta-je-funkcionalno-programiranje.md); definicije `flow` i `pipe` iz odeljka [Centralni problem kompozicije funkcija](../original/10-teorija-kategorija.md#centralni-problem-kompozicije-funkcija); demo [`00_pipe_and_flow.ts`](../../src/00_pipe_and_flow.ts); currying iz poglavlja [Aplikativni funktori](../original/12-aplikativni-funktori.md#currying).
- Novo u ovoj verziji: analogija sa pokretnom trakom, implementacija sa overload-ima, objašnjenje data-last stila, primeri sa `fp-ts/string` i `fp-ts/ReadonlyArray`, poređenje `pipe` i `flow`, napomena o Effect-u, najčešće greške i vežba.

## Sledeća lekcija

U [lekciji 8 — Totalne i parcijalne funkcije](08-totalne-i-parcijalne-funkcije.md) vraćamo se na problem sa kraja lekcije o kompoziciji: funkcije poput `head` koje za neke ulaze nemaju rezultat — i čiji tipovi zbog toga često „lažu“.
