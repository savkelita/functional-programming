# 8. Totalne i parcijalne funkcije

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 8 od 8
>
> **Predznanje:** [Čiste funkcije](02-ciste-funkcije.md) (domen i kodomen), [Referencijalna transparentnost](04-referencijalna-transparentnost.md) (zašto izuzeci nisu referencijalno transparentni). Korisno: [Kompozicija funkcija](06-kompozicija-funkcija.md#ne-komponuju-se-sve-funkcije).

## Šta ćemo naučiti?

- razliku između **parcijalne** i **totalne** funkcije
- kako da prepoznamo parcijalne funkcije u TypeScript-u — i zašto njihovi tipovi često „lažu“
- dva načina da parcijalnu funkciju učinimo totalnom: **proširivanje kodomena** i **sužavanje domena**
- zašto `undefined` nije dovoljno dobar „rezultat neuspeha“ — i kako to vodi ka tipu `Option`

## Intuitivno objašnjenje

Zamislite automat za napitke. Na jednom automatu, kada pritisnete dugme za napitak koji je nestao, pojavi se poruka „nema na stanju“. Na drugom automatu, isto dugme izazove kvar i automat prestane da radi.

Oba automata „ne mogu“ da vam daju napitak, ali se prvi ponaša **predvidljivo**: za **svako** dugme postoji definisan odgovor. To je totalna funkcija. Drugi automat ima dugmad za koju ishod nije definisan — to je parcijalna funkcija.

## Problem koji rešavamo

Pogledajmo funkciju koja vraća prvi element niza:

```ts
const head = <A>(as: ReadonlyArray<A>): A => as[0]

const n: number = head([]) // kompajler je zadovoljan...
console.log(n) // => undefined — a tip kaže `number`!
```

Potpis obećava: „daj mi niz `A`-ova i dobićeš `A`“. Za prazan niz to obećanje je laž. TypeScript, sa podrazumevanim podešavanjima (čak i u `strict` režimu), izrazu `as[0]` daje tip `A` iako niz može biti prazan. Greška se pojavljuje tek kasnije i na drugom mestu, na primer kao `TypeError` pri pozivu `n.toFixed(2)`.

Druga česta „rešenja“ nisu ništa bolja:

```ts
//                        this is a lie ↓
const head = <A>(as: ReadonlyArray<A>): A => {
  if (as.length === 0) {
    throw new Error('Empty array')
  }
  return as[0]
}
```

Sada funkcija bar ne vraća `undefined`, ali baca izuzetak — a sistem tipova ne zna ništa o mogućem neuspehu. Pozivalac ne vidi u potpisu da mora da se zaštiti, a izraz `head([])`, kao što znamo iz [lekcije 4](04-referencijalna-transparentnost.md), nije referencijalno transparentan.

## Formalna definicija

**Definicija**. _Parcijalna_ funkcija je funkcija koja nije definisana za sve vrednosti domena.

Obrnuto, funkcija koja je definisana za sve vrednosti domena naziva se _totalna_.

**Primer**

```ts
// Get the first element of a `ReadonlyArray`
declare const head: <A>(as: ReadonlyArray<A>) => A
```

**Kviz**. Zašto je funkcija `head` parcijalna?

<details>
<summary>Odgovor</summary>

Zato što za prazan niz ne postoji prvi element. Domen funkcije su _svi_ nizovi (`ReadonlyArray<A>`), uključujući i prazan, a za njega ne postoji vrednost tipa `A` koju bi funkcija mogla da vrati.

</details>

**Kviz**. Da li je funkcija `JSON.parse` totalna?

```ts nocheck
parse: (text: string, reviver?: (this: any, key: string, value: any) => any) =>
  any
```

<details>
<summary>Odgovor</summary>

Nije. Za tekst koji nije ispravan JSON (na primer `JSON.parse('{')`) baca `SyntaxError`. Uz to, povratni tip `any` ne kaže ništa o tome šta smo dobili.

</details>

**Kviz**. Da li je funkcija `JSON.stringify` totalna?

```ts nocheck
stringify: (
  value: any,
  replacer?: (this: any, key: string, value: any) => any,
  space?: string | number
) => string
```

<details>
<summary>Odgovor</summary>

Nije. Baca `TypeError` za objekte sa cikličnim referencama i za vrednosti tipa `bigint`. Pored toga, za `undefined`, funkcije i simbole vraća `undefined`, iako potpis obećava `string`.

</details>

U funkcionalnom programiranju teži se tome da se definišu samo **čiste i totalne funkcije** (od sada ću termin „funkcija“ koristiti kao sinonim za „čista i totalna funkcija“), pa kako onda postupiti kada imamo posla sa parcijalnom funkcijom?

Srećom, parcijalna funkcija `f: X ⟶ Y` uvek može da se svede na totalnu funkciju tako što se kodomenu doda posebna vrednost koja **ne pripada** skupu `Y`, nazovimo je `None`, i pridruži se svakoj vrednosti iz `X` za koju `f` nije definisana

```text
f': X ⟶ Y ∪ None
```

Uvedimo oznaku `Option(Y) = Y ∪ None`.

```text
f': X ⟶ Option(Y)
```

Ovo je prvi od dva načina koja ćemo videti: **proširivanje kodomena**. Drugi je **sužavanje domena** — umesto da menjamo izlaz, ne prihvatamo ulaze za koje funkcija nije definisana.

## Primer bez biblioteka

### Način 1: proširiti kodomen

U TypeScript-u najjednostavnija „posebna vrednost“ je `undefined`:

```ts
const head = <A>(as: ReadonlyArray<A>): A | undefined =>
  as.length > 0 ? as[0] : undefined

const n = head([1, 2, 3]) // n: number | undefined

// console.log(n.toFixed(2)) // greška pri kompajliranju: `n` može biti `undefined`

if (n !== undefined) {
  console.log(n.toFixed(2)) // => 1.00
}
```

Sada tip govori istinu, a kompajler nas **tera** da obradimo slučaj praznog niza. Ipak, `undefined` kao oznaka neuspeha ima dva problema:

```ts
const head = <A>(as: ReadonlyArray<A>): A | undefined =>
  as.length > 0 ? as[0] : undefined

// 1. `undefined` može da bude i legitimna vrednost
const xs: ReadonlyArray<string | undefined> = [undefined, 'b']
console.log(head(xs)) // => undefined — prazan niz ili prvi element `undefined`?

// 2. "neuspeh u neuspehu" se ne razlikuje od običnog neuspeha
const yss: ReadonlyArray<ReadonlyArray<number>> = [[]]
const first = head(yss) // ReadonlyArray<number> | undefined
const firstOfFirst = first === undefined ? undefined : head(first)
console.log(firstOfFirst) // => undefined — da li je prazan spoljni ili unutrašnji niz?
```

U oba slučaja informacija je izgubljena, jer se `A | undefined | undefined` svodi na `A | undefined`. Zato funkcionalno programiranje uvodi poseban tip, `Option`, koji tačno odgovara zapisu `Option(Y) = Y ∪ None` i nema ovih problema. Kako se `Option` definiše u TypeScript-u videćemo u Celini 2 (u originalnom kursu: [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md) i [Funkcionalno rukovanje greškama](../original/09-funkcionalno-rukovanje-greskama.md)).

### Način 2: suziti domen

Umesto da `head` vraća „možda `A`“, možemo da zahtevamo niz za koji prvi element **sigurno postoji**:

```ts
// niz sa bar jednim elementom: torka (tuple) čiji je prvi element tipa A,
// a za njim sledi proizvoljan broj (i nula) elemenata tipa A
type ReadonlyNonEmptyArray<A> = readonly [A, ...Array<A>]

const head = <A>(as: ReadonlyNonEmptyArray<A>): A => as[0]

console.log(head([1, 2, 3])) // => 1

// @ts-expect-error — prazan niz nije ReadonlyNonEmptyArray
head([])
```

(Komentar `// @ts-expect-error` kaže TypeScript-u da u sledećem redu očekujemo grešku; ovde pokazuje da kompajler odbija prazan niz.)

Sada je `head` totalna: za **svaki** element svog (užeg) domena vraća vrednost. Proveru da li je niz prazan nismo izbegli — samo smo je premestili na mesto gde se niz pravi, gde je obično i najprirodnija.

Isti obrazac radi i za druge funkcije: `inverse` koja ne prihvata nulu, ili funkcija koja prima već proveren tip (npr. `Age` umesto `string`), i slično. Koji način izabrati zavisi od toga gde je provera prirodnija: kada pozivalac obično već zna da je ulaz ispravan, sužavamo domen; kada ne zna, proširujemo kodomen.

## Primer sa fp-ts

`fp-ts` nudi oba pristupa:

```ts
import * as O from 'fp-ts/Option'
import * as RA from 'fp-ts/ReadonlyArray'
import * as RNEA from 'fp-ts/ReadonlyNonEmptyArray'

// proširen kodomen: rezultat je Option<number>
const a: O.Option<number> = RA.head([1, 2, 3])
const b: O.Option<number> = RA.head([])

console.log(a) // => { _tag: 'Some', value: 1 }
console.log(b) // => { _tag: 'None' }

// sužen domen: rezultat je number
const c: number = RNEA.head([1, 2, 3])

console.log(c) // => 1
```

I za JSON postoje totalne verzije, u modulu `fp-ts/Json`: `parse: (s: string) => Either<unknown, Json>` i `stringify: <A>(a: A) => Either<unknown, string>`. Tip `Either` je kao `Option`, ali uz neuspeh nosi i informaciju o grešci. Obrađujemo ga u Celini 2.

## Najčešće greške

- **„Operator `!` ili `as` rešava problem.“** `head(xs)!` samo kaže kompajleru „veruj mi“; ako je niz prazan, greška se seli u vreme izvršavanja.
- **„Specijalne vrednosti su dovoljne.“** `-1` iz `indexOf`/`findIndex`, `NaN` iz `Number('abc')` ili prazan string imaju isti tip kao ispravan rezultat, pa kompajler ne može da vas podseti da ih proverite.
- **„Izuzeci su dobar način za očekivane greške.“** Neispravan unos korisnika ili prazan niz su **očekivani** slučajevi i treba da budu vidljivi u tipu. Izuzeci su za zaista neočekivane situacije (greške u programu).
- **„Funkcija koja ne baca izuzetak je totalna.“** Totalnost znači da funkcija vraća vrednost za svaki ulaz iz domena. I beskonačna petlja čini funkciju parcijalnom: za taj ulaz nema rezultata. Isto važi i za funkciju koja „tiho“ vraća `undefined` iako tip obećava nešto drugo.
- **„TypeScript sam hvata pristup van granica niza.“** Ne hvata, osim ako ne uključite opciju kompajlera `noUncheckedIndexedAccess` (TypeScript 4.1+), uz koju `xs[i]` ima tip `A | undefined`.

## Vežba

1. Funkcija `inverse` iz [lekcije 4](04-referencijalna-transparentnost.md) baca izuzetak za `0`. Napišite totalnu verziju koja proširuje kodomen (`number | undefined`).
2. Napišite totalnu funkciju `last` koja vraća poslednji element **nepraznog** niza (sužavanje domena).
3. Napišite totalnu funkciju `parseAge: (input: string) => number | undefined` koja vraća broj godina samo ako je unos ceo broj između `0` i `150`.

<details>
<summary>Rešenje</summary>

```ts
// 1. proširen kodomen
const inverse = (n: number): number | undefined =>
  n === 0 ? undefined : 1 / n

console.log(inverse(4)) // => 0.25
console.log(inverse(0)) // => undefined

// 2. sužen domen
type ReadonlyNonEmptyArray<A> = readonly [A, ...Array<A>]

const last = <A>(as: ReadonlyNonEmptyArray<A>): A => as[as.length - 1]

console.log(last([1, 2, 3])) // => 3

// 3. proširen kodomen
const parseAge = (input: string): number | undefined => {
  const n = Number(input.trim())
  return Number.isInteger(n) && n >= 0 && n <= 150 ? n : undefined
}

console.log(parseAge('42')) // => 42
console.log(parseAge('abc')) // => undefined
console.log(parseAge('4.5')) // => undefined
```

Napomena uz `parseAge`: `Number('')` je `0`, pa prazan unos daje `0`. Da li je to prihvatljivo zavisi od zahteva; ako nije, dodajte proveru `input.trim() !== ''`. Ovakve odluke postaju vidljive tek kada funkciju pišemo totalno.

</details>

## Sažetak

- **Parcijalna** funkcija nije definisana za sve vrednosti domena; **totalna** jeste.
- U TypeScript-u parcijalne funkcije često imaju tipove koji „lažu“: vraćaju `undefined` ili bacaju izuzetak iako potpis to ne pominje.
- Parcijalnu funkciju činimo totalnom **proširivanjem kodomena** (`X ⟶ Option(Y)`) ili **sužavanjem domena** (npr. `ReadonlyNonEmptyArray`).
- `undefined` je slaba oznaka neuspeha (može biti legitimna vrednost, ne razlikuje ugnežđene neuspehe); zato postoji tip `Option`.
- Cilj: samo **čiste i totalne** funkcije — i tipovi koji govore istinu.

## Izvori

- Originalni prevod: definicije parcijalne i totalne funkcije, primer `head`, kvizovi o `JSON.parse` i `JSON.stringify` i konstrukcija `Option(Y)` iz poglavlja [Čiste funkcije i parcijalne funkcije](../original/07-ciste-i-parcijalne-funkcije.md); `head` koji baca izuzetak („this is a lie“) iz odeljka [Tip `Option`](../original/09-funkcionalno-rukovanje-greskama.md#tip-option) poglavlja Funkcionalno rukovanje greškama.
- Novo u ovoj verziji: analogija sa automatom, primer `head` koji vraća `undefined`, odgovori na kvizove, proširivanje kodomena pomoću `undefined` i njegova ograničenja, sužavanje domena pomoću `ReadonlyNonEmptyArray`, primeri sa `fp-ts`, najčešće greške i vežba.

## Sledeća lekcija

Ovim se završava Celina 1. Sledeća je [Celina 2 — Modelovanje podataka i grešaka](../02-modelovanje/index.md), u kojoj tipovima proizvoda i sume modelujemo podatke tako da „nemoguća stanja ne mogu da se predstave“, a zatim definišemo `Option` i `Either`. Celina je u pripremi; do tada je gradivo dostupno u originalnom prevodu: [Algebarski tipovi podataka](../original/08-algebarski-tipovi-podataka.md) i [Funkcionalno rukovanje greškama](../original/09-funkcionalno-rukovanje-greskama.md).
