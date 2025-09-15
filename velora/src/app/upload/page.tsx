import UploadCreate from "@/components/upload/create";

export const metadata = {
  title: "Upload Video",
};

export default function UploadPage() {
  return (
    <div className="flex h-full grow flex-row">
      {/* PADDING & SPACING SAMA DENGAN STUDIO */}
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <UploadCreate />
      </main>
    </div>
  );
}
