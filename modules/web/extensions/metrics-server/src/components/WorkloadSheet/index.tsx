import { BasePathParams, ConfigConstants, workloadStore } from '@ks-console/shared';
import { Sheet as SheetPrimitive, Alert } from '@kubed/components';
import { Warning2Duotone } from '@kubed/icons';
import { get } from 'lodash';
import * as React from 'react';
import { Content, Overlay, SheetContentChildrenWrapper, AlertContent } from './styles';
import Layout from './Layout';
import { HpaTable } from './HpaTable';

const { Sheet, SheetContent, SheetHeader, SheetFieldTitle, SheetHeaderClose } = SheetPrimitive;

const { SIDER_COLLAPSED } = ConfigConstants;

interface HpaModalProps extends React.ComponentProps<typeof SheetPrimitive.Sheet> {
  params: BasePathParams;
  detail: any;
  module: 'deployments' | 'statefulsets';
}

export const HpaModal = (props: HpaModalProps) => {
  const { open, onOpenChange, params, detail, module } = props;

  const store = workloadStore(module);

  const siderCollapsed = localStorage.getItem(SIDER_COLLAPSED);
  const width = siderCollapsed === 'true' ? 'calc( 100vw - 60px )' : 'calc( 100vw - 220px )';

  const avoidDefaultDomBehavior = (e: Event) => {
    e.preventDefault();
  };

  const close = (state: boolean) => {
    onOpenChange?.(state);
  };
  return (
    <Layout>
      <>
        <Sheet open={open} onOpenChange={close} modal={false}>
          <SheetHeaderClose asChild>
            <Overlay open={open} />
          </SheetHeaderClose>
          <SheetContent
            width={width}
            side={'right'}
            hasOverlay={false}
            onPointerDownOutside={avoidDefaultDomBehavior}
            onInteractOutside={avoidDefaultDomBehavior}
            // tabIndex={undefined} // To fix the issue that the input in the modal cannot get focus when the sheet is open
          >
            <SheetContentChildrenWrapper>
              <SheetHeader>
                <SheetFieldTitle title={t('hpa.title')} />
              </SheetHeader>
              <Content>
                <Alert showIcon={false} type="info" style={{ marginBottom: 16 }}>
                  <AlertContent>
                    <Warning2Duotone variant="light" type="light" />
                    {t('hpa.description')}
                  </AlertContent>
                </Alert>
                <HpaTable
                  module={module}
                  workloadStore={store}
                  detail={detail}
                  {...params}
                  kind={get(detail, '_originData.kind')}
                />
              </Content>
            </SheetContentChildrenWrapper>
          </SheetContent>
        </Sheet>
      </>
    </Layout>
  );
};
