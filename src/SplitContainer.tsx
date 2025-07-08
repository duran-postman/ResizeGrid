import React from 'react';
import { findNodeById, normalizeSizes, type Pane } from './utils';
import { useLayoutStore } from './store';
import PaneRenderer from './PaneRenderer';

export const SplitContainer = ({ node }: { node: Pane }) => {
  const { layout, updateLayout, focusedPaneId }: any = useLayoutStore();
  const isRow = node.direction === 'row';
  const sizes = normalizeSizes(node.sizes, node.children?.length || 0);

  const handleDragStart = (index: number) => (e: React.MouseEvent) => {
    e.preventDefault();
    const start = isRow ? e.clientX : e.clientY;
    const container = e.currentTarget.parentElement!;
    const rect = container.getBoundingClientRect();
    const containerSize = isRow ? rect.width : rect.height;
    const backup = [...sizes];

    function onMouseMove(ev: MouseEvent) {
      const current = isRow ? ev.clientX : ev.clientY;
      const delta = (current - start) / containerSize;
      let a = backup[index] + delta;
      let b = backup[index + 1] - delta;
      const min = 0.05;
      if (a < min || b < min) return;
      const newSizes = [...backup];
      newSizes[index] = a;
      newSizes[index + 1] = b;

      const newLayout = JSON.parse(JSON.stringify(layout)) as Pane;
      let target = findNodeById(newLayout, node.id);
      if (target) target.sizes = newSizes;
      updateLayout(newLayout);
    }

    function onMouseUp() {
      window.removeEventListener('mousemove', onMouseMove);
      window.removeEventListener('mouseup', onMouseUp);
    }

    window.addEventListener('mousemove', onMouseMove);
    window.addEventListener('mouseup', onMouseUp);
  };

  if (!node.children || node.children.length === 0) {
    return <PaneRenderer paneId={node.id} focused={focusedPaneId === node.id} />;
  }

  const gridStyle: React.CSSProperties = {
    display: 'grid',
    gridTemplateColumns: isRow
      ? sizes.flatMap((s, i) => [s * 100 + '%', i < sizes.length - 1 ? '5px' : null]).filter(Boolean).join(' ')
      : '100%',
    gridTemplateRows: !isRow
      ? sizes.flatMap((s, i) => [s * 100 + '%', i < sizes.length - 1 ? '5px' : null]).filter(Boolean).join(' ')
      : '100%',
  };

  return (
    <div className="split-container" style={gridStyle}>
      {node.children.map((child: Pane, index: number) => (
        <React.Fragment key={child.id}>
          {child.type === 'split' ? (
            <SplitContainer node={child} />
          ) : (
            <PaneRenderer paneId={child.id} focused={focusedPaneId === node.id}/>
          )}
          {index < (node.children || []).length - 1 && (
            <div
              className={`resizer ${isRow ? 'vertical' : 'horizontal'}`}
              onMouseDown={handleDragStart(index)}
            />
          )}
        </React.Fragment>
      ))}
    </div>
  );
};

export default SplitContainer;
