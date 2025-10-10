import React from 'react';
import { Icon } from '@ks-console/shared';
import { Button, Tooltip, StatusDot } from '@kubed/components';
import { Information } from '@kubed/icons';
import { TextItem, TextItemTitle, Container, TooltipContent, ToolTipTitle } from './styles';
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
  onClick?: () => void;
}

export function HpaStatus({ status, onClick }: HpaStatusProps) {
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
  const isSuccess = finalConditions.every(item => item.statusForShow === 'True');
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
              <span>{STATUS_TITLE[item.type]}</span>
            </TextItemTitle>
            <ul>
              <li>{t('STATUS_VALUE', { value: item.status })}</li>
              <li>{item.reason && t('REASON_VALUE', { value: item.reason })}</li>
              <li>{item.message && t('MESSAGE_VALUE', { value: item.message })}</li>
            </ul>
          </TextItem>
        ))}
        <Button onClick={onClick} color="primary" style={{ width: '100%' }}>
          {t('hpa.common.viewEvents')}
        </Button>
      </TooltipContent>
    );
  };

  return (
    <>
      {isSuccess ? (
        <StatusDot color="success">{t('hpa.common.normal')}</StatusDot>
      ) : (
        <Container>
          <StatusDot color="warning">{t('hpa.common.abnormal')}</StatusDot>
          <Tooltip content={renderToolTip()} maxWidth={300} placement={'right'} interactive>
            <Information />
          </Tooltip>
        </Container>
      )}
    </>
  );
}
