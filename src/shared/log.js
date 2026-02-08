const logInfo = (str) => {
    console.log(`[APP] ${str}`)
}
const logError = (str) => {
    console.error(`[APP] ${str}`)
}
const logWarn = (str) => {
    console.warn(`[APP] ${str}`)
}
export {
    logError,
    logInfo,
    logWarn
}
