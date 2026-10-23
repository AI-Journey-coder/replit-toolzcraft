import { Link } from "wouter";

const titles: Record<string, string> = { about: "About ToolzCraft", contact: "Contact", privacy: "Privacy policy", terms: "Terms of use" };

export function InformationPage({ page }: { page: string }) {
  const email = import.meta.env.VITE_CONTACT_EMAIL;
  const operator=import.meta.env.VITE_OPERATOR_NAME;
  return <article className="max-w-3xl mx-auto space-y-6 leading-relaxed">
    <h1 className="text-3xl font-bold">{titles[page]}</h1>
    {operator&&<p>Operated by {operator}{import.meta.env.VITE_OPERATOR_JURISDICTION?` · ${import.meta.env.VITE_OPERATOR_JURISDICTION}`:""}.</p>}
    {page==="contact"&&import.meta.env.VITE_OPERATOR_ADDRESS&&<p>{import.meta.env.VITE_OPERATOR_ADDRESS}</p>}
    {page === "about" && <>
      <p>ToolzCraft brings small, focused utilities together: convert data, inspect code, calculate values, and work with images and documents. Choose a category or search for a specific task, then use the tool and its guidance together.</p>
      <h2 className="text-xl font-semibold">How the tools work</h2>
      <p>Most tools process inputs in your browser without an account. AI tools send submitted text to the application server and its configured AI provider. Currency conversion retrieves rates from an external service. Network access may also be needed to load application libraries and OCR language data. The CTC calculator uses a network country lookup, with a manual override.</p>
      <h2 className="text-xl font-semibold">Check your results</h2>
      <p>Utilities simplify repetitive work, but inputs, rounding, browser support and format differences can affect results. Keep original files and verify important output. Guides describe examples and limits; please report reproducible errors through our contact page.</p>
      <p><Link className="underline" href="/contact">Contact the project</Link> · <Link className="underline" href="/privacy">Read about data handling</Link></p>
    </>}
    {page === "contact" && <>
      <p>For a tool error, include the tool name, browser version, steps to reproduce and a small non-sensitive example. Do not send passwords, authentication tokens, private documents or service-account keys.</p>
      {email ? <p>Email: <a className="underline" href={`mailto:${email}`}>{email}</a></p> : <p>This local preview has no support email configured. You can review the project or report a non-sensitive software issue using the repository below. For a private data request, the site operator must configure a private contact channel before publishing.</p>}
      <p><a className="underline" href="https://github.com/AI-Journey-coder/replit-toolzcraft/issues">Project issues on GitHub</a> (public; requires a GitHub account). Do not post personal information in public issues.</p>
    </>}
    {page === "privacy" && <>
      <p>Last updated: 11 September 2026. This policy describes the features in this version of ToolzCraft. Data is used to provide requested tools, optional sign-in, service security and selected preferences. Online service providers may process data in other countries under their own arrangements. The operator must review it against the services enabled on the published site.</p>
      <h2 className="text-xl font-semibold">Tool inputs and external services</h2>
      <p>Most tool calculations and file transformations happen in your browser. AI analysis sends the text you submit, your question and selected options to our server and its configured AI provider (Gemini by default, or OpenAI). Provider processing and retention are subject to that provider's terms. The application does not intentionally save AI document text in its database. Infrastructure and provider logs may be retained separately. Do not submit confidential information.</p>
      <p>Currency tools request external exchange-rate data. Historical purchasing-power comparisons request public CPI data from the World Bank using the selected country and years; the amount you enter is calculated locally. OCR resources and other network requests expose connection information such as your IP address to the service receiving them. PDF, image, video, CSV and ZIP operations process your selected files locally. SQL conversion runs a browser-based parser without sending your SQL to a database or remote conversion service.</p>
      <h2 className="text-xl font-semibold">Preferences and country lookup</h2><p>Favourites, currency and logo are saved in this browser profile until reset or cleared. They do not sync to accounts. The CTC calculator requests an approximate country from country.is; this service receives your IP address and connection information, but not salary inputs. You can override the suggested country. It does not determine tax residence.</p>
      <h2 className="text-xl font-semibold">Optional accounts</h2>
      <p>Google and phone sign-in use Firebase Authentication. Firebase processes authentication information, including phone numbers for phone sign-in. Our database stores your Firebase identifier, available profile details (name, email, phone number and photo URL), role, plan, account status and login timestamps. Firebase manages browser authentication persistence. Our application does not store your Google password or SMS verification code.</p>
      <h2 className="text-xl font-semibold">Usage and server logs</h2>
      <p>{import.meta.env.VITE_ENABLE_USAGE_TRACKING === "true" ? "Tool-visit tracking is enabled. We record the tool identifier and time, and associate a visit with your account when a valid sign-in token is supplied." : "Tool-visit tracking is disabled in this build."} API requests may produce operational logs. The server uses IP addresses for rate limits; its normal request logger records request identifiers, methods, paths and response status.</p>
      <h2 className="text-xl font-semibold">Subscriptions and AI credits</h2>
      <p>When you subscribe, Razorpay processes your payment details and recurring-payment authorization. We store subscription, invoice-payment identifiers, billing periods, cancellation status and credit usage linked to your account. We do not store card numbers or AI document text in the credit ledger. The Razorpay checkout script loads when you choose to subscribe. Payment and accounting records may need to be retained after account deletion where required.</p>
      <h2 className="text-xl font-semibold">Advertising and storage</h2>
      <p>This version does not load Google AdSense or advertising cookies. Before advertising is enabled, this policy must be updated to identify the actual advertising services, their use of cookies and identifiers, data sharing, and available privacy choices. Required consent controls must be in place before those services run.</p>
      <h2 className="text-xl font-semibold">Retention and requests</h2>
      <p>The current application has no automatic expiry for database account records or tracked usage. Signing out clears the active browser sign-in; it does not delete database records. Contact the operator privately to request access, correction or deletion. Browser storage can also be cleared through your browser settings. Applicable law may provide rights to access, correct, erase, restrict or object to processing, or complain to your local regulator. Requests and lawful retention exceptions depend on the applicable jurisdiction.</p>
      <p><Link href="/data-requests" className="underline">How to make a privacy request</Link> · <Link href="/cookies" className="underline">Cookies and browser storage</Link></p>
    </>}
    {page === "terms" && <>
      <p>ToolzCraft provides general-purpose utilities. Use the service only for lawful tasks and only with information you are entitled to process. Do not attempt to disrupt the service, bypass access controls or abuse third-party services.</p>
      <p>Keep backups and inspect generated output before using it. Calculations are estimates and are not financial, legal or other professional advice. AI output may be incomplete or inaccurate. Encoding or decoding a value does not establish that it is authentic or secure.</p>
      <p>Pro Monthly costs ₹199 INR per month and includes 100 AI credits per paid billing cycle, without rollover or automatic overage charges. A successful AI request uses one credit within published input/output limits. Three free lifetime credits are shared across AI tools. Failed processing restores the reserved credit. Recurring billing continues until cancelled or the subscription reaches its stated cycle limit. Cancel renewal on the subscriptions page to stop future charges; paid access continues until its expiry. Contact support@toolzcraft.com for billing problems or refund requests. Cancellation alone does not issue a refund. Refunded or disputed payments suspend access funded by those payments. Statutory consumer rights remain unaffected.</p>
      <p>Features and availability may change. No uptime or error-free-result guarantee is offered. These terms do not exclude rights or responsibilities that cannot be excluded under applicable law.</p>
      <p>You retain your rights in your inputs. Submitting data to an online feature authorizes the processing needed to provide that feature, as described in the <Link className="underline" href="/privacy">privacy policy</Link>.</p>
    </>}
  <nav className="flex flex-wrap gap-4 border-t pt-5"><Link className="underline" href="/compliance">All policies</Link><Link className="underline" href="/disclaimer">Tool result disclaimer</Link><Link className="underline" href="/editorial-policy">Sources and corrections</Link></nav>
  </article>;
}

