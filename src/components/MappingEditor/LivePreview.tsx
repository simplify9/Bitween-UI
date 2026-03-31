import React, { useMemo } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { useTypedSelector } from 'src/state/ReduxSotre';
import { evaluateMappings } from 'src/utils/mappingPreview';

const LivePreview: React.FC = () => {
  const inputJson = useTypedSelector((s) => s.mappingEditor.inputJson);
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const arrayMappings = useTypedSelector((s) => s.mappingEditor.arrayMappings);
  const validationErrors = useTypedSelector((s) => s.mappingEditor.validationErrors);

  const { output, warnings } = useMemo(
    () => evaluateMappings(inputJson, fieldMappings, arrayMappings),
    [inputJson, fieldMappings, arrayMappings]
  );

  const formatted = output !== null ? JSON.stringify(output, null, 2) : null;

  return (
    <div className="flex flex-col h-full bg-gray-50">
      <div className="flex items-center gap-2 px-4 py-2 border-b border-gray-200 bg-white flex-shrink-0">
        <span className="text-xs font-semibold text-gray-600 uppercase tracking-wide">
          Live Preview
        </span>
        <span className="text-xs text-gray-400">— evaluated output based on current mappings</span>
        {formatted && (
          <button
            className="ml-auto flex items-center gap-1 text-xs text-gray-500 hover:text-gray-700 border border-gray-200 rounded px-2 py-0.5 transition"
            onClick={() => navigator.clipboard.writeText(formatted)}
            title="Copy to clipboard"
          >
            <MdOutlineContentCopy size={12} /> Copy
          </button>
        )}
      </div>

      {/* Warnings */}
      {warnings.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-100">
          {warnings.map((w, i) => (
            <p key={i} className="text-xs text-amber-600 font-mono">
              ⚠ {w}
            </p>
          ))}
        </div>
      )}

      {/* Validation errors */}
      {validationErrors.length > 0 && (
        <div className="flex-shrink-0 px-4 py-2 bg-rose-50 border-b border-rose-100">
          {validationErrors.map((e, i) => (
            <p
              key={i}
              className={`text-xs font-mono ${e.type === 'error' ? 'text-rose-600' : 'text-amber-600'}`}
            >
              {e.type === 'error' ? '✗' : '⚠'} {e.message}
            </p>
          ))}
        </div>
      )}

      {/* Output JSON */}
      <div className="flex-1 overflow-auto">
        {formatted === null ? (
          <div className="flex items-center justify-center h-full text-center px-4">
            <p className="text-xs text-gray-400">Provide source JSON and mappings to see the output</p>
          </div>
        ) : (
          <pre className="px-4 py-3 text-xs font-mono text-gray-700 leading-5 whitespace-pre-wrap break-all">
            {formatted}
          </pre>
        )}
      </div>
    </div>
  );
};

export default LivePreview;
