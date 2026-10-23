import { pool } from '@workspace/db';
import app from "./app";
import { logger } from "./lib/logger";

const rawPort = process.env["PORT"];

if (!rawPort) {
  throw new Error(
    "PORT environment variable is required but was not provided.",
  );
}

const port = Number(rawPort);

if (Number.isNaN(port) || port <= 0) {
  throw new Error(`Invalid PORT value: "${rawPort}"`);
}

const server=app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }

  logger.info({ port }, "Server listening");
});

for(const signal of ["SIGINT","SIGTERM"])process.on(signal,()=>{server.close(()=>{void pool.end().then(()=>process.exit(0));});setTimeout(()=>process.exit(1),10000).unref();});
