const TextDisplay = ({ contentName, text }: { contentName: string; text: string }) => {
  console.log('The text display ', contentName, text, '\n\n')
  return (
    <div className="text-display">
      <h3>{contentName}</h3>
      <p>{text}</p>
    </div>
  )
};

export default TextDisplay;
