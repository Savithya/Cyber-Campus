import { z } from "zod";
import { questions } from "@/content/questionnaire";
import type { Answers } from "./types";

export const answerSchema = z
  .object({
    value: z.number().int().nullable(),
    status: z.enum(["answered", "skipped", "not_answered"]),
  })
  .strict();

export const answersSchema = z
  .record(z.string(), answerSchema)
  .superRefine((answers, ctx) => {
    for (const key of Object.keys(answers))
      if (!questions.some((q) => q.id === key))
        ctx.addIssue({
          code: "custom",
          message: "Unknown question",
          path: [key],
        });
    for (const q of questions) {
      const a = answers[q.id];
      if (!a) {
        ctx.addIssue({
          code: "custom",
          message: "Missing question state",
          path: [q.id],
        });
        continue;
      }
      if (
        a.status === "answered"
          ? a.value === null || !q.options.some((o) => o.code === a.value)
          : a.value !== null
      )
        ctx.addIssue({
          code: "custom",
          message: "Invalid answer or missing status",
          path: [q.id],
        });
    }
  });

export const blankAnswers = (): Answers =>
  Object.fromEntries(
    questions.map((q) => [q.id, { value: null, status: "not_answered" }]),
  );

export const demographicsSchema = z.object({
  Q1: z.number().int().min(1).max(4).nullable().optional(),
  Q2: z.number().int().min(1).max(4).nullable().optional(),
  Q3: z.number().int().min(1).max(4).nullable().optional(),
  Q4: z.number().int().min(1).max(9).nullable().optional(),
  Q5: z.number().int().min(1).max(4).nullable().optional(),
});

export const startSchema = z
  .object({
    consented: z.boolean(),
    eligible: z.boolean(),
    priorExposure: z.boolean(),
    practice: z.boolean(),
    token: z.string().regex(/^[a-f0-9]{64}$/),
    clientLastCode: z.union([z.string(), z.number()]).nullish(),
  })
  .strict()
  .refine(
    (d) => d.practice || (d.consented && d.eligible),
    "Consent and eligibility are required.",
  );

export const saveSchema = z.object({ answers: answersSchema }).strict();

export const submitSchema = saveSchema.extend({ idempotencyKey: z.uuid() });

export const attemptSchema = z
  .object({
    scenarioId: z.string().regex(/^(PH|PT|IM|SC|DF)0[1-5]$/),
    action: z.string().max(50).nullable(),
    elapsedMs: z.number().int().min(0).max(86400000),
    idempotencyKey: z.uuid(),
  })
  .strict();

export const withdrawalSchema = z
  .object({
    code: z.string().regex(/^(CC-[A-F0-9]{12}|CC-\d{3,}|\d{3,})$/i),
    token: z.string().regex(/^[a-f0-9]{64}$/),
  })
  .strict();
