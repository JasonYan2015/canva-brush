import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useEffect } from 'react';
import { useSelection } from 'utils/use_selection_hook';
// import { CloseOpts } from 'src/components/overlay';
// import { useOverlay } from 'utils/use_overlay_hook';

// 注册事件
export function useInitMessage(canvasRef) {
  const selection = useSelection('image');

  // const { close: closeOverlay } = useOverlay<'image_selection', CloseOpts>(
  //   'image_selection'
  // );

  useEffect(() => {
    const canvas = canvasRef.current;

    appProcess.registerOnMessage(async (sender, message) => {
      console.log(`🚧 || registerOnMessage`, message, canvas);
      // Invert the colors of the image
      if (message === 'save' && canvas) {
        // const { canvas, context } = getCanvas(canvasRef.current);
        // const { width, height } = canvas;
        // context.filter = 'invert(100%)';
        // context.drawImage(canvas, 0, 0, width, height);

        const dataUrl = canvas.toDataURL();
        console.log(`🚧 || dataUrl:`, dataUrl);

        const queueImage = await upload({
          type: 'IMAGE',
          mimeType: 'image/png',
          url: dataUrl,
          thumbnailUrl: dataUrl,
          width: canvas.width,
          height: canvas.height,
        });
        try {
          const { url, ref, type } = await getTemporaryUrl({
            type: 'IMAGE',
            ref: queueImage.ref,
          });
          console.log(`🚧 || url, ref, type`, url, ref, type);

          const draft = await selection.read();
          // draft.contents[0].ref = queueImage.ref;
          // await draft.save();
          console.log(`🚧 || draft`, draft);
        } catch (error) {
          console.error(`❌ || getTemporaryUrl error`, error);
        }

        // closeOverlay({ reason: 'completed' });
      }
    });
  }, []);
}
