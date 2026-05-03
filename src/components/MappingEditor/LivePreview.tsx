import React, { useEffect, useRef, useState } from 'react';
import { MdOutlineContentCopy } from 'react-icons/md';
import { useMappingEditorState } from './context/MappingEditorContext';
import { usePreviewMappingMutation } from 'src/client/apis/mappersApi';
import { generateScriban } from 'src/utils/scribanGenerator';
import { useValuesSetMap } from 'src/hooks/useValuesSetMap';

const DEBOUNCE_MS = 600;

const LivePreview: React.FC = () => {
  const { inputJson, outputJson: targetSchemaJson, fieldMappings, arrayMappings, manualTemplate, mode, validationErrors, partnerAdapterProperties, selectedPartnerId } = useMappingEditorState();

  const valuesSetMap = useValuesSetMap();
  const [previewMapping] = usePreviewMappingMutation();
  const [outputJson, setOutputJson] = useState<string | null>(null);
  const [previewError, setPreviewError] = useState<string | null>(null);

  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (debounceRef.current) clearTimeout(debounceRef.current);

    debounceRef.current = setTimeout(async () => {
      const hasPartnerProps = Object.keys(partnerAdapterProperties).length > 0;
      // If no source JSON but partner props exist, use {} as base so __partner__ can still be injected
      const effectiveInputJson = !inputJson.trim() && hasPartnerProps ? '{}' : inputJson;

      if (!effectiveInputJson.trim() && !selectedPartnerId) {
        setOutputJson(null);
        setPreviewError(null);
        return;
      }

      // Use manual template if in manual mode, otherwise generate from state
      const template =
        mode === 'manual' && manualTemplate
          ? manualTemplate
          : generateScriban(fieldMappings, arrayMappings, valuesSetMap, targetSchemaJson || undefined, effectiveInputJson || undefined);

      try {
        const result = await previewMapping({
          scribanTemplate: template,
          inputJson: effectiveInputJson || '{}',
          partnerId: selectedPartnerId,
        }).unwrap();
        setOutputJson(result.outputJson ?? null);
        setPreviewError(result.error ?? null);
      } catch {
        setPreviewError('Failed to reach preview API');
        setOutputJson(null);
      }
    }, DEBOUNCE_MS);

    return () => {
      if (debounceRef.current) clearTimeout(debounceRef.current);
    };
  }, [inputJson, fieldMappings, arrayMappings, manualTemplate, mode, valuesSetMap, partnerAdapterProperties, selectedPartnerId]);

  const formatted = outputJson !== null ? outputJson : null;

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

      {/* Preview error */}
      {previewError && (
        <div className="flex-shrink-0 px-4 py-2 bg-amber-50 border-b border-amber-100">
          <p className="text-xs text-amber-600 font-mono">⚠ {previewError}</p>
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
