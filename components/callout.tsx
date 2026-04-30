import {
  Alert02Icon,
  AlertSquareIcon,
  AlertDiamondIcon,
  InformationCircleIcon,
  Tick01Icon,
} from '@hugeicons/core-free-icons';
import { HugeiconsIcon } from '@hugeicons/react';
import type { ComponentProps, ReactNode } from 'react';
import { cn } from '../lib/cn';

export type CalloutType = 'info' | 'warn' | 'error' | 'success' | 'warning' | 'idea';

const iconClass = 'size-5 shrink-0';

export function Callout({
  children,
  title,
  ...props
}: { title?: ReactNode } & Omit<CalloutContainerProps, 'title'>) {
  return (
    <CalloutContainer {...props}>
      {title && <CalloutTitle>{title}</CalloutTitle>}
      <CalloutDescription>{children}</CalloutDescription>
    </CalloutContainer>
  );
}

export interface CalloutContainerProps extends ComponentProps<'div'> {
  /**
   * @defaultValue info
   */
  type?: CalloutType;

  /**
   * Force an icon
   */
  icon?: ReactNode;
}

function resolveAlias(type: CalloutType) {
  if (type === 'warn') return 'warning';
  if ((type as unknown) === 'tip') return 'info';
  return type;
}

export function CalloutContainer({
  type: inputType = 'info',
  icon,
  children,
  className,
  style,
  ...props
}: CalloutContainerProps) {
  const type = resolveAlias(inputType);
  const colorMap = {
    info: { bg: '#EFF6FF', fg: '#2563EB' },
    warning: { bg: '#FEFCE8', fg: '#CA8A04' },
    error: { bg: '#FEF2F2', fg: '#DC2626' },
    success: { bg: '#F0FDF4', fg: '#16A34A' },
    idea: { bg: '#EFF6FF', fg: '#2563EB' },
  } as const;
  const colors = colorMap[type];

  return (
    <div
      className={cn(
        'my-4 flex items-start gap-3 rounded-[12px] bg-(--callout-bg) px-4 py-3.5 text-[14px] leading-6.5 text-(--callout-color)',
        className,
      )}
      style={
        {
          '--callout-color': colors.fg,
          '--callout-bg': colors.bg,
          ...style,
        } as object
      }
      {...props}
    >
      {icon ??
        {
          info: (
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={1.75}
              className={cn(iconClass, 'text-(--callout-color)')}
            />
          ),
          warning: (
            <HugeiconsIcon
              icon={Alert02Icon}
              strokeWidth={1.75}
              className={cn(iconClass, 'text-(--callout-color)')}
            />
          ),
          error: (
            <HugeiconsIcon
              icon={AlertDiamondIcon}
              strokeWidth={1.75}
              className={cn(iconClass, 'text-(--callout-color)')}
            />
          ),
          success: (
            <HugeiconsIcon
              icon={Tick01Icon}
              strokeWidth={1.75}
              className={cn(iconClass, 'text-(--callout-color)')}
            />
          ),
          idea: (
            <HugeiconsIcon
              icon={InformationCircleIcon}
              strokeWidth={1.75}
              className={cn(iconClass, 'text-(--callout-color)')}
            />
          ),
        }[type]}
      <div className="min-w-0 flex-1 -mt-0.5">
        <div className="prose-no-margin prose-headings:text-(--callout-color)! prose-a:text-(--callout-color)! prose-a:underline prose-a:decoration-(--callout-color) prose-li:marker:text-(--callout-color)! prose-code:text-(--callout-color)! prose-code:bg-(--callout-color)/15! prose-strong:text-(--callout-color)! prose-strong:font-[450]!">
          {children}
        </div>
      </div>
    </div>
  );
}

export function CalloutTitle({ children, className, ...props }: ComponentProps<'p'>) {
  return (
    <p className={cn('font-medium my-0!', className)} {...props}>
      {children}
    </p>
  );
}

export function CalloutDescription({ children, className, ...props }: ComponentProps<'p'>) {
  return (
    <div
      className={cn('prose-no-margin empty:hidden', className)}
      {...props}
    >
      {children}
    </div>
  );
}

export default Callout;
