# Monad transformeri

**Scenario 1**

Pretpostavimo da smo definisali sledeće API-je:

```ts
import { head } from 'fp-ts/lib/Array'
import { Option } from 'fp-ts/lib/Option'
import { pipe } from 'fp-ts/lib/pipeable'
import { map, Task, task } from 'fp-ts/lib/Task'

function fetchUserComments(
  id: string
): Task<Array<string>> {
  return task.of(['comment1', 'comment2'])
}

function fetchFirstComment(
  id: string
): Task<Option<string>> {
  return pipe(
    fetchUserComments(id),
    map(head)
  )
}
```

Tip kodomena funkcije `fetchFirstComment` je `Task<Option<string>>`, odnosno ugnežđena struktura podataka.

Da li mu je moguće pridružiti instancu monade?

**Scenario 2**

Za modelovanje AJAX poziva konstruktor tipa `Task` nije dovoljan, jer predstavlja asinhrono
izračunavanje koje nikada ne može da se završi neuspehom. Kako onda da modelujemo i moguće greške koje poziv vraća (`403`, `500`, itd.)?

Uopštenije, pretpostavimo da imamo izračunavanje sa sledećim svojstvima:

- asinhrono je
- može da se završi neuspehom

Kako da ga modelujemo?

Znamo da se ova dva efekta mogu kodirati, redom, sledećim tipovima:

- `Task<A>` (asinhronost)
- `Either<E, A>` (mogući neuspeh)

i da oba imaju instancu monade.

Kako mogu da kombinujem ova dva efekta?

Na dva načina:

- `Task<Either<L, A>>` predstavlja asinhrono izračunavanje koje može da se završi neuspehom
- `Either<L, Task<A>>` predstavlja izračunavanje koje može da se završi neuspehom ili da vrati asinhrono izračunavanje

Recimo da me zanima prvi od ta dva načina:

```ts
interface TaskEither<L, A> extends Task<Either<L, A>> {}
```

Da li je moguće definisati instancu monade za `TaskEither`?

## Monade se ne komponuju

Uopšteno, monade se ne komponuju, odnosno ako su date dve instance monade, jedna za `M<A>` i jedna za `N<A>`,
nije zagarantovano da i `M<N<A>>` ima instancu monade.

**Kviz**. Zašto? Pokušajte da definišete funkciju `flatten`.

Ipak, to što se u opštem slučaju ne komponuju ne znači da ne postoje posebni slučajevi u kojima se to dešava.

Pogledajmo nekoliko primera: ako `M` ima instancu monade, onda instancu monade imaju i sledeći tipovi:

- `OptionT<M, A> = M<Option<A>>`
- `EitherT<M, L, A> = M<Either<L, A>>`

Uopštenije, **monad transformeri** su skup konkretnih "recepata" koji pokazuju kako se tipu `M<N<A>>` može pridružiti instanca monade kada `M` i `N` imaju instance monade.

Da bismo mogli udobno da radimo, potrebne su nam operacije koje omogućavaju da izračunavanja koja se izvršavaju u sastavnim monadama "uronimo" u ciljnu monadu: to su _lifting_ funkcije.
