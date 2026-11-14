CREATE TABLE publication_pages (
 slug text PRIMARY KEY,
 title text NOT NULL,
 description text NOT NULL,
 body text NOT NULL,
 published boolean NOT NULL DEFAULT false,
 noindex boolean NOT NULL DEFAULT true,
 ad_placement text NOT NULL DEFAULT 'off' CHECK(ad_placement IN ('off','after_article')),
 ad_slot text NOT NULL DEFAULT '',
 version integer NOT NULL DEFAULT 1,
 updated_at timestamptz NOT NULL DEFAULT now()
);
