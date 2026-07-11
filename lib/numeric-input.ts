/** Keeps number fields readable while preserving useful in-progress values such as "0.". */
export function normalizeNumericInputText(value: string) {
  if (!value) return value;

  const exponentIndex = value.search(/[eE]/);
  const mantissa = exponentIndex === -1 ? value : value.slice(0, exponentIndex);
  const exponent = exponentIndex === -1 ? "" : value.slice(exponentIndex);
  const sign = mantissa.startsWith("-") || mantissa.startsWith("+") ? mantissa[0] : "";
  const unsigned = sign ? mantissa.slice(1) : mantissa;
  const decimalIndex = unsigned.indexOf(".");
  const integer = decimalIndex === -1 ? unsigned : unsigned.slice(0, decimalIndex);
  const fraction = decimalIndex === -1 ? "" : unsigned.slice(decimalIndex);
  const normalizedInteger = integer.replace(/^0+(?=\d)/, "");

  return `${sign}${normalizedInteger || (fraction ? "0" : "")}${fraction}${exponent}`;
}
