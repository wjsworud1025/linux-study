---
permalink: /guides/week-1/
study_guide: true
layout: post
title: "1주차 실습 가이드 · 소개 페이지를 만들고 파일 권한 확인하기"
date: 2026-11-24 09:00:00 +0900
categories: [study]
tags: [ubuntu, linux]
---

**11/24(화) 이현종 · 11/26(목) 류현수**  
**교재 범위** — 02-4(셸), 03장(파일 시스템과 경로), 04-2·04-4(명령 이력과 권한). [교재 상세 목차](https://bnk.kpipa.or.kr/home/v3/addition/adiPromoMetaDataView01/seq_20251128094118123120)

## 준비 · 터미널과 실습 폴더

[0주차 준비]({{ '/guides/week-0/' | relative_url }})를 마치고 다음 명령을 실행합니다. 이 폴더의 `site/`를 이후 주차에서도 사용합니다.

```bash
mkdir -p ~/linux-study/week1
cd ~/linux-study/week1
```

## 화요일 · 경로를 읽고 소개 페이지 만들기

### ① 지금 어디에 있고, 어디로 이동하는가?

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

### ② 소개 페이지를 만들고 복사·이동·삭제하기

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

## 목요일 · 복사본을 확인하고 실행 권한 바꾸기

### 1. 실행 전후의 권한 비교

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

### 2. 파일명에 공백이 있는 복사본 만들기

새 연습 폴더를 만들고 원본을 복사한 뒤 이름을 바꿉니다. 이름에 공백이 있을 때 어떤 부분을 따옴표로 감싸야 하는지 예상하세요.

```bash
cd ~/linux-study/week1
mkdir -p practice
copy_dir=$(mktemp -d "$PWD/practice/paths-XXXXXX")
cp site/index.html "$copy_dir/page copy.html"
mv "$copy_dir/page copy.html" "$copy_dir/team intro.html"
diff -u site/index.html "$copy_dir/team intro.html"
ls -l "$copy_dir"
```

**완료 기준** — `diff -u`에 차이가 없고 원본 `site/index.html`이 남습니다. `hello.sh`의 실행 전후 출력과 `ls -l` 권한을 함께 기록합니다. 다음 주에는 [같은 페이지를 편집하고 Bash로 백업]({{ '/guides/week-2/' | relative_url }})합니다.

**개인 기록** — 화요일 전에 작성한 글에 목요일 예상, 실제 출력, 차이의 이유를 덧붙입니다. [팀원 실습 기록 보기]({{ '/' | relative_url }}#team-records)
