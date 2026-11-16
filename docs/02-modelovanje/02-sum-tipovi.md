# 2. Sum tipovi (tipovi sume)

> **Celina 2 — Modelovanje podataka i grešaka** · Lekcija 2 od 7
>
> **Predznanje:** [Product tipovi](01-product-tipovi.md) (kardinalnost). Iz TypeScript-a: unije tipova (`A | B`).

## Šta ćemo naučiti?

- šta je **tip sume** i zašto njegovi članovi moraju biti **disjunktni**
- zašto se ovi tipovi zovu „sume“ (kardinalnost)
- preciznu definiciju algebarskog tipa podataka: suma proizvoda
- da tipovi sume mogu biti polimorfni i rekurzivni
- kada je tip sume pravi izbor: kada bi komponente proizvoda bile **zavisne**

## Intuitivno objašnjenje

Porudžbinu možete da platite karticom **ili** gotovinom. Ako plaćate karticom, važan je broj kartice; ako plaćate gotovinom, važno je koliko ste novca dali. Nikada oboje istovremeno.

Tip proizvoda kaže „ovo **i** ono“. Tip sume kaže „ovo **ili** ono“: vrednost je tačno **jedna od** nekoliko mogućnosti, i svaka mogućnost nosi svoje podatke. Broj mogućih vrednosti je **zbir** mogućnosti, odakle i ime.

## Problem koji rešavamo

Na kraju [prethodne lekcije](01-product-tipovi.md#kada-je-tip-proizvoda-pravi-izbor) videli smo model stanja učitavanja koji dozvoljava besmislene kombinacije:

```ts
interface RemoteData {
  readonly isLoading: boolean
  readonly data: string | undefined
  readonly error: string | undefined
}
```

Važeća stanja su samo tri: „učitava se“, „uspeh sa podacima“ i „greška sa porukom“. Napišimo tip koji kaže upravo to:

```ts
type RemoteData =
  | { readonly _tag: 'Loading' }
  | { readonly _tag: 'Success'; readonly data: string }
  | { readonly _tag: 'Failure'; readonly error: string }

const loading: RemoteData = { _tag: 'Loading' }
const success: RemoteData = { _tag: 'Success', data: 'rezultat' }

// @ts-expect-error — stanje "Loading" ne može da ima podatke
const nonsense: RemoteData = { _tag: 'Loading', data: 'rezultat' }
```

(Komentar `// @ts-expect-error` kaže TypeScript-u da u sledećem redu očekujemo grešku; ovde pokazuje da kompajler odbija besmisleno stanje.)

Besmislena stanja više nije moguće ni napisati. Polje `_tag` govori koja je od tri mogućnosti u pitanju; kako TypeScript koristi takvo polje videćemo detaljno u [sledećoj lekciji](03-discriminated-unions.md).

## Formalna definicija

Tip sume je struktura podataka koja sadrži vrednost koja može biti jednog od nekoliko različitih (ali fiksnih) tipova. U datom trenutku samo jedan od tipova može biti u upotrebi, a polje koje služi kao „tag“ pokazuje koji je od njih u upotrebi.

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

<details>
<summary>Odgovor</summary>

Nije. Tipovi objekata u TypeScript-u su „otvoreni“: vrednost `{ a: 'x', b: 1 }` ima i svojstvo `a` i svojstvo `b`, pa pripada i tipu `Member1` i tipu `Member2`.

```ts
type Member1 = { readonly a: string }
type Member2 = { readonly b: number }

const both = { a: 'x', b: 1 }
const m1: Member1 = both // u redu
const m2: Member2 = both // takođe u redu
```

</details>

U funkcionalnom programiranju teži se tome da se uvek koriste disjunktne unije. Srećom, u TypeScript-u postoji siguran način da se garantuje da je unija disjunktna: dodavanje posebnog polja koje služi kao **tag** — kao `_tag` u tipu `RemoteData`. Pošto svaki član ima drugačiju vrednost taga, nijedna vrednost ne može pripadati dvama članovima.

### Odakle naziv „tipovi sume“?

Važi sledeća jednakost:

```text
C(A | B) = C(A) + C(B)
```

> kardinalnost sume je suma kardinalnosti

Jednakost važi za **disjunktne** unije. Kod unija koje se preklapaju zajedničke vrednosti bi se brojale dvaput: `boolean | true` ima `2` stanovnika, a ne `3`.

**Primer** (tip `Option`)

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

Iz opšte formule dobijamo `C(Option<A>) = C(None) + C(Some<A>) = 1 + C(A)`, iz čega možemo da izvedemo, na primer, kardinalnost tipa `Option<boolean>`, odnosno `1 + 2 = 3` stanovnika:

- `{ _tag: 'None' }`
- `{ _tag: 'Some', value: true }`
- `{ _tag: 'Some', value: false }`

Tipu `Option` posvećena je [lekcija 5](05-option.md).

Proverimo i `RemoteData`: proizvod iz prethodne lekcije ima `2 · (N + 1) · (M + 1)` vrednosti (gde su `N` i `M` brojevi mogućih stringova za podatke i grešku), a suma `1 + N + M` — tačno onoliko koliko ima važećih stanja.

### Suma proizvoda

Sada kada smo videli obe familije, možemo eksplicitnije da preformulišemo šta je algebarski tip podataka:

> In general, an algebraic data type specifies a sum of one or more alternatives, where each alternative is a product of zero or more fields.

(U opštem slučaju, algebarski tip podataka je suma jedne ili više alternativa, gde je svaka alternativa proizvod nula ili više polja.)

`RemoteData` je suma tri alternative: `Loading` je proizvod nula polja (samo tag), `Success` i `Failure` imaju po jedno polje.

### Polimorfni i rekurzivni tipovi sume

Tipovi sume mogu biti **polimorfni** i **rekurzivni**.

**Primer** (povezana lista)

```ts
//               ↓ type parameter
export type List<A> =
  | { readonly _tag: 'Nil' }
  | { readonly _tag: 'Cons'; readonly head: A; readonly tail: List<A> }
//                                                              ↑ recursion
```

Lista je ili prazna (`Nil`), ili se sastoji od prvog elementa (`head`) i ostatka (`tail`), koji je i sam lista. Tako jedan konačan opis obuhvata liste proizvoljne dužine.

**Kviz** (TypeScript). Za sledeće strukture podataka odredite da li su tipovi proizvoda ili tipovi sume:

- `ReadonlyArray<A>`
- `Record<string, A>`
- `Record<'k1' | 'k2', A>`
- `ReadonlyMap<string, A>`
- `ReadonlyMap<'k1' | 'k2', A>`

<details>
<summary>Odgovor</summary>

- `ReadonlyArray<A>` — **suma**: niz je prazan, ili ima jedan element, ili dva…, odnosno `[] | [A] | [A, A] | …`. Svaka alternativa je proizvod.
- `Record<string, A>` — **suma**: različite vrednosti imaju različite skupove ključeva, a za svaki skup ključeva dobijamo proizvod.
- `Record<'k1' | 'k2', A>` — **proizvod**: oba ključa su uvek prisutna, pa je to isto što i `{ k1: A; k2: A }`, sa kardinalnošću `C(A) * C(A)`.
- `ReadonlyMap<string, A>` — **suma**, iz istog razloga kao `Record<string, A>`.
- `ReadonlyMap<'k1' | 'k2', A>` — **suma**: mapa može biti prazna, imati samo `k1`, samo `k2` ili oba ključa. Kardinalnost je `1 + C(A) + C(A) + C(A) * C(A) = (1 + C(A)) * (1 + C(A))`, što je isto kao kod proizvoda `{ k1: Option<A>; k2: Option<A> }`.

</details>

## Kada treba da koristim tip sume?

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
      // @ts-expect-error — Cannot invoke an object which is possibly 'undefined' :(
      this.props.onChange('a')
    }
    return null
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
    return null
  }
}
```

(U originalu komponenta vraća JSX, `<div />`; ovde vraća `null`, da bi primer mogao da se proveri kao običan `.ts` fajl.)

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

(Učinite da nemoguća stanja ne mogu da se predstave.)

Tip sume bi bio bolji izbor, ali koji? Odgovor je tip `Either`, kome je posvećena [lekcija 6](06-either.md).

**Kviz**. U poslednje vreme se umesto API-ja zasnovanih na callback-ovima sve više koriste API-ji koji vraćaju `Promise`

```ts
declare function readFile(path: string): Promise<string>
```

možete li da navedete jednu manu ovog drugog rešenja kada se koristi statički tipiziran jezik kao što je TypeScript?

<details>
<summary>Odgovor</summary>

Tip `Promise<string>` opisuje samo uspeh. Greška (razlog odbijanja, _rejection_) nije deo tipa: u `catch` grani ima tip `any` (ili `unknown`), pa kompajler ne zna koje greške su moguće i ne tera nas da ih obradimo. O tome više u [lekciji 7](07-neuspeh-bez-izuzetaka.md).

</details>

## Primer sa fp-ts

Tipovi `Option` i `Either` iz `fp-ts`-a definisani su upravo kao tipovi sume sa poljem `_tag`. Sva tri stanovnika tipa `Option<boolean>`:

```ts
import * as O from 'fp-ts/Option'

const all: ReadonlyArray<O.Option<boolean>> = [O.none, O.some(true), O.some(false)]

console.log(all)
/*
[
  { _tag: 'None' },
  { _tag: 'Some', value: true },
  { _tag: 'Some', value: false }
]
*/
```

## Najčešće greške

- **Unija koja nije disjunktna.** `{ a: string } | { b: number }` ili `ReadonlyArray<string> | ReadonlyArray<number>` imaju zajedničke vrednosti; dodajte tag.
- **Proizvod sa zavisnim opcionim poljima.** `{ method: 'card' | 'cash'; cardNumber?: string; cashReceived?: number }` dozvoljava gotovinsko plaćanje sa brojem kartice. Svaka alternativa treba da ima tačno svoja polja.
- **Više `boolean` zastavica.** Tri zastavice (`isLoading`, `isError`, `isEmpty`) daju `2³ = 8` kombinacija, a važećih stanja je obično manje. Tip sume imenuje svako stanje.
- **Unija tipova istog oblika bez oznake.** `type Contact = string | string` (email ili telefon?) se svodi na `string` — informacija o vrsti se gubi; potreban je tag.

## Vežba

1. Prepravite sledeći tip u tip sume. Koliko vrednosti ima originalni tip, a koliko vaš (označite sa `S` broj mogućih stringova, a sa `N` broj mogućih brojeva)?

```ts
interface Payment {
  readonly method: 'card' | 'cash'
  readonly cardNumber: string | undefined
  readonly cashReceived: number | undefined
}
```

2. Modelujte semafor (crveno, žuto, zeleno) i pešački semafor koji, pored boje, za zeleno svetlo pokazuje i broj preostalih sekundi.

<details>
<summary>Rešenje</summary>

1.

```ts
type Payment =
  | { readonly method: 'card'; readonly cardNumber: string }
  | { readonly method: 'cash'; readonly cashReceived: number }

const p1: Payment = { method: 'card', cardNumber: '4111 1111 1111 1111' }
const p2: Payment = { method: 'cash', cashReceived: 2000 }
```

Ako sa `S` označimo broj mogućih stringova, a sa `N` broj mogućih brojeva: originalni proizvod ima `2 · (S + 1) · (N + 1)` vrednosti, a suma `S + N`. Ulogu taga ovde ima polje `method`.

2.

```ts
type TrafficLight = 'red' | 'yellow' | 'green'

type PedestrianLight =
  | { readonly _tag: 'Red' }
  | { readonly _tag: 'Green'; readonly secondsLeft: number }

const car: TrafficLight = 'yellow'
const walk: PedestrianLight = { _tag: 'Green', secondsLeft: 12 }
```

Unija string literala (`'red' | 'yellow' | 'green'`) je takođe tip sume: alternative su disjunktne, a svaka je proizvod nula polja. Čim neka alternativa nosi podatke, potreban je objekat sa tagom.

</details>

## Sažetak

- **Tip sume** sadrži vrednost koja je tačno **jedna od** nekoliko fiksnih mogućnosti.
- Članovi moraju biti **disjunktni**; u TypeScript-u to garantuje polje-oznaka (tag).
- **Kardinalnost** sume je zbir kardinalnosti: `C(A | B) = C(A) + C(B)`; na primer `C(Option<A>) = 1 + C(A)`.
- Algebarski tip podataka je **suma proizvoda**.
- Tip sume biramo kada bi komponente proizvoda bile **zavisne**: _make impossible state unrepresentable_.

## Izvori

- Originalni prevod: definicija tipa sume, disjunktnost (`StringsOrNumbers`, kviz `Member1 | Member2`), kardinalnost sa primerom `Option<boolean>`, definicija ADT-a kao sume proizvoda, polimorfna rekurzivna lista, kviz o strukturama podataka, primeri sa React props i node callback-ovima, maksima i kviz o `Promise` iz poglavlja [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md#tipovi-sume).
- Novo u ovoj verziji: analogija sa plaćanjem, rešenje problema `RemoteData`, napomena o unijama koje se preklapaju, odgovori na kvizove, primer sa `fp-ts/Option`, najčešće greške i vežba. React primeri vraćaju `null` umesto JSX-a.

## Sledeća lekcija

Videli smo da tag čini uniju disjunktnom. U [lekciji 3 — Discriminated unions](03-discriminated-unions.md) gledamo šta TypeScript radi sa tagom: kako sužava tip, kako proverava da su obrađeni svi slučajevi i zašto su nam potrebni konstruktori.
