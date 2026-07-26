import { Plus } from 'lucide-react'
import { useState } from 'react'
import { useTranslation } from 'react-i18next'
import {
  useAdminAddGiftCodesMutation,
  useAdminCreateDenominationMutation,
  useAdminDeleteDenominationMutation,
  useAdminGetDenominationsQuery,
} from '@/entities/giftcode'
import { formatMoney } from '@/shared/lib/format'
import { Button, Card, CardContent, Input, Label, Modal, SimpleSelect, Spinner, Textarea } from '@/shared/ui'

function parseCodes(text: string): { card_number: string; card_code: string }[] {
  return text
    .split('\n')
    .map((l) => l.trim())
    .filter(Boolean)
    .map((l) => {
      const parts = l.split(/[\s,;\t]+/).filter(Boolean)
      return { card_number: parts[0] || '', card_code: parts[1] || '' }
    })
    .filter((c) => c.card_number && c.card_code)
}

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
  const [codesText, setCodesText] = useState('')
  const [msg, setMsg] = useState('')

  const saveDenom = async () => {
    await createDenom({ label, price_rub: price, is_active: true, sort: 0 }).unwrap()
    setDenomOpen(false)
    setLabel('')
    setPrice('')
  }

  const saveCodes = async () => {
    setMsg('')
    const codes = parseCodes(codesText)
    if (!codesDenom || codes.length === 0) {
      setMsg(t('admin.gift.parseError'))
      return
    }
    const res = await addCodes({ denomination_id: codesDenom, codes }).unwrap()
    setMsg(res.detail)
    setCodesText('')
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
              <Label>{t('admin.gift.codesLabel')}</Label>
              <Textarea
                className="min-h-[160px] font-mono text-sm"
                value={codesText}
                onChange={(e) => setCodesText(e.target.value)}
                placeholder={'номер1 код1\nномер2 код2'}
              />
              <p className="text-xs text-muted-foreground mt-1">{t('admin.gift.codesHint')}</p>
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
