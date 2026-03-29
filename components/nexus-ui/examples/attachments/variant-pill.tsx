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
    name: "Skyline.png",
    url: imgSrc,
    mimeType: "image/png",
  },
  {
    type: "file",
    name: "Marketing-Plan.pdf",
    mimeType: "application/pdf",
  },
  {
    type: "file",
    name: "Report on Design.docx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  },
  {
    type: "file",
    name: "DEMO_SLIDES.pptx",
    mimeType:
      "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  },
];

function AttachmentsVariantPill() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AttachmentList>
        {items.map((item) => (
          <Attachment
            key={`${item.name}-${item.mimeType}`}
            variant="pill"
            attachment={item}
          />
        ))}
      </AttachmentList>
    </div>
  );
}

export default AttachmentsVariantPill;
