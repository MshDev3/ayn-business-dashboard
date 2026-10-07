import { SearchX } from 'lucide-react';
import { Card } from '../ui/Card';
import { LinkButton } from '../ui/Button';
import { ArrowStart } from '../ui/DirIcon';
import { EmptyState } from './States';

interface EntityNotFoundProps {
  title: string;
  text: string;
  backTo: string;
  backLabel: string;
}

/** Shown on detail routes when the id in the URL does not match any record. */
export function EntityNotFound({ title, text, backTo, backLabel }: EntityNotFoundProps) {
  return (
    <Card>
      <EmptyState
        title={title}
        description={text}
        icon={<SearchX size={26} />}
        action={
          <LinkButton to={backTo} variant="primary" icon={<ArrowStart size={18} />}>
            {backLabel}
          </LinkButton>
        }
      />
    </Card>
  );
}
