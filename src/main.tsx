import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";

function bootstrap() {
  try {
    // Fail fast if required env is missing (validated when Supabase client is first imported)
    const root = document.getElementById("root");
    if (!root) throw new Error("Root element not found");
    createRoot(root).render(<App />);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Failed to start app";
    document.body.innerHTML = `<div style="padding:2rem;font-family:system-ui;max-width:480px;margin:0 auto;"><h1>Configuration error</h1><p>${msg}</p><p>Check <code>.env</code> and <code>.env.example</code>.</p></div>`;
  }
}

bootstrap();
