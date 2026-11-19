---
permalink: /guides/week-4/
study_guide: true
layout: post
title: "4주차 실습 가이드 · 소개 페이지와 방문 기록 DB를 다른 팀원 환경에서 재현하기"
date: 2026-12-15 09:00:00 +0900
categories: [study]
tags: [ubuntu, docker]
---

**12/15(화) 이현종 · 12/17(목) 류현수**  
**교재** 《Do it! 리눅스 입문》 07-2(환경 변수), 08-1(웹 동작 방식) 복습. 이미지 빌드와 다중 컨테이너는 [Docker 워크숍](https://docs.docker.com/learn/paths/get-started-with-docker-containers/)과 [Compose 시작 순서](https://docs.docker.com/compose/how-tos/startup-order/)를 사용합니다.

이번 주에는 **소개 페이지를 한 번 열 때마다 DB에 방문 번호를 하나 기록**합니다. 마지막에는 팀원이 내 README만 보고 서비스를 실행하고 첫 방문 기록까지 다시 읽어야 합니다. GitHub Pages에는 실습 글을 게시하고, 아래 앱은 각자의 우분투 VM에서 실행합니다.

## 화요일 전 · 앱 골격과 README 초안 준비

진행자는 아래 앱 골격을 먼저 공유합니다. 각자 README에 필요한 도구, 로컬 암호 설정, 기동 명령, 접속 주소와 방문 번호 확인 방법을 작성하고 필요한 이미지를 미리 받습니다.

우분투에서 `docker version`과 `docker compose version`을 확인합니다. 다음 블록은 새 `week4` 디렉터리에서 한 번 실행하세요. 웹 서버는 `/` 요청을 기록하고, `/visits` 요청에는 기존 번호 목록만 반환합니다.

```bash
mkdir -p ~/linux-study/week4
cd ~/linux-study/week4
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

## 화요일 · 네 파트 시연

### ① Dockerfile로 실행 환경 만들기

`week4`에서 아래 파일을 만듭니다. `WORKDIR`는 뒤의 복사·실행 기준 경로이고, `RUN`은 빌드 중에, `CMD`는 컨테이너가 시작할 때 실행됩니다.

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
docker build -t study-web:w4 .
docker run --rm study-web:w4 python --version
docker run --name w4-exit study-web:w4
```

마지막 실행은 DB 환경 설정이 없어 종료됩니다. `docker ps -a`와 `docker logs w4-exit`에서 종료 상태와 오류를 찾고 `docker rm w4-exit`로 예제 컨테이너를 정리합니다. 위의 `python --version`은 기본 `CMD`를 대체합니다. `ENTRYPOINT`가 지정된 이미지에서는 실행 시 인수가 그 진입점에 전달됩니다.

### ② 캐시를 확인하고 이미지 배포하기

```bash
printf '%s\n' '<p>Compose 실습</p>' >> site/index.html
docker build --progress=plain -t study-web:w4 .
docker image history study-web:w4
```

페이지를 바꾼 뒤 `pip install` 단계가 캐시를 재사용했는지 빌드 출력에서 찾습니다. 의존성 목록을 소스보다 먼저 복사하면 페이지 수정 때 패키지를 다시 설치할 필요가 없습니다. `.dockerignore`는 빌드 문맥에서, `.gitignore`는 Git 추적 대상에서 로컬 설정 파일을 제외합니다.

**진행자 배포 시연** — 본인이 게시할 Docker Hub 저장소 `study-web`을 만든 뒤 아래 명령을 실행합니다. 비밀번호나 인증 화면은 블로그에 올리지 않습니다.

```bash
read -rp "Docker Hub 사용자명: " hub_user
docker login
docker tag study-web:w4 "$hub_user/study-web:w4"
docker push "$hub_user/study-web:w4"
```

### ③ 사용자 정의 네트워크에서 이름으로 통신하기

```bash
docker network inspect bridge
docker network create w4-demo-net
docker run -d --name w4-peer --network w4-demo-net nginx:alpine
docker run --rm --network w4-demo-net alpine:3 wget -qO- http://w4-peer
docker stop w4-peer
docker rm w4-peer
docker network rm w4-demo-net
```

포트를 호스트에 게시하지 않아도 같은 사용자 정의 네트워크의 컨테이너가 이름으로 HTTP 요청을 보낼 수 있습니다. 기본 bridge와 달리 사용자 정의 bridge에는 컨테이너 이름을 해석하는 DNS가 제공됩니다. 아래 앱의 `host="db"`도 Compose 서비스 이름을 사용합니다.

### ④ Compose로 웹과 DB 함께 띄우기

`week4`에 다음 블록으로 파일을 만듭니다. `.env.example`에는 예시 키만 공유하고 실제 실습 암호는 각 VM에서 생성합니다. 이미 만들어 둔 `.env`는 유지합니다.

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
docker compose up -d --build
docker compose ps
curl -fsS --retry 5 --retry-connrefused http://127.0.0.1:8080/
docker compose logs --tail 10 web
docker compose down
```

`depends_on`의 `service_healthy` 조건은 DB의 상태 검사가 통과한 뒤 웹을 시작하게 합니다. `down`은 컨테이너를 정리하고 이름 있는 볼륨을 유지합니다. 화요일 시연 기록도 남으므로, 목요일에는 방문 번호가 1이라고 가정하지 않습니다.

**화요일 리허설** — README 초안대로 실행해 보고 성공한 VM에서 `docker compose version`, `docker compose exec web python --version`, `docker compose exec web pip show psycopg`, `docker compose exec db postgres --version` 결과를 README에 기록합니다. 위 시연을 종료했다면 먼저 `docker compose up -d`로 띄우고 확인 후 `docker compose down`으로 정리합니다.

## 목요일 · 팀원이 내 README만 보고 재현할 수 있을까?

{% include week4-results.html %}

**교차 검증 시작** — [4주차 실습 저장소의 README](https://github.com/wjsworud1025/linux-study-week4-lab#readme)를 다른 팀원에게 전달합니다. 검증자는 새 디렉터리에 복제한 뒤 README만 따라 기동하고, 교체 전후의 DB 컨테이너 ID와 방문 번호를 기록합니다. 마치면 [결과 체크리스트](https://github.com/wjsworud1025/linux-study-week4-lab/issues/new?template=cross-check.md)를 작성하고 이슈 주소를 개인 실습 기록에 덧붙이세요. 작성자는 검증자가 혼자 막힌 지점을 먼저 기록한 다음 도와줍니다.

**빈칸 과제** — 진행자는 화요일 완성본을 참고용으로 두고 아래 세 조각을 보여 줍니다. 팀원은 각 줄이 어느 파일의 어느 위치에 들어가는지 설명하고, 자신의 Dockerfile과 Compose 파일에서 해당 줄을 완성합니다. 조각은 각각 기존 한 줄을 대체합니다.

```text
Dockerfile, 앱 기본 실행 명령      CMD ["python", "-u", "__1__"]
Compose, db.volumes 목록 항목     - __2__:/var/lib/postgresql/data
Compose, web.depends_on.db 항목   condition: __3__
```

**힌트** — ① 진행자가 제공한 Python 파일, ② 최상위 `volumes`에 선언한 이름, ③ 상태 검사를 통과해야 한다는 조건입니다.

**30분 운영** — 다른 팀원의 VM에서 복제·설정 5분, 독립 실행 10분, 재기동 검증 10분, 피드백 5분으로 진행합니다.

**저장소 교환** — 앱 전용 저장소에 `Dockerfile`, `docker-compose.yml`, `app.py`, `requirements.txt`, `site/index.html`, `.env.example`, `.gitignore`, `.dockerignore`, `README.md`를 공유합니다. README에는 필요한 도구, `.env.example`을 `.env`로 복사하고 새 로컬 암호로 바꾸는 방법, 실행 명령, 접속 주소, 종료·재기동 방법을 적습니다. 팀원은 다른 사람의 저장소를 **새 디렉터리에 복제**하고 그 README를 따라 합니다. 8080번에 기존 서비스가 있다면 먼저 해당 실습 서비스를 종료하세요.

**재현 검증** — 아래는 검토자가 README의 결과와 대조할 명령입니다. 같은 디렉터리와 같은 터미널에서 순서대로 실행합니다.

```bash
docker compose config --quiet
docker compose up -d --build
docker compose ps
base=http://127.0.0.1:8080
curl -fsS --retry 5 --retry-connrefused "$base/"
before=$(curl -fsS "$base/visits" | tail -n 1)
printf '보존할 방문 번호: %s\n' "$before"
docker compose logs --tail 10 web
docker compose down
docker compose up -d
curl -fsS --retry 5 --retry-connrefused "$base/visits" | grep -Fx "$before"
```

**완료 기준**

- [ ] 다른 팀원이 README만으로 환경설정을 채우고 `docker compose up -d --build`에 성공했습니다.
- [ ] 브라우저 또는 `curl`로 **1주차 소개 문구와 방문 번호**를 확인했습니다. `docker compose ps`에는 DB가 healthy로, 웹 로그에는 `GET /` 요청이 표시됩니다.
- [ ] `down`과 `up -d` 사이에 볼륨을 삭제하지 않았고, 마지막 명령이 재기동 **전에 기록한 방문 번호**를 출력합니다.
- [ ] 블로그에 재현한 팀원, 실행 명령, DB 상태, 보존된 방문 번호를 공유했습니다. 실습이 끝나면 `docker compose down`으로 종료합니다.

**정답** — ① `app.py`, ② `visits`, ③ `service_healthy`. 웹이 바로 꺼지면 `docker compose ps -a`와 `docker compose logs web db`를 먼저 확인합니다. 기존 DB 볼륨은 처음 초기화할 때의 암호를 유지하므로 재기동 시 같은 `.env`를 사용합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
