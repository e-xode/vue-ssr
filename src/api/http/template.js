import { serializeForScript } from '#src/shared/serialize.js';
import { SSR_STATE_ELEMENT_ID } from '#src/shared/clientConstants.js';
import { TEMPLATE_MARKER_PATTERN } from '#src/api/http/constants.js';

export function renderStateScript(state) {
  if (state === null || state === undefined) return '';
  return `<script type="application/json" id="${SSR_STATE_ELEMENT_ID}">${serializeForScript(state)}</script>`;
}

export function fillTemplate(template, values) {
  return template.replace(TEMPLATE_MARKER_PATTERN, (marker, key) => values[key] ?? '');
}
