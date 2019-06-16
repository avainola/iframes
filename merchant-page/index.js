fetch("http://localhost:8080/ad-server/merchants.json")
  .then(response => response.json())
  .then(json => {
    window.merchants = json;
    const merchantSelector = document.getElementById("merchant-selector");
    Object.keys(json).map(uci => {
      const option = document.createElement("option");
      option.setAttribute("value", uci);
      option.innerHTML = uci;
      merchantSelector.appendChild(option);
    });

    const placementsNode = document.getElementById("placements");
    const defaultUci = Object.keys(json)[0];
    addPlacements(placementsNode, defaultUci);
  });

function addPlacements(placementsNode, uci) {
  const merchantPlacements = window.merchants[uci].placements;

  function getWidth() {
    return (document.body.offsetWidth - 350) * Math.random() + 350;
  }

  for (const placement of merchantPlacements) {
    const headingNode = document.createElement("h3");
    headingNode.innerHTML = `Placement: ${placement.id}`;
    const placementNode = document.createElement("placement");
    placementNode.setAttribute("data-id", placement.id);
    placementNode.setAttribute(
      "style",
      `display: block; width: ${getWidth()}px`
    );
    const wrapperNode = document.createElement("div");
    wrapperNode.appendChild(headingNode);
    wrapperNode.appendChild(placementNode);
    placementsNode.appendChild(wrapperNode);
  }
}

function handleSelectMerchant(uci) {
  const placementsNode = document.getElementById("placements");
  while (placementsNode.firstChild) {
    placementsNode.removeChild(placementsNode.firstChild);
  }
  addPlacements(placementsNode, uci);
  window.kmerchant.reloadPlacements();
}
