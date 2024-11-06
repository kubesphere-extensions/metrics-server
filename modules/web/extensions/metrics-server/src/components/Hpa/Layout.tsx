import { ModalProvider } from '@ks-console/shared';
import * as React from 'react';

interface LayoutProps {
  children: React.ReactElement;
}

export default function Layout(props: LayoutProps) {
  const { children } = props;
  return (
    <>
      <ModalProvider>{children}</ModalProvider>
    </>
  );
}
