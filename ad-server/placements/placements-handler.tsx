import { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import * as fs from "fs";

import CreditPromotion from "./credit-promotion";
import TopStrip from "./top-strip";
import FooterBadge from "./footer-badge";

function readFile(filename: string) {
  return fs.readFileSync(filename, {
    encoding: "utf8"
  });
}

const placements: { [id: string]: any } = {
  "credit-promotion-standard": {
    component: CreditPromotion,
    styles: readFile("./ad-server/placements/credit-promotion.css")
  },
  "credit-promotion-large": {
    component: CreditPromotion,
    styles: readFile("./ad-server/placements/credit-promotion.css")
  },
  "top-strip": {
    component: TopStrip,
    styles: readFile("./ad-server/placements/top-strip.css")
  },
  "footer-badge": {
    component: FooterBadge,
    styles: readFile("./ad-server/placements/footer-badge.css")
  }
};
const baseStyles = readFile("./ad-server/placements/index.css");

function placementsHandler(req: Request, res: Response) {
  const {
    key,
    locale,
    clientId,
    placementUuid
  }: {
    [id: string]: string;
  } = req.query;
  const referrer = req.get("referer");
  const { component, styles = "" } = placements[key];
  const interstitialId = "interstitial-1";

  const Component = component;
  if (!Component) {
    res.send(204);
  }

  const style = `${baseStyles}\n${styles}`;

  const title = "Placement";

  const script = (
    <script
      type="text/javascript"
      src="http://localhost:8080/ad.js"
      data-placement-uuid={placementUuid}
      data-referrer={referrer}
      data-interstitial-id={interstitialId}
    ></script>
  );

  console.time("renderToStaticMarkup");
  const content = ReactDOMServer.renderToStaticMarkup(
    <html>
      <head>
        <title>{title}</title>
        <style>{style}</style>
      </head>
      <body style={{ margin: 0 }}>
        <Component />
        {script}
      </body>
    </html>
  );
  console.timeEnd("renderToStaticMarkup");

  res.send(content);
}

export { placementsHandler };
