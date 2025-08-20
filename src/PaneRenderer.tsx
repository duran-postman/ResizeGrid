import { useLayoutStore } from './store';
import { componentRegistry, type DisplayData, type ruid } from './utils';

export const PaneRenderer = ({ paneId, displayConteneIds }: { paneId: string, displayConteneIds: ruid[], focused: boolean }) => {
  const displays = useLayoutStore((state: any) => state.displays);
  const setFocusedPaneId = useLayoutStore((state: any) => state.setFocusedPaneId);
  const focusedPaneId = useLayoutStore((state: any) => state.focusedPaneId);
  // const paneDisplays = Object.values(displays).filter((d: any) => d.paneId === paneId) as DisplayData[];
  // console.log('The displayConteneIds ', displayConteneIds, displays)
  const paneDisplays = displayConteneIds.map((id) => displays[id]) as DisplayData[];

  const setPaneFocus = () => {
    setFocusedPaneId(paneId);
  }
  // console.log('The pane renderer ', paneId, '\n\n paneDisplays', paneDisplays)
  return (
    <div onClick={setPaneFocus} className={`pane ${focusedPaneId === paneId ? 'focused' : ''}`}>
      <p>Pane ID: {paneId}</p>
      {paneDisplays.map(({ id, componentName, props }) => {
        const Component = componentRegistry[componentName];
        return Component ? <Component key={id} displayId={id} {...props} /> : null;
      })}
    </div>
  );
};

export default PaneRenderer;