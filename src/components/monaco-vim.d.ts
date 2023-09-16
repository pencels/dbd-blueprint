declare module "monaco-vim" {
  import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

  interface VimMode {
    dispose(): void;
  }

  export function initVimMode(
    editor: monaco.editor.IStandaloneCodeEditor,
    elem: HTMLElement
  ): VimMode;
}
