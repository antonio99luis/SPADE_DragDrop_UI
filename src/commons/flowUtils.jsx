import { NODE_TYPES, HANDLE_KEYS, EDGE_TYPES,DEFAULTS } from "./constants";

/**
 * Gets the next available number for a node type and class prefix.
 * @param {Array} nodes - List of nodes.
 * @param {string} nodeType - Node type (e.g., NODE_TYPES.AGENT).
 * @param {string} classPrefix - Class prefix (e.g., "MyAgent").
 * @returns {number} The next available number.
 */
export function getNextNodeNumber(nodes, nodeType, classPrefix) {
  const usedNumbers = nodes
    .filter((n) => n.type === nodeType)
    .map((n) => {
      const match = (n.data.class || "").match(new RegExp(`^${classPrefix}(\\d+)$`));
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  for (let i = 1; i <= usedNumbers.length + 1; i++) {
    if (!usedNumbers.includes(i)) return i;
  }
  return 1;
}

// Helper: consider all agent kinds uniformly
export const isAgentType = (type) => (
  type === NODE_TYPES.AGENT || type === NODE_TYPES.AGENT_BDI || type === NODE_TYPES.AGENT_LLM
);

// Next agent number across all agent kinds (standard, BDI, LLM)
export const getNextAgentNumber = (nodes) => {
  const usedNumbers = nodes
    .filter((n) => isAgentType(n.type))
    .map((n) => {
      const match = (n.data.class || "").match(/^MyAgent(\d+)$/);
      return match ? parseInt(match[1], 10) : null;
    })
    .filter((n) => n !== null)
    .sort((a, b) => a - b);

  for (let i = 1; i <= usedNumbers.length + 1; i++) {
    if (!usedNumbers.includes(i)) return i;
  }
  return 1;
};

export const getNextBehaviourNumber = (nodes) =>
  getNextNodeNumber(nodes, NODE_TYPES.BEHAVIOUR, "MyBehaviour");


/**
 * Validates if a connection between two nodes is valid and returns the corresponding edge type.
 * 
 * This function verifies if it's possible to create a connection between two nodes based on:
 * - Node types (source and target)
 * - Specific handles used
 * - Uniqueness constraints for certain connection types
 * 
 * @param {string} source - ID of the source node for the connection
 * @param {string} target - ID of the target node for the connection
 * @param {string} sourceHandle - ID of the source node handle (e.g: HANDLE_KEYS.FRIENDSHIP_SOURCE)
 * @param {string} targetHandle - ID of the target node handle (e.g: HANDLE_KEYS.FRIENDSHIP_TARGET)
 * @param {Array} nodes - Array of current nodes in the flow
 * @param {Array} edges - Array of current edges in the flow
 * 
 * @returns {string|false} - Returns the edge type (EDGE_TYPES.*) if the connection is valid, false otherwise
 **/
export const checkConnectionType = (nodes, edges, source, target, sourceHandle, targetHandle) => {
  const sourceNode = nodes.find((n) => n.id === source);
  const targetNode = nodes.find((n) => n.id === target);
  
  if (!sourceNode || !targetNode) return false;

  // Friendship: agent to agent
  if (
    isAgentType(sourceNode.type) &&
    isAgentType(targetNode.type) &&
    sourceHandle === HANDLE_KEYS.FRIENDSHIP_SOURCE &&
    targetHandle === HANDLE_KEYS.FRIENDSHIP_TARGET &&
    source !== target
  ) {
    return EDGE_TYPES.FRIENDSHIP;
  }
  
  // AgentBehaviour: agent to behaviour
  if (
    isAgentType(sourceNode.type) &&
    targetNode.type === NODE_TYPES.BEHAVIOUR &&
    sourceHandle === HANDLE_KEYS.BEHAVIOUR &&
    targetHandle === HANDLE_KEYS.BEHAVIOUR
  ) {
    return EDGE_TYPES.AGENT_BEHAVIOUR;
  }
  
  // Inheritance: agent to agent (with uniqueness check)
  if (
    isAgentType(sourceNode.type) &&
    isAgentType(targetNode.type) &&
    sourceHandle === HANDLE_KEYS.INHERITANCE_SOURCE &&
    targetHandle === HANDLE_KEYS.INHERITANCE_TARGET
  ) {
    const alreadyHasInheritance = edges.some(
      (e) =>
        e.source === source &&
        e.sourceHandle === HANDLE_KEYS.INHERITANCE_SOURCE &&
        e.type === EDGE_TYPES.INHERITANCE
    );
    return !alreadyHasInheritance ? EDGE_TYPES.INHERITANCE : false;
  }
  
  // Template: behaviour to template (with uniqueness check)
  if (
    sourceNode.type === NODE_TYPES.BEHAVIOUR &&
    targetNode.type === NODE_TYPES.TEMPLATE &&
    sourceHandle === HANDLE_KEYS.TEMPLATE &&
    targetHandle === HANDLE_KEYS.TEMPLATE
  ) {
    const alreadyHasTemplate = edges.some(
      (e) =>
        e.source === source &&
        e.sourceHandle === HANDLE_KEYS.TEMPLATE &&
        e.type === EDGE_TYPES.TEMPLATE
    );
    return !alreadyHasTemplate ? EDGE_TYPES.TEMPLATE : false;
  }

  if (
    sourceNode.type === NODE_TYPES.BEHAVIOUR &&
    targetNode.type === NODE_TYPES.MESSAGE &&
    sourceHandle === HANDLE_KEYS.MESSAGE &&
    targetHandle === HANDLE_KEYS.MESSAGE
  )
    return EDGE_TYPES.MESSAGE;
  
  return false;
};

const nextAgent = (baseData, nextAgentNum) => {
  return {
    ...baseData,
    class: `MyAgent${nextAgentNum}`,
    name: `agent${nextAgentNum}`,
    host: DEFAULTS.HOST,
    kind: 'standard',
    // BDI defaults
    beliefs: [],
    bdiProgram: '',
    bdiFunctions: [],
    title: "Agent",
  };
};

const nextAgentBDI = (baseData, nextAgentNum) => {
  const a = nextAgent(baseData, nextAgentNum);
  return {
    ...a,
    kind: 'bdi',
  };
};

const nextAgentLLM = (baseData, nextAgentNum) => {
  const a = nextAgent(baseData, nextAgentNum);
  return {
    ...a,
    kind: 'llm',
    llmPrompt: '',
  };
};

const nextBehaviour = (baseData, nextBehaviourNum) => {
  return {
    ...baseData,
          class: `MyBehaviour${nextBehaviourNum}`,
          type: DEFAULTS.BEHAVIOUR_TYPE,
          period: "",
          start_at: "",
  };
};

const nextTemplate = (baseData) => {
 return {
          ...baseData,
          sender: "",
          to: "",
          body: "",
          thread: "",
          metadataCode: "{}",
        }; 
      }

const nextMessage = (baseData) => {
 return {
          ...baseData,
          sender: "",
          to: "",
          body: "",
          thread: ""
        }; 
      }
const nextStickyNote = (baseData) => {
 return {
          ...baseData,
          text: "",
        }; 
      }

export const createNodeData = (type, nodes, handleNodeDataChange, handleModalStateChange) => {
    const baseData = {
      onChange: handleNodeDataChange,
      onModalStateChange: handleModalStateChange,
    };

    switch (type) {
      case NODE_TYPES.AGENT:
        return nextAgent(baseData, getNextAgentNumber(nodes));
      case NODE_TYPES.AGENT_BDI:
        return nextAgentBDI(baseData, getNextAgentNumber(nodes));
      case NODE_TYPES.AGENT_LLM:
        return nextAgentLLM(baseData, getNextAgentNumber(nodes));
      
      case NODE_TYPES.BEHAVIOUR:
        return nextBehaviour(baseData, getNextBehaviourNumber(nodes));
      
      case NODE_TYPES.TEMPLATE:
        return nextTemplate(baseData);

      case NODE_TYPES.MESSAGE:
        return nextMessage(baseData);
      
      case NODE_TYPES.STICKY_NOTE:
        return nextStickyNote(baseData);
      
      default:
        return baseData;
    }
};