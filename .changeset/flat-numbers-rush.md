---
'@micro-stacks/react': patch
---

This update introduces three new hooks:

- `useContractCall`
- `useContractDeploy`
- `useStxTransfer`

Using these hooks instead of the previous `useTransactionPopup` makes for a better experience, as there is built-in loading state that can be shared between all instances of a given contract/hook combination.
