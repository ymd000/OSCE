// サイドバー検索機能
document.addEventListener('DOMContentLoaded', function() {
  const searchInput = document.getElementById('sidebar-search-input');
  
  if (searchInput) {
    searchInput.addEventListener('keypress', function(e) {
      if (e.key === 'Enter') {
        e.preventDefault();
        const query = this.value.trim();
        if (query) {
          // 検索ページに移動
          window.location.href = '/search/?q=' + encodeURIComponent(query);
        }
      }
    });
    
    // 検索入力時のライブフィードバック
    searchInput.addEventListener('input', function() {
      const query = this.value.trim();
      if (query.length > 2) {
        // 3文字以上で簡易検索開始
        performQuickSearch(query);
      } else {
        clearQuickResults();
      }
    });
  }
});

// 簡易検索機能（JSON検索データを使用）
function performQuickSearch(query) {
  fetch('/search.json')
    .then(response => response.json())
    .then(data => {
      const results = data.filter(post => 
        post.title.toLowerCase().includes(query.toLowerCase()) ||
        post.content.toLowerCase().includes(query.toLowerCase())
      ).slice(0, 3); // 最大3件
      
      displayQuickResults(results, query);
    })
    .catch(error => {
      console.log('検索エラー:', error);
    });
}

// 簡易検索結果の表示
function displayQuickResults(results, query) {
  let quickResultsDiv = document.getElementById('quick-search-results');
  
  if (!quickResultsDiv) {
    quickResultsDiv = document.createElement('div');
    quickResultsDiv.id = 'quick-search-results';
    quickResultsDiv.className = 'quick-search-results';
    document.getElementById('sidebar-search-input').parentNode.appendChild(quickResultsDiv);
  }
  
  if (results.length === 0) {
    quickResultsDiv.innerHTML = '<p class="no-quick-results">該当する記事がありません</p>';
  } else {
    let html = '<div class="quick-results-header">検索結果（' + results.length + '件）</div>';
    results.forEach(result => {
      html += `
        <div class="quick-result-item">
          <a href="${result.url}" class="quick-result-link">
            <h4>${highlightText(result.title, query)}</h4>
            <p>${highlightText(truncateText(result.content, 50), query)}</p>
          </a>
        </div>
      `;
    });
    html += `<div class="quick-results-footer"><a href="/search/?q=${encodeURIComponent(query)}">すべての結果を見る</a></div>`;
    quickResultsDiv.innerHTML = html;
  }
  
  quickResultsDiv.style.display = 'block';
}

// 簡易検索結果をクリア
function clearQuickResults() {
  const quickResultsDiv = document.getElementById('quick-search-results');
  if (quickResultsDiv) {
    quickResultsDiv.style.display = 'none';
  }
}

// テキストのハイライト表示
function highlightText(text, query) {
  const regex = new RegExp(`(${escapeRegExp(query)})`, 'gi');
  return text.replace(regex, '<mark>$1</mark>');
}

// テキストの切り詰め
function truncateText(text, length) {
  if (text.length <= length) return text;
  return text.substr(0, length) + '...';
}

// 正規表現用エスケープ
function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

// クリックアウトサイドで結果を非表示
document.addEventListener('click', function(e) {
  const searchContainer = e.target.closest('.search-container');
  if (!searchContainer) {
    clearQuickResults();
  }
});