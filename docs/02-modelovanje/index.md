# Celina 2 — Modelovanje podataka i grešaka

U ovoj celini učimo kako se tipovima modeluju **samo validna stanja** i kako se **očekivane greške** predstavljaju vrednostima, umesto izuzecima. Glavni alat je kardinalnost — broj vrednosti koje tip dozvoljava — a glavna maksima: _make impossible state unrepresentable_.

**Predznanje:** [Celina 1](../01-osnove/index.md), posebno [Totalne i parcijalne funkcije](../01-osnove/08-totalne-i-parcijalne-funkcije.md) i [`pipe` i `flow`](../01-osnove/07-pipe-i-flow.md). Iz TypeScript-a: `interface`, `type`, unije i literal tipovi.

## Lekcije

| #   | Lekcija                                                                  | Ukratko                                                                                |
| --- | ------------------------------------------------------------------------ | -------------------------------------------------------------------------------------- |
| 1   | [Product tipovi](01-product-tipovi.md)                                   | Torke i strukture, kardinalnost proizvoda, nezavisne komponente                        |
| 2   | [Sum tipovi](02-sum-tipovi.md)                                           | Disjunktne unije, kardinalnost sume, ADT kao suma proizvoda, zavisne komponente        |
| 3   | [Discriminated unions](03-discriminated-unions.md)                       | Tag, sužavanje tipa, provera iscrpnosti, konstruktori                                  |
| 4   | [Pattern matching](04-pattern-matching.md)                               | Funkcija `match`, rekurzivni tipovi, `match` i `matchW` u `fp-ts`-u                    |
| 5   | [Option](05-option.md)                                                   | Vrednost koja možda postoji; parcijalne funkcije postaju totalne                        |
| 6   | [Either](06-either.md)                                                   | Neuspeh sa razlogom; greške domena kao tip sume                                        |
| 7   | [Modelovanje neuspeha bez izuzetaka](07-neuspeh-bez-izuzetaka.md)        | Očekivane greške i defekti, granice sistema, nadovezivanje koraka                      |

Lekcije prate isti obrazac kao u [Celini 1](../01-osnove/index.md#kako-su-lekcije-organizovane). Na kraju svake lekcije, u odeljku **Izvori**, navedeno je šta potiče iz [originalnog prevoda](../original/index.md), a šta je dodato.

## Šta je premešteno

Originalni kurs uvodi `Eq`, `Semigroup` i `Monoid` **pre** tipa `Option`, pa u poglavlju o rukovanju greškama definiše i instance tih struktura za `Option`. U ovom kursu je redosled obrnut, pa su ti odeljci premešteni u [Celinu 3](../03-algebre/index.md). Isto važi i za vežbe [`FEH01`](../../src/exercises/FEH01.ts)–[`FEH04`](../../src/exercises/FEH04.ts).
