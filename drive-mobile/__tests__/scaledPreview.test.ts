import { computeScaledDimensions } from '../src/components/ui/ScaledPreview';
import { EXPORT_FORMATS, getExportDimensions } from '../src/utils/exportFormat';

// This is the mathematical guarantee behind the WYSIWYG rendering
// architecture: for every export format, the on-screen preview must be
// *exactly* proportional to the true capture dimensions - same aspect
// ratio, single scale factor applied uniformly to both axes. If this ever
// stops holding, the preview and the exported artwork can visually diverge.
describe('ScaledPreview scale math (WYSIWYG guarantee)', () => {
  it('scales width and height by the same factor', () => {
    const { scale, displayHeight } = computeScaledDimensions(1080, 1920, 360);
    expect(scale).toBeCloseTo(360 / 1080);
    expect(displayHeight).toBeCloseTo(1920 * scale);
  });

  it('preserves the exact capture aspect ratio for every export format at any display width', () => {
    for (const format of EXPORT_FORMATS) {
      const capture = getExportDimensions(format.ratio);
      const captureAspect = capture.width / capture.height;

      for (const displayWidth of [200, 360, 430]) {
        const { displayHeight } = computeScaledDimensions(capture.width, capture.height, displayWidth);
        const displayAspect = displayWidth / displayHeight;
        expect(displayAspect).toBeCloseTo(captureAspect, 5);
      }
    }
  });

  it('scale of 1 leaves dimensions unchanged (the export capture case)', () => {
    const capture = getExportDimensions(9 / 16);
    const { scale, displayHeight } = computeScaledDimensions(capture.width, capture.height, capture.width);
    expect(scale).toBe(1);
    expect(displayHeight).toBe(capture.height);
  });
});
