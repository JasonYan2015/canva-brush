import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useEffect } from 'react';

// 注册事件
export function useInitMessage(canvasRef) {
  useEffect(() => {
    const canvas = canvasRef.current;

    appProcess.registerOnMessage(async (sender, message) => {
      if (message === 'save' && canvas) {
        const dataUrl = canvas.toDataURL();

        const queueImage = await upload({
          type: 'IMAGE',
          mimeType: 'image/png',
          url: dataUrl,
          thumbnailUrl: dataUrl,
          width: canvas.width,
          height: canvas.height,
        });
        // 等 canva 后台上传完成，后面才能消费
        await queueImage.whenUploaded();

        const { url } = await getTemporaryUrl({
          type: 'IMAGE',
          ref: queueImage.ref,
        });
        console.log(`🚧 || 蒙层 url`, url);
      }
    });
  }, []);
}
