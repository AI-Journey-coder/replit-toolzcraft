CREATE TABLE document_transfer_daily (
  day date NOT NULL,
  operation text NOT NULL CHECK(operation IN ('scan','extract')),
  outcome text NOT NULL CHECK(outcome IN ('clean','blocked','failed','extracted')),
  requests bigint NOT NULL DEFAULT 0,
  bytes bigint NOT NULL DEFAULT 0,
  duration_ms bigint NOT NULL DEFAULT 0,
  PRIMARY KEY(day,operation,outcome)
);
