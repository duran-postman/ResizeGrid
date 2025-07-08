type PropTypeItem = {
  onDragStart: any,
  direction: any
}

const Resizer = ({ onDragStart, direction }: PropTypeItem) => (
  <div
    className={`resizer ${direction === 'row' ? 'vertical' : 'horizontal'}`}
    onMouseDown={onDragStart}
  />
);

export default Resizer;
