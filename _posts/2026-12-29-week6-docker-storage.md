---
permalink: /guides/week-6/
study_guide: true
layout: post
title: "6주차 실습 가이드 · 컨테이너를 교체하고 데이터가 남는 위치 찾기"
date: 2026-12-29 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**12/29(화) 이현종 · 이론 90분 / 12/31(목) 류현수 · 실습 60분**  
**교재 범위** — 03장(경로) 복습과 Docker 저장소 공식 문서. [Docker 저장소 개요](https://docs.docker.com/engine/storage/)

## 준비 · 같은 페이지를 다른 서버에서 열기

[5주차 컨테이너 실습]({{ '/guides/week-5/' | relative_url }})에서 사용한 Ubuntu VM을 준비합니다. 우분투 VM에서 `cat ~/linux-study/week1/site/index.html`로 소개 페이지를 확인합니다. `docker version`에 Client와 Server가 모두 나오고 `docker compose version`이 성공해야 합니다. VM에서 Docker 접근에 관리자 권한이 필요하면 `sudo`를 붙입니다. `ss -tln`에서 8080이 비어 있는지 확인합니다. 앞 주의 서버가 남아 있다면 해당 서버를 실행한 터미널에서 종료하세요.

## 화요일 이론 · 두 저장소 연결하기

| 시간 | 학습 내용 |
| --- | --- |
| 0~10분 | **컨테이너 수명 주기 복습** · 같은 컨테이너를 중지했다가 시작하는 경우와 새 컨테이너로 교체하는 경우를 구분합니다. |
| 10~35분 | **컨테이너 쓰기 영역** · 이미지와 실행 중 추가한 파일의 관계를 설명하고, 제거 전후의 파일 존재 여부를 예측합니다. |
| 35~60분 | **바인드 마운트와 볼륨** · 호스트 경로를 연결하는 방식과 Docker가 관리하는 볼륨의 위치·수명·재연결 방식을 비교합니다. |
| 60~80분 | **세 위치의 파일 추적** · 진행자가 같은 파일을 세 위치에 쓰고 새 컨테이너에 저장소를 다시 연결합니다. 조원은 결과 표를 먼저 채웁니다. |
| 80~90분 | **저장 방식 선택** · 소개 페이지 편집과 DB 데이터 보존에 맞는 저장소를 고르고 선택 이유를 한 문장으로 설명합니다. |

아래 명령은 진행자의 시연 자료입니다. 결과를 먼저 예상하고 실제 출력에서 판단 근거를 찾습니다.

### ① 바인드 마운트에서 페이지 변경 확인

```bash
mkdir -p ~/linux-study/week6
cd ~/linux-study/week6
mkdir -p demo-site
cp ~/linux-study/week1/site/index.html demo-site/
docker volume create w6-demo-data
docker run -d --name w6-mounted -p 127.0.0.1:8080:80 \
  -v "$PWD/demo-site:/usr/share/nginx/html:ro" \
  -v w6-demo-data:/data nginx:alpine
curl -fsS --retry 5 --retry-connrefused http://127.0.0.1:8080/index.html
printf '%s\n' '<p>컨테이너 시연</p>' >> demo-site/index.html
curl -fsS http://127.0.0.1:8080/index.html | tail -n 1
```

### ② 이름 있는 볼륨에서 기록 확인

같은 터미널에서 웹 컨테이너의 `/data`에 기록하고, 새 컨테이너에서 그 값을 읽습니다.

```bash
docker exec w6-mounted sh -c 'echo Tuesday > /data/day'
docker stop w6-mounted
docker rm w6-mounted
docker run --rm -v w6-demo-data:/data alpine:3 cat /data/day
```

바인드 마운트는 VM에서 편집한 페이지를 즉시 제공하고, 볼륨에는 컨테이너를 제거한 뒤에도 `Tuesday`가 남습니다.

## 목요일 실습 · 세 위치에 쓴 파일의 운명 예측하기

**60분 운영** · 복습·준비 10분, 직접 실습 30분, 결과 비교 15분, 정리 5분

세 저장 위치를 복습한 뒤, 자기 VM에서 두 컨테이너를 교체하며 어느 값이 남는지 확인합니다.

먼저 아래 표의 예상 칸을 채웁니다. 각자 자기 VM에서 진행하고, 한 터미널에서 아래 블록을 차례로 실행합니다. 고유한 볼륨 이름을 써서 새 실험과 이전 결과를 구별합니다.

| 첫 컨테이너의 기록 위치 | 교체 후 예상 | 직접 확인한 결과 |
| --- | --- | --- |
| 컨테이너 쓰기 영역 `/tmp/layer.txt` | | |
| 호스트 폴더를 연결한 `/site/bind.txt` | | |
| 이름 있는 볼륨의 `/data/volume.txt` | | |

```bash
mkdir -p ~/linux-study/week6
cd ~/linux-study/week6
lab=$(mktemp -d "$PWD/replace-XXXXXX")
cp -r ~/linux-study/week1/site "$lab/site"
vol="w6-$(basename "$lab" | tr '[:upper:]' '[:lower:]')"
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

**정답** — ① `$lab/site`, ② `$vol`. [8주차]({{ '/guides/week-8/' | relative_url }})에는 웹과 DB의 이미지·포트·볼륨을 Compose 파일에 기록합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
