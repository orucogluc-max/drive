import { ROOT_STACK_ROUTE_NAMES } from '../src/navigation/routes';

// Regression guard for the fix/core-journey-flow bug: App.tsx used to render
// TabNavigator directly with no stack, so JourneyComposer, JourneyDetail,
// ClubList, ClubDetail, RouteDetail, Notifications, Privacy and UserProfile
// were all unreachable. This asserts they stay registered on the root stack
// without needing to render the full navigator tree (which would require
// mocking every screen's native module imports).
describe('RootNavigator route registration', () => {
  const previouslyOrphanedScreens = [
    'JourneyComposer',
    'JourneyDetail',
    'ClubList',
    'ClubDetail',
    'RouteDetail',
    'Notifications',
    'Privacy',
    'UserProfile',
  ] as const;

  it('registers the tab container as the initial route', () => {
    expect(ROOT_STACK_ROUTE_NAMES[0]).toBe('MainTabs');
  });

  it.each(previouslyOrphanedScreens)('keeps %s registered on the root stack', (name) => {
    expect(ROOT_STACK_ROUTE_NAMES).toContain(name);
  });

  it('has no duplicate route names', () => {
    expect(new Set(ROOT_STACK_ROUTE_NAMES).size).toBe(ROOT_STACK_ROUTE_NAMES.length);
  });

  it('does not register the dead "DriveSummary" route the old code navigated to', () => {
    expect(ROOT_STACK_ROUTE_NAMES).not.toContain('DriveSummary');
  });
});
