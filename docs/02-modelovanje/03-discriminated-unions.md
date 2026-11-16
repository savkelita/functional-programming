# 3. Discriminated unions

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 3 od 7
>
> **Predznanje:** [Sum tipovi](02-sum-tipovi.md) (disjunktnost, tag). Iz TypeScript-a: `switch`, literal tipovi.

## Šta ćemo naučiti?

- šta je **discriminated union** i zašto je tag najpouzdaniji način da se unija učini disjunktnom
- kako TypeScript koristi tag da **suzi tip** (narrowing)
- kako da kompajler proveri da su obrađeni **svi** slučajevi (exhaustive check)
- zašto su tipu sume potrebni **konstruktori** i kako se pišu

## Intuitivno objašnjenje

Na svakom paketu u pošti piše šta je unutra: „lomljivo“, „dokumenti“, „hrana“. Radnik ne mora da otvori paket da bi znao kako da postupi sa njim — dovoljno je da pročita oznaku.

Tag u discriminated union-u je takva oznaka. Kada TypeScript vidi da smo proverili tag, „zna“ šta je u paketu i dozvoljava pristup tačno onim poljima koja ta alternativa ima.

## Problem koji rešavamo

Bez taga, alternative moramo da razlikujemo po tome koja polja postoje:

```ts
interface Card {
  readonly cardNumber: string
}

interface Cash {
  readonly cashReceived: number
}

type Payment = Card | Cash

const describe = (p: Payment): string =>
  'cardNumber' in p ? `kartica ${p.cardNumber}` : `gotovina ${p.cashReceived}`

console.log(describe({ cardNumber: '4111' })) // => kartica 4111
```

Ovo radi, ali je krhko:

- unija nije disjunktna: vrednost `{ cardNumber: '4111', cashReceived: 100 }` pripada obema alternativama (videti kviz u [prethodnoj lekciji](02-sum-tipovi.md#formalna-definicija))
- provera zavisi od imena polja; kada dodamo alternativu koja ima isto polje, logika se tiho menja
- iz koda se ne vidi koje sve alternative postoje

## Primer bez biblioteka

### Tag

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

**Napomena**. Ime polja koje služi kao tag bira programer, ono ne mora nužno da bude „type“ (u `fp-ts`, na primer, po konvenciji se koristi ime „\_tag“).

Da bi polje radilo kao tag, njegov tip u svakoj alternativi mora biti **literal tip** (`'ADD_TODO'`, a ne `string`), i vrednosti moraju biti različite.

### Sužavanje tipa (narrowing)

Kada proverimo vrednost taga, TypeScript u toj grani zna o kojoj se alternativi radi:

```ts
type Action =
  | { readonly type: 'ADD_TODO'; readonly text: string }
  | { readonly type: 'DELETE_TODO'; readonly id: number }

const describe = (action: Action): string => {
  switch (action.type) {
    case 'ADD_TODO':
      // ovde je `action` tipa { type: 'ADD_TODO'; text: string }
      return `dodaj: ${action.text}`
    case 'DELETE_TODO':
      // ovde je `action` tipa { type: 'DELETE_TODO'; id: number }
      return `obriši: ${action.id}`
  }
}

console.log(describe({ type: 'ADD_TODO', text: 'kupiti hleb' })) // => dodaj: kupiti hleb
```

U grani `'ADD_TODO'` pristup polju `action.id` bio bi greška pri kompajliranju — ta alternativa nema polje `id`. Isto važi i za `if (action.type === 'ADD_TODO') { ... }`.

### Provera iscrpnosti (exhaustive check)

Šta ako kasnije dodamo novu alternativu, `UPDATE_TODO`? Želimo da nas kompajler upozori na svako mesto gde je nismo obradili.

Funkcija `describe` već ima takvu zaštitu: povratni tip je `string`, a `switch` nema granu za `UPDATE_TODO`, pa bi postojao put kroz funkciju koji ne vraća ništa. U `strict` režimu (tačnije, uz `strictNullChecks`) kompajler to prijavljuje, jer je povratni tip eksplicitno naveden. Ako povratni tip nije naveden, istu zaštitu daje opcija `noImplicitReturns` (uključena u ovom repozitorijumu).

Kada funkcija ne vraća vrednost, ili kada želimo eksplicitnu zaštitu, koristi se tip `never` — tip **bez** stanovnika:

```ts
type Action =
  | { readonly type: 'ADD_TODO'; readonly text: string }
  | { readonly type: 'DELETE_TODO'; readonly id: number }
  | { readonly type: 'CLEAR_ALL' }

const absurd = (x: never): never => {
  throw new Error(`Neočekivana vrednost: ${JSON.stringify(x)}`)
}

const describe = (action: Action): string => {
  switch (action.type) {
    case 'ADD_TODO':
      return `dodaj: ${action.text}`
    case 'DELETE_TODO':
      return `obriši: ${action.id}`
    default:
      // @ts-expect-error — `action` ovde još može biti { type: 'CLEAR_ALL' }, a ne `never`
      return absurd(action)
  }
}
```

Ako su obrađene sve alternative, u grani `default` tip vrednosti `action` je sužen do `never` i poziv `absurd(action)` je ispravan. Ako neka alternativa nedostaje (ovde `CLEAR_ALL`), njen tip „pretekne“, pa je poziv greška pri kompajliranju — tačno na mestu koje treba dopuniti.

(Komentar `// @ts-expect-error` kaže TypeScript-u da u sledećem redu očekujemo grešku; ovde pokazuje da kompajler zaista prijavljuje zaboravljeni slučaj.)

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

Zašto konstruktori, kada objekat možemo da napišemo i direktno?

- **jedno mesto za oblik podataka**: ako se reprezentacija promeni, menjamo samo konstruktore
- **povratni tip je cela unija** (`Action`), a ne jedna alternativa, pa se vrednosti lako kombinuju (na primer u nizu `ReadonlyArray<Action>`)
- **čitljivost**: `add('kupiti hleb')` kaže šta se dešava; objekat sa tagom kaže kako je to predstavljeno

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

Konstruktor bez parametara („nularni“) može biti obična konstanta. Zašto `nil` ima tip `List<never>`? Prazna lista ne sadrži nijedan element, pa može da „glumi“ listu bilo kog tipa. Tip `never` nema stanovnika i dodeljiv je svakom tipu. Pošto se `A` u `List<A>` pojavljuje samo kao sadržaj (u readonly poljima), to važi i za liste: `List<never>` je dodeljiv tipu `List<number>`, `List<string>` i tako dalje — jedna konstanta služi za sve.

**Primer** (Haskell, linked lists)

```haskell
data List a = Nil | Cons a (List a)

myList :: List Int
myList = Cons 1 (Cons 2 (Cons 3 Nil))
```

U Haskell-u se tip sume i njegovi konstruktori definišu jednim redom; u TypeScript-u ih pišemo ručno.

## Formalna definicija

**Discriminated union** (diskriminisana unija) je unija tipova objekata u kojoj svaki član ima zajedničko polje — **diskriminant** ili tag — čiji je tip literal, različit za svaki član. Zbog toga je unija disjunktna, a provera taga sužava tip na tačno jednog člana. To je način na koji se [tipovi sume](02-sum-tipovi.md) izražavaju u TypeScript-u.

## Primer sa fp-ts

`fp-ts` koristi polje `_tag` za sve svoje tipove sume: `Option` (`'None'` / `'Some'`), `Either` (`'Left'` / `'Right'`) i druge. Funkcija `absurd` postoji u modulu `fp-ts/function`:

```ts
import { absurd } from 'fp-ts/function'
import * as O from 'fp-ts/Option'

const describe = (o: O.Option<number>): string => {
  switch (o._tag) {
    case 'None':
      return 'nema vrednosti'
    case 'Some':
      return `vrednost: ${o.value}`
    default:
      return absurd(o)
  }
}

console.log(describe(O.some(1))) // => vrednost: 1
console.log(describe(O.none)) // => nema vrednosti
```

U praksi se `switch` nad tagovima tipova iz biblioteke retko piše; umesto toga koristi se funkcija `match`, tema [sledeće lekcije](04-pattern-matching.md).

Biblioteka Effect nudi `Data.TaggedEnum` i `Data.taggedEnum`, koji iz opisa alternativa prave i tip i konstruktore.

## Najčešće greške

- **Tag tipa `string` umesto literala.** `{ type: string; ... }` ne sužava ništa; svaka alternativa mora imati svoj literal.
- **`default` grana koja „proguta“ nove slučajeve.** `default: return ''` utišava kompajler: kada dodate alternativu, niko vas neće upozoriti. Koristite `absurd` ili izostavite `default`.
- **Pravljenje vrednosti pomoću `as`.** `{ type: 'ADD_TODO' } as Action` prolazi kompajler iako nedostaje `text`. Koristite konstruktore ili anotaciju tipa.
- **Opcioni tag.** `_tag?: 'A'` znači da vrednost bez taga pripada alternativi `A` — unija prestaje da bude disjunktna.
- **Provera polja pomoću `in` kada postoji tag.** `'text' in action` radi, ali gubi prednosti taga (jasnoću i pouzdanost).

## Vežba

1. Modelujte geometrijske oblike: krug (poluprečnik), pravougaonik (širina i visina) i kvadrat (stranica). Napišite konstruktore i funkciju `area` sa proverom iscrpnosti. Zatim dodajte trougao (osnovica i visina) i posmatrajte gde kompajler prijavljuje greške.
2. ★ Vežba iz originalnog kursa: modelujte rezultat jednog gema u tenisu — [`src/exercises/ADT02.ts`](../../src/exercises/ADT02.ts) ([rešenje](../../src/solutions/ADT02.ts)).

<details>
<summary>Rešenje (zadatak 1)</summary>

```ts
type Shape =
  | { readonly _tag: 'Circle'; readonly radius: number }
  | { readonly _tag: 'Rectangle'; readonly width: number; readonly height: number }
  | { readonly _tag: 'Square'; readonly side: number }

const circle = (radius: number): Shape => ({ _tag: 'Circle', radius })
const rectangle = (width: number, height: number): Shape => ({
  _tag: 'Rectangle',
  width,
  height
})
const square = (side: number): Shape => ({ _tag: 'Square', side })

const absurd = (x: never): never => {
  throw new Error(`Neočekivana vrednost: ${JSON.stringify(x)}`)
}

const area = (shape: Shape): number => {
  switch (shape._tag) {
    case 'Circle':
      return Math.PI * shape.radius * shape.radius
    case 'Rectangle':
      return shape.width * shape.height
    case 'Square':
      return shape.side * shape.side
    default:
      return absurd(shape)
  }
}

console.log(area(rectangle(2, 3)), area(square(4))) // => 6 16
console.log(area(circle(1)).toFixed(2)) // => 3.14
```

Kada u tip dodate `{ readonly _tag: 'Triangle'; readonly base: number; readonly height: number }`, kompajler prijavljuje grešku na pozivu `absurd(shape)` u funkciji `area`: argument tipa `{ _tag: 'Triangle'; ... }` nije dodeljiv tipu `never`. Tako tačno znate gde treba dodati novu granu.

</details>

## Sažetak

- **Discriminated union** je unija objekata sa zajedničkim poljem-oznakom (tag) literal tipa; tako se u TypeScript-u pišu tipovi sume.
- Provera taga **sužava tip**: u svakoj grani dostupna su tačno polja te alternative.
- **Provera iscrpnosti** (eksplicitan povratni tip uz `strict`, ili `never`/`absurd`) tera nas da obradimo svaku alternativu — i da dopunimo kod kada dodamo novu.
- **Konstruktori** (po jedan za svaku alternativu) čuvaju oblik podataka na jednom mestu; nularni konstruktor može biti konstanta tipa `List<never>`.

## Izvori

- Originalni prevod: naziv „discriminated union“ i tag, primer sa redux akcijama, napomena o imenu taga, odeljak o konstruktorima (action creators, `nil`/`cons`, Haskell) iz poglavlja [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md#konstruktori); vežba [`ADT02.ts`](../../src/exercises/ADT02.ts).
- Novo u ovoj verziji: analogija sa paketima, problem sa proverom pomoću `in`, objašnjenje sužavanja tipa, provera iscrpnosti pomoću `noImplicitReturns` i `never`/`absurd`, razlozi za konstruktore, objašnjenje tipa `List<never>`, formalna definicija, primer sa `fp-ts`, napomena o Effect-u, najčešće greške i vežba sa oblicima.

## Sledeća lekcija

`switch` nad tagom je naredba koju moramo da ponavljamo svuda gde radimo sa unijom. U [lekciji 4 — Pattern matching](04-pattern-matching.md) pakujemo tu logiku u funkciju `match`, koja od tipa sume pravi izraz koji se lako komponuje.
