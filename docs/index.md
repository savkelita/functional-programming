---
layout: home

hero:
  name: Funkcionalno programiranje
  text: u TypeScript-u, na srpskom jeziku
  tagline: Od čistih funkcija do monada — postepeno, uz intuiciju, primere i precizne definicije.
  actions:
    - theme: brand
      text: Započni učenje
      link: /01-osnove/
    - theme: alt
      text: Mapa sadržaja
      link: /mapa-sadrzaja
    - theme: alt
      text: Originalni prevod
      link: /original/

features:
  - title: 1. Temelji
    details: Čiste funkcije, sporedni efekti, referencijalna transparentnost, nepromenljivost, kompozicija, pipe i flow.
    link: /01-osnove/
    linkText: Započni
  - title: 2. Modelovanje podataka i grešaka
    details: Tipovi proizvoda i sume, discriminated unions, pattern matching, Option i Either.
    link: /02-modelovanje/
    linkText: Započni
  - title: 3. Algebra i zakoni
    details: Magma, Semigroup, Monoid, Eq i Ord — i zašto su algebarski zakoni važni. (u pripremi)
    link: /03-algebre/
    linkText: Pregled
  - title: 4. Apstrakcije i kompozicija
    details: Functor, Apply i Applicative — kompozicija funkcija koje vraćaju vrednost u kontekstu. (u pripremi)
    link: /04-apstrakcije/
    linkText: Pregled
  - title: 5. Monade i efekti
    details: Monad, chain, monadski zakoni, IO, Task i Reader — od teorije do fp-ts i Effect-a. (u pripremi)
    link: /05-efekti/
    linkText: Pregled
---

## O kursu

Ovo je kurs funkcionalnog programiranja u TypeScript-u na srpskom jeziku. Zasnovan je na kursu koji je napisao [Giulio Canti](https://github.com/gcanti), autor biblioteke `fp-ts`, i na njegovom [srpskom prevodu](original/index.md).

Kurs kreće od osnova i postepeno vodi ka algebarskim strukturama, funktorima, monadama i upravljanju efektima. Svaka lekcija prvo gradi intuiciju na konkretnom problemu, zatim daje preciznu (formalnu) definiciju, a na kraju proverava razumevanje kroz vežbu.

**Za koga je kurs?** Za programere koji poznaju osnove TypeScript-a (tipovi, funkcije, generici). Prethodno znanje funkcionalnog programiranja ili matematike nije potrebno — svaki pojam se objašnjava pre nego što se koristi.

**Status.** Prve dve celine su završene. Ostale celine su u pripremi; do tada je njihovo gradivo dostupno u [originalnom prevodu](original/index.md), a raspored je opisan u [mapi sadržaja](mapa-sadrzaja.md).
