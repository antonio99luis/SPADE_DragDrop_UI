import React, { useState, useEffect, useRef } from "react";
import { Handle, Position } from "@xyflow/react";
import "./StickyNoteNode.css";

export default function StickyNoteNode({ data, selected, id }) {
  const [text, setText] = useState(data.text || "");
  const textareaRef = useRef(null);

  // Auto-resize textarea
  useEffect(() => {
    const textarea = textareaRef.current;
    if (textarea) {
      // Reset height to auto to get the scroll height
      textarea.style.height = 'auto';
      // Set height to scroll height to fit content
      textarea.style.height = `${Math.max(64, textarea.scrollHeight)}px`;
    }
  }, [text]);

  // Optional: update parent state if needed
  const handleChange = (e) => {
    setText(e.target.value);
    if (data.onChange) {
      data.onChange(id, "text", e.target.value);
    }
  };

  return (
    <div className={`sticky-note-node${selected ? " sticky-note-node-selected" : ""}`}>
      <textarea
        ref={textareaRef}
        className="sticky-note-textarea"
        value={text}
        onChange={handleChange}
        placeholder="Write your note..."
        style={{ resize: "none" }}
      />
    </div>
  );
}