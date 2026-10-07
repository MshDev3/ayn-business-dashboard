import { ArrowLeft, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';
import type { LucideProps } from 'lucide-react';
import { useI18n } from '../../context/I18nContext';

/**
 * Direction-aware icons. "Start" points to where reading begins (left in LTR, right in RTL)
 * and "End" points to where it continues, so back/next affordances stay correct in Arabic.
 */
export function ChevronStart(props: LucideProps) {
  const { isRtl } = useI18n();
  return isRtl ? <ChevronRight {...props} /> : <ChevronLeft {...props} />;
}

export function ChevronEnd(props: LucideProps) {
  const { isRtl } = useI18n();
  return isRtl ? <ChevronLeft {...props} /> : <ChevronRight {...props} />;
}

export function ArrowStart(props: LucideProps) {
  const { isRtl } = useI18n();
  return isRtl ? <ArrowRight {...props} /> : <ArrowLeft {...props} />;
}

export function ArrowEnd(props: LucideProps) {
  const { isRtl } = useI18n();
  return isRtl ? <ArrowLeft {...props} /> : <ArrowRight {...props} />;
}
