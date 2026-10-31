/** Aggregate first-party operational records only; no document text, identifiers or tracking cookies. */
export async function productAnalytics(database: { query: Function }) {
  const cohort = `WITH cohort AS (SELECT u.id,u.created_at,
 EXISTS(SELECT 1 FROM usage_events e WHERE e.user_id=u.id AND e.created_at>=u.created_at AND e.created_at<u.created_at+interval '7 days') AS activated,
 EXISTS(SELECT 1 FROM usage_events e WHERE e.user_id=u.id AND e.created_at>=u.created_at+interval '7 days' AND e.created_at<u.created_at+interval '14 days') AS returned,
 EXISTS(SELECT 1 FROM billing_periods p JOIN billing_subscriptions s ON s.id=p.subscription_id WHERE p.user_id=u.id AND s.mode='live' AND NOT p.revoked) AS paid
 FROM users u WHERE u.created_at>=now()-interval '90 days')`;
  const [outcomes, weeks] = await Promise.all([
    database.query(
      cohort +
        ` SELECT count(*)::int signups,count(*) FILTER(WHERE activated)::int activated,count(*) FILTER(WHERE paid)::int paid FROM cohort`,
    ),
    database.query(
      cohort +
        ` SELECT date_trunc('week',created_at)::date::text week,count(*)::int signups,count(*) FILTER(WHERE created_at<=now()-interval '14 days')::int eligible,count(*) FILTER(WHERE created_at<=now()-interval '14 days' AND activated)::int activated,count(*) FILTER(WHERE created_at<=now()-interval '14 days' AND activated AND returned)::int retained FROM cohort GROUP BY 1 ORDER BY 1 DESC LIMIT 14`,
    ),
  ]);
  return {
    outcomes: outcomes.rows[0],
    weeks: weeks.rows,
    scope:
      "Accounts created in the last 90 days. Activation = a recorded signed-in tool-use event in days 0–6. Repeat use = an activated account with another event in days 7–13; only accounts at least 14 days old enter that denominator. Paid = a non-revoked live billing period, excluding test payments. These records do not measure unique website visitors or unrecorded/offline use.",
  };
}
