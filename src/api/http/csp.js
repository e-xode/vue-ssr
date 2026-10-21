const RECAPTCHA_SCRIPT_ORIGINS = [
  'https://www.google.com/recaptcha/',
  'https://www.gstatic.com/recaptcha/',
];

const GTAG_SCRIPT_ORIGIN = 'https://www.googletagmanager.com';

const ANALYTICS_COLLECT_ORIGINS = [
  'https://*.google-analytics.com',
  'https://*.analytics.google.com',
  'https://*.googletagmanager.com',
];

const RECAPTCHA_FRAME_ORIGINS = [
  'https://www.google.com/recaptcha/',
  'https://recaptcha.google.com/',
];

const DEV_SCRIPT_SOURCES = ["'unsafe-inline'", "'unsafe-eval'"];

const DEV_CONNECT_SOURCES = ['ws:', 'wss:'];

export function buildCsp(production) {
  return {
    defaultSrc: ["'self'"],
    scriptSrc: [
      "'self'",
      GTAG_SCRIPT_ORIGIN,
      ...RECAPTCHA_SCRIPT_ORIGINS,
      ...(production ? [] : DEV_SCRIPT_SOURCES),
    ],
    styleSrc: ["'self'", "'unsafe-inline'"],
    imgSrc: ["'self'", 'data:', ...ANALYTICS_COLLECT_ORIGINS],
    fontSrc: ["'self'"],
    connectSrc: [
      "'self'",
      ...ANALYTICS_COLLECT_ORIGINS,
      'https://www.google.com/recaptcha/',
      ...(production ? [] : DEV_CONNECT_SOURCES),
    ],
    frameSrc: ["'self'", ...RECAPTCHA_FRAME_ORIGINS],
    objectSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    ...(production ? {} : { upgradeInsecureRequests: null }),
  };
}
