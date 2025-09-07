// app/page.tsx
import Sidebar from "@/components/sidebar";


export default function Home() {
  return (
    <>
      <div className="flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">

        </main>
      </div>
    </>
  );
}
