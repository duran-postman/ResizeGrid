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
    flatLayout: {},
    displays: {} as Record<string, DisplayData>,
    updateLayout: (newLayout: Pane) => set({ layout: newLayout }),
    updateFlatLayout: (newItem: any) => {
      set({
        flatLayout: {...get().flatLayout, [newItem.id]: newItem}
      });
    },
    updateDisplays: (newDisplayItem: DisplayData) => {
      // console.log("🚀 ~ withMiddleware ~ newDisplayItem:", newDisplayItem)
      const state = get();
      set({
        displays: {
          ...state.displays,
          [newDisplayItem.id]: newDisplayItem,
        }
      });
      
    },
    addPane: (targetId: string, newPane: Pane) => {
      set((state: any) => {
        const newLayout = JSON.parse(JSON.stringify(state.layout)) as Pane;
        let target = targetId ? findNodeById(newLayout, targetId) : newLayout;
        if (!target || !Array.isArray(target.children)) {
          target = newLayout;
        }
        target.children.push(newPane);
        target.sizes?.push(DEFAULT_SIZE);

        // flat layout setup
        const newFlat = JSON.parse(JSON.stringify(state.flatLayout));
        if(newFlat[targetId]) {
          newFlat[targetId].children.push(newPane)
        } else {
          newFlat[newPane.id] = newPane
        }
        console.log("🚀 ~ index.ts:72 ~ set ~ newLayout:", newLayout);
        return { layout: newLayout, flatLayout: newFlat};
      })
    },
    // Add focusedPaneId to state
    focusedPaneId: null as string | null,

    // Action to set focused pane
    setFocusedPaneId: (paneId: string) => set({ focusedPaneId: paneId }),
    _openContentInPane: (
      targetPaneId: ruid,
      content: { name: string; text: string },
      componentName: string = ComponentNames.TextDisplay,
      direction: PaneDirection = 'row',
      type: PaneType = 'leaf'
    ) => {
      const {focusedPaneId, updateDisplays, updateFlatLayout, getLayouts} = get();
      // if no paneid and nothing focused create a pane with the direction
      let updateTargetPaneId: ruid = focusedPaneId ?? targetPaneId;
      let createdPane = createPane(randomWord(4,11), type, direction, [], [], updateTargetPaneId);
      
      // create the display content
      const displayId = getId();
      const newDisplay: DisplayData = {
        id: displayId,
        paneId: updateTargetPaneId,
        componentName,
        props: content,
      };
      updateFlatLayout(createdPane);
      updateDisplays(newDisplay);
      getLayouts()
    },
    openContentInPane: (
      paneId: string | undefined,
      content: { name: string; text: string },
      componentName: string = ComponentNames.TextDisplay,
      direction: PaneDirection = 'row',
      type: PaneType = 'leaf'
    ) => {
      const state = get();
      let targetPaneId = paneId || 'root';
      if (state.focusedPaneId) {
        const splitPane = createPane(randomWord(5, 10), 'split', direction, [], [], state.focusedPaneId);
        const childPane = createPane(randomWord(5, 10), 'leaf', direction, [], [], splitPane.id)

        splitPane.children?.push(childPane);
        splitPane.sizes?.push(DEFAULT_SIZE);

        // Insert splitPane under focusedPane
        const layoutCopy = JSON.parse(JSON.stringify(state.layout)) as Pane;
        console.log("🚀 ~ index.ts:122 ~ withMiddleware ~ layoutCopy:", layoutCopy);
        const focusedPane = findNodeById(layoutCopy, state.focusedPaneId);
        if (focusedPane) {
          if (!focusedPane.children) {
            focusedPane.children = [];
            focusedPane.sizes = [];
          }
          focusedPane.children.push(splitPane);
          focusedPane.sizes?.push(DEFAULT_SIZE);
          set({ layout: layoutCopy });
          console.log("🚀 ~ index.ts:136 ~ withMiddleware ~ focusedPane:", focusedPane);
        }

        // targetPaneId = childPaneId; // Place content in child leaf pane
        targetPaneId = childPane.id; // Place content in child leaf pane
      } else {
        const newPane = createPane(randomWord(4,10), 'leaf', direction, [], [], 'root')
        console.log("🚀 ~ index.ts:140 ~ withMiddleware ~ direction:", direction);
        console.log("🚀 ~ index.ts:140 ~ withMiddleware ~ newPane:", newPane);
        state.addPane('', newPane); // Add to root
        targetPaneId = newPane.id;
      }

      const displayId = getId();
      const newDisplay: DisplayData = {
        id: displayId,
        paneId: targetPaneId,
        componentName,
        props: content,
      };

      set({
        displays: {
          ...state.displays,
          [displayId]: newDisplay,
        },
        focusedPaneId: targetPaneId, // Focus new pane
      });

      // console.log('Added content to pane:', targetPaneId, ' content ', content);
      return targetPaneId;
    },
    openDisplayInPane: (
      paneId: string,
      componentName: string,
      props?: Record<string, any>
    ) => {
      set((state: any) => {
        const displayId = getId();
        const newDisplay: DisplayData = {
          id: displayId,
          paneId,
          componentName,
          props,
        };
        return {
          displays: {
            ...state.displays,
            [displayId]: newDisplay,
          },
        };
      })
    },
    closeDisplay: (displayId: string) =>
      set((state: any) => {
        const updatedDisplays = { ...state.displays };
        delete updatedDisplays[displayId];
        return { displays: updatedDisplays };
      }),
    getLayouts: () => {
      const {flatLayout, updateLayout} = get();
      // console.log("🚀 ~ index.ts:192 ~ withMiddleware ~ displays:", displays);
      // console.log("🚀 ~ index.ts:192 ~ withMiddleware ~ flatLayout:", flatLayout);

      const noHome = [];
      const seenSet = new Set();
      const exportObj = {...defaultLayout};
      const buildLayout = Object.entries(flatLayout).reduce((out, cv) => {
        const [_, val] = cv as [string, Pane];
        const {id, parentId, name} = val as Pane;
        // console.log("🚀 ~ index.ts:207 ~ buildLayout ~ id:", id, name, '\n\n');
        if(id === 'root' && !Object.hasOwn(out, 'root')) {
          out = val as Pane;
          // console.log("🚀 ~ index.ts:202 ~ Object.entries ~ val:", val);
        }

        if(parentId === 'root' && !seenSet.has(val.id)) {
          seenSet.add(val.id);
          out.children?.push(val as Pane);
          console.log("VID ", val.id, " out.children len ", out.children?.length)
        }

        return out;
      }, exportObj);
      console.log("🚀 ~ index.ts:207 ~ buildLayout ~ buildLayout:", buildLayout);
      // const layoutRays = Object.entries(layout);
      // console.log("🚀 ~ withMiddleware ~ layoutRays:", layoutRays)
      // return buildLayout
      updateLayout(buildLayout);
    }
  }))
);
