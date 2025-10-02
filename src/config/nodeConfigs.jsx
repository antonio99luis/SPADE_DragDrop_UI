// src/config/nodeConfigs.js
import { Position } from "@xyflow/react";
import agentSVG from "../assets/nodeSVG/agent.svg";
import behaviourSVG from "../assets/nodeSVG/behaviour.svg";
import templateSVG from "../assets/nodeSVG/template.svg";
import messageSVG from "../assets/nodeSVG/message.svg";
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
      id: "message",
      isConnectable: true,
      title: "uses message"
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
  'FSMBehavior'
];

export const DEFAULT_CONFIG_CODE = {
  CyclicBehaviour: `class MyCyclicBehaviour(CyclicBehaviour):
    async def  on_start(self):
        # Write your cyclic behaviour start code here
        pass
    async def run(self):
        # Write your cyclic behaviour code here
        pass
    async def on_end(self):
        # Write your cyclic behaviour end code here
        pass
`,
  OneShotBehaviour: `class MyOneShotBehaviour(OneShotBehaviour):
    async def on_start(self):
        # Write your one-shot behaviour start code here
        pass
    async def run(self):
        # Write your one-shot behaviour code here
        pass
    async def on_end(self):
        # Write your one-shot behaviour end code here
        pass
`,
  TimeoutBehaviour: `class MyTimeoutBehaviour(TimeoutBehaviour):
    async def on_start(self):
        # Write your timeout behaviour start code here
        pass
    async def run(self):
        # Write your timeout behaviour code here
        pass
    async def on_end(self):
        # Write your timeout behaviour end code here
        pass
`,
  PeriodicBehaviour: `class MyPeriodicBehaviour(PeriodicBehaviour):
    async def on_start(self):
        # Write your periodic behaviour start code here
        pass
    async def run(self):
        # Write your periodic behaviour code here
        pass
    async def on_end(self):
        # Write your periodic behaviour end code here
        pass
`,
FSMBehavior: `class ExampleFSMBehaviour(FSMBehaviour):
    STATE_ONE = "STATE_ONE"
    STATE_TWO = "STATE_TWO"
    STATE_THREE = "STATE_THREE"

    async def on_start(self):
        # Write your FSM behaviour start code here
        pass

    async def on_end(self):
        # Write your FSM behaviour end code here
        pass

    def __init__(self):
        super().__init__()

        # Define states *inside* the behaviour
        class StateOne(State):
            async def run(inner_self):
                # Write your state one code here
                pass

        class StateTwo(State):
            async def run(inner_self):
                # Write your state two code here
                pass

        class StateThree(State):
            async def run(inner_self):
                # Write your state three code here

                # No next state = final
                pass

        # Register states and transitions
        self.add_state(name=STATE_ONE, state=StateOne(), initial=True)
        self.add_state(name=STATE_TWO, state=StateTwo())
        self.add_state(name=STATE_THREE, state=StateThree())

        self.add_transition(source=STATE_ONE, dest=STATE_TWO)
        self.add_transition(source=STATE_TWO, dest=STATE_THREE)
`
};

export const TEMPLATE_CONFIG = {
  requiredFields: [],
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

export const MESSAGE_CONFIG = {
  requiredFields: [],
  icon: messageSVG,
  title: "Message",
  subtitle: "Message Configuration",
  handles: [
    {
      type: "target",
      position: Position.Left,
      id: "message",
      isConnectable: true,
      title: "used by behaviour"
    }
  ]
};


export const DEFAULT_METADATA = "{}";