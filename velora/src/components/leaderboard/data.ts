import type { UserProfile } from "./types";

/* Dummy DB untuk modal profile (opsional ganti ke API) */
export const PROFILE_DB: Record<string, UserProfile> = {
  cristianoronaldo: {
    name: "Cristiano Ronaldo",
    handle: "cristianoronaldo",
    rank: 1,
    score: 15000,
    purchases: [
      { title: "Finishing Masterclass", date: "2024-02-11", price: "$19", type: "Purchase" },
      { title: "Mindset for Champions", date: "2024-03-02", price: "$12", type: "Purchase" },
    ],
    activity: [
      { time: "2024-03-12 10:25", text: "Scored 500 points from challenge 'Speed Dribble'." },
      { time: "2024-03-10 17:03", text: "Watched 'Finishing Masterclass' (90%)." },
    ],
  },
  leomessi: {
    name: "Lionel Messi",
    handle: "leomessi",
    rank: 2,
    score: 12500,
    purchases: [
      { title: "Playmaker Vision", date: "2024-01-20", price: "$15", type: "Purchase" },
      { title: "Free-kick Secrets", date: "2024-01-25", price: "$10", type: "Purchase" },
    ],
    activity: [
      { time: "2024-03-09 08:12", text: "Completed test 'First Touch Drill'." },
      { time: "2024-02-28 20:18", text: "Earned 320 points from daily quests." },
    ],
  },
  neymarjr: {
    name: "Neymar Jr",
    handle: "neymarjr",
    rank: 3,
    score: 10000,
    purchases: [{ title: "Creative Skills Pack", date: "2024-02-05", price: "$29", type: "Purchase" }],
    activity: [{ time: "2024-03-01 14:12", text: "Shared a highlight to community." }],
  },
  michaeljordan: {
    name: "Michael Jordan",
    handle: "michaeljordan",
    rank: 4,
    score: 9800,
    purchases: [{ title: "Beyond Air: Training", date: "2024-02-16", price: "$18", type: "Purchase" }],
    activity: [{ time: "2024-03-07 10:01", text: "Completed challenge 'Vertical Jump'." }],
  },
};
