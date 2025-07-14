import { useState } from "react";
import { useLayoutStore } from "./store";

const TextDisplay = ({ contentName, text, displayId }: { contentName: string; text: string; displayId: string }) => {
  // console.log('The text display ', contentName, text, '\n\n')
  const [updatedText, setUpdatedText] = useState(text);
  const updateDisplayContentId = useLayoutStore((state: any) => state.updateDisplayContentId);
  const handleTextChange = (e: React.ChangeEvent<HTMLParagraphElement>) => {
    setUpdatedText(e.target.innerText);
  }
  // const handleTextBlur = (e: React.FocusEvent<HTMLParagraphElement>) => {
  const handleTextBlur = () => {
    console.log("text blur handler")
    updateDisplayContentId(displayId, updatedText);
  }
  return (
    <div className="text-display">
      <h3>{contentName}</h3>
      <p contentEditable={true} onInput={handleTextChange} onBlur={handleTextBlur}>{updatedText}</p>
    </div>
  )
};

export default TextDisplay;
