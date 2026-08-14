"use client";

import { useState, useEffect } from "react";
import CodeMirror from "@uiw/react-codemirror";
import { monokai } from "@uiw/codemirror-theme-monokai";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";
import { javascript } from "@codemirror/lang-javascript";
import Button from "@/components/ButtonComponent/Button";

export function SubmissionCodeViewer({ code, language }) {
  const languageExtensions = {
    c: cpp(),
    cpp: cpp(),
    py: python(),
    python: python(),
    java: java(),
    js: javascript(),
    javascript: javascript(),
  };

  const lang = languageExtensions[language] || cpp();

  const copyToClipboard = () => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const [copied, setCopied] = useState(false);

  return (
    <div className="relative">
      <CodeMirror
        value={code}
        height="calc(100vh - 500px)"
        extensions={[lang]}
        theme={monokai}
        editable={false}
        basicSetup={{
          lineNumbers: true,
          highlightActiveLineGutter: true,
          highlightSpecialChars: true,
          foldGutter: true,
          dropCursor: false,
          allowMultipleSelections: false,
          indentOnInput: false,
          syntaxHighlighting: true,
          bracketMatching: true,
          rectangularSelection: false,
          crosshairCursor: false,
          highlightActiveLine: false,
          highlightSelectionMatches: true,
          closeBrackets: false,
          autocompletion: false,
          tabSize: 2,
        }}
      />
      <div className="absolute top-2 right-6">
        <Button
          name={copied ? "Copied!" : "Copy Code"}
          onClick={copyToClipboard}
          size="sm"
        />
      </div>
    </div>
  );
}
