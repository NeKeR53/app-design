/*
 * Interrupteur pour un réglage qui s'applique tout de suite. Spec : Toggle.spec.md.
 * Décisions : D-007, D-014, D-059, D-136, D-137 ; D-342 (lecture seule). Adapté du starter Tailwind de React Aria (Apache 2.0).
 */
import { Switch as RACSwitch } from "react-aria-components/Switch";
import { cx } from "../../lib/cx";
import { InlineLock, defined } from "../Field/Field";
import { alignFirstLine, choiceDescription, choiceRow, choiceText, indicatorFocus } from "../Field/choice";

export interface ToggleProps {
  /** Libellé ; nom accessible, même masqué. */
  children: string;
  /** Masque le libellé : ligne de réglage, `PropertyRow` (D-136). */
  hideLabel?: boolean;
  /** Ligne sous le libellé visible. */
  description?: string;
  isSelected?: boolean;
  defaultSelected?: boolean;
  /** L'effet s'applique tout de suite (D-007, D-137). */
  onChange?: (isSelected: boolean) => void;
  isDisabled?: boolean;
  /** Lecture seule : piste grise, en `--fg-2` si activé, cadenas après le libellé ; focusable (D-342). */
  isReadOnly?: boolean;
  name?: string;
}

/** Interrupteur de 30 × 18 px, partout le même (D-136). */
export function Toggle({ children, hideLabel, description, ...rest }: ToggleProps) {
  const readOnly = Boolean(rest.isReadOnly);
  return (
    <RACSwitch {...defined(rest)} {...defined({ "aria-label": hideLabel ? children : undefined })} className={cx(choiceRow, hideLabel && "items-center")}>
      <span
        className={cx(
          "relative h-[18px] w-[30px] shrink-0 rounded-full transition-colors duration-[var(--dur-fast)] ease-standard motion-reduce:transition-none",
          readOnly ? "bg-surface-side shadow-[inset_0_0_0_1px_var(--line)] group-data-selected/choice:bg-fg-2" : "bg-selected group-data-selected/choice:bg-accent",
          !hideLabel && alignFirstLine(18),
          indicatorFocus,
        )}
      >
        <span className="absolute top-[2px] left-[2px] size-[14px] rounded-full bg-[#fff] shadow-sm transition-transform duration-[var(--dur-fast)] ease-standard group-data-selected/choice:translate-x-3 motion-reduce:transition-none" />
      </span>
      {hideLabel && readOnly && <InlineLock />}
      {!hideLabel && (
        <span className={choiceText}>
          <span>
            {children}
            {readOnly && <InlineLock />}
          </span>
          {description && <span className={choiceDescription}>{description}</span>}
        </span>
      )}
    </RACSwitch>
  );
}
