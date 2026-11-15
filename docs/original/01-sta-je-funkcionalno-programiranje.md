# Šta je funkcionalno programiranje

> [!NOTE]
> Poglavlje 1 originalnog prevoda. Tekst je neizmenjen — prilagođene su samo putanje do slika i koda i interne veze između poglavlja. [Sadržaj originalnog prevoda](index.md)
>
> Ovo poglavlje je prerađeno u novoj strukturi kursa: [Uvod u funkcionalno programiranje](../01-osnove/01-uvod.md), [Čiste funkcije](../01-osnove/02-ciste-funkcije.md).


> Functional Programming is programming with pure functions. Mathematical functions.

Brza pretraga na internetu može vas dovesti do sledeće definicije:

> (Čista) funkcija je procedura koja za isti ulaz uvek vraća isti izlaz i nema nikakav uočljiv sporedni efekat (side effect).

Termin "sporedni efekat" još uvek nema precizno značenje (kasnije ćemo videti kako da mu damo formalnu definiciju); za sada je važno da o njemu imamo neku intuiciju, zamislite na primer otvaranje fajla da biste pročitali njegov sadržaj, ili upis u bazu podataka.

Za sada možemo da se ograničimo na to da kažemo da je sporedni efekat bilo šta što procedura radi pored toga što vraća vrednost.

Ali kako je strukturiran program koji koristi samo čiste funkcije?

Program u funkcionalnom stilu obično se piše kao **pipeline** (cevovod):

```ts
const program = pipe(
  input,
  f1, // čista funkcija
  f2, // čista funkcija
  f3, // čista funkcija
  ...
)
```

Ono što se dešava jeste da se `input` prosleđuje kao ulaz prvoj funkciji `f1`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz drugoj funkciji `f2`, koja vraća izlaznu vrednost koja se prosleđuje kao ulaz trećoj funkciji `f3`, i tako dalje.

**Demo**

[`00_pipe_and_flow.ts`](../../src/00_pipe_and_flow.ts)

Videćemo kako nam funkcionalno programiranje pruža sredstva da svoj kod strukturiramo u ovom stilu.

Pored toga što treba razumeti šta je funkcionalno programiranje, podjednako je važno razumeti koja je njegova svrha.

Cilj funkcionalnog programiranja je **ovladavanje složenošću sistema** korišćenjem formalnih modela, uz posebnu pažnju posvećenu **svojstvima koda** i lakoći refaktorisanja.

> Functional programming will help teach people the mathematics behind program construction:
>
> - how to write composable code
> - how to reason about side effects
> - how to write consistent, general, less ad-hoc APIs

Šta znači posvetiti pažnju svojstvima koda? Pogledajmo jedan primer

**Primer**

Zašto možemo da kažemo da je funkcija `map` za `Array` "funkcionalnija" od `for` petlje?

```ts
// ulaz
const xs: Array<number> = [1, 2, 3]

// transformacija
const double = (n: number): number => n * 2

// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys: Array<number> = []
for (let i = 0; i < xs.length; i++) {
  ys.push(double(xs[i]))
}
```

`for` petlja je veoma fleksibilna, mogu da izmenim:

- početni indeks
- uslov završetka
- korak

Ali to takođe znači da postoji više mogućnosti da se unesu **greške** i da nemam nikakvu **garanciju za rezultat**.

**Kviz**. Da li ste proverili da li je moja petlja dobro napisana?

Pogledajmo sada kako se koristi `map`

```ts
// rezultat: želim niz u kom su svi elementi iz `xs` udvostručeni
const ys = xs.map(double)
```

Primetite da je `map` manje fleksibilna, ali zato pruža više garancija:

- svi elementi ulaza biće obrađeni, od prvog do poslednjeg
- kakva god da je operacija koja se izvršava u callback-u, rezultat će uvek biti niz sa istim brojem elemenata
  kao ulazni niz

Sa funkcionalne tačke gledišta, gde su važnija svojstva koda nego detalji implementacije, operacija `map` je zanimljiva **upravo zato što je ograničena**.

Zamislite, na primer, koliko je lakši pregled (review) PR-a koji sadrži `map` nego onog koji sadrži `for` petlju.

---

[Sadržaj](index.md) · [Sledeće poglavlje →](02-dva-stuba-funkcionalnog-programiranja.md)
