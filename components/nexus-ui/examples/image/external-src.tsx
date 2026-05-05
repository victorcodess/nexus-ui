import { Image } from "@/components/nexus-ui/image";

export default function ImageExternalSrc() {
  return (
    <Image
      src="https://images.unsplash.com/photo-1663162221489-385e5d75d29f?q=80&w=1180&auto=format&fit=crop&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
      alt="Image loaded from external URL"
      className="aspect-square w-1/2"
    />
  );
}
