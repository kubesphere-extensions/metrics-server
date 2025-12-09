import React from 'react';
import { Icon } from '@ks-console/shared';
import { Button, Tooltip, StatusDot } from '@kubed/components';
import { Information } from '@kubed/icons';
import {
  TextItem,
  TextItemTitle,
  Container,
  TooltipContent,
  ToolTipTitle,
  StatusDotContainer,
} from './styles';
import { STATUS_TITLE, ICON_TYPES } from '../../constant';

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
  ready?: string;
  onClick?: () => void;
}

export function HpaStatus({ status, ready, onClick }: HpaStatusProps) {
  const conditions = status?.conditions ?? [];
  const finalConditions = conditions.map(item => ({
    ...item,
    statusForShow:
      item.type === 'ScalingLimited'
        ? item.status === 'Unknown'
          ? item.status
          : item.status === 'True'
            ? 'False'
            : 'True'
        : item.status,
  }));
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
        <ToolTipTitle>{t('hpa.common.statusInformation')}</ToolTipTitle>
        {finalConditions.map((item, index) => (
          <TextItem key={index}>
            <TextItemTitle>
              {renderIconItem(item.statusForShow)}
              <span>{t(STATUS_TITLE[item.type])}</span>
            </TextItemTitle>
            <ul>
              <li>{t('hpa.common.typeValue', { value: item.type })}</li>
              <li>{t('hpa.common.statusValue', { value: item.status })}</li>
              <li>{item.reason && t('hpa.common.reasonValue', { value: item.reason })}</li>
              <li>
                {item.message &&
                  t('hpa.common.messageValue', {
                    value: item.message,
                    interpolation: { escapeValue: false },
                  })}
              </li>
            </ul>
          </TextItem>
        ))}
        <Button onClick={onClick} color="primary" style={{ width: '100%' }}>
          {t('hpa.common.viewEvents')}
        </Button>
      </TooltipContent>
    );
  };

  if (ready === 'true') return <StatusDot color="success">{t('hpa.common.normal')}</StatusDot>;
  else if (ready === 'false')
    return (
      <Container>
        <StatusDot color="warning">{t('hpa.common.abnormal')}</StatusDot>
        <Tooltip content={renderToolTip()} maxWidth={300} placement={'right'} interactive>
          <Information />
        </Tooltip>
      </Container>
    );

  return (
    <StatusDotContainer>
      <StatusDot color="success">{t('hpa.common.unKnown')}</StatusDot>
    </StatusDotContainer>
  );
}
