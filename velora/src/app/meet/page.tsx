// src/app/meet/page.tsx
import Sidebar from "@/components/sidebar";
import { Meeting, MeetingGrid } from "@/components/meet/meetgrid";

/* =========================
   Mock data (sesuai contoh)
========================= */
const meetings: Meeting[] = [
  {
    id: "1",
    title: "Tren Pemasaran Digital pada tahun 2024",
    host: "MarketingPro",
    viewers: "2.3K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuA2owiVIGhtxkLnP5mDs0b1iT-Avb7c0wDhB6q9punioADtlpYh6kScErOxyYD6v9iF_v-PbC2Inuw-4M2eLgRdlj2CThibZK2t7Joo8cTp1pxBtYDcQvFgvxnnhSmateYOem8aYuOoeHc3rOymiq3g0kSqOrdi1076Olzi2GlDZJ1_wIN3RZPkNU-7eZEhNsJoOke2JUMu2JTNpjKPXpPT3yQbvhkz9WsmJEMWpCYdjL0hJslIsfGmZ7cxCXpp-5Q-NSKoWZYZDHX0",
  },
  {
    id: "2",
    title: "Lokakarya Desain UI/UX",
    host: "DesignHub",
    viewers: "1.8K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAsIPpY-CSFfo1IFVM03EomWmN9z7Ty0FCZCGyBR_nS4SYNqqKMDb1GkgKVF3CxXG8S6Rw97bZBXkE_RIwU2dmAMFn9Frd4D0bkUnZvZueV1iMQN2P04E7NAetbCuxbHC7n973vlQbk7gHckczY5XmN7gAJBVGOaUXvmKQbot6m3Deyxva6_6_ig8HXAcjaeOuCVF-GyFbyiM-tOJWAFvcmXQEIL7p4Q8gd35NiHxRizltadLrKjg1Oq02CMALWRaJAvfkp2tCpQE8_",
  },
  {
    id: "3",
    title: "Perencanaan Keuangan 101",
    host: "FinanceExperts",
    viewers: "980 menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuAkv0eI0vfcb3H4nhTUrv4LdEPmT6mRexzIJW0ShZBQVm-g4-PH_qX8p0jdfDDilmTyB6OUpSuZcgOIm0-rurKlSUzS-xBOb0Elqvcwv4JWcy-k7q2XdIra79G70pjV9nK7J_T1Uc8TrlNWbi21ET_NWG_X374js8FAU1u6mTAo9s8TK8IKE9l3I5_xxFEfJLrRdkaPhz5qjzUFlzSpDkwJbcm-RKSQpNyJEfnzii9y-13c46H75l-FJKXJ7xHV1u4zg27j7Iw7hJGS",
  },
  {
    id: "4",
    title: "Tanya Jawab Kesehatan dan Kebugaran",
    host: "WellnessGurus",
    viewers: "3.2K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBodFWMD_7noUS2oEy-s1CcrbSATnFshXdvplQn0WEvTZucrPl1t7gX3YiHlBRpFn_g0kgKfdBh_fbbMZFq3gXCAlr4PDJilb8l9BJILGXUjhUSPhPJjukVo6Ihjeux4Evm0n2dntE00E4q8nhgfRV0yt7tXreRhNb1NTkeEOGUhjGyVwDSfN0fg3Iy2Lx8oM9_T5qMjwfMzUlaGosfCvULfe_UVdAlpOCx_SqLU9o3c5Fr33JOHiLtawp9dInwoi-O9PLuxLeJh_gg",
  },
  {
    id: "5",
    title: "Sesi Pitch Startup",
    host: "InnovateHub",
    viewers: "1.1K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBXh-6t72KRdzS4W3NCXx9bIf0HZGi_R0ZbLcDEJxUfdGOsQoUFr_XlGT2GRfbsWBJib21UeCJcPKq0zohaXeRKUNR14Bmt_AOxxQg5XXlGaeCcJrzWocIYaghCD6vGtIA-Trm9MhaFy2QmDNSMjqR1aggyvTf807g85yOJfkCoB_-oEipGmYjkfJNvr_H4YB8x0I9B5XkFi74mkp8-jHqcGRDnRygopLIql8X7mPNX0bBsDysY-Vr2e40N6jeFegk6l1Yyp8FefD_F",
  },
  {
    id: "6",
    title: "Tantangan Pengkodean Langsung",
    host: "CodeMasters",
    viewers: "5.6K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuDZflwGXLm2cwPbQaYFm2UpbFFstdhww1gtCM68KEaH6IExo4dtz6cdNFbk22HhFJZErC1QfHCmZrj-yOBGiZNaF-hof74tmWJpVIj0Prw6_r3KTWGk6odVCy2CzRVCJpfAGWbOkcBqD4CoaKhEjS9hviXIQGJqO4fGrfGkJFeJ1Yt4jrBrvTp9o0L0XI3TrLDHpGIMs1Cz388fiHM_dbJJKJbelXR4MpFm7orTBJ73MevriuNywkbozud9RTmrs9oEEDilBl85ONLi",
  },
  {
    id: "7",
    title: "Kelas Master Produksi Musik",
    host: "SoundWave Academy",
    viewers: "890 menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuC_kgHXV0rs4XhgxO7FZ6ctWhl08R4jerqqz1Ya0w2zOuKjHBfWVD_SIins5as4KixM5f7P7cAP6n0pUMgLJaQraCugzrIaMGcq2KY2dBH5qECAPlzTRe9u-xfptYOnkxz-Qr2q8rUsShVmsYM6w4bnL_Rpgk6dSdloD-a_4u_l0aqh1UjWcEmMiVgMFc3t9Py_P9oQBgwsziuRsDA_vYWKsWEBixlh6fOEtCxmJgkKeJH3d6hUId5MUUayqmvmB5pPyu63fnZl92Ux",
  },
  {
    id: "8",
    title: "Lingkaran Menulis Kreatif",
    host: "The Writer's Block",
    viewers: "2.1K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBYmA9oJE5c6DLeAleQ98K6S6mUybgKduYHSHRhUh4xm8zpLXhbMpMH0_5fS1GPkVSZ3v8G-RLSclZ2wkoJRKXRNdBCz43E1thcX3zi7Ez4x-wDDNXdG_kpe_7rfy2xIPP2mNwUYZRKsH36ZTFfCW-VMKKv6YjWsrHCoIsool2dwi-Hpx4tIpT8uuyB1dHjnX9NPQmTRkvWYc5nBYALt72mphBeqVbBCrmU_-6OlNLICUeYhnjJ-FJ0VGsW4beiijWrGFSZaMoflyw6",
  },
  {
    id: "9",
    title: "Tanya Jawab Kesehatan dan Kebugaran",
    host: "WellnessGurus",
    viewers: "3.2K menonton",
    live: true,
    thumb:
      "https://lh3.googleusercontent.com/aida-public/AB6AXuBodFWMD_7noUS2oEy-s1CcrbSATnFshXdvplQn0WEvTZucrPl1t7gX3YiHlBRpFn_g0kgKfdBh_fbbMZFq3gXCAlr4PDJilb8l9BJILGXUjhUSPhPJjukVo6Ihjeux4Evm0n2dntE00E4q8nhgfRV0yt7tXreRhNb1NTkeEOGUhjGyVwDSfN0fg3Iy2Lx8oM9_T5qMjwfMzUlaGosfCvULfe_UVdAlpOCx_SqLU9o3c5Fr33JOHiLtawp9dInwoi-O9PLuxLeJh_gg",
  },
];

export default function MeetPage() {
  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-2xl font-bold text-neutral-50">Sedang Berlangsung</h2>
          <div className="flex items-center gap-2">
            <button className="flex items-center gap-2 rounded-lg bg-neutral-800 px-4 py-2 text-sm font-medium text-neutral-50 hover:bg-neutral-700">
              <svg className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor" aria-hidden>
                <path
                  fillRule="evenodd"
                  d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.414-1.414L11 9.586V6z"
                  clipRule="evenodd"
                />
              </svg>
              <span>Jadwalkan Rapat</span>
            </button>
            <button className="rounded-lg bg-[var(--primary-500)] px-4 py-2 text-sm font-semibold text-white transition-colors hover:bg-opacity-80">
              Mulai Rapat Baru
            </button>
          </div>
        </div>

        <MeetingGrid items={meetings} />
      </main>
    </div>
  );
}
