from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from pathlib import Path

app = FastAPI()
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # For development; restrict in production
    allow_methods=["*"],
    allow_headers=["*"],
)

TEMPLATE_PATH = Path(__file__).parent / "templates" / "spade_base.py"

AGENT_DEFAULTS = {"class": "MyAgentClass", "name": "myAgent", "host": "localhost"}
BEHAVIOUR_DEFAULTS = {"class": "My"}

def get_agent_jid(agent):
    name = agent['data'].get('name')
    if name == "":
        name = AGENT_DEFAULTS["name"] # +f"{idx}"
    host = agent['data'].get('host')
    if host == "":
        host = AGENT_DEFAULTS["host"]
    return f"{name}@{host}"

def generate_behaviour_code(behaviour, idx):
    beh_type = behaviour['data']['type']
    beh_name = behaviour['data']['class'] # f"Behaviour{idx+1}"  # Placeholder, can use behaviour['data']['name'] in the future
    if beh_name == "":
        beh_name = BEHAVIOUR_DEFAULTS["class"]+behaviour['data']['type']
    beh_code = behaviour['data'].get('configCode', {}).get(beh_type)
    if not beh_code:
        beh_code = f"class {beh_name}({behaviour['data']['type']}):\n    async def run(self):\n        pass\n"
    #else:
        # Ensure correct class name
        # beh_code = beh_code.replace("class My", f"class {beh_name}")
    return beh_name, beh_code

def generate_agent_code(agent, agent_idx, behaviours, behaviour_names, friends_jids):
    agent_name = agent['data'].get('name', f"Agent{agent_idx+1}")
    aux_class = agent['data'].get('class')
    if aux_class == "":
        aux_class = f"MyAgent{agent_idx+1}"
    agent_class = f"class {aux_class}(Agent):\n"
    agent_class += "    async def setup(self):\n"
    # Presence subscriptions
    for friend_jid in friends_jids:
        agent_class += f"        await self.presence.subscribe('{friend_jid}')\n"
    # Add behaviours
    for beh_name in behaviour_names:
        agent_class += f"        self.add_behaviour({beh_name}())\n"
    # User setup code
    setup_code = agent['data'].get('setupCode', '')
    if setup_code:
        setup_code = "\n".join("        " + line if line.strip() else "" for line in setup_code.splitlines())
        agent_class += setup_code + "\n"
    else:
        agent_class += "        pass\n"
    return agent_class

@app.post("/generate")
async def generate_code(request: Request):
    data = await request.json()
    nodes = data.get("nodes", [])
    edges = data.get("edges", [])

    # Separate agents and behaviours
    agents = [n for n in nodes if n["type"] == "agent"]
    behaviours = [n for n in nodes if n["type"] == "behaviour"]

    # Map behaviour node id to index for naming
    behaviour_id_to_idx = {b["id"]: idx for idx, b in enumerate(behaviours)}
    behaviour_names = {}
    behaviour_code_blocks = []
    for idx, b in enumerate(behaviours):
        beh_name, beh_code = generate_behaviour_code(b, idx)
        behaviour_names[b["id"]] = beh_name
        behaviour_code_blocks.append(beh_code)

    # Map agent IDs to their behaviours via edges
    agent_behaviours = {a["id"]: [] for a in agents}
    for edge in edges:
        if edge.get("type") == "agentBehaviour":
            agent_behaviours[edge["source"]].append(edge["target"])

    # Map agent IDs to their friends' JIDs via friendship edges
    agent_friends = {a["id"]: set() for a in agents}
    agent_id_to_jid = {a["id"]: get_agent_jid(a) for a in agents}
    for edge in edges:
        if edge.get("type") == "friendship":
            src, tgt = edge["source"], edge["target"]
            # Bidirectional subscription
            agent_friends[src].add(agent_id_to_jid[tgt])
            agent_friends[tgt].add(agent_id_to_jid[src])

    # Collect unique behaviour types for import
    behaviour_types = sorted({b["data"]["type"] for b in behaviours})
    behaviour_imports = ""
    if behaviour_types:
        behaviour_imports = f"from spade.behaviour import {', '.join(behaviour_types)}\n"

    # Import Agent if any agent node exists
    agent_import = ""
    if agents:
        agent_import = "from spade.agent import Agent\n"

    # Read base template
    base = TEMPLATE_PATH.read_text()

    # Insert imports after the first import block
    first_import_end = base.find("\n\n") + 2 if "\n\n" in base else len(base)
    code = (
        base[:first_import_end]
        + agent_import
        + behaviour_imports
        + base[first_import_end:]
    )

    # Generate code for agents
    agent_code_blocks = []
    for idx, a in enumerate(agents):
        beh_ids = agent_behaviours[a["id"]]
        beh_names = [behaviour_names[bid] for bid in beh_ids]
        friends_jids = agent_friends[a["id"]]
        agent_code_blocks.append(generate_agent_code(a, idx, beh_ids, beh_names, friends_jids))

    # Generate agent instantiation and main function code
    agent_instances = []
    for idx, a in enumerate(agents):
        aux_class = a['data'].get('class')
        if aux_class == "":
            aux_class = f"MyAgent{idx+1}"
        agent_name = a['data'].get('name', f"Agent{idx+1}")
        jid = get_agent_jid(a)
        agent_instances.append(
            f"    {agent_name.lower()} = {aux_class}('{jid}', 'password')"
        )
    agent_startup = "\n".join(agent_instances)

    # Insert generated code before the main() function
    insert_point = code.find("async def main():")
    generated = (
        "\n\n" +
        "\n\n".join(behaviour_code_blocks) +
        "\n\n" +
        "\n\n".join(agent_code_blocks) +
        "\n\n"
    )
    # Insert agent instantiation in main()
    main_insert_point = code.find("    while True:")
    final_code = (
        code[:insert_point] +
        generated +
        code[insert_point:main_insert_point] +
        agent_startup +
        "\n" +
        code[main_insert_point:]
    )

    return {"code": final_code}