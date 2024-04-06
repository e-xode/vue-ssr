import bcrypt from 'bcrypt'
import crypto from 'crypto'
import urlSlug from 'url-slug'

const hash = (password, salt = null) => {
    const salted = salt
        ? salt
        : bcrypt.genSaltSync(10)
    return bcrypt.hashSync(password, salted)
}

const rand = () => {
    return (Math.floor(100000 + Math.random() * 900000))
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
    rand,
    salt,
    tokenize
}
