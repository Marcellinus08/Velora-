// components/Header.tsx
export default function Header() {
  return (
    <header className="sticky top-0 z-20 flex w-full items-center justify-between gap-4 border-b border-solid border-neutral-800 bg-neutral-900 px-4 py-2 sm:px-6 lg:px-8">
      <div className="flex items-center gap-4">
        <button
          className="flex items-center justify-center rounded-full p-2 text-neutral-50 hover:bg-neutral-800 md:hidden"
          aria-label="Buka menu"
        >
          <svg className="size-6" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M3 18h18v-2H3v2zm0-5h18v-2H3v2zm0-7v2h18V6H3z"></path>
          </svg>
        </button>

        <div className="flex items-center gap-2">
          <svg className="size-8 text-[var(--primary-500)]" fill="none" viewBox="0 0 48 48" aria-hidden="true">
            <g clipPath="url(#clip0_6_330)">
              <path
                fill="currentColor"
                fillRule="evenodd"
                clipRule="evenodd"
                d="M24 0.757355L47.2426 24L24 47.2426L0.757355 24L24 0.757355ZM21 35.7574V12.2426L9.24264 24L21 35.7574Z"
              ></path>
            </g>
            <defs>
              <clipPath id="clip0_6_330">
                <rect width="48" height="48" fill="white"></rect>
              </clipPath>
            </defs>
          </svg>
          <h1 className="hidden text-xl font-bold leading-tight tracking-[-0.015em] text-neutral-50 sm:block">
            VideoHub
          </h1>
        </div>
      </div>

      <div className="flex flex-1 justify-center px-4 md:ml-[16.5rem] md:flex-grow-0 md:justify-start md:px-0">
        <div className="w-full max-w-2xl">
          <label className="relative flex w-full">
            <div className="relative w-full">
              <input
                className="form-input h-10 w-full rounded-full border border-solid border-neutral-800 bg-neutral-900 py-2 pl-10 pr-4 text-base font-normal leading-normal text-neutral-50 placeholder:text-neutral-400 focus:border-[var(--primary-500)] focus:outline-none focus:ring-0"
                placeholder="Cari"
                aria-label="Cari"
              />
              <div className="absolute inset-y-0 left-0 flex items-center pl-3">
                <svg className="size-5 text-neutral-400" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
                  <path d="M229.66,218.34l-50.07-50.06a88.11,88.11,0,1,0-11.31,11.31l50.06,50.07a8,8,0,0,0,11.32-11.32ZM40,112a72,72,0,1,1,72,72A72.08,72.08,0,0,1,40,112Z"></path>
                </svg>
              </div>
            </div>
          </label>
        </div>
      </div>

      <div className="flex items-center gap-2 sm:gap-4">
        <div className="hidden items-center gap-4 rounded-full bg-neutral-800 px-4 py-1.5 sm:flex">
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-yellow-400" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M239.2,97.41a16.4,16.4,0,0,0-14.21-10.06l-49.33-7.17L153.8,36.52a16.37,16.37,0,0,0-29.6,0L102.34,80.18,53,87.35A16.4,16.4,0,0,0,38.8,97.41a16.43,16.43,0,0,0,4.28,17.27l35.69,34.78-8.43,49.14a16.4,16.4,0,0,0,7.86,17.2,16.32,16.32,0,0,0,18.15,.11L128,193.07l44.13,23.2a16.32,16.32,0,0,0,18.15-.11,16.4,16.4,0,0,0,7.86-17.2l-8.43-49.14,35.69-34.78A16.43,16.43,0,0,0,239.2,97.41ZM189.5,149.31a16.46,16.46,0,0,0-4.75,17.47l8.43,49.14-44.13-23.2a16.51,16.51,0,0,0-15.1,0L90,192.72l8.43-49.14a16.46,16.46,0,0,0-4.75-17.47L58,114.53,107.29,107a16.43,16.43,0,0,0,12.39-9l21.86-43.66,21.86,43.66a16.43,16.43,0,0,0,12.39,9L224,114.53Z"></path>
            </svg>
            <span className="text-sm font-semibold text-neutral-50">2.500</span>
          </div>
          <div className="h-5 w-px bg-neutral-700"></div>
          <div className="flex items-center gap-2">
            <svg className="h-5 w-5 text-[var(--primary-500)]" fill="currentColor" viewBox="0 0 256 256" aria-hidden="true">
              <path d="M224,72H48A24,24,0,0,0,24,96V192a24,24,0,0,0,24,24H200a24,24,0,0,0,24-24V160H192a8,8,0,0,1,0-16h32V96A24,24,0,0,0,224,72ZM40,96a8,8,0,0,1,8-8H224a8,8,0,0,1,8,8v48H192a24,24,0,0,0-24,24v16H48a8,8,0,0,1-8-8Z"></path>
            </svg>
            <span className="text-sm font-semibold text-neutral-50">Rp 500.000</span>
          </div>
        </div>

        <button
          className="flex size-10 cursor-pointer items-center justify-center rounded-full text-neutral-50 transition-colors hover:bg-neutral-800"
          aria-label="Tambah"
        >
          <svg className="h-6 w-6" fill="currentColor" viewBox="0 0 20 20" aria-hidden="true">
            <path
              fillRule="evenodd"
              clipRule="evenodd"
              d="M10 5a1 1 0 011 1v3h3a1 1 0 110 2h-3v3a1 1 0 11-2 0v-3H6a1 1 0 110-2h3V6a1 1 0 011-1z"
            ></path>
          </svg>
        </button>

        <button
          className="flex size-10 cursor-pointer items-center justify-center overflow-hidden rounded-full text-neutral-50 transition-colors hover:bg-neutral-800"
          aria-label="Notifikasi"
        >
          <svg fill="currentColor" height="20" width="20" viewBox="0 0 256 256" aria-hidden="true">
            <path d="M221.8,175.94C216.25,166.38,208,139.33,208,104a80,80,0,1,0-160,0c0,35.34-8.26,62.38-13.81,71.94A16,16,0,0,0,48,200H88.81a40,40,0,0,0,78.38,0H208a16,16,0,0,0,13.8-24.06ZM128,216a24,24,0,0,1-22.62-16h45.24A24,24,0,0,1,128,216ZM48,184c7.7-13.24,16-43.92,16-80a64,64,0,1,1,128,0c0,36.05,8.28,66.73,16,80Z"></path>
          </svg>
        </button>

        <div
          className="size-10 aspect-square rounded-full bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage:
              'url("https://lh3.googleusercontent.com/aida-public/AB6AXuC3txMvWebVOWUCSc_JSlUiMuPymMamNlXpP6eVstETd_jpkEBvYMGpJlTLoyuPwEwsMNuVYLjzgBpWmzSf6GYUfFWATxj-4TF40AhJkCdlDSb39pF3NUuSO2eLUVCQs7Le4yeaVhGRKD7Qej0a1_iX065ldiv32JMh2TvPLfeEluliBoM5Mhmqpjee8Q6p86zTwHwQRPn-qtU0pO3lN1OOfA7nhRXvoyjsnoDZoNavsdfvB9Zuu4lWLeWohE9LasU1LScS-OKcER7f")',
          }}
          aria-label="Profil"
        ></div>
      </div>
    </header>
  );
}

