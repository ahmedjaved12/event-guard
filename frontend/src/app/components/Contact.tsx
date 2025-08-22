export default function Contact() {
    return (
        <section className="bg-white py-20" id="contact">
            <div className="max-w-6xl mx-auto px-6 lg:px-8">
                <div className="text-center">
                    <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                        Get in Touch
                    </h2>
                    <p className="mt-4 text-lg text-gray-600 max-w-2xl mx-auto">
                        Have questions or ideas? We’d love to hear from you.
                    </p>
                </div>

                <form className="mt-10 max-w-2xl mx-auto grid grid-cols-1 gap-y-6 sm:grid-cols-2 sm:gap-x-6">
                    <input
                        type="text"
                        placeholder="Your Name"
                        className="col-span-1 sm:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <input
                        type="email"
                        placeholder="Your Email"
                        className="col-span-1 sm:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <textarea
                        rows={4}
                        placeholder="Your Message"
                        className="col-span-1 sm:col-span-2 rounded-lg border border-gray-300 px-4 py-3 text-gray-900 focus:ring-2 focus:ring-blue-600 focus:outline-none"
                    />
                    <button
                        type="submit"
                        className="col-span-1 sm:col-span-2 rounded-lg bg-blue-600 px-6 py-3 text-white font-semibold shadow hover:bg-blue-700 transition"
                    >
                        Send Message
                    </button>
                </form>
            </div>
        </section>
    );
}
