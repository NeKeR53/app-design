/** Assemble des classes Tailwind ; ignore les valeurs fausses. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Anneau de focus clavier commun à tous les contrôles (`--focus`, accent par défaut, 2 px ; D-337). */
export const focusRing =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-1";

/**
 * Anneau de focus clavier tracé à l'intérieur de l'élément (2 px de retrait) : lignes, onglets, cellules
 * collés les uns aux autres. Ne pas écrire `focusRing` suivi de `-outline-offset-2` : `outline-offset-1`
 * passe après dans la feuille générée et l'emporte ; l'anneau débordait alors sur l'élément voisin (D-395).
 */
export const insetFocusRing =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:-outline-offset-2";

/**
 * Remise à zéro d'un bouton natif : Socle n'impose pas de reset global (D-010),
 * chaque contrôle retire donc les styles du navigateur.
 */
export const buttonReset = "socle-btn";
