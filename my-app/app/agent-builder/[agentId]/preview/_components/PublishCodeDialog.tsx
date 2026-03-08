import React from "react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import type { BundledLanguage } from "@/components/ui/shadcn-io/code-block";
import {
  CodeBlock,
  CodeBlockBody,
  CodeBlockContent,
  CodeBlockCopyButton,
  CodeBlockFilename,
  CodeBlockFiles,
  CodeBlockHeader,
  CodeBlockItem,
  CodeBlockSelect,
  CodeBlockSelectContent,
  CodeBlockSelectItem,
  CodeBlockSelectTrigger,
  CodeBlockSelectValue,
} from "@/components/ui/shadcn-io/code-block";
type CodeItem = {
  language: string;
  filename: string;
  code: string;
};

type Props = {
  openDialog: boolean;
  setOpenDialog: (open: boolean) => void;
};

const demoCode: CodeItem[] = [
  {
    language: "jsx",
    filename: "MyComponent.jsx",
    code:`const res = await fetch("https://MedNexus/api/agent-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
         agentId:<agentId>,
         userId:<userId>,
         userInput:<userInput>,
         
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        throw new Error(errText || \`Request failed: \${res.status}\`);
      }

      // Works for both streamed and plain-text responses
      if (!res.body) {
        const text = await res.text();
        setMessages((prev) =>
          prev.map((msg) => (msg.id === assistantId ? { ...msg, content: text } : msg))
        );
        return;
      }
          while (true) {
        const { value, done } = await reader.read();
        if (done) break;
        if (!value) continue;

        const chunk = decoder.decode(value, { stream: true });
        setMessages((prev) =>
          prev.map((msg) =>
            msg.id === assistantId ? { ...msg, content: msg.content + chunk } : msg
          )
        );
      }  `
}
];

function PublishCodeDialog({ openDialog, setOpenDialog }: Props) {
  return (
    <Dialog open={openDialog} onOpenChange={setOpenDialog}>
      <DialogContent className="min-w-3xl w-full">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold">Get Code</DialogTitle>
          <DialogDescription className="text-md font-semibold">
            Copy and use the generated snippet below.
          </DialogDescription>
        </DialogHeader>

        <CodeBlock data={demoCode} defaultValue={demoCode[0].language}>
          <CodeBlockHeader>
            <CodeBlockFiles>
              {(item: CodeItem) => (
                <CodeBlockFilename key={item.language} value={item.language}>
                  {item.filename}
                </CodeBlockFilename>
              )}
            </CodeBlockFiles>
            <CodeBlockSelect>
              <CodeBlockSelectTrigger>
                <CodeBlockSelectValue />
              </CodeBlockSelectTrigger>
              <CodeBlockSelectContent>
                {(item: CodeItem) => (
                  <CodeBlockSelectItem key={item.language} value={item.language}>
                    {item.language.toUpperCase()}
                  </CodeBlockSelectItem>
                )}
              </CodeBlockSelectContent>
            </CodeBlockSelect>
            <CodeBlockCopyButton />
          </CodeBlockHeader>
          <CodeBlockBody>
            {(item: CodeItem) => (
              <CodeBlockItem key={item.language} value={item.language}>
                <CodeBlockContent language={item.language as BundledLanguage}>
                  {item.code}
                </CodeBlockContent>
              </CodeBlockItem>
            )}
          </CodeBlockBody>
        </CodeBlock>
      </DialogContent>
    </Dialog>
  );
}

export default PublishCodeDialog;