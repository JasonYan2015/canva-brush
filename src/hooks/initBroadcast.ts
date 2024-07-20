import { getTemporaryUrl, upload } from '@canva/asset';
import { appProcess } from '@canva/platform';
import { useEffect } from 'react';
import { UIState } from 'src/components/overlay';

// 注册事件
export function useInitMessage(canvasRef, uiStateRef, originImage) {
  const handleSave = async canvas => {
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
    console.log(`🚧 || 蒙层 url`, maskImageUrl);

    appProcess.broadcastMessage({
      type: 'meshReady',
      originImage,
      maskImage: maskImageUrl,
    });
  };

  useEffect(() => {
    const canvas = canvasRef.current;

    appProcess.registerOnMessage(async (sender, message) => {
      if (!message) {
        return;
      }

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
    });
  }, []);
}
