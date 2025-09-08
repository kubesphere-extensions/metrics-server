/*
 * Please refer to the LICENSE file in the root directory of the project.
 * https://github.com/kubesphere/console/blob/master/LICENSE
 */

import React, { ReactNode } from 'react';
import { DetailPage as Detail } from '@ks-console/shared';

export interface DetailPageProps {
  tabs?: any[];
  nav?: ReactNode;
  cardProps: any;
  refresh?: boolean;
  className?: string;
  padding?: number;
  replica?: ReactNode;
  detail?: Record<string, any>;
  params?: Record<string, any>;
  activeTab?: string;
  authKey: string;
}

const mapFn = (sideProps: any): any => {
  return {
    ...sideProps,
    title: sideProps.name || '-',
    description: sideProps.desc,
    extra: sideProps.customAttrs,
  };
};

export function DetailPage({
  cardProps = {},
  className,
  tabs,
  nav,
  padding,
  replica,
  detail,
  params,
  activeTab,
  authKey,
}: DetailPageProps) {
  const sideBarProps = mapFn(cardProps);
  const store = React.useMemo(
    () => ({
      useGetMutation: () => ({}),
    }),
    [],
  );
  const data = React.useMemo(() => ({ data: "Don't use this value" }), []);
  return (
    <Detail
      activeTab={activeTab}
      padding={padding}
      sideProps={sideBarProps}
      tabs={tabs}
      nav={nav}
      store={store}
      data={detail ?? data}
      replica={replica}
      authKey={authKey}
      className={className}
      params={params}
    />
  );
}
