import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useEffect, useRef } from 'react';
import type { UIState } from 'src/components/overlay';

// 注册事件
export function useInitMessage(canvasRef, uiStateRef, originImage) {
  const originImageRef = useRef(originImage);

  const handleSave = async canvas => {
    if (!canvas) return;

    const dataUrl = canvas.toDataURL();
    const maskImage = await upload({
      type: 'IMAGE',
      mimeType: 'image/png',
      url: dataUrl,
      thumbnailUrl: dataUrl,
      width: canvas.width,
      height: canvas.height,
    });
    // 等 canva 后台上传完成，才能 getTemporaryUrl
    await maskImage.whenUploaded();
    const { url: maskImageUrl } = await getTemporaryUrl({
      type: 'IMAGE',
      ref: maskImage.ref,
    });

    appProcess.broadcastMessage({
      type: 'meshReady',
      originImage: originImageRef.current,
      maskImage: maskImageUrl,
    });
  };

  useEffect(
    () => {
      originImageRef.current = originImage;

      appProcess.registerOnMessage(async (sender, message) => {
        if (!message) {
          return;
        }

        // TODO: 时间比较久，搞一个 全局 loading
        if (message.type === 'save') {
          await handleSave(canvasRef.current);
          return;
        }

        // TODO: 修改笔刷的表单设置一个 message
        const { brushSize } = message as UIState;
        uiStateRef.current = {
          ...uiStateRef.current,
          brushSize,
        };
      });
    },
    // 看看会不会重复注册 message 会不会有问题
    // 需要更新 originImage
    [originImage]
  );
}
