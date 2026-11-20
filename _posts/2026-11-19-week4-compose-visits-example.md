---
layout: post
study_example: true
title: "8주차 작성 예시 · DB 컨테이너를 다시 만들어도 첫 방문 번호가 남을까?"
author: "스터디 작성 예시"
categories: [study]
tags: [실습기록]
---

## 화요일 전 · 개념과 시연 준비

**이번 주 질문** — DB 컨테이너를 다시 만들어도 첫 방문 번호가 남을까?

| 파트 | 핵심 개념을 내 말로 | 확인할 명령 또는 관찰할 결과 |
| --- | --- | --- |
| ① 웹 이미지 | Dockerfile의 빌드가 끝나면 웹 앱 코드와 의존성이 이미지에 들어간다. | `docker compose up -d --build` 뒤 소개 페이지 응답을 확인한다. |
| ② Compose와 DB | 웹이 서비스 이름으로 DB에 연결하고, 이름 있는 볼륨이 DB 기록을 유지한다. | DB 상태와 재기동 전후의 같은 방문 번호를 확인한다. |

**시연할 장면** — 소개 페이지를 딱 한 번 열고 번호를 적는다. 재기동 후에는 조회 전용 /visits로 기존 번호를 찾는다.

**팀원에게 물어볼 점** — 재기동 뒤 소개 페이지를 다시 열기만 하면 기존 방문 기록이 남았다는 것을 증명할 수 있을까?

## 목요일 · 과제 검증

**과제와 완료 기준** — 새 환경에서 서비스를 기동한 뒤 소개 문구·방문 번호·DB 상태·웹 로그를 확인하고, down/up 뒤에도 같은 번호를 찾는다. 팀 활동의 마지막 기준은 다른 팀원이 README만으로 이 과정을 재현하는 것이다.

**실험 조건** — 새 Ubuntu 실행 환경에 현재 8주차 가이드에 있는 앱의 app.py, Dockerfile, Compose 설정을 복원했다. 로컬 암호를 생성하고 빈 DB 볼륨에서 시작했다. 아래 명령은 앱 디렉터리에서 실행했다. [주차 가이드]({{ '/guides/week-8/' | relative_url }}) · [Ubuntu 24.04 실행 기록](https://github.com/wjsworud1025/linux-study/actions/runs/44502074877)

### 1. 실행 전 예상

DB가 healthy가 되면 웹 요청이 방문을 한 건 기록할 것이다. down으로 DB 컨테이너가 지워져도 이름 있는 볼륨은 남으므로, 새 DB 컨테이너에서 기존 번호를 조회할 수 있을 것이다.

### 2. 실제 결과

실행한 명령

```bash
set -euo pipefail
docker compose config --quiet
docker compose up -d --build --wait >/dev/null
base=http://127.0.0.1:8080
docker inspect -f '{% raw %}{{.State.Health.Status}}{% endraw %}' "$(docker compose ps -q db)"
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
```

관찰한 출력

```text
healthy
<h1>스터디 소개</h1>
<p>Visit #1</p>
종료 전 방문 번호: 1
web-1  | 172.18.0.1 - - [19/Nov/2026 10:04:15] "GET / HTTP/1.1" 200 -
새 DB 컨테이너에서 읽은 방문 번호: 1
```

### 3. 차이의 이유와 완료 판정

- **비교** — 소개 문구와 방문 번호를 읽었고, DB 컨테이너 ID가 바뀐 뒤에도 같은 번호가 조회됐다.
- **이유와 근거** — 첫 요청은 DB에 행을 추가한다. /visits는 읽기만 하므로 마지막 결과는 새 방문을 만든 효과가 아니다. down에서 볼륨을 유지했고 같은 Compose 프로젝트가 그 볼륨을 다시 연결했다.
- **완료 판정** — **기술 기준 충족, 팀원 교차 검증 미실시.** 자동 실행으로 기동·요청·데이터 보존을 확인했다. 실제 수업에서는 다른 팀원이 README만 보고 시도한 결과와 막힌 단계를 이 자리에 덧붙인다.
