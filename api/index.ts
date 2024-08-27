import express, { Express} from "express";
import { PORT } from "../src/secret";
import rootRouter from "../src/routes";

const app: Express = express();
app.use(express.json());


app.use("/api", rootRouter);

app.listen(PORT, () => {
  console.log(`The app listening on port ${PORT}`);
});
