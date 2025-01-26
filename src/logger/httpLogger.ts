import morgan from "morgan";
import logger from "./logger"; 

// Configure morgan to use the "combined" format and redirect logs to the custom logger
const httpLogger = morgan("combined", {
  stream: {
    write: (message: string) => logger.info(message.trim()), // Send logs to the custom logger
  },
});

export default httpLogger;
