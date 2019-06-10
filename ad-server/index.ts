import Express from "express";

import { placementsHandler } from "./placements/placements-handler";
import { interstitialsHandler } from "./interstitials/interstitials-handler";

const app = Express();

app.use(function (
  req: Express.Request,
  res: Express.Response,
  next: Express.NextFunction
) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/r/placements", placementsHandler);

app.get("/interstitials/:id", interstitialsHandler);

app.listen(3000);
