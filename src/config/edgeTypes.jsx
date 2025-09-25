// src/config/edgeTypes.js
import FriendshipEdge from "../components/edges/FriendshipEdge";
import AgentBehaviourEdge from "../components/edges/AgentBehaviourEdge";
import InheritanceEdge from "../components/edges/InheritanceEdge";
import TemplateEdge from "../components/edges/TemplateEdge";

export const edgeTypes = {
  friendship: FriendshipEdge,
  agentBehaviour: AgentBehaviourEdge,
  inheritance: InheritanceEdge,
  template: TemplateEdge,
};