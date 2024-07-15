/*
 * 获取鼠标在canvas上的坐标
 * */
export const windowToCanvas = (
  canvas: HTMLCanvasElement,
  x: number,
  y: number
) => {
  let rect = canvas.getBoundingClientRect();
  return {
    x: x - rect.left * (canvas.width / rect.width),
    y: y - rect.top * (canvas.height / rect.height),
  };
};
