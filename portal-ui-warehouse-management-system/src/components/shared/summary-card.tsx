interface SummaryCardProps {
  label: string
  value: number | string
  helpText?: string
}

export function SummaryCard({ label, value, helpText }: SummaryCardProps) {
  return (
    <div className="rounded-[10px] border border-border bg-white p-3.5">
      <div className="text-[11px] text-dark-normal">{label}</div>
      <div className="mt-2 text-2xl font-semibold text-dark-active">{value}</div>
      {helpText ? (
        <div className="mt-1 text-[10px] text-dark-light-active">{helpText}</div>
      ) : null}
    </div>
  )
}
