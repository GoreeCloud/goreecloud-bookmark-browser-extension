import Container from '../../@/components/Container.tsx';
import WholeContainer from '../../@/components/WholeContainer.tsx';
import BookmarkForm from '../../@/components/BookmarkForm.tsx';
import { openOptions } from '../../@/lib/utils.ts';
import { useEffect, useState } from 'react';
import { getConfig, isConfigured } from '../../@/lib/config.ts';
import NotConfigured from '../../@/components/NotConfigured.tsx';
import { ModeToggle } from '../../@/components/ModeToggle.tsx';
import { Button } from '@/@/components/ui/Button.tsx';
import { Settings } from 'lucide-react';

function App() {
  const [isAllConfigured, setIsAllConfigured] = useState<boolean>();
  const [baseUrl, setBaseUrl] = useState<string>();

  useEffect(() => {
    (async () => {
      const cachedOptions = await isConfigured();
      const cachedConfig = await getConfig();

      setBaseUrl(cachedConfig.baseUrl);
      setIsAllConfigured(cachedOptions);
    })();
  }, []);

  return (
    <WholeContainer>
      <Container>
        <header className="glaze-surface flex items-center justify-between gap-3 px-3.5 py-3">
          <a
            href={baseUrl}
            rel="noopener"
            target="_blank"
            referrerPolicy="no-referrer"
            className="group flex min-w-0 items-center gap-3 rounded-xl focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
            aria-label="Open GoreeCloud Bookmarks"
          >
            <img
              src="./goreecloud-bookmarks.svg"
              height="38px"
              width="38px"
              className="rounded-xl shadow-sm transition-transform duration-150 group-hover:scale-[1.03]"
              alt=""
              aria-hidden="true"
            />
            <div className="min-w-0">
              <p className="glaze-kicker">GoreeCloud Bookmarks</p>
              <h1 className="truncate text-[15px] font-semibold tracking-[-0.01em]">
                Save this page
              </h1>
            </div>
          </a>

          <div className="flex shrink-0 items-center gap-1">
            <ModeToggle />
            <Button
              variant="ghost"
              size="icon"
              onClick={openOptions}
              aria-label="Open GoreeCloud Bookmarks extension settings"
              title="Extension settings"
            >
              <Settings className="h-[1.15rem] w-[1.15rem]" aria-hidden="true" />
            </Button>
          </div>
        </header>

        <main className="glaze-surface p-4">
          <div className="mb-3">
            <p className="text-xs leading-5 text-muted-foreground">
              Save the current page to your private library. Choose a collection now,
              or open more options for tags and notes.
            </p>
          </div>
          <BookmarkForm />
        </main>

        <NotConfigured open={!isAllConfigured} />
      </Container>
    </WholeContainer>
  );
}

export default App;
