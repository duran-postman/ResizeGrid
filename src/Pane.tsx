
type PropTypeItem = {
  id: any,
}

const Pane = ({ id }: PropTypeItem) => {
  return <div className="pane">Pane: {id}</div>;
};

export default Pane;
