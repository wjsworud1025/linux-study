---
layout: post
study_example: true
title: "3주차 작성 예시 · 컨테이너를 바꾸면 세 파일 중 무엇이 남을까?"
author: "스터디 작성 예시"
categories: [study]
tags: [실습기록]
---

## 화요일 전 · 개념과 시연 준비

**이번 주 질문** — 컨테이너를 바꾸면 세 파일 중 무엇이 남을까?

| 파트 | 핵심 개념을 내 말로 | 확인할 명령 또는 관찰할 결과 |
| --- | --- | --- |
| ① 격리 | 컨테이너마다 독립된 파일 변경 영역이 있다. | 같은 이미지로 만든 두 컨테이너의 /tmp 비교 |
| ② 이미지 | 실행 중 추가한 파일은 원래 이미지에 기록되지 않는다. | 새 컨테이너에서 같은 경로 확인 |
| ③ 수명 주기 | 중지·시작은 같은 컨테이너를 다시 실행한다. | stop → start → cat |
| ④ 저장소 | 바인드 마운트와 이름 있는 볼륨은 새 컨테이너에도 연결할 수 있다. | 같은 두 저장소를 읽기 전용으로 다시 연결 |

**시연할 장면** — 세 위치에 값을 쓰고 같은 컨테이너의 재시작과 새 컨테이너로 교체한 경우를 비교한다.

**팀원에게 물어볼 점** — 컨테이너를 새로 만들었는데 파일이 남았다면, 실제 파일을 소유한 저장소는 어디일까?

## 목요일 · 과제 검증

**과제와 완료 기준** — 쓰기 영역·바인드 마운트·볼륨의 예상을 실제 결과와 대조하고, 페이지 편집과 DB 저장에 맞는 방식을 설명한다.

**실험 조건** — 첫 컨테이너에는 세 위치를 모두 썼다. 교체할 때는 같은 Alpine 이미지와 같은 두 마운트를 사용했다. [주차 가이드]({{ '/guides/week-3/' | relative_url }}) · [Ubuntu 24.04 실행 기록](https://github.com/wjsworud1025/linux-study/actions/runs/44502074877)

### 1. 실행 전 예상

| 기록 위치 | 교체 전 예상 | 교체 후 관찰 |
| --- | --- | --- |
| /tmp/layer.txt · 쓰기 영역 | 사라짐 | 파일 없음 |
| /site/bind.txt · 바인드 마운트 | 남음 | bind |
| /data/volume.txt · 이름 있는 볼륨 | 남음 | volume |

교체 전 같은 컨테이너를 한 번 재시작하면 쓰기 영역에도 layer가 남을 것으로 예상했다.

### 2. 실제 결과

실행한 명령

```bash
set -euo pipefail
mkdir -p "$PWD/bind-site"
vol=$(docker volume create)
docker run -d --name writer -v "$PWD/bind-site:/site" -v "$vol:/data" alpine:3 sleep 600 >/dev/null
docker exec writer sh -ec 'echo layer >/tmp/layer.txt; echo bind >/site/bind.txt; echo volume >/data/volume.txt; cat /tmp/layer.txt /site/bind.txt /data/volume.txt'
docker stop writer >/dev/null
docker start writer >/dev/null
printf '동일 컨테이너 재시작: '
docker exec writer cat /tmp/layer.txt
docker rm -f writer >/dev/null
docker run --rm -v "$PWD/bind-site:/site:ro" -v "$vol:/data:ro" alpine:3 sh -ec '
  test ! -e /tmp/layer.txt
  echo "쓰기 영역 파일 없음"
  cat /site/bind.txt /data/volume.txt
'
```

관찰한 출력

```text
layer
bind
volume
동일 컨테이너 재시작: layer
쓰기 영역 파일 없음
bind
volume
```

### 3. 차이의 이유와 완료 판정

- **비교** — 같은 컨테이너를 재시작했을 때는 layer가 남았고, 새 컨테이너에서는 그 파일만 사라졌다.
- **이유와 근거** — 컨테이너 삭제와 함께 쓰기 영역이 제거됐다. 나머지 두 파일은 새 컨테이너가 동일한 호스트 경로와 볼륨을 다시 연결해 읽었다. 소개 페이지 편집에는 VM의 파일을 바로 고칠 수 있는 바인드 마운트가, DB 데이터에는 컨테이너 수명과 분리되는 이름 있는 볼륨이 알맞다.
- **완료 판정** — **충족.** 세 위치를 기록하고 두 종류의 수명 주기를 실제 비교했다.
