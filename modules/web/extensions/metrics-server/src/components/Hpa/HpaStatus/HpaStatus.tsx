import React from 'react';
import { Icon } from '@ks-console/shared';
import { Button, Tooltip } from '@kubed/components';
import { Item, TextItem, TextItemTitle, Container, TooltipContent, ToolTipTitle } from './styles';

const ICON_TYPES = {
  False: { name: 'CloseCircleDuotone', color: '#AB2F29' },
  True: { name: 'success', color: '#55BC8A' },
  Unknown: { name: 'question', color: '#E0992C' },
};

const STATUS_TITLE = {
  Ready: 'CMFT_FRONTEND.STRETCH_OBJECT_READY',
  Active: 'CMFT_FRONTEND.TRIGGER_ACTIVE',
  Fallback: 'CMFT_FRONTEND.RETRACTOR_FALLBACK',
};

interface Condition {
  status: keyof typeof ICON_TYPES;
  type: keyof typeof STATUS_TITLE;
  reason?: string;
  message?: string;
}

interface HpaStatusProps {
  status: {
    conditions?: Condition[];
  };
}

export function HpaStatus({ status }: HpaStatusProps) {
  const conditions = status?.conditions ?? [];

  const renderIconItem = (_status: keyof typeof ICON_TYPES) => {
    return (
      <Icon
        name={ICON_TYPES[_status].name}
        size={16}
        color="#fff"
        style={{
          fill: ICON_TYPES[_status].color,
        }}
      />
    );
  };

  const renderToolTip = () => {
    return (
      <TooltipContent>
        <ToolTipTitle>{t('STATUS_INFORMATION')}</ToolTipTitle>
        {conditions.map((item, index) => (
          <TextItem key={index}>
            <TextItemTitle>
              {renderIconItem(item.status)}
              <span>{t(STATUS_TITLE[item.type as 'Active'])}</span>
            </TextItemTitle>
            <ul>
              <li>{t('STATUS_VALUE', { value: item.status })}</li>
              <li>{item.reason && t('REASON_VALUE', { value: item.reason })}</li>
              <li>{item.message && t('MESSAGE_VALUE', { value: item.message })}</li>
            </ul>
          </TextItem>
        ))}
      </TooltipContent>
    );
  };

  return (
    <Tooltip content={renderToolTip()} maxWidth={300} placement={'right'} interactive>
      <Container>
        {conditions.map((item, index) => (
          <Item key={index}>{renderIconItem(item.status)}</Item>
        ))}
      </Container>
    </Tooltip>
  );
}
