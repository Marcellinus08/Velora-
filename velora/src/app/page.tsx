import Sidebar from "@/components/sidebar";
import Carousel from "@/components/home/carousel";
import Categories from "@/components/home/categories";
import CardsGrid from "@/components/home/cardsgrid";
import HomeMeetRibbon from "@/components/home/meet";

export default function Home() {
  return (
    <div className="flex h-full grow flex-row">
      <Sidebar />
      <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
        <div className="relative mb-6 w-full">
          <Carousel size="h-[500px]" />
        </div>

        {/* Meet yang lebih simple & elegan */}
        <HomeMeetRibbon />

        <Categories />
        <CardsGrid />
      </main>
    </div>
  );
}
