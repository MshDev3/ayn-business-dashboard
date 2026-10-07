import { useMemo, useState } from 'react';
import { Select, TextField } from '../../components/forms/Fields';
import { Card } from '../../components/ui/Card';
import { PageHeader } from '../../components/ui/PageHeader';
import { Segmented } from '../../components/ui/Segmented';
import { useData } from '../../context/DataContext';
import { useI18n } from '../../context/I18nContext';
import { useDocumentTitle } from '../../hooks/useDocumentTitle';
import { activePreset, ordersInRange, presetRange, rangeBounds } from './reportData';
import type { DateRangeKeys, RangePreset } from './reportData';
import { CustomersReport, InventoryReport, RevenueReport, SalesReport } from './ReportViews';

type ReportType = 'sales' | 'revenue' | 'customers' | 'inventory';
const REPORT_TYPES: ReportType[] = ['sales', 'revenue', 'customers', 'inventory'];
const PRESETS: RangePreset[] = ['days7', 'days30', 'days90', 'year'];

export default function ReportsPage() {
  const { t } = useI18n();
  useDocumentTitle(t('reports.title'));
  const { orders } = useData();

  const [type, setType] = useState<ReportType>('sales');
  const [range, setRange] = useState<DateRangeKeys>(() => presetRange('days90'));

  const bounds = useMemo(() => rangeBounds(range), [range]);
  const inRange = useMemo(() => ordersInRange(orders, bounds), [orders, bounds]);
  const invalid = bounds === null;
  const usesDates = type !== 'inventory';

  return (
    <div className="page">
      <PageHeader title={t('reports.title')} subtitle={t('reports.subtitle')} />

      <Card className="report-controls">
        <div className="report-controls__grid">
          <div className="field">
            <label className="field__label" htmlFor="report-type">
              {t('reports.reportType')}
            </label>
            <Select
              id="report-type"
              value={type}
              onChange={(event) => setType(event.target.value as ReportType)}
              options={REPORT_TYPES.map((value) => ({ value, label: t(`reports.types.${value}`) }))}
            />
          </div>

          {usesDates && (
            <>
              <TextField
                label={t('reports.from')}
                type="date"
                value={range.from}
                max={range.to || undefined}
                onChange={(event) => setRange((current) => ({ ...current, from: event.target.value }))}
              />
              <TextField
                label={t('reports.to')}
                type="date"
                value={range.to}
                min={range.from || undefined}
                onChange={(event) => setRange((current) => ({ ...current, to: event.target.value }))}
                error={invalid ? t('reports.invalidRange') : undefined}
              />
              <div className="field">
                <span className="field__label">
                  {t('reports.presets.label')}
                </span>
                <Segmented<RangePreset | 'custom'>
                  label={t('reports.presets.label')}
                  value={activePreset(range) ?? 'custom'}
                  onChange={(value) => {
                    if (value !== 'custom') setRange(presetRange(value));
                  }}
                  options={PRESETS.map((value) => ({ value, label: t(`reports.presets.${value}`) }))}
                />
              </div>
            </>
          )}
        </div>
      </Card>

      {type === 'sales' && <SalesReport orders={inRange} bounds={bounds} />}
      {type === 'revenue' && <RevenueReport orders={inRange} bounds={bounds} />}
      {type === 'customers' && <CustomersReport orders={inRange} bounds={bounds} />}
      {type === 'inventory' && <InventoryReport />}
    </div>
  );
}
