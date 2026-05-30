import express from "express";
import path from "path";
import fs from "fs";
import { createServer as createViteServer } from "vite";

async function startServer() {
  const app = express();
  const PORT = 3000;

  // Serve static files from m.po.trade first
  const poTradePath = path.join(process.cwd(), "extracted_frontend", "m.po.trade");
  const cabinetHtmlPath = path.join(poTradePath, "en", "cabinet.html");
  const tradingRoomHtmlPath = path.join(poTradePath, "en", "cabinet", "quick-high-low", "PKR", "index.html");

  // Custom high-fidelity redirect mapping for cabinet and trading platforms
  app.get("/en/cabinet", (req, res) => {
    res.sendFile(cabinetHtmlPath);
  });
  app.get("/en/cabinet/", (req, res) => {
    res.sendFile(cabinetHtmlPath);
  });

  app.get("/en/cabinet/quick-high-low", (req, res) => {
    res.sendFile(tradingRoomHtmlPath);
  });
  app.get("/en/cabinet/quick-high-low/", (req, res) => {
    res.sendFile(tradingRoomHtmlPath);
  });

  app.get("/en/cabinet/demo-quick-high-low", (req, res) => {
    res.sendFile(tradingRoomHtmlPath);
  });
  app.get("/en/cabinet/demo-quick-high-low/", (req, res) => {
    res.sendFile(tradingRoomHtmlPath);
  });

  // Mock handlers to protect frontend from failing on cabinet AJAX / modal queries
  app.get("/en/cabinet/ajax/*", (req, res) => {
    res.json({ 
      success: true, 
      status: "ok", 
      html: "<div class='modal-dialog text-white p-6 bg-[#1a202c] rounded-xl border border-gray-700/60 max-w-md mx-auto'><h3 class='text-lg font-bold mb-2'>Simulation Node</h3><p class='text-sm text-gray-400'>This action is simulated successfully in preview mode.</p></div>" 
    });
  });

  app.get("/en/cabinet/deposit-step-1*", (req, res) => {
    res.send("<div style='background:#0d1117;color:#fff;font-family:sans-serif;padding:40px;text-align:center;'><h2>Simulation: Deposit System Active</h2><p>Redirecting to secure processing gateway.</p><a href='/en/cabinet.html' style='color:#3b82f6;'>Return to Cabinet Dashboard</a></div>");
  });

  if (fs.existsSync(poTradePath)) {
    console.log("Serving static files from m.po.trade:", poTradePath);
    app.use(express.static(poTradePath));
  }

  // Dynamically serve other folders under extracted_frontend
  const extractedPath = path.join(process.cwd(), "extracted_frontend");
  if (fs.existsSync(extractedPath)) {
    const folders = fs.readdirSync(extractedPath);
    for (const folder of folders) {
      if (folder !== "m.po.trade") {
        const fullFolder = path.join(extractedPath, folder);
        if (fs.statSync(fullFolder).isDirectory()) {
          console.log(`Mounting fallback static route /${folder}`);
          app.use(`/${folder}`, express.static(fullFolder));
        }
      }
    }
  }

  // Custom API routes can be added here
  app.get("/api/status", (req, res) => {
    res.json({ initialized: true, mode: "preview" });
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
    // SPA fallbacks: if not matched by any static file, serve index.html
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server is running at http://0.0.0.0:${PORT}`);
  });
}

startServer().catch((err) => {
  console.error("Error starting server:", err);
});
