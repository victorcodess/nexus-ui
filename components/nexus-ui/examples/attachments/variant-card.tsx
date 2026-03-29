import {
  Attachment,
  AttachmentList,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";

const imgSrc =
  "https://images.unsplash.com/photo-1538428494232-9c0d8a3ab403?q=80&w=1740&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D";

const items: AttachmentMeta[] = [
  {
    type: "image",
    name: "image.png",
    url: imgSrc,
    mimeType: "image/png",
    size: 1_258_291,
  },
  {
    type: "file",
    name: "untitled.pdf",
    mimeType: "application/pdf",
  },
  {
    type: "file",
    name: "untitled.doc",
    mimeType: "application/msword",
  },
  {
    type: "file",
    name: "untitled.pptx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
    size: Math.round(21.3 * 1024 * 1024),
  },
];

function AttachmentsVariantCard() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AttachmentList>
        {items.map((item) => (
          <Attachment
            key={`${item.name}-${item.mimeType}`}
            variant="card"
            attachment={item}
          />
        ))}
      </AttachmentList>
    </div>
  );
}

export default AttachmentsVariantCard;
