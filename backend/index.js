import "dotenv/config";
import app from "./app.js";
import { checkDB } from "./src/db/db.js";

const PORT = process.env.PORT || 5002;

// Standard Vercel Environment detection
const isVercel = process.env.VERCEL === '1' || !!process.env.VERCEL_URL;

if (!isVercel) {
  // Local development flow
  checkDB()
    .then(() => {
      app.listen(PORT, () => {
        console.log(`🚀 Local Development Server running at http://localhost:${PORT}`);
        console.log(`📡 Health Check: http://localhost:${PORT}/api/ping`);
      });
    })
    .catch((err) => {
      console.error("❌ Failed to start local server:", err);
      process.exit(1);
    });
}

// Export for Vercel Serverless Functions
export default app;
