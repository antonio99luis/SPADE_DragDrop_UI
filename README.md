# **ReactFlow Multiagent System Orchestrator**

A visual drag-and-drop interface for orchestrating multiagent systems using ReactFlow. This application allows users to design agent architectures, define behaviors, and generate executable SPADE (Smart Python Agent Development Environment) code.

> Documentación ampliada: consulta la guía de arquitectura y organización en `docs/architecture.md`.

## **📁 Project Structure**

```
src/
├── components/
│   ├── nodes/              # Node components for canvas elements
│   │   ├── agent/          # Agent node components
│   │   ├── behaviour/      # Behavior node components  
│   │   ├── template/       # Message template components
│   │   ├── sticky-note/    # Annotation components
│   │   └── shared/         # Reusable node components
│   ├── edges/              # Connection/relationship components
│   ├── modals/             # Configuration dialog components
│   ├── ui/                 # User interface components
│   └── utils/              # Utility functions
├── assets/                 # Static assets (SVG icons, images)
└── App.jsx                 # Main application component
```

---

## **🎯 Component Architecture**

### **📍 Node Components** (`/components/nodes/`)

#### **Agent Nodes** (`/agent/`)
- **`AgentNode.jsx`** - Represents individual agents in the multiagent system
  - Configurable properties: class name, instance name, host
  - Generates unique JID (Jabber ID) for agent communication
  - Supports modal configuration with title editing
  - Input handles: friendship (target), inheritance (target)  
  - Output handles: friendship (source), behavior, inheritance (source)

#### **Behavior Nodes** (`/behaviour/`)
- **`BehaviourNode.jsx`** - Defines agent behaviors and their execution patterns
  - Behavior types: Cyclic, OneShot, Timeout, Periodic
  - Type-specific configuration fields via modal
  - Connects to agents via agent-behavior edges

- **`fields/PeriodicBehaviourFields.jsx`** - Configuration for periodic behaviors
  - Period setting for regular execution intervals

- **`fields/TimeoutBehaviourFields.jsx`** - Configuration for timeout behaviors  
  - Start time and timeout duration settings

#### **Template Nodes** (`/template/`)
- **`TemplateNode.jsx`** - Message templates for agent communication
  - Sender, recipient, body, and thread configuration
  - Metadata support for complex message structures
  - Connects to agents to define communication patterns

#### **Sticky Note Nodes** (`/sticky-note/`)
- **`StickyNoteNode.jsx`** - Annotation and documentation nodes
  - Free-text editing for project documentation
  - Non-functional elements for visual organization

#### **Shared Components** (`/shared/`)
- **`NodeBase.jsx`** - Base component for draggable node previews
- **`NodeHeader.jsx`** - Standard header with icon and title
- **`NodeDivider.jsx`** - Visual section separators
- **`LabeledHandle.jsx`** - Connection points with descriptive labels
- **`base-handle.jsx`** - Low-level handle component wrapper

### **🔗 Edge Components** (`/components/edges/`)

- **`FriendshipEdge.jsx`** - Represents social connections between agents
- **`AgentBehaviourEdge.jsx`** - Links agents to their behaviors
- **`InheritanceEdge.jsx`** - Shows agent class inheritance relationships  
- **`TemplateEdge.jsx`** - Connects message templates to agents

### **⚙️ Modal Components** (`/components/modals/`)

- **`shared/ConfigurationModal.jsx`** - Generic configuration dialog
  - Editable titles, save/cancel functionality
  - Reusable across different node types

- **`BehaviourConfigModal.jsx`** - Code editor for custom behavior logic
  - Monaco Editor integration for Python code editing

- **`TemplateMetadataModal.jsx`** - JSON editor for message metadata
  - Structured data input for complex message properties

### **🎨 UI Components** (`/components/ui/`)

- **`NodeToolBar.jsx`** - Main toolbar for node creation and project management
  - Draggable node palette (Agent, Behavior, Template, Sticky Note)
  - SPADE code generation functionality
  - Project save/load capabilities
  - Export functionality for Python files

### **🔧 Utilities** (`/components/utils/`)

- **`utils.ts`** - CSS class manipulation utilities
  - `cn()` function for conditional className merging
  - Used by handle and base components for styling

---

## **🚀 Key Features**

- **Visual Design**: Drag-and-drop interface for multiagent system architecture
- **Code Generation**: Automatic SPADE Python code generation from visual designs
- **Agent Configuration**: Complete agent setup with JID management and Gravatar avatars
- **Behavior Management**: Support for all SPADE behavior types with custom code editing
- **Message Templates**: Structured communication pattern definition
- **Project Persistence**: Save/load functionality for project management
- **Relationship Mapping**: Visual representation of agent relationships and dependencies

---

## **💡 Usage Workflow**

1. **Design**: Drag nodes from toolbar to canvas
2. **Configure**: Double-click nodes to set properties and code
3. **Connect**: Create relationships using connection handles
4. **Generate**: Export complete SPADE Python project
5. **Deploy**: Run generated code in SPADE environment

---

## **🛠️ Development Setup**

### **Prerequisites**
- Node.js 18+ 
- npm or yarn package manager

### **Installation**
```bash
# Clone the repository
git clone [repository-url]
cd my-react-flow-app

# Install dependencies
npm install

# Start development server
npm run dev
```

### **Build for Production**
```bash
npm run build
```

---

## **📦 Dependencies**

### **Core Libraries**
- **React** - UI framework
- **@xyflow/react** - Flow diagram library
- **Vite** - Build tool and development server

### **Additional Libraries**
- **blueimp-md5** - MD5 hashing for Gravatar URLs
- **@monaco-editor/react** - Code editor component

---

## **🎨 Styling**

The application uses a combination of:
- **CSS Modules** - Component-specific styling
- **Custom CSS** - Global styles and themes
- **Conditional Classes** - Dynamic styling via utility functions

---

## **🔧 Architecture Notes**

### **Data Flow**
- **App.jsx** manages global state for nodes and edges
- **Node components** handle local state and emit changes via callbacks
- **Modal components** provide configuration interfaces
- **Edge components** define visual relationships

### **Code Generation**
- Analyzes node/edge relationships to build SPADE project structure
- Generates complete Python files with proper imports and async patterns
- Handles agent lifecycle management and behavior assignment

### **Extensibility**
- **Add new node types**: Create components in `/nodes/[type]/`
- **Add new relationships**: Create edge components in `/edges/`
- **Extend configuration**: Add modal components in `/modals/`

This architecture provides a complete visual development environment for multiagent systems, bridging the gap between conceptual design and executable code.
