import { Request, Response } from "express";
import React from "react";
import ReactDOMServer from "react-dom/server";
import * as fs from "fs";

import Interstitial1 from "./interstitial-1";

const baseStyles = fs.readFileSync(`./ad-server/interstitials/index.css`, {
  encoding: "utf8"
});

const interstitials: { [id: string]: any } = {
  "interstitial-1": {
    component: Interstitial1
  }
};

function interstitialsHandler(req: Request, res: Response) {
  const { id } = req.params;
  const { placementUuid } = req.query;
  const referrer = req.get("referer");

  const { component: Component, styles = "" } = interstitials[id] || {};

  if (!Component) {
    res.send(204);
  }

  const style = `${baseStyles}${styles}`;

  const title = "Interstitial";

  const scripts = (
    <script
      type="text/javascript"
      src="http://localhost:8080/interstitial.js"
      data-placement-uuid={placementUuid}
      data-referrer={referrer}
    ></script>
  );
  const extraScripts = null;

  const content = ReactDOMServer.renderToStaticMarkup(
    <html>
      <head>
        <title>{title}</title>
        <style>{style}</style>
      </head>
      <body style={{ margin: 0 }}>
        <Component />
        {scripts}
        {extraScripts}
      </body>
    </html>
  );

  res.send(content);
}

export { interstitialsHandler };
