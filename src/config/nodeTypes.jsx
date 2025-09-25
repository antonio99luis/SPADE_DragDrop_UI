// src/config/nodeTypes.js
import AgentNode from "../components/nodes/agent/AgentNode";
import BehaviourNode from "../components/nodes/behaviour/BehaviourNode";
import TemplateNode from "../components/nodes/template/TemplateNode";
import StickyNoteNode from "../components/nodes/sticky-note/StickyNoteNode";

export const createNodeTypes = (handleModalStateChange) => ({
  agent: (props) => (
    <AgentNode 
      {...props} 
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange
      }}
    />
  ),
  behaviour: (props) => (
    <BehaviourNode 
      {...props} 
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange
      }}
    />
  ),
  template: (props) => (
    <TemplateNode 
      {...props} 
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange
      }}
    />
  ),
  stickyNote: (props) => (
    <StickyNoteNode 
      {...props} 
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange
      }}
    />
  ),
});