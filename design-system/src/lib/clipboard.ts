/* Copie dans le presse-papiers, reprise d'Alfred (src/ui/components/clipboard.ts). */
/**
 * Copie un texte. Le cadre isolé d’une page n’a pas toujours accès au presse-papiers asynchrone : la copie passe alors
 * par une zone de texte temporaire et la commande « copier » du document, permise pendant un clic ou une frappe.
 */
export async function copyText(text: string): Promise<void> {
  try {
    if (!navigator.clipboard?.writeText) throw new Error("Presse-papiers indisponible.");
    await navigator.clipboard.writeText(text);
    return;
  } catch {
    const area = document.createElement("textarea");
    area.value = text;
    area.setAttribute("readonly", "");
    area.style.position = "fixed";
    area.style.opacity = "0";
    const focused = document.activeElement instanceof HTMLElement ? document.activeElement : null;
    document.body.append(area);
    area.select();
    const done = typeof document.execCommand === "function" && document.execCommand("copy");
    area.remove();
    focused?.focus({ preventScroll: true });
    if (!done) throw new Error("La copie n’est pas permise ici.");
  }
}
