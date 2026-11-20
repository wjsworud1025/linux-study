---
layout: post
study_example: true
title: "4주차 작성 예시 · 서버는 살아 있는데 왜 안내 주소가 열리지 않을까?"
author: "스터디 작성 예시"
categories: [study]
tags: [실습기록]
---

## 화요일 전 · 개념과 시연 준비

**이번 주 질문** — 서버는 살아 있는데 왜 안내 주소가 열리지 않을까?

| 파트 | 핵심 개념을 내 말로 | 확인할 명령 또는 관찰할 결과 |
| --- | --- | --- |
| ① 주소와 포트 | TCP 연결이 성립한 뒤 HTTP 응답을 주고받는다. | `ss -ltnp`와 `curl`로 수신 포트와 HTTP 상태를 대조한다. |
| ② 환경 변수와 SSH | 키 인증에서는 계정에 등록한 공개키로 접속자를 확인한다. | 접속 후 `whoami`를 실행한다. |

**시연할 장면** — 안내받은 포트에서 접속에 실패하면 수신 소켓을 찾고, 거기서 소개 페이지와 없는 페이지를 차례로 요청한다.

**팀원에게 물어볼 점** — 브라우저에서 둘 다 페이지를 볼 수 없을 때, 어떤 증거로 연결 실패와 HTTP 404를 구분할까?

## 목요일 · 과제 검증

**과제와 완료 기준** — 실제 접속 주소, 소개 페이지의 HTTP 200, 없는 파일의 HTTP 404와 요청 로그 한 줄을 제시한다.

**실험 조건** — 서버는 루프백의 18763번에 띄웠다. 안내 주소는 8080번이다. 실행 스크립트는 서버 PID에 대응하는 수신 소켓에서 실제 포트를 읽었다. [주차 가이드]({{ '/guides/week-4/' | relative_url }}) · [Ubuntu 24.04 실행 기록](https://github.com/wjsworud1025/linux-study/actions/runs/44502074877)

### 1. 실행 전 예상

안내 주소에서는 TCP 연결이 실패하고 서버 로그에 그 요청이 남지 않을 것이다. 실제 포트에서는 index.html이 200, 없는 파일이 404로 응답할 것이다.

### 2. 실제 결과

실행한 명령

```bash
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
```

관찰한 출력

```text
안내 포트: curl 종료 코드 7
LISTEN 0      5          127.0.0.1:18763      0.0.0.0:*    users:(("python3",pid=2121,fd=3))
실제 주소 http://127.0.0.1:18763/index.html
<h1>스터디 소개</h1>
HTTP 200
없는 페이지 HTTP 404
127.0.0.1 - - [19/Nov/2026 10:03:40] "GET /absent-week2.html HTTP/1.1" 404 -
```

### 3. 차이의 이유와 완료 판정

- **비교** — 안내 포트에서는 curl이 코드 7로 끝났다. 실제 포트에서는 같은 서버가 두 경로에 각각 200과 404로 응답했다.
- **이유와 근거** — 실제 포트의 404는 서버에 도달했다는 증거다. 로그에도 없는 파일의 경로와 404가 함께 남았다. 안내 포트에서는 HTTP 응답을 받을 연결 자체가 만들어지지 않았다.
- **완료 판정** — **충족.** 수신 포트에서 실제 주소를 찾고 200 응답, 404 응답과 해당 로그를 대조했다.
