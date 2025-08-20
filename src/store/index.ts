import { create } from 'zustand';
import { devtools, persist } from 'zustand/middleware';

import {
  ComponentNames,
  createPane,
  defaultLayout,
  findNodeById,
  randomWord,
  type DisplayData,
  type Pane,
  type PaneDirection,
  type PaneType,
  type ruid,
  type UUID,
} from '../utils';
import type { ContentType } from '../content';

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
    addNewDisplay: (displayContent: DisplayData) => {
      set((state: any) => ({
        displays: {
          ...state.displays,
          [displayContent.id]: displayContent
        },
      }))
    },
    changePaneType: (paneId: ruid, type: PaneType) => {
      set((state: any) => ({
        flatLayout: {
          ...state.flatLayout,
          [paneId]: {...state.flatLayout[paneId], type}
        }
      }))
    },
    openContentInPane: (
      targetPaneId: ruid  = 'root',
      content: ContentType,
      componentName: string = ComponentNames.TextDisplay,
      direction: PaneDirection = 'row',
      type: PaneType = 'leaf'
    ) => {
      /*
      check if the targetPane has display content. If it does create a new pane. Add the content to that pane.
      Then add the new pane and content to the child list as well.
       */
      const {flatLayout, addPane, displays, addNewDisplay, updateLayoutStructure} = get();
      const targetPaneExists = Object.hasOwn(flatLayout, targetPaneId);
      const displayExists = Object.hasOwn(displays, content.id);

      if(targetPaneId === 'root' || !targetPaneExists) {
        const containerPane = createPane(randomWord(4, 10), type, direction, [1], [], 'root', []);
        if(!displayExists) {
          const newDisplayData: DisplayData = {
            id: content.id as UUID,
            paneId: containerPane.id,
            componentName,
            props: content
          }
          addNewDisplay(newDisplayData);
        }

        addPane(containerPane);
        updateLayoutStructure()
        return
      } else {
        /**
         * Target pane is not root. Create the pane for the content
         * check the current displays mapped to the the target plane
         * create a new pane and change the parent ids for the found displays to the newly created pane
         */
        const containerPane = createPane(randomWord(4, 10), type, direction, [1], [], targetPaneId, []);

        // look through the display to see if they are tagged to the targetPaneId
        const displaysForTarget = (Object.values(displays) as DisplayData[]).reduce((output: string[], cv: DisplayData) => {
          if(cv.paneId === targetPaneId) {
            output.push(cv.id);
          }
          return output;
        }, []);

        const newDisplayData: DisplayData = {
          id: content.id as UUID,
          paneId: containerPane.id,
          componentName,
          props: content
        }
        addNewDisplay(newDisplayData);

        if(displaysForTarget.length) {
          const replacementPane = createPane(randomWord(4, 10), type, direction, [1], [], targetPaneId, []);
          flatLayout[targetPaneId].type = 'split';
          addPane(replacementPane);
          displaysForTarget.forEach(item => {
            displays[item].paneId = replacementPane.id;
          })
        }
        addPane(containerPane);
        updateLayoutStructure();
      }
    },
    setFocusedPaneId: (paneId: string) => set({ focusedPaneId: paneId }),
    updateLayoutStructure: () => {
      /**
       * using the flatLayout and displays obj create a new layout obj.
       */
      const {flatLayout, layout, displays} = get();
      const sendableLayout = JSON.parse(JSON.stringify(defaultLayout)) as Pane;
      const newFlat = JSON.parse(JSON.stringify(flatLayout));
      sendableLayout.sizes = [...layout.sizes];

      const root = findNodeById(sendableLayout, 'root') as Pane;
      (Object.values(displays) as [string, any]).forEach((displayItem: DisplayData) => {
        const { id, paneId} = displayItem;
        if(id && newFlat[paneId]) {
          newFlat[paneId].displayContent.push(id)
        }
      });
      
      const newLayout = (Object.entries(newFlat) as [string, any]).reduce((output: Pane, cv: [ruid, Pane]) => {
        const [_, val] = cv;
        const { parentId } = val
        if(parentId === 'root') {
          root.children?.push(val);
        } else {
          newFlat[parentId].children?.push(val);
        }

        return output as Pane;
      }, sendableLayout)

      set({layout: newLayout})
    },
    updateLayoutSizes: (paneId: ruid, newSizes: number[]) => {
      /**
       * using the flatLayout and displays obj create a new layout obj.
       */
      const {flatLayout, layout, updateLayoutStructure} = get();
      if(flatLayout[paneId]) {
        flatLayout[paneId].sizes = newSizes;
      }

      if(paneId === 'root') {
        set({layout: {...layout, sizes: newSizes}})
      }
      updateLayoutStructure();
    },
    updateDisplayContentId: (displayId: ruid, newContent: string) => {
      // console.log('The updateDisplayContentId ', displayId, newContent)
      const {displays, updateLayoutStructure} = get();
      // console.log('The displays ', displays[displayId])
      displays[displayId].props.text = newContent;
      updateLayoutStructure()
    },
    closeDisplay: (displayId: string) => {
      console.log("🚀 ~ withMiddleware ~ displayId:", displayId)
      const { displays, updateLayoutStructure } = get()
      
      const allItems = Object.values(displays).reduce((out: [string, DisplayData][], cv: DisplayData) => {
        if(cv.id != displayId) {
          out.push([cv.id, cv])
        }
        return out;
      }, [] as [string, DisplayData][]);

      set({displays: Object.fromEntries(allItems)})
      // should check it the pane has no display content and no children, the pane should be removed from the layout
      updateLayoutStructure();
    },
  }))
);
