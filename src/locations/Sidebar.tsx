import React, { useCallback } from 'react';
import { Button, Paragraph } from '@contentful/f36-components';
import { SidebarAppSDK } from '@contentful/app-sdk';
import { /* useCMA, */ useSDK } from '@contentful/react-apps-toolkit';

const Sidebar = () => {
  const sdk = useSDK<SidebarAppSDK>();

  const onClick = useCallback(() => {
    sdk.dialogs.openCurrentApp({
      title: 'DEEP CLONE ENTRY',
      allowHeightOverflow: true,
      shouldCloseOnOverlayClick: true,
      shouldCloseOnEscapePress: true,
      width: 'medium',
      parameters: {
        entryId: sdk.ids.entry
      },
    });
  }, [sdk])

  return (
    <>
      <Button onClick={onClick} isFullWidth>CREATE DEEP CLONE</Button>
      {/* <Paragraph>AppId: {sdk.ids.app}<br/>EntryID: {sdk.ids.entry}</Paragraph> */}
    </>
  )
};

export default Sidebar;
