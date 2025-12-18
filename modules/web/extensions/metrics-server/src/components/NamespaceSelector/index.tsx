/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

import React, { useCallback, CSSProperties, useState } from 'react';
import { debounce } from 'lodash';
import { Select, Tooltip } from '@kubed/components';
import { Icon } from '@ks-console/shared';
import { useNamespaceList } from '../../data/useNamespaceList';
import { Question } from '@kubed/icons';

import { ItemIcon } from './styles';

interface Params {
  cluster: string;
  workspace?: string;
  value?: string;
  onChange?: (name: string) => void;
  onNamespaceChange?: (name: string) => void;
  style?: CSSProperties;
}

const NamespaceSelector = ({
  cluster,
  workspace,
  onChange,
  onNamespaceChange,
  style,
  value,
}: Params) => {
  const [search, setSearch] = useState('');
  const onSearch = debounce((val: string) => setSearch(val), 500);
  const {
    data: projectList,
    isLoading: projectLoading,
    fetchNextPage,
    hasNextPage,
  } = useNamespaceList(
    {
      workspace,
      cluster,
      name: search,
      labelSelector: '!kubesphere.io/kubefed-host-namespace,!kubesphere.io/devopsproject',
    },
    {
      enabled: !!cluster,
    },
  );
  const onUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage) {
      return;
    }
    //@ts-ignore
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    const threshold = 5;
    if (scrollTop + clientHeight >= scrollHeight - threshold) {
      fetchNextPage();
    }
  };

  const handleProjectChange = useCallback(
    (namespace: string) => {
      onChange?.(namespace);
      onNamespaceChange?.(namespace);
    },
    [onChange, onNamespaceChange],
  );

  const Option = Select.Option;
  return (
    <Select
      allowClear
      virtual={false}
      loading={projectLoading}
      onChange={handleProjectChange}
      onPopupScroll={onUserScroll}
      onSearch={onSearch}
      showSearch
      style={style}
      value={value}
    >
      {projectList?.map(item => (
        <Option disabled={item.isFedManaged} value={item!.name} key={item!.uid}>
          <ItemIcon disabled={item.isFedManaged}>
            {item.isFedManaged ? (
              <>
                <div style={{ display: 'flex', alignItems: 'center' }}>
                  <img src="/assets/cluster.svg" />
                  <span>{item.name}</span>
                </div>
                <Tooltip content={t('hpa.disabled.fedManagedSelectTooltip')}>
                  <Question />
                </Tooltip>
              </>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center' }}>
                <Icon name="project" size={16} />
                <span>{item!.name}</span>
              </div>
            )}
          </ItemIcon>
        </Option>
      ))}
    </Select>
  );
};

export { NamespaceSelector };
