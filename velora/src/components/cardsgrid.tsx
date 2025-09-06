type Card = {
  title: string;
  author: string;
  price: string;
  bg: string;
};

const cards: Card[] = [
  {
    title: "Cooking Masterclass: The Art of Modern Cuisine",
    author: "Chef Isabella Rossi",
    price: "$10",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAoJxTecPhE_PaHpo4ZMSRgsJyjjbygHj90EAayCOOo8Z61pIDLDKnANPpOPMRJmq9pRh3GMZuQ6uk1F3nKNawraJTtfehJfC_EZ7qgQX7ktNINJtTTaNVMIDSty3QfcJigHJbB3XiHQiekgePmLgzhWdD4qqrOg1SkYCaulR27KioxNtGqHocE0ZH5NdikY51LvDifBXYWb0FaNbVIWW5BUhX2AyI6Nya7Aw0kimRjnIV-d2QKl-v9HkNwdMBubIFjjRe9LfWk-bXH",
  },
  {
    title: "Public Speaking: From Zero to Hero",
    author: "David Chen",
    price: "$5",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBDjniJlmxMi7b-oB_8sjuSATkUHfeL21k5m2Mqd9zeS18rfr9WURcDyzeEkV_324WCYUu0T4REO53p9N_sZ_ZCDshScUKx8g5i6iJ6GaA9qRoXCeZT64C5Yq65zjBCLFp-NE-XmkoBA68ZQP2Xqh3-xXdpXIdtMgatYomLqcxx83_MRrhiyXQcxGjiNjrVVmqlfWrxDzQ27ztQeMnpLYBJHIzI78MfeliguPoiyAwJA7D1dormLouVvyp38l-MyxTSTS7CzuxkU1KO",
  },
  {
    title: "Portrait Photography: Capturing the Soul",
    author: "Emily Carter",
    price: "$13",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAHrvuNync_nTfcbA8iztllr7QKztBcoVpacwu54RVKBswSfbItkTVJlz3hT84f_fPd19JQbWdWflKUR5QZhd8dnNvJ9PbUD467CPGDlp32MM7J2zKjZGdvNcFnBnUSg769Z3vxEf62UlUqigg401KvZvlTFSSHmkqrf6s3avv9qjWvIxYKX5cP8AMXFIbF6THqs5CLCJ66iZ9y9vN6xDJi6RYXOdodIArH96v7OdGhL42jSmFEiKnMxg0BQ2A_M4g3wW6O0qXmMdU-",
  },
  {
    title: "The Ultimate Guide to Playing Acoustic Guitar",
    author: 'Lucas "Fingers" Martinez',
    price: "$8",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuAcdpuyftqTDqAxv1fhQGVKwHJsZoqkzfOib83VuTMNzmJoUgXREbUn0PNZbS_k__5NQW9ZAHVV_f07xIwIX6aJNy6UYHgfNYmEwyu1gsY4GwyTnz7b6shtb93HRgGJ-EOyZRs-lj5FNEgTH7Qqv701OidCcfQuwW5Uf7-AU575nRoHIsr0muFzTr1XvSt48XLPKKIjX0wr9ZzFhcIcRiYyyP0QQmmxCHOQZzMaer5mwufwz2KXbH3-nLNsIGuHB58DcxsSTYhWExl8",
  },
  {
    title: "Digital Marketing Blueprint: Dominate Online",
    author: "Sophia Nguyen",
    price: "$16",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBqQpFfhJWXk-PDNjcooaC8ntcr4pu725yS7IdTOmYRheqXcJJxNUmwAb0rgKxzggiLL5PaQoi5desffETn0HLQsvdvhkg2ZOwe9g6pOVxs55Iqw5ScXU2k-AOao17ptE-w-qeW7P095b7wAq7UIo_-wf7oftwrFJ26Ay-c9Wf1UmHx7MGrd-CTsd0jOtLeStvCWP51k82UmEeo9HCZXxUdaDcC29Daij2NLY_B41ToznuV6WSODSQZt1pgGF6ihxUxCSWz7PaMxZqg",
  },
  {
    title: "Character Illustration: Bring Your Imagination to Life",
    author: "Kenji Tanaka",
    price: "$7",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuCEVJK__qjnTwSejU2rHU2HJtXhdJPgwQbB4EQ0vD1-NI27875gChjqhz3GoebTx-qIb7D4hpaeVqcG4cw4eTONPIheZvm-Dq5OR8NOvW-s4e6OX0Imq3ioJ8_UdW0l5b0ENbovjaVkzXb2iUUzsRk9FkH8sUtjka2fUISwvki2NgK9YOZABh1gD7tL8UHvbgjYG5ML5nm6DcaVLprjF777sfPamy8axlHLUQxlaS6FibU_chLw19rEdaKWZ9v3SqOmB0kw8ezPiJCE",
  },
  {
    title: "Full-Stack Web Development: From Concept to Launch",
    author: "Dr. Evelyn Reed",
    price: "$20",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuDjFY2ZHtVpUqiwvgHNWf_hb1cG1dQana_i8GwQKa1QBoKygtoyfwjjljKZM--SZUB0hwv6UFxgqpY1UURE_snhhZ8g_TTt0QBSpaY0NidHyRYDofpmo2ih59zNKbcPSU9PSShVO76Pssu07jgsYmWAo0PD0VpucHHs6Op8Btj-AT21VRaDVyJpZ6HXac1a8J0XQ-jub9DFhXORyArxHMMPLYAjuoHas3JrKX-23W0py2zmJdT_II0FnuJk_Yx3VPlKAlRb7-or3EDY",
  },
  {
    title: "Yoga & Meditation: Find Inner Peace",
    author: "Anya Sharma",
    price: "$4",
    bg: "https://lh3.googleusercontent.com/aida-public/AB6AXuBnCj3aMnBP75gPn0ulvACPlTz8OrDY5T7Ob_61MG2fl9-yKMBlxkUr4wrY94FUxe__4Dp0jO5LZ1tXh05_z244574zb4MFxZmCmyb4-ATTOzvtN6YcJhqSZG6DfmK1LV3JAUw1tZDG22AxwuneT8oy7Lf6-Gc7njwLtJWQIRJrGYJ5kRxHONewolW6sEG-_K5BzD6juWC-N005tcwckHJdW4glOPR4BQLCny2vnS4OHM4LhKFjDw1vIPZzRJowb_m9Mvn8DDwbXVYf",
  },
];

export default function CardsGrid() {
  return (
    <div className="grid grid-cols-[repeat(auto-fill,minmax(280px,1fr))] gap-x-4 gap-y-8 pt-6">
      {cards.map((c) => (
        <div
          key={c.title}
          className="group flex flex-col rounded-xl bg-neutral-900"
        >
          {/* Thumbnail */}
          <div className="relative w-full overflow-hidden rounded-xl">
            <div
              className="aspect-video w-full cursor-pointer bg-cover bg-center bg-no-repeat transition-transform duration-300 group-hover:scale-105"
              style={{ backgroundImage: `url("${c.bg}")` }}
            ></div>
          </div>

          {/* Info */}
          <div className="flex flex-1 flex-col gap-2 p-2">
            <h3 className="cursor-pointer text-base font-semibold leading-snug text-neutral-50">
              {c.title}
            </h3>
            <p className="cursor-pointer text-sm font-normal text-neutral-400">
              {c.author}
            </p>

            {/* Price + Button */}
            <div className="mt-auto flex items-center justify-between">
              <p className="text-base font-bold text-neutral-50">{c.price}</p>
              <button className="rounded-full bg-[var(--primary-500)] px-4 py-1.5 text-sm font-semibold text-white transition-colors hover:bg-opacity-80">
                Buy Now
              </button>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

