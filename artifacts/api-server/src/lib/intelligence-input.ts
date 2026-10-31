import { createHash } from "node:crypto";
import {
  ACTIONS,
  DOCUMENT_TYPES,
  validateSources,
  validateConversation,
  type IntelligenceAction,
  type DocumentType,
} from "@workspace/document-intelligence";
export function intelligenceInput(body: any) {
  const documents = validateSources(body?.documents);
  const history = validateConversation(body?.history);
  if (history.length && body.action !== "questions")
    throw Error("Conversation context is only supported for questions.");
  if (
    !ACTIONS.includes(body.action) ||
    !DOCUMENT_TYPES.includes(body.documentType) ||
    typeof body.question !== "string" ||
    body.question.length > 2000
  )
    throw Error("Invalid analysis action or question.");
  if (
    ["questions", "checklist", "translate"].includes(body.action) &&
    !body.question.trim()
  )
    throw Error("Enter your question or checklist.");
  if (body.action === "compare" && documents.length !== 2)
    throw Error("Choose exactly two documents for comparison.");
  if (
    ["semantic_compare", "reconcile"].includes(body.action) &&
    documents.length < 2
  )
    throw Error("Select at least two documents for this analysis.");
  const length =
    documents.reduce(
      (n, d) => n + d.pages.reduce((m, p) => m + p.text.length, 0),
      0,
    ) +
    body.question.length +
    history.reduce((n, t) => n + t.question.length + t.answer.length, 0);
  if (length > 24000)
    throw Error("Select up to 24,000 characters including your question.");
  const canonical = JSON.stringify({
    version: 1,
    documents,
    action: body.action,
    documentType: body.documentType,
    question: body.question,
    history,
  });
  return {
    documents,
    action: body.action as IntelligenceAction,
    documentType: body.documentType as DocumentType,
    question: body.question as string,
    history,
    canonical,
    credits: Math.max(1, Math.ceil(length / 6000)),
    fingerprint: createHash("sha256").update(canonical).digest("hex"),
  };
}
