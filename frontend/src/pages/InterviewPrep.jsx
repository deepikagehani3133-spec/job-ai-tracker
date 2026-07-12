import MainLayout from "../layouts/MainLayout";
import { useState } from "react";
import toast from "react-hot-toast";
import api from "../lib/api";
function InterviewPrep() {

    const [role, setRole] = useState("");

    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const generateQuestions = async () => {

        if (!role) {
            toast.error("Please enter role 😄");
            return;
        }

        try {

            setLoading(true);

            const response = await api.post("/generate-questions", { role });

            const result =
                response.data.result
                    .split("\n")
                    .filter((q) => q.trim() !== "");

            setQuestions(result);

            toast.success("AI Questions Generated 😎");

        } catch {

            toast.error("Something went wrong ❌");

        } finally {

            setLoading(false);
        }
    };
    return (
        <MainLayout>

            <h1 className="text-4xl font-bold mb-8">
                AI Interview Prep
            </h1>

            <div className="bg-zinc-900 border border-zinc-800 rounded-3xl p-6">

                <div className="flex flex-col md:flex-row gap-4">

                    <input
                        type="text"
                        placeholder="Enter role (Laravel Developer)"
                        value={role}
                        onChange={(e) => setRole(e.target.value)}
                        className="flex-1 bg-zinc-950 border border-zinc-800 rounded-xl px-4 py-3 outline-none focus:border-violet-500"
                    />

                    <button
                        onClick={generateQuestions}
                        disabled={loading}
                        className="bg-violet-600 hover:bg-violet-700 transition px-6 py-3 rounded-xl font-semibold"
                    >
                        {loading ? "Generating..." : "Generate Questions"}
                    </button>

                </div>

            </div>

            <div className="mt-8 space-y-4">

                {questions.map((question, index) => (

                    <div
                        key={index}
                        className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5"
                    >

                        <p className="text-lg">
                            {question}
                        </p>

                    </div>

                ))}

            </div>

        </MainLayout>
    );
}

export default InterviewPrep;
