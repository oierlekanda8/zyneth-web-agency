import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { google } from "googleapis";
import dotenv from "dotenv";

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(express.json());

  // API Route for Contact Form
  app.post("/api/contact", async (req, res) => {
    const { name, email, business, phone, message } = req.body;

    try {
      const auth = new google.auth.GoogleAuth({
        credentials: JSON.parse(process.env.GOOGLE_SERVICE_ACCOUNT_KEY || "{}"),
        scopes: ["https://www.googleapis.com/auth/spreadsheets"],
      });

      const sheets = google.sheets({ version: "v4", auth });
      const spreadsheetId = process.env.GOOGLE_SHEETS_ID;
      const range = process.env.GOOGLE_SHEETS_RANGE || "Sheet1!A:G";

      if (!spreadsheetId) {
        throw new Error("GOOGLE_SHEETS_ID is not set");
      }

      // Append row to Google Sheets
      // Mapping:
      // Column C (Index 2): Nombre
      // Column D (Index 3): Negocio
      // Column E (Index 4): Email
      // Column F (Index 5): Telefono
      // Column G (Index 6): Objetivo (Mensaje)
      
      const values = [
        "", // A
        "", // B
        name, // C
        business, // D
        email, // E
        phone, // F
        message, // G
      ];

      await sheets.spreadsheets.values.append({
        spreadsheetId,
        range,
        valueInputOption: "RAW",
        requestBody: {
          values: [values],
        },
      });

      res.status(200).json({ success: true });
    } catch (error) {
      console.error("Error saving to Google Sheets:", error);
      res.status(500).json({ 
        success: false, 
        error: "Failed to save data. Make sure GOOGLE_SHEETS_ID and GOOGLE_SERVICE_ACCOUNT_KEY are configured." 
      });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
