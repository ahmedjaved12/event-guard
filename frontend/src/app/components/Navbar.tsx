"use client";

export default function Navbar() {
    return (
        <header className="w-full fixed top-0 left-0 bg-white/80 backdrop-blur-sm border-b border-gray-200 z-50">
            <div className="max-w-7xl mx-auto px-6 py-4 flex items-center justify-between">
                {/* Logo */}
                <div className="text-2xl font-bold text-blue-600">EventFlow</div>

                {/* Nav links */}
                <nav className="hidden md:flex space-x-8">
                    <a href="#features" className="text-gray-700 hover:text-blue-600 transition">
                        Features
                    </a>
                    <a href="#contact" className="text-gray-700 hover:text-blue-600 transition">
                        Contact
                    </a>
                    <a href="#about" className="text-gray-700 hover:text-blue-600 transition">
                        About
                    </a>
                </nav>

                {/* Get Started Button */}
                <a
                    href="/auth/signup"
                    className="ml-6 inline-block px-5 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
                >
                    Get Started
                </a>
            </div>
        </header>
    );
}
