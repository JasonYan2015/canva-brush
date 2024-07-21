import { Rows, FormField, Button, Slider, Box, Title } from '@canva/app-ui-kit';
import { useEffect, useState } from 'react';
import { appProcess } from '@canva/platform';
import { useOverlay } from 'utils/use_overlay_hook';
import type { LaunchParams } from '../../app';
import type { CloseOpts } from '../overlay';
import styles from './index.css';
import { UploadLocalImage } from './uploadImage';
import { getTemporaryUrl, upload } from '@canva/asset';
import { OpenOverlay } from './openOverlay';
import { getAuthToken } from 'src/utils/auth';

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

    const result = await (
      await fetch('https://fusion-brush-cf.xiongty.workers.dev/api/task', {
        method: 'POST',
        headers: {
          accept: 'application/json',
          'Content-Type': 'application/json',
          Authorization: await getAuthToken(),
        },
        body: JSON.stringify({
          background: overlayImages?.originImage,
          layers: [overlayImages?.maskImage],
          composite: targetImageUrl,
          ref: targetImageUrl,
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
    console.log(`🔨 ~~~~~~~~~~~~~~~~~~~~~~ reset overlay image`);
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
              overlayMaskImage={overlayImages?.maskImage}
              removeOverlayImage={resetOverlayImage}
            />
          </Rows>
        </>
      )}

      {!isOpen && (
        <Box paddingTop='4u'>
          <Title size='small' alignment='center'>
            👇 Submit to Generate 👇
          </Title>
          <Button
            variant='primary'
            onClick={handleSubmit}
            disabled={!targetMesh}
            stretch
            loading={submitLoading}
          >
            use Fusion Brush!
          </Button>
        </Box>
      )}
    </div>
  );
};
