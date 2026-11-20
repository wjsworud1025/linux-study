# GitHub Pages에 게시하기

1. ZIP을 풀고 _config.yml, index.md, _layouts/, _posts/를 포함한 내용물을 GitHub 저장소의 main 브랜치 루트에 커밋합니다. ZIP 자체나 이를 감싼 폴더를 올리지 않습니다.
2. Settings → Pages → Build and deployment에서 Deploy from a branch, main, /(root)를 선택하고 Save를 누릅니다.
3. 배포가 완료되면 Visit site에서 8주 일정과 0~8주차 실습 가이드, 전체 커리큘럼을 확인합니다.

기존 블로그에 합칠 때는 같은 이름의 홈·레이아웃·설정 파일을 먼저 비교하세요. 기존 게시 소스가 /docs이면 파일을 docs/에 배치합니다. Jekyll을 사용하므로 게시 소스에 .nojekyll 파일이 없어야 합니다. future: true는 수업 날짜 전에도 모든 가이드를 표시합니다.
