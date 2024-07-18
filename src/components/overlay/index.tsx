import { useEffect, useRef, useState } from 'react';
import type { LaunchParams } from '../../app';
// import { upload } from '@canva/asset';
import { useSelection } from 'utils/use_selection_hook';
import type { AppProcessInfo, CloseParams } from '@canva/platform';
import { appProcess } from '@canva/platform';
import { abort, loadOriginalImage } from '../../utils';
import { usePointDraw } from '../../hooks/drawDrush';
import styles from './index.css';
import { useInitMessage } from 'src/hooks/initBroadcast';

// App can extend CloseParams type to send extra data when closing the overlay
// For example:
// type CloseOpts = CloseParams & { message: string }
export type CloseOpts = CloseParams;

type OverlayProps = {
  context: AppProcessInfo<LaunchParams>;
};

type UIState = {
  brushSize: number;
};

export const Overlay = (props: OverlayProps) => {
  const { context: appContext } = props;
  const selection = useSelection('image');

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const uiStateRef = useRef<UIState>({
    brushSize: 7,
  });

  const [cssScale, setCssScale] = useState(1);

  useEffect(() => {
    if (!selection || selection.count !== 1) {
      return;
    }

    if (
      !appContext.launchParams ||
      appContext.surface !== 'selected_image_overlay'
    ) {
      return void abort();
    }

    // set initial ui state
    const uiState = appContext.launchParams;
    uiStateRef.current = uiState;

    // set up canvas
    const canvas = canvasRef.current;
    if (!canvas) {
      console.log(`🔨 ~~~~~~~~~~~~~~~~~~~~~~ abort: canvas not exist`);
      return void abort();
    }
    const context = canvas.getContext('2d');
    if (!context) {
      console.log(`🔨 ~~~~~~~~~~~~~~~~~~~~~~ abort: context not exist`);
      return void abort();
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;

    // load and draw image to canvas
    const img = new Image();
    const initCanvasSize = () => {
      // Set the canvas dimensions to match the original image dimensions to maintain image quality,
      // when saving the output image back to the design using canvas.toDataUrl()
      const cssScale = window.innerWidth / img.width;
      setCssScale(cssScale);

      canvas.width = img.width;
      canvas.height = img.height;
      canvas.style.transform = `scale(${cssScale})`;
      canvas.style.transformOrigin = '0 0';
      // context.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.onload = initCanvasSize;
    img.crossOrigin = 'anonymous';
    (async () => {
      const selectedImageUrl = await loadOriginalImage(selection);
      if (!selectedImageUrl) {
        console.log(
          `🔨 ~~~~~~~~~~~~~~~~~~~~~~ abort: async fn selectedImageUrl not exist`
        );
        return void abort();
      }
      img.src = selectedImageUrl;
    })();

    window.addEventListener('resize', () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
      if (img.complete) {
        initCanvasSize();
      }
    });

    return void appProcess.current.setOnDispose<CloseOpts>(
      async ({ reason }) => {
        // abort if image has not loaded or receive `aborted` signal
        if (reason === 'aborted' || !img.src || !img.complete) {
          return;
        }
        const dataUrl = canvas.toDataURL();
        console.log(`🚧 || effect unmount dataUrl:`, dataUrl);

        const draft = await selection.read();
        // const queueImage = await upload({
        //   type: 'IMAGE',
        //   mimeType: 'image/png',
        //   url: dataUrl,
        //   thumbnailUrl: dataUrl,
        //   width: canvas.width,
        //   height: canvas.height,
        // });
        // draft.contents[0].ref = queueImage.ref;
        await draft.save();
      }
    );
  }, [selection]);

  usePointDraw(canvasRef.current, uiStateRef.current, cssScale);

  useInitMessage(canvasRef);

  // 初始化设置背景图
  const [bgImg, setBgImg] = useState('');
  useEffect(() => {
    (async () => {
      const selectedImageUrl = await loadOriginalImage(selection);
      selectedImageUrl && setBgImg(selectedImageUrl);
    })();
  }, [selection]);

  useEffect(() => {
    // set up message handler
    return void appProcess.registerOnMessage((_, message) => {
      if (!message) {
        return;
      }
      const { brushSize } = message as UIState;
      uiStateRef.current = {
        ...uiStateRef.current,
        brushSize,
      };
    });
  }, []);

  return (
    <>
      <img
        className={styles.bgImage}
        src={bgImg}
        style={{
          width: canvasRef.current?.width,
          height: canvasRef.current?.height,
        }}
      />
      <canvas ref={canvasRef} />
    </>
  );
};
