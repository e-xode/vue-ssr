import { describe, it, expect } from 'vitest';
import { fillTemplate, renderStateScript } from '#src/api/http/template.js';

const TEMPLATE =
  '<html lang="<!--app-lang-->" class="v-theme--<!--app-theme-->"><head><!--app-head--></head>' +
  '<body><div id="app"><!--app-html--></div><!--app-state--></body></html>';

describe('api/http/template.js', () => {
  it('fills every marker', () => {
    const html = fillTemplate(TEMPLATE, {
      lang: 'fr',
      theme: 'dark',
      head: '<title>T</title>',
      html: '<main>x</main>',
      state: '<script>s</script>',
    });

    expect(html).toContain('lang="fr"');
    expect(html).toContain('v-theme--dark');
    expect(html).toContain('<head><title>T</title></head>');
    expect(html).toContain('<div id="app"><main>x</main></div><script>s</script>');
    expect(html).not.toContain('<!--app-');
  });

  it('never interprets replacement patterns in rendered html', () => {
    const rendered = "<p>cost $& and $' and $1 and $$</p>";

    const html = fillTemplate(TEMPLATE, { lang: 'en', theme: 'light', html: rendered });

    expect(html).toContain(rendered);
  });

  it('does not expand markers that appear inside injected values', () => {
    const html = fillTemplate(TEMPLATE, {
      lang: 'en',
      theme: 'light',
      head: '<!--app-html-->',
      html: 'safe',
    });

    expect(html).toContain('<head><!--app-html--></head>');
  });

  it('renders missing values as empty strings', () => {
    const html = fillTemplate('<!--app-head-->|<!--app-state-->', {});

    expect(html).toBe('|');
  });

  describe('renderStateScript', () => {
    it('returns an empty string without state', () => {
      expect(renderStateScript(null)).toBe('');
      expect(renderStateScript(undefined)).toBe('');
    });

    it('serializes the state safely into a json script', () => {
      const script = renderStateScript({ note: '</script><b>&' });

      expect(script.startsWith('<script type="application/json" id="__SSR_STATE__">')).toBe(true);
      expect(script.endsWith('</script>')).toBe(true);
      expect(script.slice(0, -'</script>'.length)).not.toContain('</script');
      expect(script).toContain('\\u003c/script\\u003e');
    });

    it('keeps an empty state object so the client knows a prefetch ran', () => {
      expect(renderStateScript({})).toContain('>{}</script>');
    });
  });
});
