

	

$(document).ready(function() {



	//initViews();
	//addFocusListeners();
	//resize()
	

	startViews();
	resize()
	
});

var raf;
var scrollY = 0;
var focusCarouselX = 0;
var currentScroll = 0;
var isScrolling = false;
var isSnappingScroll = false;
var removedItems = [];
var isSafari = false;
var zoomLevel = 2;
var currentEase = easeOut;
var markeeScroll = 0;
var zoomInfos = [
  {
	scale: 0.3,
	dimensions: 335,
	ratioOut: 0.675,
  },
  {
	scale: 0.5,
	dimensions: 200,
	ratioOut: 0.5,
	ratioIn: -0.675,
  },
  {
	scale: 1,
	dimensions: 100,
	ratioIn: -0.5,
  },
];
var guiVal = {
      throttleInterval: 100,
      scaleTarget: 0.15,
      durationTarget: 0.6,
      threshold: 350,
      verticalGap: 1,
      horizontalGap: 1,
      ratioOut: 1,
};
var isXPView = true;
var newX = 0;
var newY = 0;
var isDragging = false;




var filteredItems = Array.from( document.querySelectorAll(".imageList .item"));

var dtWrapper = document.querySelector(".dtWrapper");
var dtCarousel = document.querySelector(".dtCarousel");
var dtThumbWrapper = document.querySelector(".dtThumbWrapper");
var focusThumb = document.querySelector(".focusThumb");
var focusInfotxt = document.querySelector(".focusInfotxt");
var dtControllBox = document.querySelector(".contBtnbox");




var allItmCollections = {}; // 전체
var allItmCollectionsList = []; //분류

var dtTargetItem,dtTarget,dtTargetCollec; //item, item img, item name
var dtCollections = []; // 상세 전체
var dtCollectionsInfo = []; //상세 이름

var dtItemHeight, dtLastPoint;
var dtCollectSlide = 0;
var dtSnapPoints = [];
var scrollAni,stTime;
var currentY = 0;
var targetY = 0;
var easing = 0.1;
var curchang = 0;
var lastScrollY = 0;
var dtScrolling = false;
var dtDragging = false;
var offsetDragY = 0;
var initialDragY = 0;
var dragDirection = 0;
var focusDragY = 0;


function startViews() {	
	filteredItems.forEach((el) => {
		var collection = el.getAttribute("data-collection");
		if (!allItmCollections[collection]) {
			allItmCollections[collection] = [];
			allItmCollectionsList.push(collection);
		}
		allItmCollections[collection].push(el);
		el.addEventListener("click", openDtSet);
    });
}



/*=======================================================================*/

// dt pop img setting
function openDtSet(e) {
	dtTargetItem = e.currentTarget;
	dtTarget = e.target;

	dtTargetCollec;
	dtCollectionsInfo = [];
	dtCollections = [];

	dtTargetCollec = dtTargetItem.dataset.collection;
	dtCollectionsInfo.push(dtTarget.dataset.itmName);
	dtCollections.push(dtTargetItem);
	
	dtTargetItemClon = dtTargetItem.cloneNode(true);
	dtTargetClon = dtTargetItem.cloneNode(true);
	dtCarousel.appendChild(dtTargetItemClon);
	focusThumb.appendChild(dtTargetClon);

	var dtCollectionsA = {}
    dtCollectionsA = allItmCollections[dtTargetCollec];
    dtCollectionsA.forEach((item) => {
		if (dtTargetItem === item) return;
		if (item) {
			//const img = item.querySelector("img");
			const clonedImage = item.cloneNode(true);
			const clonedImageSld = item.cloneNode(true);
			const text = item.childNodes[0].dataset.itmName;
		
			dtCarousel.appendChild(clonedImage);
			focusThumb.appendChild(clonedImageSld);
			dtCollections.push(clonedImage);
			dtCollectionsInfo.push(text);	
		}
	});

	/*clonedClkEl = dtTarget.cloneNode(true);		
	focusState = Flip.getState([dtTarget,]);
	const openTL = gsap.timeline();
	//$(xpWrapper).addClass("off");
	openTL.to(clonedClkEl, {
		opacity:0,
		duration: 0.2,
		delay:0.5,
	});*/

	updateContextualInfosThrottle(dtCollectSlide);
	setTimeout(() => dtViewSizeSet(), 1);	
	setTimeout(() => openDtViews(), 1);	
	//setTimeout(() => flipOnFocus(focusState), 1);	
}

// dt pop size setting
function dtViewSizeSet(){
	dtThumbHeight = focusThumb.scrollHeight;
	dtThumbItemHeight = focusThumb.querySelector("img").getBoundingClientRect().height;
    dtCarouselHeight = dtCarousel.getBoundingClientRect().height;
	$(".dtCarousel .item").css("height",dtWrapper.getBoundingClientRect().height);

	dtItemHeight = dtCarousel.querySelector(".item").getBoundingClientRect().height;

	dtSnapPoints = dtCollections.map((_, i) => -(dtItemHeight * i));
	dtLastPoint = -dtSnapPoints[dtSnapPoints.length - 1];
}

// dt pop open view
function openDtViews(){
	$(".dtWrapper").addClass("on");	
	setTimeout(function(){
		$(".dtThumbWrapper").addClass("on");
		$(".dtWrapper .contBtnbox").addClass("on");

		Array.from(focusThumb.children).forEach((c, i) => {
		  c.setAttribute("data-index", i);
		  c.addEventListener("click", dtThumbClick);
		});
	},100);

	if (allItmCollectionsList[0] == dtTargetCollec){
		$(".dtWrapper .contBtnbox .cotbtn.prev").addClass("off");
	} else if (allItmCollectionsList[allItmCollectionsList.length - 1] == dtTargetCollec){
		$(".dtWrapper .contBtnbox .cotbtn.next").addClass("off");
	}

	//focusThumb.addEventListener("click", dtThumbClick); //drag 로 넘김
	$(".contBtnbox").find(".cotbtn").off().on("click",dtControllSet);

	addEventsDtSlider();
}

// dt pop bottom btn setting
function dtControllSet(e){
	var $this = e.target;
	$(".dtThumbWrapper").removeClass("on");
	$(".dtCarousel").addClass("out");
	$(".contBtnbox").addClass("off");
	hideContextualInfos();

	setTimeout(function(){
		$(".dtCarousel").html("");
		$(".focusThumb").html("");
		dtCarousel.style.transform = `translate3d(0, 0, 0)`;
		focusThumb.style.transform = `translate3d(0, 0, 0)`;
		dtCollectSlide = 0;
		targetY = 0;
		currentY = 0;
		curchang = 0;
		setTimeout(function(){ 
			$(".contBtnbox").removeClass("off");
			$(".dtCarousel").removeClass("out");
		},300);
	},300);

	var findNextCollecPrev,findNextCollecNext;	
	for (var i = 0; i < allItmCollectionsList.length ; i++ ){
		if (allItmCollectionsList[i] == dtTargetCollec){
			findNextCollecPrev = i-1;
			findNextCollecNext = (i+1);
		}
	}

	if ($this.classList[1] == 'prev'){
		$(".contBtnbox .cotbtn.next").removeClass("off");
		dtTargetCollec = allItmCollectionsList[findNextCollecPrev];
		setTimeout(function(){			
			openDtSet({target: allItmCollections[dtTargetCollec][0].childNodes[0], currentTarget: allItmCollections[dtTargetCollec][0]});
		},300);

	} else if ($this.classList[1] == 'next'){
		$(".contBtnbox .cotbtn.prev").removeClass("off");
		dtTargetCollec = allItmCollectionsList[findNextCollecNext];
		setTimeout(function(){			
			openDtSet({target: allItmCollections[dtTargetCollec][0].childNodes[0], currentTarget: allItmCollections[dtTargetCollec][0]});
		},300);

	} else if ($this.classList[1] == 'close'){
		dtScrolling = false;
		dtDragging = false;
		$(".dtWrapper").removeClass("on");
		$(".contBtnbox").removeClass("on");
		resetScrollAni();
		dtCarouselDisableWheel();
	}	
}



// dt pop event setting
function addEventsDtSlider() {
    dtCarouselWheelEvent();
    dtWrapper.addEventListener("mousedown", dragMouseDown);
    dtWrapper.addEventListener("mousemove", dragMouseMove);
    dtWrapper.addEventListener("mouseup", dragMouseUp);
	dtWrapper.addEventListener('mouseleave', dragMouseUp);
}

// dt pop wheel setting
function dtCarouselWheel(e) {
	if(isDragging) return;
	if(dtDragging) return;
	dtScrolling = true;
	dtCarousel.classList.remove("drag-easing");
	focusThumb.classList.remove("drag-easing");
	resetScrollAni();
	playScrollAni();
	targetY += e.deltaY;
	clampTarget();
}

function dtCarouselWheelEvent() {
    handleWheelBound = (e) => dtCarouselWheel(e);
    dtWrapper.addEventListener("wheel", handleWheelBound, {
		passive: false,
    });
}
function dtCarouselDisableWheel() {
	dtWrapper.addEventListener("wheel", wheelBlock, { passive: false });
}
function wheelBlock(e) {
	e.preventDefault();
}

function resetScrollAni(){
	clearTimeout(stTime);
	cancelAnimationFrame(scrollAni);
}
function playScrollAni(){
	smoothScroll();
	stTime = setTimeout(function(){
		resetScrollAni();
	},1000);
}

function smoothScroll(){
	currentY += (targetY - currentY) * easing;
	y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 

	dtCarousel.style.transform = `translate3d(0, ${-currentY}px, 0)`;
	focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;

	scrollAni = requestAnimationFrame(smoothScroll);

	const direction = currentY - lastScrollY;
	lastScrollY = currentY;

	const threshold = dtItemHeight * (2 / 3);
	const currentSlideTop = dtCollectSlide * dtItemHeight;
	if (direction >= 0) {
		if (currentY > currentSlideTop + threshold && dtCollectSlide < dtCollections.length - 1) {
			dtCollectSlide++;
		}
	} else if (direction < 0) {
		if (currentY <= currentSlideTop - threshold && dtCollectSlide > 0) {
			dtCollectSlide--;
		}
	}

	if (curchang != dtCollectSlide){
		updateContextualInfosThrottle(dtCollectSlide);
	}
	curchang = dtCollectSlide;	
}
function clampTarget(){
	let maxScroll = 0;
	maxScroll = dtCarousel.scrollHeight - dtWrapper.clientHeight;
	targetY = Math.max(0, Math.min(targetY, maxScroll));
}

function dtThumbClick(e){
	if (dtDragging) return;
	var idx = e.target.parentNode.dataset.index;
	dtCarousel.classList.add("drag-easing");
	focusThumb.classList.add("drag-easing");
	currentY = -dtSnapPoints[idx];
	y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
	targetY = currentY;
	dtCollectSlide = idx;
	dtCarousel.style.transform = `translate3d(0, ${dtSnapPoints[idx]}px, 0)`;
	focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;

	if (curchang != dtCollectSlide){
		updateContextualInfosThrottle(dtCollectSlide);
	}
	curchang = dtCollectSlide;
}




// dt pop drag setting
var startDrg;
var endDrg;
function dragMouseDown(event) {
	event.preventDefault();
	startDrg = event.clientY;

    dtScrolling = false;
    dtDragging = true;
	dtCarousel.classList.remove("drag-easing");
	focusThumb.classList.remove("drag-easing");

    dragDirection = 0;
	initialDragY = event.clientY * 2;
    offsetDragY = event.clientY * 2 - (dtCarousel.offsetTop) + targetY;
}

function dragMouseMove(event) {
	event.preventDefault();
	if (dtDragging) {
		resetScrollAni();
        playScrollAni();

		focusDragY = event.clientY * 2 - offsetDragY;
		targetY = -focusDragY;
		dragDirection = event.clientY * 2 - initialDragY;

		clampTarget();
    }
}

function dragMouseUp(event) {
	endDrg = event.clientY;
	if (10 > Math.abs(endDrg - startDrg)){
		dtThumbClick(event);
	}
	dtScrolling = false;
	dtDragging = false;

	if (dragDirection === 0) return;
    focusDragY = targetY;	
}




// dt pop text animation
updateContextualInfosThrottle = debounce((activeIndex) => {
	updateContextualInfos(activeIndex);
}, 500);

var infosSplit;
function updateContextualInfos(currentSlide) {	
	if (infosSplit) hideContextualInfos();
    //if (!drag.enabled()) {
	setTimeout(() => {
        focusInfotxt.innerText = dtCollectionsInfo[currentSlide];
        var parentSplit = new SplitText(focusInfotxt, {
			type: "lines",
			linesClass: "split-parent",
        });
        infosSplit = new SplitText(focusInfotxt, { type: "chars" });
        showContextualInfos();
	}, 300);
    //}
}
function hideContextualInfos() {
    if (infosSplit && infosSplit.chars)
		gsap.to(infosSplit.chars, {
			// duration: 0,
			duration: 0.3,
			ease: "cubic.inOut",
			yPercent: -110,
			stagger: 0.03,
			onComplete: () => {
			},
		});
}
function showContextualInfos() {
    gsap.from(infosSplit.chars, {
		duration: 0.3,
		ease: "cubic.inOut",
		yPercent: 100,
		stagger: 0.03,
    });
}





function resize() {
	const debounce = (func, wait) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(args), wait);
		};
	};
	const handleResize = () => {

		dtCarousel.classList.add("drag-easing");
		focusThumb.classList.add("drag-easing");
		if (currentY >= (dtCarouselHeight - dtItemHeight)){
			dtCarousel.style.transform = `translate3d(0, ${-dtLastPoint}px, 0)`;
			currentY = dtLastPoint;
			updateContextualInfosThrottle(dtCollections.length - 1);

		} else {
			dtCarousel.style.transform = `translate3d(0, ${dtSnapPoints[dtCollectSlide]}px, 0)`;
			currentY = -dtSnapPoints[dtCollectSlide];
			updateContextualInfosThrottle(dtCollectSlide);

		}
		targetY = currentY;
		y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
		focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;
	};
	const debouncedResize = debounce(handleResize, 300);

	window.addEventListener("resize", () => {
		dtViewSizeSet();
		clampTarget();

		if (curchang != dtCollectSlide){
			updateContextualInfosThrottle(dtCollectSlide);
		}
		curchang = dtCollectSlide;

		debouncedResize();
	});
}




/*=======================================================================*/



















































function checkEaseFactor() {
    if (dtItemHeight / 4 < Math.abs(currentY - targetY)) { easeFactor = 0.01;
    } else easeFactor = 0.02;
}

function easeOutQuart(t) {
  return 1 - Math.pow(1 - t, 4);
}

function easePower3Out(t) {
  return (1 - (1 - t)) ^ 3;
  // Exemple d'easing
}

function easeOut(t) {
  return 1 - Math.pow(1 - t, 3); // Exemple d'easing
}

function lerp(start, end, amt) {
  return (1 - amt) * start + amt * end;
}

function debounce(fn, delay) {
  let timeoutId;

  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }

  debounced.cancel = () => clearTimeout(timeoutId);

  return debounced;
}

function addFocusListeners() {
    filteredItems.forEach((item) => {
		item.addEventListener("click", handleClick.bind(this));		
    });
}
function pauseFocusListeners() {
    pauseFocus = true;
}
function allowFocusListeners() {
    pauseFocus = false;
}

function addMouseMoveListener() {
	window.addEventListener("mousemove", throttledMouseMove);
}
function removeMouseMoveListener() {
	window.removeEventListener("mousemove", throttledMouseMove);
}
function throttledMouseMove(e){
	throttle(updateScales(e), guiVal.throttleInterval);
}

function throttle(callback, delay) {
	let lastCall = 0;
	return function (...args) {
		const now = Date.now();
		if (now - lastCall >= delay) {
			lastCall = now;
			callback(...args);
		}
	};
}

const easeQuadOut = (t) => 1 - (1 - t) ** 2;
const customEasing = (t) => gsap.parseEase("expo.inOut")(Math.max(0, t + 0.1) / 1.1);

function lerpWithEase(a, b, t, easingFunction) {
	t = easingFunction(t); // Appliquer l'easing à t
	return a + (b - a) * t; // Retourne la valeur interpolée
}
function hideDragForMore(e) {
	var dragEl = document.querySelector(".dragformorewrapper");
    if (dragEl) dragEl.classList.add("opacity-0");
    // this.drag.addEventListener("dragstart", this.hideDragForMore);
}



































function onlyDesktop() {
  const isMobileOrTablet =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || "ontouchstart" in window; // Inclut tous les appareils à écran tactile

  // Retourne true si l'écran est supérieur à 1024px et qu'il n'est pas un appareil mobile/tablette
  return !isMobileOrTablet //&& window.innerWidth >= 1024;
}

function checkIsSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function isTablet() {
  return (
    /iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) ||
    (window.innerWidth >= 768 &&
      window.innerWidth <= 1366 &&
      "ontouchstart" in window)
  );
}
function isMobileOrTabletOrLand() {
  const isTablet =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || "ontouchstart" in window;

  const isLandscape = window.matchMedia("(orientation: landscape)").matches;

  // Exclure les tablettes en mode paysage
  return isTablet && !isLandscape;
}