declare module "react-dom" {
  export function flushSync<R>(callback: () => R): R;
}
