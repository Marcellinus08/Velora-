// "use client";

// import { useState } from "react";
// import type { AdminVideo } from "@/app/admin/videos/page";

// export function VideoFormModal({
//   open,
//   onClose,
//   onSave,
//   initial,
// }: {
//   open: boolean;
//   onClose: () => void;
//   onSave: (data: Omit<AdminVideo, "id">, id?: number) => void;
//   initial: AdminVideo | null;
// }) {
//   const [title, setTitle] = useState(initial?.title ?? "");
//   const [thumb, setThumb] = useState(initial?.thumb ?? "");
//   const [status, setStatus] = useState<"available" | "completed">(initial?.status ?? "available");
//   const [subtext, setSubtext] = useState(initial?.subtext ?? "");

//   if (!open) return null;

//   function handleSubmit(e: React.FormEvent) {
//     e.preventDefault();
//     onSave({ title, thumb, status, subtext }, initial?.id);
//   }

//   return (
//     <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4">
//       <div className="w-full max-w-lg rounded-xl border border-neutral-800 bg-neutral-900 p-6 shadow-xl">
//         <h2 className="text-lg font-semibold text-neutral-50 mb-4">
//           {initial ? "Edit Video" : "Add New Video"}
//         </h2>
//         <form onSubmit={handleSubmit} className="space-y-4">
//           <div>
//             <label className="block text-sm text-neutral-300 mb-1">Title</label>
//             <input
//               value={title}
//               onChange={(e) => setTitle(e.target.value)}
//               required
//               className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50 focus:border-[var(--primary-500)] focus:ring-0"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-neutral-300 mb-1">Thumbnail URL</label>
//             <input
//               value={thumb}
//               onChange={(e) => setThumb(e.target.value)}
//               required
//               className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50 focus:border-[var(--primary-500)] focus:ring-0"
//             />
//           </div>
//           <div>
//             <label className="block text-sm text-neutral-300 mb-1">Status</label>
//             <select
//               value={status}
//               onChange={(e) => setStatus(e.target.value as any)}
//               className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50"
//             >
//               <option value="available">Available</option>
//               <option value="completed">Completed</option>
//             </select>
//           </div>
//           <div>
//             <label className="block text-sm text-neutral-300 mb-1">Subtext</label>
//             <input
//               value={subtext}
//               onChange={(e) => setSubtext(e.target.value)}
//               required
//               className="w-full rounded-lg border border-neutral-700 bg-neutral-800 px-3 py-2 text-neutral-50"
//             />
//           </div>
//           <div className="flex justify-end gap-2 pt-2">
//             <button
//               type="button"
//               onClick={onClose}
//               className="rounded-lg px-4 py-2 text-sm text-neutral-300 hover:bg-neutral-800"
//             >
//               Cancel
//             </button>
//             <button
//               type="submit"
//               className="rounded-lg bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
//             >
//               {initial ? "Update" : "Create"}
//             </button>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }
