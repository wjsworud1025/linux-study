---
permalink: /guides/week-7/
study_guide: true
layout: post
title: "7주차 실습 가이드 · 이미지를 빌드하고 컨테이너 이름으로 연결하기"
date: 2027-01-05 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**1/5(화) 이현종 · 이론 90분 / 1/7(목) 류현수 · 실습 60분**  
**교재 범위** — 07-2(환경 변수), 08-1(웹 동작) 복습과 Docker 빌드·브리지 네트워크 공식 문서. [Dockerfile 작성](https://docs.docker.com/get-started/docker-concepts/building-images/writing-a-dockerfile/) · [브리지 네트워크](https://docs.docker.com/engine/network/drivers/bridge/)

## 준비 · 소개 페이지와 Docker

[6주차 저장소 실습]({{ '/guides/week-6/' | relative_url }})에 사용한 VM에서 시작합니다. 빌드용 복사본을 편집합니다.

## 화요일 이론 · Dockerfile과 컨테이너 네트워크

| 시간 | 학습 내용 |
| --- | --- |
| 0~10분 | **이미지와 볼륨 복습** · 이미지에 포함된 파일과 마운트된 파일의 출처가 어떻게 다른지 확인합니다. |
| 10~35분 | **Dockerfile과 빌드 캐시** · FROM·WORKDIR·RUN·COPY, 기본 실행 명령, 빌드 컨텍스트를 읽고 변경 시 다시 실행될 레이어를 찾습니다. |
| 35~60분 | **브리지와 이름 해석** · 기본·사용자 정의 브리지, 컨테이너 이름 해석, 같은 네트워크 내 통신과 호스트 포트 게시를 구분합니다. |
| 60~80분 | **페이지 수정 후 요청 추적** · 진행자가 파일을 수정하고 다시 빌드한 뒤 다른 컨테이너에서 이름으로 웹에 접속합니다. 조원은 캐시와 응답 내용을 예상합니다. |
| 80~90분 | **목요일 검증 계획** · 빌드 출력의 다시 실행한 단계, 변경 문구, 호스트 포트 게시 여부를 기록할 방법을 정합니다. |

아래 명령은 진행자의 시연 자료입니다. 결과를 먼저 예상하고 실제 출력에서 판단 근거를 찾습니다.

### ① Dockerfile로 페이지를 이미지에 넣기

```bash
mkdir -p ~/linux-study/week7/site
cd ~/linux-study/week7
cp ~/linux-study/week1/site/index.html site/
cat > Dockerfile <<'EOF'
FROM nginx:alpine
WORKDIR /usr/share/nginx/html
RUN nginx -v
COPY site/ ./
EOF
docker build --progress=plain -t study-page:w7 .
docker image history study-page:w7
```

`FROM`은 기본 이미지, `WORKDIR`는 작업 위치, `RUN`은 빌드할 때 실행하는 단계, `COPY`는 이미지에 파일을 넣는 단계입니다. 웹 서버를 시작하는 기본 명령은 기반 이미지의 `ENTRYPOINT`와 `CMD`에서 가져옵니다. `ENTRYPOINT`는 진입점을 정하고 `CMD`는 기본 명령이나 인수를 제공합니다.

### ② 포트를 게시하지 않고 이름으로 웹 서버에 접속하기

```bash
docker network inspect bridge
docker network create w7-net
docker run -d --name w7-page --network w7-net study-page:w7
docker run --rm --network w7-net alpine:3 wget -T 5 -qO- http://w7-page/
docker logs --tail 5 w7-page
docker stop w7-page
docker rm w7-page
docker network rm w7-net
```

같은 사용자 정의 네트워크의 컨테이너는 이름을 해석할 수 있습니다. 웹이 시작되기 전에 연결했다면 같은 wget 명령을 한 번 더 실행합니다. 8주차에는 Compose로 만든 네트워크에서 웹이 `db`라는 서비스 이름으로 연결합니다.

## 목요일 실습 · 페이지를 바꿔 다시 빌드하고 네트워크 검증

**60분 운영** · 복습·준비 10분, 직접 실습 30분, 결과 비교 15분, 정리 5분

앞선 이론의 ① 빌드 명령을 자기 VM에서 실행해 초기 이미지와 빌드 폴더를 준비합니다. 페이지를 바꿔 다시 빌드하고 이름 기반 통신을 검증합니다.

아래 명령으로 수정한 페이지를 새 이미지에 넣습니다. 페이지를 바꿨을 때 어떤 빌드 단계가 캐시되고 어떤 단계가 다시 실행될지 먼저 예상하세요.

```bash
cd ~/linux-study/week7
printf '%s\n' '<p>week7-build-check</p>' >> site/index.html
docker build --progress=plain -t study-page:w7 .
docker network create w7-check-net
docker run -d --name w7-check-web --network w7-check-net study-page:w7
docker run --rm --network w7-check-net alpine:3 wget -T 5 -qO- http://w7-check-web/ | grep -F 'week7-build-check'
docker port w7-check-web
docker stop w7-check-web
docker rm w7-check-web
docker network rm w7-check-net
```

**완료 기준** — 수정된 문구가 응답에 나타나고 `docker port`에 호스트 포트가 표시되지 않습니다. 빌드 출력에서 캐시된 단계와 다시 실행한 단계를 각각 한 줄씩 남깁니다.

**심화 시연** — 진행자는 이름과 태그를 붙인 이미지를 Docker Hub에 게시하는 흐름을 보여 줄 수 있습니다. [Docker 이미지 게시 문서](https://docs.docker.com/get-started/docker-concepts/building-images/build-tag-and-publish-an-image/)

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
