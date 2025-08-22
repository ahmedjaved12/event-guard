import Navbar from "./components/Navbar";
import Hero from "./components/Hero";
import Features from "./components/Features";
import Footer from "./components/Footer";
import About from "./components/About";
import Contact from "./components/Contact";

export default function LandingPage() {
  return (
    <main className="bg-white text-gray-900">
      <Navbar />
      <Hero />
      <Features />
      <About />
      <Contact />
      <Footer />
    </main>
  );
}
