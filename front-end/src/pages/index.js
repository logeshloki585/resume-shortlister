
import { Inter } from "next/font/google";
import NavbarComponent from "@/Components/Navbar";
import Hero from "@/Components/Hero";
import Footer from "@/Components/Footer";


const inter = Inter({ subsets: ["latin"] });

export default function Home() {
  return (
    <main
      className={` min-h-screen   ${inter.className}`}
    >
      <div className="p-6">
      <NavbarComponent/>
      </div>
      <Hero/>
      <div className="px-64 pb-28 pt-12">
        <div className="text-[32px]">
          <svg
            className="mb-4 h-8 w-8 text-gray-400 dark:text-gray-600"
            aria-hidden="true"
            xmlns="http://www.w3.org/2000/svg"
            fill="currentColor"
            viewBox="0 0 18 14"
          >
            <path d="M6 0H2a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3H2a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Zm10 0h-4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h4v1a3 3 0 0 1-3 3h-1a1 1 0 0 0 0 2h1a5.006 5.006 0 0 0 5-5V2a2 2 0 0 0-2-2Z" />
          </svg>
          "Flowbite is just awesome. It contains tons of predesigned components and pages starting from login screen to
          complex dashboard. Perfect choice for your next SaaS application."
        </div>
       
      </div>
      <Footer/>
    </main>
  );
}
