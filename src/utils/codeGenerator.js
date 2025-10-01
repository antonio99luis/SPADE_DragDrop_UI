// src/utils/codeGenerator.js
/**
 * Generates the Python code for SPADE agents and behaviours.
 * @param {Array} nodes - List of nodes in the graph.
 * @param {Array} edges - List of edges in the graph.
 * @returns {string} - The generated Python code.
 */
import { toCamelCase, toPythonValue } from './stringUtils';

export const generateSpadeCode = (nodes, edges) => {

  // Base template
  const baseTemplate = `# SPADE Base Template\n\n` +
    `from spade.agent import Agent\n\n` +
    `async def main():\n` +
    `    while True:\n` +
    `        pass\n`;

  if (nodes.length === 0 && edges.length === 0) {
    return baseTemplate;
  }

  // Security checks
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
    alert("ERROR: All agent names must be valid Python identifiers.");
    return;
  }
  if (behaviourClassNames.length > 0 && !behaviourClassNames.every(isValidPythonIdentifier)) {
    alert("ERROR: All behaviour names must be valid Python identifiers.");
    return;
  }
  if (hasDuplicate(agentClassNames)) {
    alert("ERROR generating code:\n\tEach Agent node must have a unique Class name.");
    return;
  }
  if (hasDuplicate(agentNames)) {
    alert("ERROR generating code:\n\tEach Agent node must have a unique Name.");
    return;
  }
  if (hasDuplicate(behaviourClassNames)) {
    alert("ERROR generating code:\n\tEach Behaviour node must have a unique Class name.");
    return;
  }

  // Helper functions
  const getAgentJid = (agent) => {
    const name = agent.data.name || "myAgent";
    const host = agent.data.host || "localhost";
    return `${name}@${host}`;
  };

  // NEW: Function to generate behavior constructor parameters based on type
  const getBehaviourConstructorParams = (behaviour, templateName = null) => {
    const behType = behaviour.data.type;
    const params = [];

    switch (behType) {
      case 'TimeoutBehaviour':
        if (behaviour.data.start_at) {
          // Convert start_at to datetime string
          const startAt = new Date(behaviour.data.start_at).toISOString();
          params.push(`start_at=datetime.fromisoformat('${startAt.slice(0, -1)}')`);
        }
        break;

      case 'PeriodicBehaviour':
        if (behaviour.data.period) {
          params.push(`period=${behaviour.data.period}`);
        }
        if (behaviour.data.start_at) {
          const startAt = new Date(behaviour.data.start_at).toISOString();
          params.push(`start_at=datetime.fromisoformat('${startAt.slice(0, -1)}')`);
        }
        break;

      case 'FSMBehaviour':
        // FSM might have states configuration
        break;

      case 'CyclicBehaviour':
        // Cyclic doesn't need special parameters
        break;

      case 'OneShotBehaviour':
        // OneShot doesn't need special parameters
        break;

      default:
        // Handle custom behavior types
        break;
    }
    if (templateName) {
      params.push(`template=${templateName}`);
    }
    return params.length > 0 ? `(${params.join(', ')})` : '()';
  };

  const generateBehaviourCode = (behaviour) => {
    const behType = behaviour.data.type;
    const behName = behaviour.data.class || `My${behType}`;
    const behCode = behaviour.data.configCode?.[behType] ||
      `class ${behName}(${behType}):\n    async def run(self):\n        pass\n`;
    return { behName, behCode };
  };
  const generateTemplateCode = (template) => {
    const tempName = template.data.name || "template";
    let tempCode = `${tempName} = Template()\n`;
    if (template.data.sender) {
      tempCode += `${tempName}.set_sender("${template.data.sender}")\n`;
    }
    if (template.data.to) {
      tempCode += `${tempName}.set_to("${template.data.to}")\n`;
    }
    if (template.data.body) {
      tempCode += `${tempName}.set_body("${template.data.body}")\n`;
    }
    if (template.data.thread) {
      tempCode += `${tempName}.set_thread("${template.data.thread}")\n`;
    }
    for (let key in template.data.metadata) {
      if (key && template.data.metadata[key]) {
        const value = toPythonValue(template.data.metadata[key]);
        tempCode += `${tempName}.set_metadata("${key}", ${value})\n`;
      }
    };
    return { tempName, tempCode };
  };
  // UPDATED: Generate agent code with behavior constructor parameters
  const generateAgentCode = (agent, behavioursData, friendsJids, agentTemplates) => {
    const agentName = agent.data.name || "Agent";
    const auxClass = agent.data.class || "MyAgent";
    let agentClass = `class ${auxClass}(Agent):\n`;
    agentClass += "    async def setup(self):\n";

    // Presence subscriptions
    if (friendsJids && friendsJids.length > 0) {
      friendsJids.forEach((friendJid) => {
        agentClass += `        await self.presence.subscribe('${friendJid}')\n`;
      });
    }
    // Generate template code for this agent
    if (agentTemplates && agentTemplates.length > 0) {
      agentClass += `        # Templates\n`;
      agentTemplates.forEach(({ tempName, tempCode }) => {
        const indentedTempCode = tempCode
          .split('\n')
          .map(line => line ? `        ${line}` : '')
          .join('\n');
        agentClass += indentedTempCode;
      });
      agentClass += `\n`;
    }
    // Add behaviours with their specific constructor parameters (including templates)
    if (behavioursData && behavioursData.length > 0) {
      agentClass += `        # Behaviours\n`;
      behavioursData.forEach(({ behName, constructorParams }) => {
        agentClass += `        self.add_behaviour(${behName}${constructorParams})\n`;
      });
      agentClass += `\n`;
    }

    // Add knowledge base entries
    if (agent.data.metadata) {
      const knowledgeEntries = Object.entries(agent.data.metadata).filter(([key, value]) => key && value);
      if (knowledgeEntries.length > 0) {
        agentClass += `        # Knowledge Base\n`;
        knowledgeEntries.forEach(([key, value]) => {
          const pythonValue = toPythonValue(value);
          agentClass += `        self.set('${key}', ${pythonValue})\n`;
        });
        agentClass += `\n`;
      }
    }
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
  const templates = nodes.filter((n) => n.type === "template");

  const behaviourTemplates = {};
  edges.forEach((edge) => {
    if (edge.type === "template") {
      behaviourTemplates[edge.source] = edge.target; // behavior -> template
    }
  });
  // Create template info mapping
  const templateInfo = {};
  templates.forEach((t) => {
    const { tempName, tempCode } = generateTemplateCode(t);
    templateInfo[t.id] = { tempName, tempCode };
  });
  // Map behaviour node id to behavior info
  const behaviourInfo = {};
  const behaviourCodeBlocks = [];
  behaviours.forEach((b) => {
    const { behName, behCode } = generateBehaviourCode(b);
    // Check if this behavior has a connected template
    const templateId = behaviourTemplates[b.id];
    const templateName = templateId ? templateInfo[templateId]?.tempName : null;

    const constructorParams = getBehaviourConstructorParams(b, templateName);
    behaviourInfo[b.id] = { behName, constructorParams };
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

    // Map agents to their templates (templates used by agent's behaviors)
  const agentTemplateIds = {};
  agents.forEach((a) => {
    agentTemplateIds[a.id] = new Set();
    const agentBehIds = agentBehaviours[a.id] || [];
    agentBehIds.forEach((behId) => {
      const templateId = behaviourTemplates[behId];
      if (templateId) {
        agentTemplateIds[a.id].add(templateId);
      }
    });
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

  // NEW: Check if we need datetime import
  const needsDatetime = behaviours.some(b =>
    (b.data.type === 'TimeoutBehaviour' || b.data.type === 'PeriodicBehaviour') &&
    b.data.start_at
  );
  const datetimeImport = needsDatetime ? "from datetime import datetime\n" : "";

  // Add template import
  const templateImport = templates.length > 0 ? "from spade.template import Template\n" : "";

  // Base template with imports
  const imports = `import spade\n` +
    `from spade import wait_until_finished\n` +
    `import asyncio\n` +
    `${agentImport}` +
    `${behaviourImports}` +
    `${templateImport}` +
    `${datetimeImport}`;

  // UPDATED: Generate code for agents with behavior constructor parameters
  const agentCodeBlocks = [];
  agents.forEach((a) => {
    const behIds = agentBehaviours[a.id];
    const behavioursData = behIds.map((bid) => behaviourInfo[bid]);
    const friendsJids = Array.from(agentFriends[a.id]);

    // Get templates used by this agent
    const agentTemplateData = Array.from(agentTemplateIds[a.id]).map((tempId) => templateInfo[tempId]);

    agentCodeBlocks.push(generateAgentCode(a, behavioursData, friendsJids, agentTemplateData));
  });

  // Generate agent instantiation and main function code
  const agentInstances = agents.map((a) => {
    const auxClass = a.data.class || "MyAgent";
    const agentName = a.data.name || "Agent";
    const agentPassword = a.data.password || "password";
    const port = a.data.port ? parseInt(a.data.port, 10) : 5222;
    const verify_security = a.data.verify_security ? "True" : "False";
    const jid = getAgentJid(a);
    return `    ${agentName.toLowerCase()} = ${auxClass}('${jid}', '${agentPassword}', ${port}, ${verify_security})`;
  });

  const agentStarts = agents.map((a) => {
    const agentName = a.data.name || "Agent";
    return `    await ${agentName.toLowerCase()}.start()`;
  });

  const agentStartup = [...agentInstances, ...agentStarts].join("\n");
  const agentNamesList = agents.map((a) => a.data.name.toLowerCase()).join(", ");
  const waitUntilFinishedCode = agents.length > 0 ? `    await wait_until_finished([${agentNamesList}])` : "";

  // Combine all parts
  const finalCode = `${imports}\n\n${behaviourCodeBlocks.join("\n\n")}\n\n${agentCodeBlocks.join("\n\n")}\n\nasync def main():\n${agentStartup}\n${waitUntilFinishedCode}\n\nif __name__ == "__main__":\n    spade.run(main())`;
  return finalCode;
};