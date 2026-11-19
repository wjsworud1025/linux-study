set -euo pipefail
docker compose config --quiet
docker compose up -d --build --wait >/dev/null
base=http://127.0.0.1:8080
docker inspect -f '{{.State.Health.Status}}' "$(docker compose ps -q db)"
curl -fsS --retry 5 --retry-connrefused "$base/"
echo
before=$(curl -fsS "$base/visits" | tail -n 1)
test -n "$before"
printf '종료 전 방문 번호: %s\n' "$before"
docker compose logs web | grep '"GET / HTTP' | tail -n 1
old=$(docker compose ps -q db)
docker compose down >/dev/null
docker compose up -d --wait >/dev/null
test "$old" != "$(docker compose ps -q db)"
printf '새 DB 컨테이너에서 읽은 방문 번호: '
curl -fsS --retry 5 --retry-connrefused "$base/visits" | grep -Fx "$before"
docker compose down >/dev/null
