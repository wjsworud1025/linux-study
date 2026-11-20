---
permalink: /guides/week-8/
study_guide: true
layout: post
title: "8주차 실습 가이드 · 소개 페이지와 방문 기록 DB를 짝의 환경에서 재현하기"
date: 2027-01-12 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**1/12(화) 이현종 · 1/14(목) 류현수**  
**교재 범위** — 07-2(환경 변수), 08-1(웹 동작) 복습과 Compose 시작 순서 공식 문서. [Compose 시작 순서](https://docs.docker.com/compose/how-tos/startup-order/)

이번 주에는 **소개 페이지를 한 번 열 때마다 DB에 방문 번호를 하나 기록**합니다. 마지막에는 팀원이 내 README만 보고 서비스를 실행하고 검증 중 남긴 방문 기록을 다시 읽어야 합니다. GitHub Pages에는 실습 글을 게시하고, 아래 앱은 각자의 우분투 VM에서 실행합니다.

## 화요일 전 · 앱 골격과 README 초안 준비

진행자는 아래 앱 골격을 먼저 공유합니다. 각자 README에 필요한 도구, 로컬 암호 설정, 기동 명령, 접속 주소와 방문 번호 확인 방법을 작성하고 필요한 이미지를 미리 받습니다. [공용 랩 README](https://github.com/wjsworud1025/linux-study-week4-lab#readme)로 한 번 리허설하고, 실제 명령과 기대 출력을 자기 프로젝트의 README에 옮깁니다.

우분투에서 `docker version`과 `docker compose version`을 확인합니다. 다음 블록은 새 `week8` 디렉터리에서 한 번 실행하세요. 웹 서버는 `/` 요청을 기록하고, `/visits` 요청에는 기존 번호 목록만 반환합니다.

```bash
mkdir -p ~/linux-study/week8
cd ~/linux-study/week8
mkdir -p site
cp ~/linux-study/week1/site/index.html site/
printf '%s\n' 'psycopg[binary]>=3.2,<4' > requirements.txt
cat > app.py <<'PY'
import os
from http.server import BaseHTTPRequestHandler, HTTPServer
from pathlib import Path
import psycopg


def connect():
    return psycopg.connect(host="db", dbname="study", user="study",
                           password=os.environ["DB_PASSWORD"])


class Handler(BaseHTTPRequestHandler):
    def do_GET(self):
        if self.path not in ("/", "/visits"):
            self.send_error(404)
            return
        with connect() as conn:
            if self.path == "/":
                visit = conn.execute(
                    "INSERT INTO visits DEFAULT VALUES RETURNING id"
                ).fetchone()[0]
                body = Path("site/index.html").read_bytes()
                body += f"<p>Visit #{visit}</p>".encode()
                kind = "text/html"
            else:
                rows = conn.execute("SELECT id FROM visits ORDER BY id")
                body = "".join(f"{row[0]}\n" for row in rows).encode()
                kind = "text/plain"
        self.send_response(200)
        self.send_header("Content-Type", kind + "; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.end_headers()
        self.wfile.write(body)


with connect() as conn:
    conn.execute("CREATE TABLE IF NOT EXISTS visits (id serial PRIMARY KEY)")
HTTPServer(("0.0.0.0", 8000), Handler).serve_forever()
PY
```

## 화요일 · 웹과 DB 구성 및 리허설

### ① 7주차 Dockerfile을 웹 앱에 적용하기

`week8`에서 아래 파일을 만듭니다. `WORKDIR`는 뒤의 복사·실행 기준 경로이고, `RUN`은 빌드 중에, `CMD`는 컨테이너가 시작할 때 실행됩니다.

```bash
cat > Dockerfile <<'EOF'
FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY app.py .
COPY site/ site/
CMD ["python", "-u", "app.py"]
EOF
printf '%s\n' '.env' '.git' '__pycache__' > .dockerignore
printf '%s\n' '.env' '__pycache__/' > .gitignore
```

7주차 페이지 이미지에 웹 앱을 실행할 Python과 의존성을 추가했습니다. `CMD`는 컨테이너가 시작할 때 웹 앱을 실행합니다.

### ② Compose로 웹과 DB 함께 띄우기

`week8`에 다음 블록으로 파일을 만듭니다. `.env.example`에는 예시 키만 공유하고 실제 실습 암호는 각 VM에서 생성합니다. 이미 만들어 둔 `.env`는 유지합니다.

```bash
printf '%s\n' 'DB_PASSWORD=replace-with-local-password' > .env.example
test -f .env || (umask 077; printf 'DB_PASSWORD=%s\n' "$(openssl rand -hex 24)" > .env)
cat > docker-compose.yml <<'YAML'
services:
  db:
    image: postgres:16-alpine
    environment:
      POSTGRES_USER: study
      POSTGRES_DB: study
      POSTGRES_PASSWORD: ${DB_PASSWORD:?set DB_PASSWORD in .env}
    volumes:
      - visits:/var/lib/postgresql/data
    healthcheck:
      test: ["CMD-SHELL", "pg_isready -h 127.0.0.1 -U study -d study"]
      interval: 2s
      timeout: 3s
      retries: 30
  web:
    build: .
    ports:
      - "127.0.0.1:8080:8000"
    environment:
      DB_PASSWORD: ${DB_PASSWORD:?set DB_PASSWORD in .env}
    depends_on:
      db:
        condition: service_healthy
volumes:
  visits:
YAML
docker compose config --quiet
docker compose up -d --build --wait
docker compose ps
curl -fsS --retry 5 --retry-connrefused http://127.0.0.1:8080/
docker compose logs --tail 10 web
docker compose down
```

`depends_on`의 `service_healthy` 조건은 DB의 상태 검사가 통과한 뒤 웹을 시작하게 합니다. `down`은 컨테이너를 정리하고 이름 있는 볼륨을 유지합니다. 화요일 시연 기록도 남으므로, 목요일에는 방문 번호가 1이라고 가정하지 않습니다.

**화요일 리허설** — README 초안대로 실행해 보고 성공한 VM에서 `docker compose version`, `docker compose exec web python --version`, `docker compose exec web pip show psycopg`, `docker compose exec db postgres --version` 결과를 README에 기록합니다. 위 시연을 종료했다면 먼저 `docker compose up -d`로 띄우고 확인 후 `docker compose down`으로 정리합니다.

## 목요일 · 팀원이 내 README만 보고 재현할 수 있을까?

{% include week4-results.html %}

**교차 검증 시작** — 두 사람이 짝을 이뤄 각자의 앱 저장소 URL과 검증할 커밋 SHA를 교환합니다. 검증자는 짝의 저장소를 복제한 뒤 `git switch --detach 전달받은_SHA`를 실행합니다. `git rev-parse HEAD`로 대상 SHA가 맞는지 확인하고 **그 커밋의 README만** 따라 실행합니다. 작성자는 검증자가 막힌 단계와 오류를 기록한 다음 도와줍니다. 도움을 받아 완료한 경우 결과에 표시하고, 독립 실행 판정은 README를 보완한 뒤 새 검증에서 다시 받습니다.

**빈칸 과제** — 진행자는 화요일 완성본을 참고용으로 두고 아래 세 조각을 보여 줍니다. 팀원은 각 줄이 어느 파일의 어느 위치에 들어가는지 설명하고, 자신의 Dockerfile과 Compose 파일에서 해당 줄을 완성합니다. 조각은 각각 기존 한 줄을 대체합니다.

```text
Dockerfile, 앱 기본 실행 명령      CMD ["python", "-u", "__1__"]
Compose, db.volumes 목록 항목     - __2__:/var/lib/postgresql/data
Compose, web.depends_on.db 항목   condition: __3__
```

**힌트** — ① 진행자가 제공한 Python 파일, ② 최상위 `volumes`에 선언한 이름, ③ 상태 검사를 통과해야 한다는 조건입니다.

**30분 운영** — 짝 두 사람이 각자의 VM에서 동시에 상대 저장소를 검증합니다. 복제·설정 5분, 독립 실행 10분, 재기동 검증 10분, 피드백 5분으로 진행합니다. 사전에 짝의 저장소를 읽을 수 있는지와 Docker가 기동하는지 확인합니다.

**작성자 준비** — 앱 전용 저장소에 `Dockerfile`, `docker-compose.yml`, `app.py`, `requirements.txt`, `site/index.html`, `.env.example`, `.gitignore`, `.dockerignore`, `README.md`를 공유합니다. README에는 필요한 도구와 버전, Docker 권한이 필요한 경우의 실행 방법, 로컬 암호 생성, 회차 고유 Compose 프로젝트 이름, 기동·종료 명령, 접속 주소, 아래 검증 순서와 기대 출력을 적습니다. 비밀번호와 `.env`는 로컬 VM에 둡니다.

**검증자 준비** — 검증 회차마다 새 디렉터리로 복제합니다. 짝의 README에 따라 회차별로 고유한 Compose 프로젝트 이름을 정하고, 모든 `docker compose` 명령에 같은 `-p 이름`을 붙입니다. 한 회차의 기동·종료·재기동에는 같은 이름과 `.env`를 사용합니다. 8080번이 사용 중이면 이전에 시작한 해당 실습 서비스를 먼저 종료하거나 다른 VM에서 실행합니다.

**완료 기준**

- [ ] 짝의 저장소 URL과 커밋 SHA를 확인하고, 그 커밋의 README만으로 설정과 기동을 완료했습니다.
- [ ] DB가 healthy이고, HTTP 200 응답의 소개 페이지에서 **이번 요청으로 생성된 방문 번호**를 기록했습니다. 웹 로그에서 해당 요청의 200을 확인했습니다.
- [ ] 볼륨을 유지한 채 종료 후 다시 기동했습니다. DB 컨테이너 ID가 바뀌었고, 조회 전용 `/visits`에서 저장해 둔 번호를 다시 읽었습니다.
- [ ] 서비스를 종료하고 [결과 체크리스트](https://github.com/wjsworud1025/linux-study-week4-lab/issues/new?template=cross-check.yml)에 대상 URL·커밋, 실행 환경, 독립 실행 여부와 관찰값을 제출했습니다. 개인 실습 글에 이슈 링크를 남겼습니다.

실패한 경우 마지막으로 성공한 단계와 오류를 관찰값에 남깁니다. 진행자는 제출된 커밋과 관찰값을 대조해 완료 여부를 확인합니다.

**정답** — ① `app.py`, ② `visits`, ③ `service_healthy`. 웹이 바로 꺼지면 `docker compose ps -a`와 `docker compose logs web db`를 먼저 확인합니다. 기존 DB 볼륨은 처음 초기화할 때의 암호를 유지하므로 재기동 시 같은 `.env`를 사용합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
