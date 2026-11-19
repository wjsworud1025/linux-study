---
permalink: /guides/week-3/
study_guide: true
layout: post
title: "3주차 실습 가이드 · 컨테이너를 교체해도 소개 페이지 유지하기"
date: 2026-12-08 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**12/8(화) 이현종 · 12/10(목) 류현수**  
**교재** 《Do it! 리눅스 입문》 02-1(VM), 05-3(프로세스), 08-1(웹 요청) 복습. 도커 실습은 [Docker 입문 워크숍](https://docs.docker.com/learn/paths/get-started-with-docker-containers/)과 [저장소 문서](https://docs.docker.com/engine/storage/)를 참고합니다.

## 준비 · 같은 페이지를 다른 서버에서 열기

우분투 VM에서 `cat ~/linux-study/week1/site/index.html`로 소개 페이지를 확인합니다. `docker version`에 Client와 Server가 모두 나오고 `docker compose version`이 성공해야 합니다. `ss -tln`에서 8080이 비어 있는지 확인합니다. 앞 주의 서버가 남아 있다면 해당 서버를 실행한 터미널에서 종료하세요.

## 화요일 · 네 파트 시연

### ① 하나의 VM에서 두 컨테이너 실행하기

```bash
docker run -d --name w3-one alpine:3 sleep 600
docker run -d --name w3-two alpine:3 sleep 600
docker exec w3-one uname -r
uname -r
docker exec w3-one ps
docker exec w3-two ps
```

우분투 VM과 두 컨테이너의 관계를 그려 봅니다. VM은 자체 커널을 실행하고, 이 컨테이너들은 VM의 커널을 공유합니다. PID namespace는 각 컨테이너가 볼 수 있는 프로세스 범위를 나눕니다. cgroup은 CPU·메모리 등 자원 사용량을 집계하고 제한하는 데 쓰입니다.

### ② 같은 이미지를 써도 파일이 따로 생기는 이유

```bash
docker pull nginx:alpine
docker images
docker exec w3-one touch /tmp/only-one
docker exec w3-one ls /tmp/only-one
docker exec w3-two ls /tmp/only-one
docker image history nginx:alpine
docker stop w3-one
docker start w3-one
docker exec w3-one ls /tmp/only-one
docker stop w3-one w3-two
docker rm w3-one w3-two
docker tag nginx:alpine w3-image-demo:local
docker rmi w3-image-demo:local
```

두 번째 `ls`의 파일 없음 오류가 예상 결과입니다. 재시작한 w3-one의 마지막 ls에서 같은 파일이 남았는지 확인합니다. 목요일에는 새 컨테이너의 결과와 대조하세요. 읽기 전용 이미지 레이어는 공유하지만 각 컨테이너의 쓰기 영역은 별도입니다. 마지막 두 명령은 실습용 태그를 붙였다가 제거합니다.

### ③ 웹 서버의 포트·로그·내부 파일 관찰하기

```bash
docker run -d --name w3-web -p 127.0.0.1:8080:80 nginx:alpine
docker ps
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/
docker logs --tail 5 w3-web
docker exec -it w3-web sh
```

컨테이너 셸에서 `ls /usr/share/nginx/html` 후 `exit`로 돌아옵니다. `8080:80`은 VM의 8080번을 컨테이너의 80번으로 연결합니다.

```bash
docker stop w3-web
docker ps -a
docker rm w3-web
```

### ④ 바인드 마운트와 이름 있는 볼륨 연결하기

```bash
mkdir -p ~/linux-study/week3
cd ~/linux-study/week3
cp -r ~/linux-study/week1/site ./demo-site
docker volume create w3-demo-data
docker run -d --name w3-mounted -p 127.0.0.1:8080:80 \
  -v "$PWD/demo-site:/usr/share/nginx/html:ro" \
  -v w3-demo-data:/data nginx:alpine
curl -fsS http://127.0.0.1:8080/index.html
printf '%s\n' '<p>컨테이너 시연</p>' >> demo-site/index.html
curl -fsS http://127.0.0.1:8080/index.html | tail -n 1
docker exec w3-mounted sh -c 'echo Tuesday > /data/day'
docker stop w3-mounted
docker rm w3-mounted
docker run --rm -v w3-demo-data:/data alpine:3 cat /data/day
```

최초 실습은 `demo-site`가 없는 상태에서 시작합니다. 재시연할 때는 기존 복사본을 사용하세요. 바인드 마운트는 VM에서 편집한 페이지를 즉시 제공하고, 볼륨에는 컨테이너를 제거한 뒤에도 `Tuesday`가 남습니다.

## 목요일 · 세 위치에 쓴 파일의 운명 예측하기

먼저 아래 표의 예상 칸을 채웁니다. 각자 자기 VM에서 진행하고, 한 터미널에서 아래 블록을 차례로 실행합니다. 고유한 볼륨 이름을 써서 새 실험과 이전 결과를 구별합니다.

| 첫 컨테이너의 기록 위치 | 교체 후 예상 | 직접 확인한 결과 |
| --- | --- | --- |
| 컨테이너 쓰기 영역 `/tmp/layer.txt` | | |
| 호스트 폴더를 연결한 `/site/bind.txt` | | |
| 이름 있는 볼륨의 `/data/volume.txt` | | |

```bash
cd ~/linux-study/week3
lab=$(mktemp -d "$PWD/replace-XXXXXX")
cp -r ~/linux-study/week1/site "$lab/site"
vol="w3-$(basename "$lab" | tr '[:upper:]' '[:lower:]')"
docker volume create "$vol"
docker run --rm -v "$lab/site:/site" -v "$vol:/data" alpine:3 sh -ec '
  echo layer > /tmp/layer.txt
  echo bind > /site/bind.txt
  echo volume > /data/volume.txt
  cat /tmp/layer.txt /site/bind.txt /data/volume.txt
'
```

`--rm`은 기록을 마치고 종료된 첫 컨테이너를 제거합니다. **빈칸 과제** — 두 번째 컨테이너에 같은 두 저장소를 연결해 결과를 확인하세요.

```bash
docker run --rm -v "__1__:/site:ro" -v "__2__:/data:ro" alpine:3 sh -ec '
  test ! -e /tmp/layer.txt && echo "쓰기 영역 파일 없음"
  cat /site/bind.txt
  cat /data/volume.txt
'
```

**힌트** — ① 첫 컨테이너에서 연결한 VM 디렉터리, ② 앞서 만든 볼륨 이름을 담은 변수입니다.

**완료 기준**

- [ ] 첫 컨테이너에서 세 파일의 내용을 확인한 뒤 새 컨테이너에서 `쓰기 영역 파일 없음`, `bind`, `volume`을 확인했습니다.
- [ ] 팀 블로그에 세 가지 예상과 실제 결과를 표로 작성했습니다. 중지 후 재시작하는 경우와 제거 후 새로 만드는 경우의 차이를 설명했습니다.
- [ ] 페이지 편집에는 호스트에서 수정할 수 있는 바인드 마운트를, DB에는 컨테이너와 별도로 유지할 이름 있는 볼륨을 선택하는 이유를 각각 설명했습니다.

**정답** — ① `$lab/site`, ② `$vol`. 4주차에는 컨테이너를 실행할 때마다 직접 입력했던 이미지·포트·볼륨 설정을 Compose 파일에 기록합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
