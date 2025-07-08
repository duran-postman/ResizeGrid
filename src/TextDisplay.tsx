const TextDisplay = ({ name, text }: { name: string; text: string }) => (
  <div className="text-display">
    <h3>{name}</h3>
    <p>{text}</p>
  </div>
);

export default TextDisplay;
