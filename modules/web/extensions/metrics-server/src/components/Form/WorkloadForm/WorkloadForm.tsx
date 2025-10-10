import React, { useState, useRef } from 'react';
import {
  Return,
  Backup,
  Warning2Duotone,
  Loading2Duotone,
  Refresh,
  CheckDuotone,
  CloseDuotone,
} from '@kubed/icons';
import {
  RadioBox,
  RadioItem,
  RadioItemContent,
  RadioItemContentName,
  Tips,
  LoadMore,
  LoadingContainer,
  ListHeader,
  FormHeader,
  BackButton,
  FormWrapper,
  FormContent,
  FormFooter,
  FormFooterItem,
} from './styles';
import { useHpaContext } from '../../../contexts/HpaContext';
import { useWorkloadList } from '../../../data/useWorkloadList';
import { WorkloadStatus } from '../../WorkloadStatus/WorkloadStatus';
import { useIntersection } from 'react-use';
import { FilterInput, Button, Navs } from '@kubed/components';
import { get } from 'lodash';

const WorkloadForm = ({
  onBack,
  onOk,
  onCancel,
}: {
  onBack: () => void;
  onOk: (item?: any) => void;
  onCancel: () => void;
}) => {
  const { extraParams, selectWorkload, updateSelectWorkload, updateHpaData } = useHpaContext();
  const [hasError, setHasError] = useState(false);
  const [value, setValue] = React.useState('deployments');
  const loadMoreRef = useRef<HTMLDivElement>(null);
  const [name, setName] = useState('');

  const options = [
    { label: t('hpa.common.deployment'), value: 'deployments' },
    { label: t('hpa.common.statefulSet'), value: 'statefulsets' },
  ];

  const { data, isFetching, isFetchingNextPage, fetchNextPage, hasNextPage, refetch } =
    useWorkloadList({
      cluster: extraParams.cluster,
      namespace: extraParams.namespace,
      module: value as 'deployments' | 'statefulsets',
      query: {
        sortBy: 'updateTime',
        limit: 10,
        name,
      },
    });

  const [selectedItem, setSelectedItem] = useState<any>(selectWorkload);

  const intersection = useIntersection(loadMoreRef, {
    root: null,
    rootMargin: '20px',
    threshold: 1.0,
  });

  React.useEffect(() => {
    if (intersection?.isIntersecting && hasNextPage && !isFetchingNextPage) {
      fetchNextPage();
    }
  }, [intersection, hasNextPage, isFetchingNextPage, fetchNextPage]);

  const getKey = (item: any) => {
    if (!item) return '';
    return `${item.name}-${item.namespace}-${item.kind}`;
  };
  return (
    <FormWrapper>
      <FormHeader>
        <BackButton
          onClick={() => {
            onBack?.();
            setSelectedItem(null);
          }}
        >
          <Return size={20}></Return>
        </BackButton>
        <span>{t('hpa.scaleTarget.create.title')}</span>
      </FormHeader>
      <FormContent>
        <ListHeader>
          <Navs
            data={options}
            onChange={value => {
              setValue(value);
              setSelectedItem(null);
              setName('');
            }}
          ></Navs>
          <FilterInput
            initialKeyword={name}
            simpleMode
            onChange={val => {
              setName(val);
            }}
          ></FilterInput>
          <Button variant="text" onClick={() => refetch()}>
            <Refresh size={20}></Refresh>
          </Button>
        </ListHeader>
        <Tips>
          <Warning2Duotone color="#c7deef" fill="#326e93" />
          <span>{t('hpa.scaleTarget.create.info')}</span>
        </Tips>
        <div style={{ height: '328px', overflowY: 'auto' }}>
          {data?.list.map(item => {
            const hasHpa =
              get(item, 'labels["hpa.autoscaling.kubeshpere.io/managed"]', 'false') === 'true';
            const hasCustomScaling =
              get(item, 'labels["keda.autoscaling.kubeshpere.io/managed"]', 'false') === 'true';
            const haVpa =
              get(item, 'labels["vpa.autoscaling.kubeshpere.io/managed"]', 'false') === 'true';
            return (
              <RadioItem
                disabled={hasHpa || hasCustomScaling || haVpa}
                checked={getKey(selectedItem) === getKey(item)}
                key={item.name}
                onClick={() => {
                  if (hasHpa || hasCustomScaling || haVpa) {
                    return;
                  }
                  setSelectedItem(item);
                }}
              >
                <RadioBox></RadioBox>
                <Backup size={40} />
                <RadioItemContent>
                  <RadioItemContentName>{item.name}</RadioItemContentName>
                  <WorkloadStatus workloadItem={item} module={value} />
                  <span>{item.updateTime}</span>
                  <span>{t('hpa.common.status')}</span>
                </RadioItemContent>
              </RadioItem>
            );
          })}

          {hasNextPage && (
            <LoadMore ref={loadMoreRef}>
              {isFetchingNextPage ? (
                <LoadingContainer>
                  <Loading2Duotone size={20} />
                  <span style={{ marginLeft: 8 }}>{t('hpa.common.loading')}</span>
                </LoadingContainer>
              ) : (
                <span>{t('hpa.common.loadMore')}</span>
              )}
            </LoadMore>
          )}

          {isFetching && !isFetchingNextPage && (
            <LoadingContainer>
              <Loading2Duotone size={20} />
              <span style={{ marginLeft: 8 }}>{t('hpa.common.loading')}</span>
            </LoadingContainer>
          )}
        </div>
      </FormContent>
      <FormFooter>
        <FormFooterItem>
          <CloseDuotone size={16} color="#fff" onClick={onCancel}></CloseDuotone>
        </FormFooterItem>
        <FormFooterItem
          onClick={() => {
            if (!selectedItem) {
              setHasError(true);
              return;
            }
            updateHpaData({
              metadata: {
                ownerReferences: [
                  {
                    apiVersion: 'apps/v1',
                    blockOwnerDeletion: true,
                    controller: true,
                    kind: selectedItem.kind,
                    name: selectedItem.name,
                    uid: selectedItem.uid,
                  },
                ],
              },
              spec: {
                scaleTargetRef: {
                  name: selectedItem.name,
                  kind: selectedItem.kind,
                },
              },
            });
            updateSelectWorkload(selectedItem);
            onOk?.();
          }}
        >
          <CheckDuotone size={16} color="#fff"></CheckDuotone>
        </FormFooterItem>
      </FormFooter>
      {hasError ? (
        <div style={{ position: 'absolute', bottom: -20, color: '#bd3633' }}>
          {t('hpa.validation.scaleTarget.required')}
        </div>
      ) : null}
    </FormWrapper>
  );
};

export { WorkloadForm };
