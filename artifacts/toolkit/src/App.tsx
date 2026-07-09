import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { CategoryPage } from "@/pages/Category";
import NotFound from "@/pages/not-found";

// Finance
import { EmiCalculator, SipCalculator, CompoundInterestCalculator, RoiCalculator, TipCalculator, GstCalculator } from "@/pages/tools/FinanceTools";

// Converters
import { LengthConverter, WeightConverter, TemperatureConverter, SpeedConverter, AreaConverter, VolumeConverter } from "@/pages/tools/ConverterTools";

// Code
import { JsonFormatter, Base64Tool, UrlEncodeTool, RegexTester, CodeDiff, JsMinifier, SqlFormatter } from "@/pages/tools/CodeTools";

// Text
import { WordCounter, CaseConverter, LoremIpsum, MarkdownPreview } from "@/pages/tools/TextTools";

// Math
import { PercentageCalculator, ScientificCalculator, PrimeChecker } from "@/pages/tools/MathTools";

// Security
import { PasswordGenerator, UuidGenerator, HashGenerator } from "@/pages/tools/SecurityTools";

// Web Dev
import { ColorPicker, CssGradient, ImageToBase64, MetaTagGenerator } from "@/pages/tools/WebDevTools";

const queryClient = new QueryClient();

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/category/:slug" component={CategoryPage} />

      {/* Finance */}
      <Route path="/tools/emi-calculator" component={EmiCalculator} />
      <Route path="/tools/sip-calculator" component={SipCalculator} />
      <Route path="/tools/compound-interest" component={CompoundInterestCalculator} />
      <Route path="/tools/roi-calculator" component={RoiCalculator} />
      <Route path="/tools/tip-calculator" component={TipCalculator} />
      <Route path="/tools/gst-calculator" component={GstCalculator} />

      {/* Converters */}
      <Route path="/tools/length-converter" component={LengthConverter} />
      <Route path="/tools/weight-converter" component={WeightConverter} />
      <Route path="/tools/temperature-converter" component={TemperatureConverter} />
      <Route path="/tools/speed-converter" component={SpeedConverter} />
      <Route path="/tools/area-converter" component={AreaConverter} />
      <Route path="/tools/volume-converter" component={VolumeConverter} />

      {/* Code */}
      <Route path="/tools/json-formatter" component={JsonFormatter} />
      <Route path="/tools/base64" component={Base64Tool} />
      <Route path="/tools/url-encode" component={UrlEncodeTool} />
      <Route path="/tools/regex-tester" component={RegexTester} />
      <Route path="/tools/code-diff" component={CodeDiff} />
      <Route path="/tools/js-minifier" component={JsMinifier} />
      <Route path="/tools/sql-formatter" component={SqlFormatter} />

      {/* Text */}
      <Route path="/tools/word-counter" component={WordCounter} />
      <Route path="/tools/case-converter" component={CaseConverter} />
      <Route path="/tools/lorem-ipsum" component={LoremIpsum} />
      <Route path="/tools/markdown-preview" component={MarkdownPreview} />

      {/* Math */}
      <Route path="/tools/percentage-calculator" component={PercentageCalculator} />
      <Route path="/tools/scientific-calculator" component={ScientificCalculator} />
      <Route path="/tools/prime-checker" component={PrimeChecker} />

      {/* Security */}
      <Route path="/tools/hash-generator" component={HashGenerator} />
      <Route path="/tools/uuid-generator" component={UuidGenerator} />
      <Route path="/tools/password-generator" component={PasswordGenerator} />

      {/* Web Dev */}
      <Route path="/tools/color-picker" component={ColorPicker} />
      <Route path="/tools/css-gradient" component={CssGradient} />
      <Route path="/tools/image-to-base64" component={ImageToBase64} />
      <Route path="/tools/meta-tag-generator" component={MetaTagGenerator} />

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
