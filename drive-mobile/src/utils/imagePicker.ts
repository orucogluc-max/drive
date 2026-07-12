// Pure decision logic for what to do with an expo-image-picker result,
// separated from the actual native call so cancellation/empty-selection
// handling is unit-testable without mocking expo-image-picker's native module.

export interface PickedImageResult {
  canceled: boolean;
  assets?: { uri: string }[] | null;
}

// Returns the photo URI to use, or undefined if the user cancelled the
// picker or somehow selected nothing (both must leave any existing photo
// selection untouched — the caller should only overwrite state when this
// returns a defined value).
export function resolvePickedPhotoUri(result: PickedImageResult): string | undefined {
  if (result.canceled) return undefined;
  if (!result.assets || result.assets.length === 0) return undefined;
  return result.assets[0].uri;
}
