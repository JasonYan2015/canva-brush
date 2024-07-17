import { appProcess } from '@canva/platform';
import React from 'react';
import { useSelection } from 'utils/use_selection_hook';
import { downloadImage, getCanvas } from './utils';
import { getTemporaryUrl, upload } from '@canva/asset';
import CanvasDraw from '../../react-canvas-draw';

export function SelectedImageOverlay() {
  console.log(`🔨 ~~~~~~~~~~~~~~~~~~~~~~ SelectedImageOverlay`);
  const selection = useSelection('image');
  const canvasRef = React.useRef<CanvasDraw | null>();
  const [bgImage, setBgImage] = React.useState('');

  React.useEffect(() => {
    const initializeCanvas = async () => {
      // Get the selected image
      const draft = await selection.read();
      const [image] = draft.contents;

      if (!image) {
        return;
      }

      // Download the selected image
      const { url } = await getTemporaryUrl({ type: 'IMAGE', ref: image.ref });
      // const img = await downloadImage(url);
      // const { width, height } = img;
      console.log(`🚧 || url, img.src`, url);

      // Render the selected image
      // const { canvas, context } = getCanvas(canvasRef.current);
      // canvas.width = width;
      // canvas.height = height;
      // context.drawImage(img, 0, 0, width, height);
      setBgImage(url);

      // Set the `isImageReady` state
      appProcess.broadcastMessage({ isImageReady: true });
    };

    initializeCanvas();
  }, [selection]);

  React.useEffect(() => {
    appProcess.registerOnMessage((sender, message) => {
      // Invert the colors of the image
      if (message === 'invert') {
        // const { canvas, context } = getCanvas(canvasRef.current);
        // const { width, height } = canvas;
        // context.filter = 'invert(100%)';
        // context.drawImage(canvas, 0, 0, width, height);
        console.log(`🚧 || registerOnMessage invert`, message);
      }
    });
  }, []);

  React.useEffect(() => {
    return void appProcess.current.setOnDispose(async context => {
      // Save changes to the user's image
      if (context.reason === 'completed') {
        // Get the data URL of the image
        const dataUrl = canvasRef.current?.getDataURL();

        // Upload the new image
        const asset = await upload({
          type: 'IMAGE',
          mimeType: 'image/png',
          url: dataUrl,
          thumbnailUrl: dataUrl,
        });

        // Replace the original image with the new image
        const draft = await selection.read();
        draft.contents[0].ref = asset.ref;
        await draft.save();

        console.log(`🚧 || setOnDispose context`, context);
        // 拿到结果 绘制
      }

      // Reset the `isImageReady` state
      appProcess.broadcastMessage({ isImageReady: false });
    });
  }, [selection]);
  console.log(`🚧 || bgImage`, bgImage);

  const handleChange = (...params) => {
    console.log(`🚧 || handleChange params`, params);
  };

  return (
    <CanvasDraw
      onChange={handleChange}
      immediateLoading={!bgImage}
      ref={canvasDraw => {
        canvasRef.current = canvasDraw;
      }}
      hideGrid
      imgSrc={bgImage}
      backgroundColor='rgba(255,255,255,0.5)'
    />
  );
}
