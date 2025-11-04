// src/app/upload/page.tsx
import UploadCreate from "@/components/upload/create";

export const metadata = { title: "Upload Video" };

export default function UploadPage() {
  return (
    <div className="flex h-full grow flex-row pb-16 md:pb-0">
      <main className="flex-1 px-3 py-4 sm:px-6 lg:px-8">
        <UploadCreate />
      </main>
    </div>
  );
}
