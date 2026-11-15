# Celina 1 — Temelji funkcionalnog programiranja

U ovoj celini gradimo intuiciju o tome šta funkcionalno programiranje jeste i zašto postoji — **bez** preuranjenog uvođenja matematičkih apstrakcija. Matematika se pojavljuje samo tamo gde nešto zaista pojašnjava (definicija funkcije, kompozicija), i uvek uz konkretan TypeScript primer.

**Predznanje:** osnove TypeScript-a — tipovi, funkcije (posebno arrow funkcije), nizovi i objekti, osnovni generici (`<A>`). Prethodno znanje funkcionalnog programiranja nije potrebno.

## Lekcije

| #   | Lekcija                                                                   | Ukratko                                                                                 |
| --- | ------------------------------------------------------------------------- | --------------------------------------------------------------------------------------- |
| 1   | [Uvod u funkcionalno programiranje](01-uvod.md)                           | Šta je FP, kako izgleda program u funkcionalnom stilu i zašto su ograničenja korisna    |
| 2   | [Čiste funkcije](02-ciste-funkcije.md)                                    | Dva uslova čistoće, formalna definicija funkcije, lokalna mutabilnost                   |
| 3   | [Sporedni efekti](03-sporedni-efekti.md)                                  | Skriveni ulazi i izlazi, „čisto jezgro, imperativna ljuska“, efekti kao vrednosti       |
| 4   | [Referencijalna transparentnost](04-referencijalna-transparentnost.md)    | Test zamene, bezbedno refaktorisanje i precizna definicija sporednog efekta             |
| 5   | [Nepromenljivost podataka](05-nepromenljivost.md)                         | Deljene reference, `readonly`, „izmena“ pravljenjem nove vrednosti                      |
| 6   | [Kompozicija funkcija](06-kompozicija-funkcija.md)                        | `f ∘ g`, identitet i asocijativnost, obrazac kombinatora                                |
| 7   | [`pipe` i `flow`](07-pipe-i-flow.md)                                      | Čitljiva kompozicija sleva nadesno, currying i „data-last“ funkcije                     |
| 8   | [Totalne i parcijalne funkcije](08-totalne-i-parcijalne-funkcije.md)      | Funkcije čiji tipovi „lažu“ i kako da ih učinimo totalnim                               |

Lekcije su poređane tako da se svaka oslanja na prethodne, ali se mogu čitati i pojedinačno: na početku svake lekcije navedeno je šta treba znati i gde se to uči.

## Kako su lekcije organizovane

Svaka lekcija prati isti obrazac (neke sekcije se izostavljaju kada nisu potrebne):

1. **Šta ćemo naučiti?** — ciljevi lekcije
2. **Intuitivno objašnjenje** — ideja jednostavnim jezikom
3. **Problem koji rešavamo** — konkretan problem iz TypeScript programiranja
4. **Primer bez biblioteka** — koncept implementiran „ručno“
5. **Formalna definicija** — precizna definicija, najčešće preuzeta iz originalnog kursa
6. **Primer sa fp-ts** — kako isti koncept izgleda u biblioteci
7. **Najčešće greške** — pogrešna tumačenja i zamke
8. **Vežba** — mali zadatak, sa rešenjem koje se otvara klikom
9. **Sažetak** — šta treba zapamtiti
10. **Sledeća lekcija** — kako se gradivo nastavlja

Na kraju svake lekcije, u odeljku **Izvori**, navedeno je koji delovi potiču iz [originalnog prevoda](../original/index.md), a šta je dodato u ovoj verziji kursa.

## Kako da isprobate primere

Svaki primer koda u lekcijama je **samostalan**: sadrži sve `import`-e i definicije koje su mu potrebne, i proveren je TypeScript kompajlerom.

- Primere bez biblioteka možete odmah isprobati u [TypeScript Playground-u](https://www.typescriptlang.org/play).
- Za primere sa `fp-ts`-om klonirajte ovaj repozitorijum i instalirajte zavisnosti:

```sh
git clone https://github.com/savkelita/functional-programming.git
cd functional-programming
npm install
```

Folder `dev/` je predviđen za vaše eksperimente: obuhvaćen je podešavanjima TypeScript-a, a git ga ignoriše. Primer sačuvajte, na primer, kao `dev/primer.ts`, a tipove proverite komandom `npm run build`.
