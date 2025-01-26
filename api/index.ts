import express, { Express } from "express";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";
import cors from 'cors'
import { errorMiddleware } from "../src/middleware/error";
import logger from '../src/logger/logger'
import httpLogger from '../src/logger/httpLogger'
import healthRouter from "../src/middleware/health-check";

const app: Express = express();
app.use(express.json());
app.use(cors({ origin: '*' }))

app.use(errorMiddleware)
app.use(httpLogger);

app.use(healthRouter)
app.use("/api", rootRouter);


app.listen(PORT, () => {
  logger.info(`The app listening on port ${PORT}`);
});
