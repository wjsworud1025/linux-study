---
permalink: /guides/week-4/
study_guide: true
layout: post
title: "4주차 실습 가이드 · 포트 장애를 진단하고 SSH로 접속하기"
date: 2026-12-15 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux]
---

**12/15(화) 이현종 · 12/17(목) 류현수**  
**교재 범위** — 07-2(환경 변수), 08-1(웹 요청), 09-1(IP 주소와 사설 네트워크), 11-4(원격 접속 사례). [Ubuntu OpenSSH 안내](https://documentation.ubuntu.com/server/how-to/security/openssh-server/)

## 준비 · 로컬 서버와 SSH

[3주차에서 쓰던 소개 페이지]({{ '/guides/week-3/' | relative_url }})와 도구를 사용합니다. Compose와 동료 검증 절차는 [8주차 최종 가이드]({{ '/guides/week-8/' | relative_url }})에 있습니다.

`ss -tln`으로 8080이 비었는지 확인합니다. 이전 실습 서버가 남아 있으면 그 서버를 실행한 터미널에서 종료합니다. 직접 관리하는 VM에서는 아래 명령으로 SSH 서버를 준비합니다. 제공받은 VM에서는 진행자가 설치와 서비스 시작을 맡습니다.

```bash
sudo apt update
sudo apt install openssh-server
sudo systemctl start ssh
```

## 화요일 · 포트 확인과 SSH 키 인증

포트 시연 전에 아래 서버를 띄웁니다. 같은 터미널에서 ①을 완료하고 `kill "$server_pid"`로 종료한 뒤 ②로 이동합니다.

```bash
mkdir -p ~/linux-study/week4/logs
cd ~/linux-study/week4
python3 -u -m http.server 8080 --bind 127.0.0.1 --directory ../week1/site >logs/tuesday.log 2>&1 &
server_pid=$!
```

### ① 주소와 포트 확인

```bash
ss -tlnp
nc -zv 127.0.0.1 8080
curl -sS --retry 5 --retry-connrefused -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/index.html
```

`ss`에서 대기 주소와 포트를, `nc`에서 TCP 연결을, `curl`에서 HTTP 200을 확인합니다. VM의 `127.0.0.1`은 VM 자신입니다. `0.0.0.0`으로 바인딩하면 모든 IPv4 인터페이스에서 대기하며 호스트 PC에서 접속할 수 있는지는 가상 네트워크 설정에도 달려 있습니다.

### ② 환경 변수를 전달하고 SSH 키로 접속하기

```bash
echo "$HOME"
export STUDY_TOPIC=linux
bash -c 'echo "$STUDY_TOPIC"'
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/study-week4
ssh-copy-id -i ~/.ssh/study-week4.pub "$USER@localhost"
ssh -o PasswordAuthentication=no -i ~/.ssh/study-week4 "$USER@localhost" whoami
```

자기 VM의 계정으로 접속하는 예제입니다. 같은 이름의 키가 이미 있으면 생성 단계를 건너뜁니다. 최초 접속 시 대상이 자기 VM인지 확인하고, 공개키 등록 단계에서는 VM 계정 암호를 사용합니다. 마지막 명령에서 내 계정명이 나오면 키 인증에 성공한 것입니다.

## 목요일 · “안내받은 주소에서 페이지가 안 열려요”

**30분 과제 · 2인 1조** — 한 조가 하나의 Ubuntu VM과 터미널 두 개를 사용합니다. 준비·진단을 12분씩 두 번 진행하고, 남은 6분에 두 결과를 비교하고 정리합니다. 첫 검증이 끝나면 준비자가 서버를 종료하고 역할을 바꿉니다.

**준비자** — `ss -tln`으로 8080과 대체 포트가 비어 있는지 확인하고, 화요일 서버가 남아 있으면 먼저 종료합니다. 8080이 아닌 빈 포트를 골라 준비 터미널에서 아래 명령을 실행합니다. 진단자에게는 `http://127.0.0.1:8080`만 전달합니다. 두 번째 준비자는 다른 빈 포트를 사용합니다.

```bash
mkdir -p ~/linux-study/week4/logs
cd ~/linux-study/week4
read -rp "준비자가 선택한 빈 포트: " challenge_port
python3 -u -m http.server "$challenge_port" --bind 127.0.0.1 --directory ../week1/site >logs/challenge.log 2>&1 &
challenge_pid=$!
```

**진단자** — 같은 VM의 별도 터미널에서 실제 대기 포트를 찾고 아래 빈칸을 채웁니다. 첫 연결 실패는 의도된 증상입니다.

```bash
cd ~/linux-study/week4
curl --max-time 3 http://127.0.0.1:8080/index.html
ps -ef | grep '[h]ttp.server'
ss -tlnp
port=__1__
base="http://127.0.0.1:$port"
nc -zv 127.0.0.1 "$port"
curl -sS -o /dev/null -w '%{http_code}\n' "$base/__2__"
curl -sS -o /dev/null -w '%{http_code}\n' "$base/absent-week4.html"
grep '__3__' logs/challenge.log | tail -n 1
```

**힌트** — ① `ss` 출력의 포트, ② 1주차 소개 페이지 파일명, ③ 없는 파일을 요청했을 때의 상태 코드입니다.

**완료 기준**

- [ ] 실제 접속 주소와 200 응답을 기록하고 요청한 파일이 1주차 소개 페이지인지 확인했습니다.
- [ ] 없는 페이지의 404 응답과 요청 경로가 함께 찍힌 로그 한 줄을 제시했습니다.
- [ ] 잘못된 포트에서는 서버에 연결하지 못했고, 404에서는 서버가 요청을 받아 응답했다는 차이를 설명했습니다.

**정답 예시** — ① 해당 VM의 `ss -tlnp`에서 관찰한 값, ② `index.html`, ③ `404`. 팀 블로그에는 최초 증상, 실제 포트를 찾은 명령, 응답과 로그를 순서대로 남깁니다. 준비자는 서버를 시작했던 터미널에서 `kill "$challenge_pid"`로 정리합니다. 역할을 바꾸기 전 필요한 로그 한 줄을 개인 기록에 옮깁니다.

**5주차 사전 과제 · 30~45분** — 12/22(화) 모임 전에 자신의 우분투 VM에 Docker Engine과 Compose 플러그인을 설치합니다. `docker run --rm hello-world`가 성공하고 `docker compose version`에 버전이 출력되면 준비 완료입니다. Docker 접근 권한을 따로 설정하지 않은 경우 `sudo docker run --rm hello-world`로 확인하고 이후 Docker 명령에도 `sudo`를 붙입니다. 제공받은 VM에서는 진행자가 설치를 담당합니다. 안내받은 방법으로 두 확인 명령을 실행하고, 막히면 실행한 명령과 오류를 진행자에게 공유하세요. [우분투용 Docker 설치 안내](https://docs.docker.com/engine/install/ubuntu/)

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
