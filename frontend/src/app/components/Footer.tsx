export default function Footer() {
    return (
        <footer className="bg-gray-900 text-gray-400 py-10">
            <div className="max-w-7xl mx-auto px-6 grid md:grid-cols-2 gap-6 items-center">
                <p>© {new Date().getFullYear()} EventFlow. All rights reserved.</p>
                <nav className="flex justify-center md:justify-end space-x-6">
                    <a href="#features" className="hover:text-white">Features</a>
                    <a href="#about" className="hover:text-white">About</a>
                    <a href="#contact" className="hover:text-white">Contact</a>
                </nav>
            </div>
        </footer>
    );
}
