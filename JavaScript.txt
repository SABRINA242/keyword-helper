// HTML 요소(버튼, 입력창 등) 미리 찾아놓기
const rssUrlInput = document.getElementById('rssUrlInput');
const corsProxyInput = document.getElementById('corsProxyInput');
const fetchRssButton = document.getElementById('fetchRssButton');
const titlesContainer = document.getElementById('titlesContainer');
const titlesCountSpan = document.getElementById('titlesCount');
const extractKeywordsButton = document.getElementById('extractKeywordsButton');
const majorKeywordsContainer = document.getElementById('majorKeywordsContainer');

let allTitlesText = ""; // 모든 제목을 합쳐서 저장할 변수
let currentRssUrl = ""; // 현재 사용 중인 RSS 주소 저장

// 'RSS 가져오기' 버튼 눌렀을 때 실행할 동작
fetchRssButton.addEventListener('click', async () => {
    const rssUrl = rssUrlInput.value.trim(); // 입력된 RSS 주소
    const corsProxy = corsProxyInput.value.trim(); // 입력된 CORS 프록시 주소

    // RSS 주소 없으면 알림
    if (!rssUrl) {
        alert('RSS 피드 URL을 입력해주세요.');
        return;
    }
    // CORS 프록시 주소 형식 안 맞으면 알림
    if (!corsProxy.includes('?url=')) {
        alert('CORS 프록시 URL 형식이 잘못되었습니다. 주소에 "?url="이 포함되어야 합니다. (예: https://api.allorigins.win/raw?url=)');
        return;
    }

    currentRssUrl = rssUrl; // 현재 RSS 주소 기억하기
    titlesContainer.innerHTML = '<p>RSS 피드를 가져오는 중...</p>'; // 화면에 "가져오는 중" 표시
    titlesCountSpan.textContent = '0'; // 제목 개수 0으로 초기화
    extractKeywordsButton.style.display = 'none'; // '키워드 추출' 버튼 숨기기
    majorKeywordsContainer.innerHTML = ''; // 이전 키워드 내용 지우기
    allTitlesText = ""; // 이전 제목 내용 지우기

    try {
        // CORS 프록시를 통해 RSS 데이터 가져오기 시도
        const response = await fetch(corsProxy + encodeURIComponent(rssUrl));
        
        // 가져오기 실패하면 에러 처리
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}. 프록시 서버가 응답하지 않거나 URL에 문제가 있을 수 있습니다.`);
        }
        
        const str = await response.text(); // 가져온 내용을 글자로 변환
        const data = new window.DOMParser().parseFromString(str, "text/xml"); // 글자를 XML 형식으로 분석

        // XML에서 'item' 또는 'entry' 태그 찾기 (RSS/Atom 피드 종류에 따라 다름)
        let items = data.querySelectorAll("item"); 
        if (items.length === 0 && data.querySelectorAll("entry").length > 0) {
            items = data.querySelectorAll("entry"); 
            // console.log("Atom 피드로 감지되어 처리합니다."); // Atom 피드면 콘솔에 알림 (사용자에게 보일 필요는 없음)
        }

        // 찾은 기사가 없으면 알림
        if (items.length === 0) {
            titlesContainer.innerHTML = '<p>피드에서 기사를 찾을 수 없습니다. RSS URL 또는 CORS 프록시 설정을 확인해주세요.</p>';
            return;
        }
        
        let titlesHtml = '<ul>'; // 제목 목록을 HTML로 만들기 시작
        items.forEach(item => { // 각 기사(item)마다 반복
            const titleElement = item.querySelector("title"); // 제목(title) 부분 찾기
            const linkElement = item.querySelector("link"); // 링크(link) 부분 찾기
            
            // Atom 피드는 링크 형식이 다를 수 있어서 처리
            const linkHref = linkElement ? (linkElement.getAttribute('href') || linkElement.textContent) : '#';

            if (titleElement) { // 제목이 있으면
                const title = titleElement.textContent; // 제목 글자 가져오기
                // 목록에 추가 (클릭하면 새 탭에서 원본 기사 열리도록)
                titlesHtml += `<li><a href="${linkHref}" target="_blank" rel="noopener noreferrer">${title}</a></li>`;
                allTitlesText += title + " "; // 나중에 키워드 분석을 위해 모든 제목을 한 곳에 모아둠
            }
        });
        titlesHtml += '</ul>'; // HTML 목록 끝
        
        titlesContainer.innerHTML = titlesHtml; // 완성된 목록을 화면에 표시
        titlesCountSpan.textContent = items.length; // 제목 개수 표시
        extractKeywordsButton.style.display = 'block'; // '키워드 추출' 버튼 보이기

    } catch (error) { // 에러 발생 시 처리
        console.error('Error fetching or parsing RSS feed:', error);
        titlesContainer.innerHTML = `<p>RSS 피드를 가져오는 데 실패했습니다: ${error.message}</p>`;
    }
});

// 페이지 처음 열릴 때, 이전에 사용한 RSS 주소 있으면 자동으로 입력해주기
document.addEventListener('DOMContentLoaded', () => {
    const lastRssUrl = localStorage.getItem('lastRssUrl_keywordHelper');
    if (lastRssUrl) {
        rssUrlInput.value = lastRssUrl;
    }
});

// 페이지 닫거나 다른 곳으로 이동하기 전에, 현재 RSS 주소 저장하기
window.addEventListener('beforeunload', () => {
    if (currentRssUrl) {
        localStorage.setItem('lastRssUrl_keywordHelper', currentRssUrl);
    }
});