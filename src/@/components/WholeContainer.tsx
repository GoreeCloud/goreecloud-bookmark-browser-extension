import { FC } from 'react';
import { cn } from '../lib/utils.ts';

interface WholeContainerProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const WholeContainer: FC<WholeContainerProps> = ({
  children,
  className,
  ...props
}) => {
  return (
    <div
      className={cn(
        'relative inset-0 flex max-h-[620px] min-h-full w-full justify-center overflow-hidden bg-[radial-gradient(circle_at_top_left,hsl(var(--primary)/0.13),transparent_35%),radial-gradient(circle_at_bottom_right,hsl(var(--accent)/0.08),transparent_32%),hsl(var(--background))]',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
};

export default WholeContainer;
