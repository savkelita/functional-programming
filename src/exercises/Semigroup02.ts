/**
 * Definisati polugrupu za predikate nad `Point`
 */
import { Predicate } from 'fp-ts/function'
import { Semigroup } from 'fp-ts/Semigroup'

type Point = {
  readonly x: number
  readonly y: number
}

const isPositiveX: Predicate<Point> = (p) => p.x >= 0
const isPositiveY: Predicate<Point> = (p) => p.y >= 0

declare const S: Semigroup<Predicate<Point>>

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

// vraća `true` ako tačka pripada prvom kvadrantu, odnosno ako su i njena `x` i njena `y` koordinata pozitivne
const isPositiveXY = S.concat(isPositiveX, isPositiveY)

assert.deepStrictEqual(isPositiveXY({ x: 1, y: 1 }), true)
assert.deepStrictEqual(isPositiveXY({ x: 1, y: -1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: 1 }), false)
assert.deepStrictEqual(isPositiveXY({ x: -1, y: -1 }), false)
