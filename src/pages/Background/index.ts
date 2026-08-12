import { getBrowser, hasAPI, updateBadge } from '../../@/lib/utils.ts';
import { getConfig, isConfigured } from '../../@/lib/config.ts';
import { postLinkFetch } from '../../@/lib/actions/links.ts';
import {
  bookmarkMetadata,
  getBookmarksMetadata,
  saveBookmarkMetadata,
} from '../../@/lib/cache.ts';
import OnClickData = chrome.contextMenus.OnClickData;
import OnInputEnteredDisposition = chrome.omnibox.OnInputEnteredDisposition;

const browser = getBrowser();
const tabsNavigation = browser.tabs as unknown as {
  update: (properties: { url: string }) => Promise<unknown> | void;
  create: (properties: { url: string; active?: boolean }) => Promise<unknown> | void;
};

browser.contextMenus.onClicked.addListener(async (info, tab) => {
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore
  await savePageFromContextMenu(info, tab);
});

async function savePageFromContextMenu(
  info: OnClickData,
  tab: chrome.tabs.Tab | undefined,
) {
  if (info.menuItemId !== 'save-page') {
    return;
  }

  const configured = await isConfigured();
  if (
    !configured ||
    !tab?.url ||
    !/^https?:\/\//.test(tab.url) ||
    !tab.title
  ) {
    return;
  }

  const config = await getConfig();

  try {
    const newLink = await postLinkFetch(
      config.baseUrl,
      {
        url: tab.url,
        collection: {
          name: config.defaultCollection,
        },
        tags: [],
        name: tab.title,
        description: tab.title,
      },
      config.apiKey,
    );

    const newLinkJson = await newLink.json();
    const newLinkUrl: bookmarkMetadata = newLinkJson.response;
    newLinkUrl.bookmarkId = tab.id?.toString();

    await saveBookmarkMetadata(newLinkUrl);
    await updateBadge(tab.id, true);
  } catch (error) {
    console.error('Failed to save the current page from the context menu.', error);
  }
}

browser.runtime.onInstalled.addListener(async function () {
  await browser.contextMenus.removeAll();
  browser.contextMenus.create({
    id: 'save-page',
    title: 'Save page to GoreeCloud Bookmarks',
    contexts: ['page'],
  });
});

// Omnibox actions are user initiated. Suggestions are derived only from the
// extension's local bookmark metadata cache; no browsing history is collected.
if (hasAPI('omnibox.onInputStarted')) {
  browser.omnibox.onInputStarted.addListener(async () => {
    const configured = await isConfigured();
    browser.omnibox.setDefaultSuggestion({
      description: configured
        ? 'Search links in GoreeCloud Bookmarks'
        : 'Please configure the extension first',
    });
  });

  browser.omnibox.onInputChanged.addListener(
    async (
      text: string,
      suggest: (arg0: { content: string; description: string }[]) => void,
    ) => {
      if (!(await isConfigured())) {
        return;
      }

      const currentBookmarks = await getBookmarksMetadata();
      const searchedBookmarks = currentBookmarks.filter((bookmark) => {
        return bookmark.name?.includes(text) || bookmark.url.includes(text);
      });

      suggest(
        searchedBookmarks.map((bookmark) => ({
          content: bookmark.url,
          description: bookmark.name || bookmark.url,
        })),
      );
    },
  );

  browser.omnibox.onInputEntered.addListener(
    async (content: string, disposition: OnInputEnteredDisposition) => {
      if (!(await isConfigured()) || !content) {
        return;
      }

      const config = await getConfig();
      const isUrl = /^https?:\/\//.test(content);
      const url = isUrl
        ? content
        : `${config.baseUrl}/search?q=${encodeURIComponent(content)}`;

      switch (disposition) {
        case 'currentTab':
          await tabsNavigation.update({ url });
          break;
        case 'newForegroundTab':
          await tabsNavigation.create({ url });
          break;
        case 'newBackgroundTab':
          await tabsNavigation.create({ url, active: false });
          break;
      }
    },
  );
}
