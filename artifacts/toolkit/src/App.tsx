import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/Category";
import { ToolShell } from "@/components/ToolShell";
import NotFound from "@/pages/not-found";

// Finance
import { EmiCalculator, SipCalculator, CompoundInterestCalculator, RoiCalculator, TipCalculator, GstCalculator } from "@/pages/tools/FinanceTools";

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

// Math
import { PercentageCalculator, ScientificCalculator, PrimeChecker } from "@/pages/tools/MathTools";

// Security
import { PasswordGenerator, UuidGenerator, HashGenerator } from "@/pages/tools/SecurityTools";
import { Md5Generator, Sha256Generator, SslCertDecoder, SamlDecoder, ImeiValidator } from "@/pages/tools/SecurityTools2";

// Web Dev
import { ColorPicker, CssGradient, ImageToBase64, MetaTagGenerator } from "@/pages/tools/WebDevTools";

// Data Tools
import {
  JsonValidator, JsonDiff, JsonTreeViewer, JsonSchemaGenerator,
  JsonToCsv, CsvToJson, JsonToYaml, YamlToJson, JsonToXml, XmlToJson,
} from "@/pages/tools/DataTools";

// Developer Tools
import {
  JwtDecoder, JwtBuilder, HttpStatusLookup, UserAgentParser,
  CronParser, SemverCalculator, NanoIdGenerator, CurlConverter,
} from "@/pages/tools/DevTools";

// Formatters & Codegen
import {
  HtmlFormatter, CssFormatter, XmlFormatter, YamlFormatter, TomlFormatter,
  Json5Formatter, JsonToPythonDict, JsonToGoStruct, JsonToJavaClass, RegexVisualizer,
} from "@/pages/tools/FormatterTools";

// SQL Tools
import {
  CsvToSql, SqlDialectConverter, SqlColumnMapper,
} from "@/pages/tools/SqlTools";

const queryClient = new QueryClient();

// Wrap every tool page with ToolShell automatically
function T({ component: C }: { component: React.ComponentType }) {
  return <ToolShell><C /></ToolShell>;
}

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={CategoryPage} />

      {/* Finance */}
      <Route path="/tools/emi-calculator">{() => <T component={EmiCalculator} />}</Route>
      <Route path="/tools/sip-calculator">{() => <T component={SipCalculator} />}</Route>
      <Route path="/tools/compound-interest">{() => <T component={CompoundInterestCalculator} />}</Route>
      <Route path="/tools/roi-calculator">{() => <T component={RoiCalculator} />}</Route>
      <Route path="/tools/tip-calculator">{() => <T component={TipCalculator} />}</Route>
      <Route path="/tools/gst-calculator">{() => <T component={GstCalculator} />}</Route>

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

      {/* Math */}
      <Route path="/tools/percentage-calculator">{() => <T component={PercentageCalculator} />}</Route>
      <Route path="/tools/scientific-calculator">{() => <T component={ScientificCalculator} />}</Route>
      <Route path="/tools/prime-checker">{() => <T component={PrimeChecker} />}</Route>

      {/* Security */}
      <Route path="/tools/hash-generator">{() => <T component={HashGenerator} />}</Route>
      <Route path="/tools/uuid-generator">{() => <T component={UuidGenerator} />}</Route>
      <Route path="/tools/password-generator">{() => <T component={PasswordGenerator} />}</Route>
      <Route path="/tools/md5-generator">{() => <T component={Md5Generator} />}</Route>
      <Route path="/tools/sha256-generator">{() => <T component={Sha256Generator} />}</Route>
      <Route path="/tools/ssl-cert-decoder">{() => <T component={SslCertDecoder} />}</Route>
      <Route path="/tools/saml-decoder">{() => <T component={SamlDecoder} />}</Route>
      <Route path="/tools/imei-validator">{() => <T component={ImeiValidator} />}</Route>

      {/* Web Dev */}
      <Route path="/tools/color-picker">{() => <T component={ColorPicker} />}</Route>
      <Route path="/tools/css-gradient">{() => <T component={CssGradient} />}</Route>
      <Route path="/tools/image-to-base64">{() => <T component={ImageToBase64} />}</Route>
      <Route path="/tools/meta-tag-generator">{() => <T component={MetaTagGenerator} />}</Route>

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

      {/* Developer Tools */}
      <Route path="/tools/jwt-decoder">{() => <T component={JwtDecoder} />}</Route>
      <Route path="/tools/jwt-builder">{() => <T component={JwtBuilder} />}</Route>
      <Route path="/tools/http-status-lookup">{() => <T component={HttpStatusLookup} />}</Route>
      <Route path="/tools/user-agent-parser">{() => <T component={UserAgentParser} />}</Route>
      <Route path="/tools/cron-parser">{() => <T component={CronParser} />}</Route>
      <Route path="/tools/semver-calculator">{() => <T component={SemverCalculator} />}</Route>
      <Route path="/tools/nanoid-generator">{() => <T component={NanoIdGenerator} />}</Route>
      <Route path="/tools/curl-converter">{() => <T component={CurlConverter} />}</Route>

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

      {/* SQL Tools */}
      <Route path="/tools/csv-to-sql">{() => <T component={CsvToSql} />}</Route>
      <Route path="/tools/sql-dialect-converter">{() => <T component={SqlDialectConverter} />}</Route>
      <Route path="/tools/sql-column-mapper">{() => <T component={SqlColumnMapper} />}</Route>

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
