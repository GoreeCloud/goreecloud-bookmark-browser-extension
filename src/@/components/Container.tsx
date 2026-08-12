import { FC } from 'react';
import { cn } from '../lib/utils.ts';

interface ContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const Container: FC<ContainerProps> = ({ children, className, ...props }) => {
  return (
    <div
      className={cn(
        'flex h-full w-[400px] max-w-full flex-col gap-4 overflow-y-auto px-3 py-3 sm:px-4 sm:py-4',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default Container;
