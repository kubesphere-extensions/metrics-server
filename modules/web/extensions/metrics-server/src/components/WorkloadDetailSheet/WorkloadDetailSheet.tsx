import { BasePathParams, ConfigConstants } from '@ks-console/shared';
import { Sheet as SheetPrimitive } from '@kubed/components';
import * as React from 'react';
import { WorkloadHpaDetail } from './detail';
import { Content, SheetContentChildrenWrapper, Overlay } from './styles';

const { Sheet, SheetContent, SheetHeader, SheetFieldTitle, SheetHeaderClose } = SheetPrimitive;

const { SIDER_COLLAPSED } = ConfigConstants;

interface WorkloadHpaSheetProps extends React.ComponentProps<typeof SheetPrimitive.Sheet> {
  params: BasePathParams;
  detail: Record<string, any>;
  refetch?: () => void;
}

export const WorkloadHpaDetailSheet = (props: WorkloadHpaSheetProps) => {
  const { open, onOpenChange, params = {}, refetch } = props;

  const siderCollapsed = localStorage.getItem(SIDER_COLLAPSED);
  const width = siderCollapsed === 'true' ? 'calc( 100vw - 60px )' : 'calc( 100vw - 220px )';

  const avoidDefaultDomBehavior = (e: Event) => {
    e.preventDefault();
  };

  const close = (state: boolean) => {
    if (state === false) {
      refetch?.();
    }
    onOpenChange?.(state);
  };

  return (
    <>
      <Sheet open={open} onOpenChange={close} modal={false}>
        <SheetHeaderClose asChild>
          <Overlay />
        </SheetHeaderClose>
        <SheetContent
          hasOverlay={false}
          width={width}
          side={'right'}
          onPointerDownOutside={avoidDefaultDomBehavior}
          onInteractOutside={avoidDefaultDomBehavior}
          // tabIndex={undefined} // To fix the issue that the input in the modal cannot get focus when the sheet is open
        >
          <SheetContentChildrenWrapper>
            <SheetHeader>
              <SheetFieldTitle title={t('hpa.title')} />
            </SheetHeader>
            <Content>
              <WorkloadHpaDetail
                params={params}
                backTo={() => {
                  close(false);
                }}
              />
            </Content>
          </SheetContentChildrenWrapper>
        </SheetContent>
      </Sheet>
    </>
  );
};
