// src/app/community/page.tsx
import Sidebar from "@/components/sidebar";
import {
  CommunitySection as Section,
  CommunityTabs,
  CommunityPostRow,
  CommunityPost,
} from "@/components/community";

const posts: CommunityPost[] = [
  {
    author: "Isabella Rossi",
    avatar:
      "https://lh3.googleusercontent.com/a-/ACNPEu8_L6L-2fV3oA-Z2k-3yYg1Y_Fh9_jZ-7E_j8J=s96-c",
    category: "Cooking",
    time: "2 hours ago",
    title: "What are your go-to knife skills for beginners?",
    excerpt:
      "Looking for tips and tricks to share with my students. I've found that mastering the basic cuts makes a huge difference. What are some of your favorite techniques or resources for teaching knife skills?",
    likes: 12,
    replies: 8,
  },
  {
    author: "David Chen",
    avatar:
      "https://lh3.googleusercontent.com/a-/ACNPEu9K3f8Z4Q7f-f_p-z_a_R7Y_h_F_X_lY9w_o_w=s96-c",
    category: "Business",
    time: "5 hours ago",
    title: "Favorite public speaking warm-up exercises?",
    excerpt:
      "I'm preparing for a big presentation next week and would love to hear how others get ready to speak. Tongue twisters, breathing exercises, power posing – what works for you?",
    likes: 25,
    replies: 15,
    liked: true,
  },
  {
    author: "Emily Carter",
    avatar:
      "https://lh3.googleusercontent.com/a-/ACNPEu-lG_H3f_tY_c_K_X_a7_f_w_z_q_Q_H-i-A=s96-c",
    category: "Photography",
    time: "1 day ago",
    title: "Lens recommendations for portrait photography?",
    excerpt:
      "I'm looking to upgrade my gear and specialize more in portraits. I'm currently using a standard kit lens. What prime or zoom lenses would you recommend for capturing stunning portraits with beautiful bokeh?",
    likes: 18,
    replies: 11,
  },
  {
    author: 'Lucas "Fingers" Martinez',
    avatar:
      "https://lh3.googleusercontent.com/a-/ACNPEu8TzY_q_O_Y_e_j_h_X_q_w_z_p_Z_q_Q_H-i-A=s96-c",
    category: "Music",
    time: "2 days ago",
    title: "How do you overcome writer's block when composing?",
    excerpt:
      "We've all been there, staring at a blank page. What are your strategies for breaking through creative blocks and finding inspiration for new melodies and lyrics?",
    likes: 31,
    replies: 22,
  },
];

export default function CommunityPage() {
  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* header + button */}
        <div className="flex flex-col gap-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
            <h2 className="text-2xl font-bold text-neutral-50">Community Discussions</h2>
            <button className="flex items-center gap-2 rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-opacity-80">
              <svg className="size-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Create New Post</span>
            </button>
          </div>

          {/* tabs */}
          <CommunityTabs />

          {/* list */}
          <div className="flex flex-col gap-4">
            {posts.map((p) => (
              <CommunityPostRow key={p.title} post={p} />
            ))}
          </div>
        </div>
      </main>
    </div>
  );
}
