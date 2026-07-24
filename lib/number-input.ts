// Number <input> elements bound to string React state keep whatever the user
// types verbatim, so typing "10" after a default "0" leaves "010" on screen
// (numeric-state inputs re-normalize on render, string-state ones do not).
// Strip redundant leading zeros while preserving a lone "0", decimals like
// "0.5", an optional sign, and an in-progress empty string.
export function stripLeadingZeros(value: string): string {
  return value.replace(/^(-?)0+(\d)/, "$1$2");
}
