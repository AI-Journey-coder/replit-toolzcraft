CREATE TABLE ai_runtime_configuration (
  provider text PRIMARY KEY,
  model text NOT NULL,
  input_usd_per_million numeric(12,6),
  output_usd_per_million numeric(12,6),
  rate_note text NOT NULL DEFAULT '',
  updated_at timestamptz NOT NULL DEFAULT now(),
  CHECK(input_usd_per_million IS NULL OR input_usd_per_million>=0),
  CHECK(output_usd_per_million IS NULL OR output_usd_per_million>=0)
);
