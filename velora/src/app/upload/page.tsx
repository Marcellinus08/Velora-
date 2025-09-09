// src/app/studio/upload/page.tsx
import UploadVideoForm from "@/components/uploader";

export const metadata = {
  title: "Upload Video",
};

export default function UploadVideoPage() {
  return (
    <div className="flex h-full grow flex-row">
      <main className="flex-1">
        <UploadVideoForm />
      </main>
    </div>
  );
}
