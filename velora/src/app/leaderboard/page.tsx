import Leaderboard, { TopUser, TableEntry } from "@/components/leaderboard";

export default function LeaderboardPage() {
  // data dummy 
  const top3: [TopUser, TopUser, TopUser] = [
    {
      rank: 2,
      name: "Jane Doe",
      handle: "janedoe",
      score: 12500,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBQl1MIsY60VRktm3RplleKk9peiKsXzKgqkPvqCa-0nAtx-BUPT84QcM4p4w_I7gXKiGXPV5EJSHiY6wG3wI6i6DjS3WtyT211Z0WOU-cjtO1ZITM1sebuRC3bRITVAL2kPYfTSU6pVEv6yjq23dkw7FdZG36vxtS31OsIDitblNk-KysUeQuJdtDSqIZWooOSXvUbGoQJ1rwHQAJjTDu4rG5HSsOkyWVTH-e6hyjj2-5vvXuUZGGUfbPy5pLZ0tgzum1uMVnhqmdm",
    },
    {
      rank: 1,
      name: "John Smith",
      handle: "johnsmith",
      score: 15000,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuB1yH-XLy4UM4gP9ftjwmKFon4BAWFzOoZSbRfjmGKO2uKHRickLEME_BAtCPuDsglop7iUiNDaiUG5DbIyGkVUSQYOxbriSr7U7rEjncy9tRKCP8WSJK_sFTo6L5PyfR3XiZnBgUPlv8tIWUY2USp5apMCLg7lw1rIVjW9JetBJVprp8-DnNZZK6Cdc56RliPFVF-iWilu7-0mtKdAVhr09H2w_JJmLeoo5ANNF8_X7vzwk7nSB_vuGyljjzjAi9LKun3geD5-NfWh",
    },
    {
      rank: 3,
      name: "Sarah Kim",
      handle: "sarahkim",
      score: 10000,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuBKqnS9MkM4laqda85Mp2Nix1W6L8kzoGkQYQF2nihjcJXvMVHSYEYPrRpQ3Srnnj3YPvHpjKJ7hgsKOR0k-oHR2InMw7DjB3-djwOdOqx757GXLaRwOPG3BdvycebgHA5K-WyCKrIN1pw6PHg39O4lj8mz7NzaKXugdbU0aYTWqDaiXlcVx5CHMcm5kfMZix1kOnTgTwvafMA3g-AyD5Uyo5Ffswt_uhadbTklK8K-MXMEAgBKJCyo9UBRacqHuQb1fiKNrwZA01pe",
    },
  ];

  const entries: TableEntry[] = [
    {
      rank: 4,
      name: "Michael Brown",
      handle: "michaelbrown",
      score: 9800,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCRnj9vWr7aENKnIFXOjf6zEeOPSl9_Bt4vdp4t7N30iTnfBqp68f_SKDtUHvFmlaAFWWYDEOiQ_nQPmyDz8D0CmKfFmwyoLaTOVJFefFppEjIP8jc8-RRoZeK09mQWH3l9mr7SQj3JooIfyXdicY4AoMBOzYDOL9E7zY4viyDSFvshszM_zp08TNbb2GfJvrZKCjlOQLN_VxjG0RiVfw2X-XMhWHd4PPPAV4BOYo5OpfdS2t6taIvYomr7M3A0_QTjdXk14luTnIHF",
    },
    {
      rank: 5,
      name: "Emily Davis",
      handle: "emilydavis",
      score: 9500,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCaHyWetNd5ZwLxisIp4AOdE5D3whVExl618SBVh2yzliTsJ6SF9H1A4QJvOiU9GQh3Dvmm60S1Bxy-1rWbZr3TONV67ohS5sniltk6Ttq9zcNu3IJjggqZ5pRVAt5Z0XDs3HgBm3FaRD3Y5C_oYfgC8VaV2LpDRR7HyZIp7qCurqL2n-U_mvalBvQ8ovxPzgEvf_woy6nP6uiKnDnrour2NlHqq7LGUY0DAnbT7WojL11ALs1l41HC8Bcynb_VkVxPIe1fc-NQ4eZT",
    },
    {
      rank: 6,
      name: "Chris Wilson",
      handle: "chriswilson",
      score: 9200,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCSw8eYbUd98c1Ibr72yDSFuP4GqYDK-86PkRF7xRprglTdptPh-cyETJHedGtgZl1A4t5CF99Yv-KSnRiIHN13rMR9WRb6e6xL2zkQWRpvxcDDSTXqOgURUCdGtpdRJXY6lme-t0CSH-I38Es-gNTFGOUNnG2a1d4CXHSedqV44UGlqS9ujjolunUo_Qa8C3GT3EAcL4QpJMlvZOldfcgLpA0jI2W16p3fhnPD3T-XZJZu2CJ6kAjUn_23mBoomSE2M159KXn1HQFs",
    },
    {
      rank: 7,
      name: "Jessica Lee",
      handle: "jessicalee",
      score: 8900,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuCYigOEac3yRqw_pWGaQBpjo_KvcIptqsAupz7WiizgIHWD4oF6cRhq9FNJr3bD5Pki_5GWXMosHuKbw4iow3mDB7vJE_ykFEm4-j61vkp7kCNDa4k_SxFwwiKQDyLhslTPDgEyKL85CMqqehDc1Vo-8tPhL06rW6bhYsS_4Ki7AhKJ_3Dka5ToE74LsR9MOXpVr7NjbcyXhhDY_IGmzQAMQv4BIi1cuFu-AtdR8pnY4PxbUidcjN0WX7NG4G_OjI-5F6J7x5FIZpld",
    },
    {
      rank: 8,
      name: "David Martinez",
      handle: "davidmartinez",
      score: 8600,
      avatar:
        "https://lh3.googleusercontent.com/aida-public/AB6AXuAsd7-24yHtZveRwrI3cIptvoxlxrEl9baGvbMBAPKKbKnWX_kGaPGQO7zy5XIpqLmlu79NBaMAdaN8UNSdqaFOWZ3DEPYyWxV-ckJxAd3gL0gP3LvgDdcpqkatsl31-l-gRYyN8Cyep16uVcWYKgwKk4WInpLr29fWxfM_s6oklU2Qis6X18aJHKqCBFJHOt99GCuy12BiPG1Yx707kaPFSv2SgckWK15KoYJ1AVZArgU1zWJT7Hkhj2p2ecQMUZ8b9OsCtfwHqzzS",
    },
  ];

  return <Leaderboard top3={top3} entries={entries} />;
}
