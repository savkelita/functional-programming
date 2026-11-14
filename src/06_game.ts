// ====================
// GUESS THE NUMBER
// ====================

import { pipe } from 'fp-ts/function'
import * as N from 'fp-ts/number'
import * as O from 'fp-ts/Option'
import { between } from 'fp-ts/Ord'
import { randomInt } from 'fp-ts/Random'
import * as T from 'fp-ts/Task'
import { getLine, putStrLn } from './Console'

// broj koji treba pogoditi
export const secret: T.Task<number> = T.fromIO(randomInt(1, 100))

// kombinator: ispisuje poruku pre neke akcije
const withMessage = (message: string) => <A>(next: T.Task<A>): T.Task<A> =>
  pipe(
    putStrLn(message),
    T.chain(() => next)
  )

// ulaz je string, pa moramo da ga validiramo
const isValidGuess = between(N.Ord)(1, 100)
const parseGuess = (s: string): O.Option<number> => {
  const n = parseInt(s, 10)
  return isNaN(n) || !isValidGuess(n) ? O.none : O.some(n)
}

const question: T.Task<string> = pipe(
  getLine,
  withMessage('Pogodi broj')
)

const answer: T.Task<number> = pipe(
  question,
  T.chain((s) =>
    pipe(
      s,
      parseGuess,
      O.match(
        () => pipe(answer, withMessage('Unesi ceo broj od 1 do 100')),
        (n) => T.of(n)
      )
    )
  )
)

const check = <A>(
  secret: number, // tajni broj koji treba pogoditi
  guess: number, // pokušaj korisnika
  ok: T.Task<A>, // šta uraditi ako je korisnik pogodio
  ko: T.Task<A> // šta uraditi ako korisnik NIJE pogodio
): T.Task<A> => {
  if (guess > secret) {
    return pipe(ko, withMessage('Previsoko'))
  } else if (guess < secret) {
    return pipe(ko, withMessage('Prenisko'))
  } else {
    return ok
  }
}

const end: T.Task<void> = putStrLn('Pogodak!')

// stanje (secret) čuvam kao argument funkcije (na Erlang način)
const loop = (secret: number): T.Task<void> =>
  pipe(
    answer,
    T.chain((guess) => check(secret, guess, end, loop(secret)))
  )

const program: T.Task<void> = pipe(secret, T.chain(loop))

program()
