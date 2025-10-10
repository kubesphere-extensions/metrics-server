import React, { useState } from 'react';
import { BasePathParams, projectNewStore } from '@ks-console/shared';
import { useParams } from 'react-router-dom';
import { concat, debounce } from 'lodash';
import { Select } from '@kubed/components';

export const useProjectSelect = () => {
  const { cluster } = useParams<BasePathParams>();
  const [search, setSearch] = useState('');
  const [project, setProject] = useState<string | undefined>('');
  const {
    data: projectList,
    isLoading: projectLoading,
    fetchNextPage,
    hasNextPage,
  } = projectNewStore.useInfiniteQueryList(
    {
      cluster,
      name: search,
      labelSelector: 'kubefed.io/managed!=true, kubesphere.io/kubefed-host-namespace!=true',
    },
    {
      enabled: true,
    },
  );
  const projectOptions = React.useMemo(() => {
    const projectListDefault = (projectList ?? []).map(_project => ({
      label: _project.name,
      value: _project.name,
    }));

    return concat({ label: t('ALL_PROJECTS'), value: '' }, projectListDefault);
  }, [projectList]);
  const onUserScroll = (e: React.UIEvent<HTMLDivElement>) => {
    if (!hasNextPage) {
      return;
    }
    //@ts-ignore
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollTop + clientHeight - scrollHeight >= 0) {
      fetchNextPage();
    }
  };

  const onSearch = debounce((val: string) => setSearch(val), 500);

  const handleChangeProject = (value: string) => {
    setProject(value === undefined ? '' : value);
  };

  const render = () => {
    return (
      <Select
        key={cluster}
        style={{ width: 200 }}
        showSearch
        options={projectOptions}
        onPopupScroll={debounce(onUserScroll, 500)}
        onSearch={onSearch}
        onChange={handleChangeProject}
        loading={projectLoading}
        value={project}
        allowClear={true}
      />
    );
  };
  const params = React.useMemo<{ namespace?: string }>(
    () => ({
      namespace: project,
    }),
    [project],
  );
  const paramsRef = React.useRef<{ namespace?: string }>({
    namespace: project,
  });

  return {
    render,
    params,
    paramsRef,
  };
};
