import WholeContainer from '../../@/components/WholeContainer.tsx';
import Container from '../../@/components/Container.tsx';
import { Separator } from '../../@/components/ui/Separator.tsx';
import OptionsForm from '../../@/components/OptionsForm.tsx';

const App = () => {
  return (
    <WholeContainer className="max-h-[750px]">
      <Container>
        <div className="justify-center items-center p-2 flex flex-col gap-2">
          <img
            src="/goreecloud-bookmarks.svg"
            width="48px"
            height="48px"
            className="rounded-xl"
            alt="GoreeCloud Bookmarks"
          />
          <h1 className="text-lg font-medium">
            GoreeCloud Bookmarks Extension
          </h1>
        </div>
        <div>
          <Separator />
          <p className="text-base pt-2">
            Connect this extension to your private GoreeCloud Bookmarks instance.
            Enter the instance address and authentication details below.
          </p>
        </div>
        <OptionsForm />
      </Container>
    </WholeContainer>
  );
};

export default App;
