import * as React from 'react';

import { EmptyAction, EmptyIcon, EmptyTitle, EmptyWrapper } from './styles';
import { Warning } from '@kubed/icons';

interface EmptyProps {
  icon?: React.ReactNode;
  title?: string;
  desc?: string;
  actions?: any;
}

export const Empty: React.FC<EmptyProps> = props => {
  const { icon, title, desc, actions } = props;
  return (
    <EmptyWrapper>
      <EmptyIcon>{React.isValidElement(icon) ? icon : <Warning size={48} />}</EmptyIcon>
      <EmptyTitle>
        <div>{title ?? t('NO_DATA')}</div>
        {desc && <div>{desc}</div>}
      </EmptyTitle>
      {actions && <EmptyAction>{actions}</EmptyAction>}
    </EmptyWrapper>
  );
};
