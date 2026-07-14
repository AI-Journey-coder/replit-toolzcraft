import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/Category";
import { ToolShell } from "@/components/ToolShell";
import { Promo } from "@/pages/Promo";
import NotFound from "@/pages/not-found";

// Finance
import { EmiCalculator, SipCalculator, CompoundInterestCalculator, RoiCalculator, TipCalculator, GstCalculator } from "@/pages/tools/FinanceTools";
import { MortgageCalculator, StartupBreakEven, SaasBreakEven, EcommerceBreakEven, CryptoBreakEven, TimeFormatConverter, ExpenseCategorizer, ChecksumCalculator } from "@/pages/tools/FinanceTools2";
import { BreakEvenCalculator, CommissionCalculator, GroupExpenseSplitter } from "@/pages/tools/CalcTools2";

// Converters
import {
  LengthConverter, WeightConverter, TemperatureConverter,
  SpeedConverter, AreaConverter, VolumeConverter,
  DataStorageConverter, EnergyConverter, PressureConverter,
} from "@/pages/tools/ConverterTools";
import { CurrencyConverter } from "@/pages/tools/CurrencyConverter";

// Code
import { JsonFormatter, Base64Tool, UrlEncodeTool, RegexTester, CodeDiff, JsMinifier, SqlFormatter } from "@/pages/tools/CodeTools";

// Text
import { WordCounter, CaseConverter, LoremIpsum, MarkdownPreview } from "@/pages/tools/TextTools";
import { TextDiff, FindReplace, LineSorter, SlugGenerator, ExtractEmailsUrls, UrlParser, TokenCounter, NatoPhonetic, TextTransform } from "@/pages/tools/TextTools2";
import { MarkdownToHtml, HtmlToMarkdown, CsvColumnExtractor, ReadabilityScore, FancyText, TextToSpeech, PromptFormatter, TextToAsciiArt } from "@/pages/tools/TextTools3";
import { TextToHandwriting, PromptToJson, MarkdownReadmeGuide, PunycodeTool } from "@/pages/tools/TextTools4";

// Math
import { PercentageCalculator, ScientificCalculator, PrimeChecker } from "@/pages/tools/MathTools";
import { MolecularWeightCalculator, DateAddSubtract } from "@/pages/tools/CalcTools2";

// Security
import { PasswordGenerator, UuidGenerator, HashGenerator } from "@/pages/tools/SecurityTools";
import { Md5Generator, Sha256Generator, SslCertDecoder, SamlDecoder, ImeiValidator } from "@/pages/tools/SecurityTools2";
import { PasswordStrengthChecker, AesEncryptDecrypt, HmacGenerator, RandomNumberGenerator, PassphraseGenerator } from "@/pages/tools/SecurityTools3";
import { BcryptGenerator, SriHashGenerator, TotpGenerator, RsaKeyGenerator, HashIdentifier } from "@/pages/tools/SecurityTools4";

// Web Dev
import { ColorPicker, CssGradient, ImageToBase64, MetaTagGenerator } from "@/pages/tools/WebDevTools";
import { Html5BoilerplateGenerator, HeadingHierarchyChecker, FontPreview, PlaceholderImageGenerator, BarcodeGeneratorTool, ChangelogFormatter, FaviconGenerator } from "@/pages/tools/WebContentTools";

// Data Tools
import {
  JsonValidator, JsonDiff, JsonTreeViewer, JsonSchemaGenerator,
  JsonToCsv, CsvToJson, JsonToYaml, YamlToJson, JsonToXml, XmlToJson,
} from "@/pages/tools/DataTools";
import {
  TomlToJson, JsonToToml, IniToJson, YamlToXml, CsvToXml,
  JsonMinifier, JsonTableViewer, PropertiesToJson, StructuredDataGenerator,
} from "@/pages/tools/MoreDataTools";
import {
  JsonSchemaValidator, JsonToTomlConverter, YamlDiff, YamlToProperties,
  TomlToYamlConverter, XmlToCsvConverter, PropertiesToYaml, JsonMockGenerator, SoapXmlToJson,
} from "@/pages/tools/DataTools2";

// Developer Tools
import {
  JwtDecoder, JwtBuilder, HttpStatusLookup, UserAgentParser,
  CronParser, SemverCalculator, NanoIdGenerator, CurlConverter,
} from "@/pages/tools/DevTools";
import { ApiResponseViewer, JsonPathTester, GraphqlFormatter, DockerfileBuilder, DnsRecordReference, OpenApiValidator } from "@/pages/tools/DevTools2";

// Formatters & Codegen
import {
  HtmlFormatter, CssFormatter, XmlFormatter, YamlFormatter, TomlFormatter,
  Json5Formatter, JsonToPythonDict, JsonToGoStruct, JsonToJavaClass, RegexVisualizer,
} from "@/pages/tools/FormatterTools";
import { JavaScriptFormatter, TypeScriptFormatter, HtmlMinifier, CssMinifier, XmlMinifier, SvgMinifier, DdlFormatter } from "@/pages/tools/FormatterTools2";

// SQL Tools
import { CsvToSql, SqlDialectConverter, SqlColumnMapper } from "@/pages/tools/SqlTools";

// Encoding & Ciphers
import {
  NumberBaseConverter, ArbitraryBaseConverter, RomanNumeralConverter, NumberToWords,
  UnixTimestampConverter, Rot13Caesar, MorseCodeTranslator, IpAddressConverter,
} from "@/pages/tools/EncodingTools";
import { Base32Codec, Base58Codec, HtmlEntityCodec, AsciiHexConverter, BinaryTextConverter, Utf8ByteViewer, BrailleTranslator, UnicodeEscape } from "@/pages/tools/EncodingTools2";

// Date & Time
import {
  DateDifferenceCalculator, TimezoneConverter, WorkdaysCalculator,
  LeapYearChecker, CountdownTimer, ChmodCalculator, CidrCalculator,
} from "@/pages/tools/DateTimeTools";

// CSS & Design + Web Standards
import { QrCodeGenerator, CssBoxShadow, WcagContrastChecker, PxToRem, HtmlTableGenerator, OpenGraphGenerator } from "@/pages/tools/WebTools2";
import { RobotsTxtGenerator, CorsHeaderGenerator, CspHeaderGenerator, HtaccessGenerator, GcdLcmCalculator, BandwidthCalculator } from "@/pages/tools/WebTools3";
import {
  CssBorderRadius, CssTextShadow, CssGlassmorphism, CssTransform,
  CssFlexbox, CssGrid, CssFilter, CssClipPath, CssAnimationBuilder,
} from "@/pages/tools/CssTools";
import {
  CssScrollbarGenerator, CssTriangleGenerator, ColorConverter, ColorMath,
  ColorBlindnessSimulator, MeshGradientGenerator, TailwindColorPicker,
  ColorPaletteGenerator, SvgToCss, ColorSafePaletteGenerator,
} from "@/pages/tools/CssTools2";

// Web Standards
import { HtpasswdGenerator, SitemapGenerator, AriaRolesReference, WcagReference, HttpStatusCodesReference } from "@/pages/tools/WebStandardsTools2";

// Reference
import { AsciiTable, HtmlEntitiesReference, HttpHeadersReference, MimeTypesReference } from "@/pages/tools/ReferenceTools";
import { UnicodeTableBrowser, UnicodeCharLookup, InvisibleCharDetector, DeveloperCheatsheets } from "@/pages/tools/ReferenceTools2";

// Image Tools
import { ExifViewer, ColorPickerFromImage, ColorPaletteFromImage, SvgToPngConverter, ImageResizer } from "@/pages/tools/ImageTools";

const queryClient = new QueryClient();

function T({ component: C }: { component: React.ComponentType }) {
  return <ToolShell><C /></ToolShell>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/promo" component={Promo} />
      <Route path="/category/:slug" component={CategoryPage} />

      {/* Finance */}
      <Route path="/tools/emi-calculator">{() => <T component={EmiCalculator} />}</Route>
      <Route path="/tools/sip-calculator">{() => <T component={SipCalculator} />}</Route>
      <Route path="/tools/compound-interest">{() => <T component={CompoundInterestCalculator} />}</Route>
      <Route path="/tools/roi-calculator">{() => <T component={RoiCalculator} />}</Route>
      <Route path="/tools/tip-calculator">{() => <T component={TipCalculator} />}</Route>
      <Route path="/tools/gst-calculator">{() => <T component={GstCalculator} />}</Route>
      <Route path="/tools/mortgage-calculator">{() => <T component={MortgageCalculator} />}</Route>
      <Route path="/tools/commission-calculator">{() => <T component={CommissionCalculator} />}</Route>
      <Route path="/tools/group-expense-splitter">{() => <T component={GroupExpenseSplitter} />}</Route>
      <Route path="/tools/break-even-calculator">{() => <T component={BreakEvenCalculator} />}</Route>
      <Route path="/tools/startup-break-even">{() => <T component={StartupBreakEven} />}</Route>
      <Route path="/tools/saas-break-even">{() => <T component={SaasBreakEven} />}</Route>
      <Route path="/tools/ecommerce-break-even">{() => <T component={EcommerceBreakEven} />}</Route>
      <Route path="/tools/crypto-break-even">{() => <T component={CryptoBreakEven} />}</Route>
      <Route path="/tools/expense-categorizer">{() => <T component={ExpenseCategorizer} />}</Route>

      {/* Converters */}
      <Route path="/tools/currency-converter">{() => <T component={CurrencyConverter} />}</Route>
      <Route path="/tools/length-converter">{() => <T component={LengthConverter} />}</Route>
      <Route path="/tools/weight-converter">{() => <T component={WeightConverter} />}</Route>
      <Route path="/tools/temperature-converter">{() => <T component={TemperatureConverter} />}</Route>
      <Route path="/tools/speed-converter">{() => <T component={SpeedConverter} />}</Route>
      <Route path="/tools/area-converter">{() => <T component={AreaConverter} />}</Route>
      <Route path="/tools/volume-converter">{() => <T component={VolumeConverter} />}</Route>
      <Route path="/tools/data-storage-converter">{() => <T component={DataStorageConverter} />}</Route>
      <Route path="/tools/energy-converter">{() => <T component={EnergyConverter} />}</Route>
      <Route path="/tools/pressure-converter">{() => <T component={PressureConverter} />}</Route>

      {/* Code */}
      <Route path="/tools/json-formatter">{() => <T component={JsonFormatter} />}</Route>
      <Route path="/tools/base64">{() => <T component={Base64Tool} />}</Route>
      <Route path="/tools/url-encode">{() => <T component={UrlEncodeTool} />}</Route>
      <Route path="/tools/regex-tester">{() => <T component={RegexTester} />}</Route>
      <Route path="/tools/code-diff">{() => <T component={CodeDiff} />}</Route>
      <Route path="/tools/js-minifier">{() => <T component={JsMinifier} />}</Route>
      <Route path="/tools/sql-formatter">{() => <T component={SqlFormatter} />}</Route>

      {/* Text */}
      <Route path="/tools/word-counter">{() => <T component={WordCounter} />}</Route>
      <Route path="/tools/case-converter">{() => <T component={CaseConverter} />}</Route>
      <Route path="/tools/lorem-ipsum">{() => <T component={LoremIpsum} />}</Route>
      <Route path="/tools/markdown-preview">{() => <T component={MarkdownPreview} />}</Route>
      <Route path="/tools/text-diff">{() => <T component={TextDiff} />}</Route>
      <Route path="/tools/find-replace">{() => <T component={FindReplace} />}</Route>
      <Route path="/tools/line-sorter">{() => <T component={LineSorter} />}</Route>
      <Route path="/tools/slug-generator">{() => <T component={SlugGenerator} />}</Route>
      <Route path="/tools/extract-emails-urls">{() => <T component={ExtractEmailsUrls} />}</Route>
      <Route path="/tools/url-parser">{() => <T component={UrlParser} />}</Route>
      <Route path="/tools/token-counter">{() => <T component={TokenCounter} />}</Route>
      <Route path="/tools/nato-phonetic">{() => <T component={NatoPhonetic} />}</Route>
      <Route path="/tools/text-transform">{() => <T component={TextTransform} />}</Route>
      <Route path="/tools/markdown-to-html">{() => <T component={MarkdownToHtml} />}</Route>
      <Route path="/tools/html-to-markdown">{() => <T component={HtmlToMarkdown} />}</Route>
      <Route path="/tools/csv-column-extractor">{() => <T component={CsvColumnExtractor} />}</Route>
      <Route path="/tools/readability-score">{() => <T component={ReadabilityScore} />}</Route>
      <Route path="/tools/fancy-text">{() => <T component={FancyText} />}</Route>
      <Route path="/tools/text-to-speech">{() => <T component={TextToSpeech} />}</Route>
      <Route path="/tools/prompt-formatter">{() => <T component={PromptFormatter} />}</Route>
      <Route path="/tools/text-to-ascii-art">{() => <T component={TextToAsciiArt} />}</Route>
      <Route path="/tools/text-to-handwriting">{() => <T component={TextToHandwriting} />}</Route>
      <Route path="/tools/prompt-to-json">{() => <T component={PromptToJson} />}</Route>
      <Route path="/tools/markdown-readme-guide">{() => <T component={MarkdownReadmeGuide} />}</Route>
      <Route path="/tools/punycode-converter">{() => <T component={PunycodeTool} />}</Route>

      {/* Math */}
      <Route path="/tools/percentage-calculator">{() => <T component={PercentageCalculator} />}</Route>
      <Route path="/tools/scientific-calculator">{() => <T component={ScientificCalculator} />}</Route>
      <Route path="/tools/prime-checker">{() => <T component={PrimeChecker} />}</Route>
      <Route path="/tools/gcd-lcm-calculator">{() => <T component={GcdLcmCalculator} />}</Route>
      <Route path="/tools/molecular-weight-calculator">{() => <T component={MolecularWeightCalculator} />}</Route>

      {/* Security */}
      <Route path="/tools/hash-generator">{() => <T component={HashGenerator} />}</Route>
      <Route path="/tools/uuid-generator">{() => <T component={UuidGenerator} />}</Route>
      <Route path="/tools/password-generator">{() => <T component={PasswordGenerator} />}</Route>
      <Route path="/tools/md5-generator">{() => <T component={Md5Generator} />}</Route>
      <Route path="/tools/sha256-generator">{() => <T component={Sha256Generator} />}</Route>
      <Route path="/tools/ssl-cert-decoder">{() => <T component={SslCertDecoder} />}</Route>
      <Route path="/tools/saml-decoder">{() => <T component={SamlDecoder} />}</Route>
      <Route path="/tools/imei-validator">{() => <T component={ImeiValidator} />}</Route>
      <Route path="/tools/password-strength-checker">{() => <T component={PasswordStrengthChecker} />}</Route>
      <Route path="/tools/aes-encrypt-decrypt">{() => <T component={AesEncryptDecrypt} />}</Route>
      <Route path="/tools/hmac-generator">{() => <T component={HmacGenerator} />}</Route>
      <Route path="/tools/random-number-generator">{() => <T component={RandomNumberGenerator} />}</Route>
      <Route path="/tools/passphrase-generator">{() => <T component={PassphraseGenerator} />}</Route>
      <Route path="/tools/bcrypt-generator">{() => <T component={BcryptGenerator} />}</Route>
      <Route path="/tools/sri-hash-generator">{() => <T component={SriHashGenerator} />}</Route>
      <Route path="/tools/totp-generator">{() => <T component={TotpGenerator} />}</Route>
      <Route path="/tools/rsa-key-generator">{() => <T component={RsaKeyGenerator} />}</Route>
      <Route path="/tools/hash-identifier">{() => <T component={HashIdentifier} />}</Route>
      <Route path="/tools/checksum-calculator">{() => <T component={ChecksumCalculator} />}</Route>

      {/* Web Dev */}
      <Route path="/tools/color-picker">{() => <T component={ColorPicker} />}</Route>
      <Route path="/tools/css-gradient">{() => <T component={CssGradient} />}</Route>
      <Route path="/tools/image-to-base64">{() => <T component={ImageToBase64} />}</Route>
      <Route path="/tools/meta-tag-generator">{() => <T component={MetaTagGenerator} />}</Route>
      <Route path="/tools/qr-code-generator">{() => <T component={QrCodeGenerator} />}</Route>
      <Route path="/tools/html5-boilerplate">{() => <T component={Html5BoilerplateGenerator} />}</Route>
      <Route path="/tools/heading-hierarchy-checker">{() => <T component={HeadingHierarchyChecker} />}</Route>
      <Route path="/tools/font-preview">{() => <T component={FontPreview} />}</Route>
      <Route path="/tools/placeholder-image-generator">{() => <T component={PlaceholderImageGenerator} />}</Route>
      <Route path="/tools/barcode-generator">{() => <T component={BarcodeGeneratorTool} />}</Route>
      <Route path="/tools/changelog-formatter">{() => <T component={ChangelogFormatter} />}</Route>
      <Route path="/tools/favicon-generator">{() => <T component={FaviconGenerator} />}</Route>

      {/* Data Tools */}
      <Route path="/tools/json-validator">{() => <T component={JsonValidator} />}</Route>
      <Route path="/tools/json-diff">{() => <T component={JsonDiff} />}</Route>
      <Route path="/tools/json-tree-viewer">{() => <T component={JsonTreeViewer} />}</Route>
      <Route path="/tools/json-schema-generator">{() => <T component={JsonSchemaGenerator} />}</Route>
      <Route path="/tools/json-to-csv">{() => <T component={JsonToCsv} />}</Route>
      <Route path="/tools/csv-to-json">{() => <T component={CsvToJson} />}</Route>
      <Route path="/tools/json-to-yaml">{() => <T component={JsonToYaml} />}</Route>
      <Route path="/tools/yaml-to-json">{() => <T component={YamlToJson} />}</Route>
      <Route path="/tools/json-to-xml">{() => <T component={JsonToXml} />}</Route>
      <Route path="/tools/xml-to-json">{() => <T component={XmlToJson} />}</Route>
      <Route path="/tools/toml-to-json">{() => <T component={TomlToJson} />}</Route>
      <Route path="/tools/json-to-toml">{() => <T component={JsonToTomlConverter} />}</Route>
      <Route path="/tools/ini-to-json">{() => <T component={IniToJson} />}</Route>
      <Route path="/tools/yaml-to-xml">{() => <T component={YamlToXml} />}</Route>
      <Route path="/tools/csv-to-xml">{() => <T component={CsvToXml} />}</Route>
      <Route path="/tools/json-minifier">{() => <T component={JsonMinifier} />}</Route>
      <Route path="/tools/json-table-viewer">{() => <T component={JsonTableViewer} />}</Route>
      <Route path="/tools/properties-to-json">{() => <T component={PropertiesToJson} />}</Route>
      <Route path="/tools/structured-data-generator">{() => <T component={StructuredDataGenerator} />}</Route>
      <Route path="/tools/json-schema-validator">{() => <T component={JsonSchemaValidator} />}</Route>
      <Route path="/tools/yaml-diff">{() => <T component={YamlDiff} />}</Route>
      <Route path="/tools/yaml-to-properties">{() => <T component={YamlToProperties} />}</Route>
      <Route path="/tools/toml-to-yaml">{() => <T component={TomlToYamlConverter} />}</Route>
      <Route path="/tools/xml-to-csv">{() => <T component={XmlToCsvConverter} />}</Route>
      <Route path="/tools/properties-to-yaml">{() => <T component={PropertiesToYaml} />}</Route>
      <Route path="/tools/json-mock-generator">{() => <T component={JsonMockGenerator} />}</Route>
      <Route path="/tools/soap-xml-to-json">{() => <T component={SoapXmlToJson} />}</Route>

      {/* Developer Tools */}
      <Route path="/tools/jwt-decoder">{() => <T component={JwtDecoder} />}</Route>
      <Route path="/tools/jwt-builder">{() => <T component={JwtBuilder} />}</Route>
      <Route path="/tools/http-status-lookup">{() => <T component={HttpStatusLookup} />}</Route>
      <Route path="/tools/user-agent-parser">{() => <T component={UserAgentParser} />}</Route>
      <Route path="/tools/cron-parser">{() => <T component={CronParser} />}</Route>
      <Route path="/tools/semver-calculator">{() => <T component={SemverCalculator} />}</Route>
      <Route path="/tools/nanoid-generator">{() => <T component={NanoIdGenerator} />}</Route>
      <Route path="/tools/curl-converter">{() => <T component={CurlConverter} />}</Route>
      <Route path="/tools/chmod-calculator">{() => <T component={ChmodCalculator} />}</Route>
      <Route path="/tools/cidr-calculator">{() => <T component={CidrCalculator} />}</Route>
      <Route path="/tools/bandwidth-calculator">{() => <T component={BandwidthCalculator} />}</Route>
      <Route path="/tools/api-response-viewer">{() => <T component={ApiResponseViewer} />}</Route>
      <Route path="/tools/jsonpath-tester">{() => <T component={JsonPathTester} />}</Route>
      <Route path="/tools/graphql-formatter">{() => <T component={GraphqlFormatter} />}</Route>
      <Route path="/tools/dockerfile-builder">{() => <T component={DockerfileBuilder} />}</Route>
      <Route path="/tools/dns-record-reference">{() => <T component={DnsRecordReference} />}</Route>
      <Route path="/tools/openapi-validator">{() => <T component={OpenApiValidator} />}</Route>

      {/* Formatters & Codegen */}
      <Route path="/tools/html-formatter">{() => <T component={HtmlFormatter} />}</Route>
      <Route path="/tools/css-formatter">{() => <T component={CssFormatter} />}</Route>
      <Route path="/tools/xml-formatter">{() => <T component={XmlFormatter} />}</Route>
      <Route path="/tools/yaml-formatter">{() => <T component={YamlFormatter} />}</Route>
      <Route path="/tools/toml-formatter">{() => <T component={TomlFormatter} />}</Route>
      <Route path="/tools/json5-formatter">{() => <T component={Json5Formatter} />}</Route>
      <Route path="/tools/json-to-python-dict">{() => <T component={JsonToPythonDict} />}</Route>
      <Route path="/tools/json-to-go-struct">{() => <T component={JsonToGoStruct} />}</Route>
      <Route path="/tools/json-to-java-class">{() => <T component={JsonToJavaClass} />}</Route>
      <Route path="/tools/regex-visualizer">{() => <T component={RegexVisualizer} />}</Route>
      <Route path="/tools/javascript-formatter">{() => <T component={JavaScriptFormatter} />}</Route>
      <Route path="/tools/typescript-formatter">{() => <T component={TypeScriptFormatter} />}</Route>
      <Route path="/tools/html-minifier">{() => <T component={HtmlMinifier} />}</Route>
      <Route path="/tools/css-minifier">{() => <T component={CssMinifier} />}</Route>
      <Route path="/tools/xml-minifier">{() => <T component={XmlMinifier} />}</Route>
      <Route path="/tools/svg-minifier">{() => <T component={SvgMinifier} />}</Route>
      <Route path="/tools/ddl-formatter">{() => <T component={DdlFormatter} />}</Route>

      {/* SQL Tools */}
      <Route path="/tools/csv-to-sql">{() => <T component={CsvToSql} />}</Route>
      <Route path="/tools/sql-dialect-converter">{() => <T component={SqlDialectConverter} />}</Route>
      <Route path="/tools/sql-column-mapper">{() => <T component={SqlColumnMapper} />}</Route>

      {/* Encoding & Ciphers */}
      <Route path="/tools/number-base-converter">{() => <T component={NumberBaseConverter} />}</Route>
      <Route path="/tools/arbitrary-base-converter">{() => <T component={ArbitraryBaseConverter} />}</Route>
      <Route path="/tools/roman-numeral-converter">{() => <T component={RomanNumeralConverter} />}</Route>
      <Route path="/tools/number-to-words">{() => <T component={NumberToWords} />}</Route>
      <Route path="/tools/unix-timestamp-converter">{() => <T component={UnixTimestampConverter} />}</Route>
      <Route path="/tools/rot13-caesar">{() => <T component={Rot13Caesar} />}</Route>
      <Route path="/tools/morse-code">{() => <T component={MorseCodeTranslator} />}</Route>
      <Route path="/tools/ip-address-converter">{() => <T component={IpAddressConverter} />}</Route>
      <Route path="/tools/base32-codec">{() => <T component={Base32Codec} />}</Route>
      <Route path="/tools/base58-codec">{() => <T component={Base58Codec} />}</Route>
      <Route path="/tools/html-entity-codec">{() => <T component={HtmlEntityCodec} />}</Route>
      <Route path="/tools/ascii-hex-converter">{() => <T component={AsciiHexConverter} />}</Route>
      <Route path="/tools/binary-text-converter">{() => <T component={BinaryTextConverter} />}</Route>
      <Route path="/tools/utf8-byte-viewer">{() => <T component={Utf8ByteViewer} />}</Route>
      <Route path="/tools/braille-translator">{() => <T component={BrailleTranslator} />}</Route>
      <Route path="/tools/unicode-escape">{() => <T component={UnicodeEscape} />}</Route>

      {/* Date & Time */}
      <Route path="/tools/date-difference">{() => <T component={DateDifferenceCalculator} />}</Route>
      <Route path="/tools/timezone-converter">{() => <T component={TimezoneConverter} />}</Route>
      <Route path="/tools/workdays-calculator">{() => <T component={WorkdaysCalculator} />}</Route>
      <Route path="/tools/leap-year-checker">{() => <T component={LeapYearChecker} />}</Route>
      <Route path="/tools/countdown-timer">{() => <T component={CountdownTimer} />}</Route>
      <Route path="/tools/date-add-subtract">{() => <T component={DateAddSubtract} />}</Route>
      <Route path="/tools/time-format-converter">{() => <T component={TimeFormatConverter} />}</Route>

      {/* CSS & Design */}
      <Route path="/tools/css-box-shadow">{() => <T component={CssBoxShadow} />}</Route>
      <Route path="/tools/wcag-contrast-checker">{() => <T component={WcagContrastChecker} />}</Route>
      <Route path="/tools/px-to-rem">{() => <T component={PxToRem} />}</Route>
      <Route path="/tools/html-table-generator">{() => <T component={HtmlTableGenerator} />}</Route>
      <Route path="/tools/css-border-radius">{() => <T component={CssBorderRadius} />}</Route>
      <Route path="/tools/css-text-shadow">{() => <T component={CssTextShadow} />}</Route>
      <Route path="/tools/css-glassmorphism">{() => <T component={CssGlassmorphism} />}</Route>
      <Route path="/tools/css-transform">{() => <T component={CssTransform} />}</Route>
      <Route path="/tools/css-flexbox">{() => <T component={CssFlexbox} />}</Route>
      <Route path="/tools/css-grid">{() => <T component={CssGrid} />}</Route>
      <Route path="/tools/css-filter">{() => <T component={CssFilter} />}</Route>
      <Route path="/tools/css-clip-path">{() => <T component={CssClipPath} />}</Route>
      <Route path="/tools/css-animation-builder">{() => <T component={CssAnimationBuilder} />}</Route>
      <Route path="/tools/css-scrollbar">{() => <T component={CssScrollbarGenerator} />}</Route>
      <Route path="/tools/css-triangle">{() => <T component={CssTriangleGenerator} />}</Route>
      <Route path="/tools/color-converter">{() => <T component={ColorConverter} />}</Route>
      <Route path="/tools/color-math">{() => <T component={ColorMath} />}</Route>
      <Route path="/tools/color-blindness-simulator">{() => <T component={ColorBlindnessSimulator} />}</Route>
      <Route path="/tools/mesh-gradient">{() => <T component={MeshGradientGenerator} />}</Route>
      <Route path="/tools/tailwind-color-picker">{() => <T component={TailwindColorPicker} />}</Route>
      <Route path="/tools/color-palette-generator">{() => <T component={ColorPaletteGenerator} />}</Route>
      <Route path="/tools/color-safe-palette">{() => <T component={ColorSafePaletteGenerator} />}</Route>
      <Route path="/tools/svg-to-css">{() => <T component={SvgToCss} />}</Route>

      {/* Web Standards */}
      <Route path="/tools/open-graph-generator">{() => <T component={OpenGraphGenerator} />}</Route>
      <Route path="/tools/robots-txt-generator">{() => <T component={RobotsTxtGenerator} />}</Route>
      <Route path="/tools/cors-header-generator">{() => <T component={CorsHeaderGenerator} />}</Route>
      <Route path="/tools/csp-header-generator">{() => <T component={CspHeaderGenerator} />}</Route>
      <Route path="/tools/htaccess-generator">{() => <T component={HtaccessGenerator} />}</Route>
      <Route path="/tools/htpasswd-generator">{() => <T component={HtpasswdGenerator} />}</Route>
      <Route path="/tools/sitemap-generator">{() => <T component={SitemapGenerator} />}</Route>
      <Route path="/tools/aria-roles-reference">{() => <T component={AriaRolesReference} />}</Route>
      <Route path="/tools/wcag-reference">{() => <T component={WcagReference} />}</Route>
      <Route path="/tools/http-status-codes-reference">{() => <T component={HttpStatusCodesReference} />}</Route>

      {/* Reference */}
      <Route path="/tools/ascii-table">{() => <T component={AsciiTable} />}</Route>
      <Route path="/tools/html-entities-reference">{() => <T component={HtmlEntitiesReference} />}</Route>
      <Route path="/tools/http-headers-reference">{() => <T component={HttpHeadersReference} />}</Route>
      <Route path="/tools/mime-types-reference">{() => <T component={MimeTypesReference} />}</Route>
      <Route path="/tools/unicode-table">{() => <T component={UnicodeTableBrowser} />}</Route>
      <Route path="/tools/unicode-char-lookup">{() => <T component={UnicodeCharLookup} />}</Route>
      <Route path="/tools/invisible-char-detector">{() => <T component={InvisibleCharDetector} />}</Route>
      <Route path="/tools/developer-cheatsheets">{() => <T component={DeveloperCheatsheets} />}</Route>

      {/* Image Tools */}
      <Route path="/tools/exif-viewer">{() => <T component={ExifViewer} />}</Route>
      <Route path="/tools/color-picker-from-image">{() => <T component={ColorPickerFromImage} />}</Route>
      <Route path="/tools/color-palette-from-image">{() => <T component={ColorPaletteFromImage} />}</Route>
      <Route path="/tools/svg-to-png">{() => <T component={SvgToPngConverter} />}</Route>
      <Route path="/tools/image-resizer">{() => <T component={ImageResizer} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <Layout>
            <Router />
          </Layout>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
