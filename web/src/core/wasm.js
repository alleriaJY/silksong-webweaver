/**
 * The only module that talks to the WASM package.
 *
 *   await loadWasm();
 *   const save = decryptSave(bytes);   // { playerData, sceneData, roots }
 *
 * Everything returned is plain objects/arrays (see normalize.js), so the rest
 * of the app never needs `instanceof Map`.
 */
import init, { decrypt_save } from '../../pkg/wasm_crypto.js';
import { toPlain } from './normalize.js';

export class SaveDecryptError extends Error {
    constructor(message) {
        super(message);
        this.name = 'SaveDecryptError';
    }
}

let loading = null;

/** Initialise the WASM module once; concurrent callers share the same promise. */
export function loadWasm() {
    if (!loading) {
        loading = init().catch((err) => {
            loading = null; // allow a retry after a failed load
            throw err;
        });
    }
    return loading;
}

/**
 * Decrypt raw .dat bytes. Throws SaveDecryptError with the WASM error message
 * on failure. `roots` holds every top-level root of the save (a DLC may add
 * more than playerData/sceneData).
 */
export function decryptSave(bytes) {
    const result = decrypt_save(bytes);
    if (!result || !result.success) {
        throw new SaveDecryptError(result?.error || 'Unknown error');
    }
    const roots = toPlain(result.save) || {};
    return {
        playerData: roots.playerData || {},
        sceneData: roots.sceneData || {},
        roots,
    };
}
