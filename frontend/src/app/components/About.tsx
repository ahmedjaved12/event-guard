export default function About() {
    return (
        <section className="bg-gray-50 py-20" id="about">
            <div className="max-w-6xl mx-auto px-6 lg:px-8 text-center">
                <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">
                    About Event Flow
                </h2>
                <p className="mt-4 text-lg text-gray-600 max-w-3xl mx-auto">
                    Event Flow makes creating and joining events effortless. Whether
                    you’re an organizer hosting conferences, concerts, or private
                    meetups—or a participant looking for exciting opportunities—we ensure
                    a secure and seamless experience.
                </p>

                <div className="mt-10 grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3">
                    <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-blue-600">For Organizers</h3>
                        <p className="mt-2 text-gray-600">
                            Create, customize, and manage events with ease. Track participants
                            and send updates in real-time.
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-blue-600">For Participants</h3>
                        <p className="mt-2 text-gray-600">
                            Discover and join events effortlessly, get instant notifications,
                            and stay connected.
                        </p>
                    </div>
                    <div className="rounded-xl bg-white p-6 shadow hover:shadow-lg transition">
                        <h3 className="text-xl font-semibold text-blue-600">Our Mission</h3>
                        <p className="mt-2 text-gray-600">
                            To connect people through secure, innovative, and user-friendly
                            event experiences.
                        </p>
                    </div>
                </div>
            </div>
        </section>
    );
}
