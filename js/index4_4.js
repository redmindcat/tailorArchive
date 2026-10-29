

	

$(document).ready(function() {
	initDOM();

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
var xpWrapper = $(".xp-wrapper");
var xpWrapperC = $(".xp-wrapper .imageList");
var zoomWrapper = $(".zoomWrapper");
var gdWrapper = $(".gd-wrapper");

var filteredItems = Array.from( document.querySelectorAll(".imageList .item"));
var itemsCard = Array.from(document.querySelectorAll(".imgeGdWrap"));
var first = [];
var other = [];
var allItems = [];
var removedItems = [];

var collectionGrid = document.querySelector(".imgeGdList");
var collectionItem;

var dtWrapper = document.querySelector(".dtWrapper");
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



function initDOM() {
	setupDraggable();
	disableDrag();
	resize();
	introAniStart();
	prepareButtonsHover();

    if (checkIsSafari()) {isSafari = true;}
    if (isMobileOrTabletOrLand()) {
      document.documentElement.classList.add("tablet");
    }
	if (onlyDesktop()) {
      document.documentElement.classList.add("desktop");
    }
}

//== xpWrapper ==========================================//
//draggable set
function setupDraggable() {
    drag = Draggable.create(".imageList", {
		type: "x,y",
		allowEventDefault: true,
		inertia: true,
		throwResistance: isMobileOrTabletOrLand() ? 1000 : 8000,
		bounds: {
			minX:xpWrapper.innerWidth() - xpWrapperC.innerWidth() + 50,
			maxX: -window.innerWidth / 10,
			minY: xpWrapper.innerHeight() - xpWrapperC.innerHeight() +
			  -window.innerWidth / 10,
			maxY: isMobileOrTabletOrLand() ? 0 : -window.innerWidth / 10,
		},
		edgeResistance: 0.9,
		onDrag: () => { setScrollViewBasedOnDrag(); },
		onThrowUpdate: () => { setScrollViewBasedOnDrag(); },
	})[0];

    scrollDelta = { x: 0, y: 0 };
    setX = gsap.quickSetter(drag.target, "x", "px");
    setY = gsap.quickSetter(drag.target, "y", "px");
    bounds = drag.vars.bounds;
}

//drag reset
function resetDraggable() {
    const boundX = xpWrapper.innerWidth() -  xpWrapperC.innerWidth() + 50;
    const boundY = xpWrapper.innerHeight() - xpWrapperC.innerHeight() - window.innerWidth / 10;

    drag?.applyBounds({
      minX: boundX,
      maxX: -window.innerWidth / 10,
      minY: boundY,
      maxY: isMobileOrTabletOrLand() ? 0 : -window.innerWidth / 10,
    });

    setTimeout(() => {
		xpWrapperC.addClass("drag-easing");
		bounds = drag.vars.bounds;
    }, 550);
}
//drag restart
function enableDrag() {
    //console.log("enable");
    drag.enable();
    if (isMobileOrTabletOrLand())
		xpWrapperC.removeClass("off");
}
//drag stop
function disableDrag() {
    //console.log("disable");
    drag.disable();
    if (isMobileOrTabletOrLand())
      xpWrapperC.removeClass("off");
}
//drag position
function setScrollViewBasedOnDrag() {
    newX = drag.x;
    newY = drag.y;
}

//drag position == wheel position
function handleWheelXpView(e) {
    e.preventDefault();
    scrollDelta.x += e.originalEvent.deltaX;
    scrollDelta.y += e.originalEvent.deltaY;

    requestAnimationFrame(updatePosition);
}

function updatePosition(){
    let newX = drag.x - scrollDelta.x;
    let newY = drag.y - scrollDelta.y;

    newX = Math.min(bounds.maxX, Math.max(newX, bounds.minX));
    newY = Math.min(bounds.maxY, Math.max(newY, bounds.minY));

    newX = lerpWithEase(newX, newX, 0.8, easeQuadOut);
    newY = lerpWithEase(newY, newY, 0.8, easeQuadOut);

    setX(newX);
    setY(newY);

    drag.update();

    scrollDelta.x = 0;
    scrollDelta.y = 0;
}

function centerDrag(withAnim) {
	xpWrapperC.removeClass("drag-easing");
    gsap.to(".imageList", {
		duration: withAnim ? 1 : 0,
		x: (xpWrapper.innerWidth() - xpWrapperC.innerWidth()) / 2 -
			(isMobileOrTabletOrLand() ? window.innerWidth / 2 : 0),
		y: (xpWrapper.innerHeight() - xpWrapperC.innerHeight()) / 2 - 50, // Aucun décalage vertical
		ease: "expo.inOut",
		onComplete: () => {
			setTimeout(() => {xpWrapperC.removeClass("drag-easing");}, 100);
		},
	});
}

function isInViewport(el){
    const rect = el.getBoundingClientRect();
    return (
		rect.right <= drag.x + window.innerWidth + 100 &&
		rect.bottom <= drag.y + window.innerHeight + 100 &&
		rect.left >= drag.x &&
		rect.top >= drag.y
    );
}




//img load
function initLazyImages(images) {
	const observer = new IntersectionObserver((entries) => {
		entries.forEach((entry) => {
			if (entry.isIntersecting) {
				gsap.to(entry.target, {
					scale: 1,
					ease: "back.out",
					duration: 0.5,
					delay: 0.25,
				});
				observer.unobserve(entry.target);
			}
		});
	});
    images.forEach((img) => {observer.observe(img);});
}

function introAniStart() {
    const tl = gsap.timeline({});
    lazyImages = document.querySelectorAll("img");

    tl.to(xpWrapper, {scale: 0.5, width: "calc(200vw + 2px)", height: "calc(200vh + 2px)",
      left: "50%",top: "50%",x: "-50%",y: "-50%",duration: 0,
    });

    const centerX = (xpWrapper.innerWidth() - xpWrapperC.innerWidth()) / 2 
		- (isMobileOrTabletOrLand() ? window.innerWidth / 2 : 0);
    const centerY = (xpWrapper.innerHeight() - xpWrapperC.innerHeight()) / 2 - 50;

    tl.to(".imageList", {x: centerX, y: centerY, duration: 0, ease: "none",});

    const imagesInViewport = [];
    const imagesOutsideViewport = [];

    lazyImages.forEach((img) => {
		(isInViewport(img) ? imagesInViewport : imagesOutsideViewport).push(img);
    });

	//console.log(imagesInViewport);
    gsap.to(imagesInViewport, {
		scale: 1,
		ease: "back.out",
		duration: 0.5,
		delay: 0.25,
		stagger: {amount: 1.5, from: "random",},
    });

	tl.to(xpWrapper, {
		scale: 1,
		duration: 2,
		delay: 2,
		ease: "expo.inOut",
		onComplete: () => {
			gsap.to(xpWrapper, {duration: 0,width: "calc(2px + 100lvw)",height: "calc(2px + 100lvh)",});			
			centerDrag(false);		
			setTimeout(() => {
				initEvents();
			}, 200);
		},
	});

    tl.add(() => {
      if (!isMobileOrTabletOrLand()) {
        // this.menuButton.classList.add("menu-button-right");
        setTimeout(() => {
			//initWidthFilters();
        }, 200);
        // this.initWidthMenu();
      } else {
        //this.controls.classList.add("hidden-opacity");
        // this.controls.style.width = 0;
      }
    }, "-=1");

    initLazyImages(imagesOutsideViewport);
}

//intro ani end after event
function initEvents() {
	addFocusListeners();
	enableDrag();
	setScrollViewBasedOnDrag();
	xpWrapperC.addClass("drag-easing");
	xpWrapperC.on("wheel",handleWheelXpView);

    // Throttle mousemove event
	if (!isMobileOrTabletOrLand()) {
		addMouseMoveListener(); //mouse effect();
		addEventsZoom();
    }
	initViews();
}

var firstLen = [];
var firstList = [];
var viewButton = $(".viewBtnbox .vbtn");
function initViews() {
	$(".specBtn").addClass("on");
	$(".modeBtn").addClass("on");
	$(".zoomWrapper").addClass("on");
	$(".viewBtnbox").addClass("on");
    
    viewButton.on("click", toggleView);
	$(".modeBtn").on("click", changeMode);

	filteredItems.forEach((el) => {
		const collection = el.getAttribute("data-collection"); 
		
		// If it's the first element
		if (!orderedCollections[collection]) {
			orderedCollections[collection] = [];
			orderedCollectionsList.push(collection);
			firstLen.push(el);
		} else {
			//el.classList.add("other");
			//other.push(el);
		}
		orderedCollections[collection].push(el);
		//el.addEventListener("click", openDtSet);
    });
	

	for (i = 0 ;i < firstLen.length ;i++ ){
		$(".imgeGdList").append(
			`<div class='imgeGdWrap'>
				<div class="imgGdBox">
					<div class="in">
						<div class="imgDtList">								
						</div>
					</div>
				</div>
				<div class="scrollbar">
					<div class="thumb"></div>
				</div>
				<div class="imgGdInfo"></div>
			</div>`
		);
	}

	imageList.forEach((el, i) => {
		let name = el.name[0];
		$(".imgeGdWrap").eq(i).find(".imgGdInfo").html(name + el.images[0].setNum);
		el.images.forEach((image, index) => {
			let $item = $(`<div class="item" data-name="${name + el.images[0].setNum}" data-set="${image.setNum}"></div>`);
			$item.append(`<img src="${image.path}">`);
			$(".imgeGdWrap").eq(i).find(".imgDtList").append($item);
		})
	})

	var allItm = document.querySelectorAll(".imgDtList .item");
	orderedCollections2 = {};
	allItm.forEach((el) => {
		const collection = el.getAttribute("data-name");
		if (!orderedCollections2[collection]) {
			orderedCollections2[collection] = [];
			el.classList.add("first");
			firstList.push(el);
		} else {
			el.classList.add("other");
			other.push(el);
		}
		orderedCollections2[collection].push(el);
	});

	itemsCard = Array.from(document.querySelectorAll(".imgeGdWrap"));
	setItemSize();    

	if (!isMobileOrTabletOrLand()) {
    } else {
    }
}

function changeMode(){
	if ($(".modeBtn").hasClass("dark")){
		$(".modeBtn").removeClass("dark");
		$(".container").removeClass("darkMd");
	} else {
		$(".modeBtn").addClass("dark");
		$(".container").addClass("darkMd");
	}	
}

function addFocusListeners() {
    filteredItems.forEach((item) => {
		setTimeout(() =>{ 
			item.addEventListener("click", function(e){
				openDtFirst = true;
				openDtSet(e);	
				setTimeout(() => openDtViewSetting(), 1);
			});	
		}, 1);	
    });
}



var openDtFirst = false;



//== zoom event ==========================================//
function addEventsZoom() {
    zoomInEl = zoomWrapper.find(".zoomin");
    zoomOutEl = zoomWrapper.find(".zoomout");

    zoomInEl.on("click", handleZoomIn);
    zoomOutEl.on("click",handleZoomOut);
    checkZoomLevel();
}
function handleZoomIn() {
    zoomLevel++;
    zoomIn();
    temporaryDisableZoom();
}
function handleZoomOut() {
    zoomLevel--;
    zoomOut();
    temporaryDisableZoom();
}
function checkZoomLevel() {
    if (zoomLevel === 2) zoomInEl.addClass("off");
    else zoomInEl.removeClass("off");
    if (zoomLevel === 0) zoomOutEl.addClass("off");
    else zoomOutEl.removeClass("off");
}
function temporaryDisableZoom() {
    disableDrag();
	xpWrapperC.off("wheel");

	zoomInEl.addClass("off");
	zoomOutEl.addClass("off");
	xpWrapperC.addClass("off");

	setTimeout(() => {
		xpWrapperC.removeClass("off");
		checkZoomLevel();
		enableDrag();
		setTimeout(() => {
			if (xpWrapperC.innerHeight() < xpWrapper.innerHeight()) return;
			xpWrapperC.on("wheel", handleWheelXpView);
		}, 1000);
    }, 1600);
}

var zoomdrt = false;
function zoomIn() {
	zoomdrt = false;
    const tl = gsap.timeline();
    xpWrapperC.removeClass("drag-easing");
    wrapperScale(tl);
    wrapperDimensions(tl);
    tl.add(() => resetDraggable());
	if (cendrggo){	
		tl.add(() => {			
			centerDrag(false);
			setScrollViewBasedOnDrag();
		});		
		cendrggo = false;
	}
}
function zoomOut() {
	zoomdrt = true;
    const tl = gsap.timeline();
	wrapperDimensions(tl, true);
	centerDrag(true);
	wrapperScale(tl, true);
    tl.add(() => resetDraggable());
}
function wrapperDimensions(tl, out) {
	tl.to(xpWrapper, {
		width: `calc(${zoomInfos[zoomLevel].dimensions}vw + 2px)`,
		height: `calc(${zoomInfos[zoomLevel].dimensions}vh + 2px)`,
		duration: 0,
		delay: out ? 0 : 0.1,
		onComplete: () => {
			const direction = out ? zoomInfos[zoomLevel].ratioOut : zoomInfos[zoomLevel].ratioIn;
			drag.x += window.innerWidth * direction;
			drag.y += window.innerHeight * direction;
			gsap.to(xpWrapperC, {
				duration: 0,
				x: drag.x,
				y: drag.y,
			});
		},
    });
}
function wrapperScale(tl, out) {
	tl.to(xpWrapper, {
		scale: `${zoomInfos[zoomLevel].scale}`,
		duration: 1.5,
		delay: out ? 0.1 : 0,
		ease: "expo.inOut",
	});
}









//== grid toggle =============================//

// grid card slide
var cardDgTarget;
var cardDg;
function createDragCard() {
    if (isXPView) return;
    Array.from(document.querySelectorAll(".imgDtList")).forEach(
	(el, i) => {
        //const firstSlide = el.querySelector(".imgeGdWrap");
        const slides = Array.from(el.querySelectorAll(".item"));
        var snapPoints = slides.map((_, i) => -(initialItemSize * i));
        let direction;
        var currentSlide = 0;
        var totalWidth = snapPoints[slides.length - 1];
        var itemWidth = initialItemSize;
        let isDragging = false;
        var startX = 0, startY = 0, endX = 0, endY = 0;

        // scrollbar
        let scrollbar = itemsCard[i].querySelector(".scrollbar");
        let thumb = itemsCard[i].querySelector(".thumb");
		let thumbWidth = itemWidth / (slides.length - 1);
		if (thumbWidth <= 2){thumbWidth = 2;}
		thumb.style.width = `${Math.round(thumbWidth)}px`;

		//$(itemsCard[i]).attr("data-sld", slides.length);

		cardDg = Draggable.create(el, {
			type: "x",
			bounds: {
				minX: totalWidth,
				maxX: 0,
			},
			inertia: true,
			edgeResistance: 0.9,
			onDragStart: function () {
				gsap.to(scrollbar, {
					opacity: 1,
					duration: 0.5,
				});
			},
			onDragEnd: function () {
				isDragging = false;
			},
			onPress: function (e) {
				isDragging = false; // Réinitialise au clic
				startX = e.clientX || e.touches?.[0]?.clientX;
				startY = e.clientY || e.touches?.[0]?.clientY;
			},
			onRelease: function (e) {
				endX = e.clientX || e.changedTouches?.[0]?.clientX;
				endY = e.clientY || e.changedTouches?.[0]?.clientY;

				const deltaX = Math.abs(endX - startX);
				const deltaY = Math.abs(endY - startY);

				setTimeout(() => {
					if (deltaX < 2 && deltaY < 2) {
						// console.log("Ouverture de la page !");
						//if (isMobileOrTabletOrLand()) window.open(link);
					}
				}, 100);
			},
			onThrowComplete: () => {
				gsap.to(scrollbar, {
					opacity: 0,
					delay: 2,
					duration: 0.5,
				});
			},
			onDrag: function () {
				isDragging = true;
				direction = this.deltaX;
				this.progress = this.x / (this.minX - itemWidth);
				// // // console.log(this.x, (this.minX, itemWidth));
				thumb.style.left = `${this.progress * 100}%`;
			},
			onThrowUpdate: function () {
				this.progress = this.x / (this.minX - itemWidth);
				thumb.style.left = `${this.progress * 100}%`;
			},
			snap: function (value) {
				if (direction < 0 && currentSlide < slides.length - 1) {
					currentSlide++;
					// // // console.log(currentSlide);
				} else if (direction > 0 && currentSlide > 0) {
					currentSlide--;
					// // // console.log(currentSlide);
				}
				return snapPoints[currentSlide];
			},
        });

		cardDgTarget = Draggable.get(el);
      }
    );
}

//card drag reset
function cardDgReset() {
}

function toggleView() {
    if (!isXPView) {
		//xpview
		timelineToXpView();
		isXPView = true;
    } else {
		//gridview
		timelineToGridView();
		isXPView = false;
    }
}

function timelineToXpView() {
    const tl = gsap.timeline();
    disableScrollTriggers();

    tl.add(() => {
		gsap.to(cardParentSplit.words, {
			duration: 0.5,
			ease: "cubic.inOut",
			yPercent: 100,
		});
		gsap.to(".imgDtList .first", {		
			scale: 0.001,
			opacity: 0,
			ease: "cubic.inOut",
			stagger: {
				each: 0.0001,
				from: "end",
			}, duration: 0.3,
		});
		gsap.to(".imgDtList .other", {		
			scale: 0,
			opacity: 0,
			ease: "cubic.inOut",
			//delay: 0.2,
			/*stagger: {
				each: 0.001,
				from: "end",
			}, duration: 0.3,*/
		});
		gsap.to(".scrollbar", {
			opacity: 0,
			duration: 0.3,
		});
		gsap.to(".imgGdBox", {
			backgroundColor: 'transparent',
			ease: "cubic.inOut",
			stagger: {
				each: 0.001,
				from: "end",
			}, duration: 0.5,
		});
    });

	tl.add(() => {
		$(".xp-wrapper").removeClass("hidden");
		setTimeout(function(){			
			$(".gd-wrapper").removeClass("on");
			setTimeout(function(){
				xpWrapperC.addClass("drag-easing");
			},800);
		},100);
		setupDraggable();
		centerDrag();
		flipToXp();
    }, "+=1.5");

    //this.xpSectionCollection.addEventListener("wheel", this.handleWheelXp);
	xpWrapperC.on("wheel",handleWheelXpView);
}

function timelineToGridView() {
    const tl = gsap.timeline();
    removeMouseMoveListener();
    disableDrag();
	
    //enableScrollTriggers();
    //this.handleCloseFilters();
	//this.xpSectionCollection.removeEventListener("wheel", this.handleWheelXp);
	xpWrapperC.off("wheel");
    
    // UI
    tl.to(filteredItems, {
      delay: 0.2,
      scale: 0,
      stagger: 0.01,
      overwrite: true,
      ease: "cubic.inOut",
    });

	tl.add(() => {
		$(".xp-wrapper").addClass("hidden");
		setTimeout(function(){			
			$(".gd-wrapper").addClass("on");
		},100)
		flipToGrid();
	});
}

function flipToGrid() {
    //toggleCardVisible();
    //handleCloseAllFilters();

	//console.log(allItems);
	//gsap.to(allItems, {display: "flex", duration: 0,});
	$(".viewBtnbox").addClass("fixed");
	$(".specBtn").addClass("fixed");

	gsap.set(firstList, {scale: 0,delay: 0,duration: 0,});
	//gsap.set(other, {scale: 0,delay: 0,duration: 0,});

	ScrollSmoother.create({
		smooth: 1,
		effects: true,
		smoothTouch: 0.1,
	});

	//const tl = gsap.timeline();
	firstTrigger = ScrollTrigger.batch(firstList, {
		onEnter: (batch) => {			
			gsap.to(batch, {
				scale: 0.99,
				opacity: 1,
				stagger: 0.1,
				duration: 0.3,
				ease: "back.out",
			});
			//gsap.to(other, {scale: 0.99,opacity:1,duration: 0.3,stagger: 0.1,ease: "back.out",});
		},
    });
	gsap.to(other, {scale: 0.99,opacity:1,duration: 0.3, /*stagger: 0.1,*/ease: "back.out",});

    cardScrollTrigger = ScrollTrigger.batch(".imgGdBox", {
		onEnter: (batch) => {
			gsap.to(batch, {
				//borderColor: `${cardTargetColor}`,
				backgroundColor: 'rgba(0,0,0,0.05)',
				stagger: 0.1,
				delay: 0.2,
				duration: 0.5,
			});
		},
	});

	cardParentSplit = SplitText.create(".imgGdInfo", {type:"words, lines"});

    // Getting card for border animation
    //cardTarget = document.querySelectorAll(".imgGdBox");	
    cardTitleTrigger = ScrollTrigger.batch(cardParentSplit.words, {	
		onEnter: (batch) => {
			gsap.set(batch, { opacity: 0, yPercent:100, }); 
			gsap.to(batch, { 
				opacity: 1,
				duration: 0.5, 
				stagger: 0.1,
				ease: "circ.inOut",
				yPercent: 0,
			});
		},
    });

    createDragCard();
	$(".zoomWrapper").removeClass("on");
}

function flipToXp() {
	gsap.to(filteredItems, {
		scale: 1,
		duration: 0.5,
		delay: 0.25,
		overwrite: true,
		stagger: {
			amount: 1.5,
			from: "random",
		},
		ease: "back.out",
	});

    enableDrag();
    addMouseMoveListener();
    //enableViewButton();
	$(".zoomWrapper").addClass("on");
	xpWrapperC.addClass("drag-easing");
}

function disableScrollTriggers() {
    firstTrigger.forEach((st) => st.disable());
    cardScrollTrigger.forEach((st) => st.disable());
    //cardTitleTrigger.forEach((st) => st.disable());
	cardDg.forEach((st) => st.disable());
}




function xpReStart(){
	removeMouseMoveListener();
    disableDrag();
	xpWrapperC.off("wheel");
	//centerDrag(false);	

	const tl = gsap.timeline({});
    lazyImages = document.querySelectorAll("img");

    const imagesInViewport = [];
    const imagesOutsideViewport = [];
    lazyImages.forEach((img) => {
		(isInViewport(img) ? imagesInViewport : imagesOutsideViewport).push(img);
    });

	setTimeout(function(){
		//setupDraggable();
		enableDrag();
		centerDrag();
		xpWrapperC.on("wheel",handleWheelXpView);			
		addMouseMoveListener();
		setTimeout(function(){
			$(".imageList").addClass("drag-easing");
		},100);
	},100);

    /*gsap.to(imagesInViewport, {
		scale: 1,
		duration: 0.5,
		delay: 0.25,
		overwrite: true,
		stagger: {
			amount: 1.5,
			from: "random",
		},
		ease: "back.out",
		onComplete: () => {			
			setupDraggable();
			enableDrag();
			centerDrag();
			xpWrapperC.on("wheel",handleWheelXpView);			
			addMouseMoveListener();
			//setTimeout(function(){$(".imageList").addClass("drag-easing");},100);
		},
    });*/

	initLazyImages(imagesOutsideViewport);
}





/*=======================================================================*/

// dt pop img setting
function openDtSet(e) {	
	dtTargetItem = e.currentTarget;
	dtTarget = e.target;
	insertViewImage(dtTarget);

	dtCollections = [];
	for (var i = 0 ; i < $(".dtCarousel .item").length ; i++ ){
		dtCollections.push($(".dtCarousel .item").eq(i));
	}
	dtCollectionsInfo = $(".dtCarousel .item").attr("data-collection");
	$(".focusInfotxt").addClass("on");
	$(".focusInfotxt .en em").html($(".dtCarousel .item").attr("data-leng"));
	$(".focusNumber .now").html(dtCollectSlide + 1);
	$(".focusNumber .all").html(dtCollections.length);
	$(".dtCarousel").addClass("out");

	$(dtTarget).addClass("clone");
	
	/*if (openDtFirst){	
		clonedClkEl = dtTarget.cloneNode(true);
		$(clonedClkEl).addClass("clone");
		focusState = Flip.getState([dtTarget,]);
		setTimeout(function(){			
			$(".dtCarousel .item").eq(0).html("");
			$(".dtCarousel .item").eq(0).append(dtTarget);
			$(".dtCarousel .item").eq(0).find("img").addClass("no-transition");
			dtTargetItem.appendChild(clonedClkEl);
			flipOnFocus(focusState);
		},1);
		const openTL = gsap.timeline();		
		openTL.to(clonedClkEl, {
			opacity:0,
			duration: 0.2,
			delay:0.5,
		});
		openDtFirst = false;
	}*/
	if (openDtFirst){	
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

	updateContextualInfosThrottle(dtCollectSlide);
	setTimeout(() => dtViewSizeSet(), 1);	
	setTimeout(() => openDtViews(), 1);	
}

// flip ani
function flipOnFocus(state) {
	Flip.from(state, {
		duration: 1.2,
		absolute: false,
		scale: true,
		zIndex: 10,
		ease: "power4.inOut",
		onComplete: () => {
			$(".dtCarousel img").removeAttr("style").removeClass("no-transition");
			$(".focusThumb img").removeAttr("style");
			$(".dtWrapper .contBtnbox").addClass("on");
			$(".contBtnbox .cotbtn.prev,.contBtnbox .cotbtn.next").off().on("click",dtControllSet);
			$(".contBtnbox .cotbtn.close").off().on("click",closeDtViews);			
		},
	});
}

// dt pop size setting
function dtViewSizeSet(){
	focusThumb = document.querySelector(".focusThumb");
	dtThumbHeight = focusThumb.scrollHeight;
    dtCarouselHeight = dtCarousel.getBoundingClientRect().height;
	
	dtItemHeight = dtWrapper.getBoundingClientRect().height;
	dtSnapPoints = dtCollections.map((_, i) => -(dtItemHeight * i));
	dtLastPoint = -dtSnapPoints[dtSnapPoints.length - 1];

	$(".dtCarousel .item").css("height",dtItemHeight);
}

// dt pop open view_ no repeat
function openDtViewSetting(){
	disableDrag();
	removeMouseMoveListener();
	pauseFocusListeners();

	$(xpWrapper).addClass("off");
	$(".zoomWrapper").removeClass("on");
	$(".viewBtnbox").removeClass("on");
	$(".specBtn").removeClass("on");
	$(".dtWrapper").addClass("on");	
	
	$(".dtWrapper .contBtnbox").addClass("on");
	$(".contBtnbox .cotbtn.prev,.contBtnbox .cotbtn.next").off().on("click",dtControllSet);
	$(".contBtnbox .cotbtn.close").off().on("click",closeDtViews);
	setTimeout(function(){$(".dtCarousel").removeClass("out");	},500);

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
	var $this = e.target;
	$(".dtThumbWrapper").removeClass("on");
	$(".focusNumber").removeClass("on");		
	$(".focusInfotxt").removeClass("on");
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

		lastScrollY = 0;
		dtScrolling = false;
		dtDragging = false;
		offsetDragY = 0;
		initialDragY = 0;
		dragDirection = 0;
		focusDragY = 0;

		setTimeout(function(){		
			$(".dtCarousel").removeClass("out");
			setTimeout(function(){ 
				$(".contBtnbox").removeClass("off");
			},500);
		},300);
	},300);

	var findNextCollecPrev,findNextCollecNext,dtTargetCollec;	
	for (var i = 0; i < orderedCollectionsList.length ; i++ ){
		if (orderedCollectionsList[i] == dtCollectionsInfo){
			findNextCollecPrev = i-1;
			findNextCollecNext = (i+1);
		}
	}
	
	if ($this.classList[1] == 'prev'){
		$(".contBtnbox .cotbtn.next").removeClass("off");
		dtTargetCollec = orderedCollectionsList[findNextCollecPrev];
		setTimeout(function(){			
			openDtSet({target: orderedCollections[dtTargetCollec][0].childNodes[0], currentTarget: orderedCollections[dtTargetCollec][0]});
		},300);

	} else if ($this.classList[1] == 'next'){
		$(".contBtnbox .cotbtn.prev").removeClass("off");
		dtTargetCollec = orderedCollectionsList[findNextCollecNext];
		setTimeout(function(){			
			openDtSet({target: orderedCollections[dtTargetCollec][0].childNodes[0], currentTarget: orderedCollections[dtTargetCollec][0]});
		},300);
	}
}

// dt pop close
function closeDtViews(){	
	$(".dtWrapper").removeClass("on");
	$(".dtThumbWrapper").removeClass("on");
	$(".focusNumber").removeClass("on");	
	$(".focusInfotxt").removeClass("on");
	$(".dtCarousel").addClass("out");
	$(".contBtnbox").removeClass("on off");
	$(".contBtnbox .cotbtn").removeClass("off");
	$(".imageList .item .clone").removeAttr("style");
	hideContextualInfos();
	resetScrollAni();
	removeEventsDtSlider();	

	setTimeout(function(){
		addMouseMoveListener();
		$(".dtCarousel").removeClass("out");
		
		$(".dtCarousel").html("");
		$(".focusThumb").html("");
		dtCarousel.style.transform = `translate3d(0, 0, 0)`;
		focusThumb.style.transform = `translate3d(0, 0, 0)`;
		dtCollectSlide = 0;
		targetY = 0;
		currentY = 0;
		curchang = 0;

		lastScrollY = 0;
		dtScrolling = false;
		dtDragging = false;
		offsetDragY = 0;
		initialDragY = 0;
		dragDirection = 0;
		focusDragY = 0;

		$(".zoomWrapper").addClass("on");
		$(".viewBtnbox").addClass("on");
		$(".specBtn").addClass("on");

		gsap.to(".imageList .item .clone", {
			scale: 1,
			opacity: 1,
			ease: "back.out",
			duration: 0.5,
			delay: 0.5,
			onComplete: () => {
				$(xpWrapper).removeClass("off");
				$(".imageList .item .clone").removeClass("clone");
				enableDrag();
			},
		});
	},300);
}


// dt pop event setting
function addEventsDtSlider() {
    dtCarouselWheelEvent();
    dtWrapper.addEventListener("mousedown", dragMouseDown);
    dtWrapper.addEventListener("mousemove", dragMouseMove);
    dtWrapper.addEventListener("mouseup", dragMouseUp);
	dtWrapper.addEventListener('mouseleave', dragMouseUp);
}
function removeEventsDtSlider() {
    dtWrapper.removeEventListener("wheel", dtCarouselWheel);
    dtWrapper.removeEventListener("mousedown", dragMouseDown);
    dtWrapper.removeEventListener("mousemove", dragMouseMove);
    dtWrapper.removeEventListener("mouseup", dragMouseUp);
	dtWrapper.removeEventListener('mouseleave', dragMouseUp);
}

// dt pop wheel setting
function dtCarouselWheel(e) {
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
		$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
		//updateContextualInfosThrottle(dtCollectSlide);
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
		$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
		//updateContextualInfosThrottle(dtCollectSlide);
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

		dtCarousel.classList.add("drag-easing");
		focusThumb.classList.add("drag-easing");
		if (currentY >= (dtCarouselHeight - dtItemHeight)){
			dtCarousel.style.transform = `translate3d(0, ${-dtLastPoint}px, 0)`;
			currentY = dtLastPoint;
			$(".focusNumber .now").html(dtCollections.length);
			//updateContextualInfosThrottle(dtCollections.length - 1);

		} else {
			dtCarousel.style.transform = `translate3d(0, ${dtSnapPoints[dtCollectSlide]}px, 0)`;
			currentY = -dtSnapPoints[dtCollectSlide];
			$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
			//updateContextualInfosThrottle(dtCollectSlide);

		}
		targetY = currentY;
		y = (currentY / dtCarousel.scrollHeight) * focusThumb.scrollHeight; 
		focusThumb.style.transform = `translate3d(0, ${-(y)}px, 0)`;
	};
	const debouncedResize = debounce(handleResize, 300);

	window.addEventListener("resize", () => {
		drag?.kill();
		setupDraggable();
		dtViewSizeSet();
		clampTarget();

		setItemSize();
		createDragCard();

		if (zoomdrt && zoomLevel == 0){
			//console.log("out");
			setScrollViewBasedOnDrag();
			centerDrag(false);
			cendrggo = true;			
				
		} else if (!zoomdrt) {
			//console.log("in")
		}

		if (curchang != dtCollectSlide){
			$(".focusNumber .now").html(Number(dtCollectSlide) + 1);
			//updateContextualInfosThrottle(dtCollectSlide);
		}
		curchang = dtCollectSlide;

		debouncedResize();
	});
}




/*=======================================================================*/



























































/*
function resize() {
	//setItemCardWidth();

	window.addEventListener("resize", () => {
		// // console.log("resize");
		drag?.kill();
		setupDraggable();
		//setItemCardWidth();

		setItemSize();
		createDragCard();

		if (zoomdrt && zoomLevel == 0){
			//console.log("out");
			setScrollViewBasedOnDrag();
			centerDrag(false);
			cendrggo = true;			
				
		} else if (!zoomdrt) {
			//console.log("in")
		}

		if (focusElement) itemHeight = focusElement.getBoundingClientRect().height;
		if (!isMobileOrTabletOrLand()) {checkMarkeeDebounce();}
	});
}
*/





//== viewBtnbox mouse event===========================//
function prepareButtonsHover() {
	createHoverButton(viewButton, true);
	/*if (onlyDesktop()) {
	  createSplitTextButton(buttonGroup);
	  createSplitTextButton(button);
	}*/
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
			second.textContent = isMobileOrTabletOrLand() ? "experience view" : "grid view";
			second.classList.add("secondLine");
			second.classList.remove("split-parent");
			split1 = new SplitText(line, { type: "chars" });
			split2 = new SplitText(second, { type: "chars" });

			buttonText[0].appendChild(parentSplit.lines[0]);
			buttonText[0].appendChild(second);
	});


	if (isViewButton) {
		if (isMobileOrTabletOrLand()) {
			button.addEventListener("click", () => {
				handleViewHover();
			});
		} else {
			gridXPButtonTimeline(split1, split2);
			button.addEventListener("click", () => {
				leaveOnce = true;
				//  this.toggleHover(this.isXPView)
				// this.handleViewHover();
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
			//buttonHoverEnter(split1, split2)
		});
    // button.addEventListener("mouseleave", () =>
    //   this.buttonHoverLeave(split1, split2)
    // );
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
		onComplete: () => {
        // gsap.to(split1.chars, { yPercent: 0, duration: 0 });
		},
	});
    tlHover.to(split2.chars, {
		duration: 0.5,
        ease: "power3.inOut",
        yPercent: -100,
        stagger: 0.01,
        overwrite: true,
		onComplete: () => {
          // gsap.to(split2.chars, { yPercent: 0, duration: 0 });
		},
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
			gsap.to(item, {
				scale: scaleFactor,
				duration: guiVal.durationTarget,
				ease: "power3",
			});
		} else {
			gsap.to(item, { scale: 1, duration: 1, ease: "power3" });
		}
	});
}



















function setItemSize() {
	const img = document.querySelector(".imageList .item img");
	if (img) itemSize = img.getBoundingClientRect().width;

	const item = document.querySelector(".imgeGdList .imgeGdWrap");	
	if (item) initialItemSize = item.getBoundingClientRect().width;
}

const easeQuadOut = (t) => 1 - (1 - t) ** 2;
const customEasing = (t) => gsap.parseEase("expo.inOut")(Math.max(0, t + 0.1) / 1.1);
function easeOutQuart(t) {return 1 - Math.pow(1 - t, 4);}
function easePower3Out(t) {return (1 - (1 - t)) ^ 3;}
function easeOut(t) {return 1 - Math.pow(1 - t, 3);}
function lerp(start, end, amt) {return (1 - amt) * start + amt * end;}
function pauseFocusListeners() {pauseFocus = true;}
function allowFocusListeners() {pauseFocus = false;}
function addMouseMoveListener(){window.addEventListener("mousemove", throttledMouseMove);}
function removeMouseMoveListener(){window.removeEventListener("mousemove", throttledMouseMove);}
function throttledMouseMove(e){throttle(updateScales(e), guiVal.throttleInterval);}
function checkEaseFactor() {
    if (itemHeight / 4 < Math.abs(currentScroll - scrollY)) {
      easeFactor = 0.01;
    } else easeFactor = 0.02;
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
function debounce(fn, delay) {
  let timeoutId;
  function debounced(...args) {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  }
  debounced.cancel = () => clearTimeout(timeoutId);
  return debounced;
}
function lerpWithEase(a, b, t, easingFunction) {
	t = easingFunction(t);
	return a + (b - a) * t;
}
function hideDragForMore(e) {
	var dragEl = document.querySelector(".dragformorewrapper");
    if (dragEl) dragEl.classList.add("opacity-0");
}



































function onlyDesktop() {
  const isMobileOrTablet =
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(
      navigator.userAgent
    ) || "ontouchstart" in window; // Inclut tous les appareils à écran tactile

  // Retourne true si l'écran est supérieur à 1024px et qu'il n'est pas un appareil mobile/tablette
  return !isMobileOrTablet && window.innerWidth >= 1024;
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