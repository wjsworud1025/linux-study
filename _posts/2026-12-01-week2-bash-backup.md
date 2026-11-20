---
permalink: /guides/week-2/
study_guide: true
layout: post
title: "2주차 실습 가이드 · Bash 스크립트로 소개 페이지 백업하기"
date: 2026-12-01 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux, bash, vim]
---

**12/1(화) 이현종 · 이론 90분 / 12/3(목) 류현수 · 실습 60분**  
**교재 범위** — 06-1·06-4(nano·Vim), 07-1·07-3·07-5·07-6(변수·스크립트 실행·조건문·반복문). [교재 상세 목차](https://bnk.kpipa.or.kr/home/v3/addition/adiPromoMetaDataView01/seq_20251128094118123120)

## 준비 · 1주차 페이지와 편집기 확인

[1주차에서 만든 소개 페이지]({{ '/guides/week-1/' | relative_url }})를 계속 사용합니다. 화요일과 목요일 모두 `~/linux-study/week1`에서 작업합니다.

```bash
cd ~/linux-study/week1
test -f site/index.html
command -v nano
command -v vi
```

편집기가 없으면 직접 관리하는 VM에서 `sudo apt update` 후 `sudo apt install nano vim`을 실행합니다. 제공받은 VM에서는 진행자에게 설치를 요청합니다.

## 화요일 이론 · 편집기와 Bash 반복문

| 시간 | 학습 내용 |
| --- | --- |
| 0~10분 | **파일과 인용 복습** · 1주차 소개 페이지와 공백이 포함된 경로를 한 명령으로 읽는 방법을 확인합니다. |
| 10~35분 | **편집기와 실행 방식** · nano 저장과 Vim 모드의 차이, 스크립트의 shebang, bash 실행과 직접 실행의 권한 요구를 설명합니다. |
| 35~60분 | **Bash의 변수·조건·반복** · 따옴표와 패턴 확장, 파일 유형 검사, for 반복문과 복사 대상 선택을 예제로 해석합니다. |
| 60~80분 | **백업 첫 실행과 재실행 비교** · 진행자가 HTML·텍스트 파일을 추가한 뒤 반복문이 처리할 파일과 diff 출력이 어떻게 달라질지 질문합니다. |
| 80~90분 | **검증 조건 정리** · 빈 backup에 대한 첫 실행과 원본 수정 후의 재실행을 구분해 예상 결과를 한 줄씩 적습니다. |

아래 명령은 진행자의 시연 자료입니다. 결과를 먼저 예상하고 실제 출력에서 판단 근거를 찾습니다.

### ① nano와 Vim으로 페이지 편집

**사전 연습** — 개인 VM에서 `nano site/index.html`을 열고 마지막 줄에 `<p>매주 화요일과 목요일에 만납니다.</p>`를 추가합니다. **Ctrl+O → Enter → Ctrl+X**로 저장하고 닫습니다.

**발표 시연** — vi로 제목을 고치고 스크립트로 해당 파일명을 출력합니다.

1. `vi site/index.html`을 엽니다. `/스터디` 후 Enter로 제목을 찾고, `n`으로 다음 일치 항목을 찾습니다. `Esc` 후 `yy`, `p`로 현재 줄을 복제하고 `dd`로 복제한 줄을 삭제합니다.
2. `i`로 입력 모드에 들어가 제목을 수정합니다. `Esc`로 일반 모드로 돌아와 `:wq` 후 Enter로 저장·종료합니다. 다시 열어 임시 변경을 한 번 더 만들고 `Esc`, `:q!`, Enter로 변경을 버립니다. `cat site/index.html`로 어떤 변경이 남았는지 확인합니다. 이 기본 조작은 vi와 Vim에서 공통으로 사용할 수 있습니다.

### ② 변수·조건문·반복문으로 HTML 파일 찾기

다음 블록은 현재 폴더에 `list-pages.sh`를 만듭니다. 실행 전, 출력에 어떤 파일명이 나올지 예상하세요.

```bash
cat > list-pages.sh <<'BASH'
#!/usr/bin/env bash
source_dir="site"
for page in "$source_dir"/*.html; do
  if [ -f "$page" ]; then
    printf '소개 페이지: %s\n' "$page"
  fi
done
BASH
chmod u+x list-pages.sh
./list-pages.sh
```

**화요일 정리 질문** — 파일명에 공백이 있다면 왜 `"$page"`처럼 인용해야 할까요? `"$source_dir"/*.html`에서 별표만 따옴표 밖에 둔 이유는 무엇일까요? 각자 답을 적고, 목요일에는 이 반복문을 목록 출력에서 파일 복사로 바꿉니다.

## 목요일 실습 · 소개 페이지 백업 과제

**60분 운영** · 복습·준비 10분, 직접 실습 30분, 결과 비교 15분, 정리 5분

편집기와 셸 패턴을 짧게 복습한 뒤, 자기 VM에서 백업 스크립트를 완성하고 첫 실행과 재실행을 비교합니다.

**과제 조건** — `~/linux-study/week1`에서 `./backup.sh`를 실행하면 `site/` 바로 아래의 일반 `.html` 파일을 `backup/`으로 복사해야 합니다. 백업 폴더가 없으면 만들고, 다시 실행하면 같은 이름의 백업을 최신 내용으로 갱신합니다. 원본은 유지합니다.

### 1. 빈칸 다섯 개 채우기

`cd ~/linux-study/week1` 후 `nano backup.sh`를 열어 아래 예제를 붙여 넣습니다. `__1__`부터 `__5__`까지를 바꾼 뒤 저장하세요.

```bash
#!/usr/bin/env bash
set -e

source_dir="site"
backup_dir="__1__"

if [ ! -d "$backup_dir" ]; then
  __2__ "$backup_dir"
fi

for page in "$source_dir"/__3__; do
  if [ -f "$page" ]; then
    __4__ "$page" "__5__/"
    printf '백업 완료: %s\n' "$page"
  fi
done
```

| 빈칸 | 힌트 |
| --- | --- |
| 1 | 과제 조건의 백업 폴더 이름 |
| 2 | 디렉터리를 만드는 명령 |
| 3 | HTML 파일을 고르는 셸 패턴 |
| 4 | 원본을 유지하면서 파일을 복사하는 명령 |
| 5 | 위에서 선언한 백업 경로 변수의 값 |

### 2. 첫 실행과 재실행 검증하기

첫 실행은 `backup/`이 없는 임시 폴더에서 검증합니다. 이번 주 실습 폴더의 기존 백업은 그대로 두고, `site/`와 완성한 `backup.sh`만 복사합니다.

```bash
cd ~/linux-study/week1
chmod u+x backup.sh
bash -n backup.sh
backup_lab=$(mktemp -d)
cp -r site backup.sh "$backup_lab/"
cd "$backup_lab"
./backup.sh
ls -l backup
diff -u site/index.html backup/index.html
```

`bash -n`은 문법을 검사합니다. 빈칸을 잘못 채워도 문법 검사는 통과할 수 있으므로 실제 복사 결과까지 확인하세요. 이제 원래의 1주차 폴더로 돌아가 기준 백업을 만든 뒤, **공백이 있는 새 HTML 파일**, **수정된 원본**, **백업 대상에서 제외할 파일**로 재실행을 검증합니다. 3주차에서 이 폴더의 결과를 사용합니다.

```bash
cd ~/linux-study/week1
./backup.sh
printf '%s\n' '<h1>팀원 소개</h1>' > "site/team intro.html"
printf '%s\n' '<p>목요일 백업 실습</p>' >> site/index.html
printf '%s\n' '개인 메모' > site/notes.txt
./backup.sh
ls -l backup
diff -u site/index.html backup/index.html
diff -u "site/team intro.html" "backup/team intro.html"
test ! -e backup/notes.txt && echo "텍스트 파일 제외 확인"
```

짝이 새로 정한 이름으로 HTML 파일을 하나 추가하고, 스크립트 수정 없이 백업되는지 `diff -u`로 확인합니다.

### 3. 완료 기준과 제출

- [ ] 임시 폴더의 첫 실행에서 `backup/` 폴더와 `backup/index.html`이 생겼습니다.
- [ ] 재실행 후 두 `diff -u` 명령이 아무 차이도 출력하지 않습니다. 원본 수정 사항과 공백이 있는 파일명 모두 보존됐습니다.
- [ ] 마지막 명령이 **텍스트 파일 제외 확인**을 출력합니다.
- [ ] 팀 블로그에 완성한 스크립트, 재실행 후 `ls -l backup` 결과, 원본과 복사본의 내용이 같다고 판단한 근거를 게시합니다.

**진행자용 정답** — 실습 후 대조하세요. ① `backup`, ② `mkdir -p`, ③ `*.html`, ④ `cp`, ⑤ `$backup_dir`. 완성된 복사 명령은 `cp "$page" "$backup_dir/"`입니다. 조건식 `[ -f "$page" ]`는 패턴에 일치하는 일반 파일이 있을 때만 복사를 수행합니다.

[3주차 웹 서버 실습]({{ '/guides/week-3/' | relative_url }})에 사용할 `site/index.html`은 그대로 보관하세요.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
