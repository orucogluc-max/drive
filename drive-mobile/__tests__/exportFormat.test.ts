import { EXPORT_FORMATS, getExportFormat, getExportDimensions } from '../src/utils/exportFormat';

describe('Export format -> dimensions mapping', () => {
  it('defines exactly the three required formats', () => {
    expect(EXPORT_FORMATS.map((f) => f.id)).toEqual(['story', 'post', 'landscape']);
  });

  it('computes 1080x1920 for Story (9:16)', () => {
    const { ratio } = getExportFormat('story');
    expect(ratio).toBeCloseTo(9 / 16);
    expect(getExportDimensions(ratio)).toEqual({ width: 1080, height: 1920 });
  });

  it('computes 1080x1350 for Feed (4:5)', () => {
    const { ratio } = getExportFormat('post');
    expect(ratio).toBeCloseTo(4 / 5);
    expect(getExportDimensions(ratio)).toEqual({ width: 1080, height: 1350 });
  });

  it('computes 1080x608 for Landscape (16:9)', () => {
    const { ratio } = getExportFormat('landscape');
    expect(ratio).toBeCloseTo(16 / 9);
    expect(getExportDimensions(ratio)).toEqual({ width: 1080, height: 608 });
  });

  it('throws for an unknown format id instead of silently returning undefined', () => {
    expect(() => getExportFormat('bogus' as any)).toThrow();
  });
});
