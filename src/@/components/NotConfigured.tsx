import { FC } from 'react';
import { openOptions } from '../lib/utils.ts';
import { Button } from './ui/Button.tsx';
import { ShieldCheck } from 'lucide-react';

const NotConfigured: FC<{ open: boolean }> = ({ open }) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-background/80 p-4 backdrop-blur-xl">
      <div className="glaze-surface w-full max-w-sm p-5 text-center">
        <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/10 ring-1 ring-primary/20">
          <img
            src="./goreecloud-bookmarks.svg"
            height="48px"
            width="48px"
            className="rounded-xl shadow-sm"
            alt="GoreeCloud Bookmarks"
          />
        </div>

        <p className="glaze-kicker mt-4">Private browser companion</p>
        <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em]">
          Connect GoreeCloud Bookmarks
        </h1>
        <p className="mx-auto mt-2 max-w-xs text-sm leading-6 text-muted-foreground">
          Configure the HTTPS address for your private Bookmarks instance and an
          approved authentication method before saving pages.
        </p>

        <div className="glaze-soft-surface mt-4 flex items-start gap-3 p-3 text-left">
          <span className="mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
            <ShieldCheck className="h-4 w-4" aria-hidden="true" />
          </span>
          <p className="text-xs leading-5 text-muted-foreground">
            Extension settings stay in browser storage and are used only to connect to
            the Bookmarks instance you configure.
          </p>
        </div>

        <Button onClick={() => openOptions()} className="mt-5 w-full" size="lg">
          Configure extension
        </Button>
      </div>
    </div>
  );
};

export default NotConfigured;
