"use client";

import * as React from "react";
import { CheckIcon, CopyIcon } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type BundledLanguage = string;

type BaseCodeItem = {
  language: string;
  filename?: string;
  code: string;
};

type CodeBlockContextValue<T extends BaseCodeItem> = {
  data: T[];
  selected: string;
  setSelected: (value: string) => void;
};

const CodeBlockContext = React.createContext<CodeBlockContextValue<any> | null>(null);

function useCodeBlock<T extends BaseCodeItem>() {
  const ctx = React.useContext(CodeBlockContext as React.Context<CodeBlockContextValue<T> | null>);
  if (!ctx) {
    throw new Error("CodeBlock components must be used inside <CodeBlock>");
  }
  return ctx;
}

function CodeBlock<T extends BaseCodeItem>({
  data,
  defaultValue,
  className,
  children,
}: {
  data: T[];
  defaultValue?: string;
  className?: string;
  children: React.ReactNode;
}) {
  const [selected, setSelected] = React.useState(defaultValue ?? data[0]?.language ?? "");

  return (
    <CodeBlockContext.Provider value={{ data, selected, setSelected }}>
      <div className={cn("w-full overflow-hidden rounded-md border bg-black text-white", className)}>
        {children}
      </div>
    </CodeBlockContext.Provider>
  );
}

function CodeBlockHeader({ className, ...props }: React.ComponentProps<"div">) {
  return (
    <div
      className={cn("flex items-center justify-between gap-2 border-b border-white/10 px-3 py-2", className)}
      {...props}
    />
  );
}

function CodeBlockFiles<T extends BaseCodeItem>({
  children,
  className,
}: {
  children: (item: T) => React.ReactNode;
  className?: string;
}) {
  const { data } = useCodeBlock<T>();
  return <div className={cn("flex items-center gap-1", className)}>{data.map((item) => children(item))}</div>;
}

function CodeBlockFilename({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { selected, setSelected } = useCodeBlock<BaseCodeItem>();
  return (
    <button
      type="button"
      onClick={() => setSelected(value)}
      className={cn(
        "rounded px-2 py-1 text-xs transition-colors",
        selected === value ? "bg-white/20 text-white" : "text-white/70 hover:text-white",
        className
      )}
    >
      {children}
    </button>
  );
}

function CodeBlockSelect({ children, className }: { children: React.ReactNode; className?: string }) {
  const { selected, setSelected } = useCodeBlock<BaseCodeItem>();
  return (
    <div className={cn("min-w-[110px]", className)}>
      <Select value={selected} onValueChange={setSelected}>
        {children}
      </Select>
    </div>
  );
}

function CodeBlockSelectTrigger({ className, children }: React.ComponentProps<typeof SelectTrigger>) {
  return (
    <SelectTrigger className={cn("h-8 bg-white/10 text-white border-white/20", className)}>
      {children}
    </SelectTrigger>
  );
}

function CodeBlockSelectValue(props: React.ComponentProps<typeof SelectValue>) {
  return <SelectValue {...props} />;
}

function CodeBlockSelectContent<T extends BaseCodeItem>({
  children,
  className,
}: {
  children: (item: T) => React.ReactNode;
  className?: string;
}) {
  const { data } = useCodeBlock<T>();
  return <SelectContent className={className}>{data.map((item) => children(item))}</SelectContent>;
}

function CodeBlockSelectItem(props: React.ComponentProps<typeof SelectItem>) {
  return <SelectItem {...props} />;
}

function CodeBlockCopyButton({ className }: { className?: string }) {
  const { data, selected } = useCodeBlock<BaseCodeItem>();
  const [copied, setCopied] = React.useState(false);

  const current = data.find((item) => item.language === selected);

  const onCopy = async () => {
    if (!current?.code) return;
    await navigator.clipboard.writeText(current.code);
    setCopied(true);
    setTimeout(() => setCopied(false), 1200);
  };

  return (
    <button
      type="button"
      onClick={onCopy}
      className={cn(
        "ml-auto inline-flex h-8 items-center gap-1 rounded px-2 text-xs text-white/80 hover:bg-white/10 hover:text-white",
        className
      )}
    >
      {copied ? <CheckIcon className="size-3.5" /> : <CopyIcon className="size-3.5" />}
      {copied ? "Copied" : "Copy"}
    </button>
  );
}

function CodeBlockBody<T extends BaseCodeItem>({
  children,
  className,
}: {
  children: (item: T) => React.ReactNode;
  className?: string;
}) {
  const { data } = useCodeBlock<T>();
  return <div className={cn("max-h-[420px] overflow-auto", className)}>{data.map((item) => children(item))}</div>;
}

function CodeBlockItem({
  value,
  className,
  children,
}: {
  value: string;
  className?: string;
  children: React.ReactNode;
}) {
  const { selected } = useCodeBlock<BaseCodeItem>();
  if (selected !== value) return null;
  return <div className={cn("p-4", className)}>{children}</div>;
}

function CodeBlockContent({
  language,
  className,
  children,
}: {
  language?: BundledLanguage;
  className?: string;
  children: React.ReactNode;
}) {
  return (
    <pre className={cn("overflow-x-auto text-sm leading-relaxed", className)} data-language={language}>
      <code>{children}</code>
    </pre>
  );
}

export {
  CodeBlock,
  CodeBlockHeader,
  CodeBlockFiles,
  CodeBlockFilename,
  CodeBlockSelect,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockCopyButton,
  CodeBlockBody,
  CodeBlockItem,
  CodeBlockContent,
};
