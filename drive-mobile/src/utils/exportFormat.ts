// Journey Studio export format definitions. Kept as a plain, dependency-free
// module (no React Native imports) so both the composer screen and the
// hidden ViewShot capture target derive pixel dimensions from one place, and
// so this logic is testable without pulling in any native module.

export type ExportFormatId = 'story' | 'post' | 'landscape';

export interface ExportFormatDef {
  id: ExportFormatId;
  label: string;
  ratio: number; // width / height
  // Feather icon name. Typed loosely (matches the pre-existing inline
  // definition this was extracted from) to avoid importing @expo/vector-icons'
  // large generated icon-name union into a plain, dependency-free util module.
  icon: any;
}

export const EXPORT_FORMATS: ExportFormatDef[] = [
  { id: 'story', label: 'Story (9:16)', ratio: 9 / 16, icon: 'smartphone' },
  { id: 'post', label: 'Feed (4:5)', ratio: 4 / 5, icon: 'instagram' },
  { id: 'landscape', label: 'Landscape (16:9)', ratio: 16 / 9, icon: 'monitor' },
];

export function getExportFormat(id: ExportFormatId): ExportFormatDef {
  const found = EXPORT_FORMATS.find((f) => f.id === id);
  if (!found) throw new Error(`Unknown export format: ${id}`);
  return found;
}

// The full-resolution capture target's pixel dimensions for a given format.
// Width is fixed at baseWidth (1080px, standard Instagram export width);
// height is derived from the format's aspect ratio.
export function getExportDimensions(ratio: number, baseWidth = 1080): { width: number; height: number } {
  return {
    width: baseWidth,
    height: Math.round(baseWidth / ratio),
  };
}
