const features = [
    {
        title: "Create Events Easily",
        description: "Organizers can quickly set up and manage events with secure access.",
        icon: "📅",
    },
    {
        title: "Join as Participant",
        description: "Participants can discover and join events seamlessly.",
        icon: "🎟️",
    },
    {
        title: "Secure Access",
        description: "OTP-based authentication ensures only verified users enter.",
        icon: "🔒",
    },
];

export default function Features() {
    return (
        <section id="features" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-6 text-center">
                <h2 className="text-3xl md:text-4xl font-bold text-gray-900">Features</h2>
                <p className="mt-4 text-gray-600">Everything you need to run events smoothly</p>

                <div className="mt-12 grid gap-8 md:grid-cols-3">
                    {features.map((f, idx) => (
                        <div
                            key={idx}
                            className="bg-white border border-gray-200 rounded-lg p-8 shadow hover:shadow-lg transition"
                        >
                            <div className="text-4xl mb-4">{f.icon}</div>
                            <h3 className="text-xl font-semibold">{f.title}</h3>
                            <p className="mt-3 text-gray-600">{f.description}</p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
}
