import { describe, it, expect } from "vitest";
import {
  erf,
  normalCdf,
  normalInverse,
  studentTPValue,
  studentTInverse,
  fPValue,
  calculateDescriptiveStats,
  rankArray,
  calculatePearson,
  calculateSpearman,
  matrixMultiply,
  matrixTranspose,
  matrixInverse,
  calculateLinearRegression,
  calculateReliability,
  runAssumptionDiagnostics,
  runHypothesisTest,
  STANDARD_VARIABLES,
  extractVariableValues,
} from "@/lib/statistics";
import { getTestSyntheticSessions as syntheticSessions } from "./fixtures/synthetic-sessions";
import {
  exportDescriptiveStatsCsv,
  exportCorrelationMatrixCsv,
  exportHypothesisSummaryCsv,
  exportRegressionResultsCsv,
  exportReliabilityCsv,
  exportExcelXmlWorkbook,
} from "@/lib/statistics-export";

describe("Mathematical Special Functions & Distributions", () => {
  it("computes erf with high accuracy", () => {
    expect(erf(0)).toBeCloseTo(0, 6);
    expect(erf(1)).toBeCloseTo(0.84270079, 5);
    expect(erf(-1)).toBeCloseTo(-0.84270079, 5);
    expect(erf(2)).toBeCloseTo(0.99532226, 5);
  });

  it("computes normal CDF accurately", () => {
    expect(normalCdf(0)).toBeCloseTo(0.5, 5);
    expect(normalCdf(1.96)).toBeCloseTo(0.975002, 4);
    expect(normalCdf(-1.96)).toBeCloseTo(0.024998, 4);
  });

  it("computes inverse normal accurately", () => {
    expect(normalInverse(0.5)).toBeCloseTo(0, 5);
    expect(normalInverse(0.975)).toBeCloseTo(1.959964, 4);
    expect(normalInverse(0.025)).toBeCloseTo(-1.959964, 4);
  });

  it("computes student t p-values accurately", () => {
    // For large df, t=1.96 corresponds to p ≈ 0.05
    const pLargeDf = studentTPValue(1.96, 1000);
    expect(pLargeDf).toBeCloseTo(0.05027, 3);

    // Known textbook values: df=10, t=2.2281 -> p=0.05
    const p10 = studentTPValue(2.228, 10);
    expect(p10).toBeCloseTo(0.05, 2);

    // t=0 should give p=1.0
    expect(studentTPValue(0, 10)).toBeCloseTo(1.0, 5);
  });

  it("computes student t critical inverse values", () => {
    // For df=10 and alpha=0.05, t ≈ 2.228
    const tCrit = studentTInverse(0.05, 10);
    expect(tCrit).toBeCloseTo(2.228, 2);
  });

  it("computes F-distribution p-values accurately", () => {
    // F=4.96 for df1=1, df2=10 gives p ≈ 0.05
    const pF = fPValue(4.9646, 1, 10);
    expect(pF).toBeCloseTo(0.05, 2);

    // F=1, df1=5, df2=5
    expect(fPValue(1.0, 5, 5)).toBeCloseTo(0.5, 2);
  });
});

describe("Descriptive Statistics", () => {
  it("calculates exact summary metrics on reference dataset", () => {
    // Dataset: 1 to 10
    const data = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];
    const stats = calculateDescriptiveStats(data);

    expect(stats.validN).toBe(10);
    expect(stats.missingN).toBe(0);
    expect(stats.mean).toBe(5.5);
    expect(stats.median).toBe(5.5);
    expect(stats.min).toBe(1);
    expect(stats.max).toBe(10);
    expect(stats.range).toBe(9);
    // Sample variance of 1..10 is 9.166667
    expect(stats.variance).toBeCloseTo(9.16667, 4);
    expect(stats.sd).toBeCloseTo(3.02765, 4);
    // Skewness of symmetric 1..10 is 0
    expect(stats.skewness).toBeCloseTo(0, 3);
  });

  it("handles nulls, missing values, and calculates percentages", () => {
    const raw = [1, 2, 2, 3, null, undefined, 4];
    const stats = calculateDescriptiveStats(raw, {
      1: "One",
      2: "Two",
      3: "Three",
      4: "Four",
    });

    expect(stats.validN).toBe(5);
    expect(stats.missingN).toBe(2);
    expect(stats.modes).toEqual([2]);
    expect(stats.modeDisplay).toBe("Two");
    expect(stats.frequencies).toHaveLength(4);

    const freq2 = stats.frequencies.find((f) => f.value === 2);
    expect(freq2?.count).toBe(2);
    expect(freq2?.percentage).toBe(40);
  });

  it("gracefully handles empty datasets and zero variance", () => {
    const emptyStats = calculateDescriptiveStats([]);
    expect(emptyStats.validN).toBe(0);
    expect(emptyStats.mean).toBeNull();

    const constStats = calculateDescriptiveStats([3, 3, 3, 3]);
    expect(constStats.validN).toBe(4);
    expect(constStats.mean).toBe(3);
    expect(constStats.sd).toBe(0);
  });
});

describe("Correlation Analysis", () => {
  it("computes Pearson r and 95% CI on known pairs", () => {
    const x = [1, 2, 3, 4, 5];
    const y = [2, 4, 5, 4, 5];
    // Known r = 0.7745966692
    const res = calculatePearson(x, y);

    expect(res.validN).toBe(5);
    expect(res.coefficient).toBeCloseTo(0.7746, 3);
    expect(res.degreesOfFreedom).toBe(3);
    expect(res.pValue).toBeLessThan(0.2); // p ≈ 0.124 for N=5
    expect(res.direction).toBe("positive");
    expect(res.strength).toBe("very strong");
  });

  it("ranks arrays with average tied ranks correctly", () => {
    // Values: 10, 20, 20, 40
    // Ranks: 1, 2.5, 2.5, 4
    const ranks = rankArray([10, 20, 20, 40]);
    expect(ranks).toEqual([1, 2.5, 2.5, 4]);
  });

  it("computes Spearman rho accurately", () => {
    const x = [10, 20, 30, 40, 50];
    const y = [100, 200, 300, 400, 500];
    const res = calculateSpearman(x, y);

    expect(res.validN).toBe(5);
    expect(res.coefficient).toBeCloseTo(1.0, 5);
    expect(res.pValue).toBeCloseTo(0, 3);
  });

  it("handles constant variable zero-variance safely", () => {
    const x = [3, 3, 3, 3];
    const y = [1, 2, 3, 4];
    const res = calculatePearson(x, y);

    expect(res.coefficient).toBeNull();
    expect(res.unsuitableReason).toContain("Zero variance");
  });
});

describe("Matrix Operations & Linear Regression", () => {
  it("multiplies matrices correctly", () => {
    const A = [
      [1, 2],
      [3, 4],
    ];
    const B = [
      [2, 0],
      [1, 2],
    ];
    const C = matrixMultiply(A, B);
    expect(C).toEqual([
      [4, 4],
      [10, 8],
    ]);
  });

  it("transposes matrices correctly", () => {
    const A = [
      [1, 2, 3],
      [4, 5, 6],
    ];
    const AT = matrixTranspose(A);
    expect(AT).toEqual([
      [1, 4],
      [2, 5],
      [3, 6],
    ]);
  });

  it("inverts 2x2 matrix correctly", () => {
    const A = [
      [4, 7],
      [2, 6],
    ];
    const inv = matrixInverse(A);
    expect(inv).not.toBeNull();
    if (inv) {
      expect(inv[0][0]).toBeCloseTo(0.6, 5);
      expect(inv[0][1]).toBeCloseTo(-0.7, 5);
      expect(inv[1][0]).toBeCloseTo(-0.2, 5);
      expect(inv[1][1]).toBeCloseTo(0.4, 5);
    }
  });

  it("fits Simple Linear Regression matching OLS formulas", () => {
    // x = [1, 2, 3, 4, 5], y = [3, 5, 7, 9, 11] (perfect line: y = 2x + 1)
    const x = [1, 2, 3, 4, 5];
    const y = [3, 5, 7, 9, 11];

    const res = calculateLinearRegression(
      { name: "Y", values: y },
      [{ name: "X", values: x }],
    );

    expect(res.validN).toBe(5);
    expect(res.rSquared).toBeCloseTo(1.0, 5);
    expect(res.coefficients).toHaveLength(2);

    const b0 = res.coefficients[0].unstandardizedB; // Intercept
    const b1 = res.coefficients[1].unstandardizedB; // Slope
    expect(b0).toBeCloseTo(1.0, 4);
    expect(b1).toBeCloseTo(2.0, 4);
  });

  it("fits Multiple Linear Regression and computes VIF", () => {
    const y = [5, 7, 9, 11, 13, 15, 17, 19];
    const x1 = [1, 2, 3, 4, 5, 6, 7, 8];
    const x2 = [2, 1, 4, 3, 6, 5, 8, 7];

    const res = calculateLinearRegression(
      { name: "DV", values: y },
      [
        { name: "IV1", values: x1 },
        { name: "IV2", values: x2 },
      ],
    );

    expect(res.validN).toBe(8);
    expect(res.isSingular).toBe(false);
    expect(res.rSquared).toBeGreaterThan(0.9);
    expect(res.coefficients[1].vif).not.toBeNull();
  });
});

describe("Reliability Analysis (Cronbach's Alpha)", () => {
  it("computes Cronbach's Alpha accurately", () => {
    // 3 items with consistent responses across 5 respondents
    const items = [
      { id: "Q1", name: "Item 1", values: [4, 5, 3, 4, 5] },
      { id: "Q2", name: "Item 2", values: [4, 4, 3, 5, 5] },
      { id: "Q3", name: "Item 3", values: [5, 4, 3, 4, 4] },
    ];

    const rel = calculateReliability(items);
    expect(rel.validN).toBe(5);
    expect(rel.itemCount).toBe(3);
    expect(rel.cronbachAlpha).not.toBeNull();
    expect(rel.cronbachAlpha!).toBeGreaterThan(0.7);
    expect(rel.items).toHaveLength(3);
    expect(rel.items[0].correctedItemTotalCorrelation).not.toBeNull();
    expect(rel.items[0].alphaIfItemDeleted).not.toBeNull();
  });
});

describe("Assumption Diagnostics & Hypothesis Testing", () => {
  it("runs diagnostic checks and flags assumptions", () => {
    const y = [1, 2, 3, 4, 5, 3, 4, 2, 3, 4];
    const x = [2, 3, 4, 5, 5, 3, 4, 1, 2, 4];

    const diag = runAssumptionDiagnostics(
      { name: "DV", values: y },
      [{ name: "IV", values: x }],
    );

    expect(diag.checks).toHaveLength(8);
    expect(diag.normality.assumption).toBe("Normality of Distribution");
    expect(diag.missingData.status).toBe("satisfied");
  });

  it("evaluates hypothesis tests and outputs Reject or Fail to Reject H0", () => {
    const iv = [1, 2, 3, 4, 5, 2, 3, 4, 5, 4];
    const dv = [2, 3, 4, 4, 5, 3, 3, 5, 5, 4];

    const hyp = runHypothesisTest(
      "H1",
      "Phishing",
      iv,
      "User Privacy",
      dv,
      "spearman",
      0.05,
    );

    expect(hyp.hypothesisId).toBe("H1");
    expect(hyp.nullHypothesis).toContain("H01");
    expect(hyp.alternativeHypothesis).toContain("H11");
    expect(["Reject H0", "Fail to Reject H0"]).toContain(hyp.decision);
    expect(hyp.plainLanguageInterpretation).toBeDefined();
    expect(hyp.pValue).not.toBeNull();
  });
});

describe("Operationalization on Synthetic Sessions", () => {
  const sessions = syntheticSessions();

  it("extracts clean variable vectors for all standard research variables", () => {
    expect(sessions.length).toBeGreaterThan(0);

    for (const v of STANDARD_VARIABLES) {
      const vals = extractVariableValues(v, sessions);
      expect(vals).toHaveLength(sessions.length);
    }
  });

  it("computes full correlation between Phishing composite and User Privacy", () => {
    const ivDef = STANDARD_VARIABLES.find((v) => v.id === "IV1_COMPOSITE")!;
    const dvDef = STANDARD_VARIABLES.find((v) => v.id === "DV_COMPOSITE")!;

    const ivVals = extractVariableValues(ivDef, sessions);
    const dvVals = extractVariableValues(dvDef, sessions);

    const corr = calculateSpearman(ivVals, dvVals);
    expect(corr.validN).toBeGreaterThan(20);
    expect(corr.coefficient).not.toBeNull();
  });
});

describe("Statistical Reports & File Exports", () => {
  const sessions = syntheticSessions();

  it("exports valid Descriptive Statistics CSV", () => {
    const csv = exportDescriptiveStatsCsv(sessions);
    expect(csv).toContain("variable_id");
    expect(csv).toContain("mean");
    expect(csv).toContain("IV1_COMPOSITE");
    expect(csv.startsWith("\uFEFF")).toBe(true);
  });

  it("exports valid Correlation Matrix CSV", () => {
    const csv = exportCorrelationMatrixCsv(sessions, "spearman");
    expect(csv).toContain("variable_id");
    expect(csv).toContain("P-VALUE MATRIX");
  });

  it("exports valid Hypothesis Testing Summary CSV", () => {
    const csv = exportHypothesisSummaryCsv(sessions);
    expect(csv).toContain("hypothesis_code");
    expect(csv).toContain("H01");
    expect(csv).toContain("H1");
    expect(csv).toContain("Reject");
  });

  it("exports valid Regression Results CSV", () => {
    const csv = exportRegressionResultsCsv(sessions);
    expect(csv).toContain("REGRESSION MODEL SUMMARY");
    expect(csv).toContain("ANOVA SUMMARY");
    expect(csv).toContain("REGRESSION COEFFICIENTS");
  });

  it("exports valid Reliability Analysis CSV", () => {
    const csv = exportReliabilityCsv(sessions);
    expect(csv).toContain("SCALE RELIABILITY SUMMARY");
    expect(csv).toContain("Cronbach's Alpha");
  });

  it("exports valid multi-worksheet Excel XML workbook", () => {
    const xml = exportExcelXmlWorkbook(sessions);
    expect(xml).toContain('<?xml version="1.0"?>');
    expect(xml).toContain('<Worksheet ss:Name="Descriptive Statistics">');
    expect(xml).toContain('<Worksheet ss:Name="Hypothesis Testing">');
    expect(xml).toContain('<Worksheet ss:Name="Regression Analysis">');
    expect(xml).toContain('<Worksheet ss:Name="Reliability Analysis">');
  });
});
