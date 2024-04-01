import { log } from '#src/server/shared/log.mjs'
import { hash, salt } from '#src/server/shared/crypt.mjs'

const generatePassword =  async (str) => {
    log(`input string received is ${str}`)
    const salted = salt()
    const password = hash(str, salted)
    log(`generated salt is ${salted}`)
    log(`generated password is ${password}`)
    process.exit(0)
}

generatePassword(process.argv[2])


