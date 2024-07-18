import { getTemporaryUrl } from '@canva/asset';
import { SelectionEvent } from '@canva/design';
import { appProcess } from '@canva/platform';

export const abort = () =>
  appProcess.current.requestClose({ reason: 'aborted' });

export const loadOriginalImage = async (selection: SelectionEvent<'image'>) => {
  if (selection.count !== 1) {
    return;
  }
  const draft = await selection.read();
  const { url } = await getTemporaryUrl({
    type: 'IMAGE',
    ref: draft.contents[0].ref,
  });

  return url;
};

// get the mouse position relative to the canvas
export const getCanvasMousePosition = (
  canvas: HTMLCanvasElement,
  event: PointerEvent
) => {
  const rect = canvas.getBoundingClientRect();
  const scaleX = canvas.width / rect.width;
  const scaleY = canvas.height / rect.height;
  return {
    x: (event.clientX - rect.left) * scaleX,
    y: (event.clientY - rect.top) * scaleY,
  };
};
