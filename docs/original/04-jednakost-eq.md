# Modelovanje jednakosti pomoću `Eq`

> [!NOTE]
> Poglavlje 4 originalnog prevoda. Tekst je neizmenjen — prilagođene su samo putanje do slika i koda i interne veze između poglavlja. [Sadržaj originalnog prevoda](index.md)
>
> Prerada ovog poglavlja planirana je u Celini 3 — Algebra i matematički zakoni (vidi [mapu sadržaja](../mapa-sadrzaja.md)).


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

---

[← Prethodno poglavlje](03-polugrupe.md) · [Sadržaj](index.md) · [Sledeće poglavlje →](05-uredjenje-ord.md)
