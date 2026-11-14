import { createCipheriv, createDecipheriv, randomBytes } from "node:crypto";
import {
  validateSources,
  validateConversation,
  ACTIONS,
  DOCUMENT_TYPES,
} from "@workspace/document-intelligence";
function key() {
  const value = process.env.DOCUMENT_WORKSPACE_KEY || "";
  if (!/^[A-Za-z0-9+/]{43}=$/.test(value))
    throw Error("Encrypted workspace storage is not configured.");
  const k = Buffer.from(value, "base64");
  if (k.length !== 32) throw Error("Invalid workspace key.");
  return k;
}
export function vaultReady() {
  try {
    key();
    return true;
  } catch {
    return false;
  }
}
export function sealWorkspace(value: unknown, scope: string) {
  const iv = randomBytes(12),
    cipher = createCipheriv("aes-256-gcm", key(), iv);
  cipher.setAAD(Buffer.from(scope));
  const encrypted = Buffer.concat([
    cipher.update(JSON.stringify(value), "utf8"),
    cipher.final(),
  ]);
  return Buffer.concat([iv, cipher.getAuthTag(), encrypted]).toString("base64");
}
export function openWorkspace(value: string, scope: string) {
  const bytes = Buffer.from(value, "base64");
  if (bytes.length < 29 || bytes.length > 400000)
    throw Error("Invalid encrypted workspace.");
  const cipher = createDecipheriv("aes-256-gcm", key(), bytes.subarray(0, 12));
  cipher.setAAD(Buffer.from(scope));
  cipher.setAuthTag(bytes.subarray(12, 28));
  return JSON.parse(
    Buffer.concat([cipher.update(bytes.subarray(28)), cipher.final()]).toString(
      "utf8",
    ),
  );
}
export function workspaceSnapshot(body: any) {
  const documents = validateSources(body?.documents),
    history = validateConversation(body?.history);
  if (
    !ACTIONS.includes(body?.action) ||
    !DOCUMENT_TYPES.includes(body?.documentType) ||
    typeof body?.question !== "string" ||
    body.question.length > 2000
  )
    throw Error("Invalid saved analysis settings.");
  const templates = body.templates ?? [];
  if (
    !Array.isArray(templates) ||
    templates.length > 20 ||
    templates.some(
      (t) =>
        !t ||
        typeof t.name !== "string" ||
        t.name.length > 100 ||
        typeof t.question !== "string" ||
        t.question.length > 2000 ||
        !ACTIONS.includes(t.action),
    )
  )
    throw Error("Invalid saved templates.");
  const reportTemplate = body.reportTemplate ?? {
    title: "Document evidence report",
    introduction: "",
    footer: "",
  };
  if (
    !reportTemplate ||
    typeof reportTemplate.title !== "string" ||
      !["classic","compact","large-print"].includes(reportTemplate.theme ?? "classic") ||
    reportTemplate.title.length > 120 ||
    typeof reportTemplate.introduction !== "string" ||
    reportTemplate.introduction.length > 2000 ||
    typeof reportTemplate.footer !== "string" ||
    reportTemplate.footer.length > 2000
  )
    throw Error("Invalid report template.");
  // Whitelist all fields: original file bytes, passwords, arbitrary model output and tokens are never stored.
  return {
    documents,
    history,
    reportTemplate: {
      title: reportTemplate.title,
      theme: reportTemplate.theme ?? "classic",
      introduction: reportTemplate.introduction,
      footer: reportTemplate.footer,
    },
    action: body.action,
    documentType: body.documentType,
    question: body.question,
    templates: templates.map((t) => ({
      name: t.name,
      question: t.question,
      action: t.action,
    })),
  };
}
