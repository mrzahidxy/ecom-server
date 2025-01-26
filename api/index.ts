import express, { Express} from "express";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";
import cors from 'cors'
import { errorMiddleware } from "../src/middleware/error";
import logger from '../src/logger/logger'
import httpLogger from '../src/logger/httpLogger'

const app: Express = express();
app.use(express.json());
app.use(cors({ origin: '*' }))

app.use(httpLogger);
app.use("/api", rootRouter);

app.use(errorMiddleware)

app.listen(PORT, () => {
  logger.info(`The app listening on port ${PORT}`);
});
