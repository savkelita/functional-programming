# Modelovanje uređenja pomoću `Ord`

> [!NOTE]
> Poglavlje 5 originalnog prevoda. Tekst je neizmenjen — prilagođene su samo putanje do slika i koda i interne veze između poglavlja. [Sadržaj originalnog prevoda](index.md)
>
> Prerada ovog poglavlja planirana je u Celini 3 — Algebra i matematički zakoni (vidi [mapu sadržaja](../mapa-sadrzaja.md)).


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

Kao što možemo da obrnemo operaciju `concat` da bismo dobili dualnu polugrupu (pomoću kombinatora [`reverse`](03-polugrupe.md#dualna-polugrupa)), tako se i operacija `compare` može obrnuti da bismo dobili dualno uređenje.

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

[`02_ord.ts`](../../src/02_ord.ts)

---

[← Prethodno poglavlje](04-jednakost-eq.md) · [Sadržaj](index.md) · [Sledeće poglavlje →](06-monoidi.md)
