#!/usr/bin/env bash
set -euo pipefail
mkdir -p logs
python3 - <<'EOF'
import random, datetime
random.seed(7)
t = datetime.datetime(2026, 11, 9, 8, 0, 0)
end = datetime.datetime(2026, 11, 9, 18, 0, 0)
svcs = ["api", "worker", "payments", "auth", "cache"]
deploy = datetime.datetime(2026, 11, 9, 14, 2, 55)
first_fail = datetime.datetime(2026, 11, 9, 14, 3, 17)
lines = []
done_deploy = done_first = False
while t < end:
    t += datetime.timedelta(milliseconds=random.randint(80, 900))
    if not done_deploy and t >= deploy:
        lines.append(f"{deploy.isoformat()} INFO  config: reload from deploy 4821 (db.pool_size 50 -> 20, cache.ttl 300 -> 300)")
        done_deploy = True
    if not done_first and t >= first_fail:
        lines.append(f"{first_fail.isoformat()} ERROR payments: charge failed order=88213 cause=PoolExhausted(max_connections=20, waiting=7)")
        done_first = True
    s = random.choice(svcs)
    r = random.random()
    if t > first_fail and s == "payments" and r < 0.18:
        lines.append(f"{t.isoformat()} ERROR payments: charge failed order={random.randint(80000,99999)} cause=PoolExhausted(max_connections=20, waiting={random.randint(1,15)})")
    elif s == "cache" and r < 0.03:
        lines.append(f"{t.isoformat()} ERROR cache: timeout talking to redis-2, retrying (attempt 1/3) -> recovered")
    elif r < 0.06:
        lines.append(f"{t.isoformat()} WARN  {s}: slow request path=/v1/{random.choice(['orders','users','items'])} took={random.randint(800,2500)}ms")
    elif r < 0.55:
        lines.append(f"{t.isoformat()} DEBUG {s}: tick id={random.getrandbits(48):012x} queue={random.randint(0,40)} mem={random.randint(200,900)}MB")
    else:
        lines.append(f"{t.isoformat()} INFO  {s}: handled request id={random.getrandbits(48):012x} status=200 in {random.randint(3,400)}ms")
with open("logs/app.log", "w") as fh:
    fh.write("\n".join(lines) + "\n")
EOF
