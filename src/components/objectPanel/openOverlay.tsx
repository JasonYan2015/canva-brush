import { Button, ImageCard, Text } from '@canva/app-ui-kit';
import React from 'react';
import styles from './index.css';

interface IOpenOverlay {
  openOverlay: () => void;
  canOpen: boolean;
  overlayImage: string | undefined;
  overlayMaskImage: string | undefined;
  removeOverlayImage: () => void;
}
export const OpenOverlay: React.FC<IOpenOverlay> = ({
  openOverlay,
  canOpen,
  overlayImage,
  overlayMaskImage,
  removeOverlayImage,
}) => {
  const handleClick = () => {
    removeOverlayImage();
  };

  return (
    <>
      <Text size='small'>2. Open Overlay</Text>
      <Button
        variant='secondary'
        onClick={openOverlay}
        disabled={!canOpen}
        stretch
      >
        {!overlayImage ? 'Open Overlay' : 'Reopen Overlay'}
      </Button>

      {overlayImage && overlayMaskImage && (
        <div className={styles.overlayContainer}>
          <ImageCard
            ariaLabel='overlay image'
            thumbnailUrl={overlayImage}
            onClick={handleClick}
          />
          <ImageCard
            ariaLabel='overlay mask image'
            thumbnailUrl={overlayMaskImage}
            onClick={handleClick}
          />
        </div>
      )}
    </>
  );
};
