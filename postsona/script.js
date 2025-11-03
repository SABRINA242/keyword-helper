let currentSlideIndex = 0;
let totalSlides = 1;

// 이미지 관리를 위한 전역 변수 초기화
window.uploadedImages = {};
window.baseAspectRatio = null;
window.baseImageSize = { width: 0, height: 0 };

// 테마 색상 변경 이벤트 리스너
document.getElementById('primary-color').addEventListener('input', updateThemeColors);
document.getElementById('secondary-color').addEventListener('input', updateThemeColors);

// 색상 텍스트 입력 이벤트 리스너
document.getElementById('primary-color-text').addEventListener('input', function(e) {
    const colorValue = e.target.value;
    if (isValidHexColor(colorValue)) {
        document.getElementById('primary-color').value = colorValue;
        updateThemeColors();
    }
});

document.getElementById('secondary-color-text').addEventListener('input', function(e) {
    const colorValue = e.target.value;
    if (isValidHexColor(colorValue)) {
        document.getElementById('secondary-color').value = colorValue;
        updateThemeColors();
    }
});

// 컬러 피커 변경 시 텍스트 입력도 업데이트
document.getElementById('primary-color').addEventListener('input', function(e) {
    document.getElementById('primary-color-text').value = e.target.value;
});

document.getElementById('secondary-color').addEventListener('input', function(e) {
    document.getElementById('secondary-color-text').value = e.target.value;
});

// 이미지 크기 입력 리스너 (미리보기 및 코드 반영)
document.getElementById('img-width').addEventListener('input', function() {
    applyPreviewDimensions();
    reprocessAllSlides();
    generateCode();
});
document.getElementById('img-height').addEventListener('input', function() {
    applyPreviewDimensions();
    reprocessAllSlides();
    generateCode();
});

// 네이버 920×250 프리셋 버튼
const presetBtn = document.getElementById('preset-naver');
if (presetBtn) {
    presetBtn.addEventListener('click', function() {
        const w = document.getElementById('img-width');
        const h = document.getElementById('img-height');
        if (w && h) {
            w.value = 920;
            h.value = 250;
        }
        applyPreviewDimensions();
        reprocessAllSlides();
        generateCode();
    });
}

// 개별 슬라이더 이미지 270×272 프리셋 버튼
const presetItemBtn = document.getElementById('preset-naver-item');
if (presetItemBtn) {
    presetItemBtn.addEventListener('click', function() {
        const w = document.getElementById('img-width');
        const h = document.getElementById('img-height');
        if (w && h) {
            w.value = 270;
            h.value = 272;
        }
        applyPreviewDimensions();
        reprocessAllSlides();
        generateCode();
    });
}

// 박스 크기 고정 토글
const lockToggle = document.getElementById('lock-box-size');
window.lockBoxSize = lockToggle ? !!lockToggle.checked : false;
if (lockToggle) {
    lockToggle.addEventListener('change', function(e) {
        window.lockBoxSize = !!e.target.checked;
        applyPreviewDimensions();
        reprocessAllSlides();
        generateCode();
    });
}

// 이미지 리사이즈(박스 변환) 토글 및 모드
const resizeToBoxToggle = document.getElementById('resize-to-box');
window.resizeToBox = resizeToBoxToggle ? !!resizeToBoxToggle.checked : false;
if (resizeToBoxToggle) {
    resizeToBoxToggle.addEventListener('change', function(e) {
        window.resizeToBox = !!e.target.checked;
        applyPreviewDimensions();
        reprocessAllSlides();
        generateCode();
    });
}
const resizeModeSelect = document.getElementById('resize-mode');
window.resizeMode = resizeModeSelect ? resizeModeSelect.value : 'contain';
if (resizeModeSelect) {
    resizeModeSelect.addEventListener('change', function(e) {
        window.resizeMode = e.target.value;
        applyPreviewDimensions();
        reprocessAllSlides();
        generateCode();
    });
}

// 크롭/확대 기능 제거됨: 관련 초기화 및 이벤트 바인딩을 삭제
// 색상 저장 버튼 이벤트 리스너
document.getElementById('save-primary-color').addEventListener('click', savePrimaryColor);

// 네이버 기능: 분할/표시 영역 설정 상태 및 UI 바인딩
window.naverFeature = {
    enabled: false,
    splitCount: 1,
    alignments: ['full'], // 각 분할 영역의 표시 방식: 'full' | 'top' | 'middle' | 'bottom'
    showBorders: false    // 분할 경계선(검정 테두리) 표시 여부
};
const enableNaverEl = document.getElementById('enable-naver-feature');
const splitCountEl = document.getElementById('naver-split-count');
const alignmentsWrap = document.getElementById('naver-alignments');
const showBordersEl = document.getElementById('naver-show-borders');
// 단일 이미지 3등분 토글 제거됨: 항상 분할 수 3이면 자동 적용

function renderNaverAlignmentControls() {
    if (!alignmentsWrap) return;
    const n = window.naverFeature.splitCount || 1;
    const prev = (Array.isArray(window.naverFeature.alignments) ? window.naverFeature.alignments.slice() : []);
    window.naverFeature.alignments = Array.from({ length: n }, (_, i) => prev[i] || 'full');
    alignmentsWrap.innerHTML = '';
    for (let i = 0; i < n; i++) {
        const row = document.createElement('div');
        row.style.display = 'flex';
        row.style.alignItems = 'center';
        row.style.gap = '10px';

        const title = document.createElement('span');
        title.textContent = `${i + 1}분할:`;
        row.appendChild(title);

        const makeChk = (id, labelText) => {
            const wrap = document.createElement('label');
            wrap.style.display = 'flex';
            wrap.style.alignItems = 'center';
            wrap.style.gap = '6px';
            const input = document.createElement('input');
            input.type = 'checkbox';
            input.id = `${id}-${i}`; // 고유화
            const span = document.createElement('span');
            span.textContent = labelText;
            wrap.appendChild(input);
            wrap.appendChild(span);
            return { wrap, input };
        };

        const { wrap: topWrap, input: topChk } = makeChk('align-top', '상단');
        const { wrap: midWrap, input: midChk } = makeChk('align-middle', '가운데');
        const { wrap: botWrap, input: botChk } = makeChk('align-bottom', '하단');
        const { wrap: fullWrap, input: fullChk } = makeChk('align-full', '전체');

        row.appendChild(topWrap);
        row.appendChild(midWrap);
        row.appendChild(botWrap);
        row.appendChild(fullWrap);

        function setUIFromValue(val) {
            // 초기 값 반영
            topChk.checked = false; midChk.checked = false; botChk.checked = false; fullChk.checked = false;
            if (val === 'full') {
                fullChk.checked = true;
                return;
            }
            const arr = Array.isArray(val) ? val : [val];
            arr.forEach(v => {
                if (v === 'top') topChk.checked = true;
                else if (v === 'middle') midChk.checked = true;
                else if (v === 'bottom') botChk.checked = true;
            });
        }

        function updateValueFromUI(triggerEl) {
            // 개선: '전체'가 켜져 있을 때 상/중/하 중 하나를 새로 켜면 '전체'를 자동으로 끔
            const anchorTriggered = (triggerEl === topChk || triggerEl === midChk || triggerEl === botChk);
            if (anchorTriggered && triggerEl.checked && fullChk.checked) {
                fullChk.checked = false;
            }

            if (fullChk.checked) {
                topChk.checked = false; midChk.checked = false; botChk.checked = false;
                window.naverFeature.alignments[i] = 'full';
            } else {
                const selected = [];
                if (topChk.checked) selected.push('top');
                if (midChk.checked) selected.push('middle');
                if (botChk.checked) selected.push('bottom');
                if (selected.length === 0) {
                    // 아무 것도 선택 안 되면 기본을 가운데로 설정
                    window.naverFeature.alignments[i] = 'middle';
                } else if (selected.length <= 2) {
                    window.naverFeature.alignments[i] = selected.length === 1 ? selected[0] : selected;
                } else {
                    // 3개 이상 선택 방지: 현재 트리거를 되돌림
                    if (triggerEl) triggerEl.checked = false;
                    return;
                }
            }
            reprocessAllSlides();
            generateCode();
        }

        [topChk, midChk, botChk, fullChk].forEach(chk => {
            chk.addEventListener('change', () => updateValueFromUI(chk));
        });

        // 초기 상태 적용
        setUIFromValue(window.naverFeature.alignments[i]);
        alignmentsWrap.appendChild(row);
    }
}

if (enableNaverEl) {
    enableNaverEl.addEventListener('change', (e) => {
        window.naverFeature.enabled = !!e.target.checked;
        renderNaverAlignmentControls();
        reprocessAllSlides();
        generateCode();
    });
}
if (splitCountEl) {
    splitCountEl.addEventListener('change', (e) => {
        window.naverFeature.splitCount = parseInt(e.target.value, 10) || 1;
        renderNaverAlignmentControls();
        reprocessAllSlides();
        generateCode();
    });
}
// 경계선 표시 토글
if (showBordersEl) {
    showBordersEl.addEventListener('change', (e) => {
        window.naverFeature.showBorders = !!e.target.checked;
        reprocessAllSlides();
        generateCode();
    });
}
// 단일 이미지 3등분 자동 분할 토글
// (제거)
// 초기 렌더링
renderNaverAlignmentControls();
// 크롭/확대 관련 UI는 제거되었으므로 가시성 토글 함수는 더이상 필요하지 않음


// 가이드 편집 이벤트 리스너
document.getElementById('guide-title').addEventListener('input', updatePreview);
// 단계 번호 표시 토글 이벤트 리스너
document.getElementById('show-step-numbers').addEventListener('change', updatePreview);
document.addEventListener('input', function(e) {
    if (e.target.classList.contains('step-title') || e.target.classList.contains('step-description')) {
        updatePreview();
    }
});

function updateThemeColors() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    
    document.documentElement.style.setProperty('--primary-color', primaryColor);
    document.documentElement.style.setProperty('--secondary-color', secondaryColor);
    
    generateCode();
}

// 색상 유효성 검사 함수
function isValidHexColor(color) {
    const hexColorRegex = /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/;
    return hexColorRegex.test(color);
}

// 주 색상 저장 함수
function savePrimaryColor() {
    const primaryColor = document.getElementById('primary-color').value;
    localStorage.setItem('savedPrimaryColor', primaryColor);
    
    // 저장 완료 알림
    const saveBtn = document.getElementById('save-primary-color');
    const originalText = saveBtn.textContent;
    saveBtn.textContent = '저장됨!';
    saveBtn.style.background = '#28a745';
    
    setTimeout(() => {
        saveBtn.textContent = originalText;
        saveBtn.style.background = '';
    }, 1500);
}

// 저장된 색상 불러오기 함수
function loadSavedColor() {
    const savedColor = localStorage.getItem('savedPrimaryColor');
    if (savedColor && isValidHexColor(savedColor)) {
        document.getElementById('primary-color').value = savedColor;
        document.getElementById('primary-color-text').value = savedColor;
        updateThemeColors();
    }
}

function updatePreview() {
    const title = document.getElementById('guide-title').value;
    document.getElementById('preview-title').textContent = title;
    
    const slideEditors = document.querySelectorAll('.slide-editor');
    const slides = document.querySelectorAll('.slide');
    const showStepNumbers = document.getElementById('show-step-numbers').checked;
    
    // totalSlides를 실제 슬라이드 개수로 업데이트
    totalSlides = slideEditors.length;
    
    slideEditors.forEach((editor, index) => {
        if (slides[index]) {
            const stepTitle = editor.querySelector('.step-title').value;
            const stepDescription = editor.querySelector('.step-description').value;
            const stepNumber = index + 1;
            
            const slideTitle = slides[index].querySelector('.slide-title');
            const slideDesc = slides[index].querySelector('.slide-desc');
            const placeholderSpan = slides[index].querySelector('.placeholder-image span');
            
            // 단계 번호 표시 토글에 따라 제목 형식 변경
            if (slideTitle) {
                slideTitle.textContent = showStepNumbers ? `${stepNumber}단계: ${stepTitle}` : stepTitle;
            }
            if (slideDesc) slideDesc.textContent = stepDescription;
            if (placeholderSpan) {
                placeholderSpan.textContent = showStepNumbers ? `${stepNumber}단계 이미지` : `${stepTitle} 이미지`;
            }
        }
    });
    
    // 선택된 이미지 크기 적용
    applyPreviewDimensions();
    
    generateCode();
}

function addSlide() {
    totalSlides++;
    const showStepNumbers = document.getElementById('show-step-numbers').checked;
    
    // 편집기에 새 슬라이드 추가
    const slideEditors = document.getElementById('slide-editors');
    const newEditor = document.createElement('div');
    newEditor.className = 'slide-editor';
    newEditor.setAttribute('data-slide', totalSlides);
    newEditor.innerHTML = `
        <h5>${totalSlides}단계</h5>
        <input type="text" class="step-title" placeholder="단계 제목" value="새 단계">
        <textarea class="step-description" placeholder="단계 설명">새 단계에 대한 설명을 입력하세요.</textarea>
        <div class="image-upload">
            <label for="image-${totalSlides}">이미지 업로드:</label>
            <input type="file" id="image-${totalSlides}" accept="image/*" multiple onchange="handleImageUpload(${totalSlides}, this)">
            <div class="image-preview" id="preview-${totalSlides}">
                <span>이미지를 선택하세요</span>
            </div>
        </div>
    `;
    slideEditors.appendChild(newEditor);
    
    // 미리보기에 새 슬라이드 추가
    const slidesWrapper = document.getElementById('slides-wrapper');
    const newSlide = document.createElement('div');
    newSlide.className = 'slide';
    const slideTitle = showStepNumbers ? `${totalSlides}단계: 새 단계` : '새 단계';
    const imagePlaceholder = showStepNumbers ? `${totalSlides}단계 이미지` : '새 단계 이미지';
    newSlide.innerHTML = `
        <div class="slide-image">
            <div class="placeholder-image" id="slide-image-${totalSlides}">
                <span>${imagePlaceholder}</span>
                <p>여기에 스크린샷을 넣으세요</p>
            </div>
        </div>
        <div class="slide-description">
            <h5 class="slide-title">${slideTitle}</h5>
            <p class="slide-desc">새 단계에 대한 설명을 입력하세요.</p>
        </div>
    `;
    slidesWrapper.appendChild(newSlide);
    
    // 총 단계 수 업데이트
    document.querySelector('.total-steps').textContent = totalSlides;
    
    // 이벤트 리스너 추가
    const newStepTitle = newEditor.querySelector('.step-title');
    const newStepDescription = newEditor.querySelector('.step-description');
    newStepTitle.addEventListener('input', updatePreview);
    newStepDescription.addEventListener('input', updatePreview);
    
    updatePreview();
}

function removeSlide() {
    if (totalSlides <= 1) {
        alert('최소 1개의 단계는 필요합니다.');
        return;
    }
    
    // 마지막 슬라이드 편집기 제거
    const slideEditors = document.getElementById('slide-editors');
    const lastEditor = slideEditors.lastElementChild;
    if (lastEditor) {
        slideEditors.removeChild(lastEditor);
    }
    
    // 마지막 슬라이드 제거
    const slidesWrapper = document.getElementById('slides-wrapper');
    const lastSlide = slidesWrapper.lastElementChild;
    if (lastSlide) {
        slidesWrapper.removeChild(lastSlide);
    }
    
    // 마지막 점 제거
    const dotsContainer = document.getElementById('dots-container');
    const lastDot = dotsContainer.lastElementChild;
    if (lastDot) {
        dotsContainer.removeChild(lastDot);
    }
    
    totalSlides--;
    
    // 현재 슬라이드가 삭제된 슬라이드였다면 이전 슬라이드로 이동
    if (currentSlideIndex >= totalSlides) {
        currentSlideIndex = totalSlides - 1;
        showSlide(currentSlideIndex);
    }
    
    // 총 단계 수 업데이트
    document.querySelector('.total-steps').textContent = totalSlides;
    
    // 편집기 제목 번호 재정렬
    const allSlideEditors = document.querySelectorAll('.slide-editor');
    allSlideEditors.forEach((editor, index) => {
        const h5 = editor.querySelector('h5');
        if (h5) {
            h5.textContent = `${index + 1}단계`;
        }
        editor.setAttribute('data-slide', index + 1);
    });
    
    // 미리보기 업데이트 (단계 번호 재정렬)
    updatePreview();
}

function showSlide(index) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    
    // 슬라이드 이동
    const slidesWrapper = document.querySelector('.slides-wrapper');
    slidesWrapper.style.transform = `translateX(-${index * 100}%)`;
    
    // 활성 슬라이드 업데이트
    slides.forEach((slide, i) => {
        slide.classList.toggle('active', i === index);
    });
    
    // 점 표시 업데이트
    dots.forEach((dot, i) => {
        dot.classList.toggle('active', i === index);
    });
    
    // 단계 표시 업데이트
    document.querySelector('.current-step').textContent = index + 1;
    document.querySelector('.total-steps').textContent = totalSlides;
    
    // 버튼 상태 업데이트
    const prevBtn = document.querySelector('.prev-btn');
    const nextBtn = document.querySelector('.next-btn');
    
    // 슬라이드가 1개일 때도 버튼이 작동하도록 수정
    if (totalSlides <= 1) {
        prevBtn.disabled = false;
        nextBtn.disabled = false;
    } else {
        prevBtn.disabled = index === 0;
        nextBtn.disabled = index === totalSlides - 1;
    }
    
    currentSlideIndex = index;
}

function changeSlide(direction) {
    const newIndex = currentSlideIndex + direction;
    if (newIndex >= 0 && newIndex < totalSlides) {
        showSlide(newIndex);
    }
}

function currentSlide(index) {
    showSlide(index - 1);
}

// 키보드 네비게이션
document.addEventListener('keydown', (e) => {
    if (e.key === 'ArrowLeft') {
        changeSlide(-1);
    } else if (e.key === 'ArrowRight') {
        changeSlide(1);
    }
});

// 터치 스와이프 지원
let startX = 0;
let endX = 0;

document.querySelector('.slider-container').addEventListener('touchstart', (e) => {
    startX = e.touches[0].clientX;
});

document.querySelector('.slider-container').addEventListener('touchend', (e) => {
    endX = e.changedTouches[0].clientX;
    handleSwipe();
});

function handleSwipe() {
    const swipeThreshold = 50;
    const diff = startX - endX;
    
    if (Math.abs(diff) > swipeThreshold) {
        if (diff > 0) {
            changeSlide(1); // 왼쪽으로 스와이프 - 다음 슬라이드
        } else {
            changeSlide(-1); // 오른쪽으로 스와이프 - 이전 슬라이드
        }
    }
}

// 미리보기에 선택한 이미지 너비/높이 적용
function applyPreviewDimensions() {
    const widthInput = document.getElementById('img-width');
    const heightInput = document.getElementById('img-height');
    if (!widthInput || !heightInput) return;

    const imgWidth = parseInt(widthInput.value, 10) || 920;
    const imgHeight = parseInt(heightInput.value, 10) || 250;

    const slider = document.getElementById('guideSlider');
    if (slider) {
        // 슬라이더 내부 패딩을 고려하여 외부 컨테이너 너비를 이미지 너비에 맞춤
        const inner = slider.querySelector('.slider-container');
        let horizontalPadding = 0;
        if (inner) {
            const cs = getComputedStyle(inner);
            const pl = parseInt(cs.paddingLeft || '0', 10);
            const pr = parseInt(cs.paddingRight || '0', 10);
            horizontalPadding = (isNaN(pl) ? 0 : pl) + (isNaN(pr) ? 0 : pr);
        }
        const targetWidth = imgWidth + horizontalPadding;
        slider.style.width = targetWidth + 'px';
        slider.style.maxWidth = targetWidth + 'px';

        // 프리뷰 섹션 컨테이너도 동일하게 확장 (패딩 포함)
        const preview = document.querySelector('.preview-section');
        if (preview) {
            const pcs = getComputedStyle(preview);
            const ppl = parseInt(pcs.paddingLeft || '0', 10);
            const ppr = parseInt(pcs.paddingRight || '0', 10);
            const previewWidth = targetWidth + (isNaN(ppl) ? 0 : ppl) + (isNaN(ppr) ? 0 : ppr);
            preview.style.width = previewWidth + 'px';
            preview.style.maxWidth = 'none';
        }
    }

    // 슬라이드 이미지 컨테이너 크기 적용
    document.querySelectorAll('.slide-image').forEach(el => {
        el.style.width = imgWidth + 'px';
        el.style.height = imgHeight + 'px';
    });

    // 네비게이션 버튼 위치를 헤더 높이 + 컨테이너 패딩 + 이미지 중앙으로 동기화
    const headerEl = document.querySelector('#guideSlider .slider-header');
    const contEl = document.querySelector('#guideSlider .slider-container');
    let headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
    let topPad = 0;
    let bottomPad = 0;
    if (contEl) {
        const cs = getComputedStyle(contEl);
        topPad = parseInt(cs.paddingTop || '0', 10) || 0;
        bottomPad = parseInt(cs.paddingBottom || '0', 10) || 0;
    }
    const topPos = Math.max(60, headerH + topPad + Math.round(imgHeight / 2));
    document.querySelectorAll('.prev-btn, .next-btn').forEach(btn => {
        btn.style.top = topPos + 'px';
    });

    // 컨테이너의 콘텐츠 높이를 미리보기와 생성 HTML에서 동일한 공식으로 강제 설정
    // 공식: 이미지 높이 + slide의 gap + 설명 영역 높이 + 컨테이너 padding(상/하)
    if (contEl) {
        const activeSlide = document.querySelector('#guideSlider .slide.active') || document.querySelector('#guideSlider .slide');
        const gapPx = activeSlide ? (parseInt(getComputedStyle(activeSlide).gap || '0', 10) || 0) : 0;
        const descEl = activeSlide ? activeSlide.querySelector('.slide-description') : null;
        const descH = descEl ? Math.round(descEl.getBoundingClientRect().height) : 0;
        const contentH = imgHeight + gapPx + descH + topPad + bottomPad;
        contEl.style.minHeight = contentH + 'px';
    }

    // 버튼 수평 위치를 이미지 가장자리 중앙에 맞춤 (미리보기)
    requestAnimationFrame(() => {
        const rootEl = document.querySelector('#guideSlider');
        const rootRect = rootEl ? rootEl.getBoundingClientRect() : null;
        const contRect = contEl ? contEl.getBoundingClientRect() : null;
        const prevBtn = document.querySelector('.prev-btn');
        const nextBtn = document.querySelector('.next-btn');
        const btnW = prevBtn ? Math.round(prevBtn.getBoundingClientRect().width) : 35;
        if (rootRect && contRect) {
            const imgLeftViewport = contRect.left + (contRect.width - imgWidth) / 2;
            const imgRightViewport = imgLeftViewport + imgWidth;
            const leftPrev = Math.round(imgLeftViewport - rootRect.left - btnW / 2);
            const leftNext = Math.round(imgRightViewport - rootRect.left - btnW / 2);
            if (prevBtn) { prevBtn.style.left = leftPrev + 'px'; prevBtn.style.right = 'auto'; prevBtn.style.marginLeft = '0px'; }
            if (nextBtn) { nextBtn.style.left = leftNext + 'px'; nextBtn.style.right = 'auto'; nextBtn.style.marginRight = '0px'; }
        }
    });

    // 박스/이미지 안내 갱신
    const guidance = document.getElementById('box-guidance');
    if (guidance) {
        const modeLabel = window.resizeMode === 'cover' ? '여백 없음(일부 크롭)' : '여백 유지';
        const resizeLabel = window.resizeToBox ? `업로드 시 이미지 ${imgWidth}×${imgHeight}로 변환` : '원본 크기 유지(표시만 맞춤)';
        const lockLabel = window.lockBoxSize ? '예' : '아니오';
        guidance.textContent = `박스 크기: ${imgWidth}×${imgHeight}px · 박스 고정: ${lockLabel} · 리사이즈: ${resizeLabel} · 모드: ${modeLabel}`;
    }
}

// 캔버스로 이미지를 박스 크기에 맞게 변환
function resizeImageToBox(srcDataUrl, targetW, targetH, mode = 'contain') {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => {
            try {
                const canvas = document.createElement('canvas');
                canvas.width = targetW;
                canvas.height = targetH;
                const ctx = canvas.getContext('2d');
                ctx.fillStyle = '#ffffff';
                ctx.fillRect(0, 0, targetW, targetH);

                const scale = (mode === 'cover')
                    ? Math.max(targetW / img.width, targetH / img.height)
                    : Math.min(targetW / img.width, targetH / img.height);
                const drawW = Math.round(img.width * scale);
                const drawH = Math.round(img.height * scale);
                const dx = Math.round((targetW - drawW) / 2);
                const dy = Math.round((targetH - drawH) / 2);

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, dx, dy, drawW, drawH);
                const out = canvas.toDataURL('image/png');
                resolve(out);
            } catch (err) {
                reject(err);
            }
        };
        img.onerror = reject;
        img.src = srcDataUrl;
    });
}
// HTML 코드 생성
function generateCode() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const title = document.getElementById('guide-title').value;
    const showStepNumbers = document.getElementById('show-step-numbers').checked;
    
    const slideEditors = document.querySelectorAll('.slide-editor');
    
    // totalSlides를 실제 슬라이드 개수로 업데이트
    totalSlides = slideEditors.length;
    
    let slidesHtml = '';
    let dotsHtml = '';
    
    slideEditors.forEach((editor, index) => {
        const stepTitle = editor.querySelector('.step-title').value;
        const stepDescription = editor.querySelector('.step-description').value;
        const stepNumber = index + 1;
        
        // 업로드된 이미지가 있는지 확인
        let imageHtml = '';
        // 사용자 지정 이미지 크기 읽기
        const widthInput = document.getElementById('img-width');
        const heightInput = document.getElementById('img-height');
        const imgWidth = widthInput ? (parseInt(widthInput.value, 10) || 920) : 920;
        const imgHeight = heightInput ? (parseInt(heightInput.value, 10) || 250) : 250;
        if (window.uploadedImages && window.uploadedImages[stepNumber]) {
            const imageData = window.uploadedImages[stepNumber];
            // 기준 비율에 맞는 스타일 사용
            const baseStyle = window.baseAspectRatio ? calculateImageStyle(window.baseAspectRatio) : imageData.style;
            // base64 이미지를 직접 HTML에 포함 (블로그스팟에서 자동 변환 지원)
            console.log('이미지 데이터:', imageData); // 디버깅용
            // URL에서 백틱과 공백 제거
            const cleanImageUrl = imageData.base64.replace(/`/g, '').trim();
            imageHtml = `<div style="
                width: ${imgWidth}px;
                height: ${imgHeight}px;
                max-width: 100%;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f9fa;
                border-radius: 10px;
                overflow: hidden;
                box-sizing: border-box;
                margin: 15px auto 0 auto;
            ">
                <img src="${cleanImageUrl}" alt="${stepNumber}단계" style="max-width: 100%; max-height: 100%; width: auto; height: auto; object-fit: contain; display: block; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>`;
        } else {
            // 이미지가 없는 경우 placeholder 표시
            imageHtml = `<div style="
                width: ${imgWidth}px;
                height: ${imgHeight}px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f9fa;
                border: 2px dashed #ddd;
                border-radius: 10px;
                color: #999;
                font-size: 1.1em;
                margin: 0 auto;
            ">
                이미지를 업로드하세요
            </div>`;
        }
        
        slidesHtml += `
            <div class="slide${index === 0 ? ' active' : ''}" style="
                min-width: 100%;
                display: flex;
                flex-direction: column;
                background: white;
                border-radius: 10px;
                box-shadow: 0 4px 12px rgba(0,0,0,0.1);
                margin: 0;
                gap: 15px;
            ">
                <div class="slide-image">
                    ${imageHtml}
                </div>
                <div class="slide-description">
                    <h5 class="slide-title">${showStepNumbers ? `${stepNumber}단계: ` : ''}${stepTitle}</h5>
                    <p class="slide-desc">${stepDescription}</p>
                </div>
            </div>`;
            
        dotsHtml += `<span class="dot${index === 0 ? ' active' : ''}" onclick="currentSlide(${stepNumber})" style="
                width: 12px;
                height: 12px;
                border-radius: 50%;
                background: ${index === 0 ? 'var(--primary-color)' : 'var(--secondary-color)'};
                cursor: pointer;
                display: inline-block;
                margin: 0 4px;
            "></span>`;
    });
    
    const showNav = document.getElementById('show-nav-buttons') ? document.getElementById('show-nav-buttons').checked : true;

    // 미리보기와 동일한 레이아웃 값을 사용하도록 이미지 박스 크기 상수화
    const widthInput = document.getElementById('img-width');
    const heightInput = document.getElementById('img-height');
    const imgWidth = widthInput ? (parseInt(widthInput.value, 10) || 920) : 920;
    const imgHeight = heightInput ? (parseInt(heightInput.value, 10) || 250) : 250;
    // 미리보기 컨테이너 실제 내부 높이를 측정하여 생성 코드에 그대로 반영
    const previewContEl = document.querySelector('#guideSlider .slider-container');
    const previewInnerHeight = previewContEl ? Math.round(previewContEl.getBoundingClientRect().height) : (imgHeight + 40);
    // 미리보기 컨테이너 좌우 패딩을 측정하여 폭에 반영 (하드코딩 40 제거)
    let previewHorizontalPadding = 40;
    if (previewContEl) {
        const pcs2 = getComputedStyle(previewContEl);
        const ppl2 = parseInt(pcs2.paddingLeft || '0', 10) || 0;
        const ppr2 = parseInt(pcs2.paddingRight || '0', 10) || 0;
        previewHorizontalPadding = ppl2 + ppr2;
    }

    const htmlCode = `<!-- 가이드 이미지 슬라이드 (블로그용 - 이미지 포함) -->
<style>
.guide-slider {
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    width: ${imgWidth + previewHorizontalPadding}px;
    max-width: none;
    margin: 20px auto;
    border: 2px solid var(--primary-color);
    border-radius: 15px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
    text-align: center;
}
@media (max-width: 768px) {
    .guide-slider {
        width: 100%;
        max-width: 100%;
        margin: 15px auto;
        margin-right: 5px;
        left: -5px;
        border-radius: 12px;
    }
}
@media (max-width: 768px) {
    .guide-slider {
        margin: 10px auto;
        border-radius: 10px;
    }
    .guide-slider .guide-title {
        text-align: left !important;
    }
}
.guide-slider .slides-wrapper {
    display: flex;
    transition: transform 0.3s ease-in-out;
}
/* preview와 동일한 컨테이너/이미지 박스 정의 (하단 여백 제거) */
.guide-slider .slider-container { position: relative; padding: 20px 20px 0 20px; }
.guide-slider .slide-image { width: ${imgWidth}px; height: ${imgHeight}px; display: flex; align-items: center; justify-content: center; background: #f8f9fa; border-radius: 10px; overflow: hidden; margin: 0 auto; box-sizing: border-box; }
.guide-slider .slide {
    min-width: 100%;
    display: flex;
    flex-direction: column;
    background: white;
    border-radius: 10px;
    box-shadow: 0 4px 12px rgba(0,0,0,0.1);
    margin: 0;
    gap: 15px;
}
/* preview와 동일한 설명 블록 스타일 적용 (높이 동기화) */
.guide-slider .slide-description {
    text-align: center;
    padding: 15px 20px;
    background: rgba(0, 123, 255, 0.05);
    border-radius: 0 0 10px 10px;
    border: 1px solid rgba(0, 123, 255, 0.1);
}
.guide-slider .slide-description h5 {
    margin: 0 0 8px 0;
    color: var(--primary-color);
    font-size: 1.1em;
    background: var(--primary-color);
    color: white;
    padding: 8px 16px;
    border-radius: 20px;
    display: inline-block;
    font-weight: bold;
}
.guide-slider .slide-description p {
    margin: 0;
    color: var(--text-color, #333333);
    line-height: 1.4;
    white-space: pre-line;
}
</style>

<div class="guide-slider">
    <div style="
        background: var(--primary-color);
        color: white;
        padding: 15px 20px;
        display: flex;
        justify-content: space-between;
        align-items: center;
    ">
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; padding: 0;">
            <h4 class="guide-title" style="margin: 0; padding: 0; font-size: 1.2em;">
                ${title}
            </h4>
            
            ${showNav ? `
            <button class="prev-btn" style="
                position: absolute;
                left: 0;
                top: 200px;
                background: rgba(255,255,255,0.9);
                color: var(--primary-color, #007bff);
                border: 2px solid var(--primary-color, #007bff);
                width: clamp(25px, 7vw, 35px);
                height: clamp(25px, 7vw, 35px);
                border-radius: 50%;
                cursor: pointer;
                font-size: clamp(1em, 3vw, 1.3em);
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                z-index: 99999;
            " onmouseover="this.style.background='var(--primary-color, #007bff)'; this.style.color='white'; this.style.borderColor='white';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.color='var(--primary-color, #007bff)'; this.style.borderColor='var(--primary-color, #007bff)';">‹</button>
            ` : ''}
            
            ${showNav ? `
            <button class="next-btn" style="
                position: absolute;
                right: 0;
                top: 200px;
                background: rgba(255,255,255,0.9);
                color: var(--primary-color, #007bff);
                border: 2px solid var(--primary-color, #007bff);
                width: clamp(25px, 7vw, 35px);
                height: clamp(25px, 7vw, 35px);
                border-radius: 50%;
                cursor: pointer;
                font-size: clamp(1em, 3vw, 1.3em);
                font-weight: bold;
                display: flex;
                align-items: center;
                justify-content: center;
                transition: all 0.3s ease;
                box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                z-index: 99999;
            " onmouseover="this.style.background='var(--primary-color, #007bff)'; this.style.color='white'; this.style.borderColor='white';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.color='var(--primary-color, #007bff)'; this.style.borderColor='var(--primary-color, #007bff)';">›</button>
            ` : ''}
            
            <div style="
                position: absolute;
                right: 0;
                background: rgba(255,255,255,0.2);
                padding: clamp(3px, 1vw, 5px) clamp(8px, 2vw, 12px);
                border-radius: clamp(10px, 3vw, 15px);
                font-size: clamp(0.7em, 2.5vw, 0.9em);
                font-weight: bold;
            "><span class="current-step">1</span> / <span class="total-steps">${totalSlides}</span></div>
        </div>
    </div>
    
    <div class="slider-container">
        <div class="slides-wrapper">
            ${slidesHtml}
        </div>
    </div>
    

</div>

<script>
// 슬라이드 기능 JavaScript 코드 (인스턴스 스코프)
(function(){
    const root = document.currentScript && document.currentScript.previousElementSibling;
    if (!root || !root.classList.contains('guide-slider')) return;

    let currentSlideIndex = 0;
    const slidesWrapper = root.querySelector('.slides-wrapper');
    const slides = root.querySelectorAll('.slide');
    const dots = root.querySelectorAll('.dot');
    const totalSlides = slides.length;

    const currentStepElement = root.querySelector('.current-step');
    const totalStepsElement = root.querySelector('.total-steps');

    function updateUI(index) {
        if (!slidesWrapper) return;
        // 퍼센트 대신 픽셀 기준으로 이동해야 고정 박스(예: 1204px)에서 정확히 맞음
        const viewportWidth = root.getBoundingClientRect().width;
        slidesWrapper.style.transform = \`translateX(-\${index * viewportWidth}px)\`;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === index);
        });
        
        dots.forEach((dot, i) => {
            dot.classList.toggle('active', i === index);
            dot.style.background = i === index ? 'var(--primary-color)' : 'var(--secondary-color)';
        });
        
        if (currentStepElement) currentStepElement.textContent = index + 1;
        if (totalStepsElement) totalStepsElement.textContent = totalSlides;
        
        const prevBtn = root.querySelector('.prev-btn');
        const nextBtn = root.querySelector('.next-btn');
        if (prevBtn && nextBtn) {
            if (totalSlides <= 1) {
                prevBtn.disabled = false;
                nextBtn.disabled = false;
            } else {
                prevBtn.disabled = index === 0;
                nextBtn.disabled = index === totalSlides - 1;
            }
        }
        
        currentSlideIndex = index;
    }

    function changeSlide(direction) {
        const newIndex = currentSlideIndex + direction;
        if (newIndex >= 0 && newIndex < totalSlides) {
            updateUI(newIndex);
        }
    }

    function goToSlide(index) {
        if (index >= 0 && index < totalSlides) {
            updateUI(index);
        }
    }

    const prevBtn = root.querySelector('.prev-btn');
    const nextBtn = root.querySelector('.next-btn');
    if (prevBtn) prevBtn.addEventListener('click', () => changeSlide(-1));
    if (nextBtn) nextBtn.addEventListener('click', () => changeSlide(1));

    dots.forEach((dot, i) => {
        dot.addEventListener('click', () => goToSlide(i));
    });

    // 초기화
    updateUI(0);

    // 버튼 위치를 헤더 높이 + 컨테이너 패딩 + 이미지 중앙으로 동기화
    const headerEl = root.querySelector('.guide-slider > div');
    const contEl = root.querySelector('.slider-container');
    const prevBtnEl = root.querySelector('.prev-btn');
    const nextBtnEl = root.querySelector('.next-btn');
    const imgH = ${imgHeight};
    let headerH = headerEl ? Math.round(headerEl.getBoundingClientRect().height) : 0;
    let topPad = 0;
    if (contEl) {
        const cs = getComputedStyle(contEl);
        topPad = parseInt(cs.paddingTop || '0', 10) || 0;
    }
    const topPx = Math.max(60, headerH + topPad + Math.round(imgH / 2));
    [prevBtnEl, nextBtnEl].forEach(btn => { if (btn) btn.style.top = topPx + 'px'; });

    // 컨테이너 높이: 미리보기보다 약 20px 더 줄여서 고정
    if (contEl) {
        contEl.style.minHeight = '${Math.max(0, previewInnerHeight - 20)}px';
    }

    // 버튼 수평 위치를 이미지 가장자리 중앙에 맞춤 (생성 HTML)
    requestAnimationFrame(() => {
        const rootRect2 = root ? root.getBoundingClientRect() : null;
        const contRect2 = contEl ? contEl.getBoundingClientRect() : null;
        const btnW2 = prevBtnEl ? Math.round(prevBtnEl.getBoundingClientRect().width) : 35;
        if (rootRect2 && contRect2) {
            const imgLeftViewport2 = contRect2.left + (contRect2.width - ${imgWidth}) / 2;
            const imgRightViewport2 = imgLeftViewport2 + ${imgWidth};
            const leftPrev2 = Math.round(imgLeftViewport2 - rootRect2.left - btnW2 / 2);
            const leftNext2 = Math.round(imgRightViewport2 - rootRect2.left - btnW2 / 2);
            if (prevBtnEl) { prevBtnEl.style.left = leftPrev2 + 'px'; prevBtnEl.style.right = 'auto'; prevBtnEl.style.marginLeft = '0px'; }
            if (nextBtnEl) { nextBtnEl.style.left = leftNext2 + 'px'; nextBtnEl.style.right = 'auto'; nextBtnEl.style.marginRight = '0px'; }
        }
    });
})();
</script>`;
    
    document.querySelector('#generatedCode code').textContent = htmlCode;
}

function copyCode() {
    const code = document.querySelector('#generatedCode code').textContent;
    navigator.clipboard.writeText(code).then(() => {
        const btn = document.querySelector('.copy-btn');
        const originalText = btn.textContent;
        btn.textContent = '복사됨!';
        btn.style.background = '#28a745';
        
        setTimeout(() => {
            btn.textContent = originalText;
            btn.style.background = '';
        }, 2000);
    });
}

// 생성된 HTML을 새 탭에서 열기
function openGeneratedInNewTab() {
    // 최신 상태 반영 후 코드 가져오기
    try { generateCode(); } catch (e) { /* ignore */ }
    const html = document.querySelector('#generatedCode code').textContent || '';
    const win = window.open('', '_blank');
    if (!win) {
        alert('팝업이 차단되었습니다. 브라우저 설정을 확인하세요.');
        return;
    }
    // 최소 문서 골격만 추가하여 스니펫을 그대로 렌더링
    win.document.open();
    win.document.write(`<!doctype html><html lang="ko"><head><meta charset="utf-8"><title>슬라이드 미리보기</title></head><body>${html}</body></html>`);
    win.document.close();
}

// 초기 설정
document.addEventListener('DOMContentLoaded', () => {
    loadSavedColor(); // 저장된 색상 불러오기
    showSlide(0);
    updatePreview();
    generateCode();
    const toggle = document.getElementById('show-nav-buttons');
    if (toggle) {
        toggle.addEventListener('change', () => {
            // 미리보기 버튼 표시/숨김
            const preview = document.querySelector('.slider-container');
            if (preview) {
                const prev = document.querySelector('.prev-btn');
                const next = document.querySelector('.next-btn');
                const show = toggle.checked;
                if (prev) prev.style.display = show ? '' : 'none';
                if (next) next.style.display = show ? '' : 'none';
            }
            // 생성 코드 갱신
            generateCode();
        });
        // 초기 상태 반영
        const initShow = toggle.checked;
        const prevInit = document.querySelector('.prev-btn');
        const nextInit = document.querySelector('.next-btn');
        if (prevInit) prevInit.style.display = initShow ? '' : 'none';
        if (nextInit) nextInit.style.display = initShow ? '' : 'none';
    }
});

// 전역 변수로 기준 비율 저장
window.baseAspectRatio = null;
window.baseImageSize = { width: 0, height: 0 };

// 이미지 업로드 처리 함수
function handleImageUpload(slideNumber, input) {
    const files = Array.from(input.files || []);
    if (!files.length) return;

    const wEl = document.getElementById('img-width');
    const hEl = document.getElementById('img-height');
    const targetW = wEl ? (parseInt(wEl.value, 10) || 700) : 700;
    const targetH = hEl ? (parseInt(hEl.value, 10) || 400) : 400;

    // 여러 장이면 박스 폭 내 가로 합성 (네이버 기능 활성 시 분할/정렬 적용)
    if (files.length > 1 && window.lockBoxSize) {
        const composePromise = (window.naverFeature && window.naverFeature.enabled)
            ? composeNaverBannerFromFiles(files, targetW, targetH, window.naverFeature.splitCount, window.naverFeature.alignments)
            : composeMosaicToBox(files, targetW, targetH, window.resizeMode);
        composePromise.then(({ mosaicUrl, originals }) => {
            // 미리보기/슬라이드 갱신
            const imageStyle = 'width: 100%; height: 100%;';
            const previewContainer = document.getElementById(`preview-${slideNumber}`);
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${mosaicUrl}" alt="업로드된 이미지(모자이크)" style="${imageStyle} object-fit: contain; border-radius: 8px;">
                    <button class="remove-image" onclick="removeImage(${slideNumber})">×</button>
                `;
            }
            const slideImage = document.getElementById(`slide-image-${slideNumber}`);
            if (slideImage) {
                slideImage.innerHTML = `<img src="${mosaicUrl}" alt="${slideNumber}단계 이미지(모자이크)" style="${imageStyle} object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
            }

            // 저장
            if (!window.uploadedImages) window.uploadedImages = {};
            window.uploadedImages[slideNumber] = {
                url: mosaicUrl,
                base64: mosaicUrl,
                originals: [mosaicUrl],
                originalsMulti: originals,
                composite: true,
                compositeWidth: targetW,
                compositeHeight: targetH,
                style: imageStyle,
                aspectRatio: targetW / targetH,
                originalWidth: targetW,
                originalHeight: targetH
            };

            updatePreview();
        }).catch(err => {
            console.warn('모자이크 합성 실패:', err);
        });
        return;
    }

    // 단일 파일 처리 (필요 시 박스 리사이즈)
    const file = files[0];
    const reader = new FileReader();
    reader.onload = async function(e) {
        let imageUrl = e.target.result;
        if (window.lockBoxSize && window.resizeToBox) {
            try {
                imageUrl = await resizeImageToBox(imageUrl, targetW, targetH, window.resizeMode);
            } catch (err) {
                console.warn('이미지 변환 실패, 원본 사용:', err);
            }
        }

        const img = new Image();
        img.onload = function() {
            const aspectRatio = this.width / this.height;

            if (slideNumber === 1 || window.baseAspectRatio === null) {
                window.baseAspectRatio = aspectRatio;
                window.baseImageSize = { width: this.width, height: this.height };
            }

            const imageStyle = (window.lockBoxSize)
                ? 'width: 100%; height: 100%;'
                : calculateImageStyle(window.baseAspectRatio);

            const previewContainer = document.getElementById(`preview-${slideNumber}`);
            if (previewContainer) {
                previewContainer.innerHTML = `
                    <img src="${imageUrl}" alt="업로드된 이미지" style="${imageStyle} object-fit: contain; border-radius: 8px;">
                    <button class="remove-image" onclick="removeImage(${slideNumber})">×</button>
                `;
            }

            const slideImage = document.getElementById(`slide-image-${slideNumber}`);
            if (slideImage) {
                slideImage.innerHTML = `<img src="${imageUrl}" alt="${slideNumber}단계 이미지" style="${imageStyle} object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
            }

            if (!window.uploadedImages) window.uploadedImages = {};
            const cleanImageUrl = imageUrl.replace(/`/g, '').trim();
            window.uploadedImages[slideNumber] = {
                url: cleanImageUrl,
                base64: cleanImageUrl,
                originals: [cleanImageUrl],
                style: imageStyle,
                aspectRatio: aspectRatio,
                originalWidth: this.width,
                originalHeight: this.height
            };

            if (!window.lockBoxSize && slideNumber === 1) {
                updateAllImageSizes();
            }

            // 업로드 직후: 네이버 분할 기능이 활성화되어 있으면 즉시 재합성
            if (window.naverFeature && (window.naverFeature.enabled && window.lockBoxSize)) {
                try {
                    reprocessAllSlides();
                    generateCode();
                } catch (err) {
                    console.warn('네이버 분할 재처리 실패:', err);
                }
            }

            updatePreview();
        };
        img.src = imageUrl;
    };
    reader.readAsDataURL(file);
}

// 기준 비율에 맞는 이미지 스타일 계산
function calculateImageStyle(baseAspectRatio) {
    if (baseAspectRatio > 1.5) {
        // 가로가 긴 기준 비율
        return 'width: 100%; height: auto; max-height: 100%;';
    } else if (baseAspectRatio < 0.7) {
        // 세로가 긴 기준 비율
        return 'height: 100%; width: auto; max-width: 100%;';
    } else {
        // 정사각형에 가까운 기준 비율
        return 'max-width: 100%; max-height: 100%; width: auto; height: auto;';
    }
}

// 모든 이미지 크기를 기준 비율에 맞춰 재조정
function updateAllImageSizes() {
    if (!window.uploadedImages || !window.baseAspectRatio) return;
    
    const baseStyle = calculateImageStyle(window.baseAspectRatio);
    
    Object.keys(window.uploadedImages).forEach(slideNumber => {
        const imageData = window.uploadedImages[slideNumber];
        
        // 스타일 업데이트
        imageData.style = baseStyle;
        
        // 미리보기 이미지 업데이트
        const previewContainer = document.getElementById(`preview-${slideNumber}`);
        if (previewContainer) {
            const img = previewContainer.querySelector('img');
            if (img) {
                img.style.cssText = `${baseStyle} object-fit: cover; border-radius: 8px;`;
            }
        }
        
        // 슬라이드 이미지 업데이트
        const slideImage = document.getElementById(`slide-image-${slideNumber}`);
        if (slideImage) {
            const img = slideImage.querySelector('img');
            if (img) {
                img.style.cssText = `${baseStyle} object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);`;
            }
        }
    });
}

// 이미지 제거 함수
function removeImage(slideNumber) {
    // 미리보기 영역 초기화
    const previewContainer = document.getElementById(`preview-${slideNumber}`);
    previewContainer.innerHTML = '<span>이미지를 선택하세요</span>';
    
    // 슬라이드 이미지 초기화
    const slideImage = document.getElementById(`slide-image-${slideNumber}`);
    if (slideImage) {
        slideImage.innerHTML = `
            <span style="font-size: 1.2em; font-weight: bold; margin-bottom: 10px;">${slideNumber}단계 이미지</span>
            <p style="font-size: 0.9em;">여기에 스크린샷을 넣으세요</p>
        `;
    }
    
    // 파일 입력 초기화
    const fileInput = document.getElementById(`image-${slideNumber}`);
    if (fileInput) {
        fileInput.value = '';
    }
    
    // 저장된 이미지 데이터 제거
    if (window.uploadedImages && window.uploadedImages[slideNumber]) {
        delete window.uploadedImages[slideNumber];
    }
    
    // 첫 번째 이미지가 제거된 경우 기준 비율 재설정
    if (slideNumber === 1) {
        window.baseAspectRatio = null;
        window.baseImageSize = { width: 0, height: 0 };
        
        // 남은 이미지 중 가장 작은 번호를 새로운 기준으로 설정
        const remainingImages = Object.keys(window.uploadedImages || {}).map(Number).sort();
        if (remainingImages.length > 0) {
            const newBaseSlide = remainingImages[0];
            const newBaseImage = window.uploadedImages[newBaseSlide];
            window.baseAspectRatio = newBaseImage.aspectRatio;
            window.baseImageSize = { 
                width: newBaseImage.originalWidth, 
                height: newBaseImage.originalHeight 
            };
            updateAllImageSizes();
        }
    }
    
    updatePreview();
}
// 여러 이미지를 박스 폭에 맞춰 가로로 나란히 합성
function composeMosaicToBox(files, targetW, targetH, mode = 'contain') {
    return new Promise(async (resolve, reject) => {
        try {
            // File들을 dataURL로 변환
            const fileToDataURL = (file) => new Promise(res => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(file);
            });
            const dataUrls = await Promise.all(files.map(fileToDataURL));

            const mosaicUrl = await composeMosaicFromData(dataUrls, targetW, targetH, mode);
            resolve({ mosaicUrl, originals: dataUrls });
        } catch (err) {
            reject(err);
        }
    });
}

// dataURL 배열로 모자이크 합성 (재처리용)
function composeMosaicFromData(dataUrls, targetW, targetH, mode = 'contain') {
    return new Promise(async (resolve, reject) => {
        try {
            const loadImage = (src) => new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = src;
            });
            const images = await Promise.all(dataUrls.map(loadImage));
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            const n = images.length;
            const baseTileW = Math.floor(targetW / n);
            let x = 0;
            for (let i = 0; i < n; i++) {
                const tileW = (i === n - 1) ? (targetW - x) : baseTileW;
                const tileH = targetH;
                const img = images[i];
                const scale = (mode === 'cover')
                    ? Math.max(tileW / img.width, tileH / img.height)
                    : Math.min(tileW / img.width, tileH / img.height);
                const drawW = Math.round(img.width * scale);
                const drawH = Math.round(img.height * scale);
                const dx = x + Math.round((tileW - drawW) / 2);
                const dy = Math.round((tileH - drawH) / 2);
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, dx, dy, drawW, drawH);
                x += tileW;
            }
            resolve(canvas.toDataURL('image/png'));
        } catch (err) { reject(err); }
    });
}

// 현재 설정에 맞춰 모든 업로드 이미지를 재처리
function reprocessAllSlides() {
    const wEl = document.getElementById('img-width');
    const hEl = document.getElementById('img-height');
    const targetW = wEl ? (parseInt(wEl.value, 10) || 700) : 700;
    const targetH = hEl ? (parseInt(hEl.value, 10) || 400) : 400;

    const updates = [];
    Object.keys(window.uploadedImages || {}).forEach((key) => {
        const slideNumber = parseInt(key, 10);
        const data = window.uploadedImages[slideNumber];
        const originals = data && data.originals;
        if (!originals || originals.length === 0) return;

        // 단일 이미지 업로드 시 분할 수가 3이면 자동 3등분은 composeNaverBannerFromData 내부에서 처리됨

        // 네이버 기능 활성화 시: 분할/정렬 합성 우선 적용
        if (window.naverFeature && window.naverFeature.enabled && window.lockBoxSize) {
            const originalsMulti = (data && data.originalsMulti) || originals;
            const n = window.naverFeature.splitCount || 1;
            const aligns = window.naverFeature.alignments || [];
            updates.push(
                composeNaverBannerFromData(originalsMulti, targetW, targetH, n, aligns)
                .then((url) => applyProcessedToSlide(slideNumber, url))
            );
            return;
        }

        if (data && data.composite) {
            // 합성 이미지를 단일 원본처럼 리사이즈 처리
            const src = data.url; // 현재 합성 결과
            if (window.lockBoxSize) {
                // 재합성: 원본 다중을 사용해 새로운 박스 크기로 합성
                const originalsMulti = data.originalsMulti || originals;
                updates.push(
                    composeMosaicFromData(originalsMulti, targetW, targetH, window.resizeMode)
                    .then((url) => applyProcessedToSlide(slideNumber, url))
                );
            } else {
                updates.push(applyProcessedToSlide(slideNumber, src));
            }
        } else if (originals.length > 1 && window.lockBoxSize) {
            updates.push(
                composeMosaicFromData(originals, targetW, targetH, window.resizeMode)
                .then((url) => applyProcessedToSlide(slideNumber, url))
            );
        } else {
            const src = originals[0];
            if (window.lockBoxSize) {
                if (window.resizeToBox) {
                    updates.push(
                        resizeImageToBox(src, targetW, targetH, window.resizeMode)
                        .then((url) => applyProcessedToSlide(slideNumber, url))
                    );
                } else {
                    updates.push(applyProcessedToSlide(slideNumber, src));
                }
            } else {
                updates.push(applyProcessedToSlide(slideNumber, src));
            }
        }
    });

    Promise.all(updates).then(() => {
        applyPreviewDimensions();
        generateCode();
    }).catch((err) => console.warn('재처리 실패:', err));
}

function applyProcessedToSlide(slideNumber, base64Url) {
    return new Promise((resolve) => {
        const imageStyle = (window.lockBoxSize) ? 'width: 100%; height: 100%;' : (window.baseAspectRatio ? calculateImageStyle(window.baseAspectRatio) : 'width: 100%; height: auto;');
        const previewContainer = document.getElementById(`preview-${slideNumber}`);
        if (previewContainer) {
            previewContainer.innerHTML = `
                <img src="${base64Url}" alt="업로드된 이미지" style="${imageStyle} object-fit: contain; border-radius: 8px;">
                <button class="remove-image" onclick="removeImage(${slideNumber})">×</button>
            `;
        }
        const slideImage = document.getElementById(`slide-image-${slideNumber}`);
        if (slideImage) {
            slideImage.innerHTML = `<img src="${base64Url}" alt="${slideNumber}단계 이미지" style="${imageStyle} object-fit: contain; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
        }
        if (!window.uploadedImages) window.uploadedImages = {};
        const prev = window.uploadedImages[slideNumber] || {};
        window.uploadedImages[slideNumber] = {
            ...prev,
            base64: base64Url,
            url: base64Url,
            // 합성 이미지라면 단일 원본처럼 유지하여 크롭 가능하게 함
            originals: prev.composite ? [base64Url] : (prev.originals || [base64Url])
        };
        resolve();
    });
}

// (크롭/줌 관련 로직은 전면 제거됨)

// 네이버 배너 분할 합성 (파일 입력)
function composeNaverBannerFromFiles(files, targetW, targetH, splitCount = 1, alignments = []) {
    return new Promise(async (resolve, reject) => {
        try {
            const fileToDataURL = (file) => new Promise(res => {
                const r = new FileReader();
                r.onload = () => res(r.result);
                r.readAsDataURL(file);
            });
            const dataUrls = await Promise.all(files.map(fileToDataURL));
            const mosaicUrl = await composeNaverBannerFromData(dataUrls, targetW, targetH, splitCount, alignments);
            resolve({ mosaicUrl, originals: dataUrls });
        } catch (err) { reject(err); }
    });
}

// 네이버 배너 분할 합성 (dataURL 배열)
function composeNaverBannerFromData(dataUrls, targetW, targetH, splitCount = 1, alignments = []) {
    return new Promise(async (resolve, reject) => {
        try {
            const loadImage = (src) => new Promise((res, rej) => {
                const img = new Image();
                img.onload = () => res(img);
                img.onerror = rej;
                img.src = src;
            });
            // 준비: 단일 이미지 3등분 모드 여부 결정
            const needed = Math.max(1, splitCount);
            let singleSplitMode = (dataUrls.length === 1 && needed === 3);
            let images;
            if (singleSplitMode) {
                images = await Promise.all([dataUrls[0]].map(loadImage));
            } else {
                // 분할 수에 맞게 이미지 준비 (부족하면 마지막 이미지를 반복)
                const prepared = [];
                for (let i = 0; i < needed; i++) {
                    const src = dataUrls[Math.min(i, dataUrls.length - 1)];
                    prepared.push(src);
                }
                images = await Promise.all(prepared.map(loadImage));
            }
            const canvas = document.createElement('canvas');
            canvas.width = targetW;
            canvas.height = targetH;
            const ctx = canvas.getContext('2d');
            ctx.fillStyle = '#ffffff';
            ctx.fillRect(0, 0, targetW, targetH);
            const n = needed;
            const baseTileW = Math.floor(targetW / n);
            let x = 0;
            const boundaries = []; // 내부 경계선 x 좌표 (마지막 타일의 우측 경계는 제외)
            for (let i = 0; i < n; i++) {
                const tileW = (i === n - 1) ? (targetW - x) : baseTileW;
                const tileH = targetH;
                const img = singleSplitMode ? images[0] : images[i];
                let align = alignments[i];
                let isContain = false;
                let anchors = null; // ['top','middle'] 등 최대 2개
                if (!align) {
                    align = 'full';
                }
                if (Array.isArray(align)) {
                    anchors = align.slice(0, 2);
                } else if (align === 'full') {
                    isContain = true;
                } else if (align === 'top' || align === 'middle' || align === 'bottom') {
                    anchors = [align];
                } else {
                    // 알 수 없는 값은 안전하게 전체(Contain)
                    isContain = true;
                }

                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';

                if (singleSplitMode) {
                    // 원본 이미지를 세로로 3등분하여 i번째 조각을 타일에 배치 (Contain)
                    const bandTop = Math.floor(img.height * i / 3);
                    const bandBottom = (i === 2) ? img.height : Math.floor(img.height * (i + 1) / 3);
                    const bandHeight = bandBottom - bandTop;
                    const sX = 0;
                    const sY = bandTop;
                    const sW = img.width;
                    const sH = bandHeight;
                    const splitScale = Math.min(tileW / sW, tileH / sH);
                    const drawW = Math.round(sW * splitScale);
                    const drawH = Math.round(sH * splitScale);
                    const dx = x + Math.round((tileW - drawW) / 2);
                    const dy = Math.round((tileH - drawH) / 2);
                    ctx.drawImage(img, sX, sY, sW, sH, dx, dy, drawW, drawH);
                } else {
                    const scale = isContain
                        ? Math.min(tileW / img.width, tileH / img.height)
                        : Math.max(tileW / img.width, tileH / img.height);
                    const drawW = Math.round(img.width * scale);
                    const drawH = Math.round(img.height * scale);
                    const dx = x + Math.round((tileW - drawW) / 2);
                    const posTop = 0;
                    const posMid = Math.round((tileH - drawH) / 2);
                    const posBot = tileH - drawH;
                    let dy;
                    if (isContain) {
                        dy = posMid;
                    } else {
                        const pickPos = (p) => (p === 'top' ? posTop : (p === 'bottom' ? posBot : posMid));
                        if (!anchors || anchors.length === 0) {
                            dy = posMid;
                        } else if (anchors.length === 1) {
                            dy = pickPos(anchors[0]);
                        } else {
                            // 두 개 선택 시 평균 위치로 배치하여 두 영역을 잇는 느낌 제공
                            dy = Math.round((pickPos(anchors[0]) + pickPos(anchors[1])) / 2);
                        }
                    }
                    ctx.drawImage(img, dx, dy, drawW, drawH);
                }
                // 현재 타일의 오른쪽 경계는 내부 분할선 기준이 됨 (마지막 타일 제외)
                const rightX = x + tileW;
                if (i < n - 1) boundaries.push(rightX);
                x += tileW;
            }
            // 요청 사항: 외곽 테두리는 제외하고, 분할 영역 사이 내부 경계선만 표시
            if (window.naverFeature && window.naverFeature.showBorders && n > 1) {
                ctx.save();
                const themeColor = (document.getElementById('primary-color') && document.getElementById('primary-color').value) || '#007bff';
                ctx.strokeStyle = themeColor;
                ctx.lineWidth = 2;
                ctx.lineCap = 'round';
                // 이미지 요소가 HTML에서 border-radius 8~10px로 표시되므로 모서리와 겹치지 않게 상/하단을 소폭 안쪽으로
                const inset = 10; // px
                for (let i = 0; i < boundaries.length; i++) {
                    const xLine = Math.round(boundaries[i]) + 0.5; // 또렷한 선을 위한 반픽셀 보정
                    ctx.beginPath();
                    ctx.moveTo(xLine, inset);
                    ctx.lineTo(xLine, targetH - inset);
                    ctx.stroke();
                }
                ctx.restore();
            }
            resolve(canvas.toDataURL('image/png'));
        } catch (err) { reject(err); }
    });
}