const logInfo = (str) => {
    console.log(`ℹ [APP] ${str}`)
}
const logError = (str) => {
    console.error(`✗ [APP] ${str}`)
}
const logWarn = (str) => {
    console.warn(`⚠ [APP] ${str}`)
}
const logDebug = (str) => {
    console.debug(`🐛 [APP] ${str}`)
}
export {
    logError,
    logInfo,
    logWarn,
    logDebug
}
