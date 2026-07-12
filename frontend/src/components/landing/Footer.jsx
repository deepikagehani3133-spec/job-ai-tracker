function Footer() {
    return (
        <footer
            id="contact"
            className="border-t border-zinc-800 py-10"
        >
            <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center">

                <h2 className="text-2xl font-bold text-violet-400">
                    Job AI Tracker
                </h2>

                <p className="text-zinc-500 mt-4 md:mt-0">
                    Built with ❤️ React • Laravel • Tailwind • Groq AI
                </p>

            </div>
        </footer>
    );
}

export default Footer;