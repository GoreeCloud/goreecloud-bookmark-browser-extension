import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from './ui/Form.tsx';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import {
  optionsFormSchema,
  optionsFormValues,
} from '../lib/validators/optionsForm.ts';
import { Input } from './ui/Input.tsx';
import { Button } from './ui/Button.tsx';
import { useMutation } from '@tanstack/react-query';
import { useEffect } from 'react';
import {
  clearConfig,
  getConfig,
  getOrCreateClientId,
  saveConfig,
} from '../lib/config.ts';
import { Toaster } from './ui/Toaster.tsx';
import { toast } from '../../hooks/use-toast.ts';
import { AxiosError } from 'axios';
import { clearBookmarksMetadata } from '../lib/cache.ts';
import { getSession, revokeCurrentSession } from '../lib/auth/auth.ts';
import {
  getInstancePermissionPattern,
  removeInstancePermission,
  requestInstancePermission,
} from '../lib/utils.ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select.tsx';
import { KeyRound, Link2, LogOut, Save, ShieldCheck } from 'lucide-react';

const DEFAULT_FORM_VALUES: optionsFormValues = {
  baseUrl: '',
  method: 'username',
  username: '',
  password: '',
  apiKey: '',
  syncBookmarks: false,
  defaultCollection: 'Unorganized',
};

const OptionsForm = () => {
  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: DEFAULT_FORM_VALUES,
  });

  const { mutate: onReset, isLoading: resetLoading } = useMutation({
    mutationFn: async () => {
      const config = await getConfig();
      let revocationStatus:
        | 'revoked'
        | 'not-found'
        | 'manual'
        | 'failed'
        | 'none' = 'none';

      if (
        config.authSource === 'session' &&
        config.baseUrl &&
        config.apiKey
      ) {
        try {
          revocationStatus = (await revokeCurrentSession(
            config.baseUrl,
            config.apiKey,
          ))
            ? 'revoked'
            : 'not-found';
        } catch {
          revocationStatus = 'failed';
        }
      } else if (
        config.authSource === 'apiKey' ||
        config.authSource === 'legacy'
      ) {
        revocationStatus = 'manual';
      }

      await clearConfig();
      await clearBookmarksMetadata();

      if (config.baseUrl) {
        try {
          await removeInstancePermission(config.baseUrl);
        } catch {
          // The local secret is already cleared. Permission cleanup is best effort.
        }
      }

      return revocationStatus;
    },
    onError: () => {
      toast({
        title: 'Disconnect failed',
        description: 'The extension could not clear its local connection state.',
        variant: 'destructive',
      });
    },
    onSuccess: (revocationStatus) => {
      form.reset(DEFAULT_FORM_VALUES);

      const description =
        revocationStatus === 'revoked'
          ? 'The dedicated browser session was revoked and local connection data was cleared.'
          : revocationStatus === 'manual'
            ? 'Local access was removed. Revoke the API key in GoreeCloud Bookmarks if it should no longer remain valid.'
            : revocationStatus === 'failed'
              ? 'Local access was removed, but remote session revocation could not be confirmed. Revoke the browser session from GoreeCloud Bookmarks.'
              : revocationStatus === 'not-found'
                ? 'Local access was removed. The browser session was already inactive or unavailable.'
                : 'Local connection data was cleared.';

      toast({
        title: 'Disconnected',
        description,
      });
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: optionsFormValues) => {
      const previousConfig = await getConfig();
      const baseUrl = values.baseUrl.replace(/\/+$/, '');

      if (values.method === 'apiKey') {
        return {
          ...values,
          baseUrl,
          previousConfig,
          authSource: 'apiKey' as const,
          sessionName: undefined,
          data: {
            response: {
              token: values.apiKey as string,
            },
          },
        };
      }

      const clientId = await getOrCreateClientId();
      const sessionName = `GoreeCloud Bookmarks Firefox ${clientId.slice(0, 8)}`;
      const session = await getSession(
        baseUrl,
        values.username,
        values.password,
        sessionName,
      );

      if (session.status !== 200) {
        throw new Error('Invalid credentials');
      }

      return {
        ...values,
        baseUrl,
        previousConfig,
        authSource: 'session' as const,
        sessionName,
        data: session.data as {
          response: {
            token: string;
          };
        },
      };
    },
    onError: (error) => {
      if (error instanceof AxiosError && error.response?.status === 401) {
        toast({
          title: 'Connection failed',
          description: 'Invalid credentials or API key.',
          variant: 'destructive',
        });
        return;
      }

      toast({
        title: 'Connection failed',
        description: 'Check the instance address and authentication details, then try again.',
        variant: 'destructive',
      });
    },
    onSuccess: async (values) => {
      const newToken = values.data.response.token;
      const previous = values.previousConfig;

      if (
        previous.authSource === 'session' &&
        previous.baseUrl &&
        previous.apiKey
      ) {
        try {
          const previousPattern = getInstancePermissionPattern(previous.baseUrl);
          const newPattern = getInstancePermissionPattern(values.baseUrl);
          if (previousPattern !== newPattern) {
            await revokeCurrentSession(previous.baseUrl, previous.apiKey);
          }
        } catch {
          // The old session remains independently revocable from the web application.
        }
      }

      await saveConfig({
        baseUrl: values.baseUrl,
        defaultCollection: values.defaultCollection,
        syncBookmarks: false,
        apiKey: newToken,
        authSource: values.authSource,
        sessionName: values.sessionName,
      });

      if (previous.baseUrl) {
        try {
          const previousPattern = getInstancePermissionPattern(previous.baseUrl);
          const newPattern = getInstancePermissionPattern(values.baseUrl);
          if (previousPattern !== newPattern) {
            await removeInstancePermission(previous.baseUrl);
          }
        } catch {
          // Permission cleanup is best effort after a successful new connection.
        }
      }

      toast({
        title: 'Connected',
        description:
          values.authSource === 'session'
            ? 'A dedicated 30-day browser session is active. Reconnect to renew it; your password was not stored.'
            : 'The API key is stored only in this browser profile and can be revoked from GoreeCloud Bookmarks.',
      });
    },
  });

  useEffect(() => {
    (async () => {
      const cached = await getConfig();
      form.reset({
        ...DEFAULT_FORM_VALUES,
        baseUrl: cached.baseUrl,
        defaultCollection: cached.defaultCollection,
        method: cached.authSource === 'apiKey' ? 'apiKey' : 'username',
      });
    })();
  }, [form]);

  const { handleSubmit, control, watch } = form;
  const method = watch('method');

  const submitWithPermission = handleSubmit(async (values) => {
    const baseUrl = values.baseUrl.replace(/\/+$/, '');

    try {
      const granted = await requestInstancePermission(baseUrl);
      if (!granted) {
        toast({
          title: 'Permission required',
          description:
            'Allow access to this Bookmarks instance so the extension can send user-requested bookmark actions to it.',
          variant: 'destructive',
        });
        return;
      }
    } catch {
      toast({
        title: 'Permission request failed',
        description: 'Use a valid HTTPS GoreeCloud Bookmarks instance address.',
        variant: 'destructive',
      });
      return;
    }

    onSubmit({ ...values, baseUrl });
  });

  return (
    <div>
      <Form {...form}>
        <form onSubmit={submitWithPermission} className="space-y-5">
          <section>
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Link2 className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Bookmarks instance</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  The extension requests access only to the HTTPS instance you approve here.
                </p>
              </div>
            </div>

            <FormField
              control={control}
              name="baseUrl"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Instance URL</FormLabel>
                  <FormControl>
                    <Input
                      inputMode="url"
                      autoComplete="url"
                      placeholder="https://bookmarks.goreecloud.com"
                      {...field}
                    />
                  </FormControl>
                  <FormDescription>
                    Saving the connection may trigger Firefox to request access to this exact host.
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </section>

          <div className="h-px bg-border/70" />

          <section>
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <KeyRound className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Authentication</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Use a dedicated browser session when possible; API keys remain supported for compatibility.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <FormField
                control={control}
                name="method"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Authentication method</FormLabel>
                    <FormControl>
                      <Select value={field.value} onValueChange={field.onChange}>
                        <SelectTrigger className="w-full">
                          <SelectValue placeholder="Select authentication method" />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="username">Username and password</SelectItem>
                          <SelectItem value="apiKey">API key</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      Username/password is exchanged for a purpose-scoped 30-day browser session. Reconnect when it expires; the password itself is not persisted.
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />

              {method === 'apiKey' ? (
                <FormField
                  control={control}
                  name="apiKey"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API key</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Paste your API key"
                          {...field}
                          type="password"
                          autoComplete="off"
                        />
                      </FormControl>
                      <FormDescription>
                        The key is stored in extension-local browser storage. Disconnect clears the local copy; revoke the key in Bookmarks to invalidate it remotely.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              ) : (
                <div className="grid gap-4 sm:grid-cols-2">
                  <FormField
                    control={control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Username or email</FormLabel>
                        <FormControl>
                          <Input placeholder="username" {...field} autoComplete="username" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Password</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="••••••••••••••"
                            {...field}
                            type="password"
                            autoComplete="current-password"
                          />
                        </FormControl>
                        <FormDescription>The password is used only for the session exchange and is not stored.</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>
              )}
            </div>
          </section>

          <div className="glaze-soft-surface flex items-start gap-3 p-3.5">
            <ShieldCheck
              className="mt-0.5 h-[1.05rem] w-[1.05rem] shrink-0 text-primary"
              aria-hidden="true"
            />
            <p className="text-xs leading-5 text-muted-foreground">
              GoreeCloud Bookmarks no longer requests blanket access to all websites. Page access is temporary and user-initiated; server access is granted separately for the configured HTTPS host, and browser sessions are limited to the extension API actions they require.
            </p>
          </div>

          <div className="flex flex-col-reverse gap-2 pt-1 sm:flex-row sm:items-center sm:justify-between">
            <Button
              type="button"
              variant="outline"
              onClick={() => onReset()}
              disabled={resetLoading}
              className="gap-2"
            >
              <LogOut className="h-4 w-4" aria-hidden="true" />
              Disconnect
            </Button>
            <Button disabled={isLoading} type="submit" className="gap-2">
              <Save className="h-4 w-4" aria-hidden="true" />
              Save connection
            </Button>
          </div>
        </form>
      </Form>
      <Toaster />
    </div>
  );
};

export default OptionsForm;
