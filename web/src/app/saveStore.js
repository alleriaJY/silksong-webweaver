/**
 * The one loaded save, shared by every page of the app shell (Statistics,
 * Hero's Path, ...). Uploading once feeds them all.
 *
 *   status: 'empty' | 'loading' | 'ready' | 'error'
 *   fileName, save ({ playerData, sceneData, roots }), parsed (parseAllData), error
 */

const EMPTY = { status: 'empty', fileName: null, save: null, parsed: null, error: null };

export function createSaveStore() {
    const listeners = new Set();
    let state = { ...EMPTY };
    return {
        get: () => state,
        set(next) {
            state = { ...state, ...next };
            for (const listener of listeners) listener(state);
        },
        reset() { this.set({ ...EMPTY }); },
        subscribe(listener) {
            listeners.add(listener);
            return () => listeners.delete(listener);
        },
    };
}

export const saveStore = createSaveStore();
