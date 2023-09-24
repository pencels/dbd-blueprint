import { useEffect, useRef, useState } from "preact/hooks";

import type { VimMode } from "monaco-vim";
import type monaco from "monaco-editor/esm/vs/editor/editor.api";
import { useStore } from "@nanostores/preact";
import { currentTheme } from "src/themeStore";

export default function Editor({ initValue = "" }) {
  const monacoEditorElem = useRef<HTMLDivElement>(null);
  const vimStatusBar = useRef<HTMLDivElement>(null);

  const $currentTheme = useStore(currentTheme);
  const [vimMode, setVimMode] = useState<VimMode | undefined>(undefined);
  const [editor, setEditor] = useState<
    monaco.editor.IStandaloneCodeEditor | undefined
  >(undefined);

  const monacoPromise = import('@lib/userWorker').then(() => import("monaco-editor/esm/vs/editor/editor.api"));

  useEffect(() => {
    monacoPromise.then(monaco => {
      if (monacoEditorElem.current) {
        setEditor((editor) => {
          if (editor) return editor;
          return monaco.editor.create(monacoEditorElem.current!, {
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
    })

    return () => {
      editor?.dispose();
    };
  }, [monacoEditorElem.current]);

  useEffect(() => {
    if (editor) {
      // Remeasure custom sized fonts that load in with through <link>s
      document.fonts.ready.then(() => 
        monacoPromise
          .then(monaco => {
            monaco.editor.remeasureFonts();
          })
      );
    }
  }, [editor]);

  useEffect(() => {
    monacoPromise
      .then(monaco => {
        monaco.editor.setTheme($currentTheme === 'dark' ? 'vs-dark' : 'vs-light');
      });
  }, [$currentTheme]);

  useEffect(() => {
    import('monaco-vim').then(vim => {
      if (editor && vimStatusBar.current) {
        setVimMode((vimMode) => {
          if (vimMode) return vimMode;
          return vim.initVimMode(editor, vimStatusBar.current!);
        });
      }
    });
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
        onInput={async () => {
          if (vimMode) {
            vimMode.dispose();
            setVimMode(undefined);
          } else {
            const vim = await import('monaco-vim');
            setVimMode(vim.initVimMode(editor!, vimStatusBar.current!));
          }
        }}
      />
      {!editor && (
        <div role="status" class="w-full min-h-[600px] flex items-center justify-center">
            <svg aria-hidden="true" class="w-8 h-8 mr-2 text-gray-200 animate-spin dark:text-gray-600 fill-blue-600" viewBox="0 0 100 101" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M100 50.5908C100 78.2051 77.6142 100.591 50 100.591C22.3858 100.591 0 78.2051 0 50.5908C0 22.9766 22.3858 0.59082 50 0.59082C77.6142 0.59082 100 22.9766 100 50.5908ZM9.08144 50.5908C9.08144 73.1895 27.4013 91.5094 50 91.5094C72.5987 91.5094 90.9186 73.1895 90.9186 50.5908C90.9186 27.9921 72.5987 9.67226 50 9.67226C27.4013 9.67226 9.08144 27.9921 9.08144 50.5908Z" fill="currentColor"/>
                <path d="M93.9676 39.0409C96.393 38.4038 97.8624 35.9116 97.0079 33.5539C95.2932 28.8227 92.871 24.3692 89.8167 20.348C85.8452 15.1192 80.8826 10.7238 75.2124 7.41289C69.5422 4.10194 63.2754 1.94025 56.7698 1.05124C51.7666 0.367541 46.6976 0.446843 41.7345 1.27873C39.2613 1.69328 37.813 4.19778 38.4501 6.62326C39.0873 9.04874 41.5694 10.4717 44.0505 10.1071C47.8511 9.54855 51.7191 9.52689 55.5402 10.0491C60.8642 10.7766 65.9928 12.5457 70.6331 15.2552C75.2735 17.9648 79.3347 21.5619 82.5849 25.841C84.9175 28.9121 86.7997 32.2913 88.1811 35.8758C89.083 38.2158 91.5421 39.6781 93.9676 39.0409Z" fill="currentFill"/>
            </svg>
            <span class="sr-only">Loading...</span>
        </div>
      )}
      <div ref={monacoEditorElem} class="min-h-[600px]"></div>
      <div ref={vimStatusBar} class="font-mono"></div>
    </div>
  );
}
