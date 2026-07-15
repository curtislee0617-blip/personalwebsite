declare module "react-dom" {
  export function createPortal(
    children: import("react").ReactNode,
    container: Element | DocumentFragment,
    key?: import("react").Key | null,
  ): import("react").ReactPortal;
  export function flushSync<R>(callback: () => R): R;
}
