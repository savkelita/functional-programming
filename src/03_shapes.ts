// run `npm run shapes` to execute
/*
  PROBLEM: implementirati sistem za crtanje geometrijskih oblika na canvas-u.
*/
import { pipe } from 'fp-ts/function'
import { Monoid, concatAll } from 'fp-ts/Monoid'

// -------------------------------------------------------------------------------------
// model
// -------------------------------------------------------------------------------------

export interface Point {
  readonly x: number
  readonly y: number
}

/**
 * Oblik je funkcija koja za datu tačku
 * vraća `true` ako tačka pripada obliku, a `false` u suprotnom
 *
 * > Sometimes, the elegant implementation is just a function. Not a method. Not a class. Not a framework. Just a function.
 * > - John Carmack
 */
export type Shape = (point: Point) => boolean

/*

  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFTTTTTTTTFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF
  FFFFFFFFFFFFFFFFFFFFFF

       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧
       ▧▧▧▧▧▧▧▧

*/

// -------------------------------------------------------------------------------------
// primitives
// -------------------------------------------------------------------------------------

/**
 * Pravi oblik koji predstavlja krug
 */
export const disk = (center: Point, radius: number): Shape => (point) =>
  distance(point, center) <= radius

// euklidsko rastojanje
const distance = (p1: Point, p2: Point) =>
  Math.sqrt(
    Math.pow(Math.abs(p1.x - p2.x), 2) + Math.pow(Math.abs(p1.y - p2.y), 2)
  )

// pipe(disk({ x: 200, y: 200 }, 100), draw)

// -------------------------------------------------------------------------------------
// combinators
// -------------------------------------------------------------------------------------

/**
 * Možemo da definišemo prvi kombinator koji za dati oblik
 * vraća njegov komplementarni oblik (negativ)
 */
export const outside = (s: Shape): Shape => (point) => !s(point)

// pipe(disk({ x: 200, y: 200 }, 100), outside, draw)

// -------------------------------------------------------------------------------------
// instances
// -------------------------------------------------------------------------------------

/**
 * Monoid u kome `concat` predstavlja uniju dva oblika
 */
export const MonoidUnion: Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) || second(point),
  empty: () => false
}

// pipe(
//   MonoidUnion.concat(
//     disk({ x: 150, y: 200 }, 100),
//     disk({ x: 250, y: 200 }, 100)
//   ),
//   draw
// )

/**
 * Monoid u kome `concat` predstavlja presek dva oblika
 */
const MonoidIntersection: Monoid<Shape> = {
  concat: (first, second) => (point) => first(point) && second(point),
  empty: () => true
}

// pipe(
//   MonoidIntersection.concat(
//     disk({ x: 150, y: 200 }, 100),
//     disk({ x: 250, y: 200 }, 100)
//   ),
//   draw
// )

/**
 * Koristeći kombinator `outside` i `MonoidIntersection` možemo
 * da napravimo oblik koji predstavlja prsten
 */
export const ring = (
  point: Point,
  bigRadius: number,
  smallRadius: number
): Shape =>
  MonoidIntersection.concat(
    disk(point, bigRadius),
    outside(disk(point, smallRadius))
  )

// pipe(ring({ x: 200, y: 200 }, 100, 50), draw)

export const mickeymouse: ReadonlyArray<Shape> = [
  disk({ x: 200, y: 200 }, 100),
  disk({ x: 130, y: 100 }, 60),
  disk({ x: 280, y: 100 }, 60)
]

// pipe(concatAll(MonoidUnion)(mickeymouse), draw)

// -------------------------------------------------------------------------------------
// utils
// -------------------------------------------------------------------------------------

export function draw(shape: Shape): void {
  const canvas: HTMLCanvasElement = document.getElementById('canvas') as any
  const ctx: CanvasRenderingContext2D = canvas.getContext('2d') as any
  const width = canvas.width
  const height = canvas.height
  const imagedata = ctx.createImageData(width, height)
  for (let x = 0; x < width; x++) {
    for (let y = 0; y < height; y++) {
      const point: Point = { x, y }
      if (shape(point)) {
        const pixelIndex = (point.y * width + point.x) * 4
        imagedata.data[pixelIndex] = 0
        imagedata.data[pixelIndex + 1] = 0
        imagedata.data[pixelIndex + 2] = 0
        imagedata.data[pixelIndex + 3] = 255
      }
    }
  }
  ctx.putImageData(imagedata, 0, 0)
}
