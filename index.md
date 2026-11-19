---
layout: default
title: 전체 일정
---
# 우분투로 배우는 리눅스와 도커

2026년 11월 19일~12월 17일 · 준비 모임 1회와 본 스터디 8회

소개 페이지 하나를 우분투에서 작성하고 백업한 뒤, 컨테이너와 데이터베이스를 갖춘 서비스로 발전시킵니다. 화요일은 이현종 님의 브리핑·시연, 목요일은 류현수 님의 복습·과제로 진행합니다.

[전체 커리큘럼과 교재 범위 보기]({{ '/curriculum/' | relative_url }})

## 전체 일정과 실습 가이드

| 실습 가이드 | 화요일 · 이현종 | 목요일 · 류현수 |
| --- | --- | --- |
| [0주차 · 환경 설정]({{ '/guides/week-0/' | relative_url }}) | — | 11/19 · 우분투 설치와 첫 글 게시 |
| [1주차 · 리눅스 기본 조작]({{ '/guides/week-1/' | relative_url }}) | 11/24 · 파일·권한·편집기·Bash | 11/26 · 소개 페이지 백업 |
| [2주차 · 리눅스 실전 도구]({{ '/guides/week-2/' | relative_url }}) | 12/1 · 로그·프로세스·네트워크·SSH | 12/3 · 웹 서버 접속 문제 진단 |
| [3주차 · 도커 기본]({{ '/guides/week-3/' | relative_url }}) | 12/8 · 이미지·컨테이너·저장소 | 12/10 · 컨테이너 교체와 데이터 유지 |
| [4주차 · Compose 프로젝트]({{ '/guides/week-4/' | relative_url }}) | 12/15 · Dockerfile·네트워크·Compose | 12/17 · 서비스 재현과 방문 기록 검증 |

## 매주 한 편의 실습 기록

화요일 전에는 네 파트의 핵심 개념과 예상 결과를 개인 글 한 편에 정리합니다. 발표자는 8분 동안 결과 하나를 보여 주고, 목요일에는 같은 글에 새 조건에서의 예상·실제 출력·차이의 이유를 덧붙입니다. [첫 글 작성 방법]({{ '/guides/week-0/' | relative_url }})

<h2 id="team-records">팀원 실습 기록</h2>
{% assign record_count = 0 %}
<ul>
{% for entry in site.posts %}
  {% unless entry.study_guide %}
    {% assign record_count = record_count | plus: 1 %}
    <li><a href="{{ entry.url | relative_url }}">{{ entry.title | escape }}</a> <small>· {{ entry.date | date: "%Y-%m-%d" }}{% if entry.author %} · {{ entry.author | escape }}{% endif %}</small></li>
  {% endunless %}
{% endfor %}
</ul>
{% if record_count == 0 %}
<p>아직 등록된 실습 기록이 없습니다. 첫 글이 병합되고 배포되면 여기에 표시됩니다.</p>
{% endif %}
