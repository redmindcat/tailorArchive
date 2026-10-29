const slider = document.getElementById('slider');
  const leftBtn = document.querySelector('.arrow-left');
  const rightBtn = document.querySelector('.arrow-right');
  const indicator = document.getElementById('indicator');

  let slidesOriginal = Array.from(slider.children);
  const slideCount = slidesOriginal.length;

  let slideWidth = 0;
  let visibleCount = 1;

  let cloneCount = 0;

  let currentIndex = 0; // 실제 슬라이드 인덱스 0~(slideCount-1)
  let offsetIndex = 0; // 클론 포함 전체 위치 인덱스

  let currentTranslate = 0;
  let prevTranslate = 0;

  let isDragging = false;
  let startX = 0;
  let lastX = 0;
  let lastTime = 0;
  let velocity = 0;
  let animationID = 0;

  // 슬라이드 크기와 보이는 갯수 계산
  function updateSlideWidthAndVisible() {
    slideWidth = slidesOriginal[0].offsetWidth;
    visibleCount = Math.floor(slider.parentElement.offsetWidth / slideWidth);
    cloneCount = Math.min(slideCount, visibleCount);
  }

  // 무한루프용 복제 슬라이드 셋업
  function setupInfiniteLoop() {
    [...slider.querySelectorAll('.clone')].forEach(c => c.remove());

    // 뒤쪽 clone 붙이기
    for(let i=0; i<cloneCount; i++) {
      const clone = slidesOriginal[i].cloneNode(true);
      clone.classList.add('clone');
      slider.appendChild(clone);
    }

    // 앞쪽 clone 붙이기
    for(let i=0; i<cloneCount; i++) {
      const clone = slidesOriginal[slideCount - 1 - i].cloneNode(true);
      clone.classList.add('clone');
      slider.insertBefore(clone, slider.firstChild);
    }
  }

  // 슬라이더 위치 세팅 함수
  function setPosition(x, useTransition = true) {
    slider.style.transition = useTransition ? 'transform 0.4s ease' : 'none';
    slider.style.transform = `translateX(${x}px)`;
  }

  // 슬라이드 인덱스에 맞춰 이동 (무한루프)
  function goToSlide(idx, useTransition = true) {
    currentIndex = (idx + slideCount) % slideCount;
    offsetIndex = currentIndex + cloneCount;

    currentTranslate = -offsetIndex * slideWidth;
    prevTranslate = currentTranslate;
    setPosition(currentTranslate, useTransition);
    updateIndicator(currentIndex);
  }

  // 인디케이터 업데이트
  function updateIndicator(idx) {
    indicator.textContent = `${idx + 1} / ${slideCount}`;
  }

  // 초기화 함수
  function initialize() {
    updateSlideWidthAndVisible();
    setupInfiniteLoop();
    offsetIndex = cloneCount;
    currentIndex = 0;
    currentTranslate = -offsetIndex * slideWidth;
    prevTranslate = currentTranslate;
    setPosition(currentTranslate, false);
    updateIndicator(currentIndex);
  }

  // 드래그 중 위치 실시간 업데이트 및 인디케이터 갱신
  function animation() {
    setPosition(currentTranslate, false);
    if(isDragging) {
      animationID = requestAnimationFrame(animation);

      let floatIndex = -currentTranslate / slideWidth - cloneCount;
      let realIndex = ((Math.round(floatIndex) % slideCount) + slideCount) % slideCount;
      updateIndicator(realIndex);
    }
  }

  // 관성 이동 애니메이션
  function inertiaMove() {
    velocity *= 0.95;
    currentTranslate += velocity;

    const maxTranslate = -cloneCount * slideWidth;
    const minTranslate = -(cloneCount + slideCount - 1) * slideWidth;

    if(currentTranslate > maxTranslate) {
      currentTranslate -= slideCount * slideWidth;
    } else if(currentTranslate < minTranslate) {
      currentTranslate += slideCount * slideWidth;
    }

    setPosition(currentTranslate, false);

    if(Math.abs(velocity) > 0.5) {
      animationID = requestAnimationFrame(inertiaMove);
    } else {
      let floatIndex = -currentTranslate / slideWidth - cloneCount;
      let snapIndex = Math.round(floatIndex);

      offsetIndex = snapIndex + cloneCount;
      currentTranslate = -offsetIndex * slideWidth;
      prevTranslate = currentTranslate;
      setPosition(currentTranslate);

      currentIndex = ((snapIndex % slideCount) + slideCount) % slideCount;
      updateIndicator(currentIndex);
    }
  }

  // 드래그 시작
  slider.addEventListener('mousedown', (e) => {
    e.preventDefault();
    isDragging = true;
    startX = e.pageX;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
    slider.classList.add('dragging');
    cancelAnimationFrame(animationID);
    prevTranslate = currentTranslate;
    animationID = requestAnimationFrame(animation);
  });

  // 드래그 이동
  slider.addEventListener('mousemove', (e) => {
    if(!isDragging) return;
    const currentX = e.pageX;
    const dx = currentX - startX;
    currentTranslate = prevTranslate + dx;

    const now = Date.now();
    const dt = now - lastTime;
    if(dt > 0) {
      velocity = (currentX - lastX) / dt * 16;
      lastTime = now;
      lastX = currentX;
    }
  });

  // 드래그 종료
  function dragEnd() {
    if(!isDragging) return;
    isDragging = false;
    slider.classList.remove('dragging');
    cancelAnimationFrame(animationID);
    animationID = requestAnimationFrame(inertiaMove);
  }
  document.addEventListener('mouseup', dragEnd);
  document.addEventListener('mouseleave', dragEnd);

  // 터치 이벤트
  slider.addEventListener('touchstart', (e) => {
    isDragging = true;
    startX = e.touches[0].clientX;
    lastX = startX;
    lastTime = Date.now();
    velocity = 0;
    slider.classList.add('dragging');
    cancelAnimationFrame(animationID);
    prevTranslate = currentTranslate;
    animationID = requestAnimationFrame(animation);
  });

  slider.addEventListener('touchmove', (e) => {
    if(!isDragging) return;
    const currentX = e.touches[0].clientX;
    const dx = currentX - startX;
    currentTranslate = prevTranslate + dx;

    const now = Date.now();
    const dt = now - lastTime;
    if(dt > 0) {
      velocity = (currentX - lastX) / dt * 16;
      lastTime = now;
      lastX = currentX;
    }
  });

  slider.addEventListener('touchend', dragEnd);
  slider.addEventListener('touchcancel', dragEnd);

  // 좌우 버튼 클릭
  leftBtn.addEventListener('click', () => goToSlide(currentIndex - 1));
  rightBtn.addEventListener('click', () => goToSlide(currentIndex + 1));

  // 마우스 휠 이벤트 (한 칸씩 이동)
  let wheelLock = false;
  slider.addEventListener('wheel', (e) => {
    if (wheelLock) return;
    wheelLock = true;
    e.preventDefault();
    e.deltaY > 0 ? rightBtn.click() : leftBtn.click();
    setTimeout(() => (wheelLock = false), 400);
  }, { passive: false });

  // 리사이즈 시 초기화
  window.addEventListener('resize', () => {
    updateSlideWidthAndVisible();
    initialize();
  });

  // 최초 초기화
  initialize();
