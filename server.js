const express = require("express");
const app = express();

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  next();
});

app.get("/placement/:id", function(req, res) {
  const id = req.params.id;
  const referrer = req.get("referer");
  res.send(
    `
    <html>
      <head>
        <title>Placement ${id}</title>
        <script>
          window.openInterstitial = function(openerElementId) {
            console.log('open interstitial', openerElementId)
            const message = { type: 'open-interstitial', id: ${id}, openerElementId }
            window.parent.postMessage(message, '${referrer}')
            window.addEventListener('message', restoreFocusHandler)
          }
          function restoreFocusHandler(event) {
            const { origin, data } = event
            if ('${referrer}'.includes(origin) && data.type === 'focus' && data.targetId) {
              const target = document.getElementById(data.targetId)
              if (target) {
                target.focus()
                window.removeEventListener('message', restoreFocusHandler)
              }
            }
          }
        </script>
        <style>
          button:focus {
            outline: 2px solid red;
          }
        </style>
      </head>
      <body style="margin: 0;">
        <div style="padding: 8px; border-radius: 8px; background: ${getRandomColor()};">
          <h3>
            Placement ${id}
          </h3>
          <button id="${id}_button" onclick="openInterstitial(this.getAttribute('id'))">Open interstitial</button>
        </div>
      </body>
    </html>
    `
  );
});

app.get("/interstitial/:id", function(req, res) {
  const id = req.params.id;
  const referrer = req.get("referer");
  res.send(
    `
    <html>
      <head>
        <title>Interstitial ${id}</title>
        <script>
          window.closeInterstitial = function() {
            const message = { type: 'close-interstitial', id: ${id}}
            window.parent.postMessage(message, '${referrer}')
          }
        </script>
      </head>
      <body style="margin: 20%; background: rgba(0, 0, 0, 0.5);" onblur="closeInterstitial()">
        <div style="padding: 40px; border-radius: 8px; background: white;">
          <h1>
            Interstitial ${id}
          </h1>
          <button autofocus onclick="closeInterstitial()">Close interstitial</button>
        </div>
      </body>
    </html>
    `
  );
});

app.listen(3000);

function getRandomColor() {
  return `rgb(${Math.random() * 255}, ${Math.random() * 255}, ${Math.random() *
    255})`;
}
