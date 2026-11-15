# Celina 4 — Apstrakcije i kompozicija

> [!WARNING]
> Ova celina je **u pripremi**: lekcije još nisu prerađene prema novom standardu kursa. Do tada gradivo možete da čitate u originalnom prevodu — linkovi su u tabeli ispod.

**Cilj celine:** objasniti zašto apstrakcije poput `Functor` i `Applicative` postoje i koje praktične probleme rešavaju — pre svega [centralni problem kompozicije](../01-osnove/06-kompozicija-funkcija.md#ne-komponuju-se-sve-funkcije): kako komponovati funkcije koje vraćaju vrednost u nekom kontekstu.

**Predznanje:** Celine [1](../01-osnove/index.md) i [2](../02-modelovanje/index.md) (`Option`, `Either`).

## Planirane lekcije

| #   | Lekcija                         | Gradivo u originalnom prevodu                                                                                                                                                                                    |
| --- | ------------------------------- | ---------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| —   | _Kategorije i problem kompozicije_ ¹ | [Teorija kategorija](../original/10-teorija-kategorija.md)                                                                                                                                                   |
| —   | _Programi sa efektima_ ¹        | [Funkcije kao programi](../original/11-funktori.md#funkcije-kao-programi)                                                                                                                                       |
| 1   | Functor                         | [Ograničenje koje vodi do funktora](../original/11-funktori.md#ograničenje-koje-vodi-do-funktora) (definicija i zakoni), [kontravarijantni funktori](../original/11-funktori.md#kontravarijantni-funktori), [funktori u `fp-ts`](../original/11-funktori.md#funktori-u-fp-ts) |
| 2   | Map                             | [Ograničenje koje vodi do funktora](../original/11-funktori.md#ograničenje-koje-vodi-do-funktora) (primeri), [funktori i rukovanje greškama](../original/11-funktori.md#funktori-i-funkcionalno-rukovanje-greškama) |
| 3   | Applicative                     | [Aplikativni funktori](../original/12-aplikativni-funktori.md)                                                                                                                                                  |
| 4   | Apply                           | [Currying](../original/12-aplikativni-funktori.md#currying), [operacija `ap`](../original/12-aplikativni-funktori.md#operacija-ap)                                                                              |
| 5   | Of                              | [Operacija `of`](../original/12-aplikativni-funktori.md#operacija-of)                                                                                                                                          |
| 6   | Kompozicija unutar konteksta    | [Funktori se komponuju](../original/11-funktori.md#funktori-se-komponuju), [aplikativni funktori se komponuju](../original/12-aplikativni-funktori.md#aplikativni-funktori-se-komponuju)                       |

1. Ove teme nisu bile na početnom spisku, ali u originalu čine osnovu za funktore: teorija kategorija daje formalni pojam kompozicije, a „programi sa efektima“ objašnjavaju šta je `F<B>`. Predlaže se da budu uvodne lekcije celine.

**Predlog redosleda.** Problem pre apstrakcije: Map → Functor → Apply → Of → Applicative → Kompozicija unutar konteksta. `Applicative` je `Apply` zajedno sa `of`, pa je prirodno da dođe posle obe operacije.

Detaljan raspored nalazi se u [mapi sadržaja](../mapa-sadrzaja.md).
