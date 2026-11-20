---
permalink: /guides/week-5/
study_guide: true
layout: post
title: "5주차 실습 가이드 · 이미지로 컨테이너를 띄우고 웹 요청 관찰하기"
date: 2026-12-22 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**12/22(화) 이현종 · 이론 90분 / 12/24(목) 류현수 · 실습 60분**  
**교재 범위** — 02-1(VM), 05-3(프로세스) 복습과 Docker 입문 워크숍. [Docker 입문 워크숍](https://docs.docker.com/learn/paths/get-started-with-docker-containers/)

## 준비 · 같은 페이지를 다른 서버에서 열기

[4주차의 Docker 사전 과제]({{ '/guides/week-4/' | relative_url }})를 모임 전에 마칩니다. 우분투 VM에서 `cat ~/linux-study/week1/site/index.html`로 소개 페이지를 확인합니다. `docker version`에 Client와 Server가 모두 나오고 `docker compose version`이 성공해야 합니다. VM에서 Docker 접근에 관리자 권한이 필요하면 `sudo`를 붙입니다. `ss -tln`에서 8080이 비어 있는지 확인합니다. 앞 주의 서버가 남아 있다면 해당 서버를 실행한 터미널에서 종료하세요.

## 화요일 이론 · 이미지, 컨테이너와 포트 매핑

| 시간 | 학습 내용 |
| --- | --- |
| 0~10분 | **VM과 프로세스 복습** · 리눅스 프로세스와 VM에서 서비스가 격리되는 범위를 떠올립니다. |
| 10~35분 | **이미지와 컨테이너** · 이미지 레이어, 컨테이너 쓰기 영역, 공유 커널과 격리, 컨테이너 중지·시작·제거를 설명합니다. |
| 35~60분 | **포트 매핑과 로그** · VM 포트와 컨테이너 포트가 연결되는 방식, docker ps·port·logs가 확인하는 정보를 비교합니다. |
| 60~80분 | **Nginx 요청 추적** · 진행자가 이미지에서 웹 컨테이너를 실행하고 8080 요청을 확인합니다. 조원은 포트 매핑 변경 시 접속 주소를 예측합니다. |
| 80~90분 | **목요일 포트 예측** · 8081:80의 두 포트가 의미하는 위치와 확인할 로그를 적습니다. |

아래 명령은 진행자의 시연 자료입니다. 결과를 먼저 예상하고 실제 출력에서 판단 근거를 찾습니다.

### ① 하나의 VM에서 두 컨테이너 실행하기

```bash
docker run -d --name w5-one alpine:3 sleep 600
docker run -d --name w5-two alpine:3 sleep 600
docker exec w5-one uname -r
uname -r
docker exec w5-one ps
docker exec w5-two ps
```

우분투 VM과 두 컨테이너의 관계를 그려 봅니다. VM은 자체 커널을 실행하고, 이 컨테이너들은 VM의 커널을 공유합니다. PID namespace는 각 컨테이너가 볼 수 있는 프로세스 범위를 나눕니다. cgroup은 CPU·메모리 등 자원 사용량을 집계하고 제한하는 데 쓰입니다.

#### 이미지가 같아도 파일이 따로 생기는 이유

```bash
docker pull nginx:alpine
docker images
docker exec w5-one touch /tmp/only-one
docker exec w5-one ls /tmp/only-one
docker exec w5-two ls /tmp/only-one
docker image history nginx:alpine
docker stop w5-one
docker start w5-one
docker exec w5-one ls /tmp/only-one
docker stop w5-one w5-two
docker rm w5-one w5-two
docker tag nginx:alpine w5-image-demo:local
docker rmi w5-image-demo:local
```

두 번째 `ls`의 파일 없음 오류가 예상 결과입니다. 재시작한 w5-one의 마지막 ls에서 같은 파일이 남았는지 확인합니다. 6주차에는 이 결과를 새 컨테이너의 저장소와 대조합니다. 읽기 전용 이미지 레이어는 공유하지만 각 컨테이너의 쓰기 영역은 별도입니다. 마지막 두 명령은 실습용 태그를 붙였다가 제거합니다.

### ② 웹 서버의 포트·로그·내부 파일 관찰하기

```bash
docker run -d --name w5-web -p 127.0.0.1:8080:80 nginx:alpine
docker ps
curl -sS --retry 5 --retry-connrefused -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/
docker logs --tail 5 w5-web
docker exec -it w5-web sh
```

컨테이너 셸에서 `ls /usr/share/nginx/html` 후 `exit`로 돌아옵니다. `8080:80`은 VM의 8080번을 컨테이너의 80번으로 연결합니다.

```bash
docker stop w5-web
docker ps -a
docker rm w5-web
```

## 목요일 실습 · 새 포트에서 내 소개 페이지 열기

**60분 운영** · 복습·준비 10분, 직접 실습 30분, 결과 비교 15분, 정리 5분

포트 매핑을 복습한 뒤, 자기 VM에서 다른 호스트 포트로 소개 페이지를 제공하고 로그를 확인합니다.

`ss -tln`으로 8081이 비었는지 확인합니다. 이번 요청이 호스트의 어느 포트에서 컨테이너의 어느 포트로 전달되는지 먼저 적으세요.

```bash
docker run -d --name w5-verify -p 127.0.0.1:8081:80 nginx:alpine
docker cp ~/linux-study/week1/site/index.html w5-verify:/usr/share/nginx/html/index.html
curl -fsS --retry 5 --retry-connrefused -w '\nHTTP %{http_code}\n' http://127.0.0.1:8081/index.html
docker port w5-verify
docker logs --tail 5 w5-verify
docker stop w5-verify
docker rm w5-verify
```

**완료 기준** — 개인 소개 페이지와 HTTP 200을 확인하고, 포트 매핑과 웹 로그를 함께 기록합니다. 다음 주에는 [컨테이너를 교체해도 데이터가 남는 조건]({{ '/guides/week-6/' | relative_url }})을 확인합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
