# Uputstvo za autore lekcija

Ovaj dokument opisuje kako se pišu i proveravaju lekcije. **Celina 1** ([`docs/01-osnove/`](docs/01-osnove/index.md)) je referentni primer: nove lekcije treba da prate njen obrazac, stil i konvencije.

## Osnovna pravila

1. **Original se ne menja.** Tekst u [`docs/original/`](docs/original/index.md) ostaje kakav jeste. Menja se samo napomena na vrhu poglavlja (status prerade).
2. **Novo se ne predstavlja kao original.** Svaka lekcija na kraju ima odeljak `## Izvori` u kome se navodi šta je preuzeto iz originala (sa linkovima na odeljke), a šta je dodato.
3. **Dubina se ne žrtvuje.** Formalne definicije i algebarski zakoni iz originala ostaju; lekcija ih dopunjuje intuicijom i primerima. Matematičke definicije ne menjaju se na način koji menja njihovo značenje.
4. **Pojam se objašnjava pre nego što se koristi.** Ako lekcija koristi pojam iz kasnije lekcije, kratko ga objasni i uputi na mesto gde se detaljno obrađuje.
5. **Bez praznih lekcija.** Stranica koja još nije prerađena označava se kao „u pripremi“ i upućuje na original; ne pravi se lekcija koja samo izgleda završeno.

## Obrazac lekcije

Sekcije se izostavljaju kada nisu potrebne — prioritet su jasnoća i razumljivost.

```markdown
# N. Naslov lekcije

> **Celina X — Naziv celine** · Lekcija N od M
>
> **Predznanje:** šta čitalac treba da zna, sa linkovima na lekcije gde se to uči.

## Šta ćemo naučiti?
## Intuitivno objašnjenje
## Problem koji rešavamo
## Primer bez biblioteka
## Formalna definicija
## Primer sa fp-ts
## Najčešće greške
## Vežba
## Sažetak
## Izvori
## Sledeća lekcija
```

Redosled „Problem“ i „Formalna definicija“ može da se prilagodi temi (na primer, u lekciji o referencijalnoj transparentnosti definicija dolazi rano, jer je ona sama tema).

## Stil

- Srpski jezik, latinica, ekavica, sa pravilnim znakovima (č, ć, š, ž, đ). Pazite da se ne uvuku ćirilična slova sličnog izgleda (npr. е, о, а).
- Stručni termini na engleskom zadržavaju se kada su ustaljeni (pipeline, thunk, pattern matching), uz objašnjenje na srpskom pri prvom pojavljivanju.
- Ton je prijateljski i direktan, bez nepotrebnog akademskog stila — ali bez pojednostavljivanja koje narušava tehničku tačnost.
- Matematički zakoni prikazuju se i formalno i kroz konkretan primer u kodu.
- Ne pretpostavlja se poznavanje teorije kategorija.

Terminologija prati originalni prevod:

| Engleski                 | Srpski                          |
| ------------------------ | ------------------------------- |
| pure function            | čista funkcija                  |
| side effect              | sporedni efekat                 |
| referential transparency | referencijalna transparentnost  |
| immutability             | nepromenljivost                 |
| composition              | kompozicija                     |
| partial / total function | parcijalna / totalna funkcija   |
| domain / codomain        | domen / kodomen                 |
| combinator               | kombinator                      |
| product / sum type       | tip proizvoda / tip sume        |
| type constructor         | konstruktor tipa                |
| semigroup                | polugrupa                       |
| identity element         | neutralni element               |
| functor                  | funktor                         |
| applicative functor      | aplikativni funktor             |
| monad                    | monada                          |

## Primeri koda

- Svaki ` ```ts ` blok u lekcijama je **samostalan**: sadrži sve `import`-e i definicije koje koristi. Komanda `npm run docs:check` svaki blok proverava kompajlerom kao poseban modul, sa podešavanjima iz [`tsconfig.json`](tsconfig.json) (TypeScript 4.2, `strict`).
- Blok koji namerno nije potpun kod (pseudo-kod, potpis, fragment) označava se sa ` ```ts nocheck `. Oznaka ne utiče na prikaz ni na portalu ni na GitHub-u.
- Kada primer namerno pokazuje grešku kompajlera, koristi se `// @ts-expect-error — objašnjenje` u redu iznad. Tako provera potvrđuje da greška zaista postoji. Pri prvoj upotrebi u lekciji kratko objasnite šta direktiva znači.
- Očekivani ispis piše se komentarom `// => ...`, tačno onako kako ga ispisuje Node.js (npr. `// => [ 1, 2, 3 ]`, stringovi bez navodnika). Kada Node ispis prelomi u više redova (duži nizovi i objekti), prepišite ga u blok komentar `/* ... */`.
- Pišite kod koji radi i sa novijim verzijama TypeScript-a, jer ga čitaoci kopiraju u svoje projekte i u Playground. Na primer, u `catch (e)` tretirajte `e` kao `unknown` (`e instanceof Error ? e.message : String(e)`).
- Stil koda prati [`.prettierrc`](.prettierrc): bez tačke-zareza, jednostruki navodnici.
- Koristite samo mogućnosti jezika koje podešavanja TypeScript-a u repozitorijumu poznaju (biblioteke do ES2018); novije API-je (npr. `toSorted`) pominjite u tekstu.

## Linkovi, slike i blokovi

- Linkovi između stranica su **relativni** i vode na `.md` fajlove: `[Čiste funkcije](02-ciste-funkcije.md)`. Tako rade i na GitHub-u i na portalu.
- Sidra prate GitHub-ov algoritam (mala slova, razmaci postaju crtice, interpunkcija se uklanja, slova sa kvačicama ostaju): `#problem-koji-rešavamo`. Portal je podešen da koristi isti algoritam.
- Linkovi ka kodu u `src/` su takođe relativni (`../../src/01_retry.ts`); portal ih automatski pretvara u linkove ka GitHub-u.
- Slike su u [`docs/images/`](docs/images/) i navode se relativno: `../images/spoiler.png`.
- Napomene se pišu kao GitHub alert blokovi (`> [!NOTE]`, `> [!TIP]`, `> [!WARNING]`), koje prikazuju i GitHub i portal. Ne koristite VitePress blokove `:::`, jer se na GitHub-u ne prikazuju.
- Rešenja vežbi i odgovori na kvizove stavljaju se u `<details><summary>Rešenje</summary> ... </details>`, sa praznim redom posle `<summary>` i pre `</details>`.

## Dodavanje nove lekcije

1. Napravite fajl u folderu celine, sa rednim brojem u imenu (npr. `docs/02-modelovanje/01-product-tipovi.md`).
2. Dodajte lekciju u bočni meni u [`docs/.vitepress/config.mts`](docs/.vitepress/config.mts) (`sidebarKurs`). Redosled u meniju određuje i linkove „Prethodno / Sledeće“.
3. Ažurirajte pregled celine (`index.md` u folderu celine), [mapu sadržaja](docs/mapa-sadrzaja.md) i napomenu na vrhu odgovarajućeg poglavlja u `docs/original/`.
4. Pokrenite proveru:

```sh
npm run docs:check   # linkovi, sidra i TypeScript primeri
npm run docs:build   # portal se gradi bez grešaka (uključujući proveru mrtvih linkova)
```

Iste provere pokreće i GitHub Actions za svaki pull request.
