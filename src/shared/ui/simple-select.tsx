import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'

export interface Option {
  value: string
  label: string
}

// Radix Select forbids empty-string item values, so an empty option value
// (used for "All") is mapped to a sentinel internally and back to '' outward.
const ALL = '__all'

export function SimpleSelect({
  value,
  onValueChange,
  options,
  placeholder,
  className,
}: {
  value: string
  onValueChange: (v: string) => void
  options: Option[]
  placeholder?: string
  className?: string
}) {
  return (
    <Select value={value || ALL} onValueChange={(v) => onValueChange(v === ALL ? '' : v)}>
      <SelectTrigger className={className}>
        <SelectValue placeholder={placeholder} />
      </SelectTrigger>
      <SelectContent>
        {options.map((o) => (
          <SelectItem key={o.value || ALL} value={o.value || ALL}>
            {o.label}
          </SelectItem>
        ))}
      </SelectContent>
    </Select>
  )
}
