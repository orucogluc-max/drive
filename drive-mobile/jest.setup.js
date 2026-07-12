// react-native-reanimated ships its own official Jest mock (its native
// worklets module can't run under Node). This is the standard setup its own
// docs recommend for any project testing reanimated-using code.
jest.mock('react-native-reanimated', () => require('react-native-reanimated/mock'));
