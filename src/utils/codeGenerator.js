export const generateSpadeCode = (nodes, edges) => {
    
    // Security check: Agent class names must be unique, Behaviour class names must be unique
    const agentClassNames = nodes
      .filter((n) => n.type === "agent")
      .map((n) => (n.data.class || "").trim())
      .filter(Boolean);
    const agentNames = nodes
      .filter((n) => n.type === "agent")
      .map((n) => (n.data.name || "").trim())
      .filter(Boolean);
    const behaviourClassNames = nodes
      .filter((n) => n.type === "behaviour")
      .map((n) => (n.data.class || "").trim())
      .filter(Boolean);

    const hasDuplicate = (arr) => new Set(arr).size !== arr.length;

    if (hasDuplicate(agentClassNames)) {
      alert(
        "ERROR generating code:\n\tEach Agent node must have a unique Class name."
      );
      return;
    }
    if (hasDuplicate(agentNames)) {
      alert(
        "ERROR generating code:\n\tEach Agent node must have a unique Name."
      );
      return;
    }
    if (hasDuplicate(behaviourClassNames)) {
      alert(
        "ERROR generating code:\n\tEach Behaviour node must have a unique Class name."
      );
      return;
    }

    // Helper functions
    const getAgentJid = (agent) => {
      const name = agent.data.name || "myAgent";
      const host = agent.data.host || "localhost";
      return `${name}@${host}`;
    };

    const generateBehaviourCode = (behaviour) => {
      const behType = behaviour.data.type;
      const behName = behaviour.data.class || `My${behType}`;
      const behCode = behaviour.data.configCode?.[behType] || 
        `class ${behName}(${behType}):\n    async def run(self):\n        pass\n`;
      return { behName, behCode };
    };

    const generateAgentCode = (agent, behaviours, behaviourNames, friendsJids) => {
      const agentName = agent.data.name || "Agent";
      const auxClass = agent.data.class || "MyAgent";
      let agentClass = `class ${auxClass}(Agent):\n`;
      agentClass += "    async def setup(self):\n";

      // Presence subscriptions
      console.log(friendsJids)
      if (friendsJids)
        friendsJids.forEach((friendJid) => {
          agentClass += `        await self.presence.subscribe('${friendJid}')\n`;
        });

      // Add behaviours
      behaviours.forEach((behName) => {
        agentClass += `        self.add_behaviour(${behName}())\n`;
      });

      // User setup code
      const setupCode = agent.data.setupCode || "";
      if (setupCode) {
        agentClass += setupCode
          .split("\n")
          .map((line) => `        ${line}`)
          .join("\n") + "\n";
      } else {
        agentClass += "        pass\n";
      }

      return agentClass;
    };

    // Separate agents and behaviours
    const agents = nodes.filter((n) => n.type === "agent");
    const behaviours = nodes.filter((n) => n.type === "behaviour");

    // Map behaviour node id to index for naming
    const behaviourNames = {};
    const behaviourCodeBlocks = [];
    behaviours.forEach((b) => {
      const { behName, behCode } = generateBehaviourCode(b);
      behaviourNames[b.id] = behName;
      behaviourCodeBlocks.push(behCode);
    });

    // Map agent IDs to their behaviours via edges
    const agentBehaviours = {};
    agents.forEach((a) => (agentBehaviours[a.id] = []));
    edges.forEach((edge) => {
      if (edge.type === "agentBehaviour") {
        agentBehaviours[edge.source].push(edge.target);
      }
    });

    // Map agent IDs to their friends' JIDs via friendship edges
    const agentFriends = {};
    const agentIdToJid = {};
    agents.forEach((a) => {
      agentFriends[a.id] = new Set();
      agentIdToJid[a.id] = getAgentJid(a);
    });
    edges.forEach((edge) => {
      if (edge.type === "friendship") {
        const src = edge.source;
        const tgt = edge.target;
        agentFriends[src].add(agentIdToJid[tgt]);
        agentFriends[tgt].add(agentIdToJid[src]);
      }
    });

    // Collect unique behaviour types for import
    const behaviourTypes = [...new Set(behaviours.map((b) => b.data.type))].sort();
    const behaviourImports = behaviourTypes.length > 0 
      ? `from spade.behaviour import ${behaviourTypes.join(", ")}\n` 
      : "";

    // Import Agent if any agent node exists
    const agentImport = agents.length > 0 ? "from spade.agent import Agent\n" : "";

    // Base template
    const baseTemplate = `# SPADE Base Template\n\n${agentImport}${behaviourImports}\n\nasync def main():\n    while True:\n        pass\n`;

    // Generate code for agents
    const agentCodeBlocks = [];
    agents.forEach((a) => {
      const behIds = agentBehaviours[a.id];
      const behNames = behIds.map((bid) => behaviourNames[bid]);
      const friendsJids = Array.from(agentFriends[a.id]);
      console.log(friendsJids)
      agentCodeBlocks.push(generateAgentCode(a, behNames, friendsJids));
    });

    // Generate agent instantiation and main function code
    const agentInstances = agents.map((a) => {
      const auxClass = a.data.class || "MyAgent";
      const agentName = a.data.name || "Agent";
      const jid = getAgentJid(a);
      return `    ${agentName.toLowerCase()} = ${auxClass}('${jid}', 'password')`;
    });
    const agentStartup = agentInstances.join("\n");

    // Combine all parts
    const finalCode = `${baseTemplate}\n\n${behaviourCodeBlocks.join("\n\n")}\n\n${agentCodeBlocks.join("\n\n")}\n\nasync def main():\n${agentStartup}\n    while True:\n        pass\n`;
    return finalCode;
};