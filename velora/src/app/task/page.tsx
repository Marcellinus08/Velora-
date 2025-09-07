// src/app/task/page.tsx
import Task from "@/components/task";

export default function TaskPage() {
  const video = {
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

  const comments = [
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

  return <Task video={video} comments={comments} />;
}
