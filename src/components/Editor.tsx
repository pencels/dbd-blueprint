import { useEffect, useRef, useState } from "preact/hooks";

import "@lib/userWorker";
import { initVimMode, type VimMode } from "monaco-vim";
import { editor as monacoEditor } from "monaco-editor/esm/vs/editor/editor.api";
import { useStore } from "@nanostores/preact";
import { currentTheme } from "src/themeStore";

export default function Editor({ initValue = "" }) {
  const monacoEditorElem = useRef<HTMLDivElement>(null);
  const vimStatusBar = useRef<HTMLDivElement>(null);

  const $currentTheme = useStore(currentTheme);
  const [vimMode, setVimMode] = useState<VimMode | undefined>(undefined);
  const [editor, setEditor] = useState<
    monacoEditor.IStandaloneCodeEditor | undefined
  >(undefined);

  useEffect(() => {
    if (monacoEditorElem.current) {
      setEditor((editor) => {
        if (editor) return editor;
        return monacoEditor.create(monacoEditorElem.current!, {
          value: initValue,
          language: "json",
          theme: $currentTheme === 'dark' ? "vs-dark" : "vs-light",
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
  }, [monacoEditorElem.current]);

  useEffect(() => {
    // Remeasure custom sized fonts that load in with through <link>s
    document.fonts.ready.then(() => {
      monacoEditor.remeasureFonts();
    });
  }, []);

  useEffect(() => {
    monacoEditor.setTheme($currentTheme === 'dark' ? 'vs-dark' : 'vs-light');
  }, [$currentTheme]);

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
      <div ref={monacoEditorElem} class="min-h-[600px]"></div>
      <div ref={vimStatusBar} class="font-mono"></div>
    </div>
  );
}
