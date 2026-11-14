/**
 * Modelovati rezultat jednog gema u tenisu
 */
type Player = 'A' | 'B'

type Game = unknown

/**
 * Početni rezultat
 */
const start: Game = null

/**
 * Za dati rezultat i igrača koji je osvojio poen vraća novi rezultat
 */
declare const win: (player: Player) => (game: Game) => Game

/**
 * Vraća rezultat u čitljivom obliku
 */
declare const show: (game: Game) => string

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'
import { pipe } from 'fp-ts/function'

assert.deepStrictEqual(
  pipe(start, win('A'), win('A'), win('A'), win('A'), show),
  'game player A'
)

const fifteenAll = pipe(start, win('A'), win('B'))
assert.deepStrictEqual(pipe(fifteenAll, show), '15 - all')

const fourtyAll = pipe(fifteenAll, win('A'), win('B'), win('A'), win('B'))
assert.deepStrictEqual(pipe(fourtyAll, show), '40 - all')

const advantageA = pipe(fourtyAll, win('A'))
assert.deepStrictEqual(pipe(advantageA, show), 'advantage player A')

assert.deepStrictEqual(pipe(advantageA, win('B'), show), 'deuce')
