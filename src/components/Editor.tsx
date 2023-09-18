import { useEffect, useRef, useState } from "preact/hooks";

import "@lib/userWorker";
import { initVimMode, type VimMode } from "monaco-vim";
import * as monaco from "monaco-editor/esm/vs/editor/editor.api";

export default function Editor({ initValue = "" }) {
  const monacoEditor = useRef<HTMLDivElement>(null);
  const vimStatusBar = useRef<HTMLDivElement>(null);

  const [vimMode, setVimMode] = useState<VimMode | undefined>(undefined);
  const [editor, setEditor] = useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);

  useEffect(() => {
    if (monacoEditor.current) {
      setEditor((editor) => {
        if (editor) return editor;
        return monaco.editor.create(monacoEditor.current!, {
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
      });
    }

    return () => {
      editor?.dispose();
    };
  }, [monacoEditor.current]);

  // Remeasure custom sized fonts that load in with through <link>s
  useEffect(() => {
    document.fonts.ready.then(() => {
      monaco.editor.remeasureFonts();
    });
  }, []);

  useEffect(() => {
    if (editor && vimStatusBar.current) {
      setVimMode((vimMode) => {
        if (vimMode) return vimMode;
        return initVimMode(editor, vimStatusBar.current!);
      });
    }
    return () => {
      vimMode?.dispose();
    };
  }, [editor, vimStatusBar.current]);

  return (
    <div>
      <label htmlFor="vim-mode" className="mr-1">
        VIM
      </label>
      <input
        name="vim-mode"
        type="checkbox"
        checked={vimMode !== undefined}
        onInput={() => {
          if (vimMode) {
            vimMode.dispose();
            setVimMode(undefined);
          } else {
            setVimMode(initVimMode(editor!, vimStatusBar.current!));
          }
        }}
      />
      <div ref={monacoEditor} className="min-h-[600px]"></div>
      <div ref={vimStatusBar} className="font-mono"></div>
    </div>
  );
}
