import { useForm } from 'react-hook-form';
import {
  bookmarkFormSchema,
  bookmarkFormValues,
} from '../lib/validators/bookmarkForm.ts';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form.tsx';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { TagInput } from './TagInput.tsx';
import { Textarea } from './ui/Textarea.tsx';
import { getCurrentTabInfo, updateBadge } from '../lib/utils.ts';
import { useEffect, useMemo, useState } from 'react';
import { useInfiniteQuery, useMutation, useQuery } from '@tanstack/react-query';
import { getConfig, isConfigured as getIsConfigured } from '../lib/config.ts';
import { checkLinkExists, postLink } from '../lib/actions/links.ts';
import { AxiosError } from 'axios';
import { toast } from '../../hooks/use-toast.ts';
import { Toaster } from './ui/Toaster.tsx';
import { getCollections } from '../lib/actions/collections.ts';
import { getShouldUseTagSearch, getTags } from '../lib/actions/tags.ts';
import {
  ExternalLink,
  FolderOpen,
  Image as ImageIcon,
  Loader2,
  Save,
  SlidersHorizontal,
  X,
} from 'lucide-react';
import { Popover, PopoverContent, PopoverTrigger } from './ui/Popover.tsx';
import { CaretSortIcon } from '@radix-ui/react-icons';
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
} from './ui/Command.tsx';
import { Checkbox } from './ui/CheckBox.tsx';
import { Label } from './ui/Label.tsx';

const BookmarkForm = () => {
  const [openOptions, setOpenOptions] = useState<boolean>(false);
  const [openCollections, setOpenCollections] = useState<boolean>(false);
  const [uploadImage, setUploadImage] = useState<boolean>(false);
  const [state, setState] = useState<'capturing' | 'uploading' | null>(null);
  const [tagSearch, setTagSearch] = useState<string>('');

  const [isConfigured, setIsConfigured] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);

  const [config, setConfig] = useState<{
    baseUrl: string;
    defaultCollection: string;
    apiKey: string;
    syncBookmarks: boolean;
  }>();
  const [tabInfo, setTabInfo] = useState<{
    id: number | undefined;
    title: string | undefined;
    url: string | undefined;
  }>();

  const handleCheckedChange = (s: boolean | 'indeterminate') => {
    if (s === 'indeterminate') return;
    setUploadImage(s);
    form.setValue('image', s ? 'png' : undefined);
  };

  const form = useForm<bookmarkFormValues>({
    resolver: zodResolver(bookmarkFormSchema),
    defaultValues: {
      url: '',
      name: '',
      collection: {
        name: 'Unorganized',
      },
      tags: [],
      description: '',
      image: undefined,
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: bookmarkFormValues) => {
      await postLink(
        config?.baseUrl as string,
        uploadImage,
        values,
        setState,
        config?.apiKey as string,
      );

      return;
    },
    onError: (error) => {
      console.error(error);
      if (error instanceof AxiosError) {
        toast({
          title: 'Error',
          description:
            error.response?.data.response ||
            'There was an error while trying to save the link. Please try again.',
          variant: 'destructive',
        });
      } else {
        toast({
          title: 'Error',
          description:
            'There was an error while trying to save the link. Please try again.',
          variant: 'destructive',
        });
      }
      return;
    },
    onSuccess: () => {
      getCurrentTabInfo().then(({ id }) => {
        updateBadge(id);
      });
      setTimeout(() => {
        window.close();
      }, 3500);
      toast({
        title: 'Saved',
        description: 'Page saved to GoreeCloud Bookmarks.',
      });
    },
  });

  useEffect(() => {
    const setTabInformation = async () => {
      const t = await getCurrentTabInfo();
      const c = await getConfig();

      setTabInfo(t);
      setConfig(c);

      updateBadge(t.id);

      form.setValue('url', t.url ? t.url : '');
      form.setValue('name', t.title ? t.title : '');
      form.setValue('collection', {
        name: c.defaultCollection,
      });

      const configured = await getIsConfigured();
      const duplicate = await checkLinkExists(c.baseUrl, c.apiKey);
      setIsDuplicate(duplicate);
      setIsConfigured(configured);
    };

    setTabInformation();
  }, []);

  const { handleSubmit, control } = form;

  const {
    isLoading: loadingCollections,
    data: collections,
    error: collectionError,
  } = useQuery({
    queryKey: ['collections'],
    queryFn: async () => {
      const response = await getCollections(
        config?.baseUrl as string,
        config?.apiKey as string,
      );

      return response.data.response.sort((a, b) => {
        return a.pathname.localeCompare(b.pathname);
      });
    },
    enabled: isConfigured,
  });

  const { data: shouldUseTagSearch = false } = useQuery({
    queryKey: ['tag-search-support', config?.baseUrl, config?.apiKey],
    queryFn: async () =>
      await getShouldUseTagSearch(
        config?.baseUrl as string,
        config?.apiKey as string,
      ),
    enabled: isConfigured && openOptions,
  });
  const effectiveTagSearch = shouldUseTagSearch ? tagSearch : '';
  const {
    isLoading: loadingTags,
    data: tagsData,
    error: tagsError,
    hasNextPage,
    isFetchingNextPage,
    fetchNextPage,
  } = useInfiniteQuery(
    ['tags', config?.baseUrl, config?.apiKey, effectiveTagSearch],
    async ({ pageParam = 0 }) => {
      return await getTags(
        config?.baseUrl as string,
        config?.apiKey as string,
        pageParam,
        effectiveTagSearch,
      );
    },
    {
      getNextPageParam: (lastPage) => lastPage.nextCursor ?? undefined,
      enabled: isConfigured && openOptions,
    },
  );

  const tags = useMemo(() => {
    return (
      tagsData?.pages
        .flatMap((page) => page.tags)
        .sort((a, b) => a.name.localeCompare(b.name)) ?? []
    );
  }, [tagsData]);

  const hasCollectionError = Boolean(collectionError);
  const hasTagsError = Boolean(tagsError);

  const collectionItems = Array.isArray(collections)
    ? collections.map(
        (collection: {
          name: string;
          id: number;
          ownerId: number;
          pathname: string;
        }) => (
          <CommandItem
            value={collection.name}
            key={collection.id}
            className="flex min-h-11 cursor-pointer flex-col items-start justify-center rounded-lg px-3 py-2"
            onSelect={() => {
              form.setValue('collection', {
                ownerId: collection.ownerId,
                id: collection.id,
                name: collection.name,
              });
              setOpenCollections(false);
            }}
          >
            <p className="text-sm font-medium">{collection.name}</p>
            <p className="mt-0.5 text-xs text-muted-foreground">
              {collection.pathname}
            </p>
          </CommandItem>
        ),
      )
    : null;

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit((values) => onSubmit(values))}
          className="space-y-4"
        >
          {hasCollectionError && (
            <div
              className="rounded-xl border border-destructive/25 bg-destructive/8 px-3 py-2.5 text-xs leading-5 text-destructive"
              role="alert"
            >
              GoreeCloud Bookmarks could not load collections. Check that the configured
              instance is available.
            </div>
          )}

          <FormField
            control={control}
            name="collection"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-xs font-semibold">Collection</FormLabel>
                <Popover open={openCollections} onOpenChange={setOpenCollections}>
                  <PopoverTrigger asChild>
                    <FormControl>
                      <Button
                        variant="outline"
                        role="combobox"
                        aria-expanded={openCollections}
                        className="w-full justify-between gap-3 px-3"
                      >
                        <span className="flex min-w-0 items-center gap-2.5">
                          <span className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
                            <FolderOpen className="h-4 w-4" aria-hidden="true" />
                          </span>
                          <span className="truncate">
                            {loadingCollections
                              ? 'Unorganized'
                              : field.value?.name
                                ? collections?.find(
                                    (collection: { name: string }) =>
                                      collection.name === field.value?.name,
                                  )?.name || form.getValues('collection')?.name
                                : 'Select a collection...'}
                          </span>
                        </span>
                        <CaretSortIcon className="h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </FormControl>
                  </PopoverTrigger>

                  {!openOptions && openCollections ? (
                    <div className="fade-up fixed inset-0 z-50 flex h-full w-full flex-col bg-background/95 p-3 text-foreground backdrop-blur-xl">
                      <div className="mb-3 flex items-center justify-between gap-3 px-1">
                        <div>
                          <p className="glaze-kicker">Destination</p>
                          <h2 className="mt-0.5 text-base font-semibold">
                            Choose collection
                          </h2>
                        </div>
                        <Button
                          type="button"
                          variant="ghost"
                          size="icon"
                          onClick={() => setOpenCollections(false)}
                          aria-label="Close collection picker"
                        >
                          <X className="h-4 w-4" aria-hidden="true" />
                        </Button>
                      </div>

                      <Command className="glaze-surface flex min-h-0 flex-1 flex-col overflow-hidden">
                        <CommandInput
                          className="min-w-[280px]"
                          placeholder="Search collections..."
                        />
                        {loadingCollections ? (
                          <div className="flex flex-1 items-center justify-center gap-2 text-sm text-muted-foreground">
                            <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
                            Loading collections...
                          </div>
                        ) : (
                          <>
                            <CommandEmpty>No collection found.</CommandEmpty>
                            <CommandGroup className="w-full flex-1 overflow-y-auto p-1.5">
                              {collectionItems}
                            </CommandGroup>
                          </>
                        )}
                      </Command>
                    </div>
                  ) : openOptions && openCollections ? (
                    <PopoverContent className="max-h-[240px] min-w-full overflow-y-auto rounded-xl p-0">
                      <Command className="min-w-full">
                        <CommandInput
                          className="min-w-[280px]"
                          placeholder="Search collections..."
                        />
                        <CommandEmpty>No collection found.</CommandEmpty>
                        <CommandGroup className="w-full p-1.5">
                          {collectionItems}
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  ) : undefined}
                </Popover>
                <FormMessage />
              </FormItem>
            )}
          />

          {isDuplicate && (
            <button
              type="button"
              className="flex w-full items-start gap-3 rounded-xl border border-accent/25 bg-accent/8 px-3 py-2.5 text-left transition-colors hover:bg-accent/12 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
              onClick={() => {
                window.open(
                  config?.baseUrl +
                    '/search?q=' +
                    encodeURIComponent(`url:${tabInfo?.url}`),
                  '_blank',
                );
                window.close();
              }}
            >
              <ExternalLink
                className="mt-0.5 h-4 w-4 shrink-0 text-accent"
                aria-hidden="true"
              />
              <span>
                <span className="block text-xs font-semibold">Already saved</span>
                <span className="mt-0.5 block text-xs leading-5 text-muted-foreground">
                  Open the existing bookmark in GoreeCloud Bookmarks.
                </span>
              </span>
            </button>
          )}

          {openOptions && (
            <div className="space-y-4 border-t border-border/70 pt-4">
              <div>
                <p className="glaze-kicker">Optional details</p>
                <p className="mt-1 text-xs leading-5 text-muted-foreground">
                  Add organization or context without slowing down ordinary capture.
                </p>
              </div>

              {hasTagsError && (
                <p className="text-xs text-destructive" role="alert">
                  Tags could not be loaded from the configured instance.
                </p>
              )}

              <FormField
                control={control}
                name="tags"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tags</FormLabel>
                    {loadingTags ? (
                      <TagInput
                        onChange={field.onChange}
                        value={[{ name: 'Loading tags...' }]}
                        tags={[{ id: 1, name: 'Loading tags...' }]}
                        hasNextPage={false}
                        isFetchingNextPage={false}
                      />
                    ) : hasTagsError ? (
                      <TagInput
                        onChange={field.onChange}
                        value={[{ name: 'Not found' }]}
                        tags={[{ id: 1, name: 'Not found' }]}
                        hasNextPage={false}
                        isFetchingNextPage={false}
                      />
                    ) : (
                      <TagInput
                        onChange={field.onChange}
                        value={field.value ?? []}
                        tags={tags}
                        hasNextPage={hasNextPage}
                        isFetchingNextPage={isFetchingNextPage}
                        onSearchChange={setTagSearch}
                        onReachEnd={() => {
                          if (!hasNextPage || isFetchingNextPage) return;
                          void fetchNextPage();
                        }}
                      />
                    )}
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Title</FormLabel>
                    <FormControl>
                      <Input placeholder="Bookmark title" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Note</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="Add a note about why you saved this page..."
                        className="resize-none"
                        {...field}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
          )}

          <Label className="glaze-soft-surface flex min-h-11 cursor-pointer items-center gap-3 px-3 py-2.5">
            <Checkbox
              checked={uploadImage}
              onCheckedChange={handleCheckedChange}
              aria-label="Capture an image of this page"
            />
            <span className="flex min-w-0 flex-1 items-center gap-2">
              <ImageIcon className="h-4 w-4 shrink-0 text-muted-foreground" aria-hidden="true" />
              <span>
                <span className="block text-xs font-medium">Capture page image</span>
                <span className="block text-[11px] leading-4 text-muted-foreground">
                  Include a browser-generated image with this save.
                </span>
              </span>
            </span>
          </Label>

          <div className="flex items-center justify-between gap-2 pt-1">
            <Button
              variant="ghost"
              type="button"
              className="gap-2"
              onClick={() => setOpenOptions((prevState) => !prevState)}
              aria-expanded={openOptions}
            >
              <SlidersHorizontal className="h-4 w-4" aria-hidden="true" />
              {openOptions ? 'Fewer options' : 'More options'}
            </Button>

            <Button disabled={isLoading} type="submit" className="min-w-24 gap-2">
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" aria-hidden="true" />
              ) : (
                <Save className="h-4 w-4" aria-hidden="true" />
              )}
              Save
            </Button>
          </div>
        </form>
      </Form>

      <Toaster />

      {state && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center bg-background/75 p-4 backdrop-blur-xl"
          role="status"
          aria-live="polite"
        >
          <div className="glaze-surface w-full max-w-xs p-5 text-center">
            <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Loader2 className="h-6 w-6 animate-spin" aria-hidden="true" />
            </span>
            <p className="mt-4 text-base font-semibold">
              {state === 'capturing' ? 'Capturing this page' : 'Uploading page image'}
            </p>
            <p className="mt-1 text-xs leading-5 text-muted-foreground">
              Keep the popup open while GoreeCloud Bookmarks finishes the capture.
            </p>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookmarkForm;
