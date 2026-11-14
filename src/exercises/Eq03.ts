/**
 * Modelovati sat (minuti i sati)
 *
 * Da biste završili vežbu, treba da definišete tip `Clock` i njegovu instancu `Eq`
 */
import { Eq } from 'fp-ts/Eq'

// It's a 24 hour clock going from "00:00" to "23:59".
type Clock = unknown

declare const eqClock: Eq<Clock>

// takes an hour and minute, and returns an instance of Clock with those hours and minutes
declare const fromHourMin: (h: number, m: number) => Clock

// ------------------------------------
// tests
// ------------------------------------

import * as assert from 'assert'

assert.deepStrictEqual(
  eqClock.equals(fromHourMin(0, 0), fromHourMin(24, 0)),
  true
)
assert.deepStrictEqual(
  eqClock.equals(fromHourMin(12, 30), fromHourMin(36, 30)),
  true
)
