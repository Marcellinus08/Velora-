import { NextResponse } from "next/server";

// Mock creators
export async function GET() {
  const data = [
    {
      id: "u_maria",
      name: "Maria",
      handle: "maria",
      avatarUrl: "https://i.pravatar.cc/80?u=maria",
      tags: ["Business", "Marketing"],
      pricing: { voice: 1, video: 5 },
    },
    {
      id: "u_arif",
      name: "Arif",
      handle: "arif",
      avatarUrl: "https://i.pravatar.cc/80?u=arif",
      tags: ["Development"],
      pricing: { voice: 3, video: 7 },
    },
    {
      id: "u_sinta",
      name: "Sinta",
      handle: "sinta",
      avatarUrl: "https://i.pravatar.cc/80?u=sinta",
      tags: ["Design", "UI/UX"],
      pricing: { voice: 1.5, video: 4 },
    },
    {
      id: "u_dimas",
      name: "Dimas",
      handle: "dimas",
      avatarUrl: "https://i.pravatar.cc/80?u=dimas",
      tags: ["Photography"],
      pricing: { voice: 2, video: 6 },
    },
    
  ];
  return NextResponse.json(data);
}
