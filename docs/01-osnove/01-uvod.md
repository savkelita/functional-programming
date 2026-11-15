# 1. Uvod u funkcionalno programiranje

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 1 od 8
>
> **Predznanje:** osnove TypeScript-a (tipovi, generici, arrow funkcije, nizovi). Prethodno znanje funkcionalnog programiranja nije potrebno.

## Šta ćemo naučiti?

- šta se misli pod „funkcionalnim programiranjem“ i šta je **čista funkcija** (radna definicija)
- kako izgleda program napisan u funkcionalnom stilu
- koji je cilj funkcionalnog programiranja i zašto su **ograničenja** korisna
- koja su dva stuba na kojima počiva ceo kurs

## Intuitivno objašnjenje

Zamislite tabelu u Excel-u. U ćeliji `C1` piše formula `=A1 * 2`. Ta formula:

- zavisi **samo** od onoga što joj je dato (vrednosti u `A1`)
- za istu vrednost u `A1` **uvek** daje isti rezultat
- ne menja nijednu drugu ćeliju, ne šalje mejlove i ne briše fajlove

Zato tabelama verujemo: kada promenimo `A1`, tačno znamo šta će se preračunati i znamo da se ništa drugo neće „samo od sebe“ promeniti. Takva formula ponaša se kao **funkcija u matematičkom smislu**.

Funkcionalno programiranje je pokušaj da se ceo program gradi od takvih delova:

> Functional Programming is programming with pure functions. Mathematical functions.

(Funkcionalno programiranje je programiranje čistim funkcijama — funkcijama u matematičkom smislu.)

Brza pretraga na internetu može vas dovesti do sledeće definicije:

> (Čista) funkcija je procedura koja za isti ulaz uvek vraća isti izlaz i nema nikakav uočljiv sporedni efekat (side effect).

Termin **sporedni efekat** za sada shvatite intuitivno: to je bilo šta što procedura radi pored toga što vraća vrednost — na primer otvaranje fajla da bi se pročitao njegov sadržaj, upis u bazu podataka ili ispis na konzolu. Sporednim efektima posvećena je [lekcija 3](03-sporedni-efekti.md), a preciznu definiciju dajemo u [lekciji 4](04-referencijalna-transparentnost.md).

> [!TIP]
> U TypeScript-u se reč „funkcija“ koristi za svaki blok koda koji se može pozvati. Da bi se izbegla zabuna, originalni kurs takav blok često naziva **procedurom**, a reč **funkcija** čuva za matematički pojam. Čista funkcija je procedura koja se ponaša kao matematička funkcija.

## Problem koji rešavamo

Pogledajmo proceduru koja računa ukupnu cenu korpe:

```ts
let discount = 0.1

const cart = {
  items: [
    { name: 'Knjiga', price: 1000 },
    { name: 'Olovka', price: 100 }
  ]
}

function total(): number {
  let sum = 0
  for (const item of cart.items) {
    sum += item.price
  }
  // usput dodajemo poklon u korpu
  cart.items.push({ name: 'Poklon', price: 0 })
  return sum - sum * discount
}
```

Da biste znali šta `total()` vraća, nije dovoljno da pročitate `total`:

- rezultat zavisi od `discount` i `cart` — ko ih još menja, i kada?
- svaki poziv **menja korpu**: posle drugog poziva u korpi su dva poklona
- da biste je testirali, morate da pripremite globalno stanje i da ga posle vratite

Kada program ima stotine ovakvih procedura, razumevanje jednog reda zahteva poznavanje celog programa. To je **složenost** koju funkcionalno programiranje pokušava da ukroti.

Evo iste računice napisane kao čista funkcija:

```ts
interface Item {
  readonly name: string
  readonly price: number
}

const total = (items: ReadonlyArray<Item>, discount: number): number => {
  const sum = items.reduce((acc, item) => acc + item.price, 0)
  return sum - sum * discount
}

const items: ReadonlyArray<Item> = [
  { name: 'Knjiga', price: 1000 },
  { name: 'Olovka', price: 100 }
]

console.log(total(items, 0.1)) // => 990
console.log(total(items, 0.1)) // => 990
```

Sve što funkcija koristi vidi se u njenom potpisu, rezultat zavisi samo od argumenata, a posle poziva svet je isti kao pre njega. (Oznake `readonly` i `ReadonlyArray` kažu kompajleru da se ti podaci ne smeju menjati; detaljno u [lekciji 5](05-nepromenljivost.md).)

## Kako izgleda program u funkcionalnom stilu

Ali kako je strukturiran program koji koristi samo čiste funkcije? Program u funkcionalnom stilu obično se piše kao **pipeline** (cevovod):

```ts nocheck
const program = pipe(
  input,
  f1, // čista funkcija
  f2, // čista funkcija
  f3, // čista funkcija
  ...
)
```

Ono što se dešava jeste da se `input` prosleđuje kao ulaz prvoj funkciji `f1`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz drugoj funkciji `f2`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz trećoj funkciji `f3`, i tako dalje.

Drugim rečima, `pipe(input, f1, f2, f3)` znači isto što i `f3(f2(f1(input)))`, samo što se čita sleva nadesno. Pogledajmo konkretan primer, prvo bez biblioteka:

```ts
const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const exclaim = (s: string): string => s + '!'

// čita se iznutra ka spolja: prvo trim, zatim toUpperCase, na kraju exclaim
console.log(exclaim(toUpperCase(trim('  zdravo  ')))) // => ZDRAVO!
```

a zatim sa funkcijom `pipe` iz biblioteke `fp-ts`:

```ts
import { pipe } from 'fp-ts/function'

const trim = (s: string): string => s.trim()
const toUpperCase = (s: string): string => s.toUpperCase()
const exclaim = (s: string): string => s + '!'

// čita se redom kojim se koraci izvršavaju
console.log(pipe('  zdravo  ', trim, toUpperCase, exclaim)) // => ZDRAVO!
```

Kako `pipe` radi i kako da je sami napišemo videćemo u [lekciji 7](07-pipe-i-flow.md). Kratak demo nalazi se i u fajlu [`00_pipe_and_flow.ts`](../../src/00_pipe_and_flow.ts).

## Cilj funkcionalnog programiranja

Pored toga što treba razumeti šta je funkcionalno programiranje, podjednako je važno razumeti koja je njegova svrha.

Cilj funkcionalnog programiranja je **ovladavanje složenošću sistema** korišćenjem formalnih modela, uz posebnu pažnju posvećenu **svojstvima koda** i lakoći refaktorisanja.

> Functional programming will help teach people the mathematics behind program construction:
>
> - how to write composable code
> - how to reason about side effects
> - how to write consistent, general, less ad-hoc APIs

Funkcionalno programiranje uči nas matematici koja stoji iza građenja programa: kako da pišemo kod koji se može komponovati, kako da rezonujemo o sporednim efektima i kako da pravimo dosledne, opšte API-je umesto rešenja „za jedan slučaj“.

## Primer: zašto je `map` „funkcionalnija“ od `for` petlje

Šta znači posvetiti pažnju svojstvima koda? Uporedimo dva načina da udvostručimo elemente niza.

```ts
// ulaz
const xs: Array<number> = [1, 2, 3]

// transformacija
const double = (n: number): number => n * 2

// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  ys.push(double(xs[i]))
}

console.log(ys) // => [ 2, 4, 6 ]
```

`for` petlja je veoma fleksibilna; mogu da izmenim:

- početni indeks
- uslov završetka
- korak

Ali to takođe znači da postoji više mogućnosti da se unesu **greške** i da nemam nikakvu **garanciju za rezultat**.

**Kviz**. Da li ste proverili da li je moja petlja dobro napisana?

<details>
<summary>Odgovor</summary>

Petlja je ispravna (`i` kreće od `0`, uslov je `i < xs.length`, korak je `i++`). Ali da biste to znali, morali ste da proverite sva tri dela. Upravo u tome je poenta: petlja vas tera da čitate detalje implementacije.

</details>

Pogledajmo sada kako se koristi `map`:

```ts
const xs: Array<number> = [1, 2, 3]
const double = (n: number): number => n * 2

// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys = xs.map(double)

console.log(ys) // => [ 2, 4, 6 ]
```

Primetite da je `map` manje fleksibilna, ali zato pruža više garancija:

- svi elementi ulaza biće obrađeni, od prvog do poslednjeg
- kakva god da je operacija koja se izvršava u callback-u, rezultat će uvek biti niz sa istim brojem elemenata kao ulazni niz

Sa funkcionalne tačke gledišta, gde su važnija svojstva koda nego detalji implementacije, operacija `map` je zanimljiva **upravo zato što je ograničena**.

Zamislite, na primer, koliko je lakši pregled (review) PR-a koji sadrži `map` nego onog koji sadrži `for` petlju.

## Dva stuba funkcionalnog programiranja

Funkcionalno programiranje počiva na sledeća dva stuba:

- **referencijalna transparentnost** — izraz se uvek može zameniti svojom vrednošću, pa kod možemo da razumemo deo po deo ([lekcija 4](04-referencijalna-transparentnost.md))
- **kompozicija** kao univerzalni design pattern — velike stvari gradimo spajanjem malih ([lekcija 6](06-kompozicija-funkcija.md))

Sve što ćemo kasnije videti u kursu proizilazi, direktno ili indirektno, iz ova dva stuba. Autor originalnog kursa to je prikazao [mapom uma](../original/index.md#mapa-uma-originalnog-kursa), koja otprilike odgovara ovom planu:

- **referencijalna transparentnost** zahteva
  - čiste i totalne funkcije (lekcije [2](02-ciste-funkcije.md) i [8](08-totalne-i-parcijalne-funkcije.md)), pa sporedni efekti postaju _efekti_, vrednosti koje ih opisuju ([lekcija 3](03-sporedni-efekti.md), Celina 5)
  - rukovanje greškama bez izuzetaka (lekcija 8, Celina 2)
  - nepromenljivost podataka ([lekcija 5](05-nepromenljivost.md))
- **kompozicija** obuhvata
  - kompoziciju funkcija, `pipe` i `flow` (lekcije [6](06-kompozicija-funkcija.md) i [7](07-pipe-i-flow.md))
  - kombinovanje i poređenje vrednosti: algebarske strukture `Semigroup`, `Monoid`, `Eq`, `Ord` (Celina 3)
  - kompoziciju funkcija koje vraćaju vrednost u nekom kontekstu: funktori, aplikativni funktori i monade (Celine 4 i 5)

## Biblioteke: fp-ts i Effect

Koncepte uvek prvo implementiramo „ručno“, bez biblioteka. Zatim pokazujemo kako isti koncept izgleda u biblioteci [`fp-ts`](https://github.com/gcanti/fp-ts), koju je napisao autor originalnog kursa. Primeri koriste `fp-ts` verzije 2.x (u ovom repozitorijumu 2.11):

```sh
npm install fp-ts
```

Razvoj `fp-ts`-a nastavljen je u okviru ekosistema [Effect](https://effect.website), koji se smatra njegovim naslednikom. Kada je korisno, ukazujemo i na odgovarajuće delove Effect-a. Biblioteke se menjaju, ali pojmovi koje učimo — čiste funkcije, kompozicija, algebarske strukture, funktori, monade — ostaju isti.

## Najčešće greške

- **„Funkcionalni program ne sme da radi ništa sa spoljnim svetom.“** Ne. Program koji ne čita i ne piše ništa ne bi bio koristan. Funkcionalno programiranje sporedne efekte **izoluje i kontroliše** ([lekcija 3](03-sporedni-efekti.md)).
- **„Funkcionalno programiranje znači koristiti `map`, `filter` i `reduce`.“** Te funkcije su posledica, a ne suština. Suština su svojstva koda. `xs.map((x) => { counter++; return x })` koristi `map`, ali nije funkcionalan kod jer callback menja spoljnu promenljivu.
- **„Za FP je potrebno poznavanje teorije kategorija.“** Nije. Matematika nam daje precizne definicije i zakone, ali se oni u ovom kursu uvode postepeno i uvek uz primer u TypeScript-u.
- **„FP i objektno orijentisano programiranje se isključuju.“** TypeScript podržava više paradigmi. Čiste funkcije i nepromenljivi podaci korisni su i u objektno orijentisanom kodu.

## Vežba

1. Prepišite sledeći kod tako da koristi `filter` i `map` umesto `for` petlje. Koje garancije daje `filter`?

```ts
const xs: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6]

const result: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  if (xs[i] % 2 === 0) {
    result.push(xs[i] * xs[i])
  }
}

console.log(result) // => [ 4, 16, 36 ]
```

2. Koju od dve verzije procedure `total` iz odeljka [Problem koji rešavamo](#problem-koji-rešavamo) biste radije testirali? Zašto?

<details>
<summary>Rešenje</summary>

1.

```ts
const xs: ReadonlyArray<number> = [1, 2, 3, 4, 5, 6]

const result = xs.filter((x) => x % 2 === 0).map((x) => x * x)

console.log(result) // => [ 4, 16, 36 ]
```

`filter` garantuje da rezultat sadrži samo elemente ulaza, nepromenjene i u istom redosledu, i da rezultat nije duži od ulaza. Kao i kod `map`, ne morate da proveravate indekse ni uslove petlje.

2. Čistu verziju. Test je samo poziv sa argumentima i poređenje rezultata: `total(items, 0.1)` mora da bude `990`. Za prvu verziju morate da postavite globalne promenljive `discount` i `cart`, a posle testa da „počistite“ poklone koje je procedura dodala u korpu.

</details>

## Sažetak

- Funkcionalno programiranje je programiranje **čistim funkcijama**: isti ulaz uvek daje isti izlaz, bez uočljivih sporednih efekata.
- Program u funkcionalnom stilu je **pipeline**: podaci prolaze kroz niz čistih funkcija.
- Cilj je **ovladavanje složenošću**: kod treba da ima svojstva na koja se možemo osloniti.
- Ograničeni alati (kao `map`) daju **više garancija** od fleksibilnih (kao `for`).
- Ceo kurs počiva na dva stuba: **referencijalnoj transparentnosti** i **kompoziciji**.

## Izvori

- Originalni prevod: [Šta je funkcionalno programiranje](../original/01-sta-je-funkcionalno-programiranje.md) (definicije, pipeline, cilj FP-a, primer `map` naspram `for`) i uvod poglavlja [Dva stuba funkcionalnog programiranja](../original/02-dva-stuba-funkcionalnog-programiranja.md).
- Novo u ovoj verziji: analogija sa tabelama, primer sa korpom, primer sa `trim`/`toUpperCase`, odgovor na kviz, plan kursa prema mapi uma, odeljak o bibliotekama, najčešće greške i vežba.

## Sledeća lekcija

U [lekciji 2 — Čiste funkcije](02-ciste-funkcije.md) radnu definiciju pretvaramo u preciznu: videćemo kako matematika definiše funkciju, kako prepoznati nečistu proceduru i zašto je lokalna mutabilnost ipak dozvoljena.
