import { getStorageItem, setStorageItem } from './utils.ts';
import { bookmarkFormValues } from './validators/bookmarkForm.ts';

const BOOKMARKS_METADATA_KEY = 'lw_bookmarks_metadata_cache';

export interface bookmarkMetadata extends bookmarkFormValues {
  id: number;
  collectionId: number;
  bookmarkId?: string;
}

const DEFAULTS: bookmarkMetadata[] = [];

export async function getBookmarksMetadata(): Promise<bookmarkMetadata[]> {
  const bookmarksMetadata = await getStorageItem(BOOKMARKS_METADATA_KEY);

  if (typeof bookmarksMetadata !== 'string' || !bookmarksMetadata) {
    return DEFAULTS;
  }

  return JSON.parse(bookmarksMetadata) as bookmarkMetadata[];
}

export async function saveBookmarksMetadata(
  bookmarksMetadata: bookmarkMetadata[],
) {
  return await setStorageItem(
    BOOKMARKS_METADATA_KEY,
    JSON.stringify(bookmarksMetadata),
  );
}

export async function clearBookmarksMetadata() {
  return await setStorageItem(BOOKMARKS_METADATA_KEY, JSON.stringify([]));
}

export async function getBookmarkMetadataById(
  id: number,
): Promise<bookmarkMetadata | undefined> {
  const bookmarksMetadata = await getBookmarksMetadata();
  return bookmarksMetadata.find(
    (bookmarkMetadata) => bookmarkMetadata.id === id,
  );
}

export async function getBookmarkMetadataByBookmarkId(
  bookmarkId: string,
): Promise<bookmarkMetadata | undefined> {
  const bookmarksMetadata = await getBookmarksMetadata();
  return bookmarksMetadata.find(
    (bookmarkMetadata) => bookmarkMetadata.bookmarkId === bookmarkId,
  );
}

export async function getBookmarkMetadataByUrl(
  url: string,
): Promise<bookmarkMetadata | undefined> {
  const bookmarksMetadata = await getBookmarksMetadata();
  return bookmarksMetadata.find(
    (bookmarkMetadata) => bookmarkMetadata.url === url,
  );
}

export async function saveBookmarkMetadata(bookmarkMetadata: bookmarkMetadata) {
  const bookmarksMetadata = await getBookmarksMetadata();
  const index = bookmarksMetadata.findIndex(
    (bookmarkMetadataObject) =>
      bookmarkMetadataObject.id === bookmarkMetadata.id,
  );

  if (index !== -1) {
    bookmarksMetadata[index] = bookmarkMetadata;
  } else {
    bookmarksMetadata.push(bookmarkMetadata);
  }

  return await saveBookmarksMetadata(bookmarksMetadata);
}

export async function deleteBookmarkMetadata(id: string | undefined) {
  const bookmarksMetadata = await getBookmarksMetadata();
  const index = bookmarksMetadata.findIndex(
    (bookmarkMetadata) => bookmarkMetadata.bookmarkId === id,
  );

  if (index !== -1) {
    bookmarksMetadata.splice(index, 1);
  }

  return await saveBookmarksMetadata(bookmarksMetadata);
}
