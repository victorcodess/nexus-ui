"use client";

import * as React from "react";

import {
  Attachment,
  AttachmentList,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";

const SAMPLE_TEXT = [
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Nunc vulputate libero et velit interdum, ac aliquet odio mattis.",
  "Class aptent taciti sociosqu ad litora torquent per conubia nostra, per inceptos himenaeos. Curabitur tempus urna at turpis condimentum lobortis.",
  "Ut commodo efficitur neque. Ut diam quam, semper iaculis condimentum ac, vestibulum eu nisl. Integer ac erat auctor, faucibus magna sed, tempus metus.",
].join(" ");

function AttachmentsVariantPasted() {
  const blobUrlRef = React.useRef<string | null>(null);
  const [items, setItems] = React.useState<AttachmentMeta[]>(() => {
    const blob = new Blob([SAMPLE_TEXT], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
    blobUrlRef.current = url;
    return [
      {
        type: "file",
        name: "pasted-text.txt",
        url,
        mimeType: "text/plain",
        size: blob.size,
        source: "paste",
      },
    ];
  });

  React.useEffect(
    () => () => {
      if (blobUrlRef.current) {
        URL.revokeObjectURL(blobUrlRef.current);
        blobUrlRef.current = null;
      }
    },
    [],
  );

  const remove = React.useCallback(() => {
    if (blobUrlRef.current) {
      URL.revokeObjectURL(blobUrlRef.current);
      blobUrlRef.current = null;
    }
    setItems([]);
  }, []);

  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AttachmentList>
        {items.map((item) => (
          <Attachment
            key={`${item.url ?? ""}-${item.name}`}
            variant="pasted"
            attachment={item}
            onRemove={remove}
          />
        ))}
      </AttachmentList>
    </div>
  );
}

export default AttachmentsVariantPasted;
