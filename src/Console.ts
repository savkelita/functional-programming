import { log } from 'fp-ts/Console'
import { fromIO, Task } from 'fp-ts/Task'
import { createInterface } from 'readline'

/** čita sa standardnog ulaza */
export const getLine: Task<string> = () =>
  new Promise((resolve) => {
    const rl = createInterface({
      input: process.stdin,
      output: process.stdout
    })
    rl.question('> ', (answer) => {
      rl.close()
      resolve(answer)
    })
  })

/** piše na standardni izlaz */
export const putStrLn = (message: string): Task<void> => fromIO(log(message))
