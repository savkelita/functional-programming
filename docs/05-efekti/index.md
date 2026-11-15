# Celina 5 — Monade i efekti

> [!WARNING]
> Ova celina je **u pripremi**: lekcije još nisu prerađene prema novom standardu kursa. Do tada gradivo možete da čitate u originalnom prevodu — linkovi su u tabeli ispod.

**Cilj celine:** povezati teorijsko znanje sa praktičnim konceptima koje koriste biblioteke `fp-ts` i Effect — od operacije `chain` do programa koji kombinuju više efekata.

**Predznanje:** Celine [1](../01-osnove/index.md)–[4](../04-apstrakcije/index.md).

## Planirane lekcije

| #   | Lekcija               | Gradivo u originalnom prevodu                                                                                                                                                                                                          |
| --- | --------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Monad                 | [Definicija monade](../original/13-monade.md#definicija-monade)                                                                                                                                                                       |
| 2   | Chain / flatMap       | [Definicija operacije `chain` korak po korak](../original/13-monade.md#definicija-operacije-chain-korak-po-korak)                                                                                                                     |
| 3   | Flatten               | [Problem ugnežđenih konteksta](../original/13-monade.md#problem-ugnežđenih-konteksta)                                                                                                                                                |
| 4   | Monadski zakoni       | [Definicija monade](../original/13-monade.md#definicija-monade), [Kleisli kategorija](../original/13-monade.md#kleisli-kategorija)                                                                                                   |
| 5   | IO                    | [Funkcije kao programi](../original/11-funktori.md#funkcije-kao-programi), [Manipulacija programima](../original/13-monade.md#manipulacija-programima)                                                                               |
| 6   | Task                  | Dodatak [`Task` naspram `Promise`](../original/dodatak-task-vs-promise.md); demo [`06_game.ts`](../../src/06_game.ts)                                                                                                                 |
| 7   | Reader                | Primer [`reader.ts`](../../src/reader.ts); primeri za `Reader` u poglavljima [Funktori](../original/11-funktori.md#ograničenje-koje-vodi-do-funktora), [Aplikativni funktori](../original/12-aplikativni-funktori.md#operacija-ap) i [Monade](../original/13-monade.md#definicija-operacije-chain-korak-po-korak) |
| 8     | Kompozicija efekata   | Dodatak [Monad transformeri](../original/dodatak-monad-transformeri.md); [Manipulacija programima](../original/13-monade.md#manipulacija-programima) (`FileSystem`, `TaskEither`); primeri [`program6.ts`](../../src/program6.ts) i [`onion-architecture/`](../../src/onion-architecture/) |

Primeri sa bibliotekom Effect biće novi sadržaj: originalni kurs koristi samo `fp-ts`.

**Predlog redosleda.** Problem pre apstrakcije, kao u originalu: Flatten → Chain → Monad → Monadski zakoni, pa zatim konkretni efekti (IO, Task, Reader) i njihova kompozicija.

Detaljan raspored nalazi se u [mapi sadržaja](../mapa-sadrzaja.md).
