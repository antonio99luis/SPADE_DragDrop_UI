// src/config/nodeTypes.js
import AgentNode from "../components/nodes/agent/AgentNode";
import AgentNodeBDI from "../components/nodes/agent/AgentNodeBDI";
import AgentNodeLLM from "../components/nodes/agent/AgentNodeLLM";
import BehaviourNode from "../components/nodes/behaviour/BehaviourNode";
import TemplateNode from "../components/nodes/template/TemplateNode";
import StickyNoteNode from "../components/nodes/sticky-note/StickyNoteNode";
import MessageNode from "../components/nodes/message/MessageNode";
export const createNodeTypes = (handleModalStateChange) => ({
  agent: (props) => (
    <AgentNode 
      {...props} 
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange,
        kind: 'standard'
      }}
    />
  ),
  agentBDI: (props) => (
    <AgentNodeBDI
      {...props}
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange,
      }}
    />
  ),
  agentLLM: (props) => (
    <AgentNodeLLM
      {...props}
      data={{
        ...props.data,
        onModalStateChange: handleModalStateChange,
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
  message: (props) => (
    <MessageNode
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