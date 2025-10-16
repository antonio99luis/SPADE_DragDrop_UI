import React, { useState, useRef, useEffect } from "react";
import BaseNode from "../nodes/shared/NodeBase";
import agentSVG from "../../assets/nodeSVG/agent.svg";
import behaviourSVG from "../../assets/nodeSVG/behaviour.svg";
import templateSVG from "../../assets/nodeSVG/template.svg";
import messageSVG from "../../assets/nodeSVG/message.svg";
import stickySVG from "../../assets/nodeSVG/stickynote.svg";
import Fab from "@mui/material/Fab";
import AddIcon from "@mui/icons-material/Add";
import RemoveIcon from "@mui/icons-material/Remove"; // Import the minus icon
import TextField from "@mui/material/TextField";

import "./NodeToolbar.css";

const SPADE_NODES = [
  { type: "agent", label: "Agent", image: agentSVG },
  { type: "agentBDI", label: "Agent (BDI)", image: agentSVG },
  { type: "agentLLM", label: "Agent (LLM)", image: agentSVG },
  { type: "behaviour", label: "Behaviour", image: behaviourSVG },
  { type: "template", label: "Template", image: templateSVG },
  { type: "message", label: "Message", image: messageSVG },
];

export default function NodeToolbar({
  onDragStart,
  onGenerateSpade,
  onSave,
  onLoad,
  modalBlocked = false
}) {
  const [open, setOpen] = useState(false);
  const [search, setSearch] = useState("");
  const menuRef = useRef();

  // Close menu on outside click
  useEffect(() => {
    if (!open) return;
    function handleClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClick);
    return () => document.removeEventListener("mousedown", handleClick);
  }, [open]);

  // Filter nodes
  const filterNodes = (nodes) =>
    nodes.filter((node) =>
      node.label.toLowerCase().includes(search.toLowerCase())
    );

  // Prevent opening if modal is active
  const handleButtonClick = (e) => {
    e.stopPropagation();
    if (modalBlocked) return; // Don't open if modal is blocking
    setOpen(v => !v);
  };

  return (
    <div className="dropdown-node-menu-container">
      <Fab
        color="primary"
        aria-label={open ? "close" : "add"}
        onClick={handleButtonClick}
        disabled={modalBlocked}
        title={modalBlocked ? "Close modal first" : "Add Node"}
      >
        {open ? <RemoveIcon /> : <AddIcon />}
      </Fab>
      {open && (
        <div className="dropdown-node-menu" ref={menuRef}>
          <div className="dropdown-node-menu-header">
            <div className="dropdown-node-menu-title">Add Nodes</div>
            <TextField
              className="dropdown-node-menu-search"
              label="Search nodes"
              size="small"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>

          <div className="dropdown-node-menu-content">
            <div className="dropdown-node-menu-section">
              <div className="dropdown-node-menu-section-title">SPADE nodes</div>
              {filterNodes(SPADE_NODES).length === 0 && (
                <div className="dropdown-node-menu-empty">No results</div>
              )}
              {filterNodes(SPADE_NODES).map((node) => (
                <div
                  key={node.type}
                  className="dropdown-node-menu-draggable"
                  draggable
                  onDragStart={(e) => onDragStart(e, node.type)}
                >
                  <BaseNode image={node.image} title={node.label} />
                </div>
              ))}
              <div
                key={"stickyNote"}
                className="dropdown-node-menu-draggable-sticky"
                draggable
                onDragStart={(e) => onDragStart(e, "stickyNote")}
              >
                <BaseNode image={stickySVG} title={"Sticky Note"} />
              </div>
            </div>
            <div className="dropdown-node-menu-buttons">
              <button className="generate-spade-btn" onClick={onGenerateSpade}>
                Generate SPADE code
              </button>
              <button className="save-load-btn save-btn" onClick={onSave}>
                💾 Save Project
              </button>
              <button className="save-load-btn load-btn" onClick={onLoad}>
                📁 Load Project
              </button>
            </div>
            <div className="dropdown-node-menu-section">
            </div>
          </div>
        </div>
      )}
    </div>
  );
}