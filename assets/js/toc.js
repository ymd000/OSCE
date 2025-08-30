// 目次とスクロール追跡機能
document.addEventListener('DOMContentLoaded', function() {
  // 記事コンテンツと目次コンテナを取得
  const postContent = document.querySelector('.post .post-content, .post .e-content');
  const tocContainer = document.getElementById('toc-container');
  
  if (!postContent || !tocContainer) return;
  
  // 見出し要素を取得（h1, h2, h3のみ）
  const headings = postContent.querySelectorAll('h1, h2, h3');
  
  if (headings.length === 0) {
    tocContainer.innerHTML = '<p class="no-headings">目次はありません</p>';
    calculateReadingStats();
    return;
  }
  
  // 目次を生成
  generateTOC(headings);
  
  // 文字数と読了時間を計算
  calculateReadingStats();
  
  // スクロール追跡を開始
  initScrollTracking();
});

// 目次生成関数
function generateTOC(headings) {
  const tocContainer = document.getElementById('toc-container');
  let tocHTML = '<div class="toc-list">';
  
  headings.forEach((heading, index) => {
    const level = parseInt(heading.tagName.charAt(1));
    const text = heading.textContent.trim();
    const id = `heading-${index}`;
    
    // 見出しにIDを追加（既にある場合は保持）
    if (!heading.id) {
      heading.id = id;
    }
    
    // 目次項目を追加（リストを使わずdivで構成）
    const indent = (level - 1) * 15; // レベルに応じてインデント
    tocHTML += `<div class="toc-item toc-level-${level}" style="padding-left: ${indent}px;">
      <a href="#${heading.id}" class="toc-link" data-level="${level}">
        ${escapeHtml(text)}
      </a>
    </div>`;
  });
  
  tocHTML += '</div>';
  
  tocContainer.innerHTML = tocHTML;
  
  // 目次リンクにスムーズスクロール機能を追加
  addSmoothScrolling();
}

// スムーズスクロール機能
function addSmoothScrolling() {
  const tocLinks = document.querySelectorAll('.toc-link');
  
  tocLinks.forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      
      const targetId = this.getAttribute('href').substring(1);
      const targetElement = document.getElementById(targetId);
      
      if (targetElement) {
        const headerOffset = 80; // ヘッダーの高さ分のオフセット
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
        
        // アクティブ状態を更新
        updateActiveHeading(targetElement);
      }
    });
  });
}

// スクロール追跡の初期化
function initScrollTracking() {
  const tocLinks = document.querySelectorAll('.toc-link');
  const headings = Array.from(document.querySelectorAll('.post .post-content h1, .post .post-content h2, .post .post-content h3, .post .e-content h1, .post .e-content h2, .post .e-content h3'));
  
  if (tocLinks.length === 0 || headings.length === 0) return;
  
  let ticking = false;
  
  function updateScrollPosition() {
    const scrollTop = window.pageYOffset;
    const windowHeight = window.innerHeight;
    const documentHeight = document.documentElement.scrollHeight;
    
    // ページの最下部にいる場合は最後の見出しをアクティブに
    if (scrollTop + windowHeight >= documentHeight - 100) {
      const lastHeading = headings[headings.length - 1];
      updateActiveHeading(lastHeading);
      ticking = false;
      return;
    }
    
    // 現在表示されている見出しを特定
    let activeHeading = null;
    const offset = 100; // 見出しがアクティブになるオフセット
    
    for (let i = 0; i < headings.length; i++) {
      const heading = headings[i];
      const rect = heading.getBoundingClientRect();
      
      if (rect.top <= offset) {
        activeHeading = heading;
      } else {
        break;
      }
    }
    
    updateActiveHeading(activeHeading);
    ticking = false;
  }
  
  // スクロールイベントをスロットル
  window.addEventListener('scroll', function() {
    if (!ticking) {
      requestAnimationFrame(updateScrollPosition);
      ticking = true;
    }
  });
  
  // 初期状態を設定
  updateScrollPosition();
}

// アクティブ見出しの更新
function updateActiveHeading(activeHeading) {
  const tocLinks = document.querySelectorAll('.toc-link');
  
  // すべての目次リンクからactiveクラスを削除
  tocLinks.forEach(link => {
    link.classList.remove('toc-active');
    link.parentElement.classList.remove('toc-active-item');
  });
  
  // アクティブな見出しに対応する目次リンクを強調表示
  if (activeHeading && activeHeading.id) {
    const activeLink = document.querySelector(`.toc-link[href="#${activeHeading.id}"]`);
    if (activeLink) {
      activeLink.classList.add('toc-active');
      activeLink.parentElement.classList.add('toc-active-item');
      
      // 目次をスクロールしてアクティブ項目を表示
      scrollTocToActive(activeLink);
    }
  }
}

// 目次をアクティブ項目までスクロール
function scrollTocToActive(activeLink) {
  const tocNav = document.getElementById('toc-nav');
  if (!tocNav) return;
  
  const tocRect = tocNav.getBoundingClientRect();
  const linkRect = activeLink.getBoundingClientRect();
  
  if (linkRect.top < tocRect.top || linkRect.bottom > tocRect.bottom) {
    const scrollTop = tocNav.scrollTop;
    const tocCenter = tocRect.height / 2;
    const linkCenter = linkRect.top - tocRect.top + linkRect.height / 2;
    const targetScroll = scrollTop + linkCenter - tocCenter;
    
    tocNav.scrollTo({
      top: targetScroll,
      behavior: 'smooth'
    });
  }
}

// 文字数と読了時間の計算
function calculateReadingStats() {
  const postContent = document.querySelector('.post .post-content, .post .e-content');
  if (!postContent) return;
  
  const text = postContent.textContent || postContent.innerText;
  const charCount = text.length;
  const readTime = Math.ceil(charCount / 600); // 日本語の平均読書速度 600文字/分
  
  const charCountElement = document.getElementById('char-count');
  const readTimeElement = document.getElementById('read-time');
  
  if (charCountElement) {
    charCountElement.textContent = charCount.toLocaleString() + '文字';
  }
  
  if (readTimeElement) {
    readTimeElement.textContent = readTime + '分';
  }
}

// HTMLエスケープ関数
function escapeHtml(text) {
  const div = document.createElement('div');
  div.textContent = text;
  return div.innerHTML;
}

// ページ内リンクのスムーズスクロール（一般用）
function initGeneralSmoothScroll() {
  const links = document.querySelectorAll('a[href^="#"]:not(.toc-link)');
  
  links.forEach(link => {
    link.addEventListener('click', function(e) {
      const href = this.getAttribute('href');
      if (href === '#') return;
      
      e.preventDefault();
      const targetElement = document.querySelector(href);
      
      if (targetElement) {
        const headerOffset = 80;
        const elementPosition = targetElement.getBoundingClientRect().top;
        const offsetPosition = elementPosition + window.pageYOffset - headerOffset;
        
        window.scrollTo({
          top: offsetPosition,
          behavior: 'smooth'
        });
      }
    });
  });
}

// ページ読み込み完了後に一般的なスムーズスクロールも初期化
document.addEventListener('DOMContentLoaded', function() {
  initGeneralSmoothScroll();
});