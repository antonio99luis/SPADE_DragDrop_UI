# Arquitectura y distribución de funcionalidades

Este documento ofrece una visión general de cómo está organizado el repositorio y cómo se conectan sus piezas: desde el editor visual (drag & drop) hasta la generación de código SPADE y el empaquetado en ZIP.

## Visión general de carpetas

Estructura relevante del proyecto (simplificada):

```
root/
├─ public/                      # Estáticos servidos por Vite
├─ index.html                   # Entry HTML
├─ vite.config.js               # Configuración Vite
├─ eslint.config.js             # Reglas de linting
├─ package.json                 # Dependencias y scripts
├─ README.md
└─ src/
   ├─ assets/                   # Iconos, imágenes, SVG
   ├─ config/                   # Registro de tipos de nodos/aristas y configs
   │  ├─ nodeTypes.jsx
   │  ├─ edgeTypes.jsx
   │  └─ nodeConfigs.jsx
   ├─ components/
   │  ├─ edges/                 # Aristas (relaciones) personalizadas
   │  ├─ forms/                 # Campos reutilizables (FormField, KeyValueTable)
   │  ├─ modals/                # Diálogos de configuración (Monaco, etc.)
   │  ├─ nodes/                 # Componentes de nodos (Agente, Comportamiento, etc.)
   │  │  ├─ agent/
   │  │  │  ├─ AgentNode.jsx
   │  │  │  ├─ AgentNodeBDI.jsx
   │  │  │  ├─ AgentNodeLLM.jsx
   │  │  │  ├─ agentKinds.jsx   # Registro de variantes de Agente
   │  │  │  ├─ exclusive/
   │  │  │  │  ├─ ExclusiveSettingsBDI.jsx
   │  │  │  │  └─ ExclusiveSettingsLLM.jsx
   │  │  ├─ behaviour/
   │  │  │  └─ BehaviourNode.jsx
   │  │  ├─ message/
   │  │  │  └─ MessageNode.jsx
   │  │  └─ shared/             # Partes comunes de nodos (cabeceras, handlers...)
   │  ├─ ui/                    # Toolbars y UI generales
   │  └─ utils/                 # Utilidades visuales de componentes
   ├─ domain/
   │  └─ agents/
   │     └─ normalizers.js      # Normalización/parsing de creencias y funciones BDI
   ├─ editor/                   # Integración de Monaco y lenguajes
   │  ├─ customLanguage.js      # Registro de lenguaje ASL
   │  ├─ dsl/aslMonarch.js      # Gramática Monarch (highlight de ASL)
   │  └─ providers/pythonProvider.js  # Ayudas para Python en el editor
   ├─ hooks/                    # Lógica de estado y orquestación del editor
   ├─ utils/
   │  ├─ codeGenerator.js       # Generación de código SPADE (núcleo actual)
   │  ├─ agentUtils.js
   │  ├─ stringUtils.js
   │  └─ codegen/               # (WIP) espacio para builder/estrategias
   ├─ FlowEditor.jsx / .css     # Lienzo principal y estilos
   └─ main.jsx / index.css / theme.js

Examples_SPADE/                # Ejemplos en Python para SPADE
```

## Flujo de extremo a extremo (del lienzo al ZIP)

- El usuario diseña el sistema en el lienzo (React + @xyflow/react): crea nodos (agentes, comportamientos, plantillas de mensaje, notas) y los conecta con aristas (amistad, herencia, mensajes, agente↔comportamiento, etc.).
- Los modales permiten configurar propiedades específicas (p. ej., nombre de clase, JID, parámetros de comportamiento, creencias BDI, prompts LLM, código Python/ASL).
- Al generar el proyecto, `src/utils/codeGenerator.js` traduce el grafo a código SPADE en Python y produce “extras” (p. ej., un archivo `.asl` para agentes BDI).
- `useFileOperations` empaqueta todo en un ZIP con JSZip y lo ofrece para descarga.

## Nodos, aristas y registro de tipos

- Tipado visual:
  - `src/config/nodeTypes.jsx` y `src/config/edgeTypes.jsx` registran los componentes que renderiza el lienzo para cada tipo.
  - `src/config/nodeConfigs.jsx` define metadatos y opciones de configuración de cada nodo.
- Nodos relevantes:
  - Agente: `AgentNode.jsx` (estándar), `AgentNodeBDI.jsx`, `AgentNodeLLM.jsx`.
  - Comportamiento: `BehaviourNode.jsx` (tipos clásicos: Cyclic, OneShot, Timeout, Periodic; más dependencias de ejecución vía waitsFor).
  - Mensaje: `MessageNode.jsx` (plantillas de comunicación y metadatos).
  - Shared: `shared/` contiene piezas reutilizables (cabeceras, conectores, estilos) que mantienen uniformidad visual.
- Aristas:
  - `edges/` incluye las aristas especializadas (amistad, herencia, plantillas, agente↔comportamiento), cada una con su estilo y semántica.

## Configuración y modales

- Modales genéricos: `components/modals/CodeConfigurationModal.jsx` encapsula Monaco Editor para edición de código (Python/ASL) con:
  - Idioma configurable (ASL mediante Monarch, Python con provider propio).
  - Botón Reset que restablece el contenido a `defaultCode` de forma inmediata.
- Modales exclusivos por tipo de agente (se abren desde el nodo Agente):
  - `exclusive/ExclusiveSettingsBDI.jsx`: creencias (KeyValueTable), editor de ASL y editor de funciones/acciones en Python. Incluye normalización y parsing diferido (onSave) para mejorar rendimiento.
  - `exclusive/ExclusiveSettingsLLM.jsx`: prompt y campos específicos de LLM.
- Estado de modales y formularios:
  - Hooks como `useModalData.jsx`, `useAgentGeneralFields.jsx`, `useAgentKnowledgeFields.jsx` gestionan valores, validaciones ligeras y persistencia temporal.

## Agentes: variantes (kinds) y normalización de datos

- Registro de “kinds” de agente: `agent/agentKinds.jsx` actúa como catálogo de variantes (Standard, BDI, LLM). Cada kind puede declarar:
  - UI exclusiva (`ExclusiveSettings*`), badging/etiquetas, y pequeñas diferencias de configuración.
- Normalización BDI (para compatibilidad y UX): `domain/agents/normalizers.js` centraliza conversiones de forma:
  - `beliefsArrayToObject` y `beliefsObjectToArray` (para KeyValueTable y persistencia).
  - `functionsTextToArray` (parse diferido de funciones/acciones escritas en el editor Python al guardar).

## Editor de código y lenguajes

- Monaco Editor (`@monaco-editor/react`) con soporte:
  - ASL: registro de lenguaje en `editor/customLanguage.js` y gramática Monarch en `editor/dsl/aslMonarch.js` para resaltado.
  - Python: ayudas ligeras en `editor/providers/pythonProvider.js` (snippets/completado básico).
- El modal de código es genérico y parametrizable para reutilizarlo en distintos contextos.

## Generación de código (SPADE y BDI)

- Núcleo actual: `src/utils/codeGenerator.js` produce:
  - Clases de agentes y comportamientos en Python, resolviendo importaciones y vínculos basados en el grafo.
  - Dependencias de ejecución entre comportamientos con un modelo de “waitsFor” (más estable y escalable que un "join" rígido).
  - Integración BDI cuando procede: import condicional de `BDIAgent`, clases BDI que extienden `BDIAgent`, construcción con ruta al `.asl`, y fijado de creencias vía `self.bdi.set_belief(key[, value])`.
  - “Extras” empaquetados además del archivo principal, p. ej., el `.asl` por cada agente BDI (se emite aunque esté vacío para claridad de proyecto).

- Contrato de salida típico del generador:
  - 1 archivo Python “principal” con agentes, comportamientos y arranque.
  - 0..N archivos adicionales (p. ej., `NombreAgente_BDI.asl`).
  - Metadatos mínimos para empaquetado.

- Futuro cercano (en preparación): `src/utils/codegen/{builder,strategies,utils}` como refactor a patrón Builder/Estrategias para separar:
  - Análisis/validación de grafo, 
  - Ensamblado por tipo (agente estándar, BDI, LLM), 
  - Plantillas reutilizables y testables.

## Empaquetado y exportación

- `useFileOperations.jsx` orquesta la exportación en ZIP usando `jszip`.
- Siempre se empaquetan el archivo principal y los “extras” que el generador produzca.

## Hooks clave (estado y UX)

- `useFlowEditor.jsx`: ciclo de vida del lienzo, selección, drag & drop.
- `useDragAndDrop.jsx`: alta de tipos y comportamiento del panel de herramientas.
- `useNodeOperations.jsx`: utilidades para crear/actualizar nodos con consistencia.
- `useModalData.jsx`: acceso consistente a valores de formularios; preserva valores falsy (false/0) correctamente.
- `useBehaviourModalData.jsx`, `useTemplateModalData.jsx`: datos específicos de cada tipo de modal.

## Estilo y UI

- Tailwind CSS (v4) + utilidades (`tailwind-merge`, `clsx`) para clases condicionales.
- Material UI (MUI) para controles y layout donde aporta productividad.
- CSS modularizado por componente cuando se requiere control fino (p. ej., aristas y nodos).

## Cómo extender el sistema

- Nuevo tipo de nodo:
  - Crear componente en `components/nodes/<tipo>/` y estilos.
  - Registrar en `config/nodeTypes.jsx` y, si aplica, en `config/nodeConfigs.jsx`.
- Nueva arista/relación:
  - Crear componente en `components/edges/` y registrar en `config/edgeTypes.jsx`.
- Nuevo “kind” de agente (p. ej., otra variante especializada):
  - Añadir entrada en `agent/agentKinds.jsx` y crear `ExclusiveSettings<Kind>.jsx` bajo `agent/exclusive/`.
  - Si afecta a generación, extender `codeGenerator.js` (o la nueva capa `codegen/` cuando esté activa).
- Nuevo comportamiento:
  - Añadir tipo/plantilla en `BehaviourNode.jsx` y contemplarlo en `codeGenerator.js`.
- Aporte al editor de código:
  - Extender `editor/customLanguage.js` y/o `editor/providers/` según el lenguaje.

## Dependencias principales

- React 19 + Vite 6 para UI y bundling.
- @xyflow/react para el lienzo de nodos/aristas.
- Monaco Editor para edición de código embebida.
- MUI (Material UI) y Tailwind CSS para la interfaz.
- JSZip para empaquetado.

## Notas y convenciones

- Evitar trabajo pesado en `onChange` de formularios; preferir parse/validación en `onSave`.
- Mantener conversión de formas (p. ej., creencias BDI) centralizada en `domain/agents/normalizers.js`.
- Los modales exclusivos deshabilitan la doble apertura de la configuración general del agente mientras están activos.
- El generador no escribe en disco; devuelve artefactos que se empaquetan en ZIP.

Si necesitas un diagrama más técnico (p. ej., secuencia de generación o un mapa de dependencias entre módulos), lo añadimos en esta carpeta (`docs/`).
