// src/config/nodeConfigs.js
import { Position } from "@xyflow/react";
import agentSVG from "../assets/nodeSVG/agent.svg";
import behaviourSVG from "../assets/nodeSVG/behaviour.svg";
import templateSVG from "../assets/nodeSVG/template.svg";
export const AGENT_CONFIG = {
  requiredFields: ['class', 'name', 'host', 'password'],
  icon: agentSVG,
  title: "Agent",
  subtitle: "Agent Configuration",
  handles: [
    {
      type: "target",
      position: Position.Left,
      id: "friendship-target",
      isConnectable: true,
      title: "friendship (target)"
    },
    {
      type: "target",
      position: Position.Left,
      id: "inheritance-target",
      isConnectable: true,
      title: "inherits from"
    },
    {
      type: "source",
      position: Position.Right,
      id: "friendship-source",
      title: "friendship (source)"
    },
    {
      type: "source",
      position: Position.Right,
      id: "behaviour",
      isConnectable: true,
      title: "behaviour"
    },
    {
      type: "source",
      position: Position.Right,
      id: "inheritance-source",
      isConnectable: true,
      title: "inherited by"
    }
  ]
};

export const BEHAVIOUR_CONFIG = {
  requiredFields: ['class', 'type'],
  icon: behaviourSVG,
  title: "Behaviour",
  subtitle: "Behaviour Configuration",
  handles: [
    {
      type: "target",
      position: Position.Left,
      id: "behaviour",
      isConnectable: true,
      title: "used by agent"
    },
    {
      type: "source",
      position: Position.Right,
      id: "template",
      isConnectable: true,
      title: "uses template"
    }
  ]
};

export const BEHAVIOUR_TYPES = [
  'CyclicBehaviour',
  'OneShotBehaviour',
  'TimeoutBehaviour',
  'PeriodicBehaviour',
];

export const DEFAULT_CONFIG_CODE = {
  CyclicBehaviour: `class MyCyclicBehaviour(CyclicBehaviour):
    async def run(self):
        # Write your cyclic behaviour code here
        pass
`,
  OneShotBehaviour: `class MyOneShotBehaviour(OneShotBehaviour):
    async def run(self):
        # Write your one-shot behaviour code here
        pass
`,
  TimeoutBehaviour: `class MyTimeoutBehaviour(TimeoutBehaviour):
    async def run(self):
        # Write your timeout behaviour code here
        pass
`,
  PeriodicBehaviour: `class MyPeriodicBehaviour(PeriodicBehaviour):
    async def run(self):
        # Write your periodic behaviour code here
        pass
`,
};

export const TEMPLATE_CONFIG = {
  requiredFields: ['sender', 'to', 'body'],
  icon: templateSVG,
  title: "Template",
  subtitle: "Message Template Configuration",
  handles: [
    {
      type: "target",
      position: Position.Left,
      id: "template",
      isConnectable: true,
      title: "used by behaviour"
    }
  ]
};

export const DEFAULT_METADATA = "{}";