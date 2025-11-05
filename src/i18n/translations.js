// Translations for ES/EN. Extend as needed.

export const translations = {
  es: {
    nodes: {
      agent: {
        title: "Agente",
        subtitle: "Configuración de agente",
        handles: {
          friendshipTarget: "amistad (entrada)",
          inheritsFrom: "hereda de",
          friendshipSource: "amistad (salida)",
          behaviour: "comportamiento",
          inheritedBy: "heredado por",
        },
      },
      behaviour: {
        title: "Comportamiento",
        subtitle: "Configuración de comportamiento",
        handles: {
          usedByAgent: "usado por agente",
          usesMessage: "usa mensaje",
          usesTemplate: "usa plantilla",
        },
      },
      template: {
        title: "Plantilla",
        subtitle: "Configuración de plantilla de mensajes",
        handles: {
          usedByBehaviour: "usado por comportamiento",
        },
      },
      message: {
        title: "Mensaje",
        subtitle: "Configuración de mensaje",
        handles: {
          usedByBehaviour: "usado por comportamiento",
        },
      },
    },
    common: {
      cancel: "Cancelar",
      save: "Guardar",
    },
    options: {
      title: "Opciones",
      theme: "Tema",
      light: "Claro",
      dark: "Oscuro",
      language: "Idioma",
    },
    home: {
      appTitle: "SPADE Drag & Drop",
      examplesGalleryTitle: "Galería de ejemplos",
      examplesGalleryHelp: "Selecciona un flujo de ejemplo para abrirlo en el editor, o crea uno nuevo.",
      newFlow: "Nuevo flujo",
      loadingExamples: "Cargando ejemplos…",
      noExamples: "No hay ejemplos disponibles.",
      repoTooltip: "Repositorio en GitHub",
      optionsTooltip: "Opciones",
    },
    editor: {
      title: "Editor de flujos",
      backToHome: "Volver a inicio",
      editMeta: "Editar nombre y descripción",
      generateCode: "Generar código",
      saveFlow: "Guardar flujo",
      loadFlow: "Cargar flujo",
      confirmLeave: "Hay cambios en el lienzo. ¿Quieres guardar el flujo antes de salir?",
      metaDialogTitle: "Propiedades del flujo",
      name: "Nombre",
      description: "Descripción",
    },
    toolbar: {
      addNodes: "Agregar nodos",
      searchNodes: "Buscar nodos",
      spadeNodes: "Nodos SPADE",
      noResults: "Sin resultados",
      stickyNote: "Nota",
      addNodeTooltip: "Agregar nodo",
      closeModalFirst: "Cierra primero la ventana modal",
    },
    nodeProperties: {
      attributes: "Atributos",
      inputs: "Entradas",
      outputs: "Salidas",
    },
    agent: {
      class: "Clase",
      name: "Nombre",
      host: "Host",
      port: "Puerto",
      verifySecurity: "Verificar seguridad",
      knowledge: "Conocimiento",
      bdiSettings: "Configuración BDI",
      llmSettings: "Configuración LLM",
      bdiConfiguration: "Configuración BDI",
      llmConfiguration: "Configuración LLM",
      exclusiveBdiSettings: "Ajustes exclusivos para BDI",
      exclusiveLlmSettings: "Ajustes exclusivos para LLM",
    },
    behaviour: {
      class: "Clase",
      type: "Tipo",
        startAt: "Inicio en",
        startAfter: "Inicio después",
    },
    disabled: "Deshabilitado",
    enabled: "Habilitado",
    entry: "entrada",
    entries: "entradas",
    notSet: "No establecido",
    alerts: {
      behaviour: {
        startAfterNonNegative: "El inicio después (segundos) debe ser un número no negativo cuando se usa el tiempo de inicio relativo.",
      },
    },
  },
  en: {
    nodes: {
      agent: {
        title: "Agent",
        subtitle: "Agent Configuration",
        handles: {
          friendshipTarget: "friendship (target)",
          inheritsFrom: "inherits from",
          friendshipSource: "friendship (source)",
          behaviour: "behaviour",
          inheritedBy: "inherited by",
        },
      },
      behaviour: {
        title: "Behaviour",
        subtitle: "Behaviour Configuration",
        handles: {
          usedByAgent: "used by agent",
          usesMessage: "uses message",
          usesTemplate: "uses template",
        },
      },
      template: {
        title: "Template",
        subtitle: "Message Template Configuration",
        handles: {
          usedByBehaviour: "used by behaviour",
        },
      },
      message: {
        title: "Message",
        subtitle: "Message Configuration",
        handles: {
          usedByBehaviour: "used by behaviour",
        },
      },
    },
    common: {
      cancel: "Cancel",
      save: "Save",
    },
    options: {
      title: "Options",
      theme: "Theme",
      light: "Light",
      dark: "Dark",
      language: "Language",
    },
    home: {
      appTitle: "SPADE Drag & Drop",
      examplesGalleryTitle: "Examples gallery",
      examplesGalleryHelp: "Pick an example flow to open it in the editor, or create a new one.",
      newFlow: "New flow",
      loadingExamples: "Loading examples…",
      noExamples: "No examples available.",
      repoTooltip: "GitHub repository",
      optionsTooltip: "Options",
    },
    editor: {
      title: "Flow editor",
      backToHome: "Back to home",
      editMeta: "Edit name and description",
      generateCode: "Generate code",
      saveFlow: "Save flow",
      loadFlow: "Load flow",
      confirmLeave: "There are changes on canvas. Do you want to save before leaving?",
      metaDialogTitle: "Flow properties",
      name: "Name",
      description: "Description",
    },
    toolbar: {
      addNodes: "Add Nodes",
      searchNodes: "Search nodes",
      spadeNodes: "SPADE nodes",
      noResults: "No results",
      stickyNote: "Sticky Note",
      addNodeTooltip: "Add Node",
      closeModalFirst: "Close modal first",
    },
    nodeProperties: {
      attributes: "Attributes",
      inputs: "Inputs",
      outputs: "Outputs",
    },
    agent: {
      class: "Class",
      name: "Name",
      host: "Host",
      port: "Port",
      verifySecurity: "Verify security",
      knowledge: "Knowledge",
      bdiSettings: "BDI Settings",
      llmSettings: "LLM Settings",
      bdiConfiguration: "BDI Configuration",
      llmConfiguration: "LLM Configuration",
      exclusiveBdiSettings: "Exclusive settings for BDI",
      exclusiveLlmSettings: "Exclusive settings for LLM",
    },
    disabled: "Disabled",
    enabled: "Enabled",
    entry: "entry",
    entries: "entries",
    notSet: "Not set",
    alerts: {
      behaviour: {
        startAfterNonNegative: "Start after (seconds) must be a non-negative number when using relative start time.",
      },
    }
  }
};
