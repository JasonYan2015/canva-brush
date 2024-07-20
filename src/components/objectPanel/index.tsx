import { Rows, FormField, Button, Slider, Title, Box } from '@canva/app-ui-kit';
import { useEffect, useState } from 'react';
import { appProcess } from '@canva/platform';
import { useOverlay } from 'utils/use_overlay_hook';
import type { LaunchParams } from '../../app';
import type { CloseOpts } from '../overlay';
import styles from './index.css';
import { UploadLocalImage } from './uploadImage';
import { getTemporaryUrl, upload } from '@canva/asset';
import { OpenOverlay } from './openOverlay';

type UIState = {
  brushSize: number;
};
const initialState: UIState = {
  brushSize: 7,
};

export const ObjectPanel = () => {
  const {
    canOpen,
    isOpen,
    open,
    close: closeOverlay,
  } = useOverlay<'image_selection', CloseOpts>('image_selection');
  const [state, setState] = useState<UIState>(initialState);

  const openOverlay = async () => {
    open({
      launchParameters: {
        brushSize: state.brushSize,
      } satisfies LaunchParams,
    });
  };

  const handleSave = () => {
    // 触发面板图的保存
    appProcess.broadcastMessage({ type: 'save' });
  };

  const [targetMesh, setTargetMesh] = useState('');
  const onTargetUpload = params => {
    const { file } = params;
    setTargetMesh(file);
  };

  const [overlayImages, setOverlayImages] = useState<{
    originImage: string;
    maskImage: string;
  }>();
  useEffect(() => {
    appProcess.registerOnMessage((_, message) => {
      if (message && message.type === 'meshReady') {
        const { type, ...images } = message;
        setOverlayImages(images);

        closeOverlay({ reason: 'aborted' });
      }
    });
  }, [closeOverlay]);

  const [submitLoading, setSubmitLoading] = useState(false);
  const handleSubmit = async () => {
    setSubmitLoading(true);

    const targetImage = await upload({
      type: 'IMAGE',
      mimeType: 'image/png',
      url: targetMesh,
      thumbnailUrl: targetMesh,
      // width: canvas.width,
      // height: canvas.height,
    });
    // 等 canva 后台上传完成，后面才能消费
    await targetImage.whenUploaded();

    const { url: targetImageUrl } = await getTemporaryUrl({
      type: 'IMAGE',
      ref: targetImage.ref,
    });

    console.log(`🚧 || submit`, {
      background: overlayImages?.originImage,
      layers: [overlayImages?.maskImage],
      composite: targetImageUrl,
    });

    const result = await(
      await fetch('https://fusion-brush-cf.xiongty.workers.dev/api/task', {
        method: 'POST', // 指定请求方法为 POST
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          background: overlayImages?.originImage,
          layers: [overlayImages?.maskImage],
          composite: targetImageUrl,
          ref: 'https://lpdoctor-fusion-brush.hf.space/file=/tmp/gradio/81d8c81a9f59895c7300f24657fa3541ae2d3267/001_reference.png',
          step: 50,
          scale: 5,
          seed: -1,
          keep: true,
        }),
      })
    ).json();

    console.log(`🚧 || handleSubmit result`, result);

    setSubmitLoading(false);
  };

  const resetOverlayImage = () => {
    setOverlayImages(undefined);
  };

  return (
    <div className={styles.scrollContainer}>
      {isOpen ? (
        <Rows spacing='2u'>
          <FormField
            label='Brush size'
            value={state.brushSize}
            control={props => (
              <Slider
                {...props}
                defaultValue={initialState.brushSize}
                min={5}
                max={20}
                step={1}
                value={state.brushSize}
                onChange={value =>
                  setState(prevState => {
                    return {
                      ...prevState,
                      brushSize: value,
                    };
                  })
                }
                onChangeComplete={(_, value) =>
                  appProcess.broadcastMessage({
                    ...state,
                    brushSize: value,
                  })
                }
              />
            )}
          />
          <Button variant='primary' onClick={handleSave} stretch>
            Save Overlay
          </Button>
          <Button
            variant='primary'
            onClick={() => closeOverlay({ reason: 'aborted' })}
            stretch
          >
            Cancel Overlay
          </Button>
        </Rows>
      ) : (
        <>
          <Rows spacing='2u'>
            <UploadLocalImage onUpload={onTargetUpload} />

            <OpenOverlay
              canOpen={canOpen}
              openOverlay={openOverlay}
              overlayImage={overlayImages?.originImage}
              removeOverlayImage={resetOverlayImage}
            />
          </Rows>
        </>
      )}

      {!isOpen && (
        <Box paddingTop='4u'>
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!targetMesh}
            stretch
            loading={submitLoading}
          >
            Submit to generate
          </Button>
        </Box>
      )}
    </div>
  );
};
