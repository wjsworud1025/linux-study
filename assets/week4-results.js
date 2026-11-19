(async function showResults() {
  const section = document.getElementById('week4-results');
  const status = section.querySelector('[data-results-status]');
  const members = section.querySelector('[data-member-list]');
  const examples = section.querySelector('[data-example-list]');
  const repo = 'wjsworud1025/linux-study-week4-lab';
  const query = new URLSearchParams({
    labels: 'week4-cross-check', state: 'all', sort: 'created', direction: 'desc', per_page: '100'
  });
  status.textContent = '제출된 체크리스트를 불러오는 중입니다.';
  try {
    const counts = {'성공': 0, '일부 성공': 0, '실패': 0, '판정 미기재': 0};
    const issues = new Map();
    for (let page = 1; ; page++) {
      query.set('page', page);
      const response = await fetch('https://api.github.com/repos/' + repo + '/issues?' + query, {cache: 'no-cache'});
      if (!response.ok) throw new Error('GitHub request failed');
      const batch = await response.json();
      for (const issue of batch) {
        if (!issue.pull_request) issues.set(issue.number, issue);
      }
      if (batch.length < 100) break;
    }
    for (const issue of issues.values()) {
      const link = document.createElement('a');
      link.href = 'https://github.com/' + repo + '/issues/' + Number(issue.number);
      link.textContent = '#' + issue.number + ' ' + issue.title;
      const body = (issue.body || '').replace(/\r\n?/g, '\n');
      const verdict = body.match(/^### 판정[ \t]*\n\s*(성공|일부 성공|실패)[ \t]*$/m)
        || body.match(/^\s*\*\*판정\*\*\s*[—:：-]\s*(성공|일부 성공|실패)\s*$/m);
      const result = verdict ? verdict[1] : '판정 미기재';
      const isExample = issue.labels.some(label => label.name === 'automated-example');
      const list = isExample ? examples : members;
      if (!isExample) counts[result]++;
      if (list.childElementCount >= 10) continue;
      const item = document.createElement('li');
      item.append(link, ' · ' + issue.user.login + ' · ' + result);
      list.append(item);
    }
    const total = Object.values(counts).reduce((sum, count) => sum + count, 0);
    const summary = ['팀원 제출 ' + total + '건', ...Object.entries(counts)
      .filter(([label, count]) => label !== '판정 미기재' || count > 0)
      .map(([label, count]) => label + ' ' + count + '건')];
    section.querySelector('[data-summary]').textContent = summary.join(' · ');
    members.hidden = !members.childElementCount;
    if (!examples.childElementCount) {
      const empty = document.createElement('li');
      empty.textContent = '아직 등록된 예시가 없습니다.';
      examples.append(empty);
    }
    section.querySelector('[data-results-groups]').hidden = false;
    status.hidden = true;
  } catch {
    status.textContent = '목록을 불러오지 못했습니다. 위의 GitHub 전체 결과 링크에서 확인하세요.';
  }
})();
