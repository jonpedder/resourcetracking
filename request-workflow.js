(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RequestWorkflow = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  function defaultQueue() {
    return { persona: "Approver", status: "Under Review" };
  }

  function pendingWhere(status) {
    return "RequestStatus = '" + String(status || "Under Review").replace(/'/g, "''") + "'";
  }

  function buttonLabel(baseLabel, count) {
    const base = baseLabel || "+ Resource Request (213RR)";
    return Number.isFinite(count) && count >= 0 ? base + " (" + count + ")" : base;
  }

  function setPanelOpen(panel, button, open) {
    panel.classList.toggle("open", !!open);
    button.setAttribute("aria-expanded", String(!!open));
    return !!open;
  }

  return {
    defaultQueue: defaultQueue,
    pendingWhere: pendingWhere,
    buttonLabel: buttonLabel,
    setPanelOpen: setPanelOpen
  };
});
