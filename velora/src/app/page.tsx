// app/page.tsx
import Header from "@/components/header";
import Sidebar from "@/components/sidebar";
import Carousel from "@/components/carousel";
import Categories from "@/components/categories";
import CardsGrid from "@/components/cardsgrid";

export default function Home() {
  return (
    <>
      <Header />
      <div className="flex h-full grow flex-row">
        <Sidebar />
        <main className="flex-1 px-4 py-6 sm:px-6 lg:px-8">
          <div className="relative mb-6 w-full">
            <Carousel size="h-[500px]" interval={7000} />
          </div>
          <Categories />
          <CardsGrid />
        </main>
      </div>
    </>
  );
}
