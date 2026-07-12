import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import "./index.css";
import "./lib/api.js"; // installs axios interceptors globally
import App from "./App.jsx";
import { Toaster } from "react-hot-toast";

createRoot(document.getElementById("root")).render(
    <StrictMode>
        <App />
        <Toaster
            position="top-right"
            reverseOrder={false}
            toastOptions={{
                duration: 3500,
                style: {
                    background: "#18181b",
                    color: "#fff",
                    border: "1px solid #27272a",
                },
                success: {
                    iconTheme: { primary: "#8b5cf6", secondary: "#fff" },
                },
            }}
        />
    </StrictMode>
);
