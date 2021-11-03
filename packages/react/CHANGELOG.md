# @micro-stacks/react

## 0.0.7

### Patch Changes

- [#11](https://github.com/fungible-systems/micro-stacks-react/pull/11) [`6f73bf6`](https://github.com/fungible-systems/micro-stacks-react/commit/6f73bf6db66cdf58ff772747e0c5fa488bbb85f9) Thanks [@aulneau](https://github.com/aulneau)! - This update introduces three new hooks:

  - `useContractCall`
  - `useContractDeploy`
  - `useStxTransfer`

  Using these hooks instead of the previous `useTransactionPopup` makes for a better experience, as there is built-in loading state that can be shared between all instances of a given contract/hook combination.

* [#13](https://github.com/fungible-systems/micro-stacks-react/pull/13) [`1d07f46`](https://github.com/fungible-systems/micro-stacks-react/commit/1d07f46b918ee1511943d7657b5db0d5af8138cb) Thanks [@aulneau](https://github.com/aulneau)! - This update improves some internal workings around how things get persisted, and adds a feature around tab-syncing when certain actions take place, such as signing in or changing networks.

## 0.0.6

### Patch Changes

- [`cd36e4c`](https://github.com/fungible-systems/micro-stacks-react/commit/cd36e4c6f6e24119006d37986ee7e56d7f0e9896) Thanks [@aulneau](https://github.com/aulneau)! - Updates peer dep resolution for external deps.

## 0.0.5

### Patch Changes

- [#8](https://github.com/fungible-systems/micro-stacks-react/pull/8) [`48525fd`](https://github.com/fungible-systems/micro-stacks-react/commit/48525fd0edd7a43baf7df8524a9c1119a95ebd70) Thanks [@aulneau](https://github.com/aulneau)! - Fixes a conditional logic bug where session would not be returned correctly.

## 0.0.4

### Patch Changes

- [#5](https://github.com/fungible-systems/micro-stacks-react/pull/5) [`e88fd70`](https://github.com/fungible-systems/micro-stacks-react/commit/e88fd7089c33334e323054dc26a6429216ee72a0) Thanks [@aulneau](https://github.com/aulneau)! - Minor fix around deps for each package.

## 0.0.3

### Patch Changes

- [#3](https://github.com/fungible-systems/micro-stacks-react/pull/3) [`1dc8d71`](https://github.com/fungible-systems/micro-stacks-react/commit/1dc8d71ac4e7c04403bc918ccf72a2851440fb2d) Thanks [@aulneau](https://github.com/aulneau)! - Fixed a bug where handleSignIn required an empty object to be passed.

## 0.0.2

### Patch Changes

- [#1](https://github.com/fungible-systems/micro-stacks-react/pull/1) [`98e8a13`](https://github.com/fungible-systems/micro-stacks-react/commit/98e8a1397854767471334d20462c05640ce9ae69) Thanks [@aulneau](https://github.com/aulneau)! - Initial release.
