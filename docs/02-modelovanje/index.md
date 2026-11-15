# Celina 2 — Modelovanje podataka i grešaka

> [!WARNING]
> Ova celina je **u pripremi**: lekcije još nisu prerađene prema novom standardu kursa. Do tada gradivo možete da čitate u originalnom prevodu — linkovi su u tabeli ispod.

**Cilj celine:** pokazati kako se tipovima mogu modelovati samo validna stanja i kako se očekivane greške predstavljaju vrednostima, umesto izuzecima.

**Predznanje:** [Celina 1](../01-osnove/index.md), posebno [Totalne i parcijalne funkcije](../01-osnove/08-totalne-i-parcijalne-funkcije.md).

## Planirane lekcije

| #   | Lekcija                              | Gradivo u originalnom prevodu                                                                                                                                                       |
| --- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Product tipovi                       | [Tipovi proizvoda](../original/08-algebarski-tipovi-podataka.md#tipovi-proizvoda)                                                                                                  |
| 2   | Sum tipovi                           | [Tipovi sume](../original/08-algebarski-tipovi-podataka.md#tipovi-sume), [Kada treba da koristim tip sume?](../original/08-algebarski-tipovi-podataka.md#kada-treba-da-koristim-tip-sume) |
| 3   | Discriminated unions                 | [Tipovi sume](../original/08-algebarski-tipovi-podataka.md#tipovi-sume) i [Konstruktori](../original/08-algebarski-tipovi-podataka.md#konstruktori) ¹                                  |
| 4   | Pattern matching                     | [Pattern matching](../original/08-algebarski-tipovi-podataka.md#pattern-matching)                                                                                                  |
| 5   | Option                               | [Tip `Option`](../original/09-funkcionalno-rukovanje-greskama.md#tip-option) ²                                                                                                       |
| 6   | Either                               | [Tip `Either`](../original/09-funkcionalno-rukovanje-greskama.md#tip-either)                                                                                                         |
| 7   | Modelovanje neuspeha bez izuzetaka   | Uvod poglavlja [Funkcionalno rukovanje greškama](../original/09-funkcionalno-rukovanje-greskama.md) ³                                                                               |

1. U originalu su discriminated unions deo odeljka o tipovima sume. Posebna lekcija fokusiraće se na mehanizme TypeScript-a: polje-oznaku (tag), sužavanje tipa (narrowing) i proveru iscrpnosti (exhaustive check).
2. Instance `Eq`, `Semigroup` i `Monoid` za `Option` zahtevaju gradivo Celine 3, pa prelaze tamo.
3. Lekcija će uglavnom biti nova: sinteza primera iz originala (`head`, `readFile` sa callback-om) i lekcije 8 iz Celine 1.

Detaljan raspored nalazi se u [mapi sadržaja](../mapa-sadrzaja.md).
