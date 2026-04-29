import "dotenv/config";
import app from "./src/app.js";
import { checkDB } from "./src/db/db.js";

const PORT = process.env.PORT || 5000;
const NODE_ENV = process.env.NODE_ENV || "development";

async function start() {
  try {
    await checkDB();

    app.listen(PORT, () => {
      console.log(`Server is running on port ${PORT} in ${NODE_ENV} mode`);
      console.log(`Health check: http://localhost:${PORT}/health`);
    });
  } catch (err) {
    console.error("Startup failed:", err);
    process.exit(1);
  }
}

start();
