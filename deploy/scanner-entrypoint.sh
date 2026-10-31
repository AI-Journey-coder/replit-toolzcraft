#!/bin/sh
set -eu
# A cold instance must obtain verified signatures before accepting scan requests.
freshclam --stdout
freshclam --daemon --foreground --stdout &
updater=$!
clamd --config-file=/etc/clamav/toolzcraft.conf &
scanner=$!
python3 /usr/local/bin/scanner-health.py &
health=$!
trap 'kill "$scanner" "$updater" "$health" 2>/dev/null || true' EXIT TERM INT
while kill -0 "$scanner" 2>/dev/null && kill -0 "$updater" 2>/dev/null && kill -0 "$health" 2>/dev/null; do
  newest=0
  for file in /var/lib/clamav/daily.cvd /var/lib/clamav/daily.cld; do
    if [ -f "$file" ]; then stamp=$(stat -c %Y "$file"); if [ "$stamp" -gt "$newest" ]; then newest=$stamp; fi; fi
  done
  if [ "$newest" -eq 0 ] || [ $(( $(date +%s) - newest )) -gt 604800 ]; then
    echo 'Scanner disabled: signatures missing or older than seven days.' >&2
    exit 1
  fi
  sleep 60 & wait $!
done
exit 1
