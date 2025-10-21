// src/editor/dsl/aslMonarch.js
// Monarch syntax definition for AgentSpeak(L) / Jason .asl files
// This is a pragmatic tokenizer capturing common constructs: events (+!g, -b, +?g),
// contexts (:), plan bodies (<- ...), actions, atoms, variables, strings, numbers, and comments.

const keywords = [
  'true', 'false', 'not', 'and', 'or'
];

const builtinActions = [
  // Common Jason internal actions (subset)
  '.print', '.println', '.format',
  '.send', '.broadcast', '.goal', '.intend', '.drop_all_intentions',
  '.add_plan', '.replan', '.plan_label', '.unifier'
];

export const aslMonarch = {
  id: 'asl',
  monarch: {
    defaultToken: '',
    tokenPostfix: '.asl',

    brackets: [
      { open: '(', close: ')', token: 'delimiter.parenthesis' },
      { open: '[', close: ']', token: 'delimiter.bracket' },
      { open: '{', close: '}', token: 'delimiter.brace' },
    ],

    keywords,
    builtinActions,

    tokenizer: {
      root: [
        // whitespace
        [/\s+/, 'white'],

        // comments
        [/\/\/.*$/, 'comment'],
        [/\/\*/, 'comment', '@comment'],

        // strings
        [/"([^"\\]|\\.)*"/, 'string'],
        [/'([^'\\]|\\.)*'/, 'string'],

        // numbers
        [/\b\d+(?:\.\d+)?\b/, 'number'],

        // internal actions starting with '.'
        [/\.[a-zA-Z_][\w]*/, {
          cases: {
            '@builtinActions': 'predefined',
            '@default': 'predefined'
          }
        }],

        // event triggers (+, -, +!, -!, +?, -?) and goal/achieve/test operators
        [/\+!|\-!|\+\?|\-\?|[+\-!?]/, 'keyword'],

        // plan arrow and context separator
        [/<\-|:-/, 'operator'],
        [/\:/, 'operator'],

        // delimiters
        [/[,;]/, 'delimiter'],
        [/\./, 'delimiter'],

        // variables (Prolog-style): start with uppercase or underscore
        [/[A-Z_][A-Za-z0-9_]*/, 'variable'],

        // atoms / predicate names (lowercase)
        [/[a-z][A-Za-z0-9_]*/, {
          cases: {
            '@keywords': 'keyword',
            '@default': 'identifier'
          }
        }],

        // brackets
        [/\(|\)|\[|\]|\{|\}/, '@brackets'],

        // operators
        [/==|!=|<=|>=|<|>|=|\|\||&&/, 'operator'],
      ],

      comment: [
        [/[^*/]+/, 'comment'],
        [/\*\//, 'comment', '@pop'],
        [/[*\/]/, 'comment'],
      ],
    },
  },

  conf: {
    comments: {
      lineComment: '//',
      blockComment: ['/*', '*/']
    },
    brackets: [
      ['{', '}'],
      ['[', ']'],
      ['(', ')']
    ],
    autoClosingPairs: [
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
    surroundingPairs: [
      { open: '"', close: '"' },
      { open: '\'', close: '\'' },
      { open: '{', close: '}' },
      { open: '[', close: ']' },
      { open: '(', close: ')' },
    ],
    wordPattern: /(-?\d*\.\d\w*)|([^\`\~\!\@\#\$\%\^\&\*\(\)\-\=\+\[\{\]\}\\\|\;\:\'\"\,\.\<\>\/\?\s]+)/g,
  },
  aliases: ['ASL', 'AgentSpeak']
};

export default aslMonarch;
