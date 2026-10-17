import type { Question } from "./types";
import type { aggregateQuestion } from "./analytics";
const esc = (s: string) =>
  s.replace(
    /[&<>"']/g,
    (c) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[c]!,
  );
const wrap = (s: string, n: number) => {
  const lines: string[] = [];
  for (const w of s.split(" ")) {
    if (!lines.length || lines[lines.length - 1].length + w.length + 1 > n)
      lines.push(w);
    else lines[lines.length - 1] += " " + w;
  }
  return lines;
};
export function chartSvg(
  q: Question,
  a: ReturnType<typeof aggregateQuestion>,
  filters: string,
) {
  const title = wrap(q.id + ". " + q.text, 90),
    filterLines = wrap("Filters: " + filters, 110),
    top = 85 + title.length * 23 + filterLines.length * 18;
  const rows = a.rows
    .map((r, i) => {
      const y = top + i * 76;
      return (
        wrap(r.label, 36)
          .map(
            (l, j) =>
              '<text x="30" y="' +
              (y + j * 17) +
              '" font-size="14">' +
              esc(l) +
              "</text>",
          )
          .join("") +
        '<rect x="330" y="' +
        (y - 12) +
        '" width="' +
        r.percentage * 4.9 +
        '" height="24" rx="4" fill="#6557c8"/><text x="850" y="' +
        y +
        '" font-size="14">' +
        r.count +
        " (" +
        r.percentage.toFixed(1) +
        "%)</text>"
      );
    })
    .join("");
  return (
    '<svg xmlns="http://www.w3.org/2000/svg" width="1000" height="' +
    (top + a.rows.length * 76 + 40) +
    '"><rect width="100%" height="100%" fill="white"/><g font-family="Arial,sans-serif" fill="#17243d">' +
    title
      .map(
        (t, i) =>
          '<text x="30" y="' +
          (35 + i * 23) +
          '" font-size="19" font-weight="bold">' +
          esc(t) +
          "</text>",
      )
      .join("") +
    '<text x="30" y="' +
    (48 + title.length * 23) +
    '" font-size="14">' +
    esc(q.dimension ?? q.variable) +
    " · valid n=" +
    a.validN +
    " · missing=" +
    a.missingN +
    "</text>" +
    filterLines
      .map(
        (l, i) =>
          '<text x="30" y="' +
          (72 + title.length * 23 + i * 18) +
          '" font-size="12">' +
          esc(l) +
          "</text>",
      )
      .join("") +
    rows +
    '<text x="30" y="' +
    (top + a.rows.length * 76 + 13) +
    '" font-size="12">Percentages use valid nonmissing answers. Instrument 1.0.0 · Cyber Campus</text></g></svg>'
  );
}
export async function downloadChart(
  q: Question,
  a: ReturnType<typeof aggregateQuestion>,
  filters: string,
  format: "svg" | "png",
) {
  const svg = chartSvg(q, a, filters),
    url = URL.createObjectURL(
      new Blob([svg], { type: "image/svg+xml;charset=utf-8" }),
    );
  let download = url;
  if (format === "png") {
    const image = new Image();
    await new Promise<void>((resolve, reject) => {
      image.onload = () => resolve();
      image.onerror = reject;
      image.src = url;
    });
    const canvas = document.createElement("canvas");
    canvas.width = image.width * 2;
    canvas.height = image.height * 2;
    const ctx = canvas.getContext("2d")!;
    ctx.scale(2, 2);
    ctx.drawImage(image, 0, 0);
    download = canvas.toDataURL("image/png");
  }
  const link = document.createElement("a");
  link.href = download;
  link.download = q.id + "-response-distribution." + format;
  link.click();
  URL.revokeObjectURL(url);
}
