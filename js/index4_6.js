
var dtSm = false;
var isSafari = false;
var mobgaro = false;
var zoomLevel = 2;
var zoomStep = 1;
var zoomInfos = [
  {
	scale: 0.3,
	dimensions: 333.3,
	ratioOut: 0.666,
  },
  {
	scale: 0.5,
	dimensions: 200,
	ratioOut: 0.5,
	ratioIn: -0.666,
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
var zoomDim;
var xpWrapper = document.querySelector(".xp-wrapper");
var xpWrapperC = document.querySelector(".imageList");
var zoomWrapper = $(".zoomWrapper");
var gdWrapper = $(".gd-wrapper");
var viewButton = $(".viewBtnbox .vbtn");
var firstList = document.querySelectorAll(".imgeGdWrap .item");
var filteredItems = Array.from( document.querySelectorAll(".imageList .item"));
var itemsCard = Array.from(document.querySelectorAll(".imgeGdWrap"));

var allItems = [];
var collectionGrid = document.querySelector(".imgeGdList");
var bgColorC = false;

var dtWrapper = document.querySelector(".dtWrapper");
var dtCarouselWrapper = document.querySelector(".dtCarouselWrapper");
var dtCarousel = document.querySelector(".dtCarousel");
var dtThumbWrapper = document.querySelector(".dtThumbWrapper");
var focusThumb = document.querySelector(".focusThumb");
var focusInfotxt = document.querySelector(".focusInfotxt .txt");
var dtControllBox = document.querySelector(".contBtnbox");

var orderedCollections = {}; // 전체
var orderedCollectionsList = []; //분류
var firstLen = [];

var dtTargetItem,dtTarget,dtCollectionsInfo; //item, item img, item name
var dtCollections = []; // 상세 전체

var dtItemHeight, dtLastPoint;
var dtCollectSlide = 0;
var dtSnapPoints = [];
var scrollAni,stTime;
var currentY = 0;
var targetX = 0;
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

// xp wrapper drag setting
var xpStartDrgX,xpStartDrgY,xpEndDrgX,xpEndDrgY;
var xpScrolling = false;
var xpDragging = false;
var xpDragDirectionX = 0;
var xpDragDirectionY = 0;
var xpOffsetDragX = 0;
var xpOffsetDragY = 0;
var xpInitialDragX = 0;
var xpInitialDragY = 0;
var xpFocusDragX = 0;
var xpFocusDragY = 0;
var xpTargetX = 0;
var xpTargetY = 0;
var xpCurrentX = 0;
var xpCurrentY = 0;
var openDtFirst = true;

var gridInsertCurrentIndex = 0;
var sequentialOnAnimationIndex = [];
var currentRowIndex = 0;
var processedRows = new Set(); // 처리된 행을 추적하는 Set
var animationTimeouts = new Map(); // 실행 중인 애니메이션 타이머를 관리하는 Map


$(document).ready(function() {
	initDOM();
});

function initDOM() {
	resize();
	introAniStart();
	prepareButtonsHover();
	initializeInfiniteScroll();	

	if (window.matchMedia("(orientation: landscape)").matches) {
		mobgaro = true;
		$("body").addClass("garo");
	} else if (window.matchMedia("(orientation: portrait)").matches) {
		mobgaro = false;
		$("body").addClass("sero");
	}
	
    if (isMobileOrTabletOrLand()) {
		$("body").addClass("mobile");
    }
	if (isTablet()) {
		$("body").addClass("tablet");
    }
	if (onlyDesktop()) {
		$("body").addClass("desktop");
    }
	if (checkIsSafari()) {
		isSafari = true;
		$("body").addClass("ios");
	}

	if ((window.innerWidth < 530 && onlyDesktop()) || (!mobgaro && isMobileOrTabletOrLand())){
		dtSm = true;
		$(".dtWrapper").addClass("sm");
	}
}






//== startSetting ==========================================//
//img load bound
function isInViewport(el){
    const rect = el.getBoundingClientRect();
	return (
		rect.right <= rect.width + window.innerWidth + 100 &&
		rect.bottom <= rect.height + window.innerHeight + 100 &&
		rect.left >= rect.width &&
		rect.top >= rect.height
    );
}

//img load
function initLazyImages(images) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				const img = entry.target;				
				const handleImageLoad = () => {
					gsap.to(img, {
						scale: 1,
						ease: "back.out",
						duration: 0.5,
						delay: 0.25,
					});
					observer.unobserve(img);
				};
				
				if (img.complete && img.naturalHeight !== 0) {
					handleImageLoad();
				} else {
					img.addEventListener('load', handleImageLoad);
					img.addEventListener('error', handleImageLoad);
				}
				
				img.src = img.dataset.src;
			}
		});
	});
    images.forEach((img) => {observer.observe(img);});
}

//img load
function registerLazyImages(){
	let lazyImages = document.querySelectorAll("img");
	const imagesInViewport = [];
	const imagesOutsideViewport = [];

	lazyImages.forEach((img) => {
		gsap.set(img, { scale: 0 });
		(isInViewport(img) ? imagesInViewport : imagesOutsideViewport).push(img);
	});

	if (imagesInViewport.length > 0) {
		let loadedCount = 0;
		const totalImages = imagesInViewport.length;
		
		imagesInViewport.forEach((img) => {
			const handleImageLoad = () => {
				loadedCount++;
				
				if (loadedCount === totalImages) {
					gsap.to(imagesInViewport, {
						scale: 1,
						ease: "back.out",
						duration: 0.5,
						stagger: {amount: 1, from: "random",},
						onComplete: () => {
							$(".xp-wrapper").addClass("scaleAni");
							$(".xp-wrapper").css("transform", "translate3d(-50%, -50%, 0) scale(1)");
							setTimeout(function(){
								$(".xp-wrapper").removeClass("scaleAni");
								$(".xp-wrapper").css({width: "100vw", height: "100vh"});
								$(".xp-wrapper .imageList").removeClass("drag-easing");

								if (cendrggo){
									const direction = zoomInfos[zoomLevel].ratioIn;
									xpTargetX += window.innerWidth * direction;
									xpTargetY += window.innerHeight * direction;
									xpWrapperC.style.transform = `translate3d(${xpTargetX}px, ${xpTargetY}px, 0)`;
									cendrggo = false;
								} else {
									xpCenterDrag(false, 1, false);
								}

								setTimeout(() => {
									initEvents();
								}, 100);
							},1500);	
						},
					});
					$(".loading").addClass("hide");
				}
			};
			
			if (img.complete && img.naturalHeight !== 0) {
				handleImageLoad();
			} else {
				img.addEventListener('load', handleImageLoad);
				img.addEventListener('error', handleImageLoad);
			}
			img.src = img.dataset.src;
		});
	} else {
		$(".xp-wrapper").addClass("scaleAni");
		$(".xp-wrapper").css("transform", "translate3d(-50%, -50%, 0) scale(1)");
		setTimeout(function(){
			$(".xp-wrapper").removeClass("scaleAni");
			$(".xp-wrapper").css({width: "100vw", height: "100vh"});
			xpCenterDrag(false, 1, false);
			setTimeout(() => {
				initEvents();					
			}, 100);
		},1500);
	}

	initLazyImages(imagesOutsideViewport);
}


function introAniStart() {
	$(".xp-wrapper").css({
		width: "200vw",
		height: "200vh",
		left: "50%",
		top: "50%",
		transform: "translate3d(-50%, -50%, 0) scale(0.5)",
	});
	xpCenterDrag(false, 2, false);
	lazyImages = document.querySelectorAll("img");
	const imagesInViewport = [];
	const imagesOutsideViewport = [];
	lazyImages.forEach((img) => {
		(isInViewport(img) ? imagesInViewport : imagesOutsideViewport).push(img);
	});
	
	registerLazyImages();
}

//intro ani end after event
function initEvents() {	
	xpWrapperC.classList.add("drag-easing");
	xpSizeSet();
	addEventsXpDrag();
	xpWrapperWheelEvent();

	if (!isMobileOrTabletOrLand()) {		
		addMouseMoveListener();
    }
	addEventsZoom();
	initViews();
}


function initViews() {
	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));
	$(".container").addClass("xp");
	$(".specBtn").addClass("on");
	$(".modeBtn").addClass("on");
	$(".zoomWrapper").addClass("on");
	$(".viewBtnbox").addClass("on");    
    viewButton.on("click", toggleView);
	$(".modeBtn").on("click", changeMode);

	filteredItems.forEach((el) => {
		const collection = el.getAttribute("data-collection"); 
		
		// first element
		if (!orderedCollections[collection]) {
			orderedCollections[collection] = [];
			orderedCollectionsList.push(collection);
			firstLen.push(el);
		}
		orderedCollections[collection].push(el);
    });
	

	for (i = 0 ;i < filteredItems.length ;i++ ){
		$(".imgeGdList").append(
			`<div class='imgeGdWrap'>
				<div class="imgGdInfo"><em></em></div>
			</div>`
		);
	}

	filteredItems.forEach((el, i) => {
		const collection = el.getAttribute("data-collection"); 
		$(".imgeGdWrap").eq(i).find(".imgGdInfo em").html(collection);
		let $item = $(`<div class="item" data-name="${collection}" data-set="${$(el).find("img").attr("data-set")}"></div>`);
		$item.append(`<img src="${$(el).find("img").attr("data-src")}">`);
		$(".imgeGdWrap").eq(i).prepend($item);
	});

	//itemsCard = Array.from(document.querySelectorAll(".imgeGdWrap"));
	//firstList = document.querySelectorAll(".imgeGdWrap .item");
	//setItemSize();
}

function changeMode(){
	clickEffect();
	if ($(".modeBtn").hasClass("dark")){
		$(".modeBtn").removeClass("dark");
		$(".container").removeClass("darkMd");
		for (var i = 0; i < $(".imgeGdWrap").length; i++ ){
			if ($(".imgeGdWrap").eq(i).attr("style")){
				$(".imgeGdWrap").eq(i).css("background-color",'rgba(0,0,0,0.05)');
			}
		}
		bgColorC = false;
	} else {
		$(".modeBtn").addClass("dark");
		$(".container").addClass("darkMd");
		for (var i = 0; i < $(".imgeGdWrap").length ; i++ ){
			if ($(".imgeGdWrap").eq(i).attr("style")){
				$(".imgeGdWrap").eq(i).css("background-color",'rgba(255,255,255,0.1)');
			}
		}
		bgColorC = true;
	}	
}







//== xpWrapper ==========================================//
var drges = false;
function xpCenterDrag(withAnim, zoomStep, zoomin) {
	if (!withAnim){$(xpWrapperC).removeClass("drag-easing drag-easing-slow");} 
	else {$(xpWrapperC).addClass("drag-easing").removeClass("drag-easing-slow");}	
	var centerX, centerY;
	xpResetDragAni();
	xpSizeSet();

	centerX = ((xpWidth * zoomStep) - (xpcWidth * zoomStep)) / 2;
				//- (isMobileOrTabletOrLand() ? window.innerWidth / 2 : 0);
	centerY = ((xpHeight * zoomStep) - (xpcHeight * zoomStep)) / 2;

	if (zoomin){
		if (zoomStep == 3){
			zoomDim = zoomInfos[0].dimensions * 0.01;
			centerX = ((xpWidth * zoomDim) - (xpcWidth * zoomDim)) / 2;
			centerY = ((xpHeight * zoomDim) - (xpcHeight * zoomDim)) / 2;
		}
	} else {
		if (zoomStep == 3){
			centerX = ((xpWidth * zoomDim) - (xpcWidth * zoomDim)) / 2;
			centerY = ((xpHeight * zoomDim) - (xpcHeight * zoomDim)) / 2;
		}
		if (!cendrggo){		
			if (withAnim && ((centerX - xpWidth > xpTargetX) || (centerX + xpWidth < xpTargetX) || (centerY - xpHeight > xpTargetY) || (centerY + xpHeight < xpTargetY))){
				//console.log("in")
				$(xpWrapperC).addClass("drag-easing-slow").removeClass("drag-easing");
				drges = true;
			}
		}
	}
	xpWrapperC.style.transform = `translate3d(${centerX}px, ${centerY}px, 0)`;
	xpTargetX = centerX;
	xpTargetY = centerY;

	if (!withAnim || cendrggo){
		var smimg = false;
		xpcurrentX = xpTargetX;
		xpcurrentY = xpTargetY;		

		if (zoomStep == 1){
			if ((xpWidth >= xpcWidth * zoomDim) && (xpHeight >= xpcHeight * zoomDim)){
				smimg = true
			}
		} else if (zoomStep == 2){
			if ((xpWidth >= xpcWidth * zoomDim - xpWidth) && (xpHeight >= xpcHeight * zoomDim - xpHeight)){
				smimg = true
			}
		} else if (zoomStep == 3){
			if ((xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3))) && (xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)))){
				smimg = true
			}
		}
		
		if (!smimg){xpSmoothDrag();}
	}
}

var drgX = 0;
var drgY = 0;
var drgX,drgY,xpStartDrgA,xpEndDrgA,xpStartDrgB,xpEndDrgB;
function xpAreaDown(event) {
	event.preventDefault();
	$(".searchBar input").blur();
    xpScrolling = false;
    xpDragging = true;
	xpWrapperC.classList.add("drag-easing");
	const clientX = event.touches ? event.touches[0].clientX : event.clientX;
	const clientY = event.touches ? event.touches[0].clientY : event.clientY;

	xpStartDrgA = clientX;
	xpStartDrgB = clientY;
	drgX = clientX;
	drgY = clientY;

	if (zoomStep == 1){
		xpWidth >= xpcWidth * zoomDim ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim ? drgY = 0 : drgY = clientY;

	} else if (zoomStep == 2){
		xpWidth >= xpcWidth * zoomDim - xpWidth ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - xpHeight ? drgY = 0 : drgY = clientY;

	} else if (zoomStep == 3){
		xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)) ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)) ? drgY = 0 : drgY = clientY;
	}
	
	xpOffsetDragX = -drgX + xpTargetX;	
	xpOffsetDragY = -drgY + xpTargetY;
	xpcurrentX = xpTargetX;
	xpcurrentY = xpTargetY;
}
function xpAreaMove(event) {
	event.preventDefault();
	const clientX = event.touches ? event.touches[0].clientX : event.clientX;
	const clientY = event.touches ? event.touches[0].clientY : event.clientY;

	if (zoomStep == 1){
		xpWidth >= xpcWidth * zoomDim ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim ? drgY = 0 : drgY = clientY;

	} else if (zoomStep == 2){
		xpWidth >= xpcWidth * zoomDim - xpWidth ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - xpHeight ? drgY = 0 : drgY = clientY;

	} else if (zoomStep == 3){
		xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)) ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)) ? drgY = 0 : drgY = clientY;
	}

	if (xpDragging) {	
		xpTargetX =  xpOffsetDragX + drgX;
		xpTargetY =  xpOffsetDragY + drgY;
		xpClampTarget(zoomStep);
    }
}
function xpAreaUp(event) {
	xpScrolling = false;
	xpDragging = false;
	const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
	const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

	xpEndDrgA = clientX;
	xpEndDrgB = clientY;

	if (10 > Math.abs(xpEndDrgA - xpStartDrgA) && 10 > Math.abs(xpEndDrgB - xpStartDrgB)){ 
		if(!event.target.classList.contains("imageList")){
			if ($(event.target).attr("src")){
				clickEffect();
				insertViewImage(event);
			}
			//openDtSet(event);	
			//setTimeout(() => openDtViewSetting(), 1);
		}
	}	
}

var xpStTime, dragAni;
function xpResetDragAni(){
	clearTimeout(xpStTime);
	cancelAnimationFrame(dragAni);
}

function xpSmoothDrag(){	
	drgX == 0 ? xpcurrentX = xpTargetX : xpcurrentX += (xpTargetX - xpcurrentX) * easing;
	drgY == 0 ? xpcurrentY = xpTargetY : xpcurrentY += (xpTargetY - xpcurrentY) * easing;
	xpWrapperC.style.transform = `translate3d(${xpcurrentX}px, ${xpcurrentY}px, 0)`;
	
	dragAni = requestAnimationFrame(xpSmoothDrag);
	//console.log(xpcurrentX, xpcurrentY)
}

function xpWrapperWheelEvent() {
    xpWrapperC.addEventListener("wheel", xpWrapperWheel, {
		passive: false,
    });
}
function xpWrapperWheel(e) {
	event.preventDefault();
	if(xpDragging) return;
	xpScrolling = true;
	xpWrapperC.classList.add("drag-easing");
	zoomDim = zoomInfos[zoomLevel].dimensions * 0.01;

	const clientX = event.touches ? event.touches[0].clientX : e.deltaX;
	const clientY = event.touches ? event.touches[0].clientY : e.deltaY;

	if (zoomStep == 1){
		xpWidth >= xpcWidth * zoomDim ? scrollX = 0 : scrollX = clientX;
		xpHeight >= xpcHeight * zoomDim ? scrollY = 0 : scrollY = clientY;

	} else if (zoomStep == 2){
		xpWidth >= xpcWidth * zoomDim - xpWidth ? scrollX = 0 : scrollX = clientX;
		xpHeight >= xpcHeight * zoomDim - xpHeight ? scrollY = 0 : scrollY = clientY;

	} else if (zoomStep == 3){
		xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)) ? scrollX = 0 : scrollX = clientX; 
		xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)) ? scrollY = 0 : scrollY = clientY; 
	}

	xpOffsetScrollX = -scrollX + xpTargetX;
	xpOffsetScrollY = -scrollY + xpTargetY;
	xpTargetX = xpOffsetScrollX;
	xpTargetY = xpOffsetScrollY;
	xpClampTarget(zoomStep);

	xpWrapperC.style.transform = `translate3d(${xpTargetX}px, ${xpTargetY}px, 0)`;
}

function xpClampTarget(zoomStep){
	xpSizeSet();	
	minX = 0;
	minY = 0;	
	maxX = 0;
	maxY = 0;

	if (zoomStep == 1){
		minX = xpWidth - (xpcWidth * zoomDim);
		minY = xpHeight - (xpcHeight * zoomDim);		
		if (xpWidth >= xpcWidth * zoomDim){
			minX = xpTargetX;
			maxX = xpTargetX;
		}
		if (xpHeight >= xpcHeight * zoomDim){
			minY = xpTargetY;
			maxY = xpTargetY;
		}

	} else if (zoomStep == 2){
		minX = xpWidth - (xpcWidth * zoomDim - xpWidth);
		minY = xpHeight - (xpcHeight * zoomDim - xpHeight);
		if (xpWidth >= xpcWidth * zoomDim - xpWidth){
			minX = xpTargetX;
			maxX = xpTargetX;
		}
		if (xpHeight >= xpcHeight * zoomDim - xpHeight){
			minY = xpTargetY;
			maxY = xpTargetY;
		}

	} else if (zoomStep == 3){
		minX = xpWidth - (xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)));
		minY = xpHeight - (xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)));

		if (xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3))){
			minX = xpTargetX;
			maxX = xpTargetX;
		}
		if (xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3))){
			minY = xpTargetY;
			maxY = xpTargetY;
		}
	}
	
	xpTargetX = Math.min(maxX, Math.max(xpTargetX, minX));
	xpTargetY = Math.min(maxY, Math.max(xpTargetY, minY));
}

// dt xpwrapper event setting
function addEventsXpDrag() {    
    xpWrapperC.addEventListener("mousedown", xpAreaDown);
    xpWrapperC.addEventListener("mousemove", xpAreaMove);
    xpWrapperC.addEventListener("mouseup", xpAreaUp);
	xpWrapperC.addEventListener('mouseleave', xpAreaUp);

	xpWrapperC.addEventListener("touchstart", xpAreaDown, { passive: false });
	xpWrapperC.addEventListener("touchmove", xpAreaMove, { passive: false });
	xpWrapperC.addEventListener("touchend", xpAreaUp);
}
function removeEventsXpDrag() {
    xpWrapperC.removeEventListener("mousedown", xpAreaDown);
    xpWrapperC.removeEventListener("mousemove", xpAreaMove);
    xpWrapperC.removeEventListener("mouseup", xpAreaUp);
	xpWrapperC.removeEventListener('mouseleave', xpAreaUp);

	xpWrapperC.removeEventListener("touchstart", xpAreaDown);
	xpWrapperC.removeEventListener("touchmove", xpAreaMove);
	xpWrapperC.removeEventListener("touchend", xpAreaUp);
}
function xpSizeSet(){
	zoomDim = zoomInfos[zoomLevel].dimensions * 0.01;
	xpWidth = xpWrapper.getBoundingClientRect().width;
	xpcWidth = xpWrapperC.getBoundingClientRect().width;
	xpHeight = xpWrapper.getBoundingClientRect().height;
	xpcHeight = xpWrapperC.getBoundingClientRect().height;
}








//== zoom event ==========================================//
function addEventsZoom() {
    zoomInEl = zoomWrapper.find(".zoomin");
    zoomOutEl = zoomWrapper.find(".zoomout");
    zoomInEl.on("click", handleZoomIn);
    zoomOutEl.on("click",handleZoomOut);
    checkZoomLevel();
}
function checkZoomLevel() {
    if (zoomLevel === 2) zoomInEl.addClass("off");
    else zoomInEl.removeClass("off");
    if (zoomLevel === 0) zoomOutEl.addClass("off");
    else zoomOutEl.removeClass("off");
}
function handleZoomIn() {
	clickEffect();
    zoomLevel++;
	xpSizeSet();
	smview = false;

	if (zoomStep == 2 && (xpWidth >= xpcWidth * zoomDim || xpHeight >= xpcHeight * zoomDim)){
		smview = true;
	} else if (zoomStep == 3 && (xpWidth >= xpcWidth * zoomDim - xpWidth || xpHeight >= xpcHeight * zoomDim - xpHeight)){
		smview = true;
	}

	if (smview){
		xpCenterDrag(true, zoomStep, true);
		zoomStep--;
		wrapperScale(tl, true);
		smview = false;
	} else {
		zoomStep--;
		wrapperScale(tl, false);	
	}
	temporaryDisableZoom(false);
}
function handleZoomOut() {
	clickEffect();
    zoomLevel--;	
    xpCenterDrag(true, zoomStep, false);
	zoomStep++;
	wrapperScale(tl, true);
    temporaryDisableZoom(true);
}
function temporaryDisableZoom(out) {
	xpResetDragAni();
	clearTimeout(scrollaniStop);
	zoomInEl.addClass("off");
	zoomOutEl.addClass("off");
	$(xpWrapperC).addClass("off");
	//removeMouseMoveListener();
	//removeEventsXpDrag();
	//xpWrapperC.removeEventListener("wheel", xpWrapperWheel);
	
	var delay;
	if (drges){
		delay = 2700;
		drges = false;
	} else {
		delay = out ? 2300 : 1600;
	}

	setTimeout(() => {
		$(xpWrapperC).removeClass("off");
		checkZoomLevel();
		//addEventsXpDrag();		
		//addMouseMoveListener();
		//xpWrapperC.addEventListener("wheel", xpWrapperWheel);
    }, delay);
}
function wrapperScale(tl, out) {
	var delay;
	if (drges){
		delay = 1000;
		drges = false;
	} else {
		delay = out ? 600 : 0;
	}

	setTimeout(function(){		
		$(".xp-wrapper").addClass("scaleAni");
		$(".xp-wrapper").css("transform", "translate3d(-50%, -50%, 0) scale("+zoomInfos[zoomLevel].scale+")");
		setTimeout(function(){	
			$(xpWrapperC).removeClass("drag-easing drag-easing-slow");
			$(".xp-wrapper").removeClass("scaleAni");
			$(".xp-wrapper").css({
				width: zoomInfos[zoomLevel].dimensions+"vw", 
				height: zoomInfos[zoomLevel].dimensions+"vh"
			});
			
			if (out){
				xpCenterDrag(false, zoomStep, false);
			} else {
				$(xpWrapperC).removeClass("drag-easing drag-easing-slow");
				const direction = out ? zoomInfos[zoomLevel].ratioOut : zoomInfos[zoomLevel].ratioIn;
				xpTargetX += window.innerWidth * direction;
				xpTargetY += window.innerHeight * direction;
				xpWrapperC.style.transform = `translate3d(${xpTargetX}px, ${xpTargetY}px, 0)`;		
				
				xpcurrentX = xpTargetX;
				xpcurrentY = xpTargetY;
				xpSmoothDrag();
			}			
		},1600);
	},delay);
}









//== grid toggle ===========================================//
function toggleView() {
	clickEffect();
	clearTimeout(scrollaniStop);
	xpResetDragAni();
	$(".viewBtnbox").addClass("off");
	$(".xp-wrapper").addClass("off");
	$(".gd-wrapper .imgeGdList").addClass("off");

    if (!isXPView) {
		$(".container").removeClass("grd").addClass("xp");
		timelineToXpView();
		isXPView = true;
    } else {
		$(".container").removeClass("xp").addClass("grd");
		timelineToGridView();
		isXPView = false;
    }
}

function timelineToXpView() {  
	const tl = gsap.timeline();
	tl.add(() => {
		gsap.to(".imgeGdWrap .item", {
			opacity: 0,
			scale: 0.6,
			duration: 0.5,
			ease: "back.out",
			stagger: 0,
			delay: 0,
		});
		gsap.to(".imgeGdWrap", {
			backgroundColor:'transparent',
			opacity: 0,
			duration: 0.5,
			stagger: 0,
			delay: 0,
		});
		gsap.to(".imgGdInfo em", {
			opacity: 0,
			yPercent: 100,
			duration: 0.5,
			stagger: 0,
			delay: 0,
		});
	});
	tl.add(() => {
		$(".xp-wrapper").removeClass("hidden");
		setTimeout(function(){
			$(".gd-wrapper").removeClass("on");			
			flipToXp();
		},100);
	}, "+=0.5");


	/*setTimeout(function(){	
		$(".xp-wrapper").removeClass("hidden");		
			//gsap.set(firstList, { scale: 0.6, opacity: 0,duration:0,delay: 0,stagger: 0, });
			//gsap.set(".imgeGdWrap", { opacity: 0, backgroundColor: 'transparent',duration:0,delay: 0,stagger: 0, });
			//gsap.set(".imgGdInfo em", { opacity: 0, yPercent: 100,duration:0,delay: 0,stagger: 0, });

			ScrollTrigger.refresh(true);

			firstTrigger.forEach(t => t.kill()); // ScrollTrigger.batch는 배열 반환
			firstTrigger = null;

			cardScrollTrigger.forEach(t => t.kill());
			cardScrollTrigger = null;

			cardTitleTrigger.forEach(t => t.kill());
			cardTitleTrigger = null;


		setTimeout(function(){
			//const t1 = gsap.timeline();
			
			/*t1.to(".imgeGdWrap", {
				opacity: 0,
				scale: 0,
				duration: 0.7,
				ease: "back.out"
			});
			//t1.add(() => {
				
			//});

			//$(".gd-wrapper").removeClass("on");
			//flipToXp();

			$(".gd-wrapper").removeClass("on");			
			//$(".imgeGdWrap").attr("style","");
			//$(".imgeGdWrap .item").attr("style","");
			//$(".imgGdInfo em").attr("style","");
			flipToXp();
		},100);
		
		/*setTimeout(function(){			
			$(".gd-wrapper").removeClass("on");
			flipToXp();
		},100);
	},500);*/
}
function flipToXp() {
	$(".xp-wrapper .item").addClass("no-transition");

	const tl = gsap.timeline();
	tl.to(".xp-wrapper .item", {
		scale: 1,
		opacity:1,
		ease: "back.out",
		stagger: {
			amount: 0.5,
			from: "random",
		},		
		onComplete: () => {
			$(".xp-wrapper .item").removeClass("no-transition").removeAttr("style");
		},
	});
	tl.add(() => {
		$(".viewBtnbox").removeClass("off");
		$(".xp-wrapper").removeClass("off");
		$(".zoomWrapper").addClass("on");
		xpSmoothDrag();
		addMouseMoveListener();
		xpWrapperC.addEventListener("wheel", xpWrapperWheel);
	});

	clearAllAnimationTimeouts();
	registerLazyImagesForImageList();
}

function timelineToGridView() {
    removeMouseMoveListener();
	xpWrapperC.removeEventListener("wheel", xpWrapperWheel);
	xpResetDragAni();
	$(".zoomWrapper").removeClass("on");

	const tl = gsap.timeline();
	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));	
	tl.to(filteredItems, {
		scale:0,
		opacity:0,
		stagger: 0.01,
		ease: "cubic.inOut",
	});
	tl.add(() => {
		$(".xp-wrapper").addClass("hidden");		
		setTimeout(function(){			
			$(".gd-wrapper").addClass("on");
		},100);
		flipToGrid();
	});
}

var tweenImg,tweenBg,tweenTxt;
let firstTrigger;
let cardScrollTrigger;
let cardTitleTrigger;
function flipToGrid() {

	// 그리드 뷰로 전환 시 인덱스 리셋
	gridInsertCurrentIndex = 0;

	// 기존 그리드 아이템들 제거
	//$(".imgeGdList").empty();
	
	//gridInsertItems();

	$(".viewBtnbox").addClass("fixed");
	$(".specBtn").addClass("fixed");
	setTimeout(function(){
		$(".viewBtnbox").removeClass("off");
		setTimeout(function(){
			$(".gd-wrapper .imgeGdList").removeClass("off");			
		},500);
	},1500);

	$(".imgeGdList .imgeGdWrap").on("click", function(e){
	   if (!$(this).hasClass("on")) return;
		openDtSet(e);	
		openDtViewSetting();
	});	

	ScrollSmoother.create({
		smooth: 1,
		effects: true,
		smoothTouch: 0.1,
	});

	//gsap.set(firstList, { scale: 0.6, opacity: 0 });
	//gsap.set(".imgeGdWrap", { opacity: 0, backgroundColor: 'transparent' });
	//gsap.set(".imgGdInfo em", { opacity: 0, yPercent: 100 });
	firstTrigger = ScrollTrigger.batch(firstList, {
		//once: true,
		onEnter: (batch) => {		
			gsap.to(batch, {
				scale: 1,
				opacity: 1,
				stagger: 0.1,
				duration: 0.3,
				delay: 0.2,
				ease: "back.out",
			});
		},
    });	
	cardScrollTrigger = ScrollTrigger.batch(".imgeGdWrap", {
		onEnter: (batch) => {
			gsap.to(batch, {
				opacity:1,
				backgroundColor: bgColorC ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
				stagger: 0.1,
				delay: 0.2,
				duration: 0.5,
			});
		},
	});
    cardTitleTrigger = ScrollTrigger.batch(".imgGdInfo em", {
		onEnter: (batch) => {
			gsap.to(batch, {
				opacity: 1,
				yPercent: -100,
				stagger: 0.1,
				delay: 0.2,
				duration: 0.3,
			});
		},
	});

	if (!isMobileOrTabletOrLand()) {
		$(document).on("mouseenter",".imgeGdList .imgeGdWrap", function(){
			$(this).find(".item").addClass("over");	
		});
		$(document).on("mouseleave",".imgeGdList .imgeGdWrap", function(){
			$(this).find(".item").removeClass("over");	
		});
    }
	//gridImgChangeLoad();
}






function calculateBatchSize() {
	const $gdWrapper = $('.gd-wrapper');
	const containerWidth = $gdWrapper.width();
	const containerHeight = $gdWrapper.height();
	const viewportWidth = window.innerWidth;
	
	const responsiveConfig = getResponsiveConfig(containerWidth);
	
	const pixelValues = convertVwToPx(viewportWidth, responsiveConfig);
	
	const batchSize = calculateBatchDimensions(containerWidth, containerHeight, pixelValues);
	
	return batchSize;
}

function getResponsiveConfig(containerWidth) {
	const configs = {
		desktop: { min: 2801, itemSize: 13.886, padding: 1.5, sideMargin: 1.14, bottomMargin: 2.4 },
		large: { min: 2001, max: 2801, itemSize: 16.96, padding: 1.5, sideMargin: 1.22, bottomMargin: 2.4 },
		medium: { min: 1341, max: 2001, itemSize: 21.8, padding: 1.5, sideMargin: 1.22, bottomMargin: 2.4 },
		small: { min: 768, max: 1341, itemSize: 30.4, padding: 1.2, sideMargin: 1.06, bottomMargin: 2.2 },
		mobile: { max: 768, itemSize: 46.2, padding: 1.2, sideMargin: 1.14, bottomMargin: 2.4 }
	};
	
	if (containerWidth > 2801) return configs.desktop;
	if (containerWidth > 2001) return configs.large;
	if (containerWidth > 1341) return configs.medium;
	if (containerWidth > 768) return configs.small;
	return configs.mobile;
}

function convertVwToPx(viewportWidth, config) {
	const vwToPx = (vw) => (vw * viewportWidth) / 100;
	
	return {
		itemWidth: vwToPx(config.itemSize),
		itemHeight: vwToPx(config.itemSize),
		containerPadding: vwToPx(config.padding),
		itemSideMargin: vwToPx(config.sideMargin),
		itemBottomMargin: vwToPx(config.bottomMargin)
	};
}

function calculateBatchDimensions(containerWidth, containerHeight, pixelValues) {
	const { itemWidth, itemHeight, containerPadding, itemSideMargin, itemBottomMargin } = pixelValues;
	
	// 실제 사용 가능한 컨테이너 크기 (패딩 제외)
	const availableWidth = containerWidth - (containerPadding * 2);
	const availableHeight = containerHeight - (containerPadding * 2);
	
	// 아이템 하나당 실제 차지하는 공간 (마진 포함)
	const itemTotalWidth = itemWidth + (itemSideMargin * 2);
	const itemTotalHeight = itemHeight + itemBottomMargin;
	
	// 배치 행/열 계산
	const batchRow = Math.floor(availableWidth / itemTotalWidth);
	const batchCol = Math.ceil(availableHeight / itemTotalHeight);
	
	
	return [batchRow , batchCol];
}

function gridInsertItems(){
	const [colItem, rowItem] = calculateBatchSize();
	const allItems = Array.from( document.querySelectorAll(".imageList .item"));
	
	const totalItems = allItems.length;

	if (gridInsertCurrentIndex >= totalItems) {
		//console.log('All items loaded');
		return;
	}
	
	// 배치 크기 계산
	const batchSize = gridInsertCurrentIndex === 0 ? (colItem * rowItem) : colItem;
	const endIndex = Math.min(gridInsertCurrentIndex + batchSize, totalItems);
	
	// 현재 배치에 추가할 아이템들 선택
	const itemsToAdd = allItems.slice(gridInsertCurrentIndex, endIndex);
	
	/*
	console.log('Grid Insert Debug:', {
		currentIndex: gridInsertCurrentIndex,
		endIndex: endIndex,
		batchSize: batchSize,
		totalItems: totalItems,
		itemsToAdd: itemsToAdd.length
	});
	*/
	
	const fragment = document.createDocumentFragment();
	itemsToAdd.forEach((el, i) => {
		const collection = el.getAttribute("data-collection"); 
		const imgeGdWrap = $(`<div class='imgeGdWrap'><div class="imgGdInfo"><em></em></div></div>`);
		const src = $(el).find("img").attr("data-src");
		const set = $(el).attr("data-set");
		const item = $(`<div class="item" data-name="${collection}" data-set="${set}"></div>`);
		imgeGdWrap.find(".imgGdInfo em").html(collection);
		item.append(`<img class="lazy" data-src="${src}" alt="${collection}">`);
		imgeGdWrap.append(item);
		fragment.appendChild(imgeGdWrap[0]);
	});
	
	$(".imgeGdList").append(fragment);
	
	gridInsertCurrentIndex = endIndex;
	
	if (itemsToAdd.length > 0) {
		setTimeout(() => {
			initGridLazyLoading(colItem, rowItem, totalItems);
		}, 100);
	}
}

// jQuery Lazy 초기화 함수
function initGridLazyLoading(colItem, rowItem, totalItems) {
	$(".imgeGdWrap img.lazy").lazy({
		threshold: 250, // 스크롤 threshold보다 크게 설정하여 미리 로딩
		beforeLoad: function(element) {
			// 이미지 로딩 시작 시 처리
		},
		afterLoad: function(element) {
			// 이미지 로딩 완료 시 처리
			const $wrap = $(element).closest(".imgeGdWrap");
			$(element).removeClass("lazy").addClass("lazy-loaded"); // 로딩 완료 표시
			sequentialOnAnimation(element, colItem, rowItem, totalItems);
		},
		error: function(element) {
			// 이미지 로딩 실패 시 처리
			$(element).closest(".imgeGdWrap").addClass("error");
		}
	});
}

function sequentialOnAnimation(element, colItem, rowItem, totalItems) {
	const $wrap = $(element).closest(".imgeGdWrap");
	const index = $wrap.index();
	const currentRowIndex = Math.floor(index / colItem);
	// 중복 실행 방지
	if (isRowAlreadyProcessed(currentRowIndex, rowItem)) {
		return;
	}
	// 처음 3줄 처리
	if (currentRowIndex <= rowItem-1) {
		handleFirstThreeRows(colItem, totalItems);
	} 
	// 그 외 행 처리
	else {
		handleRegularRow(currentRowIndex, colItem, totalItems);
	}
}
// 헬퍼 함수들
function isRowAlreadyProcessed(rowIndex, rowItem) {
	const key = rowIndex <= rowItem-1 ? 'first3rows' : rowIndex;
	return processedRows.has(key);
}

function handleFirstThreeRows(colItem, totalItems) {
	// 이미 처리되었으면 중복 실행 방지
	if (processedRows.has('first3rows')) {
		return;
	}
	
	// 모든 3줄 이미지가 로드되었는지 확인
	if (!areAllFirstThreeRowsLoaded(colItem, totalItems)) {
		return;
	}
	
	// 애니메이션 시작
	startFirstThreeRowsAnimation(colItem, totalItems);
}

function areAllFirstThreeRowsLoaded(colItem, totalItems) {
	
	// 실제 존재하는 행 수 계산
	const gridTotalItems = $(".imgeGdList .imgeGdWrap").length;
	const actualRows = Math.ceil(gridTotalItems / colItem);
	const rowsToCheck = Math.min(actualRows, 3);

	for (let r = 0; r < rowsToCheck; r++) {
		const rowStart = r * colItem;
		const rowEnd = rowStart + colItem - 1;
		const rowLen = (rowEnd >= totalItems) ? totalItems - rowStart : colItem;
		const rowImages = $(".imgeGdList .imgeGdWrap").slice(rowStart, Math.min(rowEnd + 1, totalItems));
		const loadedInRow = rowImages.filter(function() {
			return $(this).find("img").hasClass("lazy-loaded");
		});
		if (loadedInRow.length !== rowLen) {
			return false;
		}
	}
	return true;
}

function startFirstThreeRowsAnimation(colItem, totalItems) {
	// 처리 시작 표시
	processedRows.add('first3rows');
	
	// 기존 타이머 정리
	clearAnimationTimeouts('first3rows');
	
	// 실제 존재하는 행 수 계산
	const gridTotalItems = $(".imgeGdList .imgeGdWrap").length;
	const actualRows = Math.ceil(gridTotalItems / colItem);
	const rowsToAnimate = Math.min(actualRows, 3);
	// 실제 존재하는 행만 애니메이션 적용
	for (let r = 0; r < rowsToAnimate; r++) {
		const rowStart = r * colItem;
		const rowEnd = rowStart + colItem - 1;
		const rowLen = (rowEnd >= totalItems) ? totalItems - rowStart : colItem;
		
		animateRow(rowStart, rowLen, r, 'first3rows');
	}
}

function handleRegularRow(rowIndex, colItem, totalItems) {
	const rowStartIndex = rowIndex * colItem;
	const rowEndIndex = rowStartIndex + colItem - 1;
	const rowLength = (rowEndIndex >= totalItems) ? totalItems - rowStartIndex : colItem;
	
	// 현재 행의 이미지 로드 상태 확인
	const rowImages = $(".imgeGdList .imgeGdWrap").slice(rowStartIndex, rowEndIndex + 1);
	const loadedImages = rowImages.filter(function() {
		return $(this).find("img").hasClass("lazy-loaded");
	});
	
	// 모든 이미지가 로드되지 않았으면 처리하지 않음
	if (loadedImages.length !== rowLength) {
		return;
	}
	
	// 처리 시작 표시
	processedRows.add(rowIndex);
	
	// 기존 타이머 정리
	clearAnimationTimeouts(rowIndex);
	
	// 현재 행 애니메이션
	animateRow(rowStartIndex, rowLength, 0, rowIndex);
}

function animateRow(startIndex, length, rowOffset, timeoutKey) {
	for (let i = 0; i < length; i++) {
		(function(closure_i, closure_offset) {
			const timeoutId = setTimeout(function() {
				$(".imgeGdList .imgeGdWrap").eq(startIndex + closure_i).addClass("on");
				removeTimeoutFromMap(timeoutKey, timeoutId);
			}, (closure_offset * length * 100) + (closure_i * 100));
			
			addTimeoutToMap(timeoutKey, timeoutId);
		})(i, rowOffset);
	}
}

function addTimeoutToMap(key, timeoutId) {
	if (!animationTimeouts.has(key)) {
		animationTimeouts.set(key, []);
	}
	animationTimeouts.get(key).push(timeoutId);
}

function removeTimeoutFromMap(key, timeoutId) {
	if (animationTimeouts.has(key)) {
		const timeouts = animationTimeouts.get(key);
		const index = timeouts.indexOf(timeoutId);
		if (index > -1) {
			timeouts.splice(index, 1);
		}
		if (timeouts.length === 0) {
			animationTimeouts.delete(key);
		}
	}
}

function clearAnimationTimeouts(key) {
	if (animationTimeouts.has(key)) {
		const timeouts = animationTimeouts.get(key);
		timeouts.forEach(timeoutId => {
			clearTimeout(timeoutId);
		});
		animationTimeouts.delete(key);
	}
}

function clearAllAnimationTimeouts() {
	animationTimeouts.forEach((timeouts, key) => {
		timeouts.forEach(timeoutId => {
			clearTimeout(timeoutId);
		});
	});
	animationTimeouts.clear();
	processedRows.clear();
}

function initializeInfiniteScroll() {
	$(".imgeGdList").on('scroll', function() {		
		const $container = $(this);
		const scrollTop = $container.scrollTop();           
		const windowHeight = $container.height();           
		const documentHeight = $container[0].scrollHeight;

		const threshold = 200; // 스크롤 감지 임계값
		
		const scrollPosition = scrollTop + windowHeight;
		const triggerPosition = documentHeight - threshold;
		
		/*console.log('Scroll Debug:', {
			scrollTop,
			windowHeight,
			documentHeight,
			scrollPosition,
			triggerPosition,
			threshold
		});*/

		if (scrollPosition >= triggerPosition) {
			//console.log('Triggering infinite scroll');
			gridInsertItems();
		}
	});
}

function xpViewOut(text){
	$(".viewBtnbox").addClass("off");
	$(".xp-wrapper").addClass("off");
	$(".zoomWrapper").removeClass("on");
	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));	
	gsap.set(filteredItems, {scale:1,opacity:1,});
	gsap.to(filteredItems, {
		scale:0,
		opacity:0,
		ease: "cubic.inOut",
		onComplete: () => {
			$(".viewBtnbox").removeClass("off");
			performSearch(text);
		},
	});
}







//== dt Pop view ==================================================//


// dt pop img setting
function openDtSet(e) {
	dtTargetItem = e.currentTarget;
	dtTarget = e.target;
	//insertViewImage(dtTarget);

	dtCollections = [];
	for (var i = 0 ; i < $(".dtCarousel .item").length ; i++ ){
		dtCollections.push($(".dtCarousel .item").eq(i));
	}
	dtCollectionsInfo = $(".dtCarousel .item").attr("data-collection");
	$(".focusInfotxt").addClass("on");
	$(".focusInfotxt .en em").html($(".dtCarousel .item").attr("data-leng"));
	$(".focusNumber .now").html(dtCollectSlide + 1);
	$(".focusNumber .all").html(dtCollections.length);

	if (isXPView){
		if (openDtFirst){
			$(dtTarget).addClass("clone");
			const openTL = gsap.timeline();		
			openTL.to(dtTarget, {
				scale:0,
				opacity:0,
				duration: 0.5,
				delay:0.5,
				ease: "expo.inOut",
			});
			openDtFirst = false;
		}
	}

	updateContextualInfosThrottle(dtCollectSlide);
	setTimeout(() => dtViewSizeSet(), 1);	
	setTimeout(() => openDtViews(), 1);	
}

// dt pop size setting
function dtViewSizeSet(){
	focusThumb = document.querySelector(".focusThumb");
	dtThumbHeight = focusThumb.scrollHeight;
    dtCarouselHeight = dtCarousel.getBoundingClientRect().height;
	dtCarouselWidth = dtCarousel.getBoundingClientRect().width;
	
	dtItemHeight = dtWrapper.getBoundingClientRect().height;
	dtItemWidth = dtCarouselWrapper.getBoundingClientRect().width;	

	if (dtSm){
		dtSnapPoints = dtCollections.map((_, i) => -(dtItemWidth * i));	
		$(".dtCarousel .item").removeAttr("style");
		$(".dtCarousel .item").css("width",dtItemWidth);
	} else {
		dtSnapPoints = dtCollections.map((_, i) => -(dtItemHeight * i));
		$(".dtCarousel .item").removeAttr("style");
		$(".dtCarousel .item").css("height",dtItemHeight);
	}
	dtLastPoint = -dtSnapPoints[dtSnapPoints.length - 1];	
}

// dt pop open view_ no repeat
function openDtViewSetting(){
	if (isXPView){	
		xpResetDragAni();
		removeMouseMoveListener();
		$(xpWrapper).addClass("off");
	} else {		
		$(gdWrapper).addClass("off");	
	}

	$(".zoomWrapper").removeClass("on");
	$(".viewBtnbox").removeClass("on");
	$(".specBtn").removeClass("on");
	$(".dtWrapper").addClass("on");	
	
	$(".dtWrapper .contBtnbox").addClass("on");
	$(".contBtnbox .cotbtn.prev,.contBtnbox .cotbtn.next").off().on("click touchstart",dtControllSet);
	$(".contBtnbox .cotbtn.close").off().on("click touchstart",closeDtViews);
	setTimeout(function(){$(".dtCarousel").addClass("in");},500);

	removeEventsDtSlider();
	addEventsDtSlider();
}

// dt pop open view_ repeat
function openDtViews(){
	setTimeout(function(){
		$(".dtThumbWrapper").addClass("on");		
		$(".focusNumber").addClass("on");	
		Array.from(focusThumb.children).forEach((c, i) => {
		  c.setAttribute("data-index", i);
		  c.addEventListener("click", dtThumbClick);
		});
	},100);

	if (orderedCollectionsList[0] == dtCollectionsInfo){
		$(".dtWrapper .contBtnbox .cotbtn.prev").addClass("off");
	} else if (orderedCollectionsList[orderedCollectionsList.length - 1] == dtCollectionsInfo){
		$(".dtWrapper .contBtnbox .cotbtn.next").addClass("off");
	}
	//focusThumb.addEventListener("click", dtThumbClick); //drag 로 넘김
}

// dt pop bottom btn setting
function dtControllSet(e){
	e.preventDefault();
	clickEffect();
	var $this = e.target;
	openDtFirst = false;
	$(".dtThumbWrapper").removeClass("on");
	$(".focusNumber").removeClass("on");		
	$(".focusInfotxt").removeClass("on");
	focusThumb.classList.remove("drag-easing");
	$(".dtCarousel").removeClass("in drag-easing");
	$(".contBtnbox").addClass("off");
	$(".contBtnbox .cotbtn.prev").addClass("off");
	$(".contBtnbox .cotbtn.next").addClass("off");
	hideContextualInfos();	
	resetScrollAni();

	targetY = 0;
	lastScrollY = 0;
	dtScrolling = false;
	dtDragging = false;
	offsetDragY = 0;
	initialDragY = 0;
	dragDirection = 0;
	focusDragY = 0;
	delayY = 300;
	
	setTimeout(function(){			
		dtCollectSlide = 0;
		currentY = 0;

		$(".dtCarousel").html("");
		$(".focusThumb").html("");
		dtCarousel.style.transform = `translate3d(0, 0, 0)`;
		focusThumb.style.transform = `translate3d(0, 0, 0)`;	

		setTimeout(function(){ 
			$(".contBtnbox").removeClass("off");
			$(".contBtnbox .cotbtn.prev").removeClass("off");
			$(".contBtnbox .cotbtn.next").removeClass("off");
		},1000);
	},300);

	var findNextCollecPrev,findNextCollecNext,dtTargetCollec;	
	for (var i = 0; i < orderedCollectionsList.length ; i++ ){
		if (orderedCollectionsList[i] == dtCollectionsInfo){
			findNextCollecPrev = i-1;
			findNextCollecNext = (i+1);
		}
	}
	
	if ($this.classList[1] == 'prev'){
		setTimeout(function(){ $(".contBtnbox .cotbtn.next").removeClass("off");},1300);
		dtTargetCollec = orderedCollectionsList[findNextCollecPrev];
		setTimeout(function(){			
			insertViewImage({target: orderedCollections[dtTargetCollec][0].childNodes[0], currentTarget: orderedCollections[dtTargetCollec][0]});
		},300);

	} else if ($this.classList[1] == 'next'){
		setTimeout(function(){ $(".contBtnbox .cotbtn.prev").removeClass("off");},1300);
		dtTargetCollec = orderedCollectionsList[findNextCollecNext];
		setTimeout(function(){			
			insertViewImage({target: orderedCollections[dtTargetCollec][0].childNodes[0], currentTarget: orderedCollections[dtTargetCollec][0]});
		},300);
	}
}

// dt pop close
var scrollaniStop;
function closeDtViews(e){
	e.preventDefault();
	clickEffect();
	openDtFirst = true;
	$(".dtWrapper").removeClass("on");
	$(".dtThumbWrapper").removeClass("on");
	$(".focusNumber").removeClass("on");	
	$(".focusInfotxt").removeClass("on");
	focusThumb.classList.remove("drag-easing");
	$(".dtCarousel").removeClass("in drag-easing");;
	$(".contBtnbox").removeClass("on off");
	$(".contBtnbox .cotbtn").removeClass("off");
	$(".xp-wrapper .imageList .item .clone").removeAttr("style");

	hideContextualInfos();
	resetScrollAni();
	removeEventsDtSlider();	

	targetY = 0;
	lastScrollY = 0;
	dtScrolling = false;
	dtDragging = false;
	offsetDragY = 0;
	initialDragY = 0;
	dragDirection = 0;
	focusDragY = 0;
	delayY = 300;

	setTimeout(function(){
		dtCollectSlide = 0;
		currentY = 0;
		
		$(".dtCarousel").removeClass("in");		
		$(".dtCarousel").html("");
		$(".focusThumb").html("");
		dtCarousel.style.transform = `translate3d(0, 0, 0)`;
		focusThumb.style.transform = `translate3d(0, 0, 0)`;

		if (isXPView){
			addMouseMoveListener();			
			$(".zoomWrapper").addClass("on");
			scrollaniStop = setTimeout(function(){xpSmoothDrag();},1000);
			gsap.to(".imageList .item .clone", {
				scale: 1,
				opacity: 1,
				ease: "back.out",
				duration: 0.5,
				delay: 0.5,
				onComplete: () => {					
					$(xpWrapper).removeClass("off");
					$(".imageList .item .clone").removeClass("clone");
				},
			});
		} else {
			setTimeout(function(){
				$(gdWrapper).removeClass("off");	
			},300);
		}

		$(".viewBtnbox").addClass("on");
		$(".specBtn").addClass("on");
	},300);
}

// dt pop event setting
function addEventsDtSlider() {
    dtCarouselWheelEvent();
    dtWrapper.addEventListener("mousedown", dragMouseDown);
    dtWrapper.addEventListener("mousemove", dragMouseMove);
    dtWrapper.addEventListener("mouseup", dragMouseUp);
	dtWrapper.addEventListener('mouseleave', dragMouseUp);

	dtWrapper.addEventListener("touchstart", dragTouchStart, { passive: false });
    dtWrapper.addEventListener("touchmove", dragTouchMove, { passive: false });
    dtWrapper.addEventListener("touchend", dragTouchEnd);
}
function removeEventsDtSlider() {
    dtWrapper.removeEventListener("wheel", dtCarouselWheel);
    dtWrapper.removeEventListener("mousedown", dragMouseDown);
    dtWrapper.removeEventListener("mousemove", dragMouseMove);
    dtWrapper.removeEventListener("mouseup", dragMouseUp);
	dtWrapper.removeEventListener('mouseleave', dragMouseUp);

	dtWrapper.removeEventListener("touchstart", dragTouchStart);
    dtWrapper.removeEventListener("touchmove", dragTouchMove);
    dtWrapper.removeEventListener("touchend", dragTouchEnd);
}





//== dt Pop drag/wheel set ==================================================//
// dt pop wheel setting
var delayX = 300;
var delayY = 300;
function dtCarouselWheel(e) {
	e.preventDefault();
	if(dtDragging) {return;}
	e.preventDefault();

	dtScrolling = true;
	dtCarousel.classList.add("drag-easing");
	focusThumb.classList.add("drag-easing");
	resetScrollAni();
	playScrollAni();
	targetX += e.deltaX;
	targetY += e.deltaY;
	clampTarget();

	delayX += e.deltaX;
	delayY += e.deltaY;
	drection = 400;

	if (dtSm) {
		if (Math.abs(delayX) >= drection) {		
			if(e.deltaX > 0 && dtCollectSlide >= 0 && dtCollectSlide < ($(".dtCarousel .item").length - 1)){
				dtCollectSlide++;	
			} else if (e.deltaX < 0 && dtCollectSlide > 0 ){
				dtCollectSlide--;
			}
			delayX = 0;
			delayY = 0;
		}		
	} else {
		if (Math.abs(delayY) >= drection) {		
			if(e.deltaY > 0 && dtCollectSlide >= 0 && dtCollectSlide < ($(".dtCarousel .item").length - 1)){
				dtCollectSlide++;			
			} else if (e.deltaY < 0 && dtCollectSlide > 0 ){
				dtCollectSlide--;
			}
			delayY = 0;
			delayX = 0;
		}
	}
}

function dtCarouselWheelEvent() {
    dtWrapper.addEventListener("wheel", dtCarouselWheel, {
		passive: false,
    });
}

function resetScrollAni(){
	clearTimeout(stTime);
	cancelAnimationFrame(scrollAni);
}
function playScrollAni(){
	smoothScroll();
	stTime = setTimeout(function(){
		resetScrollAni();
	},1500);
}

function smoothScroll(){
	if (dtScrolling){
		currentY = -dtSnapPoints[dtCollectSlide];
	} else if (dtDragging){
		currentY += (targetY - currentY) * easing;		
	}

	if (dtSm){ //가로		
		y = (currentY / dtCarousel.scrollWidth) * focusThumb.scrollWidth; 
		dtCarousel.style.transform = `translate3d(${-currentY}px, 0, 0)`;
		focusThumb.style.transform = `translate3d(${-(y)}px, 0, 0)`;

	} else { //세로
		y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
		dtCarousel.style.transform = `translate3d(0, ${-currentY}px, 0)`;
		focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;
	}
	scrollAni = requestAnimationFrame(smoothScroll);

	$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
	targetY = currentY;
}
function clampTarget(){
	let maxScroll = 0;
	if (dtSm){
		maxScroll = dtCarousel.scrollWidth - dtWrapper.clientWidth;
	} else {
		maxScroll = dtCarousel.scrollHeight - dtWrapper.clientHeight;	
	}
	targetY = Math.max(0, Math.min(targetY, maxScroll));
}

function dtThumbClick(e){
	if (dtDragging) return;
	clickEffect();
	var idx = e.target.parentNode.dataset.index;
	dtCarousel.classList.add("drag-easing");
	focusThumb.classList.add("drag-easing");
	currentY = -dtSnapPoints[idx];
	targetY = currentY;
	dtCollectSlide = Math.floor(idx);

	if (dtSm){
		y = (currentY / dtCarousel.scrollWidth) * focusThumb.scrollWidth; 
		dtCarousel.style.transform = `translate3d(${dtSnapPoints[idx]}px, 0, 0)`;
		focusThumb.style.transform = `translate3d(${-(y)}px, 0, 0)`;

	} else {
		y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
		dtCarousel.style.transform = `translate3d(0, ${dtSnapPoints[idx]}px, 0)`;
		focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;
	}

	$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
}


// dt pop drag setting
var startDrg,endDrg,startX, startY;
var directionLocked = false;
var allowedDirection = null;
function dragMouseDown(event) {
	event.preventDefault();
	startDragging(event.clientX, event.clientY);
}
function dragMouseMove(event) {
	event.preventDefault();
	handleDragging(event.clientX, event.clientY);
}
function dragMouseUp(event) {
	endDragging(event.clientX, event.clientY, event);
}

function dragTouchStart(event) {
	if (event.touches.length > 1) return;
	event.preventDefault();
	const touch = event.touches[0];
	startDragging(touch.clientX, touch.clientY);
}
function dragTouchMove(event) {
	if (event.touches.length > 1) return;
	event.preventDefault();
	const touch = event.touches[0];
	handleDragging(touch.clientX, touch.clientY);
}
function dragTouchEnd(event) {
	endDragging(null, null, event); // clientX는 touchend에서 직접 얻을 수 없으므로 무시
}

function startDragging(x, y) {
    dtScrolling = false;
    dtDragging = true;
	directionLocked = false;
	allowedDirection = null;

	startX = x;
	startY = y;

	dtCarousel.classList.add("drag-easing");
	focusThumb.classList.add("drag-easing");

	if (dtSm) {
		startDrg = x;
		dragDirection = 0;
		initialDragY = x * 2;
		offsetDragY = x * 2 - dtCarousel.offsetLeft + targetY;
	} else {
		startDrg = y;
		dragDirection = 0;
		initialDragY = y * 2;
		offsetDragY = y * 2 - dtCarousel.offsetTop + targetY;
	}
}
function handleDragging(x, y) {
	if (!dtDragging) return;

	const deltaX = Math.abs(x - startX);
	const deltaY = Math.abs(y - startY);
	if (!directionLocked && (deltaX > 5 || deltaY > 5)) {
		if (dtSm && deltaX > deltaY) {
			allowedDirection = "horizontal";
		} else if (!dtSm && deltaY > deltaX) {
			allowedDirection = "vertical";
		} else {
			allowedDirection = "none";
		}
		directionLocked = true;
	}
	if (allowedDirection === "none") return;
	if ((dtSm && allowedDirection !== "horizontal") || (!dtSm && allowedDirection !== "vertical")) return;


	resetScrollAni();
	playScrollAni();

	if (dtSm) {
		focusDragY = x * 2 - offsetDragY;
		targetY = -focusDragY;
		dragDirection = x * 2 - initialDragY;
	} else {
		focusDragY = y * 2 - offsetDragY;
		targetY = -focusDragY;
		dragDirection = y * 2 - initialDragY;
	}
	clampTarget();
}
function endDragging(x, y, event) {
	if (dtSm) {
		endDrg = x !== null ? x : startDrg;
	} else {
		endDrg = y !== null ? y : startDrg;
	}	

	if (10 > Math.abs(endDrg - startDrg)){ dtThumbClick(event); }	
	if (!dtDragging) return;
	if (dragDirection < 0 && dtCollectSlide >= 0 && dtCollectSlide < (dtSnapPoints.length - 1)){
		dtCollectSlide++;
	} else if (dragDirection > 0 && dtCollectSlide > 0){
		dtCollectSlide--;
	}

	currentY = -dtSnapPoints[dtCollectSlide];

	var yVal;
	if (dtSm) {
		yVal = (currentY / dtCarousel.scrollWidth) * focusThumb.scrollWidth;
		dtCarousel.style.transform = `translate3d(${-currentY}px, 0, 0)`;
		focusThumb.style.transform = `translate3d(${-(yVal)}px, 0, 0)`;
	} else {
		yVal = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight;
		dtCarousel.style.transform = `translate3d(0, ${-currentY}px, 0)`;
		focusThumb.style.transform = `translate3d(0, ${-(yVal)}px, 0)`;
	}

	dtScrolling = false;
	dtDragging = false;

	if (dragDirection === 0) return;
    focusDragY = currentY;	
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
        focusInfotxt.innerText = dtCollectionsInfo;
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
			yPercent: 110,
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








//== resize ==================================================================//
var cendrggo = false;
function resize() {
	const debounce = (func, wait) => {
		let timeout;
		return (...args) => {
			clearTimeout(timeout);
			timeout = setTimeout(() => func(args), wait);
		};
	};
	const handleResize = () => {
		//xpSmoothDrag();
		dtCarousel.classList.add("drag-easing");
		focusThumb.classList.add("drag-easing");
		$(".dtThumbWrapper .focusThumb .item").removeClass("no-transition");
		$(".dtThumbWrapper .focusSldIndicator").removeClass("no-transition");	
		//scrollaniStop = setTimeout(function(){xpSmoothDrag();},1000);
	};
	const debouncedResize = debounce(handleResize, 300);

	window.addEventListener("resize", () => {
		cendrggo = true;
		if (window.matchMedia("(orientation: landscape)").matches) {
			mobgaro = true;
			$("body").removeClass("sero").addClass("garo");
		} else if (window.matchMedia("(orientation: portrait)").matches) {
			mobgaro = false;
			$("body").removeClass("garo").addClass("sero");
		}

		if ((window.innerWidth < 530 && onlyDesktop()) || (!mobgaro && isMobileOrTabletOrLand())){
			dtSm = true;
			$(".dtWrapper").addClass("sm");
		} else {
			dtSm = false;		
		}

		xpResetDragAni();
		xpSizeSet();
		xpClampTarget();
		xpCenterDrag(true, zoomStep, false);		

		dtViewSizeSet();
		clampTarget();

		dtCarousel.classList.remove("drag-easing");
		focusThumb.classList.remove("drag-easing");
		$(".dtThumbWrapper .focusThumb .item").addClass("no-transition");
		$(".dtThumbWrapper .focusSldIndicator").addClass("no-transition");

		currentY = -dtSnapPoints[dtCollectSlide];
		if (dtSm){
			y = (currentY / dtCarousel.scrollWidth) * focusThumb.scrollWidth; 
			dtCarousel.style.transform = `translate3d(${dtSnapPoints[dtCollectSlide]}px, 0, 0)`;
			focusThumb.style.transform = `translate3d(${-(y)}px, 0, 0)`;
		} else {
			y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
			dtCarousel.style.transform = `translate3d(0, ${dtSnapPoints[dtCollectSlide]}px, 0)`;			
			focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;
		}
		targetY = currentY;

		debouncedResize();
	});
}



































































//== viewBtnbox mouse event===========================//
function prepareButtonsHover() {	
	createHoverButton(viewButton, true);
}

var leaveOnce = false;
function createHoverButton(button, isViewButton) {
	var button = button[0];
    var innerButton = document.querySelectorAll(".vbtn .inbtn");
    var buttonText = document.querySelectorAll(".vbtn .inbtn .txt");
	var innerIcon = document.querySelectorAll(".vbtn .inico");

	for (let i = 0; i <= 8; i++) {
        const span = document.createElement("span");
        innerIcon[0].append(span);
	}

    var parentSplit = new SplitText(buttonText, {
		type: "lines",
		linesClass: "split-parent",
    });

    let split1, split2;
    parentSplit.lines.forEach((line) => {
		const second = line.cloneNode(true);
		if (isViewButton)
			second.textContent = "grid view";
			second.classList.add("secondLine");
			second.classList.remove("split-parent");
			split1 = new SplitText(line, { type: "chars" });
			split2 = new SplitText(second, { type: "chars" });

			buttonText[0].appendChild(parentSplit.lines[0]);
			buttonText[0].appendChild(second);
	});

	if (isViewButton) {
		if (isMobileOrTabletOrLand()) {
			gridXPButtonTimeline(split1, split2);
			button.addEventListener("click", () => {
				handleViewHover();
				if ($(".viewBtnbox .vbtn").hasClass("toGrid")){
					tlHover.play();
				} else {
					tlHover.reverse();
				}							
			});
		} else {
			gridXPButtonTimeline(split1, split2);
			button.addEventListener("click", () => {
				leaveOnce = true;
			});
			button.addEventListener("mouseenter", () => {
				toggleHover(isXPView)
			});
			button.addEventListener("mouseleave", () => {
				toggleHover(!isXPView);
			});
		}
    } else {
		button.addEventListener("mouseenter", () => {
		});
	}
}
function toggleHover(isHovered) {
    if (!leaveOnce) handleViewHover();
    else leaveOnce = false;
    isHovered ? tlHover.play() : tlHover.reverse();
}
function handleViewHover() {
	viewButton[0].classList.toggle("toGrid");
}
function gridXPButtonTimeline(split1, split2) {
	tlHover = gsap.timeline({ paused: true });
    tlHover.to(split1.chars, {
		duration: 0.5,
		ease: "power3.inOut",
		yPercent: -100,
		stagger: 0.01,
		overwrite: true,
	});
    tlHover.to(split2.chars, {
		duration: 0.5,
        ease: "power3.inOut",
        yPercent: -100,
        stagger: 0.01,
        overwrite: true,
	}, "<");
}

// mouse effect
function updateScales(event) {
	mouseX = event.clientX;
	mouseY = event.clientY;
	filteredItems.forEach((item) => {
		const rect = item.getBoundingClientRect();
		const itemX = rect.left + rect.width / 2;
		const itemY = rect.top + rect.height / 2;
		const distance = Math.sqrt(Math.pow(mouseX - itemX, 2) + Math.pow(mouseY - itemY, 2));
		if (distance < guiVal.threshold) {
			const scaleFactor = 1 + (1 - distance / guiVal.threshold) * guiVal.scaleTarget; // Scale between 1 and 1.5
			$(item).addClass("over");
			/*gsap.to(item, {
				scale: scaleFactor,
				duration: guiVal.durationTarget,
				ease: "power3",
			});*/
		} else {
			$(item).removeClass("over");
			/*gsap.to(item, { scale: 1, duration: 1, ease: "power3" });*/
		}
	});
}













function easeOut(t) {return 1 - Math.pow(1 - t, 3);}
function addMouseMoveListener(){window.addEventListener("mousemove", throttledMouseMove);}
function removeMouseMoveListener(){window.removeEventListener("mousemove", throttledMouseMove);}
function throttledMouseMove(e){throttle(updateScales(e), guiVal.throttleInterval);}
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
function debounce(fn, delay) {
  let timeoutId;
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}





function onlyDesktop() {
  const isMobileOrTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window; 
  return !isMobileOrTablet /*&& window.innerWidth >= 1024*/;
}
function checkIsSafari() {
  return /^((?!chrome|android).)*safari/i.test(navigator.userAgent);
}
function isTablet() {
  return (/iPad|Android(?!.*Mobile)|Tablet/i.test(navigator.userAgent) || ((!mobgaro && window.innerWidth >= 768) && (!mobgaro && window.innerWidth <= 1366) && "ontouchstart" in window));
}
function isMobileOrTabletOrLand() {
  const isTablet = /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || "ontouchstart" in window;
  const isLandscape = window.matchMedia("(orientation: landscape)").matches;  
  return isTablet /*&& !isLandscape*/;
}

function clickEffect(){
	var audio = document.querySelector("#effectAdo");
	audio.src = "./audio/click.mp3";
	audio.play();
}

/*function deviceModel(){
	var mobile = (/Mobi|iPhone|iPad|iPod|Android|Mac/i.test(navigator.userAgent.toLowerCase()));
	var platform = navigator.platform.toLowerCase();
	if (platform.includes('win')) {
		currentOS = "dv_pc";
	} else if (platform.includes('mac') || platform.includes('intel')) {
		currentOS = "dv_pc mac";
	} else {
		if (mobile) {
			var userAgent = navigator.userAgent.toLowerCase();
			if ((userAgent.search("iphone") > -1) || (userAgent.search("ipod") > -1) || (userAgent.search("ipad") > -1) || (userAgent.search("mac") > -1)) {
				currentOS = "dv_mob ios";
				if ((userAgent.search("safari") < 0)){
					currentOS = "dv_mob nateon";
					novideo = true;
				}
			} else { currentOS = "dv_mob"; }
		} else {
			currentOS = "dv_pc";
		}
	}
	$("body").addClass(currentOS);	
}*/
























