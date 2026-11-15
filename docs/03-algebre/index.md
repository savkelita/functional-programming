# Celina 3 — Algebra i matematički zakoni

> [!WARNING]
> Ova celina je **u pripremi**: lekcije još nisu prerađene prema novom standardu kursa. Do tada gradivo možete da čitate u originalnom prevodu — linkovi su u tabeli ispod.

**Cilj celine:** upoznati algebarske strukture kao „recepte“ za kombinovanje i poređenje vrednosti, i razumeti zašto su njihovi zakoni važni. Matematičke definicije objašnjavaju se kroz jednostavne TypeScript primere.

**Predznanje:** [Celina 1](../01-osnove/index.md), posebno [Kompozicija funkcija](../01-osnove/06-kompozicija-funkcija.md) (asocijativnost i identitet).

## Planirane lekcije

| #   | Lekcija                         | Gradivo u originalnom prevodu                                                                                                                                                                                                                                  |
| --- | ------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| 1   | Uvod u algebarske strukture     | Uvod poglavlja [Modelovanje kompozicije pomoću polugrupa](../original/03-polugrupe.md)                                                                                                                                                                        |
| 2   | Magma                           | [Definicija magme](../original/03-polugrupe.md#definicija-magme)                                                                                                                                                                                              |
| 3   | Semigroup                       | [Definicija polugrupe](../original/03-polugrupe.md#definicija-polugrupe), [`concatAll`](../original/03-polugrupe.md#funkcija-concatall), [dualna polugrupa](../original/03-polugrupe.md#dualna-polugrupa), [polugrupa proizvoda](../original/03-polugrupe.md#polugrupa-proizvoda), [slobodna polugrupa](../original/03-polugrupe.md#ne-mogu-da-pronađem-instancu) |
| 4   | Monoid                          | [Modelovanje kompozicije pomoću monoida](../original/06-monoidi.md); [instance za `Option`](../original/09-funkcionalno-rukovanje-greskama.md#instance-za-semigroup-i-monoid)                                                                                 |
| 5   | Eq                              | [Modelovanje jednakosti pomoću `Eq`](../original/04-jednakost-eq.md); [instanca za `Option`](../original/09-funkcionalno-rukovanje-greskama.md#instanca-za-eq)                                                                                               |
| 6   | Ord                             | [Modelovanje uređenja pomoću `Ord`](../original/05-uredjenje-ord.md); [polugrupe izvedene iz uređenja](../original/03-polugrupe.md#polugrupe-izvedene-iz-uređenja)                                                                                           |
| 7   | Asocijativnost                  | [Definicija polugrupe](../original/03-polugrupe.md#definicija-polugrupe); primer [`laws.ts`](../../src/laws.ts) ¹                                                                                                                                              |
| 8   | Neutralni element               | Uvod poglavlja [Monoidi](../original/06-monoidi.md) ¹                                                                                                                                                                                                         |
| 9   | Značaj algebarskih zakona       | Primer [`laws.ts`](../../src/laws.ts) (testiranje zakona pomoću `fast-check`) ¹                                                                                                                                                                                 |

1. U originalu ove teme nisu posebna poglavlja, već delovi odeljaka o polugrupama i monoidima; lekcije će dobrim delom biti nove.

**Predlog redosleda.** Pedagoški je prirodnije da lekcija o asocijativnosti dođe neposredno pre lekcije o polugrupama, a lekcija o neutralnom elementu pre lekcije o monoidima, jer upravo ti zakoni razlikuju magmu od polugrupe i polugrupu od monoida. Konačan redosled utvrdiće se pri preradi.

Detaljan raspored nalazi se u [mapi sadržaja](../mapa-sadrzaja.md).
