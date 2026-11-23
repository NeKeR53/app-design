/*
 * Valeur d'un champ déclaratif (D-182). Provisoire : à remplacer par le formateur
 * des valeurs typées de ListPage (P8), dès que sa spec est publiée.
 */
import type { ReactNode } from "react";

export interface DetailValueOptions {
  type?: string;
}

export function isEmptyValue(value: unknown): boolean {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export function DetailValue({ field }: { field: DetailValueOptions & { value: unknown } }): ReactNode {
  const v = field.value;
  if (Array.isArray(v)) return v.join(", ");
  return typeof v === "string" || typeof v === "number" ? String(v) : (v as ReactNode);
}
