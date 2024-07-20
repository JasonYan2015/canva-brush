import { Button, ImageCard, Title } from '@canva/app-ui-kit';
import React from 'react';

interface IOpenOverlay {
  openOverlay: () => void;
  canOpen: boolean;
  overlayImage: string | undefined;
  removeOverlayImage: () => void;
}
export const OpenOverlay: React.FC<IOpenOverlay> = ({
  openOverlay,
  canOpen,
  overlayImage,
  removeOverlayImage,
}) => {
  const handleClick = () => {
    removeOverlayImage();
  };

  return (
    <>
      <Title size='small'>Open Overlay</Title>
      <Button
        variant='secondary'
        onClick={openOverlay}
        disabled={!canOpen}
        stretch
      >
        {!overlayImage ? 'Open Overlay' : 'Reopen Overlay'}
      </Button>

      {overlayImage && (
        <ImageCard
          ariaLabel='overlay image'
          thumbnailUrl={overlayImage}
          onClick={handleClick}
        />
      )}
    </>
  );
};
