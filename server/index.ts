import "dotenv/config";
import express from "express";
import { readFileSync } from "fs";
import { resolve, dirname } from "path";
import { fileURLToPath } from "url";
import yaml from "js-yaml";
import { streamText } from "ai";
import { getAgentModel } from "../ai/ai.config";

const app = express();
app.use(express.json());

const PORT = process.env.PORT || 3001;

const __dirname = dirname(fileURLToPath(import.meta.url));
const configPath = resolve(__dirname, "../config.yaml");
const rawConfig = yaml.load(readFileSync(configPath, "utf-8")) as Record<string, unknown>;

function interpolate(obj: unknown, vars: Record<string, string>): unknown {
    if (typeof obj === "string") {
        return obj.replace(/\{\{(\w+)\}\}/g, (_, key) => vars[key] ?? `{{${key}}}`);
    }
    if (Array.isArray(obj)) return obj.map((item) => interpolate(item, vars));
    if (obj && typeof obj === "object") {
        const result: Record<string, unknown> = {};
        for (const [k, v] of Object.entries(obj)) {
            result[k] = interpolate(v, vars);
        }
        return result;
    }
    return obj;
}

const config = interpolate(rawConfig, { appName: rawConfig.appName as string }) as Record<string, unknown>;

app.get("/api/config", (_req, res) => {
    res.json(config);
});

app.post("/api/chat", async (req, res) => {
    const { messages } = req.body;

    if (!messages || !Array.isArray(messages)) {
        res.status(400).json({ error: "messages array is required" });
        return;
    }

    try {
        const model = await getAgentModel();

        const result = streamText({
            model,
            system: (config.systemPrompt as string) || "You are a helpful AI assistant.",
            messages,
        });

        res.setHeader("Content-Type", "text/event-stream");
        res.setHeader("Cache-Control", "no-cache");
        res.setHeader("Connection", "keep-alive");

        for await (const chunk of result.textStream) {
            res.write(`data: ${JSON.stringify({ text: chunk })}\n\n`);
        }

        res.write("data: [DONE]\n\n");
        res.end();
    } catch (err: unknown) {
        console.error("Chat error:", err);
        if (!res.headersSent) {
            const message = err instanceof Error ? err.message : "Internal server error";
            res.status(500).json({ error: message });
        }
    }
});

app.listen(PORT, () => {
    console.log(`${config.appName || "Chat"} server running on http://localhost:${PORT}`);
});
