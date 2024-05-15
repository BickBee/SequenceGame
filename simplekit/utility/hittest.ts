import { distance, closestPoint, Point2 } from ".";

export function hitTestRectangle(
  mx: number,
  my: number,
  x: number,
  y: number,
  w: number,
  h: number,
  isFilled: boolean = true,
  isStroked: boolean = false,
  strokeWidth: number = 1
) {
  if (isFilled) {
    if (mx >= x && mx <= x + w && my >= y && my <= y + h) return true;
  }
  if (isStroked) {
    // width of stroke on either side of edges
    const s = strokeWidth / 2;
    // inside rect after adding stroke
    const outer =
      mx >= x - s && mx <= x + w + s && my >= y - s && my <= y + h + s;
    // but NOT inside inner rect after subtracting stroke
    const inner =
      mx >= x + s && mx <= x + w - s && my >= y + s && my <= y + h - s;
    if (outer && !inner) return true;
  }
  return false;
}

export function hitTestPolygon(
  mx: number,
  my: number,
  points: Point2[],
  isFilled: boolean = true,
  isStroked: boolean = false,
  strokeWidth: number = 1
) {
  if (isStroked) {
    const m = new Point2(mx, my);
    // assume shape is closed, so start with segment
    // from last point to first point
    let p0 = points.slice(-1)[0];
    for (let p1 of points) {
      const q = closestPoint(m, p0, p1);
      const d = distance(m.x, m.y, q.x, q.y);
      if (d < strokeWidth / 2) return true;
      p0 = p1;
    }
  }
  return false;
}
