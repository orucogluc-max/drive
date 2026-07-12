// Root stack route metadata, deliberately kept in a leaf module with zero
// screen-component imports. RootNavigator.tsx imports this for its actual
// Stack.Navigator wiring; __tests__/rootNavigator.test.ts imports it too,
// so the route-registration regression test doesn't have to pull in the
// full screen tree (and every native module those screens touch) just to
// check which route names exist.

export type RootStackParamList = {
  MainTabs: undefined;
  JourneyComposer: undefined;
  JourneyDetail: { journeyId: string };
  ClubList: undefined;
  ClubDetail: { clubId: string };
  RouteDetail: { routeId: string };
  Notifications: undefined;
  Privacy: undefined;
  // Named distinctly from the tab-level "Profile" screen so React Navigation
  // never has two same-named routes nested inside one another.
  UserProfile: { userId?: string };
};

// Single source of truth for which routes must be registered on the root
// stack. Kept in sync with RootNavigator.tsx's Stack.Screen list by hand —
// the two live next to each other and this array's own type is checked
// against RootStackParamList's keys, so a typo in either place fails to
// compile.
export const ROOT_STACK_ROUTE_NAMES = [
  'MainTabs',
  'JourneyComposer',
  'JourneyDetail',
  'ClubList',
  'ClubDetail',
  'RouteDetail',
  'Notifications',
  'Privacy',
  'UserProfile',
] as const satisfies readonly (keyof RootStackParamList)[];
