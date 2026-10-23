import { Link } from "wouter";
import { TOOLS, type Tool } from "@/lib/tools-registry";

const guidance: Record<string, [string, string]> = {
  media: ["Start with a short sample video, choose the output resolution and compare playback quality with the original.", "Encoding takes time and memory. A smaller resolution and higher compression may reduce quality; already compressed media may grow."],
  files: ["Choose the files you want to share together, create an archive and inspect the downloaded ZIP.", "ZIP works best on text and repetitive data. JPEG, MP4 and other compressed formats often cannot be reduced much further."],
  finance: ["Check the currency, period and rate convention before entering amounts. Change one assumption at a time to compare scenarios.", "Rounding, taxes, fees and lender conventions can change real outcomes. Verify estimates against the actual product terms."],
  converters: ["Choose the source and destination units before entering a value. Check whether the quantity is a length, area, volume or rate.", "Unit conversions and live currency rates have different precision and update limits. Check the displayed units and rate date."],
  code: ["Start with a short valid snippet and inspect the formatted or transformed output before copying it into your project.", "Formatting does not prove that a program is correct or secure. Run the result through your project's compiler and tests."],
  text: ["Paste a small text sample, choose the transformation, and compare the output with the original before applying it to a full document.", "Whitespace, punctuation, Unicode and language conventions can affect counts and transformations."],
  math: ["Enter values in the units shown. Try a simple case you can calculate manually before using a larger input.", "Floating-point arithmetic can introduce rounding. Check domain restrictions and avoid treating rounded output as an exact proof."],
  security: ["Use sample data first and select the algorithm or format appropriate to your task. Keep generated credentials private.", "A decoded token is not a verified token. Encoding is not encryption; obsolete hashes and ciphers are unsuitable for protecting secrets."],
  webdev: ["Adjust the controls and inspect the preview. Copy the result into a small test page before using it in a larger site.", "Browser behavior, contrast and responsive layouts need testing in the environment where the result will be used."],
  data: ["Begin with a few representative records, including an empty field and a non-ASCII character. Check field names and types after conversion.", "Formats differ in their treatment of nulls, dates, comments and numbers. Converting between them can lose information."],
  devtools: ["Use a non-sensitive example and inspect each generated field before copying the output to your development environment.", "Generated commands and decoded values need independent review. Never paste production tokens or credentials into examples."],
  formatters: ["Choose the intended language or output format. Start with a small input and compare the generated result with your project's conventions.", "Generated code is a starting point. Type-check it and review assumptions such as optional fields and date formats."],
  sql: ["Select the intended database dialect where available and inspect identifiers, types and quoting in the generated SQL.", "Test statements against a disposable database first. Dialect conversion does not guarantee equivalent behavior."],
  encoding: ["Select the source representation before converting. For example, decimal 255 corresponds to hexadecimal FF and binary 11111111.", "Check character encoding, valid digits and number size. Classical letter ciphers provide no modern confidentiality."],
  datetime: ["Check whether the tool expects local time, UTC, seconds or milliseconds. Include the timezone when comparing results.", "Daylight-saving changes can make local times ambiguous. Timestamp length is only a heuristic for identifying units."],
  cssdesign: ["Adjust one style property at a time, inspect the preview and copy the CSS into a test element.", "Verify the result on small screens and with keyboard navigation. A visual preview alone is not an accessibility audit."],
  webstandards: ["Select directives appropriate to your application and read the generated configuration before applying it.", "Headers and server rules depend on your hosting environment. Test changes in staging to avoid blocking legitimate requests."],
  reference: ["Search for the exact character, code or feature and compare the entry with the context in which you will use it.", "References are concise aids. Consult the applicable official specification for compatibility and edge cases."],
  image: ["Choose a sample image, set the desired dimensions or output format, then inspect the downloaded result.", "Compression, format changes and resizing can lose detail or metadata. Preserve the original image."],
  pdf: ["Select a copy of your PDF, choose the pages or operation and inspect the downloaded document before sharing it.", "Encrypted PDFs, embedded fonts and complex layouts may need specialized software. Preserve originals and check every affected page."],
  ocr: ["Use a clear, upright scan and select the document language. Compare extracted text with the source image.", "Handwriting, tables, low contrast and small print reduce accuracy. PDF OCR is limited to 20 pages per run."],
  ai: ["Submit only text you can share with the configured AI provider. Ask a focused question or choose the required analysis task.", "Inputs are limited to 6,000 characters. AI can invent details or miss context; verify the answer against the original document."],
};
const examples: Record<string, string> = {
"saas-break-even":"If your software business costs 1,000 per month and each customer pays 20 per month, you need 50 paying customers to cover those costs. If 5 out of 100 customers leave each month, your monthly churn is 5%. The estimate assumes constant prices and customer loss; it excludes per-customer service costs, taxes and growth spending. Lifetime revenue is not profit.",
"advertising-break-even":"If an order brings in 100 and costs 60 to fulfil, you have 40 left for advertising before making a loss. You need 2.5 in sales for each 1 spent on ads. Return on ad spend (ROAS) is sales divided by ad spending; cost per acquisition (CPA) is the advertising cost to win one order.",
  "contact-duplicate-merger": "Two contacts sharing an email become candidates. Inspect their details, choose which name/company to keep, select that group and preview the merged output. Shared numbers may belong to multiple people; matching is not proof of identity.",
  "contacts-converter": "Import a CSV with Name, Phone and Email columns. Inspect the preview, then download a vCard. Reimport a sample before replacing contacts; the export contains only the fields shown.",
  "whatsapp-link-generator": "Enter a phone number with its international country code and a greeting. Generate the link and QR locally, then test the intended recipient before sharing. No message is sent automatically.",
  "solid-background-remover": "Choose a simple logo on white, select white as the background and start with low tolerance. Check that white areas inside the logo were not unintentionally removed. Download a transparent PNG.",
  "ctc-calculator": "Choose the payroll country and enter annual CTC. Confirm coverage and annual deductions, then compare the gross and net breakdown. Switching to a monthly target solves for CTC while retaining the entered component rules; recheck tax at the resulting salary.",
  "length-converter": "Enter 63 inches: combined output is 5 ft 3 in. Choose Feet + inches and enter 6 and 3 to get 75 inches. Twelve inches make one foot.",
  "pdf-page-organizer": "For a three-page PDF, move page 3 before page 1, uncheck page 2, and download. The result contains original pages 3 and 1 in that order. Rotation and duplication apply to each displayed position independently.",
  "pdf-form-filler": "Upload a blank interactive application form, enter a sample name and select a checkbox. Download once with flattening off to retain editable fields, or on to turn the completed fields into page content.",
  "pdf-compressor": "Try lossless repacking first. If a scanned PDF remains large, compare image mode at 65% quality. Read the size result and inspect small text in the download; do not replace your original unless the quality is sufficient.",
  "searchable-pdf": "Use a clear scan with a short heading, select its language and create the PDF. In your PDF reader, search for that heading and copy a sentence. A visually correct scan can still have OCR spelling errors in its text layer.",
  "batch-image-processor": "Select three landscape photos, set a 1920-pixel maximum dimension and WebP output. Download the ZIP and compare dimensions and names. Smaller input images are not enlarged.",
  "image-compressor": "Compare JPEG or WebP at 80% quality with the original. Lower quality until the file is small enough without visible artifacts; PNG uses lossless encoding and ignores the quality slider.",
  "csv-cleaner": "The included example contains a duplicate Alice row and a missing Bob amount. With trimming and deduplication enabled, keep one Alice row. Selecting DD/MM/YYYY converts 31/12/2025 to 2025-12-31 without guessing date order.",
  "video-compressor": "Start with a ten-second clip at 720p and compression level 28. Inspect the result for audio synchronization and text readability. If the output is larger, lower the resolution or retain your original.",
  "file-compressor": "Bundle a text file and an image in a ZIP. Expect more compression of the text than the JPEG. The ZIP is an archive, not a replacement image or video format.",
  "money-value-calculator": "At an assumed 4% inflation rate, 100 in the starting year requires approximately 148.02 ten years later to maintain purchasing power. Historical CPI mode instead uses the ratio of two observed annual indexes.",
  "savings-goal-calculator": "With a target of 12,000, no initial savings, one year and a 0% return, the required end-of-month contribution is 1,000. Increasing assumed returns lowers the estimate but introduces investment uncertainty.",
  "real-salary-raise": "A salary increase from 50,000 to 55,000 is a 10% nominal raise. With 4% inflation over the same period, the purchasing-power gain is about 5.77%, not 6%.",
  "sql-dialect-converter": "Convert the sample Oracle grouped SELECT to MySQL: FETCH FIRST becomes LIMIT. For DB2, simple SELECT queries are supported; procedural code and complex expressions are deliberately rejected for manual review.",
  "number-base-converter": "Enter 255 with source base 10. The binary output is 11111111, octal is 377 and hexadecimal is FF. Changing the source base changes how the input digits are interpreted; it does not merely change the output label.",
  "arbitrary-base-converter": "Convert 35 from base 10 to base 36: the result is z. Base 36 uses digits 0–9 followed by letters a–z. Only use digits valid for the selected source base.",
  "json-formatter": 'Try {"name":"Ada","active":true}. Formatting adds layout while preserving the two values. JSON requires double-quoted keys and does not permit trailing commas; a formatter cannot infer what a malformed document was meant to contain.',
  "base64": "The ASCII text Hello encodes as SGVsbG8=. Decode it to confirm the round trip. Base64 represents bytes as text; anyone can decode it, so it must not be used to conceal credentials.",
  "word-counter": "Try the two-word sample Hello world, then add punctuation and a newline. Compare the word and character counts. Reading time is an estimate and depends on the reader and difficulty of the text.",
  "unix-timestamp-converter": "Unix timestamp 0 represents 1970-01-01T00:00:00.000Z. The local-time display may show a different date or hour because it uses your machine's timezone. Confirm whether an input system exports seconds or milliseconds.",
  "merge-pdf": "Choose a one-page document A and a two-page document B. Merge them in that order and check that the result has three pages, with A first. Preserve your source files and verify page order before sharing.",
  "ai-document-qa": 'Try the source text "The meeting is on Tuesday at 10:00" and ask "What time is the meeting?" Check that the answer says 10:00. If you ask for a location, the source contains no answer; do not accept an invented one.',
};
export function ToolGuide({ tool }: { tool: Tool }) {
  const [steps, limits] = guidance[tool.category];
  const related = TOOLS.filter(t => t.category === tool.category && t.slug !== tool.slug).slice(0, 3);
  return <details aria-label={`${tool.name} guidance`} className="w-full space-y-3 pt-4 border-t leading-relaxed">
    <summary className="cursor-pointer font-semibold">How to use this tool · examples & limitations</summary><p>{tool.description}.</p>
    <h3 className="font-semibold">Getting a reliable result</h3><p>{steps}</p>
    {examples[tool.slug] && <><h3 className="font-semibold">Worked example</h3><p>{examples[tool.slug]}</p></>}
    <h3 className="font-semibold">Limitations to check</h3><p>{limits}</p>
    <p className="text-sm">For network services, accounts and optional usage records, see our <Link className="underline" href="/privacy">privacy policy</Link>.</p>
    <h3 className="font-semibold">Related tools</h3><ul className="flex flex-wrap gap-4">{related.map(t => <li key={t.slug}><Link className="underline" href={`/tools/${t.slug}`}>{t.name}</Link></li>)}</ul>
  </details>;
}

