import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useEffect } from 'react';
import { UIState } from 'src/components/overlay';

// 注册事件
export function useInitMessage(canvasRef, uiStateRef) {
  useEffect(() => {
    const canvas = canvasRef.current;

    appProcess.registerOnMessage(async (sender, message) => {
      if (!message) {
        return;
      }

      // TODO: 修改笔刷的表单设置一个 message
      const { brushSize } = message as UIState;
      uiStateRef.current = {
        ...uiStateRef.current,
        brushSize,
      };

      // TODO: 时间比较久，搞一个 全局 loading
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
