import { describe, it, expect, beforeEach } from 'vitest';
import { readSsrState } from '@/shared/ssrState';

function setStateElement(text) {
  document.body.innerHTML = `<script type="application/json" id="__SSR_STATE__">${text}</script>`;
}

describe('shared/ssrState.js', () => {
  beforeEach(() => {
    document.body.innerHTML = '';
    console.error.mockClear();
  });

  it('returns null when the element is absent', () => {
    expect(readSsrState()).toBeNull();
  });

  it('parses the serialized state', () => {
    setStateElement('{"auth":{"user":null},"text":"\\u003cb\\u003e"}');

    expect(readSsrState()).toEqual({ auth: { user: null }, text: '<b>' });
  });

  it('logs and returns null on malformed JSON', () => {
    setStateElement('{not json');

    expect(readSsrState()).toBeNull();
    expect(console.error).toHaveBeenCalledTimes(1);
  });

  it('rejects a state that is not a plain object', () => {
    setStateElement('[1,2]');

    expect(readSsrState()).toBeNull();
  });
});
