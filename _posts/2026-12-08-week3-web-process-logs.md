---
permalink: /guides/week-3/
study_guide: true
layout: post
title: "3주차 실습 가이드 · 소개 페이지를 서비스하고 요청 로그 읽기"
date: 2026-12-08 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux]
---

**12/8(화) 이현종 · 12/10(목) 류현수**  
**교재 범위** — 04-2(파일 찾기), 05-1·05-3(패키지·프로세스), 06-2·06-3(문자 처리·파이프라인), 08-1(웹 요청). [교재 상세 목차](https://bnk.kpipa.or.kr/home/v3/addition/adiPromoMetaDataView01/seq_20251128094118123120)

## 준비 · 2주차 백업 확인

우분투 VM에서 실행합니다. 두 `diff`가 조용히 끝나면 소개 페이지의 원본과 2주차 백업이 일치합니다. 차이가 있다면 원본을 확인하고 `./backup.sh`를 다시 실행하세요.

```bash
cd ~/linux-study/week1
diff -u site/index.html backup/index.html
diff -u "site/team intro.html" "backup/team intro.html"
mkdir -p ~/linux-study/week3/logs
cd ~/linux-study/week3
```

직접 관리하는 VM에서 아래 도구를 설치합니다. 제공받은 VM에서는 진행자가 설치를 맡습니다.

```bash
sudo apt update
sudo apt install python3 curl netcat-openbsd
```

## 화요일 · 웹 서버, PID와 로그 확인

### ① 웹 서버를 띄우고 요청 한 건 찾기

`~/linux-study/week3`에서 서버를 띄웁니다. `ss -tln`으로 8080이 비었는지 먼저 확인하세요. `-u`는 출력을 즉시 기록하고 `2>&1`은 오류 출력으로 나오는 요청 기록도 같은 파일에 담습니다.

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

앞에서 쓴 `apt update`는 패키지 목록을 갱신하고 `apt install`은 선택한 패키지를 설치합니다. PID와 로그를 확인한 뒤 서버를 시작한 터미널에서 `kill "$server_pid"`로 자신이 실행한 서버를 종료합니다.

## 목요일 · HTTP 응답과 로그 대조하기

화요일 서버를 정리한 상태에서 시작합니다. 같은 페이지와 존재하지 않는 경로를 한 번씩 요청하면 상태 코드와 로그가 어떻게 달라질지 적으세요. 아래는 같은 Bash 터미널에서 진행합니다.

```bash
mkdir -p ~/linux-study/week3/logs
cd ~/linux-study/week3
python3 -u -m http.server 8080 --bind 127.0.0.1 --directory ../week1/site >logs/thursday.log 2>&1 &
server_pid=$!
base=http://127.0.0.1:8080
curl -sS --retry 5 --retry-connrefused -o /dev/null -w '%{http_code}\n' "$base/index.html"
curl -sS -o /dev/null -w '%{http_code}\n' "$base/missing-week3.html"
grep -E 'GET /(index.html|missing-week3.html) ' logs/thursday.log
ps -p "$server_pid" -o pid,cmd
kill "$server_pid"
```

**완료 기준** — `/index.html`의 200과 `/missing-week3.html`의 404를 로그 두 줄에 대응시키고, 실행한 서버의 PID를 확인한 뒤 종료합니다. 다음 주에는 [안내된 포트가 다른 상황]({{ '/guides/week-4/' | relative_url }})을 진단합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
