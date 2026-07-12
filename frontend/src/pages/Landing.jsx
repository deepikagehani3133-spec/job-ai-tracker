import Navbar from "../components/landing/Navbar";
import Hero from "../components/landing/Hero";
import Features from "../components/landing/Features";
import HowItWorks from "../components/landing/HowItWorks";
import CTA from "../components/landing/CTA";
import Footer from "../components/landing/Footer";

function Landing() {
    return (
        <div className="bg-zinc-950 text-white overflow-x-hidden">

            <Navbar />

            <Hero />

            <Features />

            <HowItWorks />

            <CTA />

            <Footer />

        </div>
    );
}

export default Landing;