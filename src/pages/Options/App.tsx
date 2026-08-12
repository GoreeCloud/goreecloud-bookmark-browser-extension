import WholeContainer from '../../@/components/WholeContainer.tsx';
import Container from '../../@/components/Container.tsx';
import OptionsForm from '../../@/components/OptionsForm.tsx';
import { ShieldCheck } from 'lucide-react';

const App = () => {
  return (
    <WholeContainer className="max-h-none min-h-screen overflow-y-auto">
      <Container className="w-[min(100vw-2rem,640px)] py-6 sm:py-10">
        <header className="glaze-surface p-5 sm:p-6">
          <div className="flex items-start gap-4">
            <img
              src="/goreecloud-bookmarks.svg"
              width="52px"
              height="52px"
              className="rounded-2xl shadow-sm"
              alt="GoreeCloud Bookmarks"
            />
            <div className="min-w-0 flex-1">
              <p className="glaze-kicker">Firefox extension</p>
              <h1 className="mt-1 text-xl font-semibold tracking-[-0.02em] sm:text-2xl">
                GoreeCloud Bookmarks
              </h1>
              <p className="mt-2 max-w-lg text-sm leading-6 text-muted-foreground">
                Connect the browser companion to your private Bookmarks instance. The
                extension keeps capture focused while the web application remains the
                full library workspace.
              </p>
            </div>
          </div>

          <div className="glaze-soft-surface mt-5 flex items-start gap-3 p-3.5">
            <span className="mt-0.5 flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary">
              <ShieldCheck className="h-[1.1rem] w-[1.1rem]" aria-hidden="true" />
            </span>
            <div>
              <p className="text-sm font-medium">Private connection</p>
              <p className="mt-0.5 text-xs leading-5 text-muted-foreground">
                Use the HTTPS address of the GoreeCloud Bookmarks service and an
                approved account credential or API key. No production service is
                configured by this development branch.
              </p>
            </div>
          </div>
        </header>

        <main className="glaze-surface p-4 sm:p-6">
          <OptionsForm />
        </main>
      </Container>
    </WholeContainer>
  );
};

export default App;
