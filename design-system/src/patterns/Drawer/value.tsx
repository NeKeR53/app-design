/*
 * Valeur d'un champ déclaratif (D-182) : rendue par FormattedValue (D-170).
 * Un texte simple reste une chaîne, pour garder la coupe à trois lignes et l'info-bulle de PropertyRow (D-058).
 * Des étiquettes (`tags`) se rendent en `TagGroup` de lecture, nommé par le libellé du champ (D-433).
 */
import type { ReactNode } from "react";
import { FormattedValue, useFormatValue, type ValueFormat } from "../../components/FormattedValue/FormattedValue";
import { Tag, TagGroup } from "../../components/Tag/Tag";

const PLAIN = new Set(["text", "tags", "boolean"]);

type Field = ValueFormat & { value: unknown; label: string; details?: unknown };

export function useFieldValue(): (field: Field) => ReactNode {
  const format = useFormatValue();
  return ({ value, label, details, type = "text", statuses, currency, decimals, durationUnit }) => {
    const fmt: ValueFormat = { type, ...(statuses ? { statuses } : {}), ...(currency ? { currency } : {}), ...(decimals !== undefined ? { decimals } : {}), ...(durationUnit ? { durationUnit } : {}) };
    // Dans une ligne à détails (un bouton), un groupe d'étiquettes n'a pas sa place : le texte reste.
    if (type === "tags" && Array.isArray(value) && !details) {
      const tags = [...new Set(value.map(String).filter(Boolean))];
      return (
        <TagGroup label={label} hideLabel>
          {tags.map((t) => (
            <Tag key={t} id={t}>
              {t}
            </Tag>
          ))}
        </TagGroup>
      );
    }
    if (PLAIN.has(type)) return format(value, fmt);
    return <FormattedValue value={value} {...fmt} />;
  };
}
