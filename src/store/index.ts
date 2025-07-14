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
    _stableopenContentInPane: (
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
      const {flatLayout, addPane, addNewDisplay, updateLayoutStructure} = get();
      const targetPaneExists = Object.hasOwn(flatLayout, targetPaneId);
      const createdPane = createPane(randomWord(4, 10), type, direction, [1], [], targetPaneExists ? targetPaneId : 'root');

      const newDisplayData: DisplayData = {
        id: content.id as UUID,
        paneId: createdPane.id,
        componentName,
        props: content
      }
      createdPane.displayContent?.push(newDisplayData.id);
      //set parent pane type to split
      // changePaneType(targetPaneId, 'split');
      addNewDisplay(newDisplayData);
      addPane(createdPane);
      updateLayoutStructure();
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
      // create the content if necessary

      const displayExists = Object.hasOwn(displays, content.id);

      if(targetPaneId === 'root' || !targetPaneExists) {
        // create a new pane
        // create a new display data 
        // add content to new pane as display content
        // add the new pane to the flat layout
        // add the content to the displays obj
        const containerPane = createPane(randomWord(4, 10), type, direction, [1], [], 'root', [content.id as UUID]);
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
        // console.log('The root pane is being opened ', content);
        return
      } else {
        // // console.log('a nested pane is now required time to do some work ', targetPaneId);
        // // console.log('The display content exists ', displayExists);
        // // console.log('The content ', content);
        // // console.log('target pane exists? ', targetPaneExists);
        const containerPane = createPane(randomWord(4, 10), type, direction, [1], [], targetPaneId, [content.id as UUID]);

        if(!displayExists) {
          const newDisplayData: DisplayData = {
            id: content.id as UUID,
            paneId: containerPane.id,
            componentName,
            props: content
          }
          addNewDisplay(newDisplayData);
        }

        if(targetPaneExists) {
          // if target pane exists check if it has display content.
          const targetPane = flatLayout[targetPaneId];
          if(targetPane.displayContent?.length > 0) {
            // if it does, create a new pane. Add the content to that pane. Add it as a child to the target pane.
            // create a new pane for the new content, and add it as a child to the target pane.
            const movableContent = createPane(randomWord(4, 10), targetPane.type, targetPane.direction, targetPane.sizes, [], targetPane.id, [...targetPane.displayContent]);
            targetPane.displayContent.forEach((displayId: UUID) => {
              const displayData = displays[displayId];
              if(displayData) {
                displayData.paneId = movableContent.id;
              }
            });
            // change the target pane type to split
            // clear the display content of the target pane
            targetPane.displayContent = [];
            targetPane.type = 'split';
            targetPane.children?.push(movableContent);
            addNewDisplay(movableContent);
            addPane(movableContent);
          }
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
      // setup all the display content
      (Object.values(displays) as [string, any]).forEach((displayItem: DisplayData) => {
        console.log("🚀 ~ Object.values ~ displayItem:", displayItem)
        const { id, paneId} = displayItem;
        if(newFlat[paneId] && !newFlat[paneId].children.includes(id)) {
          newFlat[paneId].children.push(id);
        }
      });

      console.log("🚀 ~ updateLayoutStructure ~ newFlat:", newFlat)

      // const newLayout = (Object.entries(newFlat) as [string, any]).reduce((output: Pane, cv: [ruid, Pane]) => {
      //   const [key, val] = cv
      //   // if its already in the output then exit this itteration
      //   if(findNodeById(output, val.id)) {
      //     return output;
      //   }
      //   const { parentId } = val
      //   if(parentId === 'root') {
      //     console.log("🚀 ~ newLayout ~ parentId:", parentId)
      //     root.children?.push(val)
      //   } else {
      //     console.log('The parent ID is another item in the list so place this item in that list of children')
      //     newFlat[key].children?.push(val);
      //   }
      //   // // console.log('current value ', cv);
      //   // // console.log('output ', output);

      //   return output as Pane;
      // }, sendableLayout)
      // console.log('\n\nThe final form ', newLayout);
      
      // set({layout: newLayout})
    },
    updateLayoutSizes: (paneId: ruid, newSizes: number[]) => {
      /**
       * using the flatLayout and displays obj create a new layout obj.
       */
      const {flatLayout, layout, updateLayoutStructure} = get();
      if(flatLayout[paneId]) {
        flatLayout[paneId].sizes = newSizes;
      }
      // console.log('The updated layout ', paneId, '\n new Sizes ', newSizes)
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
    closeDisplay: () => {},
  }))
);
