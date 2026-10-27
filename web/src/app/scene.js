/**
 * Background scene: one of the game scenes in assets/img/scenes/, picked at
 * random per visit, shown darkened behind the app (styles.css body::before
 * reads --scene). Only the chosen image is downloaded.
 *
 *   showScene();   // on startup
 */

export const SCENES = [1, 2, 3, 4, 5, 6, 7].map(n => `assets/img/scenes/scene${n}.webp`);

/** A scene path; `random` returns a number in [0, 1) like Math.random. */
export function pickScene(random = Math.random) {
    return SCENES[Math.floor(random() * SCENES.length) % SCENES.length];
}

/** Set --scene on the root. The URL is made absolute: a relative url() in a
 *  custom property would resolve against styles.css, not the page. */
export function showScene(doc = document, random = Math.random) {
    const href = new URL(pickScene(random), doc.baseURI).href;
    doc.documentElement.style.setProperty('--scene', `url("${href}")`);
    return href;
}
