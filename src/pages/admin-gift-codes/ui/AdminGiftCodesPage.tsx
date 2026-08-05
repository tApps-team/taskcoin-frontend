import { Plus, Trash2 } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminAddGiftCodesMutation,
  useAdminCreateDenominationMutation,
  useAdminDeleteDenominationMutation,
  useAdminGetDenominationsQuery,
} from '@/entities/giftcode'
import { formatMoney } from '@/shared/lib/format'
import { Button, Card, CardContent, Input, Label, Modal, SimpleSelect, Spinner } from '@/shared/ui'

interface CodeRow {
  card_number: string
  card_code: string
}
const EMPTY_ROW: CodeRow = { card_number: '', card_code: '' }

export function AdminGiftCodesPage() {
  const { t } = useTranslation()
  const { data, isLoading } = useAdminGetDenominationsQuery()
  const [createDenom, { isLoading: creatingD }] = useAdminCreateDenominationMutation()
  const [deleteDenom] = useAdminDeleteDenominationMutation()
  const [addCodes, { isLoading: adding }] = useAdminAddGiftCodesMutation()

  const [denomOpen, setDenomOpen] = useState(false)
  const [label, setLabel] = useState('')
  const [price, setPrice] = useState('')

  const [codesOpen, setCodesOpen] = useState(false)
  const [codesDenom, setCodesDenom] = useState('')
  const [rows, setRows] = useState<CodeRow[]>([{ ...EMPTY_ROW }])
  const [msg, setMsg] = useState('')

  const setRow = (i: number, patch: Partial<CodeRow>) =>
    setRows((rs) => rs.map((r, idx) => (idx === i ? { ...r, ...patch } : r)))
  const addRow = () => setRows((rs) => [...rs, { ...EMPTY_ROW }])
  const removeRow = (i: number) =>
    setRows((rs) => (rs.length > 1 ? rs.filter((_, idx) => idx !== i) : [{ ...EMPTY_ROW }]))

  const saveDenom = async () => {
    await createDenom({ label, price_rub: price, is_active: true, sort: 0 }).unwrap()
    setDenomOpen(false)
    setLabel('')
    setPrice('')
  }

  const saveCodes = async () => {
    setMsg('')
    const codes = rows.filter((r) => r.card_number.trim() && r.card_code.trim())
    if (!codesDenom || codes.length === 0) {
      setMsg(t('admin.gift.parseError'))
      return
    }
    const res = await addCodes({ denomination_id: codesDenom, codes }).unwrap()
    setMsg(res.detail)
    setRows([{ ...EMPTY_ROW }])
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-4 gap-3 flex-wrap">
        <h1 className="text-2xl font-bold">{t('admin.gift.title')}</h1>
        <div className="flex gap-2">
          <Button variant="secondary" onClick={() => setCodesOpen(true)}>
            <Plus /> {t('admin.gift.addCodes')}
          </Button>
          <Button onClick={() => setDenomOpen(true)}>
            <Plus /> {t('admin.gift.addDenomination')}
          </Button>
        </div>
      </div>

      {isLoading ? (
        <Spinner />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {(data || []).map((d) => (
            <Card key={d.id}>
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="text-lg font-bold">{d.label}</div>
                  <div className="text-muted-foreground text-sm">{formatMoney(d.price_rub)}</div>
                </div>
                <div className="text-2xl font-bold text-brand-teal mt-2">{d.available_count}</div>
                <div className="text-xs text-muted-foreground">{t('admin.gift.inStock')}</div>
                <Button
                  size="sm"
                  variant="destructive"
                  className="mt-3"
                  onClick={() => confirm(t('admin.gift.confirmDelete')) && deleteDenom(d.id)}
                >
                  {t('common.delete')}
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {denomOpen && (
        <Modal title={t('admin.gift.addDenomination')} onClose={() => setDenomOpen(false)}>
          <div className="space-y-3">
            <div>
              <Label>{t('admin.gift.label')}</Label>
              <Input value={label} onChange={(e) => setLabel(e.target.value)} placeholder="$3" />
            </div>
            <div>
              <Label>{t('admin.gift.priceRub')}</Label>
              <Input type="number" value={price} onChange={(e) => setPrice(e.target.value)} placeholder="231" />
            </div>
            <Button className="w-full" disabled={creatingD || !label || !price} onClick={saveDenom}>
              {t('common.save')}
            </Button>
          </div>
        </Modal>
      )}

      {codesOpen && (
        <Modal title={t('admin.gift.addCodes')} onClose={() => setCodesOpen(false)}>
          <div className="space-y-3">
            <div>
              <Label>{t('admin.gift.denomination')}</Label>
              <SimpleSelect
                className="w-full"
                value={codesDenom}
                onValueChange={setCodesDenom}
                placeholder={t('admin.gift.selectDenomination')}
                options={(data || []).map((d) => ({ value: d.id, label: d.label }))}
              />
            </div>
            <div>
              <div className="grid grid-cols-[1fr_1fr_auto] gap-2 mb-1 px-0.5">
                <span className="text-xs text-muted-foreground">{t('admin.gift.cardCode')}</span>
                <span className="text-xs text-muted-foreground">{t('admin.gift.cardNumber')}</span>
                <span className="w-9" />
              </div>
              <div className="space-y-2 max-h-[320px] overflow-y-auto">
                {rows.map((r, i) => (
                  <div key={i} className="grid grid-cols-[1fr_1fr_auto] gap-2">
                    <Input
                      className="font-mono text-sm"
                      value={r.card_number}
                      onChange={(e) => setRow(i, { card_number: e.target.value })}
                      placeholder="1595807"
                    />
                    <Input
                      className="font-mono text-sm"
                      value={r.card_code}
                      onChange={(e) => setRow(i, { card_code: e.target.value })}
                      placeholder="7756836670948845"
                    />
                    <Button
                      size="icon"
                      variant="secondary"
                      onClick={() => removeRow(i)}
                      aria-label={t('common.delete')}
                    >
                      <Trash2 className="size-4" />
                    </Button>
                  </div>
                ))}
              </div>
              <Button size="sm" variant="secondary" className="mt-2" onClick={addRow}>
                <Plus className="size-4" /> {t('admin.gift.addRow')}
              </Button>
            </div>
            {msg && <p className="text-sm text-brand-teal">{msg}</p>}
            <Button className="w-full" disabled={adding} onClick={saveCodes}>
              {t('admin.gift.upload')}
            </Button>
          </div>
        </Modal>
      )}
    </div>
  )
}
