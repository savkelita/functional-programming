/*

  **Kviz**. Za dati tip `A` moguće je definisati instancu polugrupe
  za `Ord<A>`. Šta bi ona mogla da predstavlja?

*/

import { pipe } from 'fp-ts/function'
import * as O from 'fp-ts/Ord'
import { sort } from 'fp-ts/ReadonlyArray'
import { concatAll, Semigroup } from 'fp-ts/Semigroup'
import * as S from 'fp-ts/string'
import * as N from 'fp-ts/number'
import * as B from 'fp-ts/boolean'

/*

  pre svega definišimo instancu polugrupe za `Ord<A>`

*/

const getSemigroup = <A = never>(): Semigroup<O.Ord<A>> => ({
  concat: (first, second) =>
    O.fromCompare((a1, a2) => {
      const ordering = first.compare(a1, a2)
      return ordering !== 0 ? ordering : second.compare(a1, a2)
    })
})

/*

  a sada pogledajmo kako se primenjuje na praktičnom primeru

*/

interface User {
  readonly id: number
  readonly name: string
  readonly age: number
  readonly rememberMe: boolean
}

const byName = pipe(
  S.Ord,
  O.contramap((_: User) => _.name)
)

const byAge = pipe(
  N.Ord,
  O.contramap((_: User) => _.age)
)

const byRememberMe = pipe(
  B.Ord,
  O.contramap((_: User) => _.rememberMe)
)

const SemigroupOrdUser = getSemigroup<User>()

// predstavlja tabelu koju treba sortirati
const users: ReadonlyArray<User> = [
  { id: 1, name: 'Guido', age: 47, rememberMe: false },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true }
]

// klasično sortiranje:
// prvo po imenu, zatim po godinama, pa po `rememberMe`

const byNameAgeRememberMe = concatAll(SemigroupOrdUser)(byName)([
  byAge,
  byRememberMe
])
pipe(users, sort(byNameAgeRememberMe), console.log)
/*
[ { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/

// a sada želim sve korisnike sa
// `rememberMe = true` na početku

const byRememberMeNameAge = concatAll(SemigroupOrdUser)(
  O.reverse(byRememberMe)
)([byName, byAge])
pipe(users, sort(byRememberMeNameAge), console.log)
/*
[ { id: 4, name: 'Giulio', age: 44, rememberMe: true },
  { id: 2, name: 'Guido', age: 46, rememberMe: true },
  { id: 3, name: 'Giulio', age: 44, rememberMe: false },
  { id: 1, name: 'Guido', age: 47, rememberMe: false } ]
*/
