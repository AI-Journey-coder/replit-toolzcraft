import { request } from "node:https";
import { lookup } from "node:dns/promises";
import { BlockList, isIP } from "node:net";
import { createHmac } from "node:crypto";
export const blocked = new BlockList();
for (const [network, bits] of [
  ["0.0.0.0", 8],
  ["10.0.0.0", 8],
  ["127.0.0.0", 8],
  ["169.254.0.0", 16],
  ["172.16.0.0", 12],
  ["192.168.0.0", 16],
  ["100.64.0.0", 10],
  ["198.18.0.0", 15],
  ["224.0.0.0", 4],
  ["240.0.0.0", 4],
] as const)
  blocked.addSubnet(network, bits, "ipv4");
for (const [network, bits] of [
  ["::", 128],
  ["::1", 128],
  ["fc00::", 7],
  ["fe80::", 10],
  ["ff00::", 8],
  ["::ffff:0:0", 96],
  ["2002::", 16],
  ["2001::", 32],
  ["2001:db8::", 32],
  ["64:ff9b::", 96],
] as const)
  blocked.addSubnet(network, bits, "ipv6");
export function approvedWebhook(value: string) {
  return approvedDestination(value,process.env.DOCUMENT_WEBHOOK_HOSTS || '');
}
export function approvedDestination(value: string, hosts: string) {
  const url = new URL(value);
  const allowed = hosts
    .split(",")
    .map((s) => s.trim().toLowerCase())
    .filter(Boolean);
  if (
    url.protocol !== "https:" ||
    url.username ||
    url.password ||
    url.hash ||
    (url.port && url.port !== "443") ||
    isIP(url.hostname) ||
    !allowed.includes(url.hostname.toLowerCase())
  )
    throw Error(
      "Webhook requires an administrator-approved HTTPS hostname, with no credentials or custom port.",
    );
  return url;
}
export function webhookSigningKey(workflowId: string) {
  const key = process.env.DOCUMENT_WORKSPACE_KEY;
  if (!key) throw Error("Workspace key unavailable.");
  return createHmac("sha256", Buffer.from(key, "base64"))
    .update("webhook:" + workflowId)
    .digest("hex");
}
export async function deliverDocumentEvent(
  urlText: string,
  workflowId: string,
  event: unknown,
) {
  const url = approvedWebhook(urlText);
  let timer: ReturnType<typeof setTimeout> | undefined;
  const addresses = await Promise.race([
    lookup(url.hostname, { all: true }),
    new Promise<never>((_, reject) => {
      timer = setTimeout(() => reject(Error("Webhook DNS timeout")), 5000);
    }),
  ]).finally(() => clearTimeout(timer));
  if (
    !addresses.length ||
    addresses.some((a) =>
      blocked.check(a.address, a.family === 4 ? "ipv4" : "ipv6"),
    )
  )
    throw Error("Webhook resolves to a non-public address.");
  const body = JSON.stringify(event),
    timestamp = String(Math.floor(Date.now() / 1000)),
    signature = createHmac("sha256", webhookSigningKey(workflowId))
      .update(timestamp + "." + body)
      .digest("hex"),
    pinned = addresses[0];
  await new Promise<void>((resolve, reject) => {
    const req = request(
      url,
      {
        method: "POST",
        timeout: 5000,
        family: pinned.family,
        lookup: (_host, _options, callback) =>
          callback(null, pinned.address, pinned.family),
        headers: {
          "Content-Type": "application/json",
          "Content-Length": Buffer.byteLength(body),
          "X-ToolzCraft-Timestamp": timestamp,
          "X-ToolzCraft-Signature": signature,
        },
      },
      (res) => {
        res.resume();
        if (res.statusCode && res.statusCode >= 200 && res.statusCode < 300)
          resolve();
        else
          reject(
            Error("Webhook rejected the event; redirects are not followed."),
          );
      },
    );
    req.on("timeout", () => req.destroy(Error("Webhook timeout")));
    req.on("error", reject);
    req.end(body);
  });
}
