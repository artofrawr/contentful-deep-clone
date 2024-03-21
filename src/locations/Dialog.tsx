import React, { useEffect, useState } from 'react';
import { Box, Button, FormControl, Heading, Spinner, TextInput, Textarea } from '@contentful/f36-components';
import { DialogAppSDK } from '@contentful/app-sdk';
import { useCMA, useSDK } from '@contentful/react-apps-toolkit';
import useDeepclone from '../utils/useDeepclone';

const Dialog = () => {
  const sdk = useSDK<DialogAppSDK>();
  const cma = useCMA();
  const [entryId, setEntryId] = useState('')
  const { isCloning, clone, logs } = useDeepclone(sdk, cma, entryId)

  const [remove, setRemove] = useState('')
  const [replace, setReplace] = useState('')
  const [prefix, setPrefix] = useState('')

  useEffect(() => {
    const { entryId: entryIdParam } = sdk.parameters.invocation as { entryId: string};
    setEntryId(entryIdParam)
  }, [sdk.parameters.invocation]);


  useEffect(() => {
    sdk.window.startAutoResizer();
  }, [sdk.window]);

  return (
    <>
    {isCloning && (
      <Box style={{ padding: '20px' }}>
        <FormControl>
          <FormControl.Label>Logs</FormControl.Label>
          <Textarea value={logs} rows={8} isReadOnly />
        </FormControl>
        <Box display="flex" style={{ justifyContent: "flex-end"}}>
          <Spinner variant="default" />
        </Box>
      </Box>
    )}
    {!isCloning && (
      <Box style={{ padding: '20px' }}>
        <Heading>Titles</Heading>
        <Box display='flex' style={{ gap: '15px'}}>
          <FormControl>
            <FormControl.Label>Remove</FormControl.Label>
            <TextInput
                value={remove}
                type="text"
                onChange={(e) => setRemove(e.target.value)}
              />
          </FormControl>
          <FormControl>
            <FormControl.Label>Replace With</FormControl.Label>
            <TextInput
              value={replace}
              type="text"
              onChange={(e) => setReplace(e.target.value)}
            />
          </FormControl>
          <FormControl>
            <FormControl.Label>Prefix</FormControl.Label>
            <TextInput
              value={prefix}
              type="text"
              onChange={(e) => setPrefix(e.target.value)}
            />
          </FormControl>
        </Box>
        <Box display='flex' style={{ justifyContent: 'flex-end'}}>
          <Button 
            variant="primary" 
            onClick={() => clone({ remove, replace, prefix })}
          >
            CLONE
          </Button>
        </Box>
      </Box>
    )}
    </>
  )
};

export default Dialog;
