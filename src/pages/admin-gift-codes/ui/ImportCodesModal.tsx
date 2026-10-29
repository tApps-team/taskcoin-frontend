import { AlertTriangle, FileUp, Upload } from 'lucide-react'
import { useRef, useState } from 'react'
import { useTranslation } from 'react-i18next'
import { useAdminImportGiftCodesMutation } from '@/entities/giftcode'
import type { Denomination, GiftImportResult } from '@/shared/api/types'
import { getErrorMessage } from '@/shared/lib/errors'
import { Button, Modal, SimpleSelect, Spinner, Textarea } from '@/shared/ui'

const SAMPLE = '1595807  7756836670948845 5.00 WMT'

/** Key a group by its face value; rows with no value column share the '' key,
 *  which is also what the backend uses, so the mapping travels unchanged. */
const keyOf = (value: string | null) => value ?? ''

export function ImportCodesModal({
  denominations,
  onClose,
}: {
  denominations: Denomination[]
  onClose: () => void
}) {
  const { t } = useTranslation()
  const [runImport, { isLoading }] = useAdminImportGiftCodesMutation()
  const fileInput = useRef<HTMLInputElement>(null)

  const [text, setText] = useState('')
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [result, setResult] = useState<GiftImportResult | null>(null)
  const [error, setError] = useState('')

  const options = [
    { value: '', label: t('admin.gift.import.pickDenomination') },
    ...denominations.map((d) => ({ value: d.id, label: d.label })),
  ]

  // Every call is the same call; only dry_run differs. That is what keeps the
  // preview honest — it cannot describe an outcome the import would not give.
  const call = async (dryRun: boolean, withMapping: Record<string, string>) => {
    setError('')
    try {
      const res = await runImport({ text, mapping: withMapping, dry_run: dryRun }).unwrap()
      setResult(res)
      if (!dryRun && res.imported > 0) setText('')
      return res
    } catch (e) {
      setError(getErrorMessage(e, t('common.error')))
      return null
    }
  }

  const check = () => call(true, mapping)

  const remap = async (groupKey: string, denominationId: string) => {
    const next = { ...mapping }
    if (denominationId) next[groupKey] = denominationId
    else delete next[groupKey]
    setMapping(next)
    // Re-check immediately: the admin should see the effect of the choice, not
    // have to remember to press a button before importing.
    if (text.trim()) await call(true, next)
  }

  const readFile = async (file: File) => {
    setResult(null)
    setText(await file.text())
  }

  const problemLabel = (reason: string) =>
    t([`admin.gift.import.problem.${reason}`, 'admin.gift.import.problem.unknown'])

  return (
    <Modal title={t('admin.gift.import.title')} onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">
          {t('admin.gift.import.hint')}
          <br />
          <span className="font-mono text-xs select-all">{SAMPLE}</span>
        </p>

        <div>
          <Textarea
            rows={8}
            className="font-mono text-xs"
            placeholder={t('admin.gift.import.placeholder')}
            value={text}
            onChange={(e) => {
              setText(e.target.value)
              setResult(null)
            }}
          />
          <div className="flex gap-2 mt-2 flex-wrap">
            <Button variant="secondary" size="sm" onClick={() => fileInput.current?.click()}>
              <FileUp className="size-3.5" /> {t('admin.gift.import.fromFile')}
            </Button>
            <input
              ref={fileInput}
              type="file"
              accept=".csv,.tsv,.txt,text/plain,text/csv"
              className="hidden"
              onChange={(e) => {
                const file = e.target.files?.[0]
                if (file) void readFile(file)
                e.target.value = ''
              }}
            />
            <Button size="sm" disabled={!text.trim() || isLoading} onClick={check}>
              {t('admin.gift.import.check')}
            </Button>
          </div>
        </div>

        {isLoading && <Spinner />}
        {error && <p className="text-destructive text-sm">{error}</p>}

        {result && (
          <div className="space-y-3">
            <div className="text-sm">
              {t('admin.gift.import.parsed', { count: result.parsed })}
              {result.duplicates_in_db > 0 && (
                <span className="text-amber-300">
                  {' · '}
                  {t('admin.gift.import.alreadyInStock', { count: result.duplicates_in_db })}
                </span>
              )}
            </div>

            {/* The face value in the file is not one of our denominations, so
                the admin says which is which. Nothing imports until they do. */}
            <div className="space-y-2">
              {result.groups.map((g) => {
                const key = keyOf(g.value)
                return (
                  <div
                    key={key}
                    className="flex items-center justify-between gap-3 rounded-xl bg-white/5 px-3 py-2 flex-wrap"
                  >
                    <div className="text-sm">
                      <span className="font-semibold">
                        {g.value ?? t('admin.gift.import.noValue')}
                        {g.currency ? ` ${g.currency}` : ''}
                      </span>
                      <span className="text-muted-foreground">
                        {' · '}
                        {t('admin.gift.import.cards', { count: g.count })}
                      </span>
                    </div>
                    <SimpleSelect
                      className="w-44"
                      value={mapping[key] ?? ''}
                      options={options}
                      placeholder={t('admin.gift.import.pickDenomination')}
                      onValueChange={(v) => void remap(key, v)}
                    />
                  </div>
                )
              })}
            </div>

            {result.problems.length > 0 && (
              <div className="rounded-xl border border-amber-400/30 bg-amber-400/5 p-3">
                <div className="flex items-center gap-2 text-amber-300 text-sm font-semibold mb-1.5">
                  <AlertTriangle className="size-4" />
                  {t('admin.gift.import.problems', { count: result.problems_total })}
                </div>
                <div className="space-y-1 max-h-48 overflow-y-auto">
                  {result.problems.map((p, i) => (
                    <div key={`${p.line}-${i}`} className="text-xs">
                      <span className="text-muted-foreground">
                        {t('admin.gift.import.line', { line: p.line })}
                      </span>{' '}
                      {problemLabel(p.reason)}
                      {p.text && (
                        <span className="font-mono text-muted-foreground"> · {p.text}</span>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            {result.imported > 0 ? (
              <p className="text-brand-teal font-semibold text-sm">
                {t('admin.gift.import.done', { count: result.imported })}
              </p>
            ) : (
              <Button
                variant="teal"
                className="w-full"
                disabled={result.ready === 0 || isLoading}
                onClick={() => call(false, mapping)}
              >
                <Upload className="size-4" />
                {result.ready > 0
                  ? t('admin.gift.import.submit', { count: result.ready })
                  : t('admin.gift.import.nothingToImport')}
              </Button>
            )}
          </div>
        )}
      </div>
    </Modal>
  )
}
