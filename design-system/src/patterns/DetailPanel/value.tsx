/*
 * Valeur d'un champ déclaratif (D-182) : rendue par FormattedValue (D-170).
 * Un texte simple reste une chaîne, pour garder la coupe à trois lignes et l'info-bulle de PropertyRow (D-058).
 */
import type { ReactNode } from "react";
import { FormattedValue, useFormatValue, type ValueFormat } from "../../components/FormattedValue/FormattedValue";

const PLAIN = new Set(["text", "tags", "boolean"]);

export function useFieldValue(): (field: ValueFormat & { value: unknown }) => ReactNode {
  const format = useFormatValue();
  return ({ value, type = "text", statuses, currency, decimals, durationUnit }) => {
    const fmt: ValueFormat = { type, ...(statuses ? { statuses } : {}), ...(currency ? { currency } : {}), ...(decimals !== undefined ? { decimals } : {}), ...(durationUnit ? { durationUnit } : {}) };
    if (PLAIN.has(type)) return format(value, fmt);
    return <FormattedValue value={value} {...fmt} />;
  };
}
