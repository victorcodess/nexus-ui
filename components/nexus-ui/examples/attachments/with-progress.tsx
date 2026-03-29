import {
  Attachment,
  AttachmentList,
  type AttachmentMeta,
} from "@/components/nexus-ui/attachments";

const item: AttachmentMeta = {
  type: "file",
  name: "dataset.csv",
  mimeType: "text/csv",
  size: 2_400_000,
};

function AttachmentsWithProgress() {
  return (
    <div className="flex flex-col items-center justify-center gap-4">
      <AttachmentList>
        <Attachment variant="card" attachment={item} progress={62} />
      </AttachmentList>
    </div>
  );
}

export default AttachmentsWithProgress;
