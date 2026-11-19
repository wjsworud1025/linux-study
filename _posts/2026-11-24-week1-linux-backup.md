---
permalink: /guides/week-1/
layout: post
title: "1주차 실습 가이드 · 우분투에서 소개 페이지를 만들고 백업하기"
date: 2026-11-24 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux, bash, vim]
---

## 이번 주 목표와 준비

**11/24(화) 이현종 진행 · 11/26(목) 류현수 진행.** 화요일에는 소개 페이지를 만들면서 경로, 파일 조작, 권한, 편집기를 익힙니다. 목요일에는 같은 페이지를 백업하는 Bash 스크립트를 완성합니다. 0주차에 설치한 우분투에서 터미널을 열고 시작하세요. 아래의 `site/`는 개인 실습 폴더입니다. 팀 블로그에는 실습 결과를 Markdown으로 게시합니다.

**교재 범위** — 《Do it! 리눅스 입문》 02-4(셸), 03장(파일 시스템과 경로), 04-2·04-4(명령 이력과 권한), 06-1·06-4(nano와 Vim), 07-1·07-3·07-5·07-6(변수, 스크립트 실행, 조건문, 반복문)의 해당 실습. [교재 상세 목차](https://bnk.kpipa.or.kr/home/v3/addition/adiPromoMetaDataView01/seq_20251128094118123120)

발표자는 당일 파트별로 무작위 배정합니다. 각자 네 파트를 순서대로 준비하고, 발표 전에는 명령의 결과를 한 번 예측해 보세요. 첫 시연 전 다음 명령으로 **개인 실습 폴더**를 준비합니다.

```bash
mkdir -p ~/linux-study/week1
cd ~/linux-study/week1
command -v nano
command -v vi
```

편집기 경로가 출력되지 않으면 `sudo apt update` 후 `sudo apt install nano vim`으로 준비합니다.

## 화요일 · 네 파트 시연

### 파트 1. 지금 어디에 있고, 어디로 이동하는가?

터미널은 명령을 입력하고 결과를 보는 창이고, 셸은 입력한 명령을 해석해 실행하는 프로그램입니다. 아래 명령을 한 줄씩 실행하며 `pwd` 결과가 언제 바뀌는지 봅니다.

```bash
cd ~/linux-study/week1
pwd
ls -l
ls -al
cd ..
pwd
cd -
pwd
cd ~
cd linux-study/week1
pwd
history 5
clear
```

**시연 포인트** — 홈에서 `cd linux-st`까지 입력하고 **Tab**을 눌러 경로를 완성합니다. `pwd`가 출력한 `/`로 시작하는 절대 경로와, 홈에서 사용한 상대 경로 `linux-study/week1`을 비교합니다. `cd -`는 직전 작업 디렉터리로, `cd ..`는 현재 위치의 부모로 이동합니다. `clear` 후에도 위쪽 화살표로 이전 명령을 불러올 수 있습니다.

### 파트 2. 소개 페이지를 만들고 복사·이동·삭제하기

```bash
cd ~/linux-study/week1
mkdir -p site practice
touch site/index.html
printf '%s\n' '<!doctype html>' '<meta charset="utf-8">' '<h1>우리 리눅스 스터디</h1>' > site/index.html
cat site/index.html
cp -r site practice/site-copy
mv practice/site-copy/index.html practice/site-copy/draft.html
ls -l practice/site-copy
rm practice/site-copy/draft.html
ls -al practice/site-copy
cat site/index.html
```

**확인** — `rm`으로 복사본의 파일을 지운 뒤에도 원본 제목은 출력됩니다. `>`는 파일 내용을 새로 쓰므로 이 예시의 `printf`는 페이지를 직접 꾸미기 전에 실행합니다. 시연을 다시 할 때는 빈 복사본 폴더를 `rmdir practice/site-copy`로 정리한 뒤 시작하세요.

### 파트 3. 실행 권한을 눈으로 확인하기

```bash
cd ~/linux-study/week1
printf '%s\n' '#!/usr/bin/env bash' 'echo "실행 성공"' > hello.sh
chmod 644 hello.sh
ls -l hello.sh
./hello.sh
```

마지막 줄에서 **Permission denied**가 나오면 예상한 결과입니다. 이어서 권한을 바꾸고 같은 명령을 다시 실행합니다.

```bash
chmod u+x hello.sh
ls -l hello.sh
./hello.sh
chmod 755 hello.sh
ls -l hello.sh
```

**확인** — 권한 표시가 `-rw-r--r--` → `-rwxr--r--` → `-rwxr-xr-x`로 바뀝니다. 세 묶음은 소유자·그룹·기타 사용자 순서입니다. `chmod u+x`는 소유자에게 실행 권한을 더하고, `755`는 세 묶음을 한 번에 지정합니다. `./`는 현재 디렉터리의 파일을 지정합니다. 개인 실습 파일의 실행 권한은 소유자가 바꿀 수 있습니다. 시스템 패키지를 설치할 때 사용한 `sudo`와 용도를 비교해 보세요.

### 파트 4. 편집기로 페이지를 고치고 짧은 스크립트 실행하기

1. `nano site/index.html`을 열고 마지막 줄에 `<p>매주 화요일과 목요일에 만납니다.</p>`를 추가합니다. **Ctrl+O → Enter → Ctrl+X**로 저장하고 닫습니다.
2. `vi site/index.html`을 엽니다. `/스터디` 후 Enter로 제목을 찾고, `n`으로 다음 일치 항목을 찾습니다. `Esc` 후 `yy`, `p`로 현재 줄을 복제하고 `dd`로 복제한 줄을 삭제합니다.
3. `i`로 입력 모드에 들어가 제목을 수정합니다. `Esc`로 일반 모드로 돌아와 `:wq` 후 Enter로 저장·종료합니다. 다시 열어 임시 변경을 한 번 더 만들고 `Esc`, `:q!`, Enter로 변경을 버립니다. `cat site/index.html`로 어떤 변경이 남았는지 확인합니다. 이 기본 조작은 vi와 Vim에서 공통으로 사용할 수 있습니다.

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

## 목요일 · 소개 페이지 백업 과제

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

아래 명령은 이번 주 실습 폴더에서 실행합니다. 첫 실행 전 `backup/`이 이미 있다면 기존 결과를 보관하고, 별도의 새 실습 폴더에서 검증하세요.

```bash
cd ~/linux-study/week1
chmod u+x backup.sh
bash -n backup.sh
./backup.sh
ls -l backup
diff -u site/index.html backup/index.html
```

`bash -n`은 문법을 검사합니다. 빈칸을 잘못 채워도 문법 검사는 통과할 수 있으므로 실제 복사 결과까지 확인하세요. 이제 **공백이 있는 새 HTML 파일**, **수정된 원본**, **백업 대상에서 제외할 파일**을 함께 준비합니다.

```bash
printf '%s\n' '<h1>팀원 소개</h1>' > "site/team intro.html"
printf '%s\n' '<p>목요일 백업 실습</p>' >> site/index.html
printf '%s\n' '개인 메모' > site/notes.txt
./backup.sh
ls -l backup
diff -u site/index.html backup/index.html
diff -u "site/team intro.html" "backup/team intro.html"
test ! -e backup/notes.txt && echo "텍스트 파일 제외 확인"
```

### 3. 완료 기준과 제출

- [ ] 첫 실행에서 `backup/` 폴더와 `backup/index.html`이 생겼습니다.
- [ ] 재실행 후 두 `diff -u` 명령이 아무 차이도 출력하지 않습니다. 원본 수정 사항과 공백이 있는 파일명 모두 보존됐습니다.
- [ ] 마지막 명령이 **텍스트 파일 제외 확인**을 출력합니다.
- [ ] 팀 블로그에 완성한 스크립트, 재실행 후 `ls -l backup` 결과, 원본과 복사본의 내용이 같다고 판단한 근거를 게시합니다.

**진행자용 정답** — 실습 후 대조하세요. ① `backup`, ② `mkdir -p`, ③ `*.html`, ④ `cp`, ⑤ `$backup_dir`. 완성된 복사 명령은 `cp "$page" "$backup_dir/"`입니다. 조건식 `[ -f "$page" ]`는 패턴에 일치하는 일반 파일이 있을 때만 복사를 수행합니다.

마무리로 류현수 님이 2주차 로그·프로세스·네트워크·SSH 범위를 공지합니다. 다음 주 웹 서버 실습에 사용할 `site/index.html`은 그대로 보관하세요.