CREATE TABLE ai_call_daily (
 day date NOT NULL,
 provider text NOT NULL,
 model text NOT NULL,
 kind text NOT NULL,
 outcome text NOT NULL,
 calls bigint NOT NULL DEFAULT 0,
 input_tokens bigint NOT NULL DEFAULT 0,
 output_tokens bigint NOT NULL DEFAULT 0,
 unknown_usage bigint NOT NULL DEFAULT 0,
 PRIMARY KEY(day,provider,model,kind,outcome)
);
