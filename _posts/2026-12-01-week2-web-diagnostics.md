---
permalink: /guides/week-2/
study_guide: true
layout: post
title: "2주차 실습 가이드 · 웹 서버 접속 문제 진단하기"
date: 2026-12-01 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux]
---

**12/1(화) 이현종 · 12/3(목) 류현수**  
**교재** 《Do it! 리눅스 입문》 04-2(파일 찾기), 05-1·05-3(패키지와 프로세스), 06-2·06-3(문자 처리와 파이프라인), 07-2(환경 변수), 08-1(웹 요청). 원격 접속 사례는 11-4를 참고합니다.

## 준비 · 1주차 결과 확인

우분투 VM에서 실행합니다. 두 `diff`가 조용히 끝나면 1주차의 원본과 백업이 일치합니다. 차이가 있다면 원본을 확인하고 `./backup.sh`를 다시 실행하세요.

```bash
cd ~/linux-study/week1
diff -u site/index.html backup/index.html
diff -u "site/team intro.html" "backup/team intro.html"
mkdir -p ~/linux-study/week2/logs
cd ~/linux-study/week2
sudo apt update
sudo apt install python3 curl netcat-openbsd openssh-server
```

## 화요일 · 네 파트 시연

**발표 인계** — ①~③은 같은 VM과 같은 첫 터미널을 사용합니다. ①이 요청 로그를 보여 주고 셸을 인계하면 ②가 그 셸의 PID를 확인합니다. ③은 실제 포트에서 HTTP 200을 확인한 뒤 서버를 종료합니다. 추가 요청에만 두 번째 터미널을 씁니다. ④는 키로 접속한 계정명을 보여 줍니다.

### ① 로그에서 요청 한 건 찾기

실습 폴더에서 서버를 띄웁니다. `-u`는 출력을 즉시 기록하고 `2>&1`은 오류 출력으로 나오는 요청 기록도 같은 파일에 담습니다.

```bash
python3 -u -m http.server 8080 --bind 127.0.0.1 --directory ../week1/site >logs/tuesday.log 2>&1 &
server_pid=$!
curl -sS --retry 3 --retry-connrefused http://127.0.0.1:8080/index.html
find . -name "*.log"
head -n 3 logs/tuesday.log
tail -n 5 logs/tuesday.log
grep -rin 'get' logs | tail -n 2
tail -f logs/tuesday.log
```

다른 터미널에서 같은 주소에 `curl` 요청을 보내 새 로그 한 줄이 추가되는지 봅니다. 첫 터미널에서 Ctrl+C를 누르면 로그 따라가기만 끝납니다.

### ② 프로세스·메모리·패키지 확인

```bash
ps -ef | grep '[h]ttp.server'
ps -p "$server_pid" -o pid,cmd
free -h
apt list --installed curl
```

앞에서 쓴 `apt update`는 패키지 목록을 갱신하고 `apt install`은 선택한 패키지를 설치합니다. PID를 기록해 두고 ③을 마친 뒤 첫 터미널에서 `kill "$server_pid"`로 자신이 실행한 서버를 종료합니다.

### ③ 주소와 포트 확인

```bash
ss -tlnp
nc -zv 127.0.0.1 8080
curl -sS -o /dev/null -w '%{http_code}\n' http://127.0.0.1:8080/index.html
```

`ss`에서 대기 주소와 포트를, `nc`에서 TCP 연결을, `curl`에서 HTTP 200을 확인합니다. VM의 `127.0.0.1`은 VM 자신입니다. `0.0.0.0`으로 바인딩하면 모든 IPv4 인터페이스에서 대기하며 호스트 PC에서 접속할 수 있는지는 가상 네트워크 설정에도 달려 있습니다.

### ④ 환경 변수를 전달하고 SSH 키로 접속하기

```bash
echo "$HOME"
export STUDY_TOPIC=linux
bash -c 'echo "$STUDY_TOPIC"'
sudo systemctl start ssh
mkdir -p ~/.ssh
chmod 700 ~/.ssh
ssh-keygen -t ed25519 -f ~/.ssh/study-week2
ssh-copy-id -i ~/.ssh/study-week2.pub "$USER@localhost"
ssh -o PasswordAuthentication=no -i ~/.ssh/study-week2 "$USER@localhost" whoami
```

자기 VM의 계정으로 접속하는 예제입니다. 같은 이름의 키가 이미 있으면 생성 단계를 건너뜁니다. 최초 접속 시 대상이 자기 VM인지 확인하고, 공개키 등록 단계에서는 VM 계정 암호를 사용합니다. 마지막 명령에서 내 계정명이 나오면 키 인증에 성공한 것입니다.

## 목요일 · “안내받은 주소에서 페이지가 안 열려요”

**진행자 준비** — 각 VM에서 `ss -tln`으로 8080과 대체 포트가 비어 있는지 확인합니다. 진행자가 매번 다른 빈 포트를 고르고 팀원에게 값을 공개하지 않습니다. 화요일 서버는 먼저 종료하세요. 팀원에게는 안내 주소 `http://127.0.0.1:8080`만 전달합니다.

```bash
cd ~/linux-study/week2
read -rp "진행자가 선택한 빈 포트: " challenge_port
python3 -u -m http.server "$challenge_port" --bind 127.0.0.1 --directory ../week1/site >logs/challenge.log 2>&1 &
challenge_pid=$!
```

**팀원 과제** — 별도 터미널에서 실제 대기 포트를 찾고 아래 빈칸을 채웁니다. 첫 연결 실패는 의도된 증상입니다.

```bash
cd ~/linux-study/week2
curl --max-time 3 http://127.0.0.1:8080/index.html
ps -ef | grep '[h]ttp.server'
ss -tlnp
port=__1__
base="http://127.0.0.1:$port"
nc -zv 127.0.0.1 "$port"
curl -sS -o /dev/null -w '%{http_code}\n' "$base/__2__"
curl -sS -o /dev/null -w '%{http_code}\n' "$base/absent-week2.html"
grep '__3__' logs/challenge.log | tail -n 1
```

**힌트** — ① `ss` 출력의 포트, ② 1주차 소개 페이지 파일명, ③ 없는 파일을 요청했을 때의 상태 코드입니다.

**완료 기준**

- [ ] 실제 접속 주소와 200 응답을 기록하고 요청한 파일이 1주차 소개 페이지인지 확인했습니다.
- [ ] 없는 페이지의 404 응답과 요청 경로가 함께 찍힌 로그 한 줄을 제시했습니다.
- [ ] 잘못된 포트에서는 서버에 연결하지 못했고, 404에서는 서버가 요청을 받아 응답했다는 차이를 설명했습니다.

**정답 예시** — ① 해당 VM의 `ss -tlnp`에서 관찰한 값, ② `index.html`, ③ `404`. 팀 블로그에는 최초 증상, 실제 포트를 찾은 명령, 응답과 로그를 순서대로 남깁니다. 진행자는 서버를 시작했던 터미널에서 `kill "$challenge_pid"`로 정리합니다.

**다음 주 준비** — 우분투에 Docker Engine과 Compose 플러그인을 준비한 뒤 `docker run --rm hello-world`와 `docker compose version`을 실행합니다. VM에서 Docker에 관리자 권한이 필요한 경우 이번 과정의 Docker 명령에 `sudo`를 붙여 사용합니다. [우분투용 Docker 설치 안내](https://docs.docker.com/engine/install/ubuntu/)

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
