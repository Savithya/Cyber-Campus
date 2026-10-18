/**
 * Statistical Analysis Engine for Academic Research
 * Study: "Impact of Social Engineering Threats on User Privacy among University Students in Sri Lanka"
 * 
 * Provides rigorous, validated statistical computations:
 * - Descriptive Statistics (Parametric & Non-Parametric)
 * - Correlation Analysis (Pearson r with Fisher's Z CI, Spearman rho with tied ranking)
 * - Hypothesis Testing (H01-H14 with exact p-values, effect sizes, configurable alpha, multiple testing correction)
 * - Multiple & Simple Linear Regression (OLS matrix algebra, ANOVA, VIF, Residual diagnostics, Durbin-Watson)
 * - Reliability Analysis (Cronbach's Alpha, item-total correlations, alpha if item deleted)
 * - Assumption Diagnostics (Normality, Outliers, Multicollinearity, Homoscedasticity, Sample Size)
 * - Non-Parametric Repeated Measures: Friedman Test & Wilcoxon Signed-Rank with Bonferroni correction
 */

import type { Session } from "./types";
import { missions } from "@/content/missions";

// ============================================================================
// 1. MATHEMATICAL SPECIAL FUNCTIONS & DISTRIBUTIONS
// ============================================================================

/**
 * Standard error function erf(x)
 * Chebyshev approximation with maximal error < 1.5e-7 (Abramowitz & Stegun 7.1.26)
 */
export function erf(x: number): number {
  const sign = x >= 0 ? 1 : -1;
  const absX = Math.abs(x);
  const a1 = 0.254829592;
  const a2 = -0.284496736;
  const a3 = 1.421413741;
  const a4 = -1.453152027;
  const a5 = 1.061405429;
  const p = 0.3275911;

  const t = 1.0 / (1.0 + p * absX);
  const y =
    1.0 -
    ((((a5 * t + a4) * t + a3) * t + a2) * t + a1) * t * Math.exp(-absX * absX);
  return sign * y;
}

/**
 * Standard Normal Cumulative Distribution Function (CDF)
 */
export function normalCdf(z: number): number {
  return 0.5 * (1.0 + erf(z / Math.SQRT2));
}

/**
 * Inverse Normal CDF (quantile function)
 * Rational approximation (Acklam's algorithm) accurate to within 1.15e-9
 */
export function normalInverse(p: number): number {
  if (p <= 0 || p >= 1) {
    if (p === 0) return -Infinity;
    if (p === 1) return Infinity;
    return NaN;
  }

  // Coefficients in rational approximations
  const a = [
    -3.969683028665376e1,
    2.209460984245205e2,
    -2.759285104469687e2,
    1.38357751867269e2,
    -3.066479806614716e1,
    2.506628277459239,
  ];
  const b = [
    -5.447609879822406e1,
    1.615858368580409e2,
    -1.556989798598866e2,
    6.680131188771972e1,
    -1.328068155288572e1,
  ];
  const c = [
    -7.784894002430293e-3,
    -3.223964580411365e-1,
    -2.400758277161838,
    -2.549732539343734,
    4.374664141464968,
    2.938163982698783,
  ];
  const d = [
    7.784695709041462e-3,
    3.224671290700398e-1,
    2.445134137142996,
    3.754408661907416,
  ];

  const pLow = 0.02425;
  const pHigh = 1 - pLow;

  let q: number, r: number;
  if (p < pLow) {
    // Rational approximation for lower region
    q = Math.sqrt(-2 * Math.log(p));
    return (
      (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
      ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
    );
  } else if (p <= pHigh) {
    // Rational approximation for central region
    q = p - 0.5;
    r = q * q;
    return (
      ((((((a[0] * r + a[1]) * r + a[2]) * r + a[3]) * r + a[4]) * r + a[5]) *
        q) /
      (((((b[0] * r + b[1]) * r + b[2]) * r + b[3]) * r + b[4]) * r + 1)
    );
  } else {
    // Rational approximation for upper region
    q = Math.sqrt(-2 * Math.log(1 - p));
    return (
      -(
        (((((c[0] * q + c[1]) * q + c[2]) * q + c[3]) * q + c[4]) * q + c[5]) /
        ((((d[0] * q + d[1]) * q + d[2]) * q + d[3]) * q + 1)
      )
    );
  }
}

/**
 * Natural logarithm of the Gamma function ln(Gamma(x))
 * Lanczos approximation (g = 7, N = 9)
 */
export function logGamma(x: number): number {
  if (x <= 0) return NaN;
  const p = [
    0.99999999999980993,
    676.5203681218851,
    -1259.1392167224028,
    771.32342877765313,
    -176.61502916214059,
    12.507343278686905,
    -0.13857109526572012,
    9.9843695780195716e-6,
    1.5056327351493116e-7,
  ];
  const g = 7;
  let y = x;
  if (y < 0.5) {
    return Math.log(Math.PI / Math.sin(Math.PI * y)) - logGamma(1 - y);
  }
  y -= 1;
  let a = p[0];
  const t = y + g + 0.5;
  for (let i = 1; i < p.length; i++) {
    a += p[i] / (y + i);
  }
  return 0.5 * Math.log(2 * Math.PI) + (y + 0.5) * Math.log(t) - t + Math.log(a);
}

/**
 * Regularized Incomplete Beta Function I_x(a, b)
 * Evaluated via continued fraction (Lentz's method)
 */
export function betainc(x: number, a: number, b: number): number {
  if (x <= 0) return 0;
  if (x >= 1) return 1;

  // Factor front
  const lbeta = logGamma(a) + logGamma(b) - logGamma(a + b);
  const factor = Math.exp(a * Math.log(x) + b * Math.log(1 - x) - lbeta);

  // Symmetry transformation
  if (x > (a + 1) / (a + b + 2)) {
    return 1 - betainc(1 - x, b, a);
  }

  // Continued fraction evaluation
  const maxIter = 200;
  const eps = 1e-14;
  let c = 1.0;
  let d = 1.0 - ((a + b) * x) / (a + 1.0);
  if (Math.abs(d) < eps) d = eps;
  d = 1.0 / d;
  let h = d;

  for (let m = 1; m <= maxIter; m++) {
    const m2 = 2 * m;
    // Even step
    let num = (m * (b - m) * x) / ((a + m2 - 1) * (a + m2));
    d = 1.0 + num * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1.0 + num / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1.0 / d;
    h *= d * c;

    // Odd step
    num = -((a + m) * (a + b + m) * x) / ((a + m2) * (a + m2 + 1));
    d = 1.0 + num * d;
    if (Math.abs(d) < eps) d = eps;
    c = 1.0 + num / c;
    if (Math.abs(c) < eps) c = eps;
    d = 1.0 / d;
    const del = d * c;
    h *= del;

    if (Math.abs(del - 1.0) < eps) break;
  }

  return (factor / a) * h;
}

/**
 * Cumulative Distribution Function for Student's t-distribution
 */
export function studentTCdf(t: number, df: number): number {
  if (df <= 0) return NaN;
  if (t === 0) return 0.5;
  const x = df / (df + t * t);
  const prob = 0.5 * betainc(x, df / 2, 0.5);
  return t > 0 ? 1 - prob : prob;
}

/**
 * Two-tailed p-value for Student's t-statistic
 */
export function studentTPValue(t: number, df: number): number {
  if (df <= 0 || isNaN(t)) return NaN;
  const absT = Math.abs(t);
  const x = df / (df + absT * absT);
  const p = betainc(x, df / 2, 0.5);
  return Math.min(1.0, Math.max(0.0, p));
}

/**
 * Critical t-value for given two-tailed significance level alpha
 */
export function studentTInverse(alpha: number, df: number): number {
  if (df <= 0 || alpha <= 0 || alpha >= 1) return NaN;
  // Bisection/Newton search starting with normal approximation
  const z = normalInverse(1 - alpha / 2);
  let t = z + (z * z * z + z) / (4 * df); // Cornish-Fisher expansion initial guess
  for (let iter = 0; iter < 20; iter++) {
    const p = studentTPValue(t, df);
    const diff = p - alpha;
    if (Math.abs(diff) < 1e-9) break;
    // numerical derivative
    const dt = 1e-5;
    const dp = (studentTPValue(t + dt, df) - studentTPValue(t - dt, df)) / (2 * dt);
    if (Math.abs(dp) > 1e-12) {
      t = t - diff / dp;
    } else {
      break;
    }
  }
  return Math.abs(t);
}

/**
 * Cumulative Distribution Function for Snedecor's F-distribution
 */
export function fCdf(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0) return 0;
  const x = (df1 * f) / (df1 * f + df2);
  return betainc(x, df1 / 2, df2 / 2);
}

/**
 * p-value for Snedecor's F-statistic (upper-tail probability P(F >= f))
 */
export function fPValue(f: number, df1: number, df2: number): number {
  if (f <= 0 || df1 <= 0 || df2 <= 0 || isNaN(f)) return 1.0;
  const x = (df1 * f) / (df1 * f + df2);
  const p = 1.0 - betainc(x, df1 / 2, df2 / 2);
  return Math.min(1.0, Math.max(0.0, p));
}

/**
 * Regularized lower incomplete gamma function P(a, x) = gamma(a, x) / Gamma(a)
 */
export function gammaIncLower(a: number, x: number): number {
  if (x <= 0) return 0;
  if (a <= 0) return NaN;

  if (x < a + 1) {
    let sum = 1 / a;
    let term = 1 / a;
    for (let n = 1; n < 120; n++) {
      term *= x / (a + n);
      sum += term;
      if (Math.abs(term) < Math.abs(sum) * 1e-15) break;
    }
    return sum * Math.exp(a * Math.log(x) - x - logGamma(a));
  } else {
    const maxIter = 120;
    const eps = 1e-15;
    let b = x + 1 - a;
    let c = 1 / 1e-30;
    let d = 1 / b;
    let h = d;
    for (let i = 1; i <= maxIter; i++) {
      const an = -i * (i - a);
      b += 2;
      d = an * d + b;
      if (Math.abs(d) < eps) d = eps;
      c = b + an / c;
      if (Math.abs(c) < eps) c = eps;
      d = 1 / d;
      const del = d * c;
      h *= del;
      if (Math.abs(del - 1) < eps) break;
    }
    const q = Math.exp(a * Math.log(x) - x - logGamma(a)) * h;
    return Math.max(0, Math.min(1, 1 - q));
  }
}

/**
 * Cumulative Distribution Function for Chi-Square distribution
 */
export function chiSquareCdf(x: number, df: number): number {
  if (x <= 0 || df <= 0) return 0;
  return gammaIncLower(df / 2, x / 2);
}

/**
 * Upper-tail p-value for Chi-Square test statistic P(X >= x)
 */
export function chiSquarePValue(x: number, df: number): number {
  if (x <= 0 || df <= 0 || isNaN(x)) return 1.0;
  const p = 1.0 - chiSquareCdf(x, df);
  return Math.max(0.0, Math.min(1.0, p));
}


// ============================================================================
// 2. DESCRIPTIVE STATISTICS
// ============================================================================

export type FrequencyRow = {
  value: number;
  label?: string;
  count: number;
  percentage: number;
  cumulativePercentage: number;
};

export type DescriptiveStats = {
  validN: number;
  missingN: number;
  totalN: number;
  mean: number | null;
  median: number | null;
  modes: number[];
  modeDisplay: string;
  variance: number | null;
  sd: number | null;
  sem: number | null; // Standard error of mean
  ci95Lower: number | null;
  ci95Upper: number | null;
  min: number | null;
  max: number | null;
  range: number | null;
  q1: number | null;
  q3: number | null;
  iqr: number | null;
  skewness: number | null;
  kurtosis: number | null; // excess kurtosis
  frequencies: FrequencyRow[];
  histogramBins: { binLabel: string; binStart: number; binEnd: number; count: number }[];
};

/**
 * Calculate descriptive statistics for numeric or ordinal items
 */
export function calculateDescriptiveStats(
  rawValues: (number | null | undefined)[],
  valueLabels?: Record<number, string>,
): DescriptiveStats {
  const totalN = rawValues.length;
  const valid: number[] = [];

  for (const v of rawValues) {
    if (typeof v === "number" && !isNaN(v)) {
      valid.push(v);
    }
  }

  const validN = valid.length;
  const missingN = totalN - validN;

  if (validN === 0) {
    return {
      validN: 0,
      missingN,
      totalN,
      mean: null,
      median: null,
      modes: [],
      modeDisplay: "—",
      variance: null,
      sd: null,
      sem: null,
      ci95Lower: null,
      ci95Upper: null,
      min: null,
      max: null,
      range: null,
      q1: null,
      q3: null,
      iqr: null,
      skewness: null,
      kurtosis: null,
      frequencies: [],
      histogramBins: [],
    };
  }

  // Sort ascending for quantiles and rank statistics
  const sorted = [...valid].sort((a, b) => a - b);
  const min = sorted[0];
  const max = sorted[sorted.length - 1];
  const range = max - min;

  // Mean
  const sum = sorted.reduce((acc, x) => acc + x, 0);
  const mean = sum / validN;

  // Median
  const mid = Math.floor(validN / 2);
  const median = validN % 2 === 0 ? (sorted[mid - 1] + sorted[mid]) / 2 : sorted[mid];

  // Quartiles (using method compliant with Tukey / standard R type 7)
  const getPercentile = (p: number) => {
    if (validN === 1) return sorted[0];
    const index = p * (validN - 1);
    const lower = Math.floor(index);
    const upper = Math.ceil(index);
    const weight = index - lower;
    return sorted[lower] * (1 - weight) + sorted[upper] * weight;
  };
  const q1 = getPercentile(0.25);
  const q3 = getPercentile(0.75);
  const iqr = q3 - q1;

  // Frequencies and Mode
  const counts = new Map<number, number>();
  for (const v of sorted) {
    counts.set(v, (counts.get(v) ?? 0) + 1);
  }

  let maxFreq = 0;
  for (const count of counts.values()) {
    if (count > maxFreq) maxFreq = count;
  }

  const modes: number[] = [];
  if (maxFreq > 1 || validN === 1) {
    for (const [val, count] of counts.entries()) {
      if (count === maxFreq) modes.push(val);
    }
  }

  const modeDisplay =
    modes.length === 0
      ? "None (all distinct)"
      : modes.map((m) => valueLabels?.[m] ?? String(m)).join(", ");

  let cumulativeCount = 0;
  const frequencies: FrequencyRow[] = Array.from(counts.entries())
    .sort(([a], [b]) => a - b)
    .map(([val, count]) => {
      cumulativeCount += count;
      return {
        value: val,
        label: valueLabels?.[val],
        count,
        percentage: (count / validN) * 100,
        cumulativePercentage: (cumulativeCount / validN) * 100,
      };
    });

  // Variance & Standard Deviation (sample, N-1)
  let variance: number | null = null;
  let sd: number | null = null;
  let sem: number | null = null;
  let ci95Lower: number | null = null;
  let ci95Upper: number | null = null;
  let skewness: number | null = null;
  let kurtosis: number | null = null;

  if (validN > 1) {
    let sumSqDiff = 0;
    let sumCubeDiff = 0;
    let sumQuadDiff = 0;

    for (const x of sorted) {
      const diff = x - mean;
      sumSqDiff += diff * diff;
      sumCubeDiff += diff * diff * diff;
      sumQuadDiff += diff * diff * diff * diff;
    }

    variance = sumSqDiff / (validN - 1);
    sd = Math.sqrt(variance);
    sem = sd / Math.sqrt(validN);

    // 95% Confidence interval for mean using Student's t
    const tCrit = studentTInverse(0.05, validN - 1);
    ci95Lower = mean - tCrit * sem;
    ci95Upper = mean + tCrit * sem;

    // Skewness (Fisher-Pearson coefficient)
    if (validN > 2 && sd > 0) {
      const m2 = sumSqDiff / validN;
      const m3 = sumCubeDiff / validN;
      const g1 = m3 / Math.pow(m2, 1.5);
      skewness = (Math.sqrt(validN * (validN - 1)) / (validN - 2)) * g1;
    } else {
      skewness = 0;
    }

    // Excess Kurtosis (sample excess kurtosis)
    if (validN > 3 && sd > 0) {
      const n = validN;
      const term1 = (n * (n + 1)) / ((n - 1) * (n - 2) * (n - 3));
      const term2 = sumQuadDiff / Math.pow(variance, 2);
      const term3 = (3 * Math.pow(n - 1, 2)) / ((n - 2) * (n - 3));
      kurtosis = term1 * term2 - term3;
    } else {
      kurtosis = 0;
    }
  } else {
    variance = 0;
    sd = 0;
    sem = 0;
    ci95Lower = mean;
    ci95Upper = mean;
    skewness = 0;
    kurtosis = 0;
  }

  // Construct histogram bins
  const binCount = Math.min(10, Math.max(3, Math.ceil(Math.sqrt(validN))));
  const binWidth = range > 0 ? range / binCount : 1;
  const histogramBins = [];
  for (let i = 0; i < binCount; i++) {
    const bStart = min + i * binWidth;
    const bEnd = i === binCount - 1 ? max + 0.0001 : min + (i + 1) * binWidth;
    const bCount = sorted.filter((x) => x >= bStart && x < bEnd).length;
    histogramBins.push({
      binLabel: `${bStart.toFixed(1)}–${(min + (i + 1) * binWidth).toFixed(1)}`,
      binStart: bStart,
      binEnd: min + (i + 1) * binWidth,
      count: bCount,
    });
  }

  return {
    validN,
    missingN,
    totalN,
    mean,
    median,
    modes,
    modeDisplay,
    variance,
    sd,
    sem,
    ci95Lower,
    ci95Upper,
    min,
    max,
    range,
    q1,
    q3,
    iqr,
    skewness,
    kurtosis,
    frequencies,
    histogramBins,
  };
}

// ============================================================================
// 3. CORRELATION ANALYSIS (PEARSON & SPEARMAN)
// ============================================================================

export type CorrelationResult = {
  validN: number;
  coefficient: number | null;
  method: "pearson" | "spearman";
  tStatistic: number | null;
  degreesOfFreedom: number;
  pValue: number | null;
  ciLower: number | null;
  ciUpper: number | null;
  direction: "positive" | "negative" | "none";
  strength: "negligible" | "weak" | "moderate" | "strong" | "very strong";
  interpretation: string;
  scatterData: { x: number; y: number }[];
  isStatisticallySignificant: boolean;
  unsuitableReason?: string;
};

/**
 * Filter paired complete cases
 */
function getCompletePairs(
  x: (number | null | undefined)[],
  y: (number | null | undefined)[],
): { xVals: number[]; yVals: number[] } {
  const xVals: number[] = [];
  const yVals: number[] = [];
  const n = Math.min(x.length, y.length);

  for (let i = 0; i < n; i++) {
    const vx = x[i];
    const vy = y[i];
    if (
      typeof vx === "number" &&
      !isNaN(vx) &&
      typeof vy === "number" &&
      !isNaN(vy)
    ) {
      xVals.push(vx);
      yVals.push(vy);
    }
  }

  return { xVals, yVals };
}

/**
 * Rank array with fractional average ranking for ties
 */
export function rankArray(arr: number[]): number[] {
  const n = arr.length;
  const indexed = arr.map((val, idx) => ({ val, idx }));
  indexed.sort((a, b) => a.val - b.val);

  const ranks = new Array<number>(n);
  let i = 0;
  while (i < n) {
    let j = i;
    while (j < n - 1 && indexed[j + 1].val === indexed[i].val) {
      j++;
    }
    const rankSum = ((i + 1 + j + 1) * (j - i + 1)) / 2;
    const avgRank = rankSum / (j - i + 1);
    for (let k = i; k <= j; k++) {
      ranks[indexed[k].idx] = avgRank;
    }
    i = j + 1;
  }
  return ranks;
}

/**
 * Interpret correlation strength according to Cohen (1988) standard rules
 */
export function interpretCorrelation(r: number, p: number, method: "pearson" | "spearman"): {
  direction: "positive" | "negative" | "none";
  strength: "negligible" | "weak" | "moderate" | "strong" | "very strong";
  interpretation: string;
} {
  const absR = Math.abs(r);
  let direction: "positive" | "negative" | "none" = "none";
  if (r > 0.001) direction = "positive";
  else if (r < -0.001) direction = "negative";

  let strength: "negligible" | "weak" | "moderate" | "strong" | "very strong" =
    "negligible";
  if (absR >= 0.7) strength = "very strong";
  else if (absR >= 0.5) strength = "strong";
  else if (absR >= 0.3) strength = "moderate";
  else if (absR >= 0.1) strength = "weak";

  const coeffName = method === "pearson" ? "Pearson r" : "Spearman rho (rs)";
  const sigText =
    p < 0.001
      ? "statistically significant (p < .001)"
      : p < 0.05
        ? `statistically significant (p = ${p.toFixed(3)})`
        : `not statistically significant (p = ${p.toFixed(3)})`;

  const interp = `${coeffName} = ${r.toFixed(3)} indicates a ${strength} ${direction} monotonic/linear association which is ${sigText}. Note: This association does not establish causal direction in cross-sectional research.`;

  return { direction, strength, interpretation: interp };
}

/**
 * Calculate Pearson Correlation coefficient, exact t-test p-value, and Fisher Z 95% CI
 */
export function calculatePearson(
  x: (number | null | undefined)[],
  y: (number | null | undefined)[],
): CorrelationResult {
  const { xVals, yVals } = getCompletePairs(x, y);
  const n = xVals.length;

  if (n < 3) {
    return {
      validN: n,
      coefficient: null,
      method: "pearson",
      tStatistic: null,
      degreesOfFreedom: Math.max(0, n - 2),
      pValue: null,
      ciLower: null,
      ciUpper: null,
      direction: "none",
      strength: "negligible",
      interpretation: "Insufficient paired observations (minimum N = 3 required).",
      scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
      isStatisticallySignificant: false,
      unsuitableReason: "Sample size too small (N < 3).",
    };
  }

  const meanX = xVals.reduce((a, b) => a + b, 0) / n;
  const meanY = yVals.reduce((a, b) => a + b, 0) / n;

  let ssX = 0;
  let ssY = 0;
  let ssXY = 0;

  for (let i = 0; i < n; i++) {
    const dx = xVals[i] - meanX;
    const dy = yVals[i] - meanY;
    ssX += dx * dx;
    ssY += dy * dy;
    ssXY += dx * dy;
  }

  if (ssX === 0 || ssY === 0) {
    return {
      validN: n,
      coefficient: null,
      method: "pearson",
      tStatistic: null,
      degreesOfFreedom: n - 2,
      pValue: null,
      ciLower: null,
      ciUpper: null,
      direction: "none",
      strength: "negligible",
      interpretation:
        "Undefined correlation: one or both variables have zero variance (all responses are identical).",
      scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
      isStatisticallySignificant: false,
      unsuitableReason: "Zero variance detected in variable data.",
    };
  }

  const r = ssXY / Math.sqrt(ssX * ssY);
  // Bounded to [-1, 1] against numerical floating point overshoot
  const boundedR = Math.max(-1, Math.min(1, r));

  const df = n - 2;
  let t = 0;
  let p = 1.0;
  if (Math.abs(boundedR) >= 0.9999999) {
    t = boundedR > 0 ? 999 : -999;
    p = 0.0;
  } else {
    t = (boundedR * Math.sqrt(df)) / Math.sqrt(1 - boundedR * boundedR);
    p = studentTPValue(t, df);
  }

  // Fisher's Z transformation for 95% Confidence Interval
  let ciLower: number | null = null;
  let ciUpper: number | null = null;
  if (n > 3 && Math.abs(boundedR) < 1) {
    const z = 0.5 * Math.log((1 + boundedR) / (1 - boundedR));
    const seZ = 1 / Math.sqrt(n - 3);
    const zLow = z - 1.959964 * seZ;
    const zHigh = z + 1.959964 * seZ;
    ciLower = Math.tanh(zLow);
    ciUpper = Math.tanh(zHigh);
  }

  const { direction, strength, interpretation } = interpretCorrelation(
    boundedR,
    p,
    "pearson",
  );

  return {
    validN: n,
    coefficient: boundedR,
    method: "pearson",
    tStatistic: t,
    degreesOfFreedom: df,
    pValue: p,
    ciLower,
    ciUpper,
    direction,
    strength,
    interpretation,
    scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
    isStatisticallySignificant: p < 0.05,
  };
}

/**
 * Calculate Spearman Rank Correlation coefficient (rho) with tie correction
 */
export function calculateSpearman(
  x: (number | null | undefined)[],
  y: (number | null | undefined)[],
): CorrelationResult {
  const { xVals, yVals } = getCompletePairs(x, y);
  const n = xVals.length;

  if (n < 3) {
    return {
      validN: n,
      coefficient: null,
      method: "spearman",
      tStatistic: null,
      degreesOfFreedom: Math.max(0, n - 2),
      pValue: null,
      ciLower: null,
      ciUpper: null,
      direction: "none",
      strength: "negligible",
      interpretation: "Insufficient paired observations (minimum N = 3 required).",
      scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
      isStatisticallySignificant: false,
      unsuitableReason: "Sample size too small (N < 3).",
    };
  }

  // Rank both arrays with tied-rank averaging
  const rankX = rankArray(xVals);
  const rankY = rankArray(yVals);

  // Compute Pearson correlation of the ranks
  const pResult = calculatePearson(rankX, rankY);

  if (pResult.coefficient === null) {
    return {
      ...pResult,
      method: "spearman",
      scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
    };
  }

  const rs = pResult.coefficient;
  const p = pResult.pValue ?? 1.0;
  const { direction, strength, interpretation } = interpretCorrelation(
    rs,
    p,
    "spearman",
  );

  return {
    validN: n,
    coefficient: rs,
    method: "spearman",
    tStatistic: pResult.tStatistic,
    degreesOfFreedom: n - 2,
    pValue: p,
    ciLower: pResult.ciLower,
    ciUpper: pResult.ciUpper,
    direction,
    strength,
    interpretation,
    scatterData: xVals.map((vx, i) => ({ x: vx, y: yVals[i] })),
    isStatisticallySignificant: p < 0.05,
  };
}

/**
 * Full Correlation Matrix for multiple variables
 */
export type CorrelationMatrixItem = {
  var1: string;
  var2: string;
  var1Label: string;
  var2Label: string;
  coefficient: number | null;
  pValue: number | null;
  validN: number;
};

export function calculateCorrelationMatrix(
  variables: { id: string; label: string; values: (number | null | undefined)[] }[],
  method: "pearson" | "spearman" = "spearman",
): {
  variableLabels: { id: string; label: string }[];
  matrix: CorrelationMatrixItem[][];
} {
  const k = variables.length;
  const matrix: CorrelationMatrixItem[][] = [];

  for (let i = 0; i < k; i++) {
    const row: CorrelationMatrixItem[] = [];
    for (let j = 0; j < k; j++) {
      if (i === j) {
        const validCount = variables[i].values.filter(
          (v) => typeof v === "number" && !isNaN(v),
        ).length;
        row.push({
          var1: variables[i].id,
          var2: variables[j].id,
          var1Label: variables[i].label,
          var2Label: variables[j].label,
          coefficient: 1.0,
          pValue: 0.0,
          validN: validCount,
        });
      } else {
        const res =
          method === "pearson"
            ? calculatePearson(variables[i].values, variables[j].values)
            : calculateSpearman(variables[i].values, variables[j].values);
        row.push({
          var1: variables[i].id,
          var2: variables[j].id,
          var1Label: variables[i].label,
          var2Label: variables[j].label,
          coefficient: res.coefficient,
          pValue: res.pValue,
          validN: res.validN,
        });
      }
    }
    matrix.push(row);
  }

  return {
    variableLabels: variables.map((v) => ({ id: v.id, label: v.label })),
    matrix,
  };
}

// ============================================================================
// 4. MATRIX ALGEBRA & OLS LINEAR REGRESSION
// ============================================================================

/**
 * Matrix multiplication A (m x p) * B (p x n) -> (m x n)
 */
export function matrixMultiply(A: number[][], B: number[][]): number[][] {
  const m = A.length;
  const p = A[0].length;
  const n = B[0].length;
  const result: number[][] = Array.from({ length: m }, () => new Array(n).fill(0));

  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      let sum = 0;
      for (let k = 0; k < p; k++) {
        sum += A[i][k] * B[k][j];
      }
      result[i][j] = sum;
    }
  }
  return result;
}

/**
 * Matrix transpose
 */
export function matrixTranspose(A: number[][]): number[][] {
  const m = A.length;
  const n = A[0].length;
  const result: number[][] = Array.from({ length: n }, () => new Array(m).fill(0));
  for (let i = 0; i < m; i++) {
    for (let j = 0; j < n; j++) {
      result[j][i] = A[i][j];
    }
  }
  return result;
}

/**
 * Matrix inverse via Gauss-Jordan elimination with partial pivoting
 * Returns null if matrix is singular (non-invertible)
 */
export function matrixInverse(matrix: number[][]): number[][] | null {
  const n = matrix.length;
  // Augment with identity matrix
  const A: number[][] = matrix.map((row, i) => {
    const ident = new Array(n).fill(0);
    ident[i] = 1;
    return [...row, ...ident];
  });

  const eps = 1e-12;

  for (let i = 0; i < n; i++) {
    // Pivot search
    let maxRow = i;
    let maxVal = Math.abs(A[i][i]);
    for (let k = i + 1; k < n; k++) {
      if (Math.abs(A[k][i]) > maxVal) {
        maxVal = Math.abs(A[k][i]);
        maxRow = k;
      }
    }

    if (maxVal < eps) {
      return null; // Singular matrix
    }

    // Swap rows
    if (maxRow !== i) {
      const temp = A[i];
      A[i] = A[maxRow];
      A[maxRow] = temp;
    }

    // Scale pivot row
    const pivot = A[i][i];
    for (let j = 0; j < 2 * n; j++) {
      A[i][j] /= pivot;
    }

    // Eliminate other rows
    for (let k = 0; k < n; k++) {
      if (k !== i) {
        const factor = A[k][i];
        for (let j = 0; j < 2 * n; j++) {
          A[k][j] -= factor * A[i][j];
        }
      }
    }
  }

  // Extract right half
  return A.map((row) => row.slice(n));
}

export type RegressionCoefficient = {
  variableName: string;
  unstandardizedB: number;
  stdError: number;
  standardizedBeta: number | null;
  tStatistic: number;
  pValue: number;
  ciLower: number;
  ciUpper: number;
  tolerance: number | null;
  vif: number | null;
};

export type AnovaTable = {
  ssReg: number;
  dfReg: number;
  msReg: number;
  fStatistic: number;
  pValue: number;
  ssRes: number;
  dfRes: number;
  msRes: number;
  ssTot: number;
  dfTot: number;
};

export type RegressionResult = {
  validN: number;
  outcomeName: string;
  predictorNames: string[];
  coefficients: RegressionCoefficient[];
  r: number;
  rSquared: number;
  adjustedRSquared: number;
  stdErrorEstimate: number;
  anova: AnovaTable;
  durbinWatson: number | null;
  residuals: {
    min: number;
    max: number;
    mean: number;
    sd: number;
    values: { fitted: number; residual: number; stdResidual: number }[];
  };
  isSingular: boolean;
  unsuitableReason?: string;
  interpretation: string;
};

/**
 * Multiple & Simple Linear Regression using Ordinary Least Squares (OLS)
 */
export function calculateLinearRegression(
  outcome: { name: string; values: (number | null | undefined)[] },
  predictors: { name: string; values: (number | null | undefined)[] }[],
): RegressionResult {
  const k = predictors.length;
  const nRaw = outcome.values.length;

  // Complete-case analysis (listwise deletion)
  const validIndices: number[] = [];
  for (let i = 0; i < nRaw; i++) {
    const yVal = outcome.values[i];
    if (typeof yVal !== "number" || isNaN(yVal)) continue;

    let validPredictors = true;
    for (let p = 0; p < k; p++) {
      const xVal = predictors[p].values[i];
      if (typeof xVal !== "number" || isNaN(xVal)) {
        validPredictors = false;
        break;
      }
    }
    if (validPredictors) validIndices.push(i);
  }

  const n = validIndices.length;

  // Check sample size constraint: N > k + 1
  if (n <= k + 1) {
    return {
      validN: n,
      outcomeName: outcome.name,
      predictorNames: predictors.map((p) => p.name),
      coefficients: [],
      r: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      stdErrorEstimate: 0,
      anova: {
        ssReg: 0,
        dfReg: k,
        msReg: 0,
        fStatistic: 0,
        pValue: 1,
        ssRes: 0,
        dfRes: Math.max(0, n - k - 1),
        msRes: 0,
        ssTot: 0,
        dfTot: Math.max(0, n - 1),
      },
      durbinWatson: null,
      residuals: { min: 0, max: 0, mean: 0, sd: 0, values: [] },
      isSingular: true,
      unsuitableReason: `Insufficient sample size (N = ${n}). At least ${k + 2} valid observations are required for ${k} predictor(s).`,
      interpretation: "Model cannot be estimated due to insufficient degrees of freedom.",
    };
  }

  // Build Y vector (n x 1)
  const Y: number[][] = validIndices.map((i) => [outcome.values[i] as number]);

  // Build X matrix (n x (k+1)) including intercept column of 1s
  const X: number[][] = validIndices.map((i) => [
    1.0,
    ...predictors.map((p) => p.values[i] as number),
  ]);

  // Compute X^T * X and X^T * Y
  const XT = matrixTranspose(X);
  const XTX = matrixMultiply(XT, X);
  const XTY = matrixMultiply(XT, Y);

  // Invert X^T * X
  const XTXInv = matrixInverse(XTX);

  if (!XTXInv) {
    return {
      validN: n,
      outcomeName: outcome.name,
      predictorNames: predictors.map((p) => p.name),
      coefficients: [],
      r: 0,
      rSquared: 0,
      adjustedRSquared: 0,
      stdErrorEstimate: 0,
      anova: {
        ssReg: 0,
        dfReg: k,
        msReg: 0,
        fStatistic: 0,
        pValue: 1,
        ssRes: 0,
        dfRes: n - k - 1,
        msRes: 0,
        ssTot: 0,
        dfTot: n - 1,
      },
      durbinWatson: null,
      residuals: { min: 0, max: 0, mean: 0, sd: 0, values: [] },
      isSingular: true,
      unsuitableReason:
        "Singular matrix detected: perfect or near-perfect multicollinearity exists between predictors, or one predictor has zero variance.",
      interpretation:
        "The model cannot be estimated due to linear dependency among predictor variables.",
    };
  }

  // Beta vector: (X^T * X)^-1 * (X^T * Y)
  const Beta = matrixMultiply(XTXInv, XTY); // (k+1) x 1

  // Compute fitted values and residuals
  const yVals = Y.map((r) => r[0]);
  const yMean = yVals.reduce((a, b) => a + b, 0) / n;

  let ssTot = 0;
  for (const y of yVals) {
    const dy = y - yMean;
    ssTot += dy * dy;
  }

  const fitted: number[] = [];
  const res: number[] = [];
  let ssRes = 0;

  for (let i = 0; i < n; i++) {
    let yHat = 0;
    for (let j = 0; j <= k; j++) {
      yHat += X[i][j] * Beta[j][0];
    }
    const residual = yVals[i] - yHat;
    fitted.push(yHat);
    res.push(residual);
    ssRes += residual * residual;
  }

  const dfTot = n - 1;
  const dfReg = k;
  const dfRes = n - k - 1;
  const ssReg = Math.max(0, ssTot - ssRes);

  const msReg = dfReg > 0 ? ssReg / dfReg : 0;
  const msRes = dfRes > 0 ? ssRes / dfRes : 0;

  const fStat = msRes > 0 ? msReg / msRes : 0;
  const fPVal = fPValue(fStat, dfReg, dfRes);

  const rSq = ssTot > 0 ? Math.max(0, Math.min(1, 1 - ssRes / ssTot)) : 0;
  const adjRSq =
    ssTot > 0 && dfRes > 0
      ? Math.max(0, 1 - (ssRes / dfRes) / (ssTot / dfTot))
      : 0;
  const r = Math.sqrt(rSq);
  const seEst = Math.sqrt(msRes);

  // Critical t for 95% CI
  const tCrit = studentTInverse(0.05, dfRes);

  // Compute standard deviations for standardized betas
  const ySD = Math.sqrt(ssTot / (n - 1));
  const xSDs: number[] = [];
  for (let p = 0; p < k; p++) {
    const xValsP = validIndices.map((i) => predictors[p].values[i] as number);
    const meanP = xValsP.reduce((a, b) => a + b, 0) / n;
    const ssP = xValsP.reduce((acc, x) => acc + (x - meanP) * (x - meanP), 0);
    xSDs.push(Math.sqrt(ssP / (n - 1)));
  }

  // Compute VIF (Variance Inflation Factor) for each predictor if k > 1
  const vifs: (number | null)[] = new Array(k).fill(null);
  const tolerances: (number | null)[] = new Array(k).fill(null);

  if (k > 1) {
    for (let p = 0; p < k; p++) {
      const subOutcome = predictors[p];
      const otherPredictors = predictors.filter((_, idx) => idx !== p);
      const subReg = calculateLinearRegression(subOutcome, otherPredictors);
      if (!subReg.isSingular && subReg.rSquared < 1) {
        const tol = 1 - subReg.rSquared;
        tolerances[p] = tol;
        vifs[p] = tol > 0 ? 1 / tol : 999;
      }
    }
  }

  // Build coefficients table
  const coefficients: RegressionCoefficient[] = [];

  // Intercept
  const seIntercept = Math.sqrt(Math.max(0, msRes * XTXInv[0][0]));
  const tIntercept = seIntercept > 0 ? Beta[0][0] / seIntercept : 0;
  const pIntercept = studentTPValue(tIntercept, dfRes);

  coefficients.push({
    variableName: "(Constant / Intercept)",
    unstandardizedB: Beta[0][0],
    stdError: seIntercept,
    standardizedBeta: null,
    tStatistic: tIntercept,
    pValue: pIntercept,
    ciLower: Beta[0][0] - tCrit * seIntercept,
    ciUpper: Beta[0][0] + tCrit * seIntercept,
    tolerance: null,
    vif: null,
  });

  // Predictor coefficients
  for (let j = 1; j <= k; j++) {
    const b = Beta[j][0];
    const se = Math.sqrt(Math.max(0, msRes * XTXInv[j][j]));
    const t = se > 0 ? b / se : 0;
    const p = studentTPValue(t, dfRes);
    const betaStd = ySD > 0 ? b * (xSDs[j - 1] / ySD) : null;

    coefficients.push({
      variableName: predictors[j - 1].name,
      unstandardizedB: b,
      stdError: se,
      standardizedBeta: betaStd,
      tStatistic: t,
      pValue: p,
      ciLower: b - tCrit * se,
      ciUpper: b + tCrit * se,
      tolerance: tolerances[j - 1],
      vif: vifs[j - 1],
    });
  }

  // Durbin-Watson statistic
  let sumDiffSq = 0;
  for (let i = 1; i < n; i++) {
    const d = res[i] - res[i - 1];
    sumDiffSq += d * d;
  }
  const dw = ssRes > 0 ? sumDiffSq / ssRes : null;

  // Residual descriptive stats
  const resMin = Math.min(...res);
  const resMax = Math.max(...res);
  const resMean = res.reduce((a, b) => a + b, 0) / n;
  const resSD = Math.sqrt(ssRes / (n - 1));

  const residualItems = res.map((rVal, idx) => ({
    fitted: fitted[idx],
    residual: rVal,
    stdResidual: resSD > 0 ? rVal / resSD : 0,
  }));

  // Academic interpretation
  const sigText =
    fPVal < 0.05
      ? `statistically significant (F(${dfReg}, ${dfRes}) = ${fStat.toFixed(2)}, p = ${fPVal.toFixed(3)})`
      : `not statistically significant (F(${dfReg}, ${dfRes}) = ${fStat.toFixed(2)}, p = ${fPVal.toFixed(3)})`;

  const interp = `The regression model explains ${(rSq * 100).toFixed(1)}% of the variance in ${outcome.name} (R² = ${rSq.toFixed(3)}, Adjusted R² = ${adjRSq.toFixed(3)}), which is ${sigText}. Note: Regression coefficients indicate observational associations, not causal effects.`;

  return {
    validN: n,
    outcomeName: outcome.name,
    predictorNames: predictors.map((p) => p.name),
    coefficients,
    r,
    rSquared: rSq,
    adjustedRSquared: adjRSq,
    stdErrorEstimate: seEst,
    anova: {
      ssReg,
      dfReg,
      msReg,
      fStatistic: fStat,
      pValue: fPVal,
      ssRes,
      dfRes,
      msRes,
      ssTot,
      dfTot,
    },
    durbinWatson: dw,
    residuals: {
      min: resMin,
      max: resMax,
      mean: resMean,
      sd: resSD,
      values: residualItems,
    },
    isSingular: false,
    interpretation: interp,
  };
}

// ============================================================================
// 5. RELIABILITY ANALYSIS (CRONBACH'S ALPHA)
// ============================================================================

export type ReliabilityItemResult = {
  id: string;
  name: string;
  itemMean: number;
  itemVariance: number;
  itemSd: number;
  correctedItemTotalCorrelation: number | null;
  alphaIfItemDeleted: number | null;
};

export type ReliabilityResult = {
  validN: number;
  itemCount: number;
  cronbachAlpha: number | null;
  scaleMean: number | null;
  scaleVariance: number | null;
  scaleSd: number | null;
  standardizedAlpha: number | null;
  evaluation:
    | "Excellent (α ≥ 0.90)"
    | "Good (0.80 ≤ α < 0.90)"
    | "Acceptable (0.70 ≤ α < 0.80)"
    | "Questionable (0.60 ≤ α < 0.70)"
    | "Poor (0.50 ≤ α < 0.60)"
    | "Unacceptable (α < 0.50)"
    | "Not Applicable";
  items: ReliabilityItemResult[];
  unsuitableReason?: string;
  interpretation: string;
};

/**
 * Calculate Cronbach's Alpha, corrected item-total correlations, and alpha-if-item-deleted
 */
export function calculateReliability(
  items: { id: string; name: string; values: (number | null | undefined)[] }[],
  reverseCoded: Record<string, boolean> = {},
  scaleMax = 5,
  scaleMin = 1,
): ReliabilityResult {
  const k = items.length;
  if (k < 2) {
    return {
      validN: 0,
      itemCount: k,
      cronbachAlpha: null,
      scaleMean: null,
      scaleVariance: null,
      scaleSd: null,
      standardizedAlpha: null,
      evaluation: "Not Applicable",
      items: [],
      unsuitableReason: "Reliability analysis requires at least 2 items.",
      interpretation: "Not applicable: a multi-item construct requires 2 or more indicators.",
    };
  }

  const nRaw = items[0].values.length;

  // Complete cases across all items
  const validIndices: number[] = [];
  for (let i = 0; i < nRaw; i++) {
    let allValid = true;
    for (let j = 0; j < k; j++) {
      const v = items[j].values[i];
      if (typeof v !== "number" || isNaN(v)) {
        allValid = false;
        break;
      }
    }
    if (allValid) validIndices.push(i);
  }

  const n = validIndices.length;
  if (n < 3) {
    return {
      validN: n,
      itemCount: k,
      cronbachAlpha: null,
      scaleMean: null,
      scaleVariance: null,
      scaleSd: null,
      standardizedAlpha: null,
      evaluation: "Not Applicable",
      items: [],
      unsuitableReason: "Insufficient complete observations (N < 3).",
      interpretation: "Not applicable: insufficient complete participant observations.",
    };
  }

  // Extract clean scored item values with reverse coding where configured
  const itemMatrix: number[][] = [];
  for (let j = 0; j < k; j++) {
    const isRev = reverseCoded[items[j].id] ?? false;
    const col = validIndices.map((idx) => {
      const raw = items[j].values[idx] as number;
      return isRev ? scaleMax + scaleMin - raw : raw;
    });
    itemMatrix.push(col);
  }

  // Calculate item means and variances
  const itemMeans: number[] = [];
  const itemVars: number[] = [];
  let sumItemVars = 0;

  for (let j = 0; j < k; j++) {
    const col = itemMatrix[j];
    const mean = col.reduce((a, b) => a + b, 0) / n;
    let ss = 0;
    for (const v of col) {
      const d = v - mean;
      ss += d * d;
    }
    const variance = ss / (n - 1);
    itemMeans.push(mean);
    itemVars.push(variance);
    sumItemVars += variance;
  }

  // Calculate total scores per respondent
  const totalScores: number[] = new Array(n).fill(0);
  for (let i = 0; i < n; i++) {
    for (let j = 0; j < k; j++) {
      totalScores[i] += itemMatrix[j][i];
    }
  }

  const scaleMean = totalScores.reduce((a, b) => a + b, 0) / n;
  let ssTotal = 0;
  for (const s of totalScores) {
    const d = s - scaleMean;
    ssTotal += d * d;
  }
  const scaleVariance = ssTotal / (n - 1);
  const scaleSd = Math.sqrt(scaleVariance);

  if (scaleVariance <= 0) {
    return {
      validN: n,
      itemCount: k,
      cronbachAlpha: null,
      scaleMean,
      scaleVariance: 0,
      scaleSd: 0,
      standardizedAlpha: null,
      evaluation: "Not Applicable",
      items: [],
      unsuitableReason: "Total scale variance is zero across respondents.",
      interpretation: "Not applicable: total scale variance is zero.",
    };
  }

  // Cronbach's Alpha: (k / (k - 1)) * (1 - (sumItemVars / scaleVariance))
  const rawAlpha = (k / (k - 1)) * (1 - sumItemVars / scaleVariance);
  const cronbachAlpha = rawAlpha;

  // Item-total correlations and alpha-if-deleted
  const itemResults: ReliabilityItemResult[] = [];

  for (let j = 0; j < k; j++) {
    // Total score excluding item j
    const totalWithoutJ = totalScores.map((tot, idx) => tot - itemMatrix[j][idx]);
    const pCorr = calculatePearson(itemMatrix[j], totalWithoutJ);

    // Alpha if item deleted
    let alphaIfDeleted: number | null = null;
    if (k > 2) {
      let sumVarDeleted = 0;
      for (let m = 0; m < k; m++) {
        if (m !== j) sumVarDeleted += itemVars[m];
      }
      const meanDel = totalWithoutJ.reduce((a, b) => a + b, 0) / n;
      let ssDel = 0;
      for (const tDel of totalWithoutJ) {
        const d = tDel - meanDel;
        ssDel += d * d;
      }
      const varDel = ssDel / (n - 1);
      if (varDel > 0) {
        alphaIfDeleted = ((k - 1) / (k - 2)) * (1 - sumVarDeleted / varDel);
      }
    }

    itemResults.push({
      id: items[j].id,
      name: items[j].name,
      itemMean: itemMeans[j],
      itemVariance: itemVars[j],
      itemSd: Math.sqrt(itemVars[j]),
      correctedItemTotalCorrelation: pCorr.coefficient,
      alphaIfItemDeleted: alphaIfDeleted,
    });
  }

  let evaluation: ReliabilityResult["evaluation"] = "Unacceptable (α < 0.50)";
  if (cronbachAlpha >= 0.9) evaluation = "Excellent (α ≥ 0.90)";
  else if (cronbachAlpha >= 0.8) evaluation = "Good (0.80 ≤ α < 0.90)";
  else if (cronbachAlpha >= 0.7) evaluation = "Acceptable (0.70 ≤ α < 0.80)";
  else if (cronbachAlpha >= 0.6) evaluation = "Questionable (0.60 ≤ α < 0.70)";
  else if (cronbachAlpha >= 0.5) evaluation = "Poor (0.50 ≤ α < 0.60)";

  const interp = `Cronbach's alpha for this ${k}-item scale is α = ${cronbachAlpha.toFixed(3)} (${evaluation}), based on N = ${n} complete cases. Note: High internal consistency does not by itself prove unidimensional construct validity.`;

  return {
    validN: n,
    itemCount: k,
    cronbachAlpha,
    scaleMean,
    scaleVariance,
    scaleSd,
    standardizedAlpha: null,
    evaluation,
    items: itemResults,
    interpretation: interp,
  };
}

// ============================================================================
// 6. ASSUMPTION DIAGNOSTICS
// ============================================================================

export type DiagnosticCheck = {
  assumption: string;
  status: "satisfied" | "warning" | "violated";
  metric: string;
  threshold: string;
  details: string;
  recommendation: string;
};

export type AssumptionDiagnosticsResult = {
  sampleSize: DiagnosticCheck;
  missingData: DiagnosticCheck;
  normality: DiagnosticCheck;
  outliers: DiagnosticCheck;
  multicollinearity: DiagnosticCheck;
  homoscedasticity: DiagnosticCheck;
  linearity: DiagnosticCheck;
  independence: DiagnosticCheck;
  checks: DiagnosticCheck[];
};

export function runAssumptionDiagnostics(
  outcome: { name: string; values: (number | null | undefined)[] },
  predictors: { name: string; values: (number | null | undefined)[] }[],
  regressionResult?: RegressionResult,
): AssumptionDiagnosticsResult {
  const totalN = outcome.values.length;
  const k = predictors.length;

  // 1. Sample Size Check
  const completeN = regressionResult ? regressionResult.validN : totalN;
  const recommendedMin = Math.max(30, 50 + 8 * k);
  let sampleStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (completeN < k + 2) sampleStatus = "violated";
  else if (completeN < recommendedMin) sampleStatus = "warning";

  const sampleSizeCheck: DiagnosticCheck = {
    assumption: "Sample Size Adequacy",
    status: sampleStatus,
    metric: `N = ${completeN}`,
    threshold: `N ≥ ${recommendedMin} recommended for regression (Green, 1991: N ≥ 50 + 8k)`,
    details:
      completeN >= recommendedMin
        ? `Sufficient statistical power with N = ${completeN} for ${k} predictor(s).`
        : `Sample size N = ${completeN} is below the recommended rule of thumb (N = ${recommendedMin}). Statistical power is reduced.`,
    recommendation:
      sampleStatus === "warning"
        ? "Interpret test statistics cautiously and avoid over-fitting. Non-parametric methods (Spearman) may be more robust."
        : "Sample size meets standard academic thresholds.",
  };

  // 2. Missing Data
  const missingCount = outcome.values.filter(
    (v) => v === null || v === undefined || isNaN(v),
  ).length;
  const missingPct = totalN > 0 ? (missingCount / totalN) * 100 : 0;
  let missingStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (missingPct > 20) missingStatus = "violated";
  else if (missingPct > 5) missingStatus = "warning";

  const missingDataCheck: DiagnosticCheck = {
    assumption: "Missing Data Pattern",
    status: missingStatus,
    metric: `${missingPct.toFixed(1)}% missing (${missingCount}/${totalN})`,
    threshold: "Missing rate < 5% is benign; > 20% threatens validity",
    details:
      missingCount === 0
        ? "No missing responses detected."
        : `${missingCount} observation(s) missing. Complete-case analysis applied.`,
    recommendation:
      missingStatus !== "satisfied"
        ? "Document whether missingness is Missing Completely at Random (MCAR). Do not fabricate missing values."
        : "Missingness level is within acceptable bounds.",
  };

  // 3. Normality Diagnostics
  const stats = calculateDescriptiveStats(outcome.values);
  const skew = stats.skewness ?? 0;
  const kurt = stats.kurtosis ?? 0;
  let normStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (Math.abs(skew) > 2 || Math.abs(kurt) > 7) normStatus = "violated";
  else if (Math.abs(skew) > 1 || Math.abs(kurt) > 3) normStatus = "warning";

  const normalityCheck: DiagnosticCheck = {
    assumption: "Normality of Distribution",
    status: normStatus,
    metric: `Skewness = ${skew.toFixed(2)}, Excess Kurtosis = ${kurt.toFixed(2)}`,
    threshold: "Skewness in [-1, +1] and Kurtosis in [-3, +3] (George & Mallery, 2010)",
    details:
      normStatus === "satisfied"
        ? `Outcome distribution is approximately symmetric and normal.`
        : `Outcome distribution exhibits moderate skewness/kurtosis departure from normality.`,
    recommendation:
      normStatus !== "satisfied"
        ? "Use Spearman rank correlation for hypothesis testing as a non-parametric alternative to Pearson/OLS."
        : "Parametric assumptions for normality are satisfied.",
  };

  // 4. Outlier Review
  let outlierCount = 0;
  const validVals = outcome.values.filter(
    (v): v is number => typeof v === "number" && !isNaN(v),
  );
  if (stats.q1 !== null && stats.q3 !== null && stats.iqr !== null) {
    const lowFence = stats.q1 - 1.5 * stats.iqr;
    const highFence = stats.q3 + 1.5 * stats.iqr;
    outlierCount = validVals.filter((v) => v < lowFence || v > highFence).length;
  }
  let outlierStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (outlierCount > validVals.length * 0.1) outlierStatus = "warning";

  const outliersCheck: DiagnosticCheck = {
    assumption: "Outliers & Extreme Values",
    status: outlierStatus,
    metric: `${outlierCount} outlier(s) identified (1.5 × IQR fence)`,
    threshold: "Outliers < 5% of sample",
    details:
      outlierCount === 0
        ? "No univariate outliers identified outside 1.5 × IQR boundaries."
        : `${outlierCount} observation(s) fall outside Tukey 1.5 × IQR fences. In academic survey research, never automatically delete legitimate student responses.`,
    recommendation:
      outlierCount > 0
        ? "Verify data entry accuracy. Retain authentic student observations and consider non-parametric rank tests."
        : "No influential outlier distortions detected.",
  };

  // 5. Multicollinearity
  let maxVif = 1.0;
  if (regressionResult && regressionResult.coefficients.length > 1) {
    for (const c of regressionResult.coefficients) {
      if (c.vif !== null && c.vif > maxVif) maxVif = c.vif;
    }
  }
  let multiStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (maxVif > 10) multiStatus = "violated";
  else if (maxVif > 5) multiStatus = "warning";

  const multicollinearityCheck: DiagnosticCheck = {
    assumption: "Multicollinearity (VIF)",
    status: multiStatus,
    metric: `Max VIF = ${maxVif.toFixed(2)}`,
    threshold: "VIF < 5 is good; VIF > 10 indicates severe multicollinearity (Hair et al., 2014)",
    details:
      maxVif <= 5
        ? "Predictor variables have acceptable discriminant validity; no severe multicollinearity detected."
        : `High inter-correlation between predictors (VIF = ${maxVif.toFixed(2)}) inflates standard errors.`,
    recommendation:
      multiStatus !== "satisfied"
        ? "Review predictor correlation matrix. Consider evaluating independent variables individually."
        : "Multicollinearity assumption is satisfied.",
  };

  // 6. Homoscedasticity & Linearity
  const dw = regressionResult?.durbinWatson ?? null;
  let homoscedStatus: "satisfied" | "warning" | "violated" = "satisfied";
  if (dw !== null && (dw < 1.0 || dw > 3.0)) homoscedStatus = "warning";

  const homoscedasticityCheck: DiagnosticCheck = {
    assumption: "Homoscedasticity & Residual Variance",
    status: homoscedStatus,
    metric: dw !== null ? `Durbin-Watson = ${dw.toFixed(2)}` : "Visual inspection recommended",
    threshold: "Durbin-Watson in [1.5, 2.5] indicates independence/homoscedasticity",
    details:
      dw !== null
        ? `Durbin-Watson test statistic: ${dw.toFixed(2)} (values near 2.0 indicate independent residuals).`
        : "Inspect Residuals vs Fitted plot for constant variance.",
    recommendation:
      homoscedStatus === "warning"
        ? "Residual variance may vary across fitted values. Use robust standard errors."
        : "Residuals show acceptable dispersion.",
  };

  const linearityCheck: DiagnosticCheck = {
    assumption: "Linearity of Association",
    status: "satisfied",
    metric: "Scatter plot inspection",
    threshold: "Monotonic or linear trend visible",
    details: "Likert survey responses have ordinal intervals; monotonic relationship checked via rank tests.",
    recommendation: "Spearman rank correlation relaxes the strict linear relationship requirement.",
  };

  const independenceCheck: DiagnosticCheck = {
    assumption: "Independence of Observations",
    status: "satisfied",
    metric: "Cross-sectional survey design",
    threshold: "Independent individual respondents",
    details: "Unique participant codes and browser isolation ensure independent survey observations.",
    recommendation: "Ensure each respondent submitted only once.",
  };

  const checks = [
    sampleSizeCheck,
    missingDataCheck,
    normalityCheck,
    outliersCheck,
    multicollinearityCheck,
    homoscedasticityCheck,
    linearityCheck,
    independenceCheck,
  ];

  return {
    sampleSize: sampleSizeCheck,
    missingData: missingDataCheck,
    normality: normalityCheck,
    outliers: outliersCheck,
    multicollinearity: multicollinearityCheck,
    homoscedasticity: homoscedasticityCheck,
    linearity: linearityCheck,
    independence: independenceCheck,
    checks,
  };
}

// ============================================================================
// 7. HYPOTHESIS TESTING
// ============================================================================

export type HypothesisTestResult = {
  hypothesisId: "H1" | "H2" | "H3" | "H4" | "H5";
  independentVariable: string;
  dependentVariable: string;
  nullHypothesis: string;
  alternativeHypothesis: string;
  selectedTest: "spearman" | "pearson" | "regression";
  alpha: number;
  adjustedAlpha: number;
  sampleSize: number;
  testStatisticName: string;
  testStatisticValue: number | null;
  degreesOfFreedom: number;
  pValue: number | null;
  effectSizeName: string;
  effectSizeValue: number | null;
  ci95Lower: number | null;
  ci95Upper: number | null;
  decision: "Reject H0" | "Fail to Reject H0";
  plainLanguageInterpretation: string;
  unsuitableReason?: string;
};

/**
 * Run hypothesis test for academic survey hypotheses H01-H14
 */
export function runHypothesisTest(
  hypothesisId: "H1" | "H2" | "H3" | "H4" | "H5",
  ivName: string,
  ivValues: (number | null | undefined)[],
  dvName: string,
  dvValues: (number | null | undefined)[],
  testType: "spearman" | "pearson" | "regression" = "spearman",
  alpha = 0.05,
  multipleTestingAdjustment: "none" | "bonferroni" = "none",
): HypothesisTestResult {
  const testCount = hypothesisId === "H5" ? 5 : 4;
  const adjustedAlpha = multipleTestingAdjustment === "bonferroni" ? alpha / testCount : alpha;

  const hypothesesText: Record<
    "H1" | "H2" | "H3" | "H4" | "H5",
    { nullH: string; altH: string }
  > = {
    H1: {
      nullH: "H01: No statistically significant association exists between the operationalized Phishing variable and User Privacy.",
      altH: "H11: A statistically significant association exists between the operationalized Phishing variable and User Privacy.",
    },
    H2: {
      nullH: "H02: No statistically significant association exists between the operationalized Pretexting variable and User Privacy.",
      altH: "H12: A statistically significant association exists between the operationalized Pretexting variable and User Privacy.",
    },
    H3: {
      nullH: "H03: No statistically significant association exists between the operationalized Impersonation variable and User Privacy.",
      altH: "H13: A statistically significant association exists between the operationalized Impersonation variable and User Privacy.",
    },
    H4: {
      nullH: "H04: No statistically significant association exists between the operationalized Online Scams & Malicious Link Threats variable and User Privacy.",
      altH: "H14: A statistically significant association exists between the operationalized Online Scams & Malicious Link Threats variable and User Privacy.",
    },
    H5: {
      nullH: "H05: No statistically significant association exists between the operationalized AI-Generated Deepfake Deception variable and User Privacy.",
      altH: "H15: A statistically significant association exists between the operationalized AI-Generated Deepfake Deception variable and User Privacy.",
    },
  };

  const { nullH, altH } = hypothesesText[hypothesisId];

  if (testType === "spearman") {
    const res = calculateSpearman(ivValues, dvValues);
    const p = res.pValue;
    const n = res.validN;
    const isSig = p !== null && p < adjustedAlpha;
    const decision = isSig ? "Reject H0" : "Fail to Reject H0";

    const pFormatted =
      p === null ? "—" : p < 0.001 ? "p < .001" : `p = ${p.toFixed(3)}`;
    const rsFormatted =
      res.coefficient === null ? "—" : res.coefficient.toFixed(3);

    const interp =
      isSig
        ? `A statistically significant association was found between ${ivName} and ${dvName} (Spearman rs = ${rsFormatted}, ${pFormatted}, N = ${n}). We reject H0 at α = ${adjustedAlpha.toFixed(3)}. This indicates that university students reporting higher ${ivName} also report different levels of ${dvName}.`
        : `No statistically significant association was found between ${ivName} and ${dvName} at α = ${adjustedAlpha.toFixed(3)} (Spearman rs = ${rsFormatted}, ${pFormatted}, N = ${n}). We fail to reject H0. Note: Non-significance does not prove the null hypothesis is true.`;

    return {
      hypothesisId,
      independentVariable: ivName,
      dependentVariable: dvName,
      nullHypothesis: nullH,
      alternativeHypothesis: altH,
      selectedTest: "spearman",
      alpha,
      adjustedAlpha,
      sampleSize: n,
      testStatisticName: "Spearman rho (rs)",
      testStatisticValue: res.coefficient,
      degreesOfFreedom: res.degreesOfFreedom,
      pValue: p,
      effectSizeName: "Correlation coefficient (rs)",
      effectSizeValue: res.coefficient,
      ci95Lower: res.ciLower,
      ci95Upper: res.ciUpper,
      decision,
      plainLanguageInterpretation: interp,
      unsuitableReason: res.unsuitableReason,
    };
  } else if (testType === "pearson") {
    const res = calculatePearson(ivValues, dvValues);
    const p = res.pValue;
    const n = res.validN;
    const isSig = p !== null && p < adjustedAlpha;
    const decision = isSig ? "Reject H0" : "Fail to Reject H0";

    const pFormatted =
      p === null ? "—" : p < 0.001 ? "p < .001" : `p = ${p.toFixed(3)}`;
    const rFormatted =
      res.coefficient === null ? "—" : res.coefficient.toFixed(3);

    const interp =
      isSig
        ? `A statistically significant Pearson linear correlation was observed between ${ivName} and ${dvName} (r = ${rFormatted}, ${pFormatted}, 95% CI [${res.ciLower?.toFixed(2) ?? "—"}, ${res.ciUpper?.toFixed(2) ?? "—"}], N = ${n}). We reject H0 at α = ${adjustedAlpha.toFixed(3)}.`
        : `No statistically significant Pearson correlation was detected between ${ivName} and ${dvName} (r = ${rFormatted}, ${pFormatted}, N = ${n}). We fail to reject H0 at α = ${adjustedAlpha.toFixed(3)}.`;

    return {
      hypothesisId,
      independentVariable: ivName,
      dependentVariable: dvName,
      nullHypothesis: nullH,
      alternativeHypothesis: altH,
      selectedTest: "pearson",
      alpha,
      adjustedAlpha,
      sampleSize: n,
      testStatisticName: "Pearson r",
      testStatisticValue: res.coefficient,
      degreesOfFreedom: res.degreesOfFreedom,
      pValue: p,
      effectSizeName: "Coefficient of determination (r²)",
      effectSizeValue: res.coefficient !== null ? res.coefficient * res.coefficient : null,
      ci95Lower: res.ciLower,
      ci95Upper: res.ciUpper,
      decision,
      plainLanguageInterpretation: interp,
      unsuitableReason: res.unsuitableReason,
    };
  } else {
    // Linear regression
    const regRes = calculateLinearRegression(
      { name: dvName, values: dvValues },
      [{ name: ivName, values: ivValues }],
    );
    const predCoef = regRes.coefficients.find((c) => c.variableName === ivName);
    const p = predCoef?.pValue ?? 1.0;
    const n = regRes.validN;
    const isSig = p < adjustedAlpha;
    const decision = isSig ? "Reject H0" : "Fail to Reject H0";

    const pFormatted = p < 0.001 ? "p < .001" : `p = ${p.toFixed(3)}`;
    const bFormatted = predCoef?.unstandardizedB.toFixed(3) ?? "—";

    const interp =
      isSig
        ? `Simple linear regression demonstrates a statistically significant association where ${ivName} predicts ${dvName} (B = ${bFormatted}, t = ${predCoef?.tStatistic.toFixed(2)}, ${pFormatted}, R² = ${regRes.rSquared.toFixed(3)}, N = ${n}). We reject H0 at α = ${adjustedAlpha.toFixed(3)}.`
        : `Simple linear regression showed no statistically significant effect of ${ivName} on ${dvName} (B = ${bFormatted}, t = ${predCoef?.tStatistic.toFixed(2)}, ${pFormatted}, N = ${n}). We fail to reject H0 at α = ${adjustedAlpha.toFixed(3)}.`;

    return {
      hypothesisId,
      independentVariable: ivName,
      dependentVariable: dvName,
      nullHypothesis: nullH,
      alternativeHypothesis: altH,
      selectedTest: "regression",
      alpha,
      adjustedAlpha,
      sampleSize: n,
      testStatisticName: "Regression t-statistic",
      testStatisticValue: predCoef?.tStatistic ?? null,
      degreesOfFreedom: regRes.anova.dfRes,
      pValue: p,
      effectSizeName: "R-squared (R²)",
      effectSizeValue: regRes.rSquared,
      ci95Lower: predCoef?.ciLower ?? null,
      ci95Upper: predCoef?.ciUpper ?? null,
      decision,
      plainLanguageInterpretation: interp,
      unsuitableReason: regRes.unsuitableReason,
    };
  }
}

// ============================================================================
// 8. CONSTRUCT & VARIABLE OPERATIONALIZATION HELPERS
// ============================================================================

export type VariableDefinition = {
  id: string;
  name: string;
  section: string;
  role: "Profile" | "IV1" | "IV2" | "IV3" | "IV4" | "DV" | "Composite";
  itemIds: string[];
  type: "single_item" | "composite_mean" | "composite_sum";
  measurementLevel: "nominal" | "ordinal" | "interval" | "ratio";
  description: string;
};

/**
 * Standard variable definitions mapped from questionnaire and research proposal
 */
export const STANDARD_VARIABLES: VariableDefinition[] = [
  // Demographics
  {
    id: "Q1",
    name: "Age Group",
    section: "A",
    role: "Profile",
    itemIds: ["Q1"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Respondent's age bracket",
  },
  {
    id: "Q2",
    name: "Gender",
    section: "A",
    role: "Profile",
    itemIds: ["Q2"],
    type: "single_item",
    measurementLevel: "nominal",
    description: "Respondent's gender",
  },
  {
    id: "Q3",
    name: "Year of Study",
    section: "A",
    role: "Profile",
    itemIds: ["Q3"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Current academic year of study",
  },
  {
    id: "Q4",
    name: "Field of Study",
    section: "A",
    role: "Profile",
    itemIds: ["Q4"],
    type: "single_item",
    measurementLevel: "nominal",
    description: "Academic discipline / faculty",
  },
  {
    id: "Q5",
    name: "University Type",
    section: "A",
    role: "Profile",
    itemIds: ["Q5"],
    type: "single_item",
    measurementLevel: "nominal",
    description: "Type of higher education institution",
  },

  // IV1: Phishing (Q6–Q9)
  {
    id: "Q6",
    name: "Phishing: Awareness",
    section: "B",
    role: "IV1",
    itemIds: ["Q6"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Familiarity with the term 'phishing' (1–5 scale)",
  },
  {
    id: "Q7",
    name: "Phishing: Exposure",
    section: "B",
    role: "IV1",
    itemIds: ["Q7"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Frequency of suspected phishing messages received in past 12 months",
  },
  {
    id: "Q8",
    name: "Phishing: Response Behaviour",
    section: "B",
    role: "IV1",
    itemIds: ["Q8"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Likelihood of avoiding clicking suspicious links/attachments (1–5 scale)",
  },
  {
    id: "Q9",
    name: "Phishing: Perceived Risk",
    section: "B",
    role: "IV1",
    itemIds: ["Q9"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Worry that phishing could lead to personal information misuse (1–5 scale)",
  },
  {
    id: "IV1_COMPOSITE",
    name: "IV1: Phishing (Likert Composite Index)",
    section: "B",
    role: "IV1",
    itemIds: ["Q6", "Q8", "Q9"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of Phishing 1–5 scale items (Q6, Q8, Q9)",
  },

  // IV2: Pretexting (Q10–Q12)
  {
    id: "Q10",
    name: "Pretexting: Awareness",
    section: "C",
    role: "IV2",
    itemIds: ["Q10"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Familiarity with pretexting situations (1–5 scale)",
  },
  {
    id: "Q11",
    name: "Pretexting: Exposure",
    section: "C",
    role: "IV2",
    itemIds: ["Q11"],
    type: "single_item",
    measurementLevel: "nominal",
    description: "Encountered false reason/story in past 12 months (Yes/No/Not sure)",
  },
  {
    id: "Q12",
    name: "Pretexting: Susceptibility",
    section: "C",
    role: "IV2",
    itemIds: ["Q12"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Willingness to share personal information under convincing reason (1–5 scale)",
  },
  {
    id: "IV2_COMPOSITE",
    name: "IV2: Pretexting (Likert Composite Index)",
    section: "C",
    role: "IV2",
    itemIds: ["Q10", "Q12"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of Pretexting 1–5 scale items (Q10, Q12)",
  },

  // IV3: Impersonation (Q13–Q15)
  {
    id: "Q13",
    name: "Impersonation: Awareness",
    section: "D",
    role: "IV3",
    itemIds: ["Q13"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Familiarity with impersonation cases (1–5 scale)",
  },
  {
    id: "Q14",
    name: "Impersonation: Exposure",
    section: "D",
    role: "IV3",
    itemIds: ["Q14"],
    type: "single_item",
    measurementLevel: "nominal",
    description: "Encountered fake profiles pretending to be known contacts (Yes/No/Not sure)",
  },
  {
    id: "Q15",
    name: "Impersonation: Difficulty Recognising",
    section: "D",
    role: "IV3",
    itemIds: ["Q15"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Perceived difficulty telling real persons from impersonators (1–5 scale)",
  },
  {
    id: "IV3_COMPOSITE",
    name: "IV3: Impersonation (Likert Composite Index)",
    section: "D",
    role: "IV3",
    itemIds: ["Q13", "Q15"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of Impersonation 1–5 scale items (Q13, Q15)",
  },

  // IV4: Online Scams & Malicious Links (Q16–Q18)
  {
    id: "Q16",
    name: "Scams & Links: Exposure",
    section: "E",
    role: "IV4",
    itemIds: ["Q16"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Frequency of seeing suspicious links/offers in past 12 months",
  },
  {
    id: "Q17",
    name: "Scams & Links: Verification Behaviour",
    section: "E",
    role: "IV4",
    itemIds: ["Q17"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Likelihood of checking where unfamiliar links lead before clicking (1–5 scale)",
  },
  {
    id: "Q18",
    name: "Scams & Links: Perceived Risk",
    section: "E",
    role: "IV4",
    itemIds: ["Q18"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Concern that malicious links could expose personal information (1–5 scale)",
  },
  {
    id: "IV4_COMPOSITE",
    name: "IV4: Scams & Links (Likert Composite Index)",
    section: "E",
    role: "IV4",
    itemIds: ["Q17", "Q18"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of Scams & Links 1–5 scale items (Q17, Q18)",
  },

  // DV: User Privacy (Q19–Q25)
  {
    id: "Q19",
    name: "Privacy: Info Exposure Concern",
    section: "F",
    role: "DV",
    itemIds: ["Q19"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Concern that personal info could be exposed through scams (1–5 scale)",
  },
  {
    id: "Q20",
    name: "Privacy: Account Access Concern",
    section: "F",
    role: "DV",
    itemIds: ["Q20"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Concern about unauthorized access to accounts without permission (1–5 scale)",
  },
  {
    id: "Q21",
    name: "Privacy: Misuse of Info Concern",
    section: "F",
    role: "DV",
    itemIds: ["Q21"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Worry that personal info could be misused for fraud/identity theft (1–5 scale)",
  },
  {
    id: "Q22",
    name: "Privacy: General Risk Perception",
    section: "F",
    role: "DV",
    itemIds: ["Q22"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Perception that privacy is at risk interacting with unknown entities online (1–5 scale)",
  },
  {
    id: "Q23",
    name: "Privacy: Avoidance Behaviour",
    section: "F",
    role: "DV",
    itemIds: ["Q23"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Avoiding sharing personal info online due to scam worries (1–5 scale)",
  },
  {
    id: "Q24",
    name: "Privacy: Settings Adjustment Behaviour",
    section: "F",
    role: "DV",
    itemIds: ["Q24"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Regularly checking/adjusting privacy settings to protect info (1–5 scale)",
  },
  {
    id: "Q25",
    name: "Privacy: Overall Perceived Impact",
    section: "F",
    role: "DV",
    itemIds: ["Q25"],
    type: "single_item",
    measurementLevel: "ordinal",
    description: "Social engineering threats reduced sense of privacy online (1–5 scale)",
  },
  {
    id: "DV_CONCERN",
    name: "DV: Privacy Concerns Subscale (Q19–Q22)",
    section: "F",
    role: "DV",
    itemIds: ["Q19", "Q20", "Q21", "Q22"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of privacy concern items Q19, Q20, Q21, Q22",
  },
  {
    id: "DV_BEHAVIOUR",
    name: "DV: Privacy Protection Behaviour Subscale (Q23–Q24)",
    section: "F",
    role: "DV",
    itemIds: ["Q23", "Q24"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score of privacy protection behaviour items Q23, Q24",
  },
  {
    id: "DV_COMPOSITE",
    name: "DV: User Privacy Overall Scale (Q19–Q25)",
    section: "F",
    role: "DV",
    itemIds: ["Q19", "Q20", "Q21", "Q22", "Q23", "Q24", "Q25"],
    type: "composite_mean",
    measurementLevel: "interval",
    description: "Mean score across all 7 User Privacy items (Q19–Q25)",
  },
];

/**
 * Extract vector of values for a variable definition from session answers
 */
export function extractVariableValues(
  variable: VariableDefinition,
  sessions: { answers: Record<string, { value: number | null; status?: string }> }[],
): (number | null)[] {
  return sessions.map((s) => {
    if (variable.type === "single_item") {
      const ans = s.answers[variable.itemIds[0]];
      return ans && ans.value !== null && typeof ans.value === "number"
        ? ans.value
        : null;
    } else if (variable.type === "composite_mean") {
      const vals: number[] = [];
      for (const id of variable.itemIds) {
        const ans = s.answers[id];
        if (ans && ans.value !== null && typeof ans.value === "number") {
          vals.push(ans.value);
        }
      }
      if (vals.length === 0) return null;
      // Require at least 50% answered items for mean composite
      if (vals.length < Math.ceil(variable.itemIds.length / 2)) return null;
      return vals.reduce((a, b) => a + b, 0) / vals.length;
    } else {
      // composite sum
      let sum = 0;
      let count = 0;
      for (const id of variable.itemIds) {
        const ans = s.answers[id];
        if (ans && ans.value !== null && typeof ans.value === "number") {
          sum += ans.value;
          count++;
        }
      }
      return count === variable.itemIds.length ? sum : null;
    }
  });
}

// ============================================================================
// 8. NON-PARAMETRIC REPEATED MEASURES (FRIEDMAN & WILCOXON SIGNED-RANK)
// ============================================================================

export type WilcoxonComparison = {
  groupA: string;
  groupB: string;
  nameA: string;
  nameB: string;
  meanA: number;
  meanB: number;
  wStatistic: number;
  zScore: number;
  pValueUnadjusted: number;
  pValueBonferroni: number;
  effectSizeR: number; // |Z| / sqrt(N)
  significant: boolean; // pValueBonferroni < alpha
};

export type FriedmanResult = {
  n: number; // Number of participants with complete repeated measures
  k: number; // Number of threat conditions (e.g. 5)
  df: number; // k - 1
  qStatistic: number; // Friedman chi-square statistic Q
  pValue: number;
  kendallW: number; // Effect size W (0..1)
  conditionRanks: Array<{
    threatKey: string;
    threatName: string;
    rankSum: number;
    meanRank: number;
    meanRisk: number;
    stdDevRisk: number;
  }>;
  significant: boolean; // p < alpha
  postHocComparisons: WilcoxonComparison[];
  interpretation: string;
};

/**
 * Calculates Wilcoxon Signed-Rank Test for two paired / repeated samples
 * with continuity correction and optional Bonferroni adjustment.
 */
export function calculateWilcoxonSignedRank(
  sampleA: number[],
  sampleB: number[],
  alpha = 0.05,
  bonferroniComparisons = 1,
): {
  wStatistic: number;
  zScore: number;
  pValueUnadjusted: number;
  pValueBonferroni: number;
  effectSizeR: number;
  significant: boolean;
} {
  const diffs: number[] = [];
  for (let i = 0; i < Math.min(sampleA.length, sampleB.length); i++) {
    const d = sampleA[i] - sampleB[i];
    if (d !== 0) {
      diffs.push(d);
    }
  }

  const Nr = diffs.length;
  if (Nr === 0) {
    return {
      wStatistic: 0,
      zScore: 0,
      pValueUnadjusted: 1.0,
      pValueBonferroni: 1.0,
      effectSizeR: 0,
      significant: false,
    };
  }

  const absDiffs = diffs.map((d) => Math.abs(d));
  const ranks = rankArray(absDiffs);

  let wPlus = 0;
  let wMinus = 0;
  for (let i = 0; i < Nr; i++) {
    if (diffs[i] > 0) {
      wPlus += ranks[i];
    } else {
      wMinus += ranks[i];
    }
  }

  const wStat = Math.min(wPlus, wMinus);
  const meanW = (Nr * (Nr + 1)) / 4;
  const varW = (Nr * (Nr + 1) * (2 * Nr + 1)) / 24;
  const seW = Math.sqrt(varW);

  // Z-score with continuity correction (0.5)
  const z = seW > 0 ? (wPlus - meanW - 0.5 * Math.sign(wPlus - meanW)) / seW : 0;
  const pUnadjusted = 2 * (1 - normalCdf(Math.abs(z)));
  const pBonf = Math.min(1.0, Math.max(0.0, pUnadjusted * bonferroniComparisons));
  const effectR = Nr > 0 ? Math.abs(z) / Math.sqrt(Nr) : 0;

  return {
    wStatistic: Number(wStat.toFixed(2)),
    zScore: Number(z.toFixed(3)),
    pValueUnadjusted: Number(pUnadjusted.toFixed(4)),
    pValueBonferroni: Number(pBonf.toFixed(4)),
    effectSizeR: Number(effectR.toFixed(3)),
    significant: pBonf < alpha,
  };
}

/**
 * Calculates Friedman Repeated-Measures Test across threat categories
 * followed by pairwise Wilcoxon Signed-Rank post-hoc tests with Bonferroni correction.
 */
export function calculateFriedmanTest(
  sessions: Session[],
  alpha = 0.05,
  includeProposed = false,
): FriedmanResult {
  const activeMissions = missions.filter((m) => includeProposed || !m.proposed);
  const k = activeMissions.length;

  type ParticipantThreatScores = {
    scores: number[];
  };

  const participants: ParticipantThreatScores[] = [];

  for (const s of sessions) {
    const attempts = s.attempts ?? [];
    const firstAttempts = attempts.filter(
      (a) => a.attemptNumber === 1 && a.selectedAction !== null,
    );

    const threatScores: number[] = [];
    let complete = true;

    for (const m of activeMissions) {
      const inThreat = firstAttempts.filter((a) => a.primaryIV === m.iv);
      if (inThreat.length === 0) {
        complete = false;
        break;
      }
      const totalRisk = inThreat.reduce((sum, a) => sum + (a.privacyRiskScore ?? 0), 0);
      const meanRisk = totalRisk / inThreat.length;
      threatScores.push(meanRisk);
    }

    if (complete && threatScores.length === k) {
      participants.push({ scores: threatScores });
    }
  }

  const N = participants.length;
  const df = k - 1;

  if (N < 2) {
    return {
      n: N,
      k,
      df,
      qStatistic: 0,
      pValue: 1.0,
      kendallW: 0,
      conditionRanks: activeMissions.map((m) => ({
        threatKey: m.id,
        threatName: m.name,
        rankSum: 0,
        meanRank: 0,
        meanRisk: 0,
        stdDevRisk: 0,
      })),
      significant: false,
      postHocComparisons: [],
      interpretation:
        "Insufficient paired responses across all threat categories to perform Friedman repeated-measures test (minimum N = 2 required).",
    };
  }

  // Compute ranks within each participant row
  const rankSums = new Array<number>(k).fill(0);
  const rawScoresByThreat = Array.from({ length: k }, () => new Array<number>());

  for (const p of participants) {
    const rowRanks = rankArray(p.scores);
    for (let j = 0; j < k; j++) {
      rankSums[j] += rowRanks[j];
      rawScoresByThreat[j].push(p.scores[j]);
    }
  }

  // Friedman Q statistic
  const sumRanksSq = rankSums.reduce((sum, r) => sum + r * r, 0);
  const qStat = (12 / (N * k * (k + 1))) * sumRanksSq - 3 * N * (k + 1);
  const qClean = Math.max(0, qStat);
  const pValue = chiSquarePValue(qClean, df);
  const kendallW = Math.min(1.0, Math.max(0.0, qClean / (N * (k - 1))));

  // Condition summaries
  const conditionRanks = activeMissions.map((m, j) => {
    const vals = rawScoresByThreat[j];
    const mean = vals.reduce((a, b) => a + b, 0) / (vals.length || 1);
    const variance =
      vals.length > 1
        ? vals.reduce((sum, v) => sum + (v - mean) * (v - mean), 0) / (vals.length - 1)
        : 0;
    return {
      threatKey: m.id,
      threatName: m.name,
      rankSum: Number(rankSums[j].toFixed(2)),
      meanRank: Number((rankSums[j] / N).toFixed(2)),
      meanRisk: Number(mean.toFixed(2)),
      stdDevRisk: Number(Math.sqrt(variance).toFixed(2)),
    };
  });

  // Post-hoc pairwise Wilcoxon comparisons with Bonferroni correction
  const numComparisons = (k * (k - 1)) / 2;
  const postHocComparisons: WilcoxonComparison[] = [];

  for (let i = 0; i < k; i++) {
    for (let j = i + 1; j < k; j++) {
      const sampleA = rawScoresByThreat[i];
      const sampleB = rawScoresByThreat[j];
      const res = calculateWilcoxonSignedRank(sampleA, sampleB, alpha, numComparisons);
      postHocComparisons.push({
        groupA: activeMissions[i].id,
        groupB: activeMissions[j].id,
        nameA: activeMissions[i].name,
        nameB: activeMissions[j].name,
        meanA: conditionRanks[i].meanRisk,
        meanB: conditionRanks[j].meanRisk,
        wStatistic: res.wStatistic,
        zScore: res.zScore,
        pValueUnadjusted: res.pValueUnadjusted,
        pValueBonferroni: res.pValueBonferroni,
        effectSizeR: res.effectSizeR,
        significant: res.significant,
      });
    }
  }

  const isSig = pValue < alpha;
  const interp = isSig
    ? `Friedman repeated-measures test indicated a statistically significant difference in simulated privacy risk across the ${k} threat categories (Chi-square Q(${df}) = ${qClean.toFixed(2)}, p = ${pValue < 0.001 ? "< .001" : pValue.toFixed(3)}, Kendall's W = ${kendallW.toFixed(3)}, N = ${N}). Post-hoc pairwise Wilcoxon tests with Bonferroni correction identify which specific threat pairs differ significantly.`
    : `Friedman repeated-measures test found no statistically significant difference in simulated privacy risk across the ${k} threat categories at alpha = ${alpha} (Chi-square Q(${df}) = ${qClean.toFixed(2)}, p = ${pValue.toFixed(3)}, Kendall's W = ${kendallW.toFixed(3)}, N = ${N}).`;

  return {
    n: N,
    k,
    df,
    qStatistic: Number(qClean.toFixed(2)),
    pValue: Number(pValue.toFixed(4)),
    kendallW: Number(kendallW.toFixed(3)),
    conditionRanks,
    significant: isSig,
    postHocComparisons,
    interpretation: interp,
  };
}

