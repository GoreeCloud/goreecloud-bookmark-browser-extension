// ./OptionsForm.tsx

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
  isConfigured,
  saveConfig,
} from '../lib/config.ts';
import { Toaster } from './ui/Toaster.tsx';
import { toast } from '../../hooks/use-toast.ts';
import { AxiosError } from 'axios';
import { clearBookmarksMetadata } from '../lib/cache.ts';
import { getSession } from '../lib/auth/auth.ts';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from './ui/Select.tsx';
import { KeyRound, Link2, LogOut, Save, ShieldCheck } from 'lucide-react';

const OptionsForm = () => {
  const form = useForm<optionsFormValues>({
    resolver: zodResolver(optionsFormSchema),
    defaultValues: {
      baseUrl: '',
      method: 'username',
      username: '',
      password: '',
      apiKey: '',
      syncBookmarks: false,
      defaultCollection: 'Unorganized',
    },
  });

  const { mutate: onReset, isLoading: resetLoading } = useMutation({
    mutationFn: async () => {
      const configured = await isConfigured();

      if (!configured) {
        return new Error('Not configured');
      }

      return;
    },
    onError: () => {
      toast({
        title: 'Error',
        description:
          "Either you didn't configure the extension or there was an error while trying to log out. Please try again.",
        variant: 'destructive',
      });
      return;
    },
    onSuccess: async () => {
      form.reset({
        baseUrl: '',
        method: 'username',
        username: '',
        password: '',
        apiKey: '',
        syncBookmarks: false,
        defaultCollection: 'Unorganized',
      });
      await clearConfig();
      await clearBookmarksMetadata();
      return;
    },
  });

  const { mutate: onSubmit, isLoading } = useMutation({
    mutationFn: async (values: optionsFormValues) => {
      values.baseUrl = values.baseUrl.replace(/\/$/, '');

      if (values.method === 'apiKey') {
        return {
          ...values,
          data: {
            response: {
              token: values.apiKey,
            },
          } as {
            response: {
              token: string;
            };
          },
        };
      } else {
        const session = await getSession(
          values.baseUrl,
          values.username,
          values.password,
        );

        if (session.status !== 200) {
          throw new Error('Invalid credentials');
        }

        return {
          ...values,
          data: session.data as {
            response: {
              token: string;
            };
          },
        };
      }
    },
    onError: (error) => {
      if (error instanceof AxiosError) {
        if (error.response?.status === 401) {
          toast({
            title: 'Error',
            description: 'Invalid credentials or API Key',
            variant: 'destructive',
          });
        } else {
          toast({
            title: 'Error',
            description: 'Something went wrong, try again please.',
            variant: 'destructive',
          });
        }
      } else {
        toast({
          title: 'Error',
          description: 'Something went wrong, check your values are correct.',
          variant: 'destructive',
        });
      }
    },
    onSuccess: async (values) => {
      await saveConfig({
        baseUrl: values.baseUrl,
        defaultCollection: values.defaultCollection,
        syncBookmarks: values.syncBookmarks,
        apiKey:
          values.method === 'apiKey' && values.apiKey
            ? values.apiKey
            : values.data.response.token,
      });

      toast({
        title: 'Saved',
        description:
          'Your settings have been saved, you can now close this tab.',
        variant: 'default',
      });
    },
  });

  useEffect(() => {
    (async () => {
      const configured = await isConfigured();
      if (configured) {
        const cachedOptions = await getConfig();
        form.reset(cachedOptions);
      }
    })();
  }, [form]);

  const { handleSubmit, control, watch } = form;
  const method = watch('method');

  return (
    <div>
      <Form {...form}>
        <form
          onSubmit={handleSubmit((data) => onSubmit(data))}
          className="space-y-5"
        >
          <section>
            <div className="mb-3 flex items-start gap-3">
              <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
                <Link2 className="h-[1.05rem] w-[1.05rem]" aria-hidden="true" />
              </span>
              <div>
                <p className="text-sm font-semibold">Bookmarks instance</p>
                <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                  Use the HTTPS address for the private GoreeCloud Bookmarks service.
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
                    The extension sends bookmark requests only to the instance configured here.
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
                  Choose the approved account method for this browser profile.
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
                          <SelectItem value="username">
                            Username and password
                          </SelectItem>
                          <SelectItem value="apiKey">API key</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormControl>
                    <FormDescription>
                      API keys are preferred when the server provides an appropriately scoped,
                      revocable token.
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
                        Treat this value as sensitive authentication material and revoke it if
                        this browser profile is no longer trusted.
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
                          <Input
                            placeholder="username"
                            {...field}
                            autoComplete="username"
                          />
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
              This screen changes extension-local connection settings only. It does not publish
              a service, change GoreeCloud networking, or approve production deployment.
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
