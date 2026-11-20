---
layout: post
study_example: true
title: "2주차 작성 예시 · 소개 페이지를 고치고 다시 백업하면?"
author: "스터디 작성 예시"
categories: [study]
tags: [실습기록]
---

## 화요일 전 · 개념과 시연 준비

**이번 주 질문** — 소개 페이지를 고친 뒤 같은 스크립트를 한 번 더 실행하면 수정분과 새 페이지가 모두 백업될까?

| 파트 | 핵심 개념을 내 말로 | 확인할 명령 또는 관찰할 결과 |
| --- | --- | --- |
| ① nano와 Vim | 편집기에서 고친 파일을 저장하면 셸에서 변경을 확인할 수 있다. | `cat site/index.html`로 수정된 제목을 확인한다. |
| ② Bash 백업 | 반복문이 패턴에 맞는 HTML 파일을 찾아 복사한다. | `diff -u`로 원본과 백업을 비교한다. |

**시연할 장면** — vi로 소개 페이지 제목을 바꾸고 `:wq`로 저장한다. `./backup.sh` 실행 후 `diff -u site/index.html backup/index.html`의 예상 출력은 0줄이다.

**팀원에게 물어볼 점** — 디렉터리 이름을 인용한 `"$source_dir"/*.html`에서 별표까지 따옴표로 감싸면 어떤 일이 생길까?

## 목요일 · 과제 검증

**과제와 완료 기준** — 백업 폴더를 자동으로 만들고, 바로 아래의 HTML 파일만 복사한다. 두 번째 실행에서는 수정한 원본과 공백이 있는 새 파일이 모두 백업본과 일치해야 한다.

**실험 조건** — 수업 전 작성한 예시다. Windows의 Git Bash에서 빈 임시 디렉터리를 만들고, [2주차 가이드]({{ '/guides/week-2/' | relative_url }})의 빈칸을 채운 스크립트를 그 안에 `backup.sh`로 저장했다. 실제 출력은 아래 실행에서 얻었다.

### 1. 실행 전 예상

첫 실행에는 HTML 파일이 하나뿐이므로 새 백업 폴더에 `index.html`만 생길 것이다. 그 뒤 원본을 수정하고 HTML 한 개와 텍스트 파일 한 개를 추가하면, 두 번째 실행에서는 HTML 두 개가 복사될 것이다. 기존 파일도 패턴에 다시 포함되므로 수정한 문장이 백업본에도 들어갈 것으로 예상했다.

### 2. 실제 결과

실행한 명령

```bash
mkdir site
printf '%s\n' '<h1>스터디 소개</h1>' > site/index.html
chmod u+x backup.sh
./backup.sh
printf '%s\n' '<p>모임은 화·목</p>' >> site/index.html
printf '%s\n' '<h1>팀원 소개</h1>' > 'site/team intro.html'
printf '%s\n' '개인 메모' > site/notes.txt
./backup.sh
ls -1 backup
diff -u site/index.html backup/index.html
diff -u 'site/team intro.html' 'backup/team intro.html'
test ! -e backup/notes.txt
printf '%s\n' 'HTML 두 파일 내용 일치, notes.txt 제외 확인'
```

관찰한 출력

```text
백업 완료: site/index.html
백업 완료: site/index.html
백업 완료: site/team intro.html
index.html
team intro.html
HTML 두 파일 내용 일치, notes.txt 제외 확인
```

### 3. 차이의 이유와 완료 판정

- **비교** — 두 번의 실행 결과 모두 예상과 일치했다. 두 번째 실행에서 기존 페이지도 다시 복사되어 백업 메시지가 두 줄 나왔다.
- **이유와 근거** — 반복문은 실행할 때마다 `*.html`에 맞는 파일을 다시 찾는다. `cp "$page" "$backup_dir/"`에서 원본 경로를 인용했기 때문에 공백이 있는 이름도 한 인수로 전달됐다. 두 번의 `diff`는 아무 차이도 출력하지 않았고, `ls -1 backup`에는 HTML 두 개만 표시됐다.
- **완료 판정** — **충족.** 빈 폴더에서의 첫 백업, 수정 내용 갱신, 공백 파일명 유지, 텍스트 파일 제외를 확인했다.
