import { Rows, FormField, Button, Slider, Title } from '@canva/app-ui-kit';
import { useState } from 'react';
import { appProcess } from '@canva/platform';
import { useOverlay } from 'utils/use_overlay_hook';
import type { LaunchParams } from '../../app';
import type { CloseOpts } from '../overlay';
import styles from 'styles/components.css';
import { UploadLocalImage } from './uploadImage';

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
    appProcess.broadcastMessage('save');
    // closeOverlay({ reason: 'completed' });
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
            <Title size='small'>Open Overlay</Title>
            <Button
              variant='primary'
              onClick={openOverlay}
              disabled={!canOpen}
              stretch
            >
              {canOpen ? 'Open Overlay' : 'Focus on a image to start'}
            </Button>

            <UploadLocalImage />
          </Rows>
        </>
      )}
    </div>
  );
};
