import React from 'react';
import { View, StyleSheet } from 'react-native';

// Pure scale math, exported separately so it's unit-testable without
// rendering anything (see __tests__/scaledPreview.test.ts).
export function computeScaledDimensions(captureWidth: number, captureHeight: number, displayWidth: number) {
  const scale = displayWidth / captureWidth;
  return {
    scale,
    displayHeight: captureHeight * scale,
  };
}

interface ScaledPreviewProps {
  // The true, full-resolution size the wrapped content is laid out at —
  // must match exactly what the export capture target uses.
  captureWidth: number;
  captureHeight: number;
  // The on-screen box this should visually fit into. Height is derived from
  // captureWidth/captureHeight's aspect ratio, so it's impossible for the
  // preview to end up a different aspect ratio than the actual export.
  displayWidth: number;
  borderRadius?: number;
  children: React.ReactNode;
}

// Renders `children` at their true full-resolution capture size and
// visually scales the result down (anchored to the top-left corner) to fit
// displayWidth. This is the *only* mechanism used to size a preview: there
// is no second, independently-tuned small-scale layout to keep in sync with
// the export target, so preview and export cannot visually drift apart —
// they are, by construction, the same pixels at two different zoom levels.
export function ScaledPreview({ captureWidth, captureHeight, displayWidth, borderRadius = 0, children }: ScaledPreviewProps) {
  const { scale, displayHeight } = computeScaledDimensions(captureWidth, captureHeight, displayWidth);

  return (
    <View style={[styles.viewport, { width: displayWidth, height: displayHeight, borderRadius }]}>
      <View
        style={[
          styles.captureSurface,
          { width: captureWidth, height: captureHeight, transform: [{ scale }] },
        ]}
      >
        {children}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  viewport: { overflow: 'hidden' },
  // transformOrigin pins the scale to the top-left corner instead of RN's
  // default center-anchored scaling, so the scaled content exactly fills
  // the viewport from (0,0) with no compensating translate needed.
  captureSurface: { transformOrigin: [0, 0] },
});
