import "reflect-metadata";
import { X509Certificate, SubjectAlternativeNameExtension } from "@peculiar/x509";

export interface CertInfo {
  subject: string;
  issuer: string;
  validFrom: string;
  validTo: string;
  serialNumber: string;
  signatureAlgorithm: string;
  publicKeyAlgorithm: string;
  fingerprintSha256: string;
  san: string[];
  isExpired: boolean;
}

export async function decodeCertificate(pem: string): Promise<CertInfo> {
  if (pem.length > 100_000) throw new Error("Certificate is too large (maximum 100 KB).");
  const cert = new X509Certificate(pem);
  const fingerprint = await cert.getThumbprint("SHA-256");
  return {
    subject: cert.subject,
    issuer: cert.issuer,
    validFrom: cert.notBefore.toISOString(),
    validTo: cert.notAfter.toISOString(),
    serialNumber: cert.serialNumber,
    signatureAlgorithm: cert.signatureAlgorithm.name,
    publicKeyAlgorithm: cert.publicKey.algorithm.name,
    fingerprintSha256: Array.from(new Uint8Array(fingerprint), b => b.toString(16).padStart(2, "0")).join(":").toUpperCase(),
    san: cert.getExtension(SubjectAlternativeNameExtension)?.names.items.map(n => n.value) ?? [],
    isExpired: cert.notAfter.getTime() < Date.now(),
  };
}

