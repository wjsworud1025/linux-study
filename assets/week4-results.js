(async function showResults() {
  const section = document.getElementById('week4-results');
  const status = section.querySelector('[data-results-status]');
  const list = section.querySelector('[data-results-list]');
  const repo = 'wjsworud1025/linux-study-week4-lab';
  const query = new URLSearchParams({
    labels: 'week4-cross-check', state: 'all', sort: 'created', direction: 'desc', per_page: '100'
  });
  status.textContent = '제출된 체크리스트를 불러오는 중입니다.';
  try {
    const response = await fetch('https://api.github.com/repos/' + repo + '/issues?' + query, {cache: 'no-cache'});
    if (!response.ok) throw new Error('GitHub request failed');
    const issues = (await response.json()).filter(issue => !issue.pull_request).slice(0, 10);
    for (const issue of issues) {
      const link = document.createElement('a');
      link.href = 'https://github.com/' + repo + '/issues/' + Number(issue.number);
      link.textContent = '#' + issue.number + ' ' + issue.title;
      const verdict = (issue.body || '').match(/^\s*\*\*판정\*\*\s*[—:：-]\s*(성공|일부 성공|실패)\s*$/m);
      const item = document.createElement('li');
      item.append(link, ' · ' + issue.user.login + ' · ' + (verdict ? verdict[1] : '판정 미기재'));
      list.append(item);
    }
    list.hidden = issues.length === 0;
    status.textContent = issues.length ? '최근 제출된 결과입니다. 제목을 누르면 관찰값과 체크리스트를 확인할 수 있습니다.' : '아직 제출된 교차 검증 결과가 없습니다.';
  } catch {
    status.textContent = '목록을 불러오지 못했습니다. 위의 GitHub 전체 결과 링크에서 확인하세요.';
  }
})();
