import { useLayoutStore } from './store';
import { componentRegistry, type DisplayData } from './utils';

export const PaneRenderer = ({ paneId, focused = false }: { paneId: string, focused: boolean }) => {
  const displays = useLayoutStore((state: any) => state.displays);
  const setFocusedPaneId = useLayoutStore((state: any) => state.setFocusedPaneId);
  const focusedPaneId = useLayoutStore((state: any) => state.focusedPaneId);
  const paneDisplays = Object.values(displays).filter((d: any) => d.paneId === paneId) as DisplayData[];
  const setPaneFocus = () => {
    setFocusedPaneId(paneId);
  }
  return (
    <div onClick={setPaneFocus} className={`pane ${focusedPaneId === paneId ? 'focused' : ''}`}>
      {paneDisplays.map(({ id, componentName, props }) => {
        const Component = componentRegistry[componentName];
        return Component ? <Component key={id} {...props} /> : null;
      })}
    </div>
  );
};

export default PaneRenderer;