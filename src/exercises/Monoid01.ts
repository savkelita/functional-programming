/**
 * Pretpostavimo da imamo `ReadonlyArray<A>`, ali da nemamo na raspolaganju instancu monoida za `A`;
 * uvek možemo da mapiramo listu i pretvorimo je u listu tipa za koji imamo instancu.
 *
 * Ovu operaciju obavlja sledeća funkcija `foldMap`, koju treba da implementirate.
 */
import { Monoid } from 'fp-ts/Monoid'
import * as N from 'fp-ts/number'

declare const foldMap: <B>(
  M: Monoid<B>
) => <A>(f: (a: A) => B) => (as: ReadonlyArray<A>) => B

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

interface Bonifico {
  readonly causale: string
  readonly importo: number
}

const bonifici: ReadonlyArray<Bonifico> = [
  { causale: 'causale1', importo: 1000 },
  { causale: 'causale2', importo: 500 },
  { causale: 'causale3', importo: 350 }
]

// računa zbir bankovnih transfera
assert.deepStrictEqual(
  pipe(
    bonifici,
    foldMap(N.MonoidSum)((bonifico) => bonifico.importo)
  ),
  1850
)
