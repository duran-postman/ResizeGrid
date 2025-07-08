import './App.css'
import ContentSelector from './ContentSelector';
import SplitContainer from './SplitContainer';
import { useLayoutStore } from './store';

function App() {
  const {layout, getLayouts} = useLayoutStore((state: any) => state);
  return <>
  <ContentSelector />
  <SplitContainer node={layout} />;
  </>
}

export default App
