import React from 'react';
import { CustomAlertModal } from './CustomAlertModal';
import { CustomToast } from './CustomToast';

export function NotificationProvider() {
  return (
    <>
      <CustomAlertModal />
      <CustomToast />
    </>
  );
}
