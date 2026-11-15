# 4. Referencijalna transparentnost

> **Celina 1 — Temelji funkcionalnog programiranja** · Lekcija 4 od 8
>
> **Predznanje:** [Čiste funkcije](02-ciste-funkcije.md) i [Sporedni efekti](03-sporedni-efekti.md) (intuitivno).

## Šta ćemo naučiti?

- šta je **referencijalna transparentnost** i kako se proverava „testom zamene“
- četiri tipična načina na koje se ona narušava: nečiste procedure, izuzeci, mutacija i nedeterminizam
- zašto je važna: **lokalno rezonovanje** i **bezbedno refaktorisanje**
- preciznu definiciju **sporednog efekta**
- zašto poziv koji vraća `Promise` nije referencijalno transparentan, a opis izračunavanja jeste

## Intuitivno objašnjenje

Setite se algebre iz škole. Ako je `x = 2 + 3`, onda svuda gde piše `x` možemo da napišemo `5`, i obrnuto, a da se značenje izraza ne promeni:

```text
x * x  =  (2 + 3) * (2 + 3)  =  5 * 5  =  25
```

Ova „zamena jednakog jednakim“ (na engleskom _equational reasoning_) je najprirodniji način da razumemo izraz: deo po deo, bez razmišljanja o tome šta se dešavalo ranije.

U programima ova zamena često **ne** radi. Ako je `x = Math.random()`, onda `x * x` i `Math.random() * Math.random()` nisu isti program. Referencijalna transparentnost je upravo svojstvo izraza za koje zamena radi.

## Formalna definicija

> **Definition**. An **expression** is said to be _referentially transparent_ if it can be replaced with its corresponding value without changing the program's behavior

**Izraz** je _referencijalno transparentan_ ako se može zameniti svojom vrednošću, a da se ponašanje programa ne promeni.

Primetite da je referencijalna transparentnost svojstvo **izraza**, a ne funkcije. Veza sa čistim funkcijama je sledeća: funkcija `f` je čista ako je izraz `f(x)` referencijalno transparentan za svaki referencijalno transparentan argument `x`. (Ova formulacija potiče iz knjige _Functional Programming in Scala_, P. Chiusano i R. Bjarnason.)

Funkcionalno programiranje počiva na dva stuba — referencijalnoj transparentnosti i [kompoziciji](06-kompozicija-funkcija.md) — i sve što ćemo kasnije videti u kursu proizilazi, direktno ili indirektno, iz njih.

## Primer bez biblioteka

**Primer** (referencijalna transparentnost podrazumeva korišćenje čistih funkcija)

```ts
const double = (n: number): number => n * 2

const x = double(2)
const y = double(2)
```

Izraz `double(2)` ima svojstvo referencijalne transparentnosti jer mogu da ga zamenim njegovom vrednošću `4`.

Stoga mogu bez brige da izvršim sledeće refaktorisanje:

```ts
const x = 4
const y = x
```

Nemaju svi izrazi svojstvo referencijalne transparentnosti; pogledajmo nekoliko primera.

**Primer** (referencijalna transparentnost podrazumeva da se ne bacaju izuzeci)

```ts
const inverse = (n: number): number => {
  if (n === 0) throw new Error('cannot divide by zero')
  return 1 / n
}

const x = inverse(0) + 1
```

Ne mogu da zamenim izraz `inverse(0)` njegovom vrednošću, pa stoga ovaj izraz nema svojstvo referencijalne transparentnosti.

Zašto ne mogu? Zato što izračunavanje izraza `inverse(0)` **ne proizvodi vrednost**: umesto toga izvršavanje „skače“ na najbliži `catch` (ili prekida program). Nema vrednosti kojom bismo izraz zamenili.

**Primer** (referencijalna transparentnost može da podrazumeva korišćenje nepromenljivih struktura podataka)

```ts
const xs = [1, 2, 3]

const append = (xs: Array<number>): void => {
  xs.push(4)
}

append(xs)

const ys = xs
```

U poslednjem redu ne mogu da zamenim izraz `xs` njegovom početnom vrednošću `[1, 2, 3]` jer je njegovu trenutnu vrednost promenio poziv funkcije `append`. Ovom problemu posvećena je [sledeća lekcija](05-nepromenljivost.md).

**Primer** (nedeterminizam)

```ts
const a = Math.random()
const b = Math.random()

console.log(a === b) // => false (gotovo sigurno)
```

Kada bismo `b` zamenili sa `a` (`const b = a`), dobili bismo `true` — drugačiji program.

## Problem koji rešavamo: refaktorisanje koje menja ponašanje

Zašto je referencijalna transparentnost toliko važna? Zato što omogućava da:

- **rezonujemo lokalno** o kodu (odnosno, za razumevanje dela koda nije mi potrebno poznavanje šireg konteksta)
- **refaktorišemo** bez promene ponašanja programa (po samoj definiciji referencijalne transparentnosti)

**Kviz**. Pretpostavimo da imamo sledeći program:

```ts
// U TypeScript-u `declare` omogućava uvođenje definicije bez navođenja njene implementacije.
declare const question: (message: string) => Promise<string>

async function program() {
  const x = await question('What is your name?')
  const y = await question('What is your name?')
  return [x, y]
}
```

Mogu li da ga refaktorišem na ovaj način? Da li je ponašanje programa isto ili se promenilo?

```ts
declare const question: (message: string) => Promise<string>

async function program() {
  const x = await question('What is your name?')
  const y = x
  return [x, y]
}
```

<details>
<summary>Odgovor</summary>

Ponašanje se promenilo. Prvi program **dvaput** postavlja pitanje korisniku (i korisnik može da odgovori različito), a drugi samo jednom. Izraz `question('What is your name?')` nije referencijalno transparentan: njegovo izračunavanje ima sporedni efekat (komunikaciju sa korisnikom), pa ga ne možemo zameniti vrednošću koju je vratio prvi put.

</details>

Kao što vidite, refaktorisanju programa koji sadrži izraze bez svojstva referencijalne transparentnosti treba pristupiti s velikim oprezom. U funkcionalnom programiranju, gde svaki izraz ima svojstvo referencijalne transparentnosti, kognitivno opterećenje pri refaktorisanju je manje.

### Rešenje: radimo sa opisima, a izvršavanje biramo eksplicitno

U [prethodnoj lekciji](03-sporedni-efekti.md#druga-tehnika-thunk) videli smo da efekat možemo da opišemo thunk-om. Isto važi i za asinhrone efekte:

```ts
// opis asinhronog izračunavanja: ništa se ne dešava dok se ne pozove
type Task<A> = () => Promise<A>

declare const question: (message: string) => Promise<string>

const askName: Task<string> = () => question('What is your name?')

// `askName` je vrednost (opis), pa je zamena bezbedna:
const first = askName
const second = askName // potpuno isto što i `const second = first`

export async function program() {
  // izvršavanje biramo eksplicitno — ovde dva puta
  const x = await first()
  const y = await second()
  return [x, y]
}
```

Izraz `askName` jeste referencijalno transparentan: njegova vrednost je _opis_, i taj opis je uvek isti. Koliko puta će se pitanje postaviti ne zavisi od toga kako smo imenovali vrednosti, već samo od toga koliko puta **pozivamo** opis. Upravo zato `fp-ts` asinhrone efekte modeluje tipom `Task` (više u Celini 5 i u dodatku originala [`Task` naspram `Promise`](../original/dodatak-task-vs-promise.md)).

## Sporedni efekat: precizna definicija

Sada možemo da damo preciznu definiciju koju smo najavili. Kako se definiše „sporedni efekat“? Jednostavno, kao negacija referencijalne transparentnosti:

> Izraz sadrži „sporedni efekat“ ako nije referencijalno transparentan.

Proverimo da ova definicija obuhvata sve primere iz [prethodne lekcije](03-sporedni-efekti.md):

| Izraz              | Vrednost        | Šta se menja ako izraz zamenimo vrednošću       |
| ------------------ | --------------- | ----------------------------------------------- |
| `console.log('x')` | `undefined`     | ništa se ne ispisuje                            |
| `xs.push(4)`       | `4` (dužina)    | niz `xs` ostaje nepromenjen                     |
| `Date.now()`       | npr. `1700000000000` | vreme se „zamrzava“                        |
| `Math.random()`    | npr. `0.42`     | slučajnost nestaje                              |
| `inverse(0)`       | — (nema je)     | zamena nije ni moguća                           |

I skriveni izlazi (`console.log`, `push`) i skriveni ulazi (`Date.now`, `Math.random`) i izuzeci padaju na istom testu. Pravi cilj funkcionalnog programiranja je uvek da se obezbedi osnovno svojstvo referencijalne transparentnosti.

## Primer sa fp-ts

Sa vrednostima tipa `IO` iz `fp-ts`-a zamena je uvek bezbedna, jer su to opisi, a ne izvršena izračunavanja:

```ts
import { log } from 'fp-ts/Console'
import { IO } from 'fp-ts/IO'

const greet: IO<void> = log('Zdravo!')

// zbog referencijalne transparentnosti ova dva programa su ista
const program1: ReadonlyArray<IO<void>> = [log('Zdravo!'), log('Zdravo!')]
const program2: ReadonlyArray<IO<void>> = [greet, greet]

program1.forEach((io) => io()) // ispisuje "Zdravo!" dva puta
program2.forEach((io) => io()) // ispisuje "Zdravo!" dva puta
```

Uporedite to sa direktnim pozivom `console.log`:

```ts
const greet = console.log('Zdravo!') // ispisuje odmah, jednom; greet je `undefined`
const program = [greet, greet] // niz od dva `undefined`
```

U Celini 5 videćemo kako se opisi poput `greet` kombinuju operacijom `chain` i kako nam referencijalna transparentnost omogućava da „manipulišemo programima“ kao vrednostima.

## Najčešće greške

- **„Referencijalna transparentnost je svojstvo funkcije.“** Svojstvo je **izraza**. Funkcija je čista ako je svaki njen poziv `f(x)`, za referencijalno transparentno `x`, referencijalno transparentan izraz.
- **„`const` garantuje referencijalnu transparentnost.“** Ne garantuje: `const xs = [1, 2, 3]` i dalje može da se promeni sa `xs.push(4)` ([lekcija 5](05-nepromenljivost.md)).
- **„Ako test prolazi, izraz je referencijalno transparentan.“** Test proverava jedan kontekst; definicija govori o _svakom_ kontekstu. `Date.now()` može da vrati istu vrednost u dva poziva iste milisekunde.
- **„Sačuvati `Promise` u promenljivu je isto što i pozvati funkciju dvaput.“** `const p = fetchUser(1)` odmah pokreće zahtev; `await p` dvaput daje isti rezultat iz jednog zahteva, a `await fetchUser(1)` dvaput šalje dva zahteva.
- **„Izuzetak je u redu ako ga uhvatimo.“** Izraz koji baca izuzetak i dalje nije referencijalno transparentan. Kako se greške modeluju vrednostima videćemo u [lekciji 8](08-totalne-i-parcijalne-funkcije.md) i Celini 2.

## Vežba

Za svako refaktorisanje odredite da li čuva ponašanje programa.

**a)**

```ts
const a = [1, 2].concat([3])
const b = [1, 2].concat([3])
// refaktorisanje: const b = a
```

**b)**

```ts
declare const heavyComputation: () => void

const start = Date.now()
heavyComputation()
const end = Date.now()
// refaktorisanje: const end = start
```

**c)**

```ts
const parse = (s: string): number => parseInt(s, 10)

const x = parse('42') + parse('42')
// refaktorisanje: const n = parse('42'); const x = n + n
```

**d)**

```ts
declare const fetchUser: (id: number) => Promise<string>

async function f() {
  const u1 = await fetchUser(1)
  const u2 = await fetchUser(1)
  return [u1, u2]
}
// refaktorisanje: const p = fetchUser(1); const u1 = await p; const u2 = await p
```

<details>
<summary>Rešenje</summary>

- **a)** Da, ali **samo ako se nizovi nikada ne menjaju** i ako program ne poredi reference. Ako kasnije neko izvrši `a.push(4)`, u originalnom programu `b` ostaje `[1, 2, 3]`, a posle refaktorisanja `b` je isti niz kao `a`, pa je `[1, 2, 3, 4]`. Takođe, `a === b` je u originalu `false`, a posle refaktorisanja `true` (uporedite sa kvizom o identitetu objekata u [lekciji 3](03-sporedni-efekti.md#prva-tehnika-dsl)). Nepromenljivost i poređenje po vrednosti umesto po referenci čine ovakvu zamenu bezbednom — tema [sledeće lekcije](05-nepromenljivost.md).
- **b)** Ne. `Date.now()` je skriveni ulaz; posle refaktorisanja izmereno trajanje je uvek `0`.
- **c)** Da. `parseInt` je čista funkcija, pa je `parse('42')` referencijalno transparentan izraz.
- **d)** Ne. Original šalje dva zahteva, refaktorisani program jedan. To može da bude poželjna optimizacija, ali ponašanje programa nije isto.

</details>

## Sažetak

- Izraz je **referencijalno transparentan** ako se može zameniti svojom vrednošću bez promene ponašanja programa („test zamene“).
- Narušavaju je nečiste procedure, izuzeci, mutacija i nedeterminizam.
- Zahvaljujući njoj možemo da **rezonujemo lokalno** i da **refaktorišemo bez straha**.
- **Sporedni efekat** je, po definiciji, ono što izraz čini referencijalno netransparentnim.
- Efekte zato predstavljamo **opisima** (`IO`, `Task`), koji su referencijalno transparentni; izvršavanje biramo eksplicitno.

## Izvori

- Originalni prevod: definicija, primeri `double`, `inverse` i `append`, razlozi za važnost i kviz sa `question` iz odeljka [Referencijalna transparentnost](../original/02-dva-stuba-funkcionalnog-programiranja.md#referencijalna-transparentnost); definicija sporednog efekta i „pravi cilj“ iz poglavlja [Čiste funkcije i parcijalne funkcije](../original/07-ciste-i-parcijalne-funkcije.md); ideja manipulacije programima iz odeljka [Manipulacija programima](../original/13-monade.md#manipulacija-programima) poglavlja Monade.
- Novo u ovoj verziji: analogija sa algebrom, objašnjenje zašto izuzetak nema vrednost, primer sa `Math.random`, veza čistih funkcija i referencijalne transparentnosti (prema _Functional Programming in Scala_), rešenje sa `Task` opisom, tabela provere definicije, primer sa `IO`, odgovor na kviz, najčešće greške i vežba.

## Sledeća lekcija

Videli smo da mutacija ruši referencijalnu transparentnost. U [lekciji 5 — Nepromenljivost podataka](05-nepromenljivost.md) učimo kako da radimo sa podacima koji se ne menjaju: šta TypeScript nudi i kako da „menjamo“ vrednosti pravljenjem novih.
