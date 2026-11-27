/** Assemble des classes Tailwind ; ignore les valeurs fausses. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/*
 * Anneau de focus (D-425) : un seul anneau, en contour (`outline`), qui suit le rayon du contrôle.
 * Épaisseur `--focus-w` (2 px), couleur `--focus` (accent par défaut, D-337), à 1 px du bord
 * (`--focus-offset`), ou à 2 px à l'intérieur pour les éléments collés les uns aux autres.
 * La couleur est posée au repos (`outline-focus`) : un contrôle en fondu de couleurs (`transition-colors`)
 * ne fait pas passer l'anneau par la couleur du texte quand il apparaît.
 * Un conteneur qui défile rogne l'anneau : il lui réserve sa place avec `socle-focus-room` (styles.css).
 */

/** Anneau clavier d'un contrôle React Aria (`data-focus-visible`) : boutons, liens, cases, poignées (D-337, D-425). */
export const focusRing =
  "outline-none outline-focus data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-offset-1";

/**
 * Anneau clavier tracé à l'intérieur de l'élément (2 px de retrait) : lignes, onglets, cellules
 * collés les uns aux autres. Ne pas écrire `focusRing` suivi de `-outline-offset-2` : `outline-offset-1`
 * passe après dans la feuille générée et l'emporte ; l'anneau débordait alors sur l'élément voisin (D-395).
 */
export const insetFocusRing =
  "outline-none outline-focus data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:-outline-offset-2";

/** Anneau clavier d'un élément natif, sans React Aria (`:focus-visible`) : zone qui défile, lien natif (D-425). */
export const nativeFocusRing =
  "outline-none outline-focus focus-visible:outline-2 focus-visible:outline-solid focus-visible:outline-offset-1";

/** Comme `nativeFocusRing`, tracé à l'intérieur : zone qui défile collée au cadre de son composant (D-425). */
export const nativeInsetFocusRing =
  "outline-none outline-focus focus-visible:outline-2 focus-visible:outline-solid focus-visible:-outline-offset-2";

/**
 * Anneau du cadre d'un champ composé, posé sur le cadre quand le focus est dedans (`:focus-within`) :
 * barre de recherche, terminal. Le champ natif intérieur n'a pas d'anneau (`outline-none`) : un seul anneau (D-425).
 */
export const focusWithinRing =
  "outline-none outline-focus focus-within:outline-2 focus-within:outline-solid focus-within:outline-offset-1";

/**
 * Remise à zéro d'un bouton natif : Socle n'impose pas de reset global (D-010),
 * chaque contrôle retire donc les styles du navigateur.
 */
export const buttonReset = "socle-btn";
