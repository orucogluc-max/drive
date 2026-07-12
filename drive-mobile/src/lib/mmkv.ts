import { MMKV } from 'react-native-mmkv';
// @ts-expect-error MMKV is a class but TS thinks it's a type
export const storage = new MMKV();