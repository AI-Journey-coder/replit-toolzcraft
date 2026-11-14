
import {Redirect} from 'wouter';
import { Profile } from "@/pages/Profile";

const SqlDataGenerator = lazy(() => import("@/pages/tools/TestData").then(m => ({ default: m.SqlDataGenerator })));
const SampleDataGenerator = lazy(() => import("@/pages/tools/TestData").then(m => ({ default: m.SampleDataGenerator })));
const BoundaryDataGenerator = lazy(() => import("@/pages/tools/TestData").then(m => ({ default: m.BoundaryDataGenerator })));
const AdvertisingBreakEven = lazy(() => import("@/pages/tools/BreakEvenExtra").then(m => ({ default: m.AdvertisingBreakEven })));
const ServiceBreakEven = lazy(() => import("@/pages/tools/BreakEvenExtra").then(m => ({ default: m.ServiceBreakEven })));
const RefinanceBreakEven = lazy(() => import("@/pages/tools/BreakEvenExtra").then(m => ({ default: m.RefinanceBreakEven })));
const BuyRentCalculator = lazy(() => import("@/pages/tools/OwnershipCalculator").then(m => ({ default: m.BuyRentCalculator })));
const EvFuelCalculator = lazy(() => import("@/pages/tools/OwnershipCalculator").then(m => ({ default: m.EvFuelCalculator })));
const TimeArithmetic = lazy(() => import("@/pages/tools/TimeWork").then(m => ({ default: m.TimeArithmetic })));
const WorkingHours = lazy(() => import("@/pages/tools/TimeWork").then(m => ({ default: m.WorkingHours })));
import {Subscriptions} from '@/pages/Subscriptions';
import { AppErrorBoundary } from '@/components/AppErrorBoundary';
import { PolicyPage, POLICY_KEYS } from '@/pages/Policies';
import { PreferencesProvider } from '@/hooks/use-preferences';
import { MyTools } from '@/pages/MyTools';
import { LogoGallery } from '@/pages/LogoGallery';
import { lazy, Suspense } from "react";
import { InformationPage } from "@/pages/Information";
import { PageMetadata } from "@/components/PageMetadata";
import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/Category";
import { ToolShell } from "@/components/ToolShell";
import { Promo } from "@/pages/Promo";
import { Login } from "@/pages/Login";
import { Admin } from "@/pages/Admin";
import NotFound from "@/pages/not-found";
import { AuthProvider } from "@/hooks/use-auth";

// Finance
const EmiCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.EmiCalculator })));
const SipCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.SipCalculator })));
const CompoundInterestCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.CompoundInterestCalculator })));
const RoiCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.RoiCalculator })));
const TipCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.TipCalculator })));
const GstCalculator = lazy(() => import("@/pages/tools/FinanceTools").then(m => ({ default: m.GstCalculator })));
const MortgageCalculator = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.MortgageCalculator })));
const StartupBreakEven = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.StartupBreakEven })));
const SaasBreakEven = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.SaasBreakEven })));
const EcommerceBreakEven = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.EcommerceBreakEven })));
const CryptoBreakEven = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.CryptoBreakEven })));
const TimeFormatConverter = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.TimeFormatConverter })));
const ExpenseCategorizer = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.ExpenseCategorizer })));
const ChecksumCalculator = lazy(() => import("@/pages/tools/FinanceTools2").then(m => ({ default: m.ChecksumCalculator })));
const BreakEvenCalculator = lazy(() => import("@/pages/tools/CalcTools2").then(m => ({ default: m.BreakEvenCalculator })));
const CommissionCalculator = lazy(() => import("@/pages/tools/CalcTools2").then(m => ({ default: m.CommissionCalculator })));
const GroupExpenseSplitter = lazy(() => import("@/pages/tools/CalcTools2").then(m => ({ default: m.GroupExpenseSplitter })));

// Converters
const LengthConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.LengthConverter })));
const WeightConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.WeightConverter })));
const TemperatureConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.TemperatureConverter })));
const SpeedConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.SpeedConverter })));
const AreaConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.AreaConverter })));
const VolumeConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.VolumeConverter })));
const DataStorageConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.DataStorageConverter })));
const EnergyConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.EnergyConverter })));
const PressureConverter = lazy(() => import("@/pages/tools/ConverterTools").then(m => ({ default: m.PressureConverter })));
const CurrencyConverter = lazy(() => import("@/pages/tools/CurrencyConverter").then(m => ({ default: m.CurrencyConverter })));

// Code
const JsonFormatter = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.JsonFormatter })));
const Base64Tool = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.Base64Tool })));
const UrlEncodeTool = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.UrlEncodeTool })));
const RegexTester = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.RegexTester })));
const CodeDiff = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.CodeDiff })));
const JsMinifier = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.JsMinifier })));
const SqlFormatter = lazy(() => import("@/pages/tools/CodeTools").then(m => ({ default: m.SqlFormatter })));

// Text
const WordCounter = lazy(() => import("@/pages/tools/TextTools").then(m => ({ default: m.WordCounter })));
const CaseConverter = lazy(() => import("@/pages/tools/TextTools").then(m => ({ default: m.CaseConverter })));
const LoremIpsum = lazy(() => import("@/pages/tools/TextTools").then(m => ({ default: m.LoremIpsum })));
const MarkdownPreview = lazy(() => import("@/pages/tools/TextTools").then(m => ({ default: m.MarkdownPreview })));
const TextDiff = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.TextDiff })));
const FindReplace = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.FindReplace })));
const LineSorter = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.LineSorter })));
const SlugGenerator = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.SlugGenerator })));
const ExtractEmailsUrls = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.ExtractEmailsUrls })));
const UrlParser = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.UrlParser })));
const TokenCounter = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.TokenCounter })));
const NatoPhonetic = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.NatoPhonetic })));
const TextTransform = lazy(() => import("@/pages/tools/TextTools2").then(m => ({ default: m.TextTransform })));

const TextToHandwriting = lazy(() => import("@/pages/tools/TextTools4").then(m => ({ default: m.TextToHandwriting })));
const PromptToJson = lazy(() => import("@/pages/tools/TextTools4").then(m => ({ default: m.PromptToJson })));
const MarkdownReadmeGuide = lazy(() => import("@/pages/tools/TextTools4").then(m => ({ default: m.MarkdownReadmeGuide })));
const PunycodeTool = lazy(() => import("@/pages/tools/TextTools4").then(m => ({ default: m.PunycodeTool })));

// Math
const PercentageCalculator = lazy(() => import("@/pages/tools/MathTools").then(m => ({ default: m.PercentageCalculator })));
const ScientificCalculator = lazy(() => import("@/pages/tools/MathTools").then(m => ({ default: m.ScientificCalculator })));
const PrimeChecker = lazy(() => import("@/pages/tools/MathTools").then(m => ({ default: m.PrimeChecker })));
const MolecularWeightCalculator = lazy(() => import("@/pages/tools/CalcTools2").then(m => ({ default: m.MolecularWeightCalculator })));
const DateAddSubtract = lazy(() => import("@/pages/tools/CalcTools2").then(m => ({ default: m.DateAddSubtract })));

// Security
const PasswordGenerator = lazy(() => import("@/pages/tools/SecurityTools").then(m => ({ default: m.PasswordGenerator })));
const UuidGenerator = lazy(() => import("@/pages/tools/SecurityTools").then(m => ({ default: m.UuidGenerator })));
const HashGenerator = lazy(() => import("@/pages/tools/SecurityTools").then(m => ({ default: m.HashGenerator })));
const Md5Generator = lazy(() => import("@/pages/tools/SecurityTools2").then(m => ({ default: m.Md5Generator })));
const Sha256Generator = lazy(() => import("@/pages/tools/SecurityTools2").then(m => ({ default: m.Sha256Generator })));
const SslCertDecoder = lazy(() => import("@/pages/tools/SecurityTools2").then(m => ({ default: m.SslCertDecoder })));
const SamlDecoder = lazy(() => import("@/pages/tools/SecurityTools2").then(m => ({ default: m.SamlDecoder })));
const ImeiValidator = lazy(() => import("@/pages/tools/SecurityTools2").then(m => ({ default: m.ImeiValidator })));
const PasswordStrengthChecker = lazy(() => import("@/pages/tools/SecurityTools3").then(m => ({ default: m.PasswordStrengthChecker })));
const AesEncryptDecrypt = lazy(() => import("@/pages/tools/SecurityTools3").then(m => ({ default: m.AesEncryptDecrypt })));
const HmacGenerator = lazy(() => import("@/pages/tools/SecurityTools3").then(m => ({ default: m.HmacGenerator })));
const RandomNumberGenerator = lazy(() => import("@/pages/tools/SecurityTools3").then(m => ({ default: m.RandomNumberGenerator })));
const PassphraseGenerator = lazy(() => import("@/pages/tools/SecurityTools3").then(m => ({ default: m.PassphraseGenerator })));
const BcryptGenerator = lazy(() => import("@/pages/tools/SecurityTools4").then(m => ({ default: m.BcryptGenerator })));
const SriHashGenerator = lazy(() => import("@/pages/tools/SecurityTools4").then(m => ({ default: m.SriHashGenerator })));
const TotpGenerator = lazy(() => import("@/pages/tools/SecurityTools4").then(m => ({ default: m.TotpGenerator })));
const RsaKeyGenerator = lazy(() => import("@/pages/tools/SecurityTools4").then(m => ({ default: m.RsaKeyGenerator })));
const HashIdentifier = lazy(() => import("@/pages/tools/SecurityTools4").then(m => ({ default: m.HashIdentifier })));

// Web Dev
const ColorPicker = lazy(() => import("@/pages/tools/WebDevTools").then(m => ({ default: m.ColorPicker })));
const CssGradient = lazy(() => import("@/pages/tools/WebDevTools").then(m => ({ default: m.CssGradient })));
const ImageToBase64 = lazy(() => import("@/pages/tools/WebDevTools").then(m => ({ default: m.ImageToBase64 })));
const MetaTagGenerator = lazy(() => import("@/pages/tools/WebDevTools").then(m => ({ default: m.MetaTagGenerator })));


// Data Tools

const TomlToJson = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.TomlToJson })));
const JsonToToml = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.JsonToToml })));
const IniToJson = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.IniToJson })));
const YamlToXml = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.YamlToXml })));
const CsvToXml = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.CsvToXml })));
const JsonMinifier = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.JsonMinifier })));
const JsonTableViewer = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.JsonTableViewer })));
const PropertiesToJson = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.PropertiesToJson })));
const StructuredDataGenerator = lazy(() => import("@/pages/tools/MoreDataTools").then(m => ({ default: m.StructuredDataGenerator })));
const JsonSchemaValidator = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.JsonSchemaValidator })));
const JsonToTomlConverter = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.JsonToTomlConverter })));
const YamlDiff = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.YamlDiff })));
const YamlToProperties = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.YamlToProperties })));
const TomlToYamlConverter = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.TomlToYamlConverter })));
const XmlToCsvConverter = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.XmlToCsvConverter })));
const PropertiesToYaml = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.PropertiesToYaml })));
const JsonMockGenerator = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.JsonMockGenerator })));
const SoapXmlToJson = lazy(() => import("@/pages/tools/DataTools2").then(m => ({ default: m.SoapXmlToJson })));

// Developer Tools
const JwtDecoder = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.JwtDecoder })));
const JwtBuilder = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.JwtBuilder })));
const HttpStatusLookup = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.HttpStatusLookup })));
const UserAgentParser = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.UserAgentParser })));
const CronParser = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.CronParser })));
const SemverCalculator = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.SemverCalculator })));
const NanoIdGenerator = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.NanoIdGenerator })));
const CurlConverter = lazy(() => import("@/pages/tools/DevTools").then(m => ({ default: m.CurlConverter })));
const ApiResponseViewer = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.ApiResponseViewer })));
const JsonPathTester = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.JsonPathTester })));
const GraphqlFormatter = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.GraphqlFormatter })));
const DockerfileBuilder = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.DockerfileBuilder })));
const DnsRecordReference = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.DnsRecordReference })));
const OpenApiValidator = lazy(() => import("@/pages/tools/DevTools2").then(m => ({ default: m.OpenApiValidator })));

// Formatters & Codegen
const HtmlFormatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.HtmlFormatter })));
const CssFormatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.CssFormatter })));
const XmlFormatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.XmlFormatter })));
const YamlFormatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.YamlFormatter })));
const TomlFormatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.TomlFormatter })));
const Json5Formatter = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.Json5Formatter })));
const JsonToPythonDict = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.JsonToPythonDict })));
const JsonToGoStruct = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.JsonToGoStruct })));
const JsonToJavaClass = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.JsonToJavaClass })));
const RegexVisualizer = lazy(() => import("@/pages/tools/FormatterTools").then(m => ({ default: m.RegexVisualizer })));


// SQL Tools
const CsvToSql = lazy(() => import("@/pages/tools/SqlTools").then(m => ({ default: m.CsvToSql })));
const SqlDialectConverter = lazy(() => import("@/pages/tools/SqlTools").then(m => ({ default: m.SqlDialectConverter })));
const SqlColumnMapper = lazy(() => import("@/pages/tools/SqlTools").then(m => ({ default: m.SqlColumnMapper })));

// Encoding & Ciphers
const NumberBaseConverter = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.NumberBaseConverter })));
const ArbitraryBaseConverter = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.ArbitraryBaseConverter })));
const RomanNumeralConverter = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.RomanNumeralConverter })));
const NumberToWords = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.NumberToWords })));
const UnixTimestampConverter = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.UnixTimestampConverter })));
const Rot13Caesar = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.Rot13Caesar })));
const MorseCodeTranslator = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.MorseCodeTranslator })));
const IpAddressConverter = lazy(() => import("@/pages/tools/EncodingTools").then(m => ({ default: m.IpAddressConverter })));
const Base32Codec = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.Base32Codec })));
const Base58Codec = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.Base58Codec })));
const HtmlEntityCodec = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.HtmlEntityCodec })));
const AsciiHexConverter = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.AsciiHexConverter })));
const BinaryTextConverter = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.BinaryTextConverter })));
const Utf8ByteViewer = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.Utf8ByteViewer })));
const BrailleTranslator = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.BrailleTranslator })));
const UnicodeEscape = lazy(() => import("@/pages/tools/EncodingTools2").then(m => ({ default: m.UnicodeEscape })));

// Date & Time
const DateDifferenceCalculator = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.DateDifferenceCalculator })));
const TimezoneConverter = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.TimezoneConverter })));
const WorkdaysCalculator = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.WorkdaysCalculator })));
const LeapYearChecker = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.LeapYearChecker })));
const CountdownTimer = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.CountdownTimer })));
const ChmodCalculator = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.ChmodCalculator })));
const CidrCalculator = lazy(() => import("@/pages/tools/DateTimeTools").then(m => ({ default: m.CidrCalculator })));

// CSS & Design + Web Standards
const QrCodeGenerator = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.QrCodeGenerator })));
const CssBoxShadow = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.CssBoxShadow })));
const WcagContrastChecker = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.WcagContrastChecker })));
const PxToRem = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.PxToRem })));
const HtmlTableGenerator = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.HtmlTableGenerator })));
const OpenGraphGenerator = lazy(() => import("@/pages/tools/WebTools2").then(m => ({ default: m.OpenGraphGenerator })));
const RobotsTxtGenerator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.RobotsTxtGenerator })));
const CorsHeaderGenerator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.CorsHeaderGenerator })));
const CspHeaderGenerator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.CspHeaderGenerator })));
const HtaccessGenerator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.HtaccessGenerator })));
const GcdLcmCalculator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.GcdLcmCalculator })));
const BandwidthCalculator = lazy(() => import("@/pages/tools/WebTools3").then(m => ({ default: m.BandwidthCalculator })));
const CssBorderRadius = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssBorderRadius })));
const CssTextShadow = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssTextShadow })));
const CssGlassmorphism = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssGlassmorphism })));
const CssTransform = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssTransform })));
const CssFlexbox = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssFlexbox })));
const CssGrid = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssGrid })));
const CssFilter = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssFilter })));
const CssClipPath = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssClipPath })));
const CssAnimationBuilder = lazy(() => import("@/pages/tools/CssTools").then(m => ({ default: m.CssAnimationBuilder })));
const CssScrollbarGenerator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.CssScrollbarGenerator })));
const CssTriangleGenerator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.CssTriangleGenerator })));
const ColorConverter = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.ColorConverter })));
const ColorMath = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.ColorMath })));
const ColorBlindnessSimulator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.ColorBlindnessSimulator })));
const MeshGradientGenerator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.MeshGradientGenerator })));
const TailwindColorPicker = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.TailwindColorPicker })));
const ColorPaletteGenerator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.ColorPaletteGenerator })));
const SvgToCss = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.SvgToCss })));
const ColorSafePaletteGenerator = lazy(() => import("@/pages/tools/CssTools2").then(m => ({ default: m.ColorSafePaletteGenerator })));

// Web Standards
const HtpasswdGenerator = lazy(() => import("@/pages/tools/WebStandardsTools2").then(m => ({ default: m.HtpasswdGenerator })));
const SitemapGenerator = lazy(() => import("@/pages/tools/WebStandardsTools2").then(m => ({ default: m.SitemapGenerator })));
const AriaRolesReference = lazy(() => import("@/pages/tools/WebStandardsTools2").then(m => ({ default: m.AriaRolesReference })));
const WcagReference = lazy(() => import("@/pages/tools/WebStandardsTools2").then(m => ({ default: m.WcagReference })));
const HttpStatusCodesReference = lazy(() => import("@/pages/tools/WebStandardsTools2").then(m => ({ default: m.HttpStatusCodesReference })));

// Reference
const AsciiTable = lazy(() => import("@/pages/tools/ReferenceTools").then(m => ({ default: m.AsciiTable })));
const HtmlEntitiesReference = lazy(() => import("@/pages/tools/ReferenceTools").then(m => ({ default: m.HtmlEntitiesReference })));
const HttpHeadersReference = lazy(() => import("@/pages/tools/ReferenceTools").then(m => ({ default: m.HttpHeadersReference })));
const MimeTypesReference = lazy(() => import("@/pages/tools/ReferenceTools").then(m => ({ default: m.MimeTypesReference })));
const UnicodeTableBrowser = lazy(() => import("@/pages/tools/ReferenceTools2").then(m => ({ default: m.UnicodeTableBrowser })));
const UnicodeCharLookup = lazy(() => import("@/pages/tools/ReferenceTools2").then(m => ({ default: m.UnicodeCharLookup })));
const InvisibleCharDetector = lazy(() => import("@/pages/tools/ReferenceTools2").then(m => ({ default: m.InvisibleCharDetector })));
const DeveloperCheatsheets = lazy(() => import("@/pages/tools/ReferenceTools2").then(m => ({ default: m.DeveloperCheatsheets })));

// Image Tools
const ExifViewer = lazy(() => import("@/pages/tools/ImageTools").then(m => ({ default: m.ExifViewer })));
const ColorPickerFromImage = lazy(() => import("@/pages/tools/ImageTools").then(m => ({ default: m.ColorPickerFromImage })));
const ColorPaletteFromImage = lazy(() => import("@/pages/tools/ImageTools").then(m => ({ default: m.ColorPaletteFromImage })));
const SvgToPngConverter = lazy(() => import("@/pages/tools/ImageTools").then(m => ({ default: m.SvgToPngConverter })));
const ImageResizer = lazy(() => import("@/pages/tools/ImageTools").then(m => ({ default: m.ImageResizer })));
// PDF Tools


// OCR & Documents

// AI Tools
const AiKeyPoints = lazy(() => import("@/pages/tools/AiTools").then(m => ({ default: m.AiKeyPoints })));
const AiDocumentQa = lazy(() => import("@/pages/tools/AiTools").then(m => ({ default: m.AiDocumentQa })));
const AiTranslator = lazy(() => import("@/pages/tools/AiTools").then(m => ({ default: m.AiTranslator })));

const DocumentIntelligence = lazy(() => import("@/pages/tools/DocumentIntelligence").then(m => ({ default: m.DocumentIntelligence })));

const InvoiceExtractor = lazy(() => import("@/pages/tools/DocumentWorkflows").then(m => ({ default: m.InvoiceExtractor })));
const TableExtractor = lazy(() => import("@/pages/tools/DocumentWorkflows").then(m => ({ default: m.TableExtractor })));
const ScanAssistant = lazy(() => import("@/pages/tools/DocumentWorkflows").then(m => ({ default: m.ScanAssistant })));
const DocumentCompare = lazy(() => import("@/pages/tools/DocumentWorkflows").then(m => ({ default: m.DocumentCompare })));

const MergePdf = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.MergePdf })));
const SplitPdf = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.SplitPdf })));
const ImagesToPdf = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.ImagesToPdf })));
const RotatePdf = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.RotatePdf })));
const WatermarkPdf = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.WatermarkPdf })));
const PdfPageNumbers = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.PdfPageNumbers })));
const PdfMetadata = lazy(() => import("@/pages/tools/PdfTools").then(m => ({ default: m.PdfMetadata })));

const PdfToImages = lazy(() => import("@/pages/tools/PdfTools2").then(m => ({ default: m.PdfToImages })));
const PdfTextExtractor = lazy(() => import("@/pages/tools/PdfTools2").then(m => ({ default: m.PdfTextExtractor })));

const ImageOcr = lazy(() => import("@/pages/tools/OcrTools").then(m => ({ default: m.ImageOcr })));
const PdfOcr = lazy(() => import("@/pages/tools/OcrTools").then(m => ({ default: m.PdfOcr })));

const JsonValidator = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonValidator })));
const JsonDiff = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonDiff })));
const JsonTreeViewer = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonTreeViewer })));
const JsonSchemaGenerator = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonSchemaGenerator })));
const JsonToCsv = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonToCsv })));
const CsvToJson = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.CsvToJson })));
const JsonToYaml = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonToYaml })));
const YamlToJson = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.YamlToJson })));
const JsonToXml = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.JsonToXml })));
const XmlToJson = lazy(() => import("@/pages/tools/DataTools").then(m => ({ default: m.XmlToJson })));

const JavaScriptFormatter = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.JavaScriptFormatter })));
const TypeScriptFormatter = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.TypeScriptFormatter })));
const HtmlMinifier = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.HtmlMinifier })));
const CssMinifier = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.CssMinifier })));
const XmlMinifier = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.XmlMinifier })));
const SvgMinifier = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.SvgMinifier })));
const DdlFormatter = lazy(() => import("@/pages/tools/FormatterTools2").then(m => ({ default: m.DdlFormatter })));

const MarkdownToHtml = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.MarkdownToHtml })));
const HtmlToMarkdown = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.HtmlToMarkdown })));
const CsvColumnExtractor = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.CsvColumnExtractor })));
const ReadabilityScore = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.ReadabilityScore })));
const FancyText = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.FancyText })));
const TextToSpeech = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.TextToSpeech })));
const PromptFormatter = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.PromptFormatter })));
const TextToAsciiArt = lazy(() => import("@/pages/tools/TextTools3").then(m => ({ default: m.TextToAsciiArt })));

const Html5BoilerplateGenerator = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.Html5BoilerplateGenerator })));
const HeadingHierarchyChecker = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.HeadingHierarchyChecker })));
const FontPreview = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.FontPreview })));
const PlaceholderImageGenerator = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.PlaceholderImageGenerator })));
const BarcodeGeneratorTool = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.BarcodeGeneratorTool })));
const ChangelogFormatter = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.ChangelogFormatter })));
const FaviconGenerator = lazy(() => import("@/pages/tools/WebContentTools").then(m => ({ default: m.FaviconGenerator })));

const queryClient = new QueryClient();

const New_PdfOrganizer = lazy(() => import("@/pages/tools/PdfWorkbench").then(m => ({default:m.PdfOrganizer})));
const New_PdfFormFiller = lazy(() => import("@/pages/tools/PdfWorkbench").then(m => ({default:m.PdfFormFiller})));
const New_PdfCompressor = lazy(() => import("@/pages/tools/PdfWorkbench").then(m => ({default:m.PdfCompressor})));
const New_SearchablePdf = lazy(() => import("@/pages/tools/SearchablePdf").then(m => ({default:m.SearchablePdf})));
const ContactDuplicateTool = lazy(() => import("@/pages/tools/ContactDuplicates").then(m => ({default:m.ContactDuplicates})));
const Adopted_ContactConverter = lazy(() => import("@/pages/tools/AdoptedTools").then(m => ({default:m.ContactConverter})));
const Adopted_WhatsAppLink = lazy(() => import("@/pages/tools/AdoptedTools").then(m => ({default:m.WhatsAppLink})));
const Adopted_SolidBackground = lazy(() => import("@/pages/tools/AdoptedTools").then(m => ({default:m.SolidBackground})));
const New_ImageBatch = lazy(() => import("@/pages/tools/ImageBatch").then(m => ({default:m.ImageBatch})));
const New_ImageCompressor = lazy(() => import("@/pages/tools/ImageBatch").then(m => ({default:m.ImageCompressor})));
const New_CsvCleaner = lazy(() => import("@/pages/tools/CsvCleaner").then(m => ({default:m.CsvCleaner})));
const New_VideoCompressor = lazy(() => import("@/pages/tools/VideoCompressor").then(m => ({default:m.VideoCompressor})));
const New_FileArchive = lazy(() => import("@/pages/tools/FileArchive").then(m => ({default:m.FileArchive})));
const New_MoneyValue = lazy(() => import("@/pages/tools/MoneyValue").then(m => ({default:m.MoneyValue})));
const New_SavingsGoal = lazy(() => import("@/pages/tools/MoneyValue").then(m => ({default:m.SavingsGoal})));
const New_RealRaise = lazy(() => import("@/pages/tools/MoneyValue").then(m => ({default:m.RealRaise})));
const NewCtc = lazy(() => import("@/pages/tools/CtcCalculator").then(m => ({default:m.CtcCalculator})));
const NewSqlMigration = lazy(() => import("@/pages/tools/SqlMigration").then(m => ({default:m.SqlMigration})));

function T({ component: C }: { component: React.ComponentType }) {
  return <ToolShell><Suspense fallback={<p role="status">Loading tool…</p>}><C /></Suspense></ToolShell>;
}

const PdfEditor = lazy(()=>import('@/pages/tools/PdfRedactor').then(m=>({default:m.PdfRedactor})));
function Router() {
  return (
    <Switch>
      {POLICY_KEYS.map(page=><Route key={page} path={`/${page}`}><PolicyPage page={page}/></Route>)}
      <Route path="/tools/ctc-calculator">{()=><Suspense fallback={<p>Loading calculator…</p>}><T component={NewCtc}/></Suspense>}</Route>
      <Route path="/tools/time-add-subtract">{()=><T component={TimeArithmetic}/>}</Route>
      <Route path="/tools/working-hours-calculator">{()=><T component={WorkingHours}/>}</Route>
      <Route path="/tools/pdf-editor">{()=><Suspense fallback={<p>Loading PDF editor…</p>}><T component={PdfEditor}/></Suspense>}</Route>
      <Route path="/tools/buy-vs-rent">{()=><T component={BuyRentCalculator}/>}</Route>
      <Route path="/tools/ev-vs-fuel">{()=><T component={EvFuelCalculator}/>}</Route>
      <Route path="/tools/sql-data-generator">{()=><T component={SqlDataGenerator}/>}</Route>
<Route path="/tools/sample-data-generator">{()=><T component={SampleDataGenerator}/>}</Route>
<Route path="/tools/boundary-data-generator">{()=><T component={BoundaryDataGenerator}/>}</Route>
<Route path="/tools/advertising-break-even">{()=><T component={AdvertisingBreakEven}/>}</Route>
      <Route path="/tools/service-break-even">{()=><T component={ServiceBreakEven}/>}</Route>
      <Route path="/tools/refinance-break-even">{()=><T component={RefinanceBreakEven}/>}</Route>
      <Route path="/subscriptions" component={Subscriptions}/>
      <Route path="/my-tools" component={MyTools} />
      <Route path="/logo-gallery" component={LogoGallery} />
      <Route path="/tools/pdf-page-organizer">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_PdfOrganizer} /></Suspense>}</Route>
      <Route path="/tools/pdf-form-filler">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_PdfFormFiller} /></Suspense>}</Route>
      <Route path="/tools/pdf-compressor">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_PdfCompressor} /></Suspense>}</Route>
      <Route path="/tools/searchable-pdf">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_SearchablePdf} /></Suspense>}</Route>
      <Route path="/tools/contact-duplicate-merger">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={ContactDuplicateTool} /></Suspense>}</Route>
<Route path="/tools/contacts-converter">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={Adopted_ContactConverter} /></Suspense>}</Route>
<Route path="/tools/whatsapp-link-generator">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={Adopted_WhatsAppLink} /></Suspense>}</Route>
<Route path="/tools/solid-background-remover">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={Adopted_SolidBackground} /></Suspense>}</Route>
<Route path="/tools/batch-image-processor">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_ImageBatch} /></Suspense>}</Route>
      <Route path="/tools/image-compressor">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_ImageCompressor} /></Suspense>}</Route>
      <Route path="/tools/csv-cleaner">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_CsvCleaner} /></Suspense>}</Route>
      <Route path="/tools/video-compressor">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_VideoCompressor} /></Suspense>}</Route>
      <Route path="/tools/file-compressor">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_FileArchive} /></Suspense>}</Route>
      <Route path="/tools/money-value-calculator">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_MoneyValue} /></Suspense>}</Route>
      <Route path="/tools/savings-goal-calculator">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_SavingsGoal} /></Suspense>}</Route>
      <Route path="/tools/real-salary-raise">{() => <Suspense fallback={<p role="status">Loading tool…</p>}><T component={New_RealRaise} /></Suspense>}</Route>
      {["about", "contact", "privacy", "terms"].map(page => <Route key={page} path={`/${page}`}><InformationPage page={page} /></Route>)}
      <Route path="/" component={Home} />
      <Route path="/promo" component={Promo} />
      <Route path="/login" component={Login} />
      <Route path="/profile" component={Profile} />
      <Route path="/admin" component={Admin} />
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
      <Route path="/tools/dns-record-reference-ref">{() => <Redirect replace to="/tools/dns-record-reference" />}</Route>
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
      <Route path="/tools/sql-dialect-converter">{() => <Suspense fallback={<p role="status">Loading SQL converter…</p>}><T component={NewSqlMigration} /></Suspense>}</Route>
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

      {/* PDF Tools */}
      <Route path="/tools/merge-pdf">{() => <T component={MergePdf} />}</Route>
      <Route path="/tools/split-pdf">{() => <T component={SplitPdf} />}</Route>
      <Route path="/tools/images-to-pdf">{() => <T component={ImagesToPdf} />}</Route>
      <Route path="/tools/pdf-to-images">{() => <T component={PdfToImages} />}</Route>
      <Route path="/tools/rotate-pdf">{() => <T component={RotatePdf} />}</Route>
      <Route path="/tools/watermark-pdf">{() => <T component={WatermarkPdf} />}</Route>
      <Route path="/tools/pdf-page-numbers">{() => <T component={PdfPageNumbers} />}</Route>
      <Route path="/tools/pdf-metadata">{() => <T component={PdfMetadata} />}</Route>
      <Route path="/tools/pdf-text-extract">{() => <T component={PdfTextExtractor} />}</Route>

      {/* OCR & Documents */}
      <Route path="/tools/image-ocr">{() => <T component={ImageOcr} />}</Route>
      <Route path="/tools/pdf-ocr">{() => <T component={PdfOcr} />}</Route>

      {/* AI Tools */}
      <Route path="/tools/ai-invoice-extractor">{() => <T component={InvoiceExtractor} />}</Route>
<Route path="/tools/ai-table-extractor">{() => <T component={TableExtractor} />}</Route>
<Route path="/tools/ai-scan-assistant">{() => <T component={ScanAssistant} />}</Route>
<Route path="/tools/ai-document-compare">{() => <T component={DocumentCompare} />}</Route>
<Route path="/tools/ai-document-intelligence">{() => <T component={DocumentIntelligence} />}</Route>
<Route path="/tools/ai-summarizer">{() => <Redirect to="/tools/ai-document-intelligence" />}</Route>
      <Route path="/tools/ai-key-points">{() => <T component={AiKeyPoints} />}</Route>
      <Route path="/tools/ai-document-qa">{() => <T component={AiDocumentQa} />}</Route>
      <Route path="/tools/ai-translator">{() => <T component={AiTranslator} />}</Route>

      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <AppErrorBoundary><QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <PreferencesProvider><Layout>
              <PageMetadata />
              <Router />
            </Layout></PreferencesProvider>
          </WouterRouter>
        </AuthProvider>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider></AppErrorBoundary>
  );
}

export default App;
