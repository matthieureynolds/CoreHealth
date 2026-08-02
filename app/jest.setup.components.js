/* eslint-disable @typescript-eslint/no-require-imports */
/**
 * Setup for the component project.
 *
 * Mocks the native modules the travel screens reach for. Each one is here
 * because it either has no JS implementation under test (AsyncStorage,
 * pager-view) or would make an assertion depend on a device (Dimensions,
 * safe-area insets).
 */
// v13 ships matchers in the main entry; no separate extend-expect module.
require("@testing-library/react-native");

// AsyncStorage: an in-memory implementation so trip persistence is observable.
jest.mock("@react-native-async-storage/async-storage", () => {
  let store = {};
  return {
    __resetStore: () => {
      store = {};
    },
    __seed: (k, v) => {
      store[k] = v;
    },
    getItem: jest.fn((k) => Promise.resolve(store[k] ?? null)),
    setItem: jest.fn((k, v) => {
      store[k] = v;
      return Promise.resolve();
    }),
    removeItem: jest.fn((k) => {
      delete store[k];
      return Promise.resolve();
    }),
    clear: jest.fn(() => {
      store = {};
      return Promise.resolve();
    }),
  };
});

// PagerView renders its children; the swipe itself is native.
jest.mock("react-native-pager-view", () => {
  const React = require("react");
  const { View } = require("react-native");
  const Pager = React.forwardRef((props, ref) => {
    React.useImperativeHandle(ref, () => ({ setPage: jest.fn() }));
    return React.createElement(View, props, props.children);
  });
  Pager.displayName = "PagerView";
  return { __esModule: true, default: Pager };
});

jest.mock("react-native-safe-area-context", () => ({
  useSafeAreaInsets: () => ({ top: 0, bottom: 0, left: 0, right: 0 }),
  SafeAreaProvider: ({ children }) => children,
}));

jest.mock("expo-linear-gradient", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    LinearGradient: (props) => React.createElement(View, props, props.children),
  };
});

jest.mock("@react-native-community/datetimepicker", () => {
  const React = require("react");
  const { View } = require("react-native");
  return {
    __esModule: true,
    default: (props) => React.createElement(View, props),
  };
});

// Network is never real in a component test; individual suites override this.
global.fetch = jest.fn(() =>
  Promise.resolve({
    ok: true,
    status: 200,
    json: () => Promise.resolve({}),
    text: () => Promise.resolve("{}"),
  }),
);

// Amplify auth is reached through the trip-sync path. It ships untranspiled
// ESM, and none of these tests exercise the backend write, so it is stubbed
// rather than added to transformIgnorePatterns (which would cost seconds per run).
jest.mock("aws-amplify/auth", () => ({
  fetchAuthSession: jest.fn(async () => ({
    tokens: {
      idToken: { payload: { sub: "test-user" }, toString: () => "tok" },
    },
  })),
}));
