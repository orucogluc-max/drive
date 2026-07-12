import { resolvePickedPhotoUri } from '../src/utils/imagePicker';

describe('resolvePickedPhotoUri (Journey Studio photo picker result handling)', () => {
  it('returns the selected asset uri on a normal selection', () => {
    const uri = resolvePickedPhotoUri({
      canceled: false,
      assets: [{ uri: 'file:///photo123.jpg' }],
    });
    expect(uri).toBe('file:///photo123.jpg');
  });

  it('returns undefined when the user cancels the picker', () => {
    const uri = resolvePickedPhotoUri({ canceled: true, assets: null });
    expect(uri).toBeUndefined();
  });

  it('returns undefined when canceled=false but assets is empty (defensive)', () => {
    const uri = resolvePickedPhotoUri({ canceled: false, assets: [] });
    expect(uri).toBeUndefined();
  });

  it('returns undefined when assets is missing entirely (defensive)', () => {
    const uri = resolvePickedPhotoUri({ canceled: false });
    expect(uri).toBeUndefined();
  });
});
