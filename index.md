---
layout: default
title: 전체 일정
---
# 우분투로 배우는 리눅스와 도커

2026년 11월 24일~2027년 1월 14일 · 8주 · 화·목 16회 · 11월 19일 준비 모임 별도

소개 페이지 하나를 우분투에서 작성하고 백업한 뒤, 컨테이너와 데이터베이스를 갖춘 서비스로 발전시킵니다. 화요일은 이현종 님의 이론 90분, 목요일은 류현수 님의 실습 60분으로 진행합니다.

[전체 커리큘럼과 교재 범위 보기]({{ '/curriculum/' | relative_url }})

**11/24(화) 전 준비** — [0주차 30분 환경 점검]({{ '/guides/week-0/' | relative_url }})에서 Ubuntu 터미널, GitHub 초대, 첫 글 PR 상태를 확인합니다.

## 전체 일정과 실습 가이드

{% include study-schedule.md %}

## 매주 한 편의 실습 기록

화요일에는 핵심 개념 두 가지와 시연 결과를 개인 글 한 편에 정리합니다. 목요일에는 같은 글에 직접 실행하기 전 예상, 실제 출력, 결과가 달라진 이유를 덧붙입니다. [첫 글 작성 방법]({{ '/guides/week-0/' | relative_url }})

<h2 id="team-records">팀원 실습 기록</h2>
<p><a href="{{ '/records/template/' | relative_url }}">주간 실습 기록 템플릿 열기</a> · <a href="https://raw.githubusercontent.com/wjsworud1025/linux-study/main/_includes/weekly-record.md">마크다운 원본</a></p>
{% assign record_count = 0 %}
<ul>
{% for entry in site.posts %}
  {% unless entry.study_guide or entry.study_example %}
    {% assign record_count = record_count | plus: 1 %}
    <li><a href="{{ entry.url | relative_url }}">{{ entry.title | escape }}</a> <small>· {{ entry.date | date: "%Y-%m-%d" }}{% if entry.author %} · {{ entry.author | escape }}{% endif %}</small></li>
  {% endunless %}
{% endfor %}
</ul>
{% if record_count == 0 %}
<p>아직 등록된 실습 기록이 없습니다. 첫 글이 병합되고 배포되면 여기에 표시됩니다.</p>
{% endif %}

{% assign examples = site.posts | where: 'study_example', true %}
{% if examples.size > 0 %}
<h2>작성 예시</h2>
<ul>
{% for entry in examples %}
  <li><a href="{{ entry.url | relative_url }}">{{ entry.title | escape }}</a></li>
{% endfor %}
</ul>
{% endif %}

{% include week4-results.html %}
