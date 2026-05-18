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
  const [items, setItems] = React.useState<AttachmentMeta[]>(() => {
    const blob = new Blob([SAMPLE_TEXT], { type: "text/plain" });
    const url = URL.createObjectURL(blob);
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
  const itemsRef = React.useRef(items);

  React.useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  React.useEffect(
    () => () => {
      for (const item of itemsRef.current) {
        if (item.url?.startsWith("blob:")) {
          URL.revokeObjectURL(item.url);
        }
      }
    },
    [],
  );

  const remove = React.useCallback(() => {
    for (const item of items) {
      if (item.url?.startsWith("blob:")) {
        URL.revokeObjectURL(item.url);
      }
    }
    setItems([]);
  }, [items]);

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
