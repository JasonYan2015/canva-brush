import React from 'react';
import { useOverlay } from 'utils/use_overlay_hook';
import { appProcess } from '@canva/platform';
import { Button, Rows } from '@canva/app-ui-kit';
import styles from 'styles/components.css';

export function ObjectPanel() {
  const overlay = useOverlay('image_selection');
  const [isImageReady, setIsImageReady] = React.useState(false);

  React.useEffect(() => {
    // Listen for when the image has been rendered
    appProcess.registerOnMessage((sender, message) => {
      const isImageReady = Boolean(message.isImageReady);
      setIsImageReady(isImageReady);
    });
  }, []);

  function handleOpen() {
    overlay.open();
  }

  function handleInvert() {
    appProcess.broadcastMessage('invert');
  }

  function handleSave() {
    overlay.close({ reason: 'completed' });
  }

  function handleClose() {
    overlay.close({ reason: 'aborted' });
  }

  if (overlay.isOpen) {
    return (
      <div className={styles.scrollContainer}>
        <Rows spacing='2u'>
          <Rows spacing='1u'>
            <Button
              variant='primary'
              disabled={!isImageReady}
              onClick={handleInvert}
            >
              Invert
            </Button>
          </Rows>
          <Rows spacing='1u'>
            <Button
              variant='primary'
              disabled={!isImageReady}
              onClick={handleSave}
            >
              Save and close
            </Button>
            <Button
              variant='secondary'
              disabled={!isImageReady}
              onClick={handleClose}
            >
              Close without saving
            </Button>
          </Rows>
        </Rows>
      </div>
    );
  }

  return (
    <div className={styles.scrollContainer}>
      <Rows spacing='1u'>
        <Button
          variant='primary'
          disabled={!overlay.canOpen}
          onClick={handleOpen}
        >
          Edit image
        </Button>
      </Rows>
    </div>
  );
}
