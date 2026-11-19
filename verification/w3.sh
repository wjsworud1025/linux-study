set -euo pipefail
mkdir -p "$PWD/bind-site"
vol=$(docker volume create)
docker run -d --name writer -v "$PWD/bind-site:/site" -v "$vol:/data" alpine:3 sleep 600 >/dev/null
docker exec writer sh -ec 'echo layer >/tmp/layer.txt; echo bind >/site/bind.txt; echo volume >/data/volume.txt; cat /tmp/layer.txt /site/bind.txt /data/volume.txt'
docker stop writer >/dev/null
docker start writer >/dev/null
printf '동일 컨테이너 재시작: '
docker exec writer cat /tmp/layer.txt
docker rm -f writer >/dev/null
docker run --rm -v "$PWD/bind-site:/site:ro" -v "$vol:/data:ro" alpine:3 sh -ec '
  test ! -e /tmp/layer.txt
  echo "쓰기 영역 파일 없음"
  cat /site/bind.txt /data/volume.txt
'
