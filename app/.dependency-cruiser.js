/**
 * Architectural rules.
 *
 * The rule that matters here is `no-deep-cross-feature-import`. Travel grew two
 * separate implementations of the same metric screen partly because the code
 * was split across `features/travel` and `features/home/travel-health` — two
 * homes for one feature, each reaching into the other's internals, so neither
 * side ever saw the duplicate. Requiring cross-feature access to go through a
 * feature's `index.ts` makes that visible: a new public export is an obvious
 * line in a diff, a new deep import is not.
 *
 * Scoped to travel while the rest of the app catches up — same ratchet as the
 * lint and coverage guards.
 */
module.exports = {
  forbidden: [
    {
      name: "no-circular",
      severity: "error",
      comment:
        "Circular imports make load order significant and break tree-shaking. " +
        "Scoped to travel: the rest of the app still has 8 pre-existing cycles " +
        "(shared/services/ai, shared/components/modals) and failing on those " +
        "would make this unrunnable as a commit gate. Widen once they are gone.",
      from: { path: "^src/(features/travel|shared/services/travel)/" },
      to: { circular: true },
    },
    {
      name: "no-deep-cross-feature-import",
      severity: "error",
      comment:
        "Import another feature through its index.ts, not a path inside it.",
      from: { path: "^src/features/(?!travel/)" },
      to: {
        path: "^src/features/travel/.+",
        pathNot: "^src/features/travel/index\\.ts$",
      },
    },
    {
      name: "travel-must-not-reach-into-other-features",
      severity: "error",
      comment:
        "Travel may use shared/, but not another feature's internals. Promote to shared/ instead.",
      from: { path: "^src/features/travel/" },
      to: {
        path: "^src/features/(?!travel/)[^/]+/.+",
        pathNot: "^src/features/[^/]+/index\\.ts$",
      },
    },
    {
      name: "no-feature-imports-from-shared",
      severity: "error",
      comment:
        "shared/ is the base layer; depending on a feature inverts that. This " +
        "caught jetlag-brain importing travel's mock flights. Navigators are " +
        "exempt (composing features is their job). Scoped to travel for now: " +
        "shared/services/data/documentProcessor.ts still reaches into " +
        "features/body-map, and knip reports it as an unused file — delete it " +
        "and this rule can go app-wide.",
      from: {
        path: "^src/shared/",
        pathNot: "^src/shared/navigation/",
      },
      to: { path: "^src/features/travel/" },
    },
  ],
  options: {
    doNotFollow: { path: "node_modules" },
    tsConfig: { fileName: "tsconfig.json" },
    tsPreCompilationDeps: true,
    enhancedResolveOptions: {
      exportsFields: ["exports"],
      conditionNames: ["require", "import", "node", "default"],
    },
    includeOnly: "^src/",
    reporterOptions: { text: { highlightFocused: true } },
  },
};
