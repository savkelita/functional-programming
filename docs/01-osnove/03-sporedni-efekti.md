# 3. Sporedni efekti

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 3 od 8
>
> **Predznanje:** [Čiste funkcije](02-ciste-funkcije.md) (dva uslova čistoće).

## Šta ćemo naučiti?

- šta je sporedni efekat i kako da ga prepoznamo: **skriveni izlazi** i **skriveni ulazi**
- zašto program bez efekata ne bi bio koristan i šta funkcionalno programiranje zapravo radi sa efektima
- arhitektonski obrazac **„čisto jezgro, imperativna ljuska“**
- ideju da se efekat **opiše vrednošću** umesto da se odmah izvrši (thunk i tip `IO`)

## Intuitivno objašnjenje

Za sada možemo da kažemo da je sporedni efekat bilo šta što procedura radi pored toga što vraća vrednost: otvaranje fajla da bi se pročitao njegov sadržaj, upis u bazu podataka, ispis na konzolu.

Korisno je razlikovati dva smera:

- **skriveni izlazi** — procedura nešto menja u svetu: piše na konzolu, u fajl ili bazu, šalje mrežni zahtev, menja globalnu promenljivu ili svoj argument, baca izuzetak
- **skriveni ulazi** — rezultat zavisi od nečega što nije argument: trenutnog vremena, slučajnog broja, sadržaja fajla, globalnog promenljivog stanja

Čitanje trenutnog vremena ne „radi“ ništa vidljivo, ali narušava čistoću isto kao upis u bazu: posle njega procedura više nije „tabela“ ulaz → izlaz. Zato u funkcionalnom programiranju i skrivene ulaze tretiramo kao efekte. U [sledećoj lekciji](04-referencijalna-transparentnost.md) videćemo jednu definiciju koja obuhvata oba smera.

## Problem koji rešavamo

Pogledajmo tipičnu proceduru u kojoj su pomešani poslovna logika i sporedni efekti:

```ts
interface User {
  readonly email: string
  readonly name: string
}

declare const db: { insert: (user: User) => void }
declare const mailer: {
  send: (to: string, subject: string, body: string) => void
}

function registerUser(email: string, name: string): void {
  if (!email.includes('@')) {
    throw new Error('Neispravna email adresa')
  }
  const user: User = { email: email.trim().toLowerCase(), name: name.trim() }
  db.insert(user)
  mailer.send(user.email, 'Dobrodošli', `Zdravo, ${user.name}!`)
  console.log(`Registrovan korisnik ${user.email}`)
}
```

(`declare` u TypeScript-u uvodi definiciju bez implementacije; ovde predstavlja bazu i servis za slanje pošte koji „postoje negde“.)

Šta je ovde teško?

- da biste testirali samo proveru i normalizaciju adrese, morate da obezbedite lažnu bazu i lažni servis za poštu
- normalizaciju (`trim`, `toLowerCase`) ne možete da iskoristite na drugom mestu
- redosled efekata (prvo baza, pa pošta, pa log) skriven je u telu procedure

Razdvojimo **odluke** (čiste funkcije) od **izvršavanja** (efekata):

```ts
interface User {
  readonly email: string
  readonly name: string
}

interface Email {
  readonly to: string
  readonly subject: string
  readonly body: string
}

// -------------------------------------------------------------
// čisto jezgro: samo računa
// -------------------------------------------------------------

const isValidEmail = (email: string): boolean => email.includes('@')

const makeUser = (email: string, name: string): User => ({
  email: email.trim().toLowerCase(),
  name: name.trim()
})

const welcomeEmail = (user: User): Email => ({
  to: user.email,
  subject: 'Dobrodošli',
  body: `Zdravo, ${user.name}!`
})

// -------------------------------------------------------------
// imperativna ljuska: izvršava efekte
// -------------------------------------------------------------

declare const db: { insert: (user: User) => void }
declare const mailer: { send: (email: Email) => void }

export function registerUser(email: string, name: string): void {
  if (!isValidEmail(email)) {
    throw new Error('Neispravna email adresa')
  }
  const user = makeUser(email, name)
  db.insert(user)
  mailer.send(welcomeEmail(user))
  console.log(`Registrovan korisnik ${user.email}`)
}

// jezgro se testira bez ikakve pripreme
console.log(makeUser('  Ana@Primer.RS ', ' Ana '))
// => { email: 'ana@primer.rs', name: 'Ana' }
console.log(welcomeEmail({ email: 'ana@primer.rs', name: 'Ana' }).body)
// => Zdravo, Ana!
```

Ljuska je i dalje nečista, ali je sada **tanka**: u njoj nema poslovne logike koju bi trebalo testirati, samo redosled poziva. Ponašanje programa nije promenjeno — i dalje se baca isti izuzetak za neispravnu adresu. (Kako se i takve greške predstavljaju vrednostima videćemo u [lekciji 8](08-totalne-i-parcijalne-funkcije.md) i Celini 2.)

## Program ne može bez efekata

Program koji nema nikakav efekat ne bi mogao ni da prikaže rezultat. Funkcionalno programiranje zato ne ukida efekte, već ih **potiskuje na granice sistema**, gde se izvršavaju, pa se tako dobija sledeća šema:

> system = pure core + imperative shell

(sistem = čisto jezgro + imperativna ljuska)

U _čisto funkcionalnim_ jezicima (kao što su Haskell, PureScript ili Elm) ova podela je jasna i nameće je sam jezik. U TypeScript-u je to stvar discipline — i alata koje ćemo upoznati.

## Opisati efekat umesto izvršiti ga

Ima i korak dalje. Šta ako bi i sam efekat bio **vrednost**?

Analogija: **recept** naspram **kuvanja**. Recept je opis: možete da ga prepišete, sačuvate, spojite sa drugim receptom u meni — i ništa se ne dešava u kuhinji. Tek kada neko počne da kuva, recept se izvršava.

Originalni kurs pokazuje dve tehnike za to u JavaScript-u:

- definisati DSL (domain specific language) za efekte
- koristiti _thunk_-ove

### Prva tehnika: DSL

Prva tehnika znači izmeniti program kao što je

```ts
const log = (message: string): void => {
  console.log(message) // sporedni efekat
}
```

menjajući njegov kodomen tako da postane funkcija koja vraća **opis** sporednog efekta:

```ts nocheck
type DSL = ... // tip sume svih mogućih efekata kojima upravlja sistem

const log = (message: string): DSL => {
  return { _tag: 'log', message } // efekat koji opisuje čin pisanja na konzolu
}
```

Konkretno, `DSL` bi mogao da bude unija objekata koje razlikuje polje `_tag` (takve tipove detaljno obrađujemo u Celini 2):

```ts
type DSL =
  | { readonly _tag: 'log'; readonly message: string }
  | { readonly _tag: 'sendEmail'; readonly to: string; readonly body: string }

const log = (message: string): DSL => ({ _tag: 'log', message })

// interpreter: jedino mesto gde se efekti zaista izvršavaju
const run = (effect: DSL): void => {
  switch (effect._tag) {
    case 'log':
      console.log(effect.message)
      break
    case 'sendEmail':
      console.log(`(šaljem poštu na ${effect.to})`)
      break
  }
}

const program: ReadonlyArray<DSL> = [log('zdravo'), log('svete')]
// do ovog trenutka ništa nije ispisano: `program` je samo podatak

program.forEach(run)
// => zdravo
// => svete
```

**Kviz** (JavaScript). Da li je upravo definisana funkcija `log` zaista čista? A ipak `log('foo') !== log('foo')`!

<details>
<summary>Odgovor</summary>

Jeste čista. Dva poziva vraćaju dva **različita objekta istog sadržaja**, a `!==` poredi reference, ne sadržaj. Pitanje je šta smatramo „istim izlazom“: ako program ne zavisi od identiteta objekata (a funkcionalni kod ne bi trebalo), zamena poziva `log('foo')` vrednošću `{ _tag: 'log', message: 'foo' }` ništa ne menja. Kako se precizno modeluje jednakost vrednosti videćemo u Celini 3 (`Eq`).

</details>

Ova prva tehnika pretpostavlja postojanje načina za kombinovanje efekata, kao i definiciju interpretera koji je u stanju da konkretno izvrši efekte kada želimo da pokrenemo konačni program.

### Druga tehnika: thunk

Druga tehnika, jednostavnija i izvodljiva u TypeScript-u, jeste da se izračunavanje obavije u _thunk_ — funkciju bez parametara koja odlaže izračunavanje dok je neko ne pozove:

```ts
// thunk koji predstavlja sinhroni sporedni efekat
type IO<A> = () => A

const log = (message: string): IO<void> => {
  return () => console.log(message) // vraća thunk
}

const main = log('hello!')
// u ovom trenutku ne vidim ništa na konzoli
// zato što je `main` samo inertna vrednost
// koja predstavlja izračunavanje

main()
// tek kada eksplicitno pokrenem program
// vidim rezultat na konzoli
// => hello!
```

Program `log`, kada se izvrši, ne izaziva odmah sporedni efekat, već vraća **vrednost koja predstavlja izračunavanje** — recept, a ne kuvanje.

Pošto su opisi obične vrednosti, možemo ih kombinovati pre nego što bilo šta izvršimo:

```ts
type IO<A> = () => A

const log = (message: string): IO<void> => () => console.log(message)

// od dva opisa pravimo treći: "prvo first, pa second"
const andThen = (first: IO<void>, second: IO<void>): IO<void> => () => {
  first()
  second()
}

const main = andThen(log('zdravo'), log('svete'))
// još ništa nije ispisano

main()
// => zdravo
// => svete
```

Ovo je zametak ideje koju ćemo razviti u Celini 5: programi sa efektima mogu da se **komponuju** kao i čiste funkcije.

### Tipovi koji predstavljaju efekte

U kursu ćemo upoznati više tipova koji, poput `IO`, **predstavljaju** određeni efekat (tabela je prilagođena iz poglavlja [Funktori](../original/11-funktori.md#funkcije-kao-programi) originalnog kursa):

| Tip                | Efekat (tumačenje)                                         | Gde ga učimo |
| ------------------ | ---------------------------------------------------------- | ------------ |
| `Option<A>`        | izračunavanje koje može da ne uspe                         | Celina 2     |
| `Either<E, A>`     | izračunavanje koje može da ne uspe, uz razlog neuspeha     | Celina 2     |
| `ReadonlyArray<A>` | nedeterminističko izračunavanje (više mogućih rezultata)   | Celina 4     |
| `IO<A>`            | sinhrono izračunavanje koje **nikada ne završava neuspehom** | Celina 5   |
| `Task<A>`          | asinhrono izračunavanje koje **nikada ne završava neuspehom** | Celina 5  |
| `Reader<R, A>`     | izračunavanje koje čita iz okruženja `R`                   | Celina 5     |

## Formalna definicija

Termin „sporedni efekat“ još uvek nema precizno značenje. Preciznu definiciju daćemo u [sledećoj lekciji](04-referencijalna-transparentnost.md#sporedni-efekat-precizna-definicija), jer se oslanja na pojam referencijalne transparentnosti. Videćemo da ona obuhvata sve primere iz ove lekcije — i skrivene izlaze i skrivene ulaze.

## Primer sa fp-ts

Biblioteka `fp-ts` definiše tip `IO` na isti način kao mi (`interface IO<A> { (): A }`), a modul `fp-ts/Console` sadrži funkcije poput `log` koje vraćaju `IO`:

```ts
import { log } from 'fp-ts/Console'
import { IO } from 'fp-ts/IO'

export const main: IO<void> = log('hello!')
// ništa još nije ispisano: `main` je samo vrednost koja opisuje izračunavanje

main()
// => hello!
```

Za kombinovanje ovakvih vrednosti `fp-ts` nudi opšte operacije (`map`, `chain`) koje upoznajemo u Celinama 4 i 5.

U biblioteci Effect ista ideja izražena je tipom `Effect`: `Effect.sync(() => console.log('hello!'))` je samo opis sinhronog efekta, a izvršava se tek kada ga prosledite funkciji `Effect.runSync`.

## Najčešće greške

- **„Funkcionalni programi nemaju sporedne efekte.“** Imaju — inače ne bi bili korisni. Efekti su izolovani na granicama sistema.
- **„`console.log` nije pravi sporedni efekat.“** Jeste: ispis je uočljiv. U praksi se toleriše tokom debagovanja, ali funkcija sa `console.log` formalno nije čista.
- **„Funkcija koja vraća thunk izvršava efekat.“** Ne izvršava. `log('x')` samo pravi opis; efekat se dešava tek pozivom `log('x')()`.
- **„`Promise` rešava problem efekata.“** Ne rešava: `Promise` kreće da se izvršava odmah pri kreiranju. Zato `fp-ts` asinhrone efekte opisuje tipom `Task<A> = () => Promise<A>` ([lekcija 4](04-referencijalna-transparentnost.md), Celina 5).
- **„Čitanje nije efekat jer ništa ne menja.“** `Date.now()`, `Math.random()` i čitanje fajla su skriveni ulazi i narušavaju čistoću isto kao upis.

## Vežba

1. Pronađite sve skrivene ulaze i izlaze u sledećoj proceduri.
2. Izdvojite čisto jezgro (funkciju koja pravi porudžbinu) od imperativne ljuske.

```ts
interface Order {
  readonly id: number
  readonly total: number
  readonly createdAt: number
}

let lastOrderId = 0
const orders: Array<Order> = []

export function placeOrder(total: number): number {
  lastOrderId++
  const order: Order = { id: lastOrderId, total, createdAt: Date.now() }
  orders.push(order)
  console.log(`Porudžbina ${order.id} je kreirana`)
  return order.id
}
```

<details>
<summary>Rešenje</summary>

1. Skriveni ulazi: `lastOrderId` (čita se globalno promenljivo stanje) i `Date.now()`. Skriveni izlazi: `lastOrderId++`, `orders.push(...)` i `console.log(...)`.

2. Sve što je odluka prelazi u čistu funkciju, a vrednosti koje su bile skrivene postaju parametri:

```ts
interface Order {
  readonly id: number
  readonly total: number
  readonly createdAt: number
}

// čisto jezgro
const createOrder = (id: number, total: number, now: number): Order => ({
  id,
  total,
  createdAt: now
})

const orderCreatedMessage = (order: Order): string =>
  `Porudžbina ${order.id} je kreirana`

// imperativna ljuska
let lastOrderId = 0
const orders: Array<Order> = []

export function placeOrder(total: number): number {
  lastOrderId++
  const order = createOrder(lastOrderId, total, Date.now())
  orders.push(order)
  console.log(orderCreatedMessage(order))
  return order.id
}

console.log(createOrder(1, 500, 0)) // => { id: 1, total: 500, createdAt: 0 }
```

</details>

## Sažetak

- Sporedni efekat je sve što procedura radi pored vraćanja vrednosti (**skriveni izlazi**), a efektima tretiramo i zavisnost od skrivenog stanja (**skriveni ulazi**).
- Funkcionalno programiranje ne ukida efekte, već ih **potiskuje na granice**: _system = pure core + imperative shell_.
- Efekat se može **opisati vrednošću**: DSL-om ili thunk-om (`type IO<A> = () => A`). Opis ne radi ništa dok ga ne pokrenemo.
- Opisi su obične vrednosti, pa se mogu kombinovati pre izvršavanja.

## Izvori

- Originalni prevod: intuitivna definicija iz poglavlja [Šta je funkcionalno programiranje](../original/01-sta-je-funkcionalno-programiranje.md); DSL i thunk tehnike, kviz o `log`, `IO`, „pure core + imperative shell“ i tabela efekata iz odeljka [Funkcije kao programi](../original/11-funktori.md#funkcije-kao-programi) poglavlja Funktori.
- Novo u ovoj verziji: skriveni ulazi i izlazi, primer `registerUser`, analogija recept/kuvanje, konkretan DSL sa interpreterom, primer `andThen`, odgovor na kviz, napomena o Effect-u, najčešće greške i vežba.

## Sledeća lekcija

U [lekciji 4 — Referencijalna transparentnost](04-referencijalna-transparentnost.md) upoznajemo prvi stub funkcionalnog programiranja: svojstvo koje nam dozvoljava da izraz zamenimo njegovom vrednošću — i preko njega dajemo preciznu definiciju sporednog efekta.
