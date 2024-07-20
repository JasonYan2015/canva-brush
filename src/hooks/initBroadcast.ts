import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useCallback, useEffect, useRef } from 'react';
import { UIState } from 'src/components/overlay';

// 注册事件
export function useInitMessage(canvasRef, uiStateRef, originImage) {
  console.log(`🚧 || originImage 1`, originImage);

  const handleSave = async canvas => {
    console.log(`🚧 || originImage 3`, originImage);
    /**
     * 1. 蒙层的图
     */
    const dataUrl = canvas.toDataURL();
    const maskImage = await upload({
      type: 'IMAGE',
      mimeType: 'image/png',
      url: dataUrl,
      thumbnailUrl: dataUrl,
      width: canvas.width,
      height: canvas.height,
    });
    // 等 canva 后台上传完成，后面才能消费
    await maskImage.whenUploaded();

    const { url: maskImageUrl } = await getTemporaryUrl({
      type: 'IMAGE',
      ref: maskImage.ref,
    });

    console.log(`🚧 || originImage 2`, originImage);
    appProcess.broadcastMessage({
      type: 'meshReady',
      originImage: originImage,
      maskImage: maskImageUrl,
    });
  };

  const handleListenMessage = async (message, { canvas }) => {
    console.log(`🚧 || overlay listen message`, message);
    if (!message) {
      return;
    }

    console.log(`🚧 || originImage in effect`, originImage);
    // TODO: 时间比较久，搞一个 全局 loading
    if (message.type === 'save' && canvas) {
      await handleSave(canvas);
      return;
    }

    // TODO: 修改笔刷的表单设置一个 message
    const { brushSize } = message as UIState;
    uiStateRef.current = {
      ...uiStateRef.current,
      brushSize,
    };
  };

  useEffect(
    () => {
      const canvas = canvasRef.current;

      appProcess.registerOnMessage(async (sender, message) => {
        handleListenMessage(message, { canvas });
      });
    },
    // 看看会不会重复注册 message 会不会有问题
    // 需要更新 originImage
    [originImage]
  );
}
