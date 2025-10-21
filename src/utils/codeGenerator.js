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
    return { mainFileName: 'spade_code.py', mainCode: baseTemplate, extraFiles: [] };
  }

  // Security checks
  const isAgentType = (t) => t === "agent" || t === "agentBDI" || t === "agentLLM";
  const getAgentKind = (n) => (n.type === 'agentBDI' ? 'bdi' : (n.type === 'agentLLM' ? 'llm' : 'standard'));

  const agentClassNames = nodes
    .filter((n) => isAgentType(n.type))
    .map((n) => (n.data.class || "").trim())
    .filter(Boolean);
  const agentNames = nodes
    .filter((n) => isAgentType(n.type))
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
        if ((behaviour.data.start_at_mode || 'absolute') === 'relative') {
          const seconds = Number(behaviour.data.start_at_offset_s);
          if (Number.isFinite(seconds) && seconds >= 0) {
            params.push(`start_at=(datetime.now() + timedelta(seconds=${seconds}))`);
          }
        } else if (behaviour.data.start_at) {
          // Convert start_at to datetime string
          const startAt = new Date(behaviour.data.start_at).toISOString();
          params.push(`start_at=datetime.fromisoformat('${startAt.slice(0, -1)}')`);
        }
        break;

      case 'PeriodicBehaviour':
        if (behaviour.data.period) {
          params.push(`period=${behaviour.data.period}`);
        }
        if ((behaviour.data.start_at_mode || 'absolute') === 'relative') {
          const seconds = Number(behaviour.data.start_at_offset_s);
          if (Number.isFinite(seconds) && seconds >= 0) {
            params.push(`start_at=(datetime.now() + timedelta(seconds=${seconds}))`);
          }
        } else if (behaviour.data.start_at) {
          const startAt = new Date(behaviour.data.start_at).toISOString();
          params.push(`start_at=datetime.fromisoformat('${startAt.slice(0, -1)}')`);
        }
        break;

      case 'FSMBehaviour':
        // FSM doesn't need special parameters
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
    console.log("Generating behaviour code for:", behaviour);
    const behType = behaviour.data.type;
    const behName = behaviour.data.class || `My${behType}`;
    const behCode = behaviour.data.configCode[behType] ||
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
  const indentBlock = (code, spaces = 4) => {
    const pad = ' '.repeat(spaces);
    return code
      .split('\n')
      .map((line) => (line.length ? pad + line : line))
      .join('\n');
  };

  // Helper to sanitize attribute names for Python properties
  const sanitizePropName = (raw) => {
    const s = (raw || 'behaviour').toString();
    return s
      .replace(/([a-z0-9])([A-Z])/g, '$1_$2')
      .replace(/[^a-zA-Z0-9_]/g, '_')
      .toLowerCase();
  };

  const generateAgentCode = (agent, friendsJids) => {
    const agentName = agent.data.name || "Agent";
    const auxClass = agent.data.class || "MyAgent";
    const kind = getAgentKind(agent);
    let agentClass = `class ${auxClass}(Agent):\n`;
    agentClass += "    async def setup(self):\n";

    // Presence subscriptions
    if (friendsJids && friendsJids.length > 0) {
      friendsJids.forEach((friendJid) => {
        agentClass += `        await self.presence.subscribe('${friendJid}')\n`;
      });
    }
    // (Behaviours and Templates are created/added in main())

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

    // BDI-specific setup
    if (kind === 'bdi') {
      const beliefs = Array.isArray(agent.data.beliefs) ? agent.data.beliefs : [];
      const beliefsPy = toPythonValue(beliefs);
      agentClass += `        # BDI setup (beliefs available to your BDI program)\n`;
      agentClass += `        try:\n`;
      agentClass += `            self.bdi.set_beliefs(${beliefsPy})  # Requires BDI runtime binding\n`;
      agentClass += `        except Exception:\n`;
      agentClass += `            # Fallback: store beliefs on the agent instance\n`;
      agentClass += `            self.beliefs = ${beliefsPy}\n`;
      agentClass += `\n`;
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

    // Inject optional user-defined functions (for BDI or general)
    const functions = Array.isArray(agent.data.bdiFunctions) ? agent.data.bdiFunctions : [];
    if (functions.length > 0) {
      agentClass += "\n" + functions.map(fn => indentBlock(fn, 4)).join("\n\n") + "\n";
    }

    return agentClass;
  };

  // Separate agents and behaviours
  const agents = nodes.filter((n) => isAgentType(n.type));
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
    console.log(behCode)
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

  // Collect unique behaviour types for import (include State when FSM is used)
  const behaviourTypes = [...new Set(behaviours.map((b) => b.data.type))].sort();
  const usesFSM = behaviourTypes.includes('FSMBehaviour');
  const behaviourImports = behaviourTypes.length > 0
    ? `from spade.behaviour import ${behaviourTypes.join(", ")}${usesFSM ? ", State" : ""}\n`
    : "";

  // Import Agent if any agent node exists
  const agentImport = agents.length > 0 ? "from spade.agent import Agent\n" : "";

  // NEW: Check if we need datetime/timedelta import (absolute or relative start)
  const needsDatetime = behaviours.some(b => {
    if (!(b.data && (b.data.type === 'TimeoutBehaviour' || b.data.type === 'PeriodicBehaviour'))) return false;
    const mode = b.data.start_at_mode || 'absolute';
    if (mode === 'relative') {
      const seconds = Number(b.data.start_at_offset_s);
      return Number.isFinite(seconds) && seconds >= 0;
    }
    return !!b.data.start_at;
  });
  const datetimeImport = needsDatetime ? "from datetime import datetime, timedelta\n" : "";

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
    const friendsJids = Array.from(agentFriends[a.id]);
    agentCodeBlocks.push(generateAgentCode(a, friendsJids));
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

  // Build templates per agent (in main scope), then behaviours, then start agents
  const perAgentTemplateBlocks = [];
  const perAgentBehaviourBlocks = [];

  agents.forEach((a) => {
    const agentVar = (a.data.name || 'Agent').toLowerCase();
    const behIds = agentBehaviours[a.id] || [];
    const templateIds = Array.from(agentTemplateIds[a.id] || []);

    // Templates used by this agent
    if (templateIds.length > 0) {
      perAgentTemplateBlocks.push(`    # Templates for ${agentVar}`);
      templateIds.forEach((tid) => {
        const info = templateInfo[tid];
        if (info?.tempCode) {
          const lines = info.tempCode.split('\n').filter(Boolean).map(l => `    ${l}`);
          perAgentTemplateBlocks.push(...lines);
        }
      });
    }

    // Behaviours for this agent
    behIds.forEach((bid) => {
      const binfo = behaviourInfo[bid];
      if (!binfo) return;
      const bNode = behaviours.find(bb => bb.id === bid);
      const behVar = `${agentVar}_${(binfo.behName || 'beh').toLowerCase()}`;
      // Instantiate behaviour
      perAgentBehaviourBlocks.push(`    ${behVar} = ${binfo.behName}${binfo.constructorParams}`);
      // Add to agent
      perAgentBehaviourBlocks.push(`    ${agentVar}.add_behaviour(${behVar})`);
      // Also expose behaviour as attribute on the agent instance for easy access
      const rawProp = (bNode?.data?.class || binfo.behName || 'behaviour');
      const propName = sanitizePropName(rawProp);
      perAgentBehaviourBlocks.push(`    ${agentVar}.${propName} = ${behVar}`);
    });
  });

  const agentStartup = [
    ...agentInstances,
    ...perAgentTemplateBlocks,
    ...perAgentBehaviourBlocks,
    ...agentStarts
  ].join("\n");

  const agentNamesList = agents.map((a) => a.data.name.toLowerCase()).join(", ");
  const waitUntilFinishedCode = agents.length > 0 ? `    await wait_until_finished([${agentNamesList}])` : "";

  // Combine all parts
  // TODO: Consider splitting file generation into separate concerns: imports, classes, main, extras.
  const finalCode = `${imports}\n\n${behaviourCodeBlocks.join("\n\n")}\n\n${agentCodeBlocks.join("\n\n")}\n\nasync def main():\n${agentStartup}\n${waitUntilFinishedCode}\n\nif __name__ == "__main__":\n    spade.run(main())`;

  // Extra files: BDI .asl per BDI agent
  const extraFiles = [];
  agents.forEach((a) => {
    const kind = getAgentKind(a);
    if (kind === 'bdi') {
      const program = (a.data.bdiProgram || '').trim();
      const agentName = a.data.name || 'Agent';
      if (program) {
        extraFiles.push({ name: `${agentName}_BDI.asl`, content: program, type: 'text/plain' });
      }
    }
  });
  
  return { mainFileName: 'spade_code.py', mainCode: finalCode, extraFiles };
};