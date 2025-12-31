/**
 * IPC Channel definitions for communication between main and renderer processes
 */

export const IPC_CHANNELS = {
  // LLM Generation
  LLM_GENERATE: 'llm:generate',
  LLM_RESPONSE: 'llm:response',
  LLM_STREAM_START: 'llm:stream:start',
  LLM_STREAM_CHUNK: 'llm:stream:chunk',
  LLM_STREAM_END: 'llm:stream:end',
  LLM_STREAM_ERROR: 'llm:stream:error',
  LLM_CANCEL: 'llm:cancel',
  LLM_GET_MODELS: 'llm:get-models',
  LLM_LOAD_MODEL: 'llm:load-model',

  // File Operations
  FILE_READ: 'file:read',
  FILE_WRITE: 'file:write',
  FILE_DELETE: 'file:delete',
  FILE_CREATE: 'file:create',
  FILE_LIST: 'file:list',
  FILE_WATCH: 'file:watch',
  FILE_UNWATCH: 'file:unwatch',
  FILE_UPDATED: 'file:updated',

  // Project Management
  PROJECT_CREATE: 'project:create',
  PROJECT_OPEN: 'project:open',
  PROJECT_SAVE: 'project:save',
  PROJECT_CLOSE: 'project:close',
  PROJECT_LIST: 'project:list',
  PROJECT_DELETE: 'project:delete',
  PROJECT_EXPORT: 'project:export',

  // Chat History
  CHAT_ADD_MESSAGE: 'chat:add-message',
  CHAT_GET_HISTORY: 'chat:get-history',
  CHAT_CLEAR_HISTORY: 'chat:clear-history',
  CHAT_SAVE: 'chat:save',

  // Settings
  SETTINGS_GET: 'settings:get',
  SETTINGS_SET: 'settings:set',
  SETTINGS_RESET: 'settings:reset',

  // App Events
  APP_READY: 'app:ready',
  APP_ERROR: 'app:error',
  APP_NOTIFICATION: 'app:notification',
  APP_PROGRESS: 'app:progress',

  // Preview
  PREVIEW_RENDER: 'preview:render',
  PREVIEW_UPDATE: 'preview:update',
  PREVIEW_ERROR: 'preview:error',
} as const;

export type IPCChannel = typeof IPC_CHANNELS[keyof typeof IPC_CHANNELS];
