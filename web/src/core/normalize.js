/**
 * Deep-convert anything that came back from WASM into plain JSON-shaped data.
 *
 * decrypt_save() already serialises with json_compatible(), so objects arrive
 * as plain objects. This is a defensive second line: if a Map ever slips
 * through (an older pkg build, a future serde change) parsers still only see
 * plain objects and arrays.
 */
export function toPlain(value) {
    if (value instanceof Map) {
        const out = {};
        for (const [k, v] of value) out[k] = toPlain(v);
        return out;
    }
    if (Array.isArray(value)) return value.map(toPlain);
    if (value && typeof value === 'object') {
        const out = {};
        for (const k of Object.keys(value)) out[k] = toPlain(value[k]);
        return out;
    }
    return value;
}
