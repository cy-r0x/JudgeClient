import { monokai } from "@uiw/codemirror-theme-monokai";
import CodeMirror from "@uiw/react-codemirror";
import { cpp } from "@codemirror/lang-cpp";
import { python } from "@codemirror/lang-python";
import { java } from "@codemirror/lang-java";

function CodeEditor({ handleChange, selectedLanguage, value, height }) {
  const languageExtensions = {
    cpp: cpp(),
    python: python(),
    java: java(),
  };

  const lang = languageExtensions[selectedLanguage] || cpp();
  const changeCode = (value) => {
    handleChange(value);
  };

  return (
    <CodeMirror
      value={value}
      extensions={[lang]}
      onChange={changeCode}
      theme={monokai}
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
        closeBrackets: true,
        autocompletion: false,
        tabSize: 4,
      }}
    />
  );
}

export default CodeEditor;
