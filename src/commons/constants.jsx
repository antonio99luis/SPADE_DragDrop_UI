// Tipos de nodos
export const NODE_TYPES = {
  AGENT: "agent",
  BEHAVIOUR: "behaviour",
  TEMPLATE: "template",
  STICKY_NOTE: "stickyNote",
};

// Tipos de bordes
export const EDGE_TYPES = {
  FRIENDSHIP: "friendship",
  AGENT_BEHAVIOUR: "agentBehaviour",
  INHERITANCE: "inheritance",
  TEMPLATE: "template",
};

// Claves de manejo (sourceHandle y targetHandle)
export const HANDLE_KEYS = {
  FRIENDSHIP_SOURCE: "friendship-source",
  FRIENDSHIP_TARGET: "friendship-target",
  BEHAVIOUR: "behaviour",
  INHERITANCE_SOURCE: "inheritance-source",
  INHERITANCE_TARGET: "inheritance-target",
  TEMPLATE: "template",
};


// Otros valores
export const DEFAULTS = {
  HOST: "localhost",
  BEHAVIOUR_TYPE: "CyclicBehaviour",
  GENERATED_FILE_NAME: "spade_code.py",
  PROJECT_FILE_NAME: "spade-project",
};