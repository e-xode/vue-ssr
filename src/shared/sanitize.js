import sanitizeHtml from 'sanitize-html';

const ALLOWED_TAGS = [
  'p',
  'br',
  'hr',
  'strong',
  'b',
  'em',
  'i',
  'u',
  's',
  'del',
  'mark',
  'span',
  'h1',
  'h2',
  'h3',
  'ul',
  'ol',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'img',
  'div',
  'iframe',
];

const ALLOWED_ATTRIBUTES = {
  span: ['style', 'class'],
  div: ['class'],
  p: ['class', 'style'],
  a: ['href', 'target', 'rel'],
  img: ['src', 'alt', 'width', 'height'],
  iframe: ['src', 'width', 'height', 'frameborder', 'allowfullscreen', 'allow'],
};

const ALLOWED_STYLES = {
  '*': {
    color: [/^(#[0-9a-fA-F]{3,8}|rgb\([\d\s,.%]+\)|rgba\([\d\s,.%]+\)|[a-zA-Z]+)$/],
    'text-align': [/^(left|center|right|justify)$/],
  },
};

const ALLOWED_IFRAME_HOSTNAMES = [
  'www.youtube.com',
  'www.youtube-nocookie.com',
  'player.vimeo.com',
];

export function sanitize(html) {
  if (!html || typeof html !== 'string') return '';

  return sanitizeHtml(html, {
    allowedTags: ALLOWED_TAGS,
    allowedAttributes: ALLOWED_ATTRIBUTES,
    allowedStyles: ALLOWED_STYLES,
    allowedIframeHostnames: ALLOWED_IFRAME_HOSTNAMES,
    allowedSchemes: ['http', 'https', 'mailto'],
    allowedSchemesByTag: {
      img: ['http', 'https'],
      a: ['http', 'https', 'mailto'],
    },
    transformTags: {
      a: sanitizeHtml.simpleTransform('a', { target: '_blank', rel: 'noopener noreferrer' }),
    },
  });
}

export function isEmptyHtml(html) {
  if (!html) return true;
  return html.replace(/<[^>]*>/g, '').trim().length === 0;
}
