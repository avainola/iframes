import Express from "express";
import * as fs from "fs";

const app = Express();

const html = fs.readFileSync("./ad-server/templates/index.html", {
  encoding: "utf8"
});

interface Ad {
  id: string;
}
interface Placement {
  id: string;
  type: string;
  ads: Ad[];
}
interface MerchantsConfig {
  [index: string]: {
    placements: Placement[];
  };
}
const merchantsConfig: MerchantsConfig = JSON.parse(
  fs.readFileSync("./ad-server/merchants.json", { encoding: "utf8" })
);

app.use(function(
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

app.get("/:uci/placements/:id", function(
  req: Express.Request,
  res: Express.Response
) {
  const { uci, id } = req.params;
  const { country, uuid } = req.query;
  const referrer = req.get("referer");

  const config = merchantsConfig[uci];
  const ads = config.placements.find((placement: any) => placement.id === id)
    .ads;
  if (ads.length === 0) {
    res.send(204);
  }
  const adId = ads[0].id;

  const placement = fs.readFileSync(`./ad-server/templates/ads/${adId}.html`, {
    encoding: "utf8"
  });
  const baseStyle = fs.readFileSync(`./ad-server/templates/ads/index.css`, {
    encoding: "utf8"
  });

  const macros = {
    random_color: getRandomColor,
    text: "Buy now, pay later with",
    learn_more: {
      value: `
        <button
          class="link"
          id="button_${id}"
          onclick="openInterstitial(this.getAttribute('id'))"
        >
          Learn more
        </button>
      `,
      script: `
        <script>
          window.openInterstitial = function(openerElementId) {
            console.log('open interstitial', openerElementId)
            const message = { type: 'open-interstitial', placementUuid: '${uuid}', interstitialId: '${126431}', openerElementId }
            window.parent.postMessage(message, '${referrer}')
            window.addEventListener('message', restoreFocusHandler)
          }

          function restoreFocusHandler(event) {
            const { origin, data } = event
            if ('${referrer}'.includes(origin) && data.type === 'focus' && data.targetId) {
              const target = document.getElementById(data.targetId)
              if (target) {
                target.focus()
              }
            }
          }
        </script>
      `
    },
    styles: `<style>\n${baseStyle}\n</style>`,
    title: `Placement ${id}`
  };

  const script = `
    <script>
      window.addEventListener(
        "load",
        () => {
          const message = {
            type: "set-height",
            placementUuid: "${uuid}",
            height: document.body.firstElementChild.offsetHeight
          };
          window.parent.postMessage(message, "${referrer}");
        },
        { once: true }
      );
    </script>
  `;

  res.send(
    `${evaluateMacros(
      macros,
      html.replace("{{ content }}", placement)
    )}\n${script}`
  );
});

app.get("/interstitials/:id", function(
  req: Express.Request,
  res: Express.Response
) {
  const id = req.params.id;
  const referrer = req.get("referer");

  const interstitial = fs.readFileSync(
    `./ad-server/templates/interstitials/${id}.html`,
    {
      encoding: "utf8"
    }
  );
  const baseStyle = fs.readFileSync(
    `./ad-server/templates/interstitials/index.css`,
    {
      encoding: "utf8"
    }
  );

  const macros = {
    title: `Interstitial ${id}`,
    styles: `<style>${baseStyle}</style>`,
    interstitial_title: "buy now, pay later",
    interstitial_text:
      "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.",
    interstitial_button_text: "Close"
  };

  const script = `
    <script>
      window.closeInterstitial = function() {
        const message = { type: "close-interstitial", id: "${id}" };
        window.parent.postMessage(message, "${referrer}");
      };
    </script>
  `;

  res.send(
    `${evaluateMacros(
      macros,
      html.replace("{{ content }}", interstitial)
    )}\n${script}`
  );
});

app.listen(3000);

function getRandomColor() {
  return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() *
    255})`;
}

function evaluateMacros(macros: any, input: string) {
  let script = "";
  const markup = input.replace(/\{\{\s*(\w*)\s*\}\}/gi, (x, y) => {
    if (macros[y].value && macros[y].script) {
      script = `${script}\n${macros[y].script}`;
      return macros[y].value;
    } else if (macros[y].call) {
      return macros[y]();
    } else {
      return macros[y];
    }
  });

  return `${markup}${script ? `\n${script}` : ""}`;
}
