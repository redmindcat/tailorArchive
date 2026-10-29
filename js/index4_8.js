
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
      threshold: 200,
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

var firstTrigger;
var cardScrollTrigger;
var cardParentSplit;
var cardTitleTrigger;
var gridInsertCurrentIndex = 0;
var createScrollTrigger;
var smoothContent;
var observer;
var prevBatchCol = 0;

$(document).ready(function() {
	initDOM();
});

function initDOM() {
	
	setTimeout(function(){
		$(".tailor").addClass("on");
		setTimeout(function(){
			resize();
			introAniStart();
			prepareButtonsHover();
			initScrollSmoother();
		},500);
	},100);
	

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

	if ((window.innerWidth < 530 && onlyDesktop()) || (!mobgaro && isMobileOrTabletOrLand()) && $("body").hasClass("mobile")){
		dtSm = true;
		$(".dtWrapper").addClass("sm");
	}
}

function initScrollSmoother(){
	smoothContent = ScrollSmoother.create({
		smooth: 1,
		effects: true,
		smoothTouch: 0.1,
	});
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
	observer = new IntersectionObserver((entries) => {
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
	let lazyImages = document.querySelectorAll(".imageList .item img");
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
		xpCursorAni();
    }
	addEventsZoom();
	initViews();
}


function initViews() {
	$("body").addClass("of-hidden");
	$(".container").addClass("xp z_2");
	$(".specBtn").addClass("on");
	$(".modeBtn").addClass("on");
	$(".zoomWrapper").addClass("on");
	$(".viewBtnbox").addClass("on");    
    viewButton.on("click", toggleView);
	$(".modeBtn").on("click", changeMode);

	//imglistUpdate();

	//itemsCard = Array.from(document.querySelectorAll(".imgeGdWrap"));
	//firstList = document.querySelectorAll(".imgeGdWrap .item");
	//setItemSize();
}

function changeMode(){
	clickEffect();
	gsap.killTweensOf(".imgeGdWrap");
	gsap.set(".imgeGdWrap", {clearProps: "all"});

	if ($(".modeBtn").hasClass("dark")){
		$(".modeBtn").removeClass("dark");
		$(".container").removeClass("darkMd");
		$(".imgeGdWrap.card").each(function(){
			$(this).css("background-color", 'rgba(0,0,0,0.05)');
		});
		bgColorC = false;
	} else {
		$(".modeBtn").addClass("dark");
		$(".container").addClass("darkMd");
		$(".imgeGdWrap.card").each(function(){
			$(this).css("background-color", 'rgba(255,255,255,0.1)');
		});
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
		
		//if (!smimg){xpSmoothDrag();}
	}
}

var drgX = 0;
var drgY = 0;
var drgX,drgY,xpStartDrgA,xpEndDrgA,xpStartDrgB,xpEndDrgB;
var drgSpeed = 1;
function xpAreaDown(event) {
	event.preventDefault();
	$(".searchBar input").blur();
    xpScrolling = false;
    xpDragging = true;
	dragAni == 0 ? xpSmoothDrag() : '';

	xpWrapperC.classList.add("drag-easing");
	xpWrapperC.classList.add("grab");
	const clientX = event.touches ? event.touches[0].clientX : event.clientX;
	const clientY = event.touches ? event.touches[0].clientY : event.clientY;

	xpStartDrgA = clientX;
	xpStartDrgB = clientY;
	//drgX = clientX;
	//drgY = clientY;

	if (zoomStep == 1){
		xpWidth >= xpcWidth * zoomDim ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim ? drgY = 0 : drgY = clientY;
		drgSpeed = 1;

	} else if (zoomStep == 2){
		xpWidth >= xpcWidth * zoomDim - xpWidth ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - xpHeight ? drgY = 0 : drgY = clientY;
		drgSpeed = 1.5;

	} else if (zoomStep == 3){
		xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)) ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)) ? drgY = 0 : drgY = clientY;
		drgSpeed = 2;		
	}

	drgX = drgX * drgSpeed;
	drgY = drgY * drgSpeed;
	
	xpOffsetDragX = -drgX + xpTargetX;	
	xpOffsetDragY = -drgY + xpTargetY;

	xpcurrentX = xpTargetX;
	xpcurrentY = xpTargetY;
	//console.log(drgX)
}
function xpAreaMove(event) {
	event.preventDefault();
	const clientX = event.touches ? event.touches[0].clientX : event.clientX;
	const clientY = event.touches ? event.touches[0].clientY : event.clientY;

	if (zoomStep == 1){
		xpWidth >= xpcWidth * zoomDim ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim ? drgY = 0 : drgY = clientY;
		drgSpeed = 1;

	} else if (zoomStep == 2){
		xpWidth >= xpcWidth * zoomDim - xpWidth ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - xpHeight ? drgY = 0 : drgY = clientY;
		drgSpeed = 1.5;

	} else if (zoomStep == 3){
		xpWidth >= xpcWidth * zoomDim - ((xpWidth * 2) + (xpWidth / 3)) ? drgX = 0 : drgX = clientX;
		xpHeight >= xpcHeight * zoomDim - ((xpHeight * 2) + (xpHeight / 3)) ? drgY = 0 : drgY = clientY;
		drgSpeed = 2;
	}	

	if (xpDragging) {	
		drgX = drgX * drgSpeed;
		drgY = drgY * drgSpeed;

		xpTargetX =  xpOffsetDragX + drgX;
		xpTargetY =  xpOffsetDragY + drgY;
		xpClampTarget(zoomStep);

		//console.log(drgX)
    }
}
function xpAreaUp(event) {
	xpScrolling = false;
	xpDragging = false;
	const clientX = event.changedTouches ? event.changedTouches[0].clientX : event.clientX;
	const clientY = event.changedTouches ? event.changedTouches[0].clientY : event.clientY;

	xpEndDrgA = clientX;
	xpEndDrgB = clientY;

	xpWrapperC.classList.remove("grab");

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

var dragAni = 0;
function xpResetDragAni(){
	cancelAnimationFrame(dragAni);
	dragAni = 0;
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
	//xpWrapperC.classList.remove("drag-easing");
	//xpResetDragAni();
	
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

	dragAni == 0 ? xpSmoothDrag() : '';	
	//xpWrapperC.style.transform = `translate3d(${xpTargetX}px, ${xpTargetY}px, 0)`;
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

	if (zoomStep == 2 && (xpWidth >= xpcWidth * zoomDim && xpHeight >= xpcHeight * zoomDim)){
		smview = true;
	} else if (zoomStep == 3 && (xpWidth >= xpcWidth * zoomDim - xpWidth && xpHeight >= xpcHeight * zoomDim - xpHeight)){
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
	$(".container").removeClass("z_0 z_1 z_2");
	
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
		$(".container").addClass("z_"+zoomLevel);
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
		if (out){
			if ($(".imageList").hasClass("drag-easing")){
				delay = 300;
			} else {delay = 0;}			
		} else {delay = 0;}
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
				xpSizeSet();
				$(xpWrapperC).removeClass("drag-easing drag-easing-slow");
				const direction = out ? zoomInfos[zoomLevel].ratioOut : zoomInfos[zoomLevel].ratioIn;
				xpTargetX += window.innerWidth * direction;
				xpTargetY += window.innerHeight * direction;
				xpWrapperC.style.transform = `translate3d(${xpTargetX}px, ${xpTargetY}px, 0)`;		
				
				xpcurrentX = xpTargetX;
				xpcurrentY = xpTargetY;
				//xpSmoothDrag();
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
	if($(".specBtn").hasClass("filterActive")){
		$('.specBtn').removeClass('filterActive');
		$(".filterList").removeClass('open');
		setTimeout(() => {
			activeFilterLoad();
		}, 300);
	}
}

function timelineToXpView() {  
	const tl = gsap.timeline();
	tl.add(() => {
		gridHideAnimation();
	});
	tl.add(() => {
		$("body").addClass("of-hidden");
		$(".xp-wrapper").removeClass("hidden");
		setTimeout(function(){
			$(".gd-wrapper").removeClass("on");			
			flipToXp();
		},100);
	}, "+=0.5");
}

function gridHideAnimation(){
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
}

function flipToXp() {
	//$(".xp-wrapper .item").addClass("no-transition");
	flipToXpAnimation();
	$(".viewBtnbox").removeClass("off");
	//$(".xp-wrapper").removeClass("off");
	//$(".zoomWrapper").addClass("on");
	//xpSmoothDrag();
	addMouseMoveListener();
	xpWrapperC.addEventListener("wheel", xpWrapperWheel);
	resetGridAnimation();	
	$(".imgeGdWrap").removeClass("itm tit card");
}

function flipToXpAnimation(){
	xpCenterDrag(false, zoomStep, true);
	let lazyImages = document.querySelectorAll(".imageList .item img");
	const imagesInViewport = [];
	const imagesOutsideViewport = [];

	lazyImages.forEach((img) => {
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
							$(cursorItem).removeClass("off");
							//setTimeout(function(){$(cursorItem).addClass("on")},300);
							$(".xp-wrapper").removeClass("off");
							$(".zoomWrapper").addClass("on");
						},
					});						
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
	}
	// imagesOutsideViewport.forEach((img => observer.unobserve(img)));
	initLazyImages(imagesOutsideViewport);
}

function timelineToGridView() {
    removeMouseMoveListener();
	xpWrapperC.removeEventListener("wheel", xpWrapperWheel);
	xpResetDragAni();
	$(".zoomWrapper").removeClass("on");
	$(cursorItem).removeClass("on");
	setTimeout(function(){$(cursorItem).addClass("off")},300);

	const tl = gsap.timeline();
	filteredItems = Array.from( document.querySelectorAll(".imageList .item img"));	
	tl.to(filteredItems, {
		scale:0,
		// opacity:0,
		stagger: 0.01,
		ease: "cubic.inOut",
	});
	tl.add(() => {
		$(".xp-wrapper").addClass("hidden");		
		setTimeout(function(){
			$("body").removeClass("of-hidden");
			$(".gd-wrapper").addClass("on");
		},100);
		flipToGrid();
	});
}

var tweenImg,tweenBg,tweenTxt;
function flipToGrid() {

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

	//배치할 아이템 갯수 
	const [col, row] = calculateBatchSize();
	//그리그 아이템 삽입
	if($(".imgeGdWrap").length == 0){
        insertGridItems(col * row);
    }else{
        initScrollTrigger();
        
        // const [col, row] = calculateBatchSize();
		// const viewImageSize = col * row;
		// const viewImages = Array.from(document.querySelectorAll(".imgeGdWrap")).slice(0, viewImageSize);
		
		// const itemsPerRow = col;
		// const totalRows = Math.ceil(viewImageSize / itemsPerRow);
		
		// Array.from({length: totalRows}, (_, rowIndex) => {
		// 	const startIndex = rowIndex * itemsPerRow;
		// 	const endIndex = Math.min(startIndex + itemsPerRow, viewImageSize);
		// 	const rowImages = viewImages.slice(startIndex, endIndex);
			
		// 	setTimeout(() => {
		// 		rowImages.forEach((img, index) => {
		// 			const item = img.querySelector('.item');
		// 			const info = img.querySelector('.imgGdInfo em');
					
		// 			img.classList.add("itm", "tit", "card");
		// 			setTimeout(() => {
		// 				gsap.to(img, {
		// 					backgroundColor: bgColorC ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
		// 					duration: 0.5,
		// 				});
		// 				gsap.to(item, {
		// 					scale: 1,
		// 					opacity: 1,
		// 					duration: 0.3,
		// 					ease: "back.out",
		// 				});
		// 				gsap.to(info, {
		// 					opacity: 1,
		// 					yPercent: -100,
		// 					duration: 0.3,
		// 				});
		// 			}, index * 100);
		// 		});
		// 	}, rowIndex * 200);
		// });
    }

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


function initScrollTrigger(){
	let col = calculateBatchSize()[0];
	triggersKill();
	firstTrigger = firstTriggerCreate(col);
	cardScrollTrigger = cardTriggerCreate(col);
	createScrollTrigger = scrollTriggerCreate();
}

function insertGridItems(itemsNum){
	const allItems = Array.from( document.querySelectorAll(".imageList .item"));
	const totalItems = allItems.length;
	if (gridInsertCurrentIndex >= totalItems) {
		console.log('All items loaded');
		return;
	}
	const endIndex = gridInsertCurrentIndex + itemsNum;
	const itemsToAdd = allItems.slice(gridInsertCurrentIndex, endIndex);

	const allGridItems = Array.from( document.querySelectorAll(".imgeGdList .imgeGdWrap"));
	if(allGridItems.length <= endIndex){
		insertItems(endIndex, itemsToAdd);
	}else{
		initScrollTrigger();
	}	
}

function insertItems(endIndex, itemsToAdd){
	const fragment = document.createDocumentFragment();
	itemsToAdd.forEach((el, i) => {
		const collection = el.getAttribute("data-collection"); 
		const imgeGdWrap = $(`<div class='imgeGdWrap'><div class="imgGdInfo"><em></em></div></div>`);
		const src = $(el).find("img").attr("data-src");
		const set = $(el).attr("data-set");
		const item = $(`<div class="item" data-name="${collection}" data-set="${set}"></div>`);
		imgeGdWrap.find(".imgGdInfo em").html(collection);
		item.append(`<img class="lazy" src="${src}" alt="${collection}">`);
		imgeGdWrap.append(item);
		fragment.appendChild(imgeGdWrap[0]);
		item.on("click", function(){
			insertViewImage({target: this.querySelector("img")});
		});
	});	
	gridInsertCurrentIndex = endIndex;
	
	$(".imgeGdList").append(fragment);
	initScrollTrigger();	
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
	// 부동소수점 오차를 고려하여 반올림 처리
	const rowRatio = availableWidth / itemTotalWidth;
	const batchRow = Math.abs(rowRatio - Math.round(rowRatio)) < 0.01 ? Math.round(rowRatio) : Math.floor(rowRatio);
	const batchCol = Math.ceil(availableHeight / itemTotalHeight);
	
	return [batchRow, batchCol];
}

function resetGridAnimation() {
    // 모든 ScrollTrigger 정리
    ScrollTrigger.getAll().forEach(trigger => trigger.kill());
    
    // 애니메이션 상태 초기화
    gsap.set([".imgeGdWrap .item", ".imgeGdWrap", ".imgGdInfo em"], {
        clearProps: "all" // 모든 GSAP 속성 제거
    });
    
	smoothContent.scrollTop(0, { immediate: true });

    // 변수 초기화
    firstTrigger = null;
    cardScrollTrigger = null;
}

function xpViewOut(mode, text, listAllSearch = false){
	$(".viewBtnbox").addClass("off");
	$(".xp-wrapper").addClass("off");
	$(".zoomWrapper").removeClass("on");
	$(".filterList").addClass("lock");
	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));	
	if(filteredItems.length > 0){
		gsap.set(filteredItems, {scale:1,opacity:1,});
		gsap.to(filteredItems, {
			scale:0,
			opacity:0,
			ease: "cubic.inOut",
			onComplete: () => {
				$(".viewBtnbox").removeClass("off");
				if(mode == "search"){
					performSearch(text, listAllSearch);
				}else if(mode == "filter"){
					applyCategoryFilter();
				}
				$(".xp-wrapper").removeClass("off");
			},
		});
	}else {
		$(".viewBtnbox").removeClass("off");
		if(mode == "search"){
			performSearch(text, listAllSearch);
		}else if(mode == "filter"){
			applyCategoryFilter();
		}
		$(".xp-wrapper").removeClass("off");
	}
}





//== dt Pop view ==================================================//
function imglistUpdate(){
	orderedCollections = {};
	orderedCollectionsList = [];

	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));
	filteredItems.forEach((el) => {
		const collection = el.getAttribute("data-collection"); 
		
		// first element
		if (!orderedCollections[collection]) {
			orderedCollections[collection] = [];
			orderedCollectionsList.push(collection);
		}
		orderedCollections[collection].push(el);
    });

	//console.log(orderedCollectionsList)
}

// dt pop img setting
function openDtSet(e) {
	dtTargetItem = e.currentTarget;
	dtTarget = e.target;

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
		xpWrapperC.removeEventListener("wheel", xpWrapperWheel);
		$(xpWrapper).addClass("off");
		$(cursorItem).removeClass("on").addClass("off");
	} else {		
		$(gdWrapper).addClass("off");	
	}
	if($(".specBtn").hasClass("filterActive")){
		$('.specBtn').removeClass('filterActive');
		$(".filterList").removeClass('open');
		setTimeout(() => {
			activeFilterLoad();
		}, 300);
	}

	$(".zoomWrapper").removeClass("on");
	$(".viewBtnbox").removeClass("on");
	$(".specBtn").removeClass("on");
	$(".dtWrapper").addClass("on");	
	
	$(".dtWrapper .contBtnbox").addClass("on");
	$(".contBtnbox .cotbtn.prev,.contBtnbox .cotbtn.next").off().on("click touchstart",dtControllSet);
	$(".contBtnbox .cotbtn.close").off().on("click touchstart",closeDtViews);
	setTimeout(function(){$(".dtCarousel").addClass("in");},300);

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
	
	if (orderedCollectionsList.length < 2){
		$(".dtWrapper .contBtnbox .cotbtn:not(.close)").addClass("off");
	} else {
		//console.log(dtCollectionsInfo)
		if (orderedCollectionsList[0] == dtCollectionsInfo){
			$(".dtWrapper .contBtnbox .cotbtn.prev").addClass("off");
		} else if (orderedCollectionsList[orderedCollectionsList.length - 1] == dtCollectionsInfo){
			$(".dtWrapper .contBtnbox .cotbtn.next").addClass("off");
		}
	}
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
	$(".contBtnbox .cotbtn").addClass("off");
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
			$(".contBtnbox .cotbtn.close").removeClass("off");
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
		if (findNextCollecPrev == 0){
			setTimeout(function(){$(".contBtnbox .cotbtn.next").removeClass("off");},1300);
		} else {setTimeout(function(){$(".contBtnbox .cotbtn").removeClass("off");},1300);}

		dtTargetCollec = orderedCollectionsList[findNextCollecPrev];
		setTimeout(function(){			
			insertViewImage({target: orderedCollections[dtTargetCollec][0].childNodes[0], currentTarget: orderedCollections[dtTargetCollec][0]});
		},300);

	} else if ($this.classList[1] == 'next'){
		if (findNextCollecNext == (orderedCollectionsList.length - 1)){
			setTimeout(function(){$(".contBtnbox .cotbtn.prev").removeClass("off");},1300);
		} else {setTimeout(function(){$(".contBtnbox .cotbtn").removeClass("off");},1300);}

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
			//scrollaniStop = setTimeout(function(){xpSmoothDrag();},800);
			gsap.to(".imageList .item .clone", {
				scale: 1,
				opacity: 1,
				ease: "back.out",
				duration: 0.5,
				//delay: 0.3,
				onComplete: () => {					
					$(xpWrapper).removeClass("off");
					$(cursorItem).removeClass("off");
					$(".imageList .item .clone").removeClass("clone");					
					setTimeout(function(){
						xpWrapperC.addEventListener("wheel", xpWrapperWheel);
					},300);
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
}, 300);

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

		if ((window.innerWidth < 530 && onlyDesktop()) || (!mobgaro && isMobileOrTabletOrLand() && $("body").hasClass("mobile"))){
			dtSm = true;
			$(".dtWrapper").addClass("sm");
		} else {
			dtSm = false;
			$(".dtWrapper").removeClass("sm");
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
		// 리사이즈 함수들 최적화 및 확인 필요
		let batchCol = calculateBatchSize()[0];
		if($(".gd-wrapper").hasClass("on") && prevBatchCol !== batchCol && prevBatchCol){
			rowImageCheck(batchCol);
		}
		prevBatchCol = batchCol;
	});
}

function rowImageCheck(col){
	const gdItemsLength = document.querySelectorAll(".imgeGdList .imgeGdWrap").length;
	const lastRowItemsCount = gdItemsLength % col;
	const insertLastRowItems = col - lastRowItemsCount;
	if(insertLastRowItems > 0){
		addItems(insertLastRowItems, col);
	}
}

function addItems(num, col){
	const allItems = Array.from( document.querySelectorAll(".imageList .item"));
	const endIndex = gridInsertCurrentIndex + num;
	const itemsToAdd = allItems.slice(gridInsertCurrentIndex, endIndex);
	const fragment = document.createDocumentFragment();
	itemsToAdd.forEach(el => {
		const collection = el.getAttribute("data-collection"); 
		const imgeGdWrap = $(`<div class='imgeGdWrap insResize'><div class="imgGdInfo"><em></em></div></div>`);
		const src = $(el).find("img").attr("data-src");
		const set = $(el).attr("data-set");
		const item = $(`<div class="item" data-name="${collection}" data-set="${set}"></div>`);
		imgeGdWrap.find(".imgGdInfo em").html(collection);
		item.append(`<img class="lazy" src="${src}" alt="${collection}">`);
		imgeGdWrap.append(item);
		fragment.appendChild(imgeGdWrap[0]);
		item.on("click", function(){
			insertViewImage({target: this.querySelector("img")});
		});
	});
	$(".imgeGdList").append(fragment);

	setTimeout(() => {
		triggersKill();
		firstTrigger = firstTriggerCreate(col);
		cardScrollTrigger = cardTriggerCreate(col);
		createScrollTrigger = scrollTriggerCreate();
	});

	gridInsertCurrentIndex = endIndex;
}

function triggersKill(){
	if(firstTrigger){
		if(Array.isArray(firstTrigger)){
			firstTrigger.forEach(trigger => trigger.kill());
		} else {
			firstTrigger.kill();
		}
		firstTrigger = null;
	}

	if(cardScrollTrigger){
		if(Array.isArray(cardScrollTrigger)){
			cardScrollTrigger.forEach(trigger => trigger.kill());
		} else {
			cardScrollTrigger.kill();
		}
		cardScrollTrigger = null;
	}
	
	if(createScrollTrigger){	
		if(Array.isArray(createScrollTrigger)){
			createScrollTrigger.forEach(trigger => trigger.kill());
		} else {
			createScrollTrigger.kill();
		}
		createScrollTrigger = null;
	}
}

function firstTriggerCreate(col){
	return ScrollTrigger.batch(".imgeGdWrap .item", {
		start: "top 90%",
		onEnter: (element) => {
			const imgeGdWraps = element.map(item => item.closest('.imgeGdWrap'));
			const uniqueWraps = [...new Set(imgeGdWraps)];
			
			const inactiveWraps = uniqueWraps.filter(wrap => !wrap.classList.contains('itm'));
			if (inactiveWraps.length === 0) return;
			
			const itemsPerRow = col;
			const totalRows = Math.ceil(inactiveWraps.length / itemsPerRow);
			
			Array.from({length: totalRows}, (_, rowIndex) => {
				const startIndex = rowIndex * itemsPerRow;
				const endIndex = Math.min(startIndex + itemsPerRow, inactiveWraps.length);
				const rowWraps = inactiveWraps.slice(startIndex, endIndex);
				
				setTimeout(() => {
					rowWraps.forEach((wrap, index) => {
						const item = wrap.querySelector('.item');
						const info = wrap.querySelector('.imgGdInfo em');
						
						wrap.classList.add('itm', 'tit');
						
						setTimeout(() => {
							gsap.to(item, {
								scale: 1,
								opacity: 1,
								duration: 0.3,
								ease: "back.out",
							});
							gsap.to(info, {
								opacity: 1,
								yPercent: -100,
								duration: 0.3,
							});
						}, index * 100);
					});
				}, rowIndex * 200);
			});
		},
		once: true,
		markers: false,
	});
}

function cardTriggerCreate(col){
	return ScrollTrigger.batch(".imgeGdWrap", {
		start: "top 90%",
		onEnter: (element) => {
			const uniqueWraps = [...new Set(element)];
			
			const inactiveWraps = uniqueWraps.filter(wrap => !wrap.classList.contains('card'));
			if (inactiveWraps.length === 0) return;
			
			const itemsPerRow = col;
			const totalRows = Math.ceil(inactiveWraps.length / itemsPerRow);
			
			Array.from({length: totalRows}, (_, rowIndex) => {
				const startIndex = rowIndex * itemsPerRow;
				const endIndex = Math.min(startIndex + itemsPerRow, inactiveWraps.length);
				const rowWraps = inactiveWraps.slice(startIndex, endIndex);
				
				setTimeout(() => {
					rowWraps.forEach((wrap, index) => {
						wrap.classList.add('card');
						
						setTimeout(() => {
							gsap.to(wrap, {
								backgroundColor: bgColorC ? 'rgba(255,255,255,0.1)' : 'rgba(0,0,0,0.05)',
								duration: 0.5,
							});
						}, index * 100);
					});
				}, rowIndex * 200);
			});
		},
		once: true,
		markers: false,
	});
}

function scrollTriggerCreate(){
	return ScrollTrigger.create({
		trigger: ".imgeGdWrap:last-child",
		start: "top 95%",
		onEnter: () => {
			const [col, row] = calculateBatchSize();
			insertGridItems(col);
		},
		once: true,
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
	setTimeout(function(){
		$(".split-parent").attr("style","");
		$(".secondLine").attr("style","");
	},500);

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

	filteredItems = Array.from( document.querySelectorAll(".imageList .item"));	
	filteredItems.forEach((item) => {
		const rect = item.getBoundingClientRect();
		const itemX = rect.left + rect.width / 2;
		const itemY = rect.top + rect.height / 2;
		const distance = Math.sqrt(Math.pow(mouseX - itemX, 2) + Math.pow(mouseY - itemY, 2));
		if (distance < guiVal.threshold) {
			$(item).addClass("over");
		} else {
			$(item).removeClass("over");
		}
	});
}

// mouse text
var cursorItem = document.querySelector(".cursor");
var cursorParagraph = cursorItem.querySelector("span");
var targets = document.querySelectorAll("[data-collection]");
function xpCursorAni() {  
	var currentTarget = null;
    var lastText = '';
    var isAnimating = false;
    var cursorX = 0;
    var cursorY = 0;
	var itemX1 = 0;
	var itemX2 = 0;
	var itemY1 = 0;
	var itemY2 = 0;
	var once = true;
    var xTo = gsap.quickTo(cursorItem, "x", { ease: "power3" });
    var yTo = gsap.quickTo(cursorItem, "y", { ease: "power3" });

	function updateCursor() {
        xTo(cursorX);
        yTo(cursorY);

        if (currentTarget) {
            let newText = currentTarget.getAttribute("data-collection");
            if (newText !== lastText) {
                cursorParagraph.textContent = newText;
                lastText = newText;
            }
        }
        isAnimating = false;
    }
	
	window.addEventListener("mousemove", e => {
		if ($(cursorItem).hasClass("off")){return;}
		if (!currentTarget && !once) return;
        cursorX = e.clientX;
        cursorY = e.clientY;

		if (once){
			targets.forEach(target => {
				currentTarget = target;
				let rect = currentTarget.getBoundingClientRect();	
				if (cursorX >= rect.left && cursorX < rect.left + rect.width && cursorY >= rect.top && cursorY < rect.top + rect.height){
					setTimeout(() => {cursorItem.classList.add("on");}, 300);
				}
			});				
			once = false;
		}		

		if (cursorX >= itemX1 && cursorX < itemX2 && cursorY >= itemY1 && cursorY < itemY2){
			cursorItem.classList.add("on");
		}
        if (!isAnimating) {
            isAnimating = true;
            requestAnimationFrame(updateCursor);
        }
    });

	targets.forEach(target => {
        target.addEventListener("mouseenter", () => {
            currentTarget = target;
            let newText = target.getAttribute("data-collection");
            if (newText !== lastText) {
                cursorParagraph.textContent = newText;
                lastText = newText;
            }

			let rect = currentTarget.getBoundingClientRect();	
			itemX1 = rect.left + rect.width / 5;
			itemX2 = rect.left + rect.width - rect.width / 5;
			itemY1 = rect.top + rect.height / 5;
			itemY2 = rect.top + rect.height - rect.height / 5;
        });

        target.addEventListener("mouseleave", () => {
            currentTarget = null;
            cursorItem.classList.remove("on");
            lastText = '';
        });
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
























