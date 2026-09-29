/* tslint:disable */
/* eslint-disable */

/**
 * Legacy API: returns only playerData and sceneData, as JS `Map`s.
 *
 * Kept for `exploration_timeline.html` until it moves onto `decrypt_save`
 * (ROADMAP Phase 3). New code should call `decrypt_save`.
 */
export function decrypt_and_parse(data: Uint8Array): any;

/**
 * Decrypt a Silksong save file and return every root of the save.
 *
 * Objects are serialised as plain JavaScript objects (not `Map`s), so the JS
 * side needs no `instanceof Map` handling. New top-level roots (for example
 * from a DLC) reach JS without a Rust change.
 */
export function decrypt_save(data: Uint8Array): any;

/**
 * Decrypt a Silksong save file to its plaintext JSON string (for exports and tools).
 */
export function decrypt_to_json(data: Uint8Array): string;

export type InitInput = RequestInfo | URL | Response | BufferSource | WebAssembly.Module;

export interface InitOutput {
  readonly memory: WebAssembly.Memory;
  readonly decrypt_and_parse: (a: number, b: number) => any;
  readonly decrypt_save: (a: number, b: number) => any;
  readonly decrypt_to_json: (a: number, b: number) => [number, number, number, number];
  readonly __wbindgen_externrefs: WebAssembly.Table;
  readonly __wbindgen_malloc: (a: number, b: number) => number;
  readonly __externref_table_dealloc: (a: number) => void;
  readonly __wbindgen_free: (a: number, b: number, c: number) => void;
  readonly __wbindgen_start: () => void;
}

export type SyncInitInput = BufferSource | WebAssembly.Module;

/**
* Instantiates the given `module`, which can either be bytes or
* a precompiled `WebAssembly.Module`.
*
* @param {{ module: SyncInitInput }} module - Passing `SyncInitInput` directly is deprecated.
*
* @returns {InitOutput}
*/
export function initSync(module: { module: SyncInitInput } | SyncInitInput): InitOutput;

/**
* If `module_or_path` is {RequestInfo} or {URL}, makes a request and
* for everything else, calls `WebAssembly.instantiate` directly.
*
* @param {{ module_or_path: InitInput | Promise<InitInput> }} module_or_path - Passing `InitInput` directly is deprecated.
*
* @returns {Promise<InitOutput>}
*/
export default function __wbg_init (module_or_path?: { module_or_path: InitInput | Promise<InitInput> } | InitInput | Promise<InitInput>): Promise<InitOutput>;
