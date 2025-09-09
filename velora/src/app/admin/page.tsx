"use client";


// src/app/admin/page.tsx
import Sidebar from "@/components/sidebar";
import {
  AdminSection,
  PeriodFilter,
  StatCard,
  TinyBarChart,
  SimpleTable,
  useKpis,
  Pill,
} from "@/components/admin";

export default function AdminDashboardPage() {
  // karena page adalah Server Component, kita set default period via url atau fixed:
  const period = "7d"; // jika mau client-interactive, pindah filter ke komponen client terpisah

  const kpis = useKpis(period); // hook ini aman dipanggil di client; tapi biar simpel, kita render chart dsb di bawah (TinyBarChart client)

  // Data mock
  const latestUsers = [
    { name: "Aisyah Rahma", email: "aisyah@mail.com", plan: "Pro", joined: "2d ago" },
    { name: "Budi Santoso", email: "budi@mail.com", plan: "Free", joined: "3d ago" },
    { name: "Carla Putri", email: "carla@mail.com", plan: "Pro", joined: "5d ago" },
    { name: "Dimas Anggara", email: "dimas@mail.com", plan: "Premium", joined: "6d ago" },
  ];

  const topCourses = [
    { title: "Cooking Masterclass", students: 1243, rating: 4.8 },
    { title: "Full-Stack Web Dev", students: 1091, rating: 4.7 },
    { title: "Portrait Photography", students: 864, rating: 4.9 },
  ];

  const supportTickets = [
    { id: "#5821", subject: "Payment failed", status: "Open", updated: "1h ago" },
    { id: "#5812", subject: "Cannot access course", status: "In Progress", updated: "4h ago" },
    { id: "#5733", subject: "Refund request", status: "Resolved", updated: "1d ago" },
  ];

  return (
    <div className="flex h-full grow flex-row">

      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-6 flex flex-col items-start gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-neutral-50">Admin Dashboard</h1>
            <p className="text-sm text-neutral-400">Overview of your platform activity</p>
          </div>

          {/* Tombol aksi cepat */}
          <div className="flex items-center gap-2">
            <button className="rounded-full bg-neutral-800 px-4 py-2 text-sm font-semibold text-neutral-50 hover:bg-neutral-700">
              Export CSV
            </button>
            <button className="rounded-full bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white hover:bg-opacity-90">
              + New Course
            </button>
          </div>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
          <StatCard
            label="Total Revenue"
            value={kpis.revenue}
            diff="+8.2%"
            icon={
              <svg className="size-5 text-emerald-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 10l4-4 4 4 6-6v10H3z" />
              </svg>
            }
          />
          <StatCard
            label="New Users"
            value={kpis.newUsers}
            diff="+3.1%"
            icon={
              <svg className="size-5 text-neutral-300" viewBox="0 0 20 20" fill="currentColor">
                <path d="M13 7a3 3 0 11-6 0 3 3 0 016 0z" />
                <path d="M4 14a4 4 0 018 0v2H4v-2z" />
              </svg>
            }
          />
          <StatCard
            label="Active Subscriptions"
            value={kpis.activeSubs}
            diff="+1.4%"
            icon={
              <svg className="size-5 text-violet-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M3 4h14v3H3V4zm0 5h14v7H3V9z" />
              </svg>
            }
          />
          <StatCard
            label="Open Tickets"
            value={kpis.tickets}
            diff="-12%"
            icon={
              <svg className="size-5 text-red-400" viewBox="0 0 20 20" fill="currentColor">
                <path d="M10 2l8 8-8 8-8-8 8-8z" />
              </svg>
            }
          />
        </div>

        {/* Chart + Top courses */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
          <AdminSection
            title="Revenue (mock)"
            right={<PeriodFilter value={"7d"} onChange={() => {}} />}
            className="lg:col-span-2"
          >
            <div className="p-4">
              <TinyBarChart values={kpis.chart} height={120} />
              <div className="mt-3 flex items-center gap-3 text-xs text-neutral-400">
                <Pill tone="emerald">+8.2% WoW</Pill>
                <span>Snapshot only (demo)</span>
              </div>
            </div>
          </AdminSection>

          <AdminSection title="Top Courses">
            <div className="p-4">
              <SimpleTable
                columns={["Course", "Students", "Rating"]}
                rows={topCourses.map((c) => [
                  <span className="text-neutral-50" key="t">
                    {c.title}
                  </span>,
                  <span key="s">{c.students.toLocaleString()}</span>,
                  <span key="r" className="flex items-center gap-1">
                    <svg className="size-4 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.803 2.037a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.803-2.037a1 1 0 00-1.175 0L6.72 16.284c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L3.083 8.72c-.783-.57-.38-1.81.588-1.81h3.463a1 1 0 00.95-.69l1.0-3.292z" />
                    </svg>
                    {c.rating}
                  </span>,
                ])}
              />
            </div>
          </AdminSection>
        </div>

        {/* Users + Tickets */}
        <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-2">
          <AdminSection
            title="Latest Users"
            right={
              <button className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-50 hover:bg-neutral-700">
                View all
              </button>
            }
          >
            <div className="p-4">
              <SimpleTable
                columns={["Name", "Email", "Plan", "Joined"]}
                rows={latestUsers.map((u) => [
                  <span className="text-neutral-50" key="n">
                    {u.name}
                  </span>,
                  <span key="e" className="text-neutral-300">
                    {u.email}
                  </span>,
                  <span key="p">
                    {u.plan === "Pro" && <Pill tone="violet">Pro</Pill>}
                    {u.plan === "Premium" && <Pill tone="emerald">Premium</Pill>}
                    {u.plan === "Free" && <Pill>Free</Pill>}
                  </span>,
                  <span key="j">{u.joined}</span>,
                ])}
              />
            </div>
          </AdminSection>

          <AdminSection
            title="Support Tickets"
            right={
              <button className="rounded-full bg-neutral-800 px-3 py-1.5 text-xs font-semibold text-neutral-50 hover:bg-neutral-700">
                Open helpdesk
              </button>
            }
          >
            <div className="p-4">
              <SimpleTable
                columns={["ID", "Subject", "Status", "Updated"]}
                rows={supportTickets.map((t) => [
                  <span className="text-neutral-50" key="id">
                    {t.id}
                  </span>,
                  <span key="s">{t.subject}</span>,
                  <span key="st">
                    {t.status === "Open" && <Pill tone="red">Open</Pill>}
                    {t.status === "In Progress" && <Pill tone="violet">In Progress</Pill>}
                    {t.status === "Resolved" && <Pill tone="emerald">Resolved</Pill>}
                  </span>,
                  <span key="u">{t.updated}</span>,
                ])}
              />
            </div>
          </AdminSection>
        </div>
      </main>
    </div>
  );
}
