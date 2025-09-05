// api/index.ts
import serverless from "serverless-http";
import app from "../src/index";

export const config = {
  api: {
    bodyParser: false, // let Express handle it
  },
};

export default serverless(app);
