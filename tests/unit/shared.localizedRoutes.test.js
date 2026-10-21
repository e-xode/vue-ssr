import { describe, it, expect } from 'vitest';
import {
  LOCALES,
  DEFAULT_LOCALE,
  PAGES,
  findPageBySlug,
  localizeSubPath,
  localizedPath,
  pageSlugs,
  pathLocaleMismatch,
} from '@/shared/localizedRoutes';

describe('shared/localizedRoutes.js', () => {
  it('exposes the locales and the default locale of the kit', () => {
    expect(LOCALES).toEqual(['en', 'fr']);
    expect(DEFAULT_LOCALE).toBe('en');
  });

  it('declares a slug for every locale on every page', () => {
    for (const page of PAGES) {
      for (const locale of LOCALES) {
        expect(typeof page.slugs[locale]).toBe('string');
      }
    }
  });

  it('builds the localized path of a page', () => {
    expect(localizedPath('Index', 'fr')).toBe('/fr');
    expect(localizedPath('Contact', 'en')).toBe('/en/contact');
  });

  it('falls back to the default locale and returns null for unknown pages', () => {
    expect(localizedPath('Contact', 'de')).toBe('/en/contact');
    expect(localizedPath('Missing', 'en')).toBeNull();
  });

  it('finds a page by slug with or without slashes', () => {
    expect(findPageBySlug('contact')?.name).toBe('Contact');
    expect(findPageBySlug('/contact/')?.name).toBe('Contact');
    expect(findPageBySlug('')?.name).toBe('Index');
    expect(findPageBySlug('unknown')).toBeNull();
  });

  it('lists the distinct slugs of a page', () => {
    expect(pageSlugs('Contact')).toEqual(['contact']);
    expect(pageSlugs('Missing')).toEqual([]);
  });

  it('localizes a sub path and leaves unknown sub paths untouched', () => {
    expect(localizeSubPath('/contact', 'fr')).toBe('/contact');
    expect(localizeSubPath('/signin', 'fr')).toBe('/signin');
  });

  it('reports no mismatch when slugs are identical across locales', () => {
    expect(pathLocaleMismatch('/fr/contact')).toBeNull();
    expect(pathLocaleMismatch('/en')).toBeNull();
    expect(pathLocaleMismatch('/fr/unknown')).toBeNull();
    expect(pathLocaleMismatch('/contact')).toBeNull();
  });

  describe('with a localized slug', () => {
    const contact = PAGES.find((page) => page.name === 'Contact');
    const original = { ...contact.slugs };

    function localizeContact() {
      contact.slugs.en = 'contact-us';
      contact.slugs.fr = 'nous-contacter';
    }

    function restoreContact() {
      Object.assign(contact.slugs, original);
    }

    it('returns the canonical path when a slug is used under the wrong locale', () => {
      localizeContact();
      try {
        expect(pathLocaleMismatch('/fr/contact-us')).toBe('/fr/nous-contacter');
        expect(pathLocaleMismatch('/en/nous-contacter?x=1')).toBe('/en/contact-us');
        expect(pathLocaleMismatch('/fr/nous-contacter')).toBeNull();
      } finally {
        restoreContact();
      }
    });

    it('lists both slugs and localizes sub paths', () => {
      localizeContact();
      try {
        expect(pageSlugs('Contact')).toEqual(['contact-us', 'nous-contacter']);
        expect(localizeSubPath('/contact-us', 'fr')).toBe('/nous-contacter');
        expect(localizedPath('Contact', 'fr')).toBe('/fr/nous-contacter');
      } finally {
        restoreContact();
      }
    });
  });
});
