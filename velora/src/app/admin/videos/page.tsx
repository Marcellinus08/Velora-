// "use client";

// import { useState } from "react";
// import Sidebar from "@/components/sidebar";
// import { VideoFormModal } from "@/components/admin-videos";

// /* Type video */
// export type AdminVideo = {
//   id: number;
//   title: string;
//   thumb: string;
//   status: "available" | "completed";
//   subtext: string;
// };

// export default function AdminVideosPage() {
//   const [videos, setVideos] = useState<AdminVideo[]>([
//     {
//       id: 1,
//       title: "Cooking Masterclass: The Art of Modern Cuisine",
//       thumb:
//         "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJxTecPhE_PaHpo4ZMSRgsJyjjbygHj90EAayCOOo8Z61pIDLDKnANPpOPMRJmq9pRh3GMZuQ6uk1F3nKNawraJTtfehJfC_EZ7qgQX7ktNINJtTTaNVMIDSty3QfcJigHJbB3XiHQiekgePmLgzhWdD4qqrOg1SkYCaulR27KioxNtGqHocE0ZH5NdikY51LvDifBXYWb0FaNbVIWW5BUhX2AyI6Nya7Aw0kimRjnIV-d2QKl-v9HkNwdMBubIFjjRe9LfWk-bXH",
//       status: "available",
//       subtext: "Available until July 15, 2024",
//     },
//     {
//       id: 2,
//       title: "Portrait Photography: Capturing Essence",
//       thumb:
//         "https://lh3.googleusercontent.com/aida-public/AB6AXuB4gb9STrJU3JCJendGpr2JPwGnwuh7zCBxeKKJLdsDI6FML7c9hdECdVn6y6Y9laurCNwxrpWamTAfEmyHJh2OayL9Eh4QGjpNhHgi7boo6OGbKeTTsB_Xy1EBFAepniY48pUe8O1tXLVGZB34E7uNV7Ns9NRUZLllWZEIs44VvKQt15w4sqIOoPswpoYkdpAP2q9Dj6_5lwP6020m_YFgxAl5uiv1Xddyr1oFeO2HSlLalbOOmC5jr4tivXNzPUn2PO5xpeJl2XbL",
//       status: "completed",
//       subtext: "Completed on June 1, 2024",
//     },
//   ]);

//   const [open, setOpen] = useState(false);
//   const [editVideo, setEditVideo] = useState<AdminVideo | null>(null);

//   function handleSave(data: Omit<AdminVideo, "id">, id?: number) {
//     if (id) {
//       setVideos((prev) => prev.map((v) => (v.id === id ? { ...v, ...data } : v)));
//     } else {
//       const newVideo: AdminVideo = { ...data, id: Date.now() };
//       setVideos((prev) => [...prev, newVideo]);
//     }
//     setOpen(false);
//     setEditVideo(null);
//   }

//   function handleDelete(id: number) {
//     if (confirm("Are you sure you want to delete this video?")) {
//       setVideos((prev) => prev.filter((v) => v.id !== id));
//     }
//   }

//   return (
//     <div className="flex h-full grow flex-row">
//       <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
//         <div className="flex items-center justify-between">
//           <h1 className="text-2xl font-bold text-neutral-50">Manage Subscription Videos</h1>
//           <button
//             onClick={() => setOpen(true)}
//             className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90"
//           >
//             + Add Video
//           </button>
//         </div>

//         <div className="mt-6 overflow-hidden rounded-xl border border-neutral-800">
//           <table className="min-w-full divide-y divide-neutral-800 text-sm">
//             <thead className="bg-neutral-800 text-neutral-300">
//               <tr>
//                 <th className="px-4 py-3 text-left">Thumbnail</th>
//                 <th className="px-4 py-3 text-left">Title</th>
//                 <th className="px-4 py-3 text-left">Status</th>
//                 <th className="px-4 py-3 text-left">Info</th>
//                 <th className="px-4 py-3 text-right">Actions</th>
//               </tr>
//             </thead>
//             <tbody className="divide-y divide-neutral-800 bg-neutral-900">
//               {videos.map((v) => (
//                 <tr key={v.id}>
//                   <td className="px-4 py-3">
//                     {/* eslint-disable-next-line @next/next/no-img-element */}
//                     <img src={v.thumb} alt="" className="h-14 w-24 rounded-md object-cover" />
//                   </td>
//                   <td className="px-4 py-3 text-neutral-50">{v.title}</td>
//                   <td className="px-4 py-3">
//                     {v.status === "available" ? (
//                       <span className="rounded-full bg-emerald-900/30 px-2 py-0.5 text-xs font-semibold text-emerald-300">
//                         Available
//                       </span>
//                     ) : (
//                       <span className="rounded-full bg-neutral-700/50 px-2 py-0.5 text-xs font-semibold text-neutral-300">
//                         Completed
//                       </span>
//                     )}
//                   </td>
//                   <td className="px-4 py-3 text-neutral-400">{v.subtext}</td>
//                   <td className="px-4 py-3 text-right space-x-2">
//                     <button
//                       onClick={() => {
//                         setEditVideo(v);
//                         setOpen(true);
//                       }}
//                       className="rounded-md bg-neutral-800 px-2 py-1 text-xs text-neutral-200 hover:bg-neutral-700"
//                     >
//                       Edit
//                     </button>
//                     <button
//                       onClick={() => handleDelete(v.id)}
//                       className="rounded-md bg-red-600 px-2 py-1 text-xs text-white hover:bg-red-500"
//                     >
//                       Delete
//                     </button>
//                   </td>
//                 </tr>
//               ))}
//               {videos.length === 0 && (
//                 <tr>
//                   <td colSpan={5} className="px-4 py-6 text-center text-neutral-400">
//                     No videos found.
//                   </td>
//                 </tr>
//               )}
//             </tbody>
//           </table>
//         </div>
//       </main>

//       {/* Modal */}
//       <VideoFormModal
//         open={open}
//         onClose={() => {
//           setOpen(false);
//           setEditVideo(null);
//         }}
//         onSave={handleSave}
//         initial={editVideo}
//       />
//     </div>
//   );
// }
