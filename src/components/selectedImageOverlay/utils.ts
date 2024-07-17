export async function downloadImage(url: string) {
  const response = await fetch(url, { mode: 'cors' });
  const blob = await response.blob();
  const objectUrl = URL.createObjectURL(blob);

  const img = new Image();
  img.crossOrigin = 'anonymous';

  await new Promise((resolve, reject) => {
    img.onload = resolve;
    img.onerror = () => reject(new Error('Image could not be loaded'));
    img.src = objectUrl;
  });

  URL.revokeObjectURL(objectUrl);

  return img;
}

export function getCanvas(canvas: HTMLCanvasElement | null) {
  if (!canvas) {
    throw new Error('HTMLCanvasElement does not exist');
  }

  const context = canvas.getContext('2d');

  if (!context) {
    throw new Error('CanvasRenderingContext2D does not exist');
  }

  return { canvas, context };
}
