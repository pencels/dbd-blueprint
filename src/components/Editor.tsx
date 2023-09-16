import { createRef } from "preact";
import { useEffect, useState } from "preact/hooks";

import "@lib/userWorker";
import { initVimMode, type VimMode } from "monaco-vim";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export default function Editor({ initValue = "" }) {
  const monacoEditor = createRef<HTMLDivElement>();
  const vimStatusBar = createRef<HTMLDivElement>();

  const [vimMode, setVimMode] = useState<VimMode | undefined>(undefined);
  const [editor, setEditor] = useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);

  useEffect(() => {
    const editor = monaco.editor.create(monacoEditor.current!, {
      value: initValue,
      language: "json",
      theme: "vs-dark",
      minimap: {
        enabled: false,
      },
      automaticLayout: true,
      fontFamily: "IBM Plex Mono",
      contextmenu: false,
    });
    setEditor(editor);

    setVimMode(initVimMode(editor, vimStatusBar.current!));

    return () => {
      vimMode?.dispose();
      editor.dispose();
    };
  }, [monacoEditor.current]);

  return (
    <div>
      <label htmlFor="vim-mode" className="mr-1">
        VIM
      </label>
      <input
        name="vim-mode"
        type="checkbox"
        checked={vimMode !== undefined}
        onInput={(e) => {
          if (vimMode) {
            vimMode.dispose();
            setVimMode(undefined);
          } else {
            setVimMode(initVimMode(editor!, vimStatusBar.current!));
          }
        }}
      />
      <div ref={monacoEditor} className={`min-h-[500px]`}></div>
      <div ref={vimStatusBar} className="font-mono"></div>
    </div>
  );
}
