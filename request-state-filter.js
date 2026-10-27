(function (root, factory) {
  const api = factory();
  if (typeof module === "object" && module.exports) module.exports = api;
  root.RequestStateFilter = api;
})(typeof globalThis !== "undefined" ? globalThis : this, function () {
  "use strict";

  const OPTIONS = [
    { value: "", label: "All request states" },
    { value: "not-requested", label: "Not requested" },
    { value: "requested", label: "Requested" },
    { value: "awaiting-approval", label: "Awaiting approval" },
    { value: "approved", label: "Approved" },
    { value: "denied", label: "Denied" },
    { value: "in-fulfillment", label: "In fulfillment" },
    { value: "fulfilled-closed", label: "Fulfilled / closed" }
  ];
  const ACTIVE = ["Submitted", "Under Review", "Approved", "Sourced", "En Route", "Deployed", "Demobilizing", "Returned"];

  function statusesFor(state) {
    if (state === "requested") return ["Submitted"];
    if (state === "awaiting-approval") return ["Under Review"];
    if (state === "approved") return ["Approved"];
    if (state === "denied") return ["Denied"];
    if (state === "in-fulfillment") return ["Sourced", "En Route", "Deployed", "Demobilizing", "Returned"];
    if (state === "fulfilled-closed") return ["Closed"];
    return [];
  }

  function resourceName(request) {
    const a = request && request.attributes ? request.attributes : request || {};
    const title = String(a.RequestTitle || "").trim();
    const match = /^Request\s+(.+)$/i.exec(title);
    return match ? match[1].trim() : "";
  }

  function sqlLiteral(value) {
    return "'" + String(value).replace(/'/g, "''") + "'";
  }

  function resourceClause(state, requests, allRequestedNames) {
    if (!state) return "1=1";
    const names = (requests || []).map(resourceName).filter(Boolean);
    const unique = Array.from(new Set(names));
    if (state === "not-requested") {
      const all = Array.from(new Set((allRequestedNames || []).filter(Boolean)));
      return all.length ? "ResourceName NOT IN (" + all.map(sqlLiteral).join(",") + ")" : "1=1";
    }
    return unique.length ? "ResourceName IN (" + unique.map(sqlLiteral).join(",") + ")" : "1=0";
  }

  return { OPTIONS: OPTIONS, ACTIVE: ACTIVE, statusesFor: statusesFor, resourceName: resourceName, resourceClause: resourceClause };
});
