/**
 * Statistical Export Utilities for Research Reports
 * Generates formatted CSVs and Excel XML Workbooks (multi-worksheet SpreadsheetML)
 * for academic thesis review and archiving.
 */

import {
  STANDARD_VARIABLES,
  extractVariableValues,
  calculateDescriptiveStats,
  calculateCorrelationMatrix,
  calculateLinearRegression,
  calculateReliability,
  runHypothesisTest,
} from "./statistics";
import { toCsv } from "./csv";
import type { Session, Filters } from "./types";
import { describeFilters } from "./analytics";

/**
 * Generate Descriptive Statistics CSV
 */
export function exportDescriptiveStatsCsv(
  sessions: Session[],
  filters: Filters = {},
  demo = false,
): string {
  const meta = [
    demo ? "synthetic_demo" : "research",
    describeFilters(filters),
    "submitted only; valid n excludes missing responses",
  ];

  const headers = [
    "variable_id",
    "variable_name",
    "section",
    "role",
    "measurement_level",
    "total_n",
    "valid_n",
    "missing_n",
    "missing_percentage",
    "mean",
    "std_error_mean",
    "median",
    "modes",
    "std_deviation",
    "variance",
    "min",
    "max",
    "range",
    "q1_25th_percentile",
    "q3_75th_percentile",
    "iqr",
    "skewness",
    "excess_kurtosis",
    "data_source",
    "active_filters",
    "notes",
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  for (const v of STANDARD_VARIABLES) {
    const vals = extractVariableValues(v, sessions);
    const s = calculateDescriptiveStats(vals);
    const missingPct = s.totalN > 0 ? (s.missingN / s.totalN) * 100 : 0;

    rows.push([
      v.id,
      v.name,
      v.section,
      v.role,
      v.measurementLevel,
      s.totalN,
      s.validN,
      s.missingN,
      Number(missingPct.toFixed(2)),
      s.mean !== null ? Number(s.mean.toFixed(3)) : null,
      s.sem !== null ? Number(s.sem.toFixed(3)) : null,
      s.median !== null ? Number(s.median.toFixed(3)) : null,
      s.modeDisplay,
      s.sd !== null ? Number(s.sd.toFixed(3)) : null,
      s.variance !== null ? Number(s.variance.toFixed(3)) : null,
      s.min,
      s.max,
      s.range,
      s.q1 !== null ? Number(s.q1.toFixed(3)) : null,
      s.q3 !== null ? Number(s.q3.toFixed(3)) : null,
      s.iqr !== null ? Number(s.iqr.toFixed(3)) : null,
      s.skewness !== null ? Number(s.skewness.toFixed(3)) : null,
      s.kurtosis !== null ? Number(s.kurtosis.toFixed(3)) : null,
      ...meta,
    ]);
  }

  return toCsv(rows);
}

/**
 * Generate Correlation Matrix CSV
 */
export function exportCorrelationMatrixCsv(
  sessions: Session[],
  method: "spearman" | "pearson" = "spearman",
  filters: Filters = {},
  demo = false,
): string {
  // Focus on research items: Q6 to Q25 plus composite scales
  const targetVars = STANDARD_VARIABLES.filter(
    (v) => v.role !== "Profile",
  );

  const varList = targetVars.map((v) => ({
    id: v.id,
    label: v.name,
    values: extractVariableValues(v, sessions),
  }));

  const { variableLabels, matrix } = calculateCorrelationMatrix(varList, method);

  const rows: (string | number | null | undefined)[][] = [];

  // Metadata comments
  rows.push([
    `# Dataset: ${demo ? "synthetic_demo" : "research"}`,
    `# Scope: ${describeFilters(filters)}`,
    `# Method: ${method.toUpperCase()} Correlation`,
  ]);
  // Header row
  rows.push(["variable_id", "variable_label", ...variableLabels.map((v) => v.id)]);

  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const cells: (string | number | null | undefined)[] = [
      variableLabels[i].id,
      variableLabels[i].label,
    ];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      cells.push(
        cell.coefficient !== null ? Number(cell.coefficient.toFixed(3)) : "—",
      );
    }
    rows.push(cells);
  }

  // Also append p-value matrix
  rows.push([]);
  rows.push(["--- P-VALUE MATRIX (two-tailed) ---"]);
  rows.push(["variable_id", "variable_label", ...variableLabels.map((v) => v.id)]);

  for (let i = 0; i < matrix.length; i++) {
    const row = matrix[i];
    const cells: (string | number | null | undefined)[] = [
      variableLabels[i].id,
      variableLabels[i].label,
    ];
    for (let j = 0; j < row.length; j++) {
      const cell = row[j];
      cells.push(
        cell.pValue !== null ? Number(cell.pValue.toFixed(4)) : "—",
      );
    }
    rows.push(cells);
  }

  return toCsv(rows);
}

/**
 * Generate Hypothesis Testing Summary CSV
 */
export function exportHypothesisSummaryCsv(
  sessions: Session[],
  alpha = 0.05,
  multipleTestingAdjustment: "none" | "bonferroni" = "none",
  testType: "spearman" | "pearson" | "regression" = "spearman",
  filters: Filters = {},
  demo = false,
): string {
  const ivCompositeIds: Record<"H1" | "H2" | "H3" | "H4", string> = {
    H1: "IV1_COMPOSITE",
    H2: "IV2_COMPOSITE",
    H3: "IV3_COMPOSITE",
    H4: "IV4_COMPOSITE",
  };

  const dvDef = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;
  const dvVals = extractVariableValues(dvDef, sessions);

  const headers = [
    "hypothesis_code",
    "independent_variable",
    "dependent_variable",
    "null_hypothesis (H0)",
    "alternative_hypothesis (H1)",
    "statistical_test",
    "significance_threshold_alpha",
    "adjusted_alpha",
    "sample_size_n",
    "test_statistic_name",
    "test_statistic_value",
    "degrees_of_freedom",
    "p_value",
    "effect_size_name",
    "effect_size_value",
    "ci_95_lower",
    "ci_95_upper",
    "decision",
    "academic_interpretation",
    "data_source",
    "active_filters",
  ];

  const rows: (string | number | null | undefined)[][] = [headers];

  const hypIds: ("H1" | "H2" | "H3" | "H4")[] = ["H1", "H2", "H3", "H4"];
  for (const hId of hypIds) {
    const ivDef = STANDARD_VARIABLES.find((v) => v.id === ivCompositeIds[hId])!;
    const ivVals = extractVariableValues(ivDef, sessions);
    const res = runHypothesisTest(
      hId,
      ivDef.name,
      ivVals,
      dvDef.name,
      dvVals,
      testType,
      alpha,
      multipleTestingAdjustment,
    );

    rows.push([
      hId,
      ivDef.name,
      dvDef.name,
      res.nullHypothesis,
      res.alternativeHypothesis,
      res.selectedTest,
      res.alpha,
      res.adjustedAlpha,
      res.sampleSize,
      res.testStatisticName,
      res.testStatisticValue !== null
        ? Number(res.testStatisticValue.toFixed(4))
        : null,
      res.degreesOfFreedom,
      res.pValue !== null ? Number(res.pValue.toFixed(4)) : null,
      res.effectSizeName,
      res.effectSizeValue !== null
        ? Number(res.effectSizeValue.toFixed(4))
        : null,
      res.ci95Lower !== null ? Number(res.ci95Lower.toFixed(4)) : null,
      res.ci95Upper !== null ? Number(res.ci95Upper.toFixed(4)) : null,
      res.decision,
      res.plainLanguageInterpretation,
      demo ? "synthetic_demo" : "research",
      describeFilters(filters),
    ]);
  }

  return toCsv(rows);
}

/**
 * Generate Regression Model CSV
 */
export function exportRegressionResultsCsv(
  sessions: Session[],
  outcomeId = "DV_COMPOSITE",
  predictorIds = ["IV1_COMPOSITE", "IV2_COMPOSITE", "IV3_COMPOSITE", "IV4_COMPOSITE"],
  filters: Filters = {},
  demo = false,
): string {
  const dvDef = STANDARD_VARIABLES.find((v) => v.id === outcomeId)!;
  const dvVals = extractVariableValues(dvDef, sessions);

  const ivDefs = predictorIds.map(
    (id) => STANDARD_VARIABLES.find((v) => v.id === id)!,
  );
  const ivs = ivDefs.map((def) => ({
    name: def.name,
    values: extractVariableValues(def, sessions),
  }));

  const reg = calculateLinearRegression({ name: dvDef.name, values: dvVals }, ivs);

  const rows: (string | number | null | undefined)[][] = [];

  rows.push(["--- REGRESSION MODEL SUMMARY ---"]);
  rows.push(["Dependent Variable", reg.outcomeName]);
  rows.push(["Sample Size (Valid N)", reg.validN]);
  rows.push(["Multiple R", Number(reg.r.toFixed(4))]);
  rows.push(["R-Squared (R²)", Number(reg.rSquared.toFixed(4))]);
  rows.push(["Adjusted R-Squared", Number(reg.adjustedRSquared.toFixed(4))]);
  rows.push(["Standard Error of the Estimate", Number(reg.stdErrorEstimate.toFixed(4))]);
  rows.push([
    "Durbin-Watson Statistic",
    reg.durbinWatson !== null ? Number(reg.durbinWatson.toFixed(3)) : "—",
  ]);
  rows.push(["Data Source", demo ? "synthetic_demo" : "research"]);
  rows.push(["Active Filters", describeFilters(filters)]);
  rows.push(["Interpretation", reg.interpretation]);
  rows.push([]);

  rows.push(["--- ANOVA SUMMARY ---"]);
  rows.push(["Source", "Sum of Squares (SS)", "df", "Mean Square (MS)", "F", "p-value"]);
  rows.push([
    "Regression",
    Number(reg.anova.ssReg.toFixed(4)),
    reg.anova.dfReg,
    Number(reg.anova.msReg.toFixed(4)),
    Number(reg.anova.fStatistic.toFixed(4)),
    Number(reg.anova.pValue.toFixed(4)),
  ]);
  rows.push([
    "Residual",
    Number(reg.anova.ssRes.toFixed(4)),
    reg.anova.dfRes,
    Number(reg.anova.msRes.toFixed(4)),
    "—",
    "—",
  ]);
  rows.push([
    "Total",
    Number(reg.anova.ssTot.toFixed(4)),
    reg.anova.dfTot,
    "—",
    "—",
    "—",
  ]);
  rows.push([]);

  rows.push(["--- REGRESSION COEFFICIENTS ---"]);
  rows.push([
    "Model Parameter",
    "Unstandardized B",
    "Std. Error",
    "Standardized Beta",
    "t-statistic",
    "p-value",
    "95% CI Lower",
    "95% CI Upper",
    "Tolerance",
    "VIF",
  ]);

  for (const c of reg.coefficients) {
    rows.push([
      c.variableName,
      Number(c.unstandardizedB.toFixed(4)),
      Number(c.stdError.toFixed(4)),
      c.standardizedBeta !== null ? Number(c.standardizedBeta.toFixed(4)) : "—",
      Number(c.tStatistic.toFixed(4)),
      Number(c.pValue.toFixed(4)),
      Number(c.ciLower.toFixed(4)),
      Number(c.ciUpper.toFixed(4)),
      c.tolerance !== null ? Number(c.tolerance.toFixed(4)) : "—",
      c.vif !== null ? Number(c.vif.toFixed(3)) : "—",
    ]);
  }

  return toCsv(rows);
}

/**
 * Generate Reliability Analysis CSV
 */
export function exportReliabilityCsv(
  sessions: Session[],
  scaleItems = [
    { id: "Q19", name: "Q19: Info Exposure Concern" },
    { id: "Q20", name: "Q20: Account Access Concern" },
    { id: "Q21", name: "Q21: Misuse Concern" },
    { id: "Q22", name: "Q22: General Risk Perception" },
    { id: "Q23", name: "Q23: Sharing Avoidance" },
    { id: "Q24", name: "Q24: Privacy Settings Management" },
    { id: "Q25", name: "Q25: Overall Perceived Impact" },
  ],
): string {
  const items = scaleItems.map((item) => {
    const vDef = STANDARD_VARIABLES.find((v) => v.id === item.id)!;
    return {
      id: item.id,
      name: item.name,
      values: extractVariableValues(vDef, sessions),
    };
  });

  const rel = calculateReliability(items);

  const rows: (string | number | null | undefined)[][] = [];

  rows.push(["--- SCALE RELIABILITY SUMMARY ---"]);
  rows.push(["Scale Name", "User Privacy DV Scale (Q19–Q25)"]);
  rows.push(["Valid Cases (N)", rel.validN]);
  rows.push(["Number of Items (k)", rel.itemCount]);
  rows.push([
    "Cronbach's Alpha (α)",
    rel.cronbachAlpha !== null ? Number(rel.cronbachAlpha.toFixed(4)) : "—",
  ]);
  rows.push(["Internal Consistency Evaluation", rel.evaluation]);
  rows.push([
    "Scale Mean",
    rel.scaleMean !== null ? Number(rel.scaleMean.toFixed(3)) : "—",
  ]);
  rows.push([
    "Scale Variance",
    rel.scaleVariance !== null ? Number(rel.scaleVariance.toFixed(3)) : "—",
  ]);
  rows.push([
    "Scale Std. Deviation",
    rel.scaleSd !== null ? Number(rel.scaleSd.toFixed(3)) : "—",
  ]);
  rows.push(["Interpretation", rel.interpretation]);
  rows.push([]);

  rows.push(["--- ITEM-TOTAL STATISTICS ---"]);
  rows.push([
    "Item ID",
    "Item Name",
    "Item Mean",
    "Item Std. Deviation",
    "Item Variance",
    "Corrected Item-Total Correlation",
    "Cronbach's Alpha if Item Deleted",
  ]);

  for (const it of rel.items) {
    rows.push([
      it.id,
      it.name,
      Number(it.itemMean.toFixed(3)),
      Number(it.itemSd.toFixed(3)),
      Number(it.itemVariance.toFixed(3)),
      it.correctedItemTotalCorrelation !== null
        ? Number(it.correctedItemTotalCorrelation.toFixed(4))
        : "—",
      it.alphaIfItemDeleted !== null
        ? Number(it.alphaIfItemDeleted.toFixed(4))
        : "—",
    ]);
  }

  return toCsv(rows);
}

/**
 * Generate Multi-worksheet Excel XML Workbook (SpreadsheetML)
 * Supports multiple sheets: Descriptives, Correlations, Hypotheses, Regression, Reliability.
 */
export function exportExcelXmlWorkbook(
  sessions: Session[],
  demo = false,
): string {
  const sanitize = (text: string | number | null | undefined) => {
    if (text === null || text === undefined) return "";
    return String(text)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;");
  };

  const xmlRow = (cells: (string | number | null | undefined)[], isHeader = false) => {
    const cTags = cells.map((val) => {
      if (typeof val === "number" && !isNaN(val)) {
        return `<Cell${isHeader ? ' ss:StyleID="Header"' : ""}><Data ss:Type="Number">${val}</Data></Cell>`;
      }
      return `<Cell${isHeader ? ' ss:StyleID="Header"' : ""}><Data ss:Type="String">${sanitize(val)}</Data></Cell>`;
    });
    return `<Row>${cTags.join("")}</Row>`;
  };

  // 1. Descriptives sheet data
  const descRows: string[] = [];
  descRows.push(
    xmlRow(
      [
        "Variable ID",
        "Variable Name",
        "Section",
        "Role",
        "Measurement Level",
        "Valid N",
        "Missing N",
        "Mean",
        "Std. Error",
        "Median",
        "Mode",
        "Std. Dev",
        "Variance",
        "Min",
        "Max",
        "Skewness",
        "Kurtosis",
      ],
      true,
    ),
  );

  for (const v of STANDARD_VARIABLES) {
    const vals = extractVariableValues(v, sessions);
    const s = calculateDescriptiveStats(vals);
    descRows.push(
      xmlRow([
        v.id,
        v.name,
        v.section,
        v.role,
        v.measurementLevel,
        s.validN,
        s.missingN,
        s.mean !== null ? Number(s.mean.toFixed(3)) : null,
        s.sem !== null ? Number(s.sem.toFixed(3)) : null,
        s.median !== null ? Number(s.median.toFixed(3)) : null,
        s.modeDisplay,
        s.sd !== null ? Number(s.sd.toFixed(3)) : null,
        s.variance !== null ? Number(s.variance.toFixed(3)) : null,
        s.min,
        s.max,
        s.skewness !== null ? Number(s.skewness.toFixed(3)) : null,
        s.kurtosis !== null ? Number(s.kurtosis.toFixed(3)) : null,
      ]),
    );
  }

  // 2. Hypotheses sheet data
  const hypRows: string[] = [];
  hypRows.push(
    xmlRow(
      [
        "Hypothesis",
        "Independent Variable",
        "Dependent Variable",
        "Test Type",
        "Sample Size (N)",
        "Test Statistic",
        "p-value",
        "Effect Size",
        "Decision",
        "Academic Interpretation",
      ],
      true,
    ),
  );

  const hypIds: ("H1" | "H2" | "H3" | "H4")[] = ["H1", "H2", "H3", "H4"];
  const ivCompositeIds: Record<"H1" | "H2" | "H3" | "H4", string> = {
    H1: "IV1_COMPOSITE",
    H2: "IV2_COMPOSITE",
    H3: "IV3_COMPOSITE",
    H4: "IV4_COMPOSITE",
  };
  const dvDef = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;
  const dvVals = extractVariableValues(dvDef, sessions);

  for (const hId of hypIds) {
    const ivDef = STANDARD_VARIABLES.find((v) => v.id === ivCompositeIds[hId])!;
    const ivVals = extractVariableValues(ivDef, sessions);
    const hRes = runHypothesisTest(
      hId,
      ivDef.name,
      ivVals,
      dvDef.name,
      dvVals,
      "spearman",
      0.05,
    );
    hypRows.push(
      xmlRow([
        hId,
        ivDef.name,
        dvDef.name,
        "Spearman rho",
        hRes.sampleSize,
        hRes.testStatisticValue !== null
          ? Number(hRes.testStatisticValue.toFixed(3))
          : null,
        hRes.pValue !== null ? Number(hRes.pValue.toFixed(4)) : null,
        hRes.effectSizeValue !== null
          ? Number(hRes.effectSizeValue.toFixed(3))
          : null,
        hRes.decision,
        hRes.plainLanguageInterpretation,
      ]),
    );
  }

  // 3. Regression sheet data
  const ivDefs = ["IV1_COMPOSITE", "IV2_COMPOSITE", "IV3_COMPOSITE", "IV4_COMPOSITE"].map(
    (id) => STANDARD_VARIABLES.find((v) => v.id === id)!,
  );
  const ivs = ivDefs.map((def) => ({
    name: def.name,
    values: extractVariableValues(def, sessions),
  }));
  const reg = calculateLinearRegression({ name: dvDef.name, values: dvVals }, ivs);

  const regRows: string[] = [];
  regRows.push(xmlRow(["Multiple Regression Model Overview"], true));
  regRows.push(xmlRow(["Dependent Variable", reg.outcomeName]));
  regRows.push(xmlRow(["Sample Size", reg.validN]));
  regRows.push(xmlRow(["R", Number(reg.r.toFixed(4))]));
  regRows.push(xmlRow(["R-Squared (R²)", Number(reg.rSquared.toFixed(4))]));
  regRows.push(xmlRow(["Adjusted R-Squared", Number(reg.adjustedRSquared.toFixed(4))]));
  regRows.push(xmlRow(["Std Error of Estimate", Number(reg.stdErrorEstimate.toFixed(4))]));
  regRows.push(xmlRow(["Overall F-Statistic", Number(reg.anova.fStatistic.toFixed(3))]));
  regRows.push(xmlRow(["Model p-value", Number(reg.anova.pValue.toFixed(4))]));
  regRows.push(xmlRow([]));
  regRows.push(
    xmlRow(
      [
        "Parameter",
        "Unstandardized B",
        "Std. Error",
        "Standardized Beta",
        "t-statistic",
        "p-value",
        "95% CI Lower",
        "95% CI Upper",
        "VIF",
      ],
      true,
    ),
  );

  for (const c of reg.coefficients) {
    regRows.push(
      xmlRow([
        c.variableName,
        Number(c.unstandardizedB.toFixed(4)),
        Number(c.stdError.toFixed(4)),
        c.standardizedBeta !== null ? Number(c.standardizedBeta.toFixed(4)) : "—",
        Number(c.tStatistic.toFixed(4)),
        Number(c.pValue.toFixed(4)),
        Number(c.ciLower.toFixed(4)),
        Number(c.ciUpper.toFixed(4)),
        c.vif !== null ? Number(c.vif.toFixed(3)) : "—",
      ]),
    );
  }

  // 4. Reliability sheet data
  const relItems = [
    { id: "Q19", name: "Q19: Info Exposure Concern" },
    { id: "Q20", name: "Q20: Account Access Concern" },
    { id: "Q21", name: "Q21: Misuse Concern" },
    { id: "Q22", name: "Q22: General Risk Perception" },
    { id: "Q23", name: "Q23: Sharing Avoidance" },
    { id: "Q24", name: "Q24: Privacy Settings Management" },
    { id: "Q25", name: "Q25: Overall Perceived Impact" },
  ].map((it) => ({
    id: it.id,
    name: it.name,
    values: extractVariableValues(
      STANDARD_VARIABLES.find((v) => v.id === it.id)!,
      sessions,
    ),
  }));

  const rel = calculateReliability(relItems);
  const relRows: string[] = [];
  relRows.push(xmlRow(["User Privacy Scale Reliability"], true));
  relRows.push(xmlRow(["Valid Cases", rel.validN]));
  relRows.push(xmlRow(["Number of Items", rel.itemCount]));
  relRows.push(
    xmlRow([
      "Cronbach's Alpha (α)",
      rel.cronbachAlpha !== null ? Number(rel.cronbachAlpha.toFixed(4)) : "—",
    ]),
  );
  relRows.push(xmlRow(["Internal Consistency", rel.evaluation]));
  relRows.push(xmlRow([]));
  relRows.push(
    xmlRow(
      [
        "Item ID",
        "Item Name",
        "Mean",
        "Std. Dev",
        "Variance",
        "Corrected Item-Total Corr",
        "Alpha if Deleted",
      ],
      true,
    ),
  );

  for (const it of rel.items) {
    relRows.push(
      xmlRow([
        it.id,
        it.name,
        Number(it.itemMean.toFixed(3)),
        Number(it.itemSd.toFixed(3)),
        Number(it.itemVariance.toFixed(3)),
        it.correctedItemTotalCorrelation !== null
          ? Number(it.correctedItemTotalCorrelation.toFixed(4))
          : "—",
        it.alphaIfItemDeleted !== null
          ? Number(it.alphaIfItemDeleted.toFixed(4))
          : "—",
      ]),
    );
  }

  return `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>Cyber Campus Statistical Analysis Report</Title>
  <Subject>Impact of Social Engineering Threats on User Privacy (${demo ? "Synthetic Preview" : "Research Dataset"})</Subject>
  <Author>Cyber Campus Research Portal</Author>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Default" ss:Name="Normal">
   <Alignment ss:Vertical="Center"/>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Color="#1e293b"/>
  </Style>
  <Style ss:ID="Header">
   <Alignment ss:Vertical="Center" ss:Horizontal="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#94a3b8"/>
   </Borders>
   <Font ss:FontName="Segoe UI" ss:Size="10" ss:Bold="1" ss:Color="#0f172a"/>
   <Interior ss:Color="#e2e8f0" ss:Pattern="Solid"/>
  </Style>
 </Styles>
 <Worksheet ss:Name="Descriptive Statistics">
  <Table>
   ${descRows.join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Hypothesis Testing">
  <Table>
   ${hypRows.join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Regression Analysis">
  <Table>
   ${regRows.join("\n   ")}
  </Table>
 </Worksheet>
 <Worksheet ss:Name="Reliability Analysis">
  <Table>
   ${relRows.join("\n   ")}
  </Table>
 </Worksheet>
</Workbook>`;
}
