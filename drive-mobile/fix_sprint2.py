import os

base_dir = r"c:\Users\PC\Downloads\drive-master-main\drive-mobile"

def fix_file(path, replacements):
    full_path = os.path.join(base_dir, path)
    if not os.path.exists(full_path):
        print(f"Not found: {full_path}")
        return
    with open(full_path, 'r', encoding='utf-8') as f:
        content = f.read()
    for old, new in replacements:
        content = content.replace(old, new)
    with open(full_path, 'w', encoding='utf-8') as f:
        f.write(content)
    print(f"Fixed: {full_path}")

fix_file("src/components/ui/FloatingRecordButton.tsx", [
    ("import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue, useEffect } from 'react-native-reanimated';", "import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming, useSharedValue } from 'react-native-reanimated';")
])

fix_file("src/components/ui/RouteCard.tsx", [
    ("import { View, StyleSheet, TouchableOpacity, ImageBackground } from 'react-native';", "import { View, StyleSheet, TouchableOpacity, ImageBackground, Platform } from 'react-native';")
])

fix_file("src/components/ui/TelemetryChart.tsx", [
    ("interface TelemetryPoint {\\n  time: number;\\n  value: number;\\n}", "interface TelemetryPoint extends Record<string, any> {\\n  time: number;\\n  value: number;\\n}")
])

# Create src/lib/mmkv.ts
mmkv_path = os.path.join(base_dir, "src/lib/mmkv.ts")
os.makedirs(os.path.dirname(mmkv_path), exist_ok=True)
with open(mmkv_path, 'w', encoding='utf-8') as f:
    f.write("import { MMKV } from 'react-native-mmkv';\\nexport const storage = new MMKV();\\n")
print("Created: src/lib/mmkv.ts")

