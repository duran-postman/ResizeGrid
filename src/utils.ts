import TextDisplay from './TextDisplay';

export const DEFAULT_SIZE = 1;
type Brand<T, B> = T & { __brand: B };

export type DisplayData = {
  id: string;
  paneId: string;
  componentName: string;
  props?: Record<string, any>;
};

type UUID = Brand<string, 'uuid'>;
export const getId = () => crypto.randomUUID() as UUID;

export function normalizeSizes(sizes: number[] = [], count: number) {
  const filled = Array.from(
    { length: count },
    (_, i) => sizes[i] ?? DEFAULT_SIZE
  );
  const total = filled.reduce((a, b) => a + b, 0);
  return filled.map((s) => s / total);
}

export type PaneType = 'split' | 'leaf' | 'content';
export type PaneDirection = 'row' | 'column';
export type ruid = UUID | 'root';
export type Pane = {
  id: ruid;
  name?: string;
  type: PaneType;
  direction: PaneDirection;
  parentId: ruid;
  sizes?: number[];
  children?: Pane[];
};

export type FlatPaneContainer = {
  root: Pane;
} & Record<UUID, Pane>;

export const createPane = (
  name: string,
  type: PaneType = 'leaf',
  direction: PaneDirection = 'row',
  sizes: number[] | null = null,
  children: Pane[] | null = null,
  parentId: ruid = 'root'
) => {
  const paneItem: Pane = {
    id: getId(),
    name,
    type,
    direction,
    parentId,
    ...(sizes != null && { sizes }),
    ...(children != null && { children }),
  };

  return paneItem
};

// export const defaultLayout:Pane = {
//   id: 'root',
//   name: 'root',
//   type: 'split',
//   direction: 'row',
//   sizes: [1, 1, 1],
//   children: [
//     createPane('pane-1', 'leaf'),
//     createPane('pane-2', 'leaf'),
//     createPane(
//       'split-2',
//       'split',
//       'column',
//       [1, 1],
//       [createPane('pane-3', 'leaf'), createPane('pane-4', 'leaf')]
//     ),
//   ],
// };
export const defaultLayout:Pane = {
  id: 'root',
  name: 'root',
  type: 'split',
  direction: 'row',
  sizes: [],
  children: [],
  parentId: 'root'
};

export function findNodeById(node: any, id: string): any {
  if (node.id === id) return node;
  if (node.children) {
    for (const child of node.children) {
      const found = findNodeById(child, id);
      if (found) return found;
    }
  }
  return null;
}

export enum ComponentNames {
  TextDisplay = 'TextDisplay'
}

export type ComponentNamesKeys = keyof typeof ComponentNames;

export const componentRegistry: Record<string, React.ComponentType<any>> = {
  TextDisplay,
};

export const randomWord = (minLength = 3, maxLength = 8, capitalize = false) => {
  const vowels = "aeiou";
  const consonants = "bcdfghjklmnpqrstvwxyz";

  const length = Math.floor(Math.random() * (maxLength - minLength + 1)) + minLength;
  let word = "";

  for (let i = 0; i < length; i++) {
    const letters = i % 2 === 0 ? consonants : vowels;
    word += letters[Math.floor(Math.random() * letters.length)];
  }

  if(capitalize)
    return word.charAt(0).toUpperCase() + word.slice(1);

  return word;
}
