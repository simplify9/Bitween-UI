import React, { useEffect, useRef, useState, useCallback } from 'react';
import { useTypedSelector } from 'src/state/ReduxSotre';
import { useAppDispatch } from 'src/state/ReduxSotre';
import { removeFieldMapping, selectMapping } from 'src/state/stateSlices/mappingEditor';

interface Props {
  /** Map of path → DOM element for source leaves */
  sourceRefs: Map<string, HTMLElement>;
  /** Map of path → DOM element for target leaves */
  targetRefs: Map<string, HTMLElement>;
  /** The scrollable container for the source panel */
  sourceScroll: HTMLElement | null;
  /** The scrollable container for the target panel */
  targetScroll: HTMLElement | null;
  /** Width of the center canvas */
  width: number;
}

interface ConnectionLine {
  id: string;
  x1: number;
  y1: number;
  x2: number;
  y2: number;
  isSelected: boolean;
  isHovered: boolean;
}

const CONNECTION_COLORS = {
  default: '#94a3b8',   // slate-400
  selected: '#3b82f6',  // blue-500
  hovered: '#10b981',   // emerald-500
};

const ConnectionCanvas: React.FC<Props> = ({
  sourceRefs,
  targetRefs,
  sourceScroll,
  targetScroll,
  width,
}) => {
  const dispatch = useAppDispatch();
  const fieldMappings = useTypedSelector((s) => s.mappingEditor.fieldMappings);
  const selectedId = useTypedSelector((s) => s.mappingEditor.selectedMappingId);
  const hoveredPath = useTypedSelector((s) => s.mappingEditor.hoveredPath);
  const [lines, setLines] = useState<ConnectionLine[]>([]);
  const [hoveredLineId, setHoveredLineId] = useState<string | null>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  const rafRef = useRef<number>(0);

  const computeLines = useCallback(() => {
    if (!svgRef.current) return;
    const svgRect = svgRef.current.getBoundingClientRect();
    const newLines: ConnectionLine[] = [];

    for (const m of fieldMappings) {
      if (!m.source || !m.target) continue;
      const srcEl = sourceRefs.get(m.source);
      const tgtEl = targetRefs.get(m.target);
      if (!srcEl || !tgtEl) continue;

      const srcRect = srcEl.getBoundingClientRect();
      const tgtRect = tgtEl.getBoundingClientRect();

      const x1 = srcRect.right - svgRect.left;
      const y1 = srcRect.top + srcRect.height / 2 - svgRect.top;
      const x2 = tgtRect.left - svgRect.left;
      const y2 = tgtRect.top + tgtRect.height / 2 - svgRect.top;

      // Only draw if both ends are visible in viewport
      if (
        srcRect.bottom < svgRect.top - 20 ||
        srcRect.top > svgRect.bottom + 20 ||
        tgtRect.bottom < svgRect.top - 20 ||
        tgtRect.top > svgRect.bottom + 20
      ) {
        continue;
      }

      newLines.push({
        id: m.id,
        x1,
        y1,
        x2,
        y2,
        isSelected: selectedId === m.id,
        isHovered: hoveredPath === m.source || hoveredPath === m.target,
      });
    }

    setLines(newLines);
  }, [fieldMappings, selectedId, hoveredPath, sourceRefs, targetRefs]);

  // Recompute on scroll / resize
  useEffect(() => {
    const schedule = () => {
      cancelAnimationFrame(rafRef.current);
      rafRef.current = requestAnimationFrame(computeLines);
    };

    schedule();
    sourceScroll?.addEventListener('scroll', schedule, { passive: true });
    targetScroll?.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule, { passive: true });

    return () => {
      cancelAnimationFrame(rafRef.current);
      sourceScroll?.removeEventListener('scroll', schedule);
      targetScroll?.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
    };
  }, [computeLines, sourceScroll, targetScroll]);

  const buildPath = (x1: number, y1: number, x2: number, y2: number): string => {
    const cx = (x1 + x2) / 2;
    return `M ${x1} ${y1} C ${cx} ${y1} ${cx} ${y2} ${x2} ${y2}`;
  };

  return (
    <svg
      ref={svgRef}
      className="pointer-events-none absolute inset-0 w-full h-full overflow-visible z-10"
      style={{ mixBlendMode: 'normal' }}
    >
      <defs>
        <marker id="arrowhead" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={CONNECTION_COLORS.default} />
        </marker>
        <marker id="arrowhead-selected" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={CONNECTION_COLORS.selected} />
        </marker>
        <marker id="arrowhead-hovered" markerWidth="6" markerHeight="6" refX="6" refY="3" orient="auto">
          <path d="M0,0 L0,6 L6,3 z" fill={CONNECTION_COLORS.hovered} />
        </marker>
      </defs>
      {lines.map((line) => {
        const isHighlighted = line.isSelected || line.isHovered || hoveredLineId === line.id;
        const color = line.isSelected
          ? CONNECTION_COLORS.selected
          : line.isHovered || hoveredLineId === line.id
          ? CONNECTION_COLORS.hovered
          : CONNECTION_COLORS.default;
        const markerId = line.isSelected
          ? 'arrowhead-selected'
          : line.isHovered || hoveredLineId === line.id
          ? 'arrowhead-hovered'
          : 'arrowhead';

        return (
          <g key={line.id}>
            {/* Invisible wider hit area */}
            <path
              d={buildPath(line.x1, line.y1, line.x2, line.y2)}
              fill="none"
              stroke="transparent"
              strokeWidth={12}
              style={{ pointerEvents: 'stroke', cursor: 'pointer' }}
              onMouseEnter={() => setHoveredLineId(line.id)}
              onMouseLeave={() => setHoveredLineId(null)}
              onClick={() => dispatch(selectMapping(line.id))}
              onDoubleClick={() => dispatch(removeFieldMapping(line.id))}
            />
            {/* Visible path */}
            <path
              d={buildPath(line.x1, line.y1, line.x2, line.y2)}
              fill="none"
              stroke={color}
              strokeWidth={isHighlighted ? 2 : 1.5}
              strokeDasharray={line.isSelected ? undefined : undefined}
              markerEnd={`url(#${markerId})`}
              style={{ pointerEvents: 'none', transition: 'stroke 0.15s, stroke-width 0.15s' }}
            />
            {/* Dot at source end */}
            <circle cx={line.x1} cy={line.y1} r={3} fill={color} style={{ pointerEvents: 'none' }} />
            {/* Dot at target end */}
            <circle cx={line.x2} cy={line.y2} r={3} fill={color} style={{ pointerEvents: 'none' }} />
          </g>
        );
      })}
      {/* Legend */}
      {lines.length === 0 && (
        <text x="50%" y="50%" textAnchor="middle" fill="#cbd5e1" fontSize="11" fontFamily="monospace">
          Drag source fields onto target fields to create connections
        </text>
      )}
    </svg>
  );
};

export default ConnectionCanvas;
