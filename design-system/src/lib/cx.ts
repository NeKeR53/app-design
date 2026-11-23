/** Assemble des classes Tailwind ; ignore les valeurs fausses. */
export function cx(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(" ");
}

/** Anneau de focus clavier commun à tous les contrôles (`--focus`, accent par défaut, 2 px ; D-337). */
export const focusRing =
  "outline-none data-focus-visible:outline-2 data-focus-visible:outline-solid data-focus-visible:outline-focus data-focus-visible:outline-offset-1";

/**
 * Remise à zéro d'un bouton natif : Socle n'impose pas de reset global (D-010),
 * chaque contrôle retire donc les styles du navigateur.
 */
export const buttonReset = "socle-btn";
