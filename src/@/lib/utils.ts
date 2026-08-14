import { type ClassValue, clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface TabInfo {
  url: string;
  title: string;
}

type StorageAreaLike = {
  get: (keys: string | string[]) => Promise<Record<string, unknown>>;
  set: (items: Record<string, unknown>) => Promise<void>;
  remove: (keys: string | string[]) => Promise<void>;
};

type PermissionsApiLike = {
  request: (permissions: { origins?: string[] }) => Promise<boolean>;
  contains: (permissions: { origins?: string[] }) => Promise<boolean>;
  remove: (permissions: { origins?: string[] }) => Promise<boolean>;
};

export async function getCurrentTabInfo(): Promise<{
  id: number | undefined;
  title: string | undefined;
  url: string | undefined;
}> {
  const tabs = await getBrowser().tabs.query({
    active: true,
    currentWindow: true,
  });
  const tab = tabs[0];
  return {
    id: tab?.id,
    url: tab?.url,
    title: tab?.title,
  };
}

export function getBrowser() {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  return typeof browser !== 'undefined' ? browser : chrome;
}

function getLocalStorageArea(): StorageAreaLike {
  const api = getBrowser() as unknown as {
    storage?: {
      local?: StorageAreaLike;
    };
  };
  const storageArea = api.storage?.local;

  if (!storageArea) {
    throw new Error('Browser storage.local is not available.');
  }

  return storageArea;
}

export async function getStorageItem(key: string) {
  const result = await getLocalStorageArea().get([key]);
  return result[key];
}

export async function setStorageItem(key: string, value: string) {
  await getLocalStorageArea().set({ [key]: value });
}

export async function removeStorageItem(key: string) {
  await getLocalStorageArea().remove(key);
}

export function openOptions() {
  getBrowser().runtime.openOptionsPage();
}

export function isSafari(): boolean {
  try {
    return /^safari-web-extension:/.test(getBrowser().runtime.getURL(''));
  } catch {
    return false;
  }
}

export function hasAPI(api: string): boolean {
  let obj: unknown = getBrowser();

  for (const part of api.split('.')) {
    if (typeof obj !== 'object' || obj === null || !(part in obj)) {
      return false;
    }
    obj = (obj as Record<string, unknown>)[part];
  }

  return typeof obj !== 'undefined';
}

export function getInstancePermissionPattern(baseUrl: string): string {
  const url = new URL(baseUrl);

  if (url.protocol !== 'https:') {
    throw new Error('GoreeCloud Bookmarks requires an HTTPS instance URL.');
  }

  return `https://${url.hostname}/*`;
}

function getPermissionsApi(): PermissionsApiLike {
  const api = (getBrowser() as unknown as { permissions?: PermissionsApiLike })
    .permissions;

  if (!api) {
    throw new Error('Browser runtime permissions are not available.');
  }

  return api;
}

export async function requestInstancePermission(baseUrl: string) {
  return await getPermissionsApi().request({
    origins: [getInstancePermissionPattern(baseUrl)],
  });
}

export async function hasInstancePermission(baseUrl: string) {
  return await getPermissionsApi().contains({
    origins: [getInstancePermissionPattern(baseUrl)],
  });
}

export async function removeInstancePermission(baseUrl: string) {
  return await getPermissionsApi().remove({
    origins: [getInstancePermissionPattern(baseUrl)],
  });
}

export async function updateBadge(
  tabId: number | undefined,
  isSaved = false,
) {
  if (!tabId) return;

  const browserApi = getBrowser();
  const text = isSaved ? '✓' : '';

  if (browserApi.action) {
    await browserApi.action.setBadgeText({ tabId, text });
    if (isSaved) {
      await browserApi.action.setBadgeBackgroundColor({
        tabId,
        color: '#98c0ff',
      });
    }
    return;
  }

  await browserApi.browserAction.setBadgeText({ tabId, text });
  if (isSaved) {
    await browserApi.browserAction.setBadgeBackgroundColor({
      tabId,
      color: '#98c0ff',
    });
  }
}
