let currentSlideIndex = 0;
let totalSlides = 1;

// 이미지 관리를 위한 전역 변수 초기화
window.uploadedImages = {};
window.baseAspectRatio = null;
window.baseImageSize = { width: 0, height: 0 };

// 테마 색상 변경 이벤트 리스너
document.getElementById('primary-color').addEventListener('input', updateThemeColors);
document.getElementById('secondary-color').addEventListener('input', updateThemeColors);

// 가이드 편집 이벤트 리스너
document.getElementById('guide-title').addEventListener('input', updatePreview);
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

function updatePreview() {
    const title = document.getElementById('guide-title').value;
    document.getElementById('preview-title').textContent = title;
    
    const slideEditors = document.querySelectorAll('.slide-editor');
    const slides = document.querySelectorAll('.slide');
    
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
            
            if (slideTitle) slideTitle.textContent = `${stepNumber}단계: ${stepTitle}`;
            if (slideDesc) slideDesc.textContent = stepDescription;
            if (placeholderSpan) placeholderSpan.textContent = `${stepNumber}단계 이미지`;
        }
    });
    
    generateCode();
}

function addSlide() {
    totalSlides++;
    
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
            <input type="file" id="image-${totalSlides}" accept="image/*" onchange="handleImageUpload(${totalSlides}, this)">
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
    newSlide.innerHTML = `
        <div class="slide-image">
            <div class="placeholder-image" id="slide-image-${totalSlides}">
                <span>${totalSlides}단계 이미지</span>
                <p>여기에 스크린샷을 넣으세요</p>
            </div>
        </div>
        <div class="slide-description">
            <h5 class="slide-title">${totalSlides}단계: 새 단계</h5>
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

// HTML 코드 생성
function generateCode() {
    const primaryColor = document.getElementById('primary-color').value;
    const secondaryColor = document.getElementById('secondary-color').value;
    const title = document.getElementById('guide-title').value;
    
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
        if (window.uploadedImages && window.uploadedImages[stepNumber]) {
            const imageData = window.uploadedImages[stepNumber];
            // 기준 비율에 맞는 스타일 사용
            const baseStyle = window.baseAspectRatio ? calculateImageStyle(window.baseAspectRatio) : imageData.style;
            // base64 이미지를 직접 HTML에 포함 (블로그스팟에서 자동 변환 지원)
            console.log('이미지 데이터:', imageData); // 디버깅용
            // URL에서 백틱과 공백 제거
            const cleanImageUrl = imageData.base64.replace(/`/g, '').trim();
            imageHtml = `<div style="
                width: 600px;
                height: 400px;
                display: flex;
                align-items: center;
                justify-content: center;
                background: #f8f9fa;
                border-radius: 10px;
                overflow: hidden;
                margin: 0 auto;
            ">
                <img src="${cleanImageUrl}" alt="${stepNumber}단계" style="width: 100%; height: 100%; object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">
            </div>`;
        } else {
            // 이미지가 없는 경우 placeholder 표시
            imageHtml = `<div style="
                width: 600px;
                height: 400px;
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
                overflow: hidden;
                margin: 0;
            ">
                <div style="flex: 1;">
                    ${imageHtml}
                </div>
                <div style="
                    text-align: center;
                    padding: 15px 20px;
                    background: white;
                    border-radius: 0 0 10px 10px;
                ">
                    <h5 style="color: var(--primary-color); margin: 0 0 8px 0; font-size: 1.1em;">${stepNumber}단계: ${stepTitle}</h5>
                    <p style="margin: 0; color: #666; line-height: 1.4;">${stepDescription}</p>
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
    
    const htmlCode = `<!-- 가이드 이미지 슬라이드 (블로그용 - 이미지 포함) -->
<style>
.guide-slider {
    --primary-color: ${primaryColor};
    --secondary-color: ${secondaryColor};
    max-width: 700px;
    margin: 20px auto;
    border: 2px solid var(--primary-color);
    border-radius: 15px;
    overflow: hidden;
    background: #ffffff;
    box-shadow: 0 4px 15px rgba(0,0,0,0.1);
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    position: relative;
}
.guide-slider .slides-wrapper {
    display: flex;
    transition: transform 0.3s ease-in-out;
}
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
        <div style="display: flex; align-items: center; justify-content: space-between; width: 100%; position: relative;">
            <h4 style="margin: 0; font-size: 1.2em;">${title}</h4>
            
            <div style="position: absolute; left: 50%; transform: translateX(-50%); display: flex; align-items: center; gap: 20px;">
                <button onclick="changeSlide(-1)" style="
                    background: rgba(255,255,255,0.9);
                    color: var(--primary-color, #007bff);
                    border: 2px solid var(--primary-color, #007bff);
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.3em;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                " onmouseover="this.style.background='var(--primary-color, #007bff)'; this.style.color='white'; this.style.borderColor='white';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.color='var(--primary-color, #007bff)'; this.style.borderColor='var(--primary-color, #007bff)';">‹</button>
                
                <button onclick="changeSlide(1)" style="
                    background: rgba(255,255,255,0.9);
                    color: var(--primary-color, #007bff);
                    border: 2px solid var(--primary-color, #007bff);
                    width: 35px;
                    height: 35px;
                    border-radius: 50%;
                    cursor: pointer;
                    font-size: 1.3em;
                    font-weight: bold;
                    display: flex;
                    align-items: center;
                    justify-content: center;
                    transition: all 0.3s ease;
                    box-shadow: 0 2px 8px rgba(0,0,0,0.2);
                " onmouseover="this.style.background='var(--primary-color, #007bff)'; this.style.color='white'; this.style.borderColor='white';" onmouseout="this.style.background='rgba(255,255,255,0.9)'; this.style.color='var(--primary-color, #007bff)'; this.style.borderColor='var(--primary-color, #007bff)';">›</button>
            </div>
            
            <div style="
                position: absolute;
                right: 0;
                background: rgba(255,255,255,0.2);
                padding: 5px 12px;
                border-radius: 15px;
                font-size: 0.9em;
                font-weight: bold;
            ">${currentSlideIndex + 1} / ${totalSlides}</div>
        </div>
    </div>
    
    <div style="position: relative;">
        <div class="slides-wrapper">
            ${slidesHtml}
        </div>
    </div>
    
    <div style="
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 10px 20px;
        background: #f8f9fa;
        border-top: 1px solid #e0e0e0;
    ">
        <div style="display: flex; gap: 8px;">
            ${dotsHtml}
        </div>
    </div>
</div>

<script>
// 슬라이드 기능 JavaScript 코드
let currentSlideIndex = 0;
const totalSlides = ${totalSlides};

function changeSlide(direction) {
    const slides = document.querySelectorAll('.slide');
    const dots = document.querySelectorAll('.dot');
    const newIndex = currentSlideIndex + direction;
    
    if (newIndex >= 0 && newIndex < totalSlides) {
        document.querySelector('.slides-wrapper').style.transform = \`translateX(-\${newIndex * 100}%)\`;
        
        slides.forEach((slide, i) => {
            slide.classList.toggle('active', i === newIndex);
        });
        
        dots.forEach((dot, i) => {
            dot.style.background = i === newIndex ? 'var(--primary-color)' : 'var(--secondary-color)';
        });
        
        // 단계 표시기 업데이트
        const currentStepElement = document.querySelector('.current-step');
        if (currentStepElement) {
            currentStepElement.textContent = newIndex + 1;
        }
        
        currentSlideIndex = newIndex;
    }
}

function currentSlide(index) {
    changeSlide(index - 1 - currentSlideIndex);
}
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

// 초기 설정
document.addEventListener('DOMContentLoaded', () => {
    showSlide(0);
    updatePreview();
    generateCode();
});

// 전역 변수로 기준 비율 저장
window.baseAspectRatio = null;
window.baseImageSize = { width: 0, height: 0 };

// 이미지 업로드 처리 함수
function handleImageUpload(slideNumber, input) {
    const file = input.files[0];
    if (file) {
        const reader = new FileReader();
        reader.onload = function(e) {
            const imageUrl = e.target.result;
            
            // 이미지 객체 생성하여 비율 파악
            const img = new Image();
            img.onload = function() {
                const aspectRatio = this.width / this.height;
                
                // 첫 번째 이미지인 경우 기준 비율로 설정
                if (slideNumber === 1 || window.baseAspectRatio === null) {
                    window.baseAspectRatio = aspectRatio;
                    window.baseImageSize = { width: this.width, height: this.height };
                }
                
                // 기준 비율에 맞춰 이미지 스타일 계산
                const imageStyle = calculateImageStyle(window.baseAspectRatio);
                
                // 미리보기 영역 업데이트
                const previewContainer = document.getElementById(`preview-${slideNumber}`);
                previewContainer.innerHTML = `
                    <img src="${imageUrl}" alt="업로드된 이미지" style="${imageStyle} object-fit: cover; border-radius: 8px;">
                    <button class="remove-image" onclick="removeImage(${slideNumber})">×</button>
                `;
                
                // 슬라이드 이미지 업데이트
                const slideImage = document.getElementById(`slide-image-${slideNumber}`);
                if (slideImage) {
                    slideImage.innerHTML = `<img src="${imageUrl}" alt="${slideNumber}단계 이미지" style="${imageStyle} object-fit: cover; border-radius: 8px; box-shadow: 0 2px 8px rgba(0,0,0,0.1);">`;
                }
                
                // 이미지 데이터와 스타일 저장 (base64로 저장)
                if (!window.uploadedImages) {
                    window.uploadedImages = {};
                }
                // URL에서 백틱과 공백 제거
                const cleanImageUrl = imageUrl.replace(/`/g, '').trim();
                window.uploadedImages[slideNumber] = {
                    url: cleanImageUrl, // 이미 base64 형태
                    base64: cleanImageUrl, // base64 데이터 명시적 저장
                    style: imageStyle,
                    aspectRatio: aspectRatio,
                    originalWidth: this.width,
                    originalHeight: this.height
                };
                
                console.log('이미지 업로드 완료:', slideNumber, window.uploadedImages[slideNumber]);
                
                // 첫 번째 이미지가 변경된 경우 모든 이미지 크기 재조정
                if (slideNumber === 1) {
                    updateAllImageSizes();
                }
                
                updatePreview();
            };
            img.src = imageUrl;
        };
        reader.readAsDataURL(file);
    }
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