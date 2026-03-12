"use client";

import { ChevronDown } from "lucide-react";
import Link from "fumadocs-core/link";
import { cva } from "class-variance-authority";
import { cn } from "../lib/cn";
import {
  type ComponentProps,
  type ReactNode,
  useEffect,
  useState,
} from "react";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "./ui/collapsible";

export interface ParameterNode {
  name: string;
  description: ReactNode;
}

export interface TypeNode {
  /**
   * Additional description of the field
   */
  description?: ReactNode;

  /**
   * type signature (short)
   */
  type: ReactNode;

  /**
   * type signature (full)
   */
  typeDescription?: ReactNode;

  /**
   * Optional `href` for the type
   */
  typeDescriptionLink?: string;

  default?: ReactNode;

  required?: boolean;
  deprecated?: boolean;

  /**
   * a list of parameters info if the type is a function.
   */
  parameters?: ParameterNode[];

  returns?: ReactNode;
}

const fieldVariants = cva("text-gray-900 dark:text-gray-500 not-prose pe-2");

export function TypeTable({
  id,
  type,
  className,
  ...props
}: { type: Record<string, TypeNode> } & ComponentProps<"div">) {
  return (
    <div
      id={id}
      className={cn(
        "@container my-6 flex flex-col overflow-hidden rounded-xl border border-gray-200 bg-gray-100 text-sm text-gray-900 dark:border-gray-800 dark:bg-gray-950",
        className,
      )}
      {...props}
    >
      <div className="not-prose flex items-center px-6 py-2.5 font-normal text-gray-400 dark:text-gray-500">
        <p className="w-1/4">Prop</p>
        <p className="@max-xl:hidden">Type</p>
      </div>
      <div className="flex flex-col rounded-xl bg-white dark:bg-gray-900">
        {Object.entries(type).map(([key, value]) => (
          <Item key={key} parentId={id} name={key} item={value} />
        ))}
      </div>
    </div>
  );
}

function Item({
  parentId,
  name,
  item: {
    parameters = [],
    description,
    required = false,
    deprecated,
    typeDescription,
    default: defaultValue,
    type,
    typeDescriptionLink,
    returns,
  },
}: {
  parentId?: string;
  name: string;
  item: TypeNode;
}) {
  const [open, setOpen] = useState(false);
  const id = parentId ? `${parentId}-${name}` : undefined;

  useEffect(() => {
    const hash = window.location.hash;
    if (!id || !hash) return;
    if (`#${id}` === hash) setOpen(true);
  }, [id]);

  return (
    <Collapsible
      id={id}
      open={open}
      onOpenChange={(v) => {
        if (v && id) {
          window.history.replaceState(null, "", `#${id}`);
        }
        setOpen(v);
      }}
      className={cn(
        "scroll-m-20 overflow-hidden border-0 border-t border-gray-100 transition-all first:rounded-t-xl first:border-t-0 last:rounded-b-xl dark:border-gray-800",
        open && "bg-gray-50 dark:bg-gray-950",
      )}
    >
      <CollapsibleTrigger className="group not-prose relative flex w-full flex-row items-center px-6 py-3.5 text-start hover:bg-gray-200/50 dark:hover:bg-gray-800/50 data-[state=open]:bg-gray-50 dark:data-[state=open]:bg-gray-800">
        <code
          className={cn(
            "w-1/4 min-w-fit pe-2 font-mono font-medium text-gray-900 dark:text-gray-400",
            deprecated && "text-gray-400 line-through dark:text-gray-50",
          )}
        >
          {name}
          {!required && "?"}
        </code>
        {typeDescriptionLink ? (
          <Link href={typeDescriptionLink} className="underline @max-xl:hidden">
            {type}
          </Link>
        ) : (
          <span className="@max-xl:hidden text-gray-900 dark:text-gray-400">{type}</span>
        )}
        <ChevronDown className="absolute end-2 size-4 text-gray-400 transition-transform group-data-[state=open]:rotate-180 dark:text-gray-500" />
      </CollapsibleTrigger>
      <CollapsibleContent className="bg-gray-50 dark:bg-gray-800">
        <div className="fd-scroll-container grid grid-cols-[1fr_3fr] gap-y-4 overflow-auto border-t px-6 py-3 text-sm">
          <div className="col-span-full prose prose-no-margin text-sm empty:hidden">
            {description}
          </div>
          {typeDescription && (
            <>
              <p className={cn(fieldVariants())}>Type</p>
              <p className="not-prose my-auto">{typeDescription}</p>
            </>
          )}
          {defaultValue && (
            <>
              <p className={cn(fieldVariants())}>Default</p>
              <p className="not-prose my-auto text-gray-900 dark:text-gray-300">{defaultValue}</p>
            </>
          )}
          {parameters.length > 0 && (
            <>
              <p className={cn(fieldVariants())}>Parameters</p>
              <div className="flex flex-col gap-2">
                {parameters.map((param) => (
                  <div
                    key={param.name}
                    className="inline-flex flex-wrap items-center gap-1"
                  >
                    <p className="not-prose font-medium text-nowrap">
                      {param.name} -
                    </p>
                    <div className="prose prose-no-margin text-sm">
                      {param.description}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
          {returns && (
            <>
              <p className={cn(fieldVariants())}>Returns</p>
              <div className="my-auto prose prose-no-margin text-sm">
                {returns}
              </div>
            </>
          )}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}
