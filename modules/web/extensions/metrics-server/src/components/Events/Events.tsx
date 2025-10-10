import React from 'react';
import { useCacheStore as useStore, Events as EventsComponent } from '@ks-console/shared';
const Events = () => {
  const [detail] = useStore<any>('hpaDetail');
  return <EventsComponent detail={detail} module="hpa"></EventsComponent>;
};

export { Events };
