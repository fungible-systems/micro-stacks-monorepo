import invariant from "tiny-invariant";

function makeMicroStacksMsg(msg: string) {
  return `[@micro-stacks/client] ${msg}`;
}

export function invariantWithMessage(
  condition: any,
  message: string
): asserts condition {
  invariant(condition, makeMicroStacksMsg(message));
}
