import { Semigroup } from 'fp-ts/Semigroup'
import * as fc from 'fast-check'

// -------------------------------------------------------------------------------------
// laws
// -------------------------------------------------------------------------------------

// pre svega, svojstvo asocijativnosti kodiram kao funkciju koja vraća `boolean`

export const laws = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>) => (a: A, b: A, c: A): boolean =>
      S.concat(S.concat(a, b), c) === S.concat(a, S.concat(b, c))
  }
}

// -------------------------------------------------------------------------------------
// properties
// -------------------------------------------------------------------------------------

// zatim definišem `property` iz `fast-check`-a pomoću funkcije koja prima polugrupu koju testiramo (parametar `S`)
// i `Arbitrary` iz `fast-check`-a.
// `Arbitrary<A>` je tip podataka koji predstavlja mogućnost nasumičnog kreiranja vrednosti tipa `A`.

export const properties = {
  semigroup: {
    associativity: <A>(S: Semigroup<A>, arb: fc.Arbitrary<A>) =>
      // pošto su definisanom zakonu potrebna tri parametra (`a`, `b`, `c`),
      // prosleđujem arbitrary funkciji `fc.property` tri puta, jednom za svaki parametar.
      fc.property(arb, arb, arb, laws.semigroup.associativity(S))
  }
}

// Od tog trenutka biblioteka sve radi sama kada pozovem `fc.assert`, odnosno bombarduje svojstvo
// definisano iznad nasumičnim trojkama koje koristi kao `a`, `b`, `c` i proverava da li svojstvo uvek vraća `true`

// Ako to nije slučaj, biblioteka može da prikaže kontraprimer.
// Ako pogledate niže, testiram svojstvo asocijativnosti za magmu `MagmaSub` (koju smo videli u kursu)

// -------------------------------------------------------------------------------------
// tests
// -------------------------------------------------------------------------------------

import { Magma } from 'fp-ts/Magma'

export const MagmaSub: Magma<number> = {
  concat: (x, y) => x - y
}

// dokazuje da `MagmaSub` nije polugrupa ako se pronađe kontraprimer
// u ovom slučaju `MagmaSub` bombardujem nasumičnim celim brojevima koristeći
// Arbitrary `fc.integer` koji obezbeđuje `fast-check`
fc.assert(properties.semigroup.associativity(MagmaSub, fc.integer()))

// ako pokrenete ovaj fajl sa `ts-node src/laws.ts`, trebalo bi da vidite izlaz poput ovog:
/*
Error: Property failed after 1 tests
{ seed: 1835229399, path: "0:0:0:1:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0:0", endOnFailure: true }
Counterexample: [0,0,1]
Shrunk 32 time(s)
Got error: Property failed by returning false
*/

// Pronađeni kontraprimer je [0,0,1] (to je torka parametara `[a, b, c]` za koju zakon ne važi)
// Zaista:
// console.log(pipe(0, MagmaSub.concat(0), MagmaSub.concat(1))) // => -1
// console.log(pipe(0, MagmaSub.concat(pipe(0, MagmaSub.concat(1))))) // => 1

// -------------------------------------

// da li `last` i `first` daju polugrupe? ne mogu to sa sigurnošću da tvrdim koristeći
// property testing, jer sledeći assert-ovi NE daju kontraprimere

// fc.assert(properties.semigroup.associativity(Se.first<number>(), fc.integer()))
// fc.assert(properties.semigroup.associativity(Se.last<number>(), fc.integer()))
