import HeroPlayer from "@/components/task/heroplayer";
import TaskPanel from "@/components/task/taskpanel";
import VideoInfoSection from "@/components/task/videoinfo";
import Comments from "@/components/task/comments";
import type { Comment, VideoInfo, RecommendedVideo } from "@/components/task/types";


export const metadata = { title: "Task" };

export default function TaskPage() {
  const video: VideoInfo = {
    title: "Masterclass Memasak: Seni Kuliner Modern",
    views: "1.2M",
    heroImage:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJxTecPhE_PaHpo4ZMSRgsJyjjbygHj90EAayCOOo8Z61pIDLDKnANPpOPMRJmq9pRh3GMZuQ6uk1F3nKNawraJTtfehJfC_EZ7qgQX7ktNINJtTTaNVMIDSty3QfcJigHJbB3XiHQiekgePmLgzhWdD4qqrOg1SkYCaulR27KioxNtGqHocE0ZH5NdikY51LvDifBXYWb0FaNbVIWW5BUhX2AyI6Nya7Aw0kimRjnIV-d2QKl-v9HkNwdMBubIFjjRe9LfWk-bXH",
    description:
      "Dalam masterclass ini, Anda akan mempelajari teknik memasak modern dari koki terkenal dunia. Jelajahi rahasia di balik hidangan khas mereka dan tingkatkan keterampilan kuliner Anda. Sempurna untuk koki rumahan dan profesional.",
    creator: {
      name: "Gordon Ramsay",
      followers: "1.2M",
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBdp3wvAajxEl_0k41FgIiRWN6Q1G_uNYEpPQD9XyHX14D2rv2npeqz4jB-gIc8LxIcNHUYe3rvxG8sqD1u6ZbEMqISAkXTc1Gx5QfpW8y8r8dCDLK4Ao_QcDMNGxqewhFeKz_XcBNcE2RtvrkT9UoqnKmSnj3udgSCbSFm6pmk7SZ8932rouDEA9MNNyRleh-9m-yZle2JE80MKIZkqLgQt7BV53Go_bbQkG92rPFHAAk-tzPol-FfB1XV4rCnjpOmcMeNtDNfMe2I",
    },
  };

  const recommendedVideos: RecommendedVideo[] = [
    {
      id: 1,
      title: "Seni Pastry dari Dasar",
      creator: "Cedric Grolet",
      thumbnail: "http://googleusercontent.com/profile/picture/5",
    },
    {
      id: 2,
      title: "Masakan Italia Otentik untuk Pemula",
      creator: "Massimo Bottura",
      thumbnail: "http://googleusercontent.com/profile/picture/6",
    },
    {
      id: 3,
      title: "Teknik Barbekyu Khas Texas",
      creator: "Aaron Franklin",
      thumbnail: "http://googleusercontent.com/profile/picture/7",
    },
  ];

  const comments: Comment[] = [
    {
      id: 1,
      name: "Siti aisyah",
      time: "2 hari lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocK_1Y-3-HjG-2y9y-iY_p-A-g_F-tZ-kC-d-P-Y=s96-c",
      text:
        "Video yang sangat bermanfaat! Saya belajar banyak teknik baru yang bisa saya terapkan di dapur saya sendiri.",
    },
    {
      id: 2,
      name: "Budi santoso",
      time: "1 minggu lalu",
      avatar:
        "https://lh3.googleusercontent.com/a/ACg8ocL8R-V_3y_c-f_W-j-X_q_Z-j_E-z_T-v_R-z_X=s96-c",
      text:
        "Penjelasannya sangat jelas dan mudah diikuti. Terima kasih telah berbagi ilmu, Chef!",
    },
  ];

  return (
    <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
      <div className="grid grid-cols-12 items-stretch gap-8">
        {/* Row 1 */}
        <section className="col-span-12 lg:col-span-8">
          <HeroPlayer image={video.heroImage} />
        </section>
        <aside className="col-span-12 lg:col-span-4">
          <TaskPanel className="h-full" />
        </aside>

        {/* Row 2 (info + creator) */}
        <VideoInfoSection video={video} recommendations={recommendedVideos} />
      </div>

      <Comments items={comments} />
    </main>
  );
}
