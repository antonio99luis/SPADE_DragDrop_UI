import React, { useState, useRef, useEffect } from "react";
import BaseNode from "../nodes/shared/NodeBase";
import agentSVG from "../../assets/nodeSVG/agent.svg";
import behaviourSVG from "../../assets/nodeSVG/behaviour.svg";
import templateSVG from "../../assets/nodeSVG/template.svg";
import messageSVG from "../../assets/nodeSVG/message.svg";
import guardrailSVG from "../../assets/nodeSVG/guardrail.svg";
import providerSVG from "../../assets/nodeSVG/provider.svg";
import routingSVG from "../../assets/nodeSVG/routing.svg";
import toolSVG from "../../assets/nodeSVG/tool.svg";
import stickySVG from "../../assets/nodeSVG/stickynote.svg";
import "./NodeToolbar.css";

const SPADE_NODES = [
  { type: "agent", label: "Agent", image: agentSVG },
  { type: "behaviour", label: "Behaviour", image: behaviourSVG },
  { type: "template", label: "Template", image: templateSVG },
  { type: "message", label: "Message", image: messageSVG },
];

const PLACEHOLDER_NODES = [
  { type: "guardrail", label: "Guardrail", image: guardrailSVG },
  { type: "provider", label: "Provider", image: providerSVG },
  { type: "routing", label: "Routing", image: routingSVG },
  { type: "tool", label: "Tool", image: toolSVG },
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
      <button
        className={`dropdown-node-menu-btn${modalBlocked ? ' disabled' : ''}`}
        onClick={handleButtonClick}
        title={modalBlocked ? "Close modal first" : "Add Node"}
        disabled={modalBlocked}
      >
        +
      </button>
      {open && (
        <div className="dropdown-node-menu" ref={menuRef}>
          <div className="dropdown-node-menu-header">
            <div className="dropdown-node-menu-title">Add Nodes</div>
            <input
              className="dropdown-node-menu-search"
              placeholder="Search nodes..."
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
              <div className="dropdown-node-menu-section-title">SPADE LLM nodes</div>
              <div className="dropdown-node-menu-empty">PLACEHOLDERS
              {filterNodes(PLACEHOLDER_NODES).map((node) => (
                <div
                  key={node.type}
                  className="dropdown-node-menu-draggable"
                >
                  <BaseNode image={node.image} title={node.label} />
                </div>
              ))}

              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}