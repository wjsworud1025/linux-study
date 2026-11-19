set -euo pipefail
mkdir -p site
printf '%s\n' '<h1>스터디 소개</h1>' > site/index.html
python3 -u -m http.server 18763 --bind 127.0.0.1 --directory site > requests.log 2>&1 &
pid=$!
trap 'kill "$pid"' EXIT
for n in {1..30}; do ss -ltn | grep -q ':18763 ' && break; sleep .2; done
printf '안내 포트: '
curl -s --max-time 2 http://127.0.0.1:8080/ -o /dev/null || printf 'curl 종료 코드 %s\n' "$?"
ss -ltnp | grep "pid=$pid,"
port=$(ss -ltnp | awk -v p="pid=$pid," 'index($0,p){sub(/^.*:/,"",$4);print $4;exit}')
base="http://127.0.0.1:$port"
printf '실제 주소 %s\n' "$base/index.html"
curl -sS -w 'HTTP %{http_code}\n' "$base/index.html"
curl -sS -o /dev/null -w '없는 페이지 HTTP %{http_code}\n' "$base/absent-week2.html"
grep 'GET /absent-week2.html' requests.log
