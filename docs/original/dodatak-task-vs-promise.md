# `Task` naspram `Promise`

> [!NOTE]
> Dodatak B originalnog prevoda. Tekst je neizmenjen. [Sadržaj originalnog prevoda](index.md)
>
> Prerada ovog materijala planirana je u Celini 5 — Monade i efekti (vidi [mapu sadržaja](../mapa-sadrzaja.md)).

`Task` je apstrakcija slična `Promise`-u; ključna razlika je u tome što `Task` predstavlja asinhrono izračunavanje
dok `Promise` predstavlja samo rezultat (dobijen asinhrono).

Ako imamo `Task`

- možemo da pokrenemo izračunavanje koje on predstavlja (na primer mrežni zahtev)
- možemo da odlučimo da izračunavanje ne pokrenemo
- možemo da ga pokrenemo više puta (i potencijalno dobijemo različite rezultate)
- dok se izračunavanje odvija, možemo da ga obavestimo da nas rezultat više ne zanima, a izračunavanje može samo da odluči da se prekine
- kada se izračunavanje završi, dobijamo rezultat

Ako imamo `Promise`

- izračunavanje se već odvija (ili se čak već završilo) i nad tim nemamo kontrolu
- kada je rezultat dostupan, dobijamo ga
- dva korisnika istog `Promise`-a dobijaju isti rezultat

---

[← Dodatak: Monad transformeri](dodatak-monad-transformeri.md) · [Sadržaj](index.md)
