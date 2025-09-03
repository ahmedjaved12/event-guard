import Image from "next/image";

export default function Hero() {
    return (
        <section className="relative pt-32 pb-20 bg-gradient-to-b from-blue-50 to-white">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-12 items-center">
                {/* Left content */}
                <div>
                    <h1 className="text-4xl md:text-6xl font-extrabold text-gray-900 leading-tight">
                        Secure & Seamless Event Management with{" "}
                        <span className="text-blue-600">EventFlow</span>
                    </h1>
                    <p className="mt-6 text-lg text-gray-600">
                        Whether you’re an organizer creating events or a participant joining them,
                        EventFlow makes your event experience safe and effortless.
                    </p>
                    <div className="mt-8 flex gap-4">
                        <a
                            href="/auth/signup"
                            className="px-6 py-3 bg-blue-600 text-white font-medium rounded-lg shadow hover:bg-blue-700 transition"
                        >
                            Get Started
                        </a>
                        <a
                            href="#features"
                            className="px-6 py-3 bg-gray-100 text-gray-800 font-medium rounded-lg hover:bg-gray-200 transition"
                        >
                            Learn More
                        </a>
                    </div>
                </div>

                {/* Right image/illustration */}
                <div className="relative">
                    <Image
                        src="/images/hero.png" // 🔹 put an SVG/PNG in /public
                        alt="Event illustration"
                        width={500}
                        height={500}
                        className="object-contain"
                    />
                </div>
            </div>
        </section>
    );
}
