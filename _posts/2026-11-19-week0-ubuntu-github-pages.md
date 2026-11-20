---
permalink: /guides/week-0/
study_guide: true
layout: post
title: "0주차 실습 가이드 · 우분투 가상머신에서 팀 블로그 첫 글까지"
date: 2026-11-19 09:00:00 +0900
categories: [study]
tags: [ubuntu, virtualbox, github-pages]
---

# 0주차 실습 · 내 우분투에서 쓴 글을 팀 블로그에 게시하기

**11월 19일(목) · 진행 류현수**  
**교재** 《Do it! 리눅스 입문》 02-1 가상화와 하이퍼바이저, 02-2 우분투 설치하기, 02-4 리눅스 셸과 기본 명령어

**먼저 팀 저장소 초대를 수락하세요.** [linux-study 저장소](https://github.com/wjsworud1025/linux-study)의 기본 브랜치는 `main`, 글 폴더는 `_posts/`입니다. 관리자는 모임 전에 Settings → Collaborators에서 팀원을 초대합니다. 팀원은 가상머신을 준비하고 자기 계정으로 첫 글을 올립니다.

**11/24(화) 전 · 30분 준비 점검** — 각자 Ubuntu 터미널에서 `cat /etc/os-release`, `uname -m`, `pwd`를 실행하고 GitHub 초대 수락과 첫 글 PR 상태를 확인합니다. 진행자는 설치가 막힌 팀원에게 준비된 Ubuntu VM과 접속 방법을 안내하고, 게시 권한이 막힌 팀원의 초대와 GitHub 계정을 확인합니다. 이미 PR을 열었다면 병합·배포 후 공개 글 주소를 확인합니다.

## 1. 내 컴퓨터에 맞는 Ubuntu 환경 선택하기

| 기기 | 사용할 환경 |
| --- | --- |
| Intel 또는 AMD x64 Windows | VirtualBox 7과 Ubuntu Desktop 24.04 LTS AMD64. 아래 설치 순서를 따릅니다. |
| Apple Silicon Mac | UTM과 Ubuntu Server 24.04 LTS ARM64. [Ubuntu 24.04 ARM64 설치 이미지](https://cdimage.ubuntu.com/ubuntu/releases/24.04/release/)에서 **64-bit ARM (ARMv8/AArch64) server install image**를 받고, [UTM Ubuntu 가이드](https://docs.getutm.app/guides/ubuntu/)를 따라 **Virtualize → Linux**로 새 VM에 설치합니다. 설치 후 콘솔에 로그인하고 3단계로 이동합니다. |
| Windows on Arm 또는 로컬 가상화·설치 권한이 없는 기기 | 진행자에게 Git과 nano가 설치된 준비된 Ubuntu VM과 개인 계정을 요청합니다. 제공받은 방법으로 로그인한 뒤 3단계로 이동합니다. |

### x64 Windows에서 설치 파일 받기

1. Windows **설정 → 시스템 → 정보 → 시스템 종류**에서 x64 기반 프로세서인지 확인합니다. **작업 관리자 → 성능 → CPU**에서 가상화가 사용 상태인지 확인합니다.
2. VirtualBox 다운로드 페이지에서 **Windows hosts** 설치 프로그램을 받아 기본 옵션으로 설치합니다. 이번 실습에는 Extension Pack이 필요하지 않습니다. [VirtualBox 다운로드](https://www.virtualbox.org/wiki/Downloads)
3. Ubuntu 24.04 배포 페이지에서 **64-bit PC (AMD64) desktop image**를 내려받습니다. Intel PC에도 같은 이미지를 씁니다. ISO는 압축을 풀지 않고 그대로 둡니다. [Ubuntu 24.04 LTS 설치 이미지](https://releases.ubuntu.com/24.04/)

**확인** — Windows에서 VirtualBox 관리자가 열리고, 다운로드 폴더에서 이름이 `desktop-amd64.iso`로 끝나는 파일을 찾을 수 있습니다.

## 2. x64 Windows에서 가상머신을 만들고 우분투 설치하기

1. VirtualBox에서 **새로 만들기(New)**를 누릅니다. 이름은 `ubuntu-study`, ISO Image는 방금 받은 파일로 지정합니다. 운영체제 유형이 Linux, Ubuntu (64-bit)인지 봅니다.
2. 직접 설치 화면을 따라가도록 **Skip Unattended Installation**을 선택합니다. 버전에 따라 반대로 표시되는 **Proceed with Unattended Installation** 스위치는 끕니다.
3. 실습 권장값으로 메모리 **4096 MB**, CPU **2개**, **새 가상 하드 디스크 40 GB**를 지정합니다. 호스트에도 실행할 여유가 있어야 합니다. 네트워크는 기본값 **NAT**로 둡니다.
4. 만들기를 마치고 VM을 시작합니다. 부팅 메뉴가 나오면 **Try or Install Ubuntu**를 선택합니다. 설치 화면에서 언어와 키보드 배열을 고르고 **Install Ubuntu**로 진행합니다. 설치 방식을 묻는다면 대화형 설치와 기본 앱 구성을 선택합니다.
5. **VM 창 안에서**, 설치 대상이 방금 만든 약 40 GB의 빈 가상 디스크인지 확인한 뒤 **Erase disk and install Ubuntu**를 선택합니다. 대상이 다르거나 실제 PC로 ISO를 부팅한 경우 여기서 멈춥니다.
6. 사용자 이름(예: `study`), 암호, 시간대를 설정하고 설치합니다. 설치 후 **Restart Now**를 누릅니다. 설치 매체를 제거하라는 메시지가 나오면 ISO가 분리됐는지 확인하고 Enter를 누릅니다. 다시 설치 화면으로 돌아오면 VM의 광학 드라이브에서 ISO를 분리한 뒤 재시작합니다.

**확인** — 설치 ISO 없이 부팅해 방금 만든 계정으로 우분투 바탕화면에 로그인합니다. [우분투 공식 VirtualBox 안내](https://ubuntu.com/tutorials/how-to-run-ubuntu-desktop-on-a-virtual-machine-using-virtualbox)

## 3. 우분투 터미널에서 환경 기록하기

이제부터 명령은 **우분투 VM 안**에서 실행합니다. Ubuntu Desktop에서는 `Ctrl+Alt+T`로 터미널을 엽니다. Ubuntu Server나 제공받은 VM에서는 로그인한 콘솔 또는 접속 세션에서 입력합니다.

```bash
mkdir -p ~/linux-study
cd ~/linux-study
pwd
whoami
cat /etc/os-release
uname -m
```

`pwd` 결과는 `/home/내계정/linux-study`, `whoami` 결과는 로그인한 계정입니다. 배포판 정보에서 `PRETTY_NAME`을, 마지막 줄에서 CPU 아키텍처를 찾아 둡니다. 이어 `git --version`과 `nano --version`을 실행합니다. 두 버전이 모두 표시되면 4단계로 이동합니다. 제공받은 VM에서 도구가 빠져 있다면 진행자에게 설치를 요청합니다. 직접 설치한 VM에서 도구가 빠져 있다면 아래 명령을 실행합니다.

```bash
sudo apt update
sudo apt install -y git nano
git --version
```

`sudo`가 암호를 물으면 **우분투 로그인 암호**를 입력합니다. 입력 중 글자나 별표가 보이지 않아도 Enter를 누르면 됩니다.

## 4. 기존 팀 블로그의 게시 위치 확인하기

[전체 일정]({{ '/' | relative_url }})과 [팀원 실습 기록]({{ '/' | relative_url }}#team-records)을 열어 봅니다. 이미 설정된 팀 저장소에 아래 단계로 개인 글을 추가합니다.

## 5. 팀원 · 내 가상머신에서 첫 글 작성하기

GitHub에는 Ubuntu Desktop 브라우저나 호스트 브라우저로 로그인합니다. 아래 명령은 Ubuntu VM 터미널에서 실행하며 자신의 GitHub 아이디와 커밋 이메일을 입력합니다.

```bash
read -rp "내 GitHub 아이디: " author
repo_url="https://github.com/wjsworud1025/linux-study.git"
read -rp "커밋에 표시할 이메일: " git_email
cd ~/linux-study
git clone "$repo_url" team-blog
cd team-blog
git config user.name "$author"
git config user.email "$git_email"
git switch -c "week0/$author"
```

공개 커밋에 개인 이메일을 표시하고 싶지 않으면 GitHub **Settings → Emails**에 표시되는 본인용 `noreply` 주소를 입력합니다. 같은 터미널에서 이어서 실행합니다. 실습 날짜와 아이디가 들어간 파일명을 써서 여러 사람의 글이 겹치지 않게 합니다.

```bash
mkdir -p _posts
post="_posts/$(date +%F)-week0-$author.md"
nano "$post"
```

아래 예시에서 **첫 줄의 `---`부터 마지막 문장까지** 복사합니다. 대괄호 부분을 3단계에서 확인한 실제 값으로 바꿉니다.

```markdown
---
layout: post
title: "0주차 · [내 아이디]의 우분투 설치 기록"
author: "[내 GitHub 아이디]"
categories: [study]
tags: [ubuntu]
---

## 내 실습 환경

- 우분투 버전: [PRETTY_NAME 값]
- CPU 아키텍처: [uname -m 결과]
- 작업 디렉터리: [pwd 결과]

## 실행하고 확인한 것

[어떤 명령을 실행했고, 출력에서 무엇을 확인했는지 한 문장으로 작성]

## 다음 모임에서 확인할 질문

[설치 또는 터미널 사용 중 생긴 질문 한 가지]
```

nano에서 **Ctrl+O → Enter**로 저장하고 **Ctrl+X**로 나옵니다. `cat "$post"`로 글의 첫 줄, 제목, 실습 결과를 확인합니다. [Jekyll 게시글 작성 규칙](https://docs.github.com/en/pages/setting-up-a-github-pages-site-with-jekyll/adding-content-to-your-github-pages-site-using-jekyll)

## 6. 내 글을 팀 저장소에 올리고 리뷰받기

**처음 GitHub를 쓰는 팀원은 브라우저 업로드로 진행해도 됩니다.** 두 방법 중 하나를 선택합니다.

- **브라우저 업로드** — 팀 저장소의 기본 브랜치를 엽니다. 파일에 접근할 수 있는 Ubuntu Desktop 브라우저에서는 `_posts`의 **Add file → Upload files**를 사용합니다. 호스트 브라우저를 쓰거나 `_posts` 폴더가 없으면 저장소 루트에서 **Add file → Create new file**을 열고, VM에서 `printf '%s\n' "$post"`로 확인한 경로와 `cat "$post"`로 확인한 글 내용을 옮깁니다. **Commit changes**에서 새 브랜치에 커밋하고 풀 리퀘스트를 만드는 옵션을 선택합니다.
- **터미널로 올리기** — GitHub HTTPS 인증을 설정한 팀원은 아래 명령을 사용합니다. 인증을 요구한다면 설정해 둔 자격 증명을 사용합니다. GitHub 계정 암호로는 HTTPS push 인증을 할 수 없습니다. 인증 설정에 시간이 걸리면 브라우저 방법으로 같은 파일을 올릴 수 있습니다.

```bash
git add -- "$post"
git diff --cached
git commit -m "0주차 우분투 설치 기록 추가"
git push -u origin HEAD
```

GitHub에서 **Compare & pull request**를 누르고 대상 브랜치가 팀의 기본 브랜치인지 확인한 뒤 **Create pull request**를 선택합니다. 팀원 한 명이 **Files changed**에서 글의 제목과 실제 실행 결과를 확인하면, 병합 권한이 있는 사람이 **Merge pull request → Confirm merge**를 누릅니다.

## 7. 공개된 첫 글 확인하기

1. 저장소 **Actions**에서 병합한 커밋의 Pages 빌드·배포가 성공했는지 확인합니다.
2. **Settings → Pages → Visit site** 또는 관리자가 공유한 블로그 주소로 이동해 홈의 [팀원 실습 기록]({{ '/' | relative_url }}#team-records)에서 내 제목을 누릅니다.
3. 글의 **공개 주소**를 다른 팀원에게 보냅니다. 팀원이 로그아웃 상태나 시크릿 창에서 제목과 우분투 버전을 읽을 수 있으면 게시 완료입니다.

| 막힌 지점 | 확인할 것 |
| --- | --- |
| VM이 부팅되지 않음 | x64 Windows에서는 AMD64 ISO와 가상화 설정을, Apple Silicon에서는 ARM64 ISO와 UTM의 Virtualize 선택을 확인합니다. 해결이 어려우면 진행자에게 VM을 요청합니다. |
| 우분투에서 패키지 목록을 받지 못함 | VM 네트워크 연결 상태를 확인하고 `sudo apt update`를 다시 실행합니다. 제공받은 VM이면 진행자에게 오류 메시지를 공유합니다. |
| GitHub에서 브랜치를 올릴 권한이 없음 | 로그인한 계정이 팀 초대를 수락했는지, 저장소에 쓰기 권한이 있는지 확인합니다. |
| 병합했는데 홈에 글이 없음 | 해당 커밋의 배포 상태, 게시 소스와 글 폴더, 파일명의 날짜 및 확장자, 본문 첫 줄의 `---`를 확인합니다. VM 날짜가 미래라면 파일명을 실제 게시일로 고칩니다. |
| 블로그 주소에서 404가 뜸 | 저장소 이름이 포함된 Pages 주소인지 확인하고, 첫 배포가 끝난 뒤 관리자 화면의 Visit site로 다시 엽니다. |

**0주차 완료 기준** — 각자 배정받거나 직접 준비한 우분투에 다시 로그인할 수 있고, `~/linux-study`에서 확인한 환경 정보가 자신의 첫 글에 담겨 있으며, 다른 팀원이 공개 주소로 그 글을 읽을 수 있습니다. 마지막으로 류현수 님이 1주차 발표 범위와 소개 페이지 백업 과제를 공지합니다.
