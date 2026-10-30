export interface CountryOption {
  value: string
  label: string
}

// The countries campaigns are actually targeted at. Deliberately short: this
// select is used on a phone, and a full ISO list with no search box would be
// worse than a short one with an escape hatch for the odd code — see
// countryOptions, which keeps an unlisted country visible and selectable.
export const COUNTRIES: { code: string; name: string }[] = [
  { code: 'RU', name: 'Россия' },
  { code: 'UZ', name: 'Узбекистан' },
  { code: 'KZ', name: 'Казахстан' },
  { code: 'BY', name: 'Беларусь' },
  { code: 'UA', name: 'Украина' },
  { code: 'KG', name: 'Киргизия' },
  { code: 'TJ', name: 'Таджикистан' },
  { code: 'AZ', name: 'Азербайджан' },
  { code: 'AM', name: 'Армения' },
  { code: 'GE', name: 'Грузия' },
  { code: 'MD', name: 'Молдова' },
]

const NAME_BY_CODE: Record<string, string> = Object.fromEntries(
  COUNTRIES.map((c) => [c.code, c.name]),
)

/** Human name, falling back to the raw code. An IP resolves to anything at
 *  all, and campaign targeting is typed by hand in the CRM, so codes we do not
 *  list really do turn up. */
export function countryName(code?: string | null): string {
  if (!code) return ''
  const upper = code.toUpperCase()
  return NAME_BY_CODE[upper] ?? upper
}

/** Options for a select, with the current value guaranteed to be among them.
 *  Radix renders an empty trigger for a value that matches no item, so someone
 *  detected in Germany would see a blank control and think it was broken. */
export function countryOptions(selected?: string | null): CountryOption[] {
  const options = COUNTRIES.map((c) => ({ value: c.code, label: c.name }))
  const upper = selected?.toUpperCase()
  if (upper && !NAME_BY_CODE[upper]) options.unshift({ value: upper, label: upper })
  return options
}
