import React, { useEffect, useRef } from 'react';
import Editor from '@monaco-editor/react';
import { useAppDispatch, useTypedSelector } from 'src/state/ReduxSotre';
import {
  setArrayMappings,
  setFieldMappings,
  setManualTemplate,
  syncManualTemplate,
} from 'src/state/stateSlices/mappingEditor';
import { generateScriban, parseScriban } from 'src/utils/scribanGenerator';

const SCRIBAN_HINT = `{{- # Scriban template — edit freely -}}
{{- # Use {{ variable.path }} for values, for/end for loops, if/end for filters -}}
`;

const ManualEditor: React.FC = () => {
  const dispatch = useAppDispatch();
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const manualTemplate = useTypedSelector((s) => s.mappingEditor.manualTemplate);
  const isManualDirty = useTypedSelector((s) => s.mappingEditor.isManualDirty);
  const editorRef = useRef<any>(null);
  const [parseWarnings, setParseWarnings] = React.useState<string[]>([]);
  const [parseSuccess, setParseSuccess] = React.useState(false);

  // ManualEditor mounts each time the user switches to Manual mode.
  // We rely on handleModeChange in index.tsx to call syncManualTemplate before
  // changing the mode, so by the time this component mounts the template is
  // already up-to-date. This effect is a safety fallback for initial page load
  // where mode starts as 'visual' and has never been set via handleModeChange.
  useEffect(() => {
    if (!isManualDirty) {
      dispatch(syncManualTemplate(generateScriban(fieldMappings, arrayMappings)));
    }
  }, []); // Only on mount — ongoing sync is handled by handleModeChange

  const handleEditorChange = (value: string | undefined) => {
    dispatch(setManualTemplate(value ?? ''));
  };

  const handleRegenerateFromVisual = () => {
    const generated = generateScriban(fieldMappings, arrayMappings);
    dispatch(syncManualTemplate(generated));
    editorRef.current?.setValue(generated);
    setParseWarnings([]);
    setParseSuccess(false);
  };

  const handleParseBackToVisual = () => {
    const result = parseScriban(manualTemplate);
    setParseWarnings(result.warnings);

    if (result.fieldMappings.length > 0 || result.arrayMappings.length > 0) {
      // Replace both fieldMappings and arrayMappings entirely from the parsed template
      dispatch(
        setFieldMappings(
          result.fieldMappings.map((m, i) => ({ id: `parsed-${i}-${Date.now()}`, ...m }))
        )
      );
      dispatch(
        setArrayMappings(
          result.arrayMappings.map((am, i) => ({
            id: `parsed-am-${i}-${Date.now()}`,
            ...am,
            mappings: am.mappings.map((m, j) => ({ id: `parsed-am-${i}-${j}-${Date.now()}`, ...m })),
          }))
        )
      );
      setParseSuccess(true);
    } else {
      setParseWarnings(['No parseable mappings found. Check your template syntax.']);
    }
  };

  const templateToShow =
    manualTemplate ||
    (fieldMappings.length > 0 || arrayMappings.length > 0
      ? generateScriban(fieldMappings, arrayMappings)
      : SCRIBAN_HINT);

  return (
    <div className="flex flex-col h-full">
      {/* Toolbar */}
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-gray-50 flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Scriban Template
        </span>
        <span className="text-xs text-gray-400">— edit the template directly</span>
        <div className="ml-auto flex items-center gap-2">
          <button
            onClick={handleRegenerateFromVisual}
            className="text-xs border border-gray-300 rounded px-3 py-1 hover:bg-gray-100 transition"
            title="Re-generate template from current visual mappings (will overwrite edits)"
          >
            ↺ Regenerate from Visual
          </button>
          <button
            onClick={handleParseBackToVisual}
            className="text-xs bg-blue-600 text-white rounded px-3 py-1 hover:bg-blue-700 transition"
            title="Attempt to parse this template back into visual mappings"
          >
            → Apply to Visual Mode
          </button>
        </div>
      </div>

      {/* Validation messages */}
      {parseWarnings.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-200">
          <p className="text-xs font-semibold text-amber-700 mb-1">Parse warnings:</p>
          <ul className="space-y-0.5">
            {parseWarnings.map((w, i) => (
              <li key={i} className="text-xs text-amber-600 font-mono">
                • {w}
              </li>
            ))}
          </ul>
        </div>
      )}
      {parseSuccess && (
        <div className="flex-shrink-0 px-4 py-2 bg-emerald-50 border-b border-emerald-200">
          <p className="text-xs text-emerald-700">
            ✓ Template parsed successfully — switched to Visual mode.
          </p>
        </div>
      )}

      {/* Monaco Editor */}
      <div className="flex-1 min-h-0">
        <Editor
          language="handlebars"
          theme="vs"
          value={templateToShow}
          onChange={handleEditorChange}
          onMount={(ed) => {
            editorRef.current = ed;
          }}
          options={{
            minimap: { enabled: true },
            fontSize: 13,
            lineNumbers: 'on',
            wordWrap: 'on',
            scrollBeyondLastLine: false,
            fontFamily: '"Fira Code", "JetBrains Mono", monospace',
            automaticLayout: true,
            formatOnPaste: true,
            tabSize: 2,
            suggest: { snippetsPreventQuickSuggestions: false },
          }}
        />
      </div>

      {/* Scriban cheat sheet */}
      <div className="flex-shrink-0 px-4 py-2 border-t border-gray-200 bg-gray-50">
        <div className="flex items-start gap-4 text-xs text-gray-500 font-mono flex-wrap">
          <span>
            <span className="text-blue-600">{'{{ var.path }}'}</span> value
          </span>
          <span>
            <span className="text-purple-600">{'{{- for item in arr -}}'}</span> …{' '}
            <span className="text-purple-600">{'{{- end -}}'}</span> loop
          </span>
          <span>
            <span className="text-amber-600">{'{{- if expr -}}'}</span> …{' '}
            <span className="text-amber-600">{'{{- end -}}'}</span> condition
          </span>
          <span>
            <span className="text-gray-400">{'{{- # comment -}}'}</span>
          </span>
        </div>
      </div>
    </div>
  );
};

export default ManualEditor;
