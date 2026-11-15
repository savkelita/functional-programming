# 2. Čiste funkcije

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 2 od 8
>
> **Predznanje:** osnove TypeScript-a. Preporučeno: [Uvod u funkcionalno programiranje](01-uvod.md) (radna definicija čiste funkcije).

## Šta ćemo naučiti?

- koja **dva uslova** čistu funkciju razlikuju od obične procedure
- kako da prepoznamo nečistu proceduru i kako da je pretvorimo u čistu funkciju
- kako matematika definiše funkciju (kao skup parova) i zašto su u matematici sve funkcije čiste
- zašto je **lokalna** mutabilnost dozvoljena
- šta dobijamo čistim funkcijama: lako testiranje, ponovnu upotrebu i bezbedno keširanje

## Intuitivno objašnjenje

Zamislite da funkciju možete da zamenite **tabelom** koja za svaki ulaz navodi izlaz. Za `double` bi tabela izgledala ovako:

| ulaz | izlaz |
| ---- | ----- |
| 1    | 2     |
| 2    | 4     |
| 3    | 6     |
| ...  | ...   |

Ako bi program radio potpuno isto kada bismo proceduru zamenili takvom (možda beskonačnom) tabelom, procedura je **čista funkcija**.

Ovaj misaoni eksperiment otkriva dva uslova:

1. **Isti ulaz, isti izlaz.** Tabela za isti ulaz uvek daje isti red. Procedura koja koristi `Math.random()` ili trenutno vreme ne može se zameniti tabelom.
2. **Nema uočljivih sporednih efekata.** Tabela ne radi ništa — ne piše na konzolu, ne menja promenljive i ne šalje zahteve. Ako procedura to radi, zamena tabelom bi promenila ponašanje programa.

## Problem koji rešavamo

**Nečiste procedure se teško testiraju.** Pogledajte proceduru koja proverava da li je danas vikend:

```ts
const isWeekendToday = (): boolean => {
  const day = new Date().getDay() // 0 = nedelja, 6 = subota
  return day === 0 || day === 6
}
```

Rezultat testa zavisi od dana kada ga pokrenete. Datum je **skriveni ulaz**: procedura ga koristi, a on se ne vidi u potpisu. Rešenje je da skriveni ulaz postane parametar:

```ts
const isWeekend = (date: Date): boolean => {
  const day = date.getDay() // 0 = nedelja, 6 = subota
  return day === 0 || day === 6
}

console.log(isWeekend(new Date(2024, 0, 6))) // => true (subota, 6. januar 2024)
console.log(isWeekend(new Date(2024, 0, 8))) // => false (ponedeljak, 8. januar 2024)
```

Sada je funkcija čista, a test je trivijalan. Odgovornost za „trenutno vreme“ prelazi na onoga ko je poziva.

**Nečiste procedure iznenađuju onoga ko ih poziva.** Metoda `sort` sortira niz _na mestu_, odnosno menja ga:

```ts
const sortedPrices = (prices: Array<number>): Array<number> =>
  prices.sort((a, b) => a - b)

const prices = [300, 100, 200]
const sorted = sortedPrices(prices)

console.log(sorted) // => [ 100, 200, 300 ]
console.log(prices) // => [ 100, 200, 300 ] — originalni niz je promenjen!
```

Ime obećava da vraća sortirane cene, a usput menja i niz koji je dobila. Čista verzija pravi kopiju pre sortiranja (`ReadonlyArray` je niz koji kompajler ne dozvoljava da se menja; detaljno u [lekciji 5](05-nepromenljivost.md)):

```ts
const sortedPrices = (prices: ReadonlyArray<number>): ReadonlyArray<number> =>
  prices.slice().sort((a, b) => a - b)

const prices = [300, 100, 200]
const sorted = sortedPrices(prices)

console.log(sorted) // => [ 100, 200, 300 ]
console.log(prices) // => [ 300, 100, 200 ]
```

## Primer bez biblioteka: kako prepoznati nečistu proceduru

Procedura **nije** čista funkcija ako:

| Simptom                                                     | Primer                                             |
| ----------------------------------------------------------- | -------------------------------------------------- |
| čita promenljivo stanje van sebe                            | `let rate = 0.2; const f = (x) => x * rate`         |
| koristi izvor nedeterminizma                                | `Math.random()`, `Date.now()`, `new Date()`         |
| menja svoje argumente ili spoljne promenljive               | `xs.push(4)`, `counter++`, `user.name = '...'`      |
| komunicira sa spoljnim svetom                               | `console.log`, čitanje fajla, upis u bazu, HTTP     |
| baca izuzetak                                               | `throw new Error(...)` (videti [lekciju 8](08-totalne-i-parcijalne-funkcije.md)) |

Nečistu proceduru najčešće možemo da „očistimo“ po sledećem receptu:

1. **skrivene ulaze pretvorimo u parametre** (kao datum u primeru `isWeekend`)
2. **umesto da izvrši akciju, funkcija vraća vrednost** (rezultat ili opis onoga što treba uraditi), a akciju izvršava onaj ko je poziva
3. **umesto da menja ulaz, funkcija vraća novu vrednost** (kao `slice` pre `sort`)

Primer: procedura koja zavisi od globalnog podešavanja i piše na konzolu

```ts
let language: 'sr' | 'en' = 'sr'

const greet = (name: string): void => {
  console.log(language === 'sr' ? `Zdravo, ${name}!` : `Hello, ${name}!`)
}

greet('Ana') // => Zdravo, Ana!
```

postaje čista funkcija koja samo **računa** pozdrav, dok ispis ostaje pozivaocu:

```ts
const greeting = (name: string, language: 'sr' | 'en'): string =>
  language === 'sr' ? `Zdravo, ${name}!` : `Hello, ${name}!`

console.log(greeting('Ana', 'sr')) // => Zdravo, Ana!
console.log(greeting('Ana', 'en')) // => Hello, Ana!
```

## Formalna definicija

Formulacija „isti ulaz, isti izlaz, bez sporednih efekata“ može da ostavi prostora za nedoumice (na primer, šta je tačno „sporedni efekat“?). Pogledajmo zato kako matematika definiše funkciju.

Ako su `X` i `Y` dva skupa, onda se sa `X × Y` označava njihov _Dekartov proizvod_, odnosno skup svih parova

```text
X × Y = { (x, y) | x ∈ X, y ∈ Y }
```

**Definicija**. _Funkcija_ `f: X ⟶ Y` je podskup `f` skupa `X × Y` takav da za svako `x ∈ X` postoji tačno jedno `y ∈ Y` takvo da par `(x, y) ∈ f`.

Skup `X` naziva se _domen_ funkcije `f`, a `Y` njen _kodomen_.

Primetite da skup `f` mora da bude opisan _statički_ u trenutku definisanja funkcije (odnosno elementi tog skupa ne mogu da se menjaju tokom vremena niti pod uticajem bilo kakvog unutrašnjeg ili spoljašnjeg uslova).

**Primer**

Funkcija `double: Nat ⟶ Nat`, gde je `Nat` skup prirodnih brojeva, jeste podskup Dekartovog proizvoda `Nat × Nat` koji čine parovi `{ (1, 2), (2, 4), (3, 6), ...}`.

U TypeScript-u bi `f` mogla da se definiše ovako:

```ts nocheck
const f: Record<number, number> = {
  1: 2,
  2: 4,
  3: 6
  ...
}
```

Ovo je upravo „tabela“ iz intuitivnog objašnjenja. Definicija iz primera naziva se _ekstenzionalna_ definicija funkcije: elementi domena se nabrajaju jedan po jedan i za svaki od njih se navodi odgovarajući element kodomena. Naravno, kada je skup beskonačan, kao u ovom slučaju, ovakva definicija može da bude pomalo „nezgodna“.

Ovaj problem može da se zaobiđe uvođenjem takozvane _intenzionalne_ definicije: izražava se uslov koji mora da važi za sve parove `(x, y)` koji pripadaju skupu `f`, a to je `y = x * 2`. To je poznati oblik u kome pišemo funkciju `double` i način na koji je definišemo u TypeScript-u:

```ts
const double = (x: number): number => x * 2
```

Definicija funkcije kao podskupa Dekartovog proizvoda pokazuje da su u matematici sve funkcije čiste: nema akcije, promene stanja niti izmene elemenata (koji se smatraju nepromenljivim) skupova o kojima je reč. U funkcionalnom programiranju implementacija funkcija treba da teži ovom idealnom modelu.

Precizna definicija **sporednog efekta** oslanja se na pojam referencijalne transparentnosti, pa je dajemo u [lekciji 4](04-referencijalna-transparentnost.md#sporedni-efekat-precizna-definicija).

### Kviz

Koje od sledećih procedura su čiste funkcije?

```ts
const coefficient1 = 2
export const f1 = (n: number) => n * coefficient1

// ------------------------------------------------------

let coefficient2 = 2
export const f2 = (n: number) => n * coefficient2++

// ------------------------------------------------------

let coefficient3 = 2
export const f3 = (n: number) => n * coefficient3

// ------------------------------------------------------

export const f4 = (n: number) => {
  const out = n * 2
  console.log(out)
  return out
}

// ------------------------------------------------------

interface User {
  readonly id: number
  readonly name: string
}

export declare const f5: (id: number) => Promise<User>

// ------------------------------------------------------

import * as fs from 'fs'

export const f6 = (path: string): string =>
  fs.readFileSync(path, { encoding: 'utf8' })

// ------------------------------------------------------

export const f7 = (
  path: string,
  callback: (err: Error | null, data: string) => void
): void => fs.readFile(path, { encoding: 'utf8' }, callback)
```

<details>
<summary>Odgovori</summary>

- `f1` — **čista**. Čita spoljnu vrednost, ali je ona `const` i nikada se ne menja.
- `f2` — **nije čista**. Svaki poziv menja `coefficient2`, pa `f2(1)` prvi put vraća `2`, drugi put `3`.
- `f3` — **ne smemo je smatrati čistom**. Dok god niko ne menja `coefficient3`, ponaša se kao `f1`. Ali promenljiva je deklarisana sa `let`, pa čistoća ne zavisi od same funkcije, već od celog ostatka modula. Rešenje: `const` ili parametar.
- `f4` — **nije čista**. Uvek vraća isti rezultat, ali ispis na konzolu je uočljiv sporedni efekat.
- `f5` — **nije čista**. Rezultat zavisi od stanja spoljnog sistema (baze, servera), a poziv pokreće zahtev.
- `f6` — **nije čista**. Rezultat zavisi od sadržaja fajl sistema, koji se menja nezavisno od programa.
- `f7` — **nije čista**. Vraća `void`, a sav njen posao je komunikacija sa fajl sistemom.

</details>

## Lokalna mutabilnost je dozvoljena

To što je funkcija čista ne znači nužno da je mutabilnost zabranjena: lokalno je dozvoljena ako ne izlazi van granica implementacije.

```ts
const sum = (ns: ReadonlyArray<number>): number => {
  let out = 0 // <= lokalna mutabilnost
  for (const n of ns) {
    out += n
  }
  return out
}

console.log(sum([1, 2, 3])) // => 6
```

Promenljiva `out` nastaje i nestaje unutar jednog poziva; spolja to niko ne može da primeti. (U originalnom kursu isti primer dat je na funkciji `concatAll` za monoide, koje upoznajemo u Celini 3.)

Pravi cilj je uvek da se obezbedi osnovno svojstvo **referencijalne transparentnosti** ([lekcija 4](04-referencijalna-transparentnost.md)).

Ugovor koji sklapamo sa korisnikom našeg API-ja definisan je njegovim potpisom:

```ts nocheck
declare const sum: (ns: ReadonlyArray<number>) => number
```

i obećanjem da ćemo poštovati referencijalnu transparentnost; tehnički detalji o tome kako je funkcija konkretno implementirana nisu bitni i nisu predmet razmatranja, tako da postoji potpuna sloboda.

## Šta dobijamo čistim funkcijama

- **Testiranje bez pripreme okruženja.** Test je poziv i poređenje: `isWeekend(new Date(2024, 0, 6))` mora da bude `true`. Nisu potrebni mock-ovi ni globalno stanje.
- **Ponovnu upotrebu.** Funkcija nema skrivenih zavisnosti, pa radi isto u svakom kontekstu.
- **Bezbedno keširanje (memoizaciju).** Ako je rezultat određen samo argumentima, smemo da ga zapamtimo:

```ts
const memoize = <A>(f: (n: number) => A) => {
  const cache = new Map<number, A>()
  return (n: number): A => {
    if (!cache.has(n)) {
      cache.set(n, f(n))
    }
    // `!` kaže kompajleru da vrednost sigurno postoji (upravo smo je upisali)
    return cache.get(n)!
  }
}

const slowSquare = (n: number): number => {
  // zamislite skupo izračunavanje
  return n * n
}

const fastSquare = memoize(slowSquare)

console.log(fastSquare(9)) // => 81 (izračunato)
console.log(fastSquare(9)) // => 81 (iz keša)
```

Primetite dve stvari. Prvo, `memoize` interno menja keš, ali se spolja ponaša kao čista funkcija. To nije baš lokalna mutabilnost iz prethodnog odeljka (keš živi duže od jednog poziva), ali je promena skrivena u zatvorenoj promenljivoj i spolja se ne može primetiti — osim po brzini. Drugo, memoizacija nečiste procedure menja ponašanje programa: `memoize(() => Math.random())` bi „zamrznula“ prvi slučajan broj.

## Najčešće greške

- **„Čista funkcija ne sme da koristi `let` ni petlje.“** Sme, dok god promena ne izlazi van funkcije (odeljak o lokalnoj mutabilnosti).
- **„Čitanje bilo koje spoljne promenljive čini funkciju nečistom.“** Čitanje vrednosti koja se nikada ne menja (`const coefficient1`) je u redu. Problem je _promenljivo_ stanje.
- **„Ako funkcija uvek vraća isti rezultat, čista je.“** Nije dovoljno: `f4` uvek vraća isti rezultat, ali piše na konzolu.
- **„Metode nizova su bezbedne.“** `sort`, `reverse`, `splice`, `push`, `pop`, `shift`, `unshift` i `fill` menjaju niz na kom su pozvane.
- **„Funkcija bez parametara ne može biti čista.“** Može, ako uvek vraća istu vrednost (konstanta). `() => Date.now()` nije čista.

## Vežba

1. Koje od sledećih procedura su čiste funkcije?

```ts
const a = (xs: ReadonlyArray<number>): number => xs.length

let calls = 0
const b = (x: number): number => {
  calls++
  return x + 1
}

const c = (user: { name: string }): void => {
  user.name = user.name.trim()
}

const d = (min: number, max: number): number =>
  min + Math.random() * (max - min)

const e = (s: string): string => {
  const words = s.split(' ')
  words.reverse()
  return words.join(' ')
}
```

2. Pretvorite sledeću proceduru u čistu funkciju:

```ts
let taxRate = 0.2
const history: Array<string> = []

const priceWithTax = (price: number): number => {
  const result = price * (1 + taxRate)
  history.push(`priceWithTax(${price}) = ${result}`)
  return result
}
```

<details>
<summary>Rešenje</summary>

1. `a` je čista. `b` nije (menja `calls`). `c` nije (menja argument i ništa ne vraća). `d` nije (`Math.random`). `e` **jeste** čista: `reverse` menja niz, ali taj niz je napravio `split` unutar same funkcije, pa je to lokalna mutabilnost.

2. Skriveni ulaz (`taxRate`) postaje parametar, a beleženje istorije prepuštamo pozivaocu:

```ts
const priceWithTax = (price: number, taxRate: number): number =>
  price * (1 + taxRate)

// pozivalac odlučuje šta će da uradi sa rezultatom
const history: Array<string> = []
const result = priceWithTax(1000, 0.2)
history.push(`priceWithTax(1000) = ${result}`)

console.log(result) // => 1200
```

</details>

## Sažetak

- Čista funkcija: **isti ulaz → isti izlaz** i **bez uočljivih sporednih efekata**.
- Test tabele: ako bi se procedura mogla zameniti tabelom ulaz → izlaz, a da program to ne primeti, ona je čista.
- U matematici je funkcija **podskup Dekartovog proizvoda** `X × Y` u kom svakom `x` odgovara tačno jedno `y`; zato su u matematici sve funkcije čiste.
- Nečistu proceduru čistimo tako što skrivene ulaze pretvorimo u parametre, a umesto akcija i izmena vraćamo vrednosti.
- **Lokalna mutabilnost je dozvoljena** dok god spolja nije uočljiva.

## Izvori

- Originalni prevod: radna definicija iz poglavlja [Šta je funkcionalno programiranje](../original/01-sta-je-funkcionalno-programiranje.md); formalna definicija funkcije, kviz `f1`–`f7`, lokalna mutabilnost i ugovor API-ja iz poglavlja [Čiste funkcije i parcijalne funkcije](../original/07-ciste-i-parcijalne-funkcije.md).
- Novo u ovoj verziji: tabela kao intuicija, primeri `isWeekend`, `sort` i `greeting`, recept za „čišćenje“ procedura, odgovori na kviz, primer `sum` (umesto `concatAll`), memoizacija, najčešće greške i vežba.

## Sledeća lekcija

U [lekciji 3 — Sporedni efekti](03-sporedni-efekti.md) bavimo se onim što čista funkcija _ne sme_ da radi: kako da prepoznamo sporedne efekte, zašto program ipak ne može bez njih i kako ih funkcionalni programi drže pod kontrolom.
