/*

  # Summary

  Pretpostavimo da imamo web aplikaciju sa korisnicima,
  da svaki korisnik ima svoj profil i da treba da implementiramo
  funkcionalnost izmene profila (updateCustomerProfile).

  Zahtevi su sledeći

  - zahtev za izmenu profila predstavljen je
    modelom domena (UpdateProfileRequest)
  - treba ažurirati podatke u bazi podataka (updateProfile)
  - ako se email korisnika promenio, treba poslati email na staru
    adresu kao obaveštenje o promeni (sendEmailChangedNotification)

  Počnimo od modelovanja problema

*/

import * as T from 'fp-ts/Task'

export interface MonadDB {
  readonly getEmail: (userId: number) => T.Task<string>
  readonly updateProfile: (
    userId: number,
    name: string,
    email: string
  ) => T.Task<void>
}

export interface MonadEmail {
  readonly sendEmailChangedNotification: (
    newEmail: string,
    oldEmail: string
  ) => T.Task<void>
}

/*

  `MonadDB` i `MonadEmail` predstavljaju
  "capabilities" (mogućnosti) koje su potrebne aplikaciji.

  Prefiks `Monad` označava da kodomen
  svake operacije ima efekat kome odgovara
  instanca monade (u ovom konkretnom slučaju `Task`)

*/

export interface UpdateProfileRequest {
  readonly userId: number
  readonly name: string
  readonly email: string
}

declare const monadDB: MonadDB
declare const monadEmail: MonadEmail

/*

  U ovoj prvoj verziji instance `monadDB` i `monadEmail`
  su fiksno ugrađene u kod. Zamislite da su uvezene
  statički, kao moduli. Cilj je sada da tu fiksnu vezu raskinemo.

*/

import { pipe } from 'fp-ts/function'

/**
 * Vraća `true` ako je poslato obaveštenje
 *
 * U ovoj verziji zavisnosti su fiksno ugrađene u kod
 */
export const updateCustomerProfile1 = (
  request: UpdateProfileRequest
): T.Task<boolean> =>
  pipe(
    monadDB.getEmail(request.userId),
    T.chain((oldEmail) =>
      pipe(
        monadDB.updateProfile(request.userId, request.name, request.email),
        T.chain(() => {
          if (oldEmail !== request.email) {
            return pipe(
              monadEmail.sendEmailChangedNotification(request.email, oldEmail),
              T.map(() => true)
            )
          } else {
            return T.of(false)
          }
        })
      )
    )
  )

/*

  Prvo što treba uraditi je, očigledno, da zavisnosti prosledimo kao argumente
  i iskoristimo currying. Na taj način možemo da ubrizgamo zavisnosti
  i dobijemo API sa čistim potpisom.

*/

export declare const updateCustomerProfile2: (
  monadDB: MonadDB,
  monadEmail: MonadEmail
) => (request: UpdateProfileRequest) => T.Task<boolean>

/*

  "Problem" ovog rešenja je u tome što
  svaki korisnik (consumer) funkcije updateCustomerProfile2 mora
  da vodi računa o prosleđivanju argumenata
  `MonadDB` i `MonadEmail`.

  E sad, oslanjajući se na izreku da je u funkcionalnom programiranju
  lenjost vrlina, a ne mana,
  radim nešto što na prvi pogled deluje čudno:
  menjam redosled dve grupe argumenata u curried funkciji,
  odlažući trenutak kada zavisnosti moraju biti dostupne.

  Dodajem i novi type alias kako bi postojao samo jedan
  parametar koji sadrži sve zavisnosti.

*/

export interface Deps {
  readonly db: MonadDB
  readonly email: MonadEmail
}

export declare const updateCustomerProfile3: (
  request: UpdateProfileRequest
) => (dependencies: Deps) => T.Task<boolean>

/*

  U praksi odlažem binding
  zavisnosti što je kasnije moguće, umesto da to uradim što ranije.
  Sada bi trebalo da bude jasno kako se dolazi do `Reader`-a,
  pogledajte poslednji deo potpisa

  (dependencies: Deps) => Task<boolean>

  To nije ništa drugo nego Reader<Deps, Task<boolean>>

*/

import { Reader } from 'fp-ts/Reader'

export declare const updateCustomerProfile4: (
  request: UpdateProfileRequest
) => Reader<Deps, T.Task<boolean>>

/*

  Pošto imamo dve ugnežđene monade (Reader i Task), zgodno je uvesti treću
  monadu koja ih objedinjuje.

*/

import * as RT from 'fp-ts/ReaderTask'

/*

  Sada redefinišem capabilities
  pomoću `ReaderTask`

*/

const getEmail = (userId: number): RT.ReaderTask<Deps, string> => (e) =>
  e.db.getEmail(userId)

const updateProfile = (
  request: UpdateProfileRequest
): RT.ReaderTask<Deps, void> => (e) =>
  e.db.updateProfile(request.userId, request.name, request.email)

const sendEmailChangedNotification = (
  newEmail: string,
  oldEmail: string
): RT.ReaderTask<Deps, void> => {
  return (e) => e.email.sendEmailChangedNotification(newEmail, oldEmail)
}

/*

  ...i koristim ih da redefinišem updateCustomerProfile

*/

const updateCustomerProfile5 = (
  request: UpdateProfileRequest
): RT.ReaderTask<Deps, boolean> =>
  pipe(
    getEmail(request.userId),
    RT.chain((oldEmail) =>
      pipe(
        updateProfile(request),
        RT.chain(() => {
          if (request.email !== oldEmail) {
            return pipe(
              sendEmailChangedNotification(request.email, oldEmail),
              RT.map(() => true)
            )
          } else {
            return RT.of(false)
          }
        })
      )
    )
  )

/*

  Kako sada možemo da testiramo naš program?

  Jednostavno, definisanjem test instanci
  za `MonadDB` i `MonadEmail`

*/

/** piše na standardni izlaz */
export const putStrLn = (message: string): T.Task<void> => () =>
  new Promise((res) => {
    res(console.log(message))
  })

let _email = 'a@gmail.com'

const withMessage = <A>(message: string, fa: T.Task<A>): T.Task<A> => {
  return pipe(
    putStrLn(message),
    T.chain(() => fa)
  )
}

const setEmail = (email: string): T.Task<void> => () => {
  _email = email
  return Promise.resolve(undefined)
}

const db: MonadDB = {
  getEmail: (userId: number) =>
    withMessage(`getting email for ${userId}: ${_email}`, T.of(_email)),
  updateProfile: (_userId: number, _name: string, email: string) =>
    withMessage(
      `updating profile` +
        (_email !== email
          ? ` and changing email from ${_email} to ${email}`
          : ''),
      setEmail(email)
    )
}

const email: MonadEmail = {
  sendEmailChangedNotification: (newEmail: string, _oldEmail: string) =>
    putStrLn(`sending change notification to ${newEmail}`)
}

const testDeps: Deps = {
  db,
  email
}

// program: ReaderTask<Deps, boolean>
const program = updateCustomerProfile5({
  userId: 1,
  name: 'foo',
  email: 'b@gmail.com'
})

program(testDeps)().then(console.log)
/*
getting email for 1: a@gmail.com
updating profile and changing email from a@gmail.com to b@gmail.com
sending change notification to b@gmail.com
true
*/
