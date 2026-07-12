import React from 'react';
import { View, StyleSheet } from 'react-native';
import { CartesianChart, Line } from 'victory-native';
import { colors } from '../../theme';

type TelemetryPoint = Record<string, number>;

interface TelemetryChartProps {
  data: TelemetryPoint[];
  color?: string;
  height?: number;
}

export function TelemetryChart({ data, color = colors.brand, height = 150 }: TelemetryChartProps) {
  if (!data || data.length === 0) {
    return <View style={[{ height }, styles.empty]} />;
  }

  return (
    <View style={{ height }}>
      <CartesianChart
        data={data}
        xKey="time"
        yKeys={["value"]}
        domainPadding={{ top: 20, bottom: 20 }}
      >
        {({ points }) => (
          <Line
            points={points.value as any}
            color={color}
            strokeWidth={3}
            animate={{ type: 'timing', duration: 1000 }}
          />
        )}
      </CartesianChart>
    </View>
  );
}

const styles = StyleSheet.create({
  empty: {
    backgroundColor: colors.backgroundElevated,
    borderRadius: 8,
  },
});
