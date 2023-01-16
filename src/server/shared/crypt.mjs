import crypto from 'crypto'
import urlSlug from 'url-slug'

const hash = (password, salt) => {
    const salted = `${password}{${salt}}`
    let digest = crypto.createHash('sha512').update(salted).digest('binary')
    for (let i = 1; i < 5000; i++) {
        digest = crypto.createHash('sha512').update(Buffer.concat([
            Buffer.from(digest, 'binary'),
            Buffer.from(salted, 'utf8')
        ])).digest('binary')
    }
    return (Buffer.from(digest, 'binary')).toString('base64')
}

const salt = () => {
    const random = crypto.randomBytes(32).toString('base64')
    return random.replace('+', '.').replace(/.$/, '')
}

const tokenize = () => {
    const salted = salt()
    return urlSlug(salted)
}

export {
    hash,
    salt,
    tokenize
}
