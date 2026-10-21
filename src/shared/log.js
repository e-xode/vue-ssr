import { DEFAULT_LOG_LEVEL, LOG_LEVELS } from '#src/shared/const.js';

const currentThreshold = () => {
  const requested = String(process.env.LOG_LEVEL ?? '').toLowerCase();
  return LOG_LEVELS[requested] ?? LOG_LEVELS[DEFAULT_LOG_LEVEL];
};

const isEnabled = (level) => LOG_LEVELS[level] <= currentThreshold();

const format = (icon, scope, str) => {
  const tag = scope ? `[APP] [${scope}]` : '[APP]';
  return `${icon} ${tag} [${new Date().toISOString()}] ${str}`;
};

const logError = (str, scope = null) => {
  console.error(format('✗', scope, str));
};
const logWarn = (str, scope = null) => {
  if (isEnabled('warn')) console.warn(format('⚠', scope, str));
};
const logInfo = (str, scope = null) => {
  if (isEnabled('info')) console.log(format('ℹ', scope, str));
};
const logDebug = (str, scope = null) => {
  if (isEnabled('debug')) console.debug(format('🐛', scope, str));
};

const logScope = (scope) => ({
  error: (str) => logError(str, scope),
  warn: (str) => logWarn(str, scope),
  info: (str) => logInfo(str, scope),
  debug: (str) => logDebug(str, scope),
});

export { logError, logInfo, logWarn, logDebug, logScope };
