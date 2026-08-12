import {
  getStorageItem,
  hasInstancePermission,
  removeStorageItem,
  setStorageItem,
} from './utils.ts';
import { configType } from './validators/config.ts';

const CONFIG_KEY = 'linkwarden_config';
const TOKEN_KEY = 'goreecloud_bookmarks_auth_token';
const CLIENT_ID_KEY = 'goreecloud_bookmarks_client_id';

const DEFAULTS: configType = {
  baseUrl: '',
  apiKey: '',
  defaultCollection: 'Unorganized',
  syncBookmarks: false,
  authSource: null,
  sessionName: undefined,
};

function getPersistedConfig(config: configType) {
  return {
    baseUrl: config.baseUrl,
    defaultCollection: config.defaultCollection,
    syncBookmarks: false,
    authSource: config.authSource,
    sessionName: config.sessionName,
  };
}

export async function getOrCreateClientId() {
  const existing = await getStorageItem(CLIENT_ID_KEY);
  if (typeof existing === 'string' && existing) {
    return existing;
  }

  const clientId = crypto.randomUUID();
  await setStorageItem(CLIENT_ID_KEY, clientId);
  return clientId;
}

export async function getConfig(): Promise<configType> {
  const rawConfig = await getStorageItem(CONFIG_KEY);
  const parsed =
    typeof rawConfig === 'string'
      ? (JSON.parse(rawConfig) as Partial<configType>)
      : {};

  let storedToken = await getStorageItem(TOKEN_KEY);

  // Migrate the inherited configuration format, which stored the bearer token
  // inside the general JSON configuration record. The token remains in
  // extension-local browser storage, but is separated from ordinary settings
  // so configuration inspection/export does not reproduce the secret value.
  if (
    typeof parsed.apiKey === 'string' &&
    parsed.apiKey &&
    typeof storedToken !== 'string'
  ) {
    storedToken = parsed.apiKey;
    await setStorageItem(TOKEN_KEY, parsed.apiKey);
  }

  const config: configType = {
    ...DEFAULTS,
    ...parsed,
    apiKey: typeof storedToken === 'string' ? storedToken : '',
    authSource:
      parsed.authSource ??
      (typeof parsed.apiKey === 'string' && parsed.apiKey ? 'legacy' : null),
  };

  if (typeof parsed.apiKey === 'string' && parsed.apiKey) {
    await setStorageItem(CONFIG_KEY, JSON.stringify(getPersistedConfig(config)));
  }

  return config;
}

export async function saveConfig(config: configType) {
  await setStorageItem(CONFIG_KEY, JSON.stringify(getPersistedConfig(config)));
  await setStorageItem(TOKEN_KEY, config.apiKey);
}

export async function isConfigured() {
  const config = await getConfig();

  if (!config.baseUrl || !config.apiKey) {
    return false;
  }

  try {
    return await hasInstancePermission(config.baseUrl);
  } catch {
    return false;
  }
}

export async function clearConfig() {
  await removeStorageItem(TOKEN_KEY);
  await setStorageItem(CONFIG_KEY, JSON.stringify(getPersistedConfig(DEFAULTS)));
}
