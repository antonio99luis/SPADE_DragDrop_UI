/**
 * Generates the Python code for SPADE agents and behaviours.
 * @param {Array} nodes - List of nodes in the graph.
 * @param {Array} edges - List of edges in the graph.
 * @returns {string} - The generated Python code.
 */

export const generateSpadeCode = (nodes, edges) => {
    // Base template
    const baseTemplate =  `# SPADE Base Template\n\n`+
                          `from spade.agent import Agent\n\n`+
                          `async def main():\n`+
                          `    while True:\n`+
                          `        pass\n`;


    if (nodes.length === 0 && edges.length === 0) {
      return baseTemplate;
    }
    
    // Security checks:
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
    const isValidPythonIdentifier = (name) => /^[a-zA-Z_][a-zA-Z0-9_]*$/.test(name);


    const hasDuplicate = (arr) => new Set(arr).size !== arr.length;

    if (agentNames.length > 0 && !agentNames.every(isValidPythonIdentifier)) {
      alert(
        "ERROR: All agent names must be valid Python identifiers."
      );
      return;
    }
    if (behaviourClassNames.length > 0 && !behaviourClassNames.every(isValidPythonIdentifier)) {
      alert(
        "ERROR: All behaviour names must be valid Python identifiers."
      );
      return;
    }      
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
    const imports = `import spade\n`+
                    `from spade import wait_until_finished\n`+
                    `import asyncio\n`+
                    `${agentImport}`+
                    `${behaviourImports}`;

    // Generate code for agents
    const agentCodeBlocks = [];
    agents.forEach((a) => {
      const behIds = agentBehaviours[a.id];
      const behNames = behIds.map((bid) => behaviourNames[bid]);
      const friendsJids = Array.from(agentFriends[a.id]);
      agentCodeBlocks.push(generateAgentCode(a, behNames, friendsJids));
    });

    // Generate agent instantiation and main function code
    const agentInstances = agents.map((a) => {
      const auxClass = a.data.class || "MyAgent";
      const agentName = a.data.name || "Agent";
      const jid = getAgentJid(a);
      return `    ${agentName.toLowerCase()} = ${auxClass}('${jid}', 'password')`;
    });
    const agentStarts = agents.map((a) => {
      const agentName = a.data.name || "Agent";
      return `    await ${agentName.toLowerCase()}.start()`;
    });
    agentInstances.push(...agentStarts);
    const agentStartup = agentInstances.join("\n");
    const agentNamesList = agents.map((a) => a.data.name.toLowerCase()).join(", ");
    const waitUntilFinishedCode = `    await wait_until_finished([${agentNamesList}])`;
    
    // Combine all parts
    const finalCode = `${imports}\n\n${behaviourCodeBlocks.join("\n\n")}\n\n${agentCodeBlocks.join("\n\n")}\n\nasync def main():\n${agentStartup}\n${waitUntilFinishedCode}\n\nif __name__ == "__main__":\n    spade.run(main())`;
    return finalCode;
};