# Mapa sadržaja

Ova stranica povezuje [originalni prevod](original/index.md) sa novom strukturom kursa: gde je koje poglavlje prerađeno (ili će biti), šta je preuzeto iz originala, a šta je novo. Služi i kao plan za preradu preostalih celina.

**Oznake porekla**

- **Original** — sadržaj je preuzet iz prevoda, uz minimalne izmene
- **Prošireno** — osnovu čini original, dodata su objašnjenja, primeri, greške i vežbe
- **Pretežno novo** — original sadrži samo napomene ili delove; većina sadržaja je nova

## Celina 1 — Temelji (završena)

| Lekcija                                                                                  | Delovi originala                                                                                                                                                                                                                       | Poreklo        |
| ---------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | -------------- |
| [1. Uvod u funkcionalno programiranje](01-osnove/01-uvod.md)                             | [Šta je FP](original/01-sta-je-funkcionalno-programiranje.md) (ceo), uvod poglavlja [Dva stuba](original/02-dva-stuba-funkcionalnog-programiranja.md), [mapa uma](original/index.md#mapa-uma-originalnog-kursa)                        | Prošireno      |
| [2. Čiste funkcije](01-osnove/02-ciste-funkcije.md)                                      | radna definicija iz [Šta je FP](original/01-sta-je-funkcionalno-programiranje.md); formalna definicija, kviz `f1`–`f7`, lokalna mutabilnost iz [Čiste i parcijalne funkcije](original/07-ciste-i-parcijalne-funkcije.md)               | Prošireno      |
| [3. Sporedni efekti](01-osnove/03-sporedni-efekti.md)                                    | intuicija iz [Šta je FP](original/01-sta-je-funkcionalno-programiranje.md); DSL, thunk, `IO`, „pure core + imperative shell“, tabela efekata iz [Funkcije kao programi](original/11-funktori.md#funkcije-kao-programi)                   | Prošireno      |
| [4. Referencijalna transparentnost](01-osnove/04-referencijalna-transparentnost.md)      | [Referencijalna transparentnost](original/02-dva-stuba-funkcionalnog-programiranja.md#referencijalna-transparentnost); definicija sporednog efekta iz [Čiste i parcijalne funkcije](original/07-ciste-i-parcijalne-funkcije.md)          | Prošireno      |
| [5. Nepromenljivost podataka](01-osnove/05-nepromenljivost.md)                           | primer `append` iz [Referencijalna transparentnost](original/02-dva-stuba-funkcionalnog-programiranja.md#referencijalna-transparentnost); lokalna mutabilnost; [`mutable-is-unsafe-in-typescript.ts`](../src/mutable-is-unsafe-in-typescript.ts) | Pretežno novo  |
| [6. Kompozicija funkcija](01-osnove/06-kompozicija-funkcija.md)                          | [Kompozicija](original/02-dva-stuba-funkcionalnog-programiranja.md#kompozicija) i [`01_retry.ts`](../src/01_retry.ts); definicija iz [Čiste i parcijalne funkcije](original/07-ciste-i-parcijalne-funkcije.md); citati, problem i „spoiler“ iz [Teorija kategorija](original/10-teorija-kategorija.md) | Prošireno      |
| [7. `pipe` i `flow`](01-osnove/07-pipe-i-flow.md)                                        | pipeline iz [Šta je FP](original/01-sta-je-funkcionalno-programiranje.md); definicije iz [Centralni problem kompozicije](original/10-teorija-kategorija.md#centralni-problem-kompozicije-funkcija); [`00_pipe_and_flow.ts`](../src/00_pipe_and_flow.ts) | Prošireno      |
| [8. Totalne i parcijalne funkcije](01-osnove/08-totalne-i-parcijalne-funkcije.md)        | definicije, kvizovi i `Option(Y)` iz [Čiste i parcijalne funkcije](original/07-ciste-i-parcijalne-funkcije.md); `head` koji baca izuzetak iz [Tip `Option`](original/09-funkcionalno-rukovanje-greskama.md#tip-option)                  | Prošireno      |

Svaka lekcija na kraju ima odeljak **Izvori** sa preciznim spiskom preuzetog i novog sadržaja.

## Raspored originalnih poglavlja

Za svako poglavlje originala: gde je prerađeno (✓) ili gde je planirano.

| Poglavlje originala                                                                    | Odeljak                                         | Nova struktura                                                    |
| -------------------------------------------------------------------------------------- | ----------------------------------------------- | ----------------------------------------------------------------- |
| [1. Šta je funkcionalno programiranje](original/01-sta-je-funkcionalno-programiranje.md) | ceo                                           | ✓ C1 L1 (i L2, L3, L7)                                            |
| [2. Dva stuba](original/02-dva-stuba-funkcionalnog-programiranja.md)                   | Referencijalna transparentnost                  | ✓ C1 L4 (primer `append` i u L5)                                  |
|                                                                                        | Kompozicija (kombinatori, `01_retry.ts`)        | ✓ C1 L6                                                           |
| [3. Polugrupe](original/03-polugrupe.md)                                               | uvod (algebre i interfejsi)                     | C3 Uvod u algebarske strukture                                    |
|                                                                                        | Magma                                           | C3 Magma                                                          |
|                                                                                        | Polugrupa, `concatAll`, dualna, proizvod        | C3 Semigroup (zakon i u C3 Asocijativnost)                        |
|                                                                                        | Ne mogu da pronađem instancu (slobodna polugrupa) | C3 Semigroup                                                    |
|                                                                                        | Polugrupe izvedene iz uređenja                  | C3 Ord                                                            |
| [4. Eq](original/04-jednakost-eq.md)                                                   | ceo                                             | C3 Eq                                                             |
| [5. Ord](original/05-uredjenje-ord.md)                                                 | ceo (uključujući primer `Customer`)             | C3 Ord                                                            |
| [6. Monoidi](original/06-monoidi.md)                                                   | definicija, neutralni element                   | C3 Monoid, C3 Neutralni element                                   |
|                                                                                        | monoid endomorfizama                            | C3 Monoid (pomenut u C1 L6, vežba 3)                              |
| [7. Čiste i parcijalne funkcije](original/07-ciste-i-parcijalne-funkcije.md)           | formalna definicija funkcije, kviz              | ✓ C1 L2                                                           |
|                                                                                        | lokalna mutabilnost, ugovor API-ja              | ✓ C1 L2 (i L5)                                                    |
|                                                                                        | definicija sporednog efekta                     | ✓ C1 L4                                                           |
|                                                                                        | definicija kompozicije                          | ✓ C1 L6                                                           |
|                                                                                        | parcijalne i totalne funkcije, `Option(Y)`      | ✓ C1 L8                                                           |
| [8. Algebarski tipovi podataka](original/08-algebarski-tipovi-podataka.md)             | tipovi proizvoda (sa kardinalnošću)             | C2 Product tipovi                                                 |
|                                                                                        | tipovi sume, konstruktori                       | C2 Sum tipovi, C2 Discriminated unions                            |
|                                                                                        | pattern matching                                | C2 Pattern matching                                               |
| [9. Funkcionalno rukovanje greškama](original/09-funkcionalno-rukovanje-greskama.md)   | uvod                                            | C2 Modelovanje neuspeha bez izuzetaka                             |
|                                                                                        | Tip `Option`                                    | C2 Option (primer `head` već u C1 L8)                             |
|                                                                                        | Instanca za `Eq`                                | C3 Eq                                                             |
|                                                                                        | Instance za `Semigroup` i `Monoid`              | C3 Monoid                                                         |
|                                                                                        | Tip `Either`                                    | C2 Either                                                         |
| [10. Teorija kategorija](original/10-teorija-kategorija.md)                            | ceo                                             | C4 (predlog: uvodna lekcija); citati, problem i „spoiler“ ✓ C1 L6, definicije `pipe`/`flow` ✓ C1 L7 |
| [11. Funktori](original/11-funktori.md)                                                | Funkcije kao programi                           | C4 (predlog: lekcija „Programi sa efektima“), C5 IO; delovi ✓ C1 L3 |
|                                                                                        | Ograničenje koje vodi do funktora               | C4 Map, C4 Functor                                                |
|                                                                                        | Funktori i rukovanje greškama                   | C4 Map                                                            |
|                                                                                        | Funktori se komponuju                           | C4 Kompozicija unutar konteksta                                   |
|                                                                                        | Kontravarijantni funktori, funktori u `fp-ts`   | C4 Functor                                                        |
| [12. Aplikativni funktori](original/12-aplikativni-funktori.md)                        | Currying                                        | C4 Apply (intuitivno već ✓ C1 L7)                                 |
|                                                                                        | Operacija `ap`, `liftA2`                         | C4 Apply                                                          |
|                                                                                        | Operacija `of`                                  | C4 Of, C4 Applicative                                             |
|                                                                                        | Aplikativni funktori se komponuju               | C4 Kompozicija unutar konteksta                                   |
| [13. Monade](original/13-monade.md)                                                    | Problem ugnežđenih konteksta                    | C5 Flatten                                                        |
|                                                                                        | Definicija monade                               | C5 Monad, C5 Monadski zakoni                                      |
|                                                                                        | Kleisli kategorija                              | C5 Monadski zakoni                                                |
|                                                                                        | Operacija `chain` korak po korak                | C5 Chain / flatMap                                                |
|                                                                                        | Manipulacija programima (`time`, do notacija, `Deps`, `FileSystem`) | C5 IO, C5 Kompozicija efekata                 |
| [Dodatak A: Monad transformeri](original/dodatak-monad-transformeri.md)                | ceo                                             | C5 Kompozicija efekata                                            |
| [Dodatak B: `Task` naspram `Promise`](original/dodatak-task-vs-promise.md)             | ceo                                             | C5 Task (pomenut u C1 L4)                                         |

### Primeri i vežbe iz `src/`

| Fajl                                                                                       | Nova struktura                     |
| ------------------------------------------------------------------------------------------ | ---------------------------------- |
| [`00_pipe_and_flow.ts`](../src/00_pipe_and_flow.ts)                                        | ✓ C1 L1, L7                        |
| [`01_retry.ts`](../src/01_retry.ts)                                                        | ✓ C1 L6; C3 Semigroup (`concat`)   |
| [`mutable-is-unsafe-in-typescript.ts`](../src/mutable-is-unsafe-in-typescript.ts)          | ✓ C1 L5                            |
| [`02_ord.ts`](../src/02_ord.ts), [`laws.ts`](../src/laws.ts)                               | C3 Ord, C3 Značaj algebarskih zakona |
| [`03_shapes.ts`](../src/03_shapes.ts)                                                      | C3 Monoid                          |
| [`04_functor.ts`](../src/04_functor.ts)                                                    | C4 Functor                         |
| [`05_applicative.ts`](../src/05_applicative.ts)                                            | C4 Applicative                     |
| [`06_game.ts`](../src/06_game.ts), [`hangman.ts`](../src/hangman.ts)                        | C5 Task, C5 Kompozicija efekata    |
| [`reader.ts`](../src/reader.ts)                                                            | C5 Reader                          |
| [`program6.ts`](../src/program6.ts), [`onion-architecture/`](../src/onion-architecture/)   | C5 Kompozicija efekata             |
| [`exercises/`](../src/exercises/) i [`solutions/`](../src/solutions/)                      | vežbe odgovarajućih celina (Magma, Semigroup, Monoid, Eq, Ord → C3; ADT, FEH → C2; Functor, Apply, Applicative → C4; Monad → C5) |

## Analiza: početna struktura naspram originala

### Teme koje original ne obrađuje posebno

Ove teme su na početnom spisku, ali u originalu ne postoje kao posebna poglavlja. Pri preradi se jasno označavaju kao nov sadržaj:

- **Nepromenljivost podataka** (C1 L5) — u originalu samo napomene; lekcija je pretežno nova.
- **Discriminated unions** (C2) — u originalu deo odeljka o tipovima sume.
- **Modelovanje neuspeha bez izuzetaka** (C2) — sinteza primera iz poglavlja 7 i 9.
- **Asocijativnost**, **Neutralni element**, **Značaj algebarskih zakona** (C3) — u originalu delovi poglavlja o polugrupama i monoidima, uz primer `laws.ts`.
- **Effect** (sve celine) — original koristi isključivo `fp-ts`.

### Teme iz originala koje nisu na početnom spisku

Ove teme ne smeju da se izgube; predlaže se gde da se smeste:

- **Teorija kategorija** (poglavlje 10) — uvodna lekcija Celine 4: daje formalni pojam kompozicije i motivaciju za funktore.
- **Programi sa efektima** (odeljak „Funkcije kao programi“) — lekcija pre Map u Celini 4.
- **Kontravarijantni funktori** i `contramap` — C4 Functor (`contramap` se prvi put javlja u C3 Eq i Ord).
- **Slobodna polugrupa** — C3 Semigroup.
- **Kardinalnost tipova** (zašto „proizvod“ i „suma“) — C2 Product i Sum tipovi.
- **Do notacija**, ubrizgavanje zavisnosti (`Deps`, hexagonal arhitektura), **onion arhitektura**, **monad transformeri** — C5 Kompozicija efekata.

### Predlozi za redosled

Početna struktura je zadržana u Celini 1. Za ostale celine predlaže se redosled „problem pre apstrakcije“, koji prati i original:

- **Celina 3:** Uvod → Magma → Asocijativnost → Semigroup → Neutralni element → Monoid → Eq → Ord → Značaj zakona.
- **Celina 4:** Kategorije → Programi sa efektima → Map → Functor → Apply → Of → Applicative → Kompozicija unutar konteksta.
- **Celina 5:** Flatten → Chain → Monad → Monadski zakoni → IO → Task → Reader → Kompozicija efekata.

Napomena o zavisnostima: original uvodi `Eq`, `Semigroup` i `Monoid` **pre** tipa `Option`, a nova struktura obrnuto (Celina 2 pre Celine 3). Zato odeljci o instancama za `Option` prelaze u Celinu 3.

## Poznati problemi u originalu

Za ispravku tokom prerade (sam originalni prevod se ne menja):

- Uputstvo „Setup“ u originalu klonira italijanski repozitorijum (`gcanti/functional-programming`); ispravno uputstvo je u [README-u](../README.md) i u [pregledu Celine 1](01-osnove/index.md#kako-da-isprobate-primere).
- [Dodatak A](original/dodatak-monad-transformeri.md) koristi zastareli API biblioteke `fp-ts` (`fp-ts/lib/pipeable`, instanca `task`).
- Deo teksta ostao je na engleskom (citati, neki komentari u kodu, kolona „Effect (interpretation)“ u tabeli efekata).
- Mnogi primeri koda nisu samostalni: sadrže pseudo-kod (`...`, potpise poput `f: (a: A) => B`) ili se oslanjaju na prethodne primere. Komanda `npm run docs:check -- --all` trenutno prijavljuje 42 sintaksne greške u primerima originala, gotovo sve iz takvih namernih fragmenata. Dok one postoje, kompajler ne prijavljuje semantičke greške, pa pri preradi primere treba dopuniti (ili označiti sa `nocheck`) i ponovo proveriti.
