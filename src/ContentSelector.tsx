import { useState } from 'react';
import { contentNameList, getContent } from './content';
import { useLayoutStore } from './store';
import { ComponentNames, type Pane } from './utils';

function getLeafPaneIds(pane: any): Partial<Pane>[] {
  if (pane.type === 'leaf') {
    return [{ id: pane.id, name: pane.name }];
  }
  if (pane.children) {
    return pane.children.flatMap(getLeafPaneIds);
  }
  return [];
}

export const ContentSelector = () => {
  const [selectedContentId, setSelectedContentId] = useState<string>('');
  const [selectedPaneId, setSelectedPaneId] = useState<string>('root'); // optional
  const layout = useLayoutStore((state: any) => state.layout);
  const focusedPaneId = useLayoutStore((state: any) => state.focusedPaneId);
  const setFocusedPaneId = useLayoutStore((state: any) => state.setFocusedPaneId);
  const openContentInPane = useLayoutStore((state: any) => state.openContentInPane);

  const allPanes = getLeafPaneIds(layout);

  const handleOpen = (e: any) => {
    
    const content = getContent(selectedContentId);
    if (content) {
      const {direction} = e.target.dataset
      // console.log("🚀 ~ handleOpen ~ direction:", direction)
      // Pass selectedPaneId or undefined (auto-create pane if needed)
      // const paneIdToUse = selectedPaneId;//|| undefined;
      const paneIdToUse = focusedPaneId || 'root';//|| undefined;
      console.log('The paneIdToUse ', paneIdToUse)
      openContentInPane(paneIdToUse, content, ComponentNames.TextDisplay, direction);
    }
  };

  const resetFocusedPane = () => {
    setFocusedPaneId(null)
  }
  const clearReleoad = () => {
    localStorage.clear();
    window.location.replace(window.location.href);
  }
  return (
    <div className="content-selector space-y-2 p-2 border rounded">
      <div>
        <label className="block font-medium">Select Content</label>
        <select
          value={selectedContentId}
          onChange={(e) => setSelectedContentId(e.target.value)}
          className="border rounded w-full"
        >
          <option value="">-- Choose Content --</option>
          {contentNameList.map((c: any) => (
            <option key={c.id} value={c.id}>
              {c.name}
            </option>
          ))}
        </select>
      </div>

      <div>
        <label className="block font-medium">Select Pane (optional)</label>
        <select
          value={selectedPaneId}
          onChange={(e) => setSelectedPaneId(e.target.value)}
          className="border rounded w-full"
        >
          <option value="">-- Auto-create Pane --</option>
          {allPanes.map((pane: any) => (
            <option key={pane.id} value={pane.id}>
              {pane.name || pane.id}
            </option>
          ))}
        </select>
      </div>

      <button
        onClick={handleOpen}
        disabled={!selectedContentId} // Only require content selection
        data-direction="row"
        className="bg-blue-500 text-white rounded px-4 py-1 disabled:opacity-50"
      >
        Open row
      </button>
      <button
        onClick={handleOpen}
        disabled={!selectedContentId} // Only require content selection
        data-direction="column"
        className="bg-blue-500 text-white rounded px-4 py-1 disabled:opacity-50"
      >
        Open Column
      </button>
      <button onClick={clearReleoad}>clear local</button>
      <button onClick={resetFocusedPane}>null focus</button>
      {selectedPaneId !== null}
    </div>
  );
};

export default ContentSelector;
