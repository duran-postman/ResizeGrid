import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import {
  ComponentNames,
  createPane,
  DEFAULT_SIZE,
  defaultLayout,
  findNodeById,
  getId,
  randomWord,
  type DisplayData,
  type Pane,
  type PaneDirection,
  type PaneType,
  type ruid,
} from '../utils';

// const withDevtools = import.meta.env.DEV ? devtools : (f: any) => f;
const withMiddleware = (fn: any) =>
  devtools(
    persist(fn, {
      name: 'Resizables', // Key in localStorage
      partialize: (state: any) => ({
        layout: state.layout,
        displays: state.displays,
        flatLayout: state.flatLayout,
      }), // Only persist layout and displays
    }),
    { name: 'Resizables' } // Redux DevTools name
  );

export const useLayoutStore = create(
  withMiddleware((set: any, get: any) => ({
    layout: defaultLayout as Pane,
    focusedPaneId: null as string | null,
    flatLayout: {} as Record<ruid, Pane>,
    displays: {} as Record<string, DisplayData>,
    addPane: (newPane: Pane) => {
      set((state: any) => ({
        flatLayout: {
          ...state.flatLayout,
          [newPane.id]: newPane
        }
      }))
    },
    updateDisplay: (displayContent: DisplayData) => {
      set((state: any) => ({
        displays: {
          ...state.displays,
          [displayContent.id]: displayContent
        },
      }))
    },
    openContentInPane: (
      targetPaneId: ruid  = 'root',
      content: { name: string; text: string },
      componentName: string = ComponentNames.TextDisplay,
      direction: PaneDirection = 'row',
      type: PaneType = 'leaf'
    ) => {
      /*
      with the content create new DisplayData obj. use relevant arguments to create the obj.
      then with the new content check if the targetPaneId exists in the flatLayout.
      if it does add the new display data obj id to the found pane displayContent list.
      the new display data obj id should be added to the displays obj. The key is the id of the display data obj.
       */
      const {flatLayout, addPane, updateDisplay, updateLayoutStructure} = get();
      const targetPaneExists = Object.hasOwn(flatLayout, targetPaneId);
      const createdPane = createPane(randomWord(4, 10), type, direction, [1], [], targetPaneExists ? targetPaneId : 'root');

      const newDisplayData: DisplayData = {
        id: getId(),
        paneId: createdPane.id,
        componentName,
        props: content
      }
      createdPane.displayContent?.push(newDisplayData.id);

      updateDisplay(newDisplayData);
      addPane(createdPane);
      updateLayoutStructure();
    },
    setFocusedPaneId: (paneId: string) => set({ focusedPaneId: paneId }),
    updateLayoutStructure: () => {
      /**
       * using the flatLayout and displays obj create a new layout obj.
       */
      const {flatLayout, layout} = get();
      // const sendableLayout = {...defaultLayout, sizes: layout.sizes};//{...layout} as Pane;
      const sendableLayout = JSON.parse(JSON.stringify(defaultLayout));
      sendableLayout.sizes = [...layout.sizes];

      const root = findNodeById(sendableLayout, 'root');
      const newLayout = Object.values(flatLayout).reduce((output: Pane, cv: Pane) => {
        if(findNodeById(output, cv.id)) {
          console.log('Early exit is happening')
          return output;
        }
        const { parentId } = cv
        if(parentId === 'root') {
          root.children.push(cv)
        }
        // console.log('current value ', cv);
        // console.log('output ', output);

        return output as Pane;
      }, sendableLayout)
      console.log('\n\nThe final form ', newLayout);
      set({layout: newLayout})
    },
    updateLayoutSizes: () => {
      /**
       * using the flatLayout and displays obj create a new layout obj.
       */
    },
    closeDisplay: () => {},
  }))
);
