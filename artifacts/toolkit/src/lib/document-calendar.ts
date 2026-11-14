const escape = (s: string) =>
  s
    .replace(/\\/g, "\\\\")
    .replace(/\r?\n/g, "\\n")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,");
export function documentReminder(
  date: string,
  title: string,
  evidence: string,
  uid: string,
  created = new Date(),
): string {
  if (!/^\d{4}-\d{2}-\d{2}$/.test(date))
    throw Error("Choose an explicit date for this reminder.");
  const start = new Date(date + "T00:00:00Z");
  if (
    !Number.isFinite(start.getTime()) ||
    start.toISOString().slice(0, 10) !== date
  )
    throw Error("Invalid calendar date.");
  if (
    !title.trim() ||
    title.length > 200 ||
    evidence.length > 10000 ||
    !/^[a-zA-Z0-9-]+$/.test(uid)
  )
    throw Error("Invalid reminder details.");
  const end = new Date(start.getTime() + 86400000),
    stamp = created
      .toISOString()
      .replace(/[-:]/g, "")
      .replace(/\.\d{3}/, "");
  const lines = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//ToolzCraft//Document reminder//EN",
    "CALSCALE:GREGORIAN",
    "BEGIN:VEVENT",
    "UID:" + uid + "@toolzcraft.com",
    "DTSTAMP:" + stamp,
    "DTSTART;VALUE=DATE:" + date.replaceAll("-", ""),
    "DTEND;VALUE=DATE:" + end.toISOString().slice(0, 10).replaceAll("-", ""),
    "SUMMARY:" + escape(title),
    "DESCRIPTION:" + escape(evidence),
    "BEGIN:VALARM",
    "TRIGGER:-P1D",
    "ACTION:DISPLAY",
    "DESCRIPTION:Review document deadline",
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return (
    lines
      .map((line) => {
        let folded = "",
          part = "";
        for (const c of line) {
          if (new TextEncoder().encode(part + c).length > 73) {
            folded += part + "\r\n ";
            part = "";
          }
          part += c;
        }
        return folded + part;
      })
      .join("\r\n") + "\r\n"
  );
}
