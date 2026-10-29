

	

$(document).ready(function() {



	initViews();
	addFocusListeners();
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

var focusWrapper = document.querySelector(".focusWrapper");
var focusCarousel = document.querySelector(".focusCarousel");
var focusMarkeeWrapper = document.querySelector(".focusSldWrapper");
var focusMarkee = document.querySelector(".focusSld");
var focusMarkeeIndicator = document.querySelector(".focusSldIndicator");
var contextualInfo = document.querySelector(".contextualInfo");





function initViews() {
    orderedCollections = {};
	filteredItems.forEach((el) => {
		var collection = el.getAttribute("data-collection"); // Récupère la collection
		
		// If it's the first element
		if (!orderedCollections[collection]) {
			orderedCollections[collection] = [];
		}
		orderedCollections[collection].push(el);
    });
}

function addFocusListeners() {
    filteredItems.forEach((item) => {
		item.addEventListener("click", handleClick);		
    });
}

function handleClick(e) {
	mouseX = event.clientX;
    mouseY = event.clientY;
	rect = e.target.getBoundingClientRect();
	itemX = rect.left + rect.width / 2;
	itemY = rect.top + rect.height / 2;
	distance = Math.sqrt(Math.pow(mouseX - itemX, 2) + Math.pow(mouseY - itemY, 2));

	



	var currentTarget = e.currentTarget;
	focusElement = e.target;
	currentCollec = e.currentTarget.dataset.collection;
	

	$(focusWrapper).addClass("on");	
	$(currentTarget).addClass("on");
	$(contextualInfo).addClass("on");
	setTimeout(function(){
		$(focusMarkeeWrapper).addClass("on");
		$(".focusWrapper .contBtnbox").addClass("on");
	},100);	

	clonedClkEl = currentTarget.cloneNode(true);		
	clonedClkElMarkee = focusElement.cloneNode(true);	
	//$(clonedClkEl).addClass("on");
	$(clonedClkElMarkee).addClass("on");

	setTimeout(function(){
		focusCarousel.appendChild(clonedClkEl);
		focusMarkee.appendChild(clonedClkElMarkee);
	},1);	
	
	setTimeout(() => addCollectionItemsToCarousel(currentTarget), 1);

	sldpControll();
}

function formatInfos(item) {	
	var name = item.childNodes[0].dataset.itmName;
	return `${name}`;
}


function addCollectionItemsToCarousel(currentTarget) {
    currentSlideInfos = [];	//이름
    const currentImgs = []; //item
    const currentCollec = currentTarget.dataset.collection; //분류
    const currentCollecItems = orderedCollections[currentCollec];

	console.log(currentCollec)

    currentCollecItems.forEach((item) => {
		var text = formatInfos(item);
		currentSlideInfos.push(text);	

		if (currentTarget === item) {
			const clonedImage = item.cloneNode(true);
			currentImgs.push(clonedImage);
			return;
		}
		if (item) {
			const img = item.querySelector("img");
			const clonedImage = item.cloneNode(true);
			const clonedImageMarkee = img.cloneNode(true);
			focusCarousel.appendChild(clonedImage);
			if (!isMobileOrTabletOrLand()) focusMarkee.appendChild(clonedImageMarkee);
			currentImgs.push(clonedImage);
		}
	});
	
    createFocusDrag(currentCollecItems);
	setTimeout(() => calculMarkeeHeight(), 1);	

    if (!isMobileOrTabletOrLand()) {
		addMarkeeListeners();
    }	
}



function calculMarkeeHeight() {
    focusMarkeeHeight = focusMarkee.scrollHeight;
	focusMarkeeImgHeight = focusMarkee.querySelector("img").scrollHeight;
    //console.log(focusMarkeeHeight);
    focusCarouselHeight = focusCarousel.getBoundingClientRect().height;
    //console.log(focusCarouselHeight);
	itemHeight = focusCarousel.querySelector("img").getBoundingClientRect().height;
}



function createFocusDrag(slides) {
	
    currentSlide = 0;
    currentSlides = slides;
    
    /*if (isMobileOrTabletOrLand()) itemHeight = window.innerWidth;
    else itemHeight = focusElement.getBoundingClientRect().height;
    const bottom = focusElement.getBoundingClientRect().bottom;*/

	itemHeight = focusCarousel.querySelector("img").getBoundingClientRect().height;
    snapPoints = currentSlides.map((_, i) => -(itemHeight * i));
	
    isScrolling = false; 
	checkEaseFactor();

    lastPoint = -snapPoints[snapPoints.length - 1];

    //console.log(snapPoints);
    offsetDragY = 0;
    initialDragY = 0;
    dragDirection = 0;
    focusDragY = 0;

	/*addEventsSlider();
	raf = requestAnimationFrame(updateScrollSlider);*/

	if (onlyDesktop()) {
		addEventsSlider();
		raf = requestAnimationFrame(updateScrollSlider);
    } else {
		setTimeout(() => {
			createFocusDragMobile();
		}, 700);
    }
    updateContextualInfosThrottle(currentSlide);	
	
}

function sldpControll(){
	$(".focusWrapper .contBtnbox .cotbtn").off("click").on("click", function(){
		var cnt = 0;
		var cnt2 = 0;
		var stop = false;
		var now,prevItem,nextItem;

		for (key in orderedCollections){				
			if (orderedCollections[key][0].dataset.collection == currentCollec){
				now = cnt;		
				stop = true;
			}
			cnt++;
		}

		if (stop){
			for (key in orderedCollections){
				if (cnt2 == (now + 1)){
					nextItem = orderedCollections[key][0];						
				} else if (cnt2 == (now - 1)){
					prevItem = orderedCollections[key][0];
				}
				stop = false;
				cnt2++;
			}
		}			
		
		$(".imageList .item").removeClass("on");
		$(".focusWrapper .focusCarousel").addClass("out");
		$(".focusWrapper .focusSldWrapper").removeClass("on");
		$(".focusWrapper .contextualInfo").removeClass("on");

		setTimeout(function(){
			$(".focusWrapper .focusCarousel").html("");
			$(".focusWrapper .focusSld").html("");
		},300);




		if ($(this).hasClass("prev") || $(this).hasClass("next")){



			if ($(this).hasClass("prev")){

				focusElement = prevItem.querySelector("img");
				currentCollec = prevItem.dataset.collection;
				clonedClkEl = prevItem.cloneNode(true);		
				clonedClkElMarkee = focusElement.cloneNode(true);	
				$(clonedClkElMarkee).addClass("on");
				$(prevItem).addClass("on");

				console.log(currentCollec)

				setTimeout(function(){
					focusCarousel.appendChild(clonedClkEl);
					focusMarkee.appendChild(clonedClkElMarkee);

					addCollectionItemsToCarousel(prevItem);
					console.log("click")
				},400);




			} else if ($(this).hasClass("next")){
				focusElement = nextItem.querySelector("img");
				currentCollec = nextItem.dataset.collection;
				clonedClkEl = nextItem.cloneNode(true);		
				clonedClkElMarkee = focusElement.cloneNode(true);	
				$(clonedClkElMarkee).addClass("on");
				$(nextItem).addClass("on");

				setTimeout(function(){
					focusCarousel.appendChild(clonedClkEl);
					focusMarkee.appendChild(clonedClkElMarkee);
				},1);

				setTimeout(() => addCollectionItemsToCarousel(nextItem), 1);

			}

			
			
			setTimeout(function(){
				$(".focusWrapper .focusCarousel").addClass("in");
				$(focusMarkeeWrapper).addClass("on");
				$(contextualInfo).addClass("on");
			},500);

		} else if ($(this).hasClass("close")){
			closeFocus();

			this.viewButton.classList.remove("hidden");
			 this.filterCTA.classList.remove("hidden");



		}	
	});
}

function updateScrollSlider() {
	if (Math.abs(currentScroll - scrollY) > 0.01) {
		if (scrollY < -10) {scrollY = 0;}
		if (scrollY > Math.abs(snapPoints[snapPoints.length - 1])) {
			scrollY = Math.abs(snapPoints[snapPoints.length - 1]);
		}
		currentScroll = lerpWithEase(
			currentScroll,
			scrollY,
			easeFactor,
			currentEase
		);
		if (isScrolling) {updateScrolValues();}
    }
	updateMarkee();
    raf = requestAnimationFrame(updateScrollSlider);
}

function updateScrolValues() {
	this.scrollSpeed *= friction;
    const scrollSpeed = Math.abs(this.scrollSpeed);
    if (this.lastScrollSpeed > scrollSpeed && scrollSpeed < 5) {
      if (!isSnappingScroll) snapToClosest();
      isScrolling = false;
      isSnappingScroll = true;
    }
    this.lastScrollSpeed = scrollSpeed;
}

var curchang2 = 0;
var lastScrollY = 0;
function updateMarkee() {
    if (isDragging) {
		markeeScroll = lerp(markeeScroll, scrollY, 0.1);
		y = (markeeScroll / focusCarouselHeight) * (focusMarkeeHeight + 12);

    } else if (isScrolling) {		
		reszeadd();

    } else if (isClicking) {
		markeeScroll = lerp(markeeScroll, scrollY, 0.1 / (distance * 0.75));
		y = (markeeScroll / focusCarouselHeight) * (focusMarkeeHeight + 12);

    } else {
		markeeScroll = lerp(markeeScroll, scrollY, 0.1);
		y = (markeeScroll / focusCarouselHeight) * (focusMarkeeHeight + 12);
    }
	
	 //console.log()
    // this.focusMarkeeIndicator.style.transform = `translate3d(0, ${this.y}px, 0)`;    
	focusCarousel.style.transform = `translate3d(0, ${-markeeScroll}px, 0)`;
	focusMarkee.style.transform = `translate3d(0, ${-(y)}px, 0)`;
}

function reszeadd(){
	console.log(scrollY);
	markeeScroll = lerp(markeeScroll, scrollY, 0.1);
	y = (markeeScroll / focusCarouselHeight) * (focusMarkeeHeight + 12); 


	const currentY = markeeScroll;
	const direction = currentY - lastScrollY;
	lastScrollY = currentY;

	const threshold = itemHeight * (2 / 3);
	const currentSlideTop = currentSlide * itemHeight;
	if (dragDirection >= 0) {
		if (markeeScroll > currentSlideTop + threshold && currentSlide < currentSlides.length - 1) {
			currentSlide++;
		}
	} else if (dragDirection < 0) {
		if (markeeScroll <= currentSlideTop - threshold && currentSlide > 0) {
			currentSlide--;
		}
	}		

	if (curchang2 != currentSlide){
		updateContextualInfosThrottle(currentSlide);
	}
	curchang2 = currentSlide;
}

function addEventsSlider() {
    addWheelEvent();
    focusWrapper.addEventListener("mousedown", dragMouseDown);
    focusWrapper.addEventListener("mousemove", dragMouseMove);
    focusWrapper.addEventListener("mouseup", dragMouseUp);
	focusWrapper.addEventListener('mouseleave', dragMouseUp);
}

function addWheelEvent() {
    handleWheelBound = (e) => handleWheel(e);
    focusWrapper.addEventListener("wheel", handleWheelBound, {
		passive: false,
    });
}

function removeWheelEvent() {
    if (handleWheelBound) {
      focusWrapper.removeEventListener("wheel", handleWheelBound);
    }
}

var isDragging;
function handleWheel(e) {
    isDragging = false;
    easeFactor = 0.02;
    currentEase = easeOut;
    e.preventDefault();

    // if (!this.isScrolling) return; // Empêcher le scroll excessif
    isScrolling = true;
    scrollSpeed = e.deltaY;
    isMouseOrTrackpad(e);
    direction = e.deltaY < 0 ? 1 : -1;

    //updateContextualInfosThrottle(currentSlide);

    if (!isSnappingScroll) {
      scrollY += e.deltaY;
    }
}


function snapToClosest() {
	//cnosole.log("snap")
	currentSlide = getClosestSnapPoint(
		-currentScroll,
		snapPoints,
		direction
    );
	//console.log(snapPoints);
    //scrollY = -snapPoints[currentSlide];
    currentEase = easePower3Out;
    updateScrollPositionScrollend();	

	if (curchang2 != currentSlide){
		updateContextualInfosThrottle(currentSlide);
	}
	curchang2 = currentSlide;
}

function updateScrollPositionScrollend() {
    checkEaseFactor();
    currentEase = easeOutQuart;
	setTimeout(() => {
		isSnappingScroll = false;
		isScrolling = false;
	}, 100);

    /*posScroll = gsap.to("body", {
		//x: 0,
		//duration: 0.7,
		//overwrite: true,
		onStart: () => {
			setTimeout(() => {
				//isSnappingScroll = false;
				//isScrolling = false;
			}, 100);
		},
    });*/
}

function isMouseOrTrackpad(e) {
    const absDelta = Math.abs(e.deltaY);
    const isTrackpad = absDelta < 30;
    if (isTrackpad) {
      scrollSpeed = e.deltaY;
      friction = 1;
    } else {
      scrollSpeed += e.deltaY;
      friction = 0.85;
    }
}

function getClosestSnapPoint(current, snapPoints, direction) {
    if (direction < 0) {
      var closest = snapPoints.findIndex((point) => point < current);
      if (closest === -1) closest = snapPoints.length - 1;
    } else {
      var closest = snapPoints.findLastIndex((point) => point > current);
      if (closest === -1) closest = 0;
    }
    return closest;
}


function addMarkeeListeners() {
    Array.from(focusMarkee.children).forEach((c, i) => {
      c.setAttribute("data-index", i);
      c.addEventListener("click", handleClickMarkeeItem);
    });
}

var isClicking;
function handleClickMarkeeItem(e) {
    isClicking = true;
    const index = +e.target.dataset.index;
    //if (index === currentSlide) return;
    //distance = Math.abs(index - currentSlide);
    //console.log(currentSlide, distance);

	if (index === currentSlide) {
		if (scrollY > itemHeight * index){
			currentSlide--;
			distance = Math.abs(index - currentSlide);
			currentSlide = index;
			scrollY = itemHeight * index;
		} else { return; }

	} else {
		distance = Math.abs(index - currentSlide);
		currentSlide = index;
		scrollY = itemHeight * index;	
	}

	//currentSlide = index;
    //scrollY = itemHeight * index;
    easeFactor = 0.1 / (distance * 1.75);
    updateContextualInfosThrottle(currentSlide);
}


function createFocusDragMobile() {
    let direction = 0;
    focusDrag = Draggable.create(".focusCarousel", {
		type: "y",
		bounds: {
			minY: snapPoints[currentSlides.length - 1],
			maxY: 0,
		},
		inertia: true,
		edgeResistance: 0.9,
		onDrag: () => {
			direction = focusDrag[0].deltaY;
		},
		/*snap: () => {
			if (
				direction < 0 &&
				currentSlide < currentSlides.length - 1
			) {
				currentSlide++;
			} else if (direction > 0 && currentSlide > 0) {
				currentSlide--;
			}

        // // console.log(this.currentSlide);
        // this.scrollY = -this.snapPoints[this.currentSlide];
			updateContextualInfosThrottle(currentSlide);
			return snapPoints[currentSlide];
		},*/
    });
}

function dragMouseDown(event) {
    // // // console.log(this.focusCarousel);
	event.preventDefault();
    isScrolling = false;
    isDragging = true;
    dragDirection = 0;
    initialDragY = event.clientY * 2;
    offsetDragY = event.clientY * 2 - (focusCarousel.offsetTop) + scrollY;
    //focusCarousel.style.cursor = "grabbing";
}

var curchang = 0;
function dragMouseMove(event) {
	event.preventDefault();
	if (isDragging) {
		focusDragY = event.clientY * 2 - offsetDragY;
		scrollY = -focusDragY;
		dragDirection = event.clientY * 2 - initialDragY;

		const threshold = itemHeight * (2 / 3);
		const currentSlideTop = currentSlide * itemHeight;
		if (dragDirection < 0) {
			if (scrollY > currentSlideTop + threshold && currentSlide < currentSlides.length - 1) {
				currentSlide++;
			}
		} else if (dragDirection >= 0) {
			if (scrollY <= currentSlideTop - threshold && currentSlide > 0) {
				currentSlide--;
			}
		}		
		//console.log(currentSlide)
		if (curchang != currentSlide){
			updateContextualInfosThrottle(currentSlide);
		}
		curchang = currentSlide;
    }
}




function dragMouseUp() {
    isScrolling = false;
    isDragging = false;
    //focusCarousel.style.cursor = "grab";
    easeFactor = 0.02;
    dragSnapToClosest();
}


function dragSnapToClosest() {
    // // console.log("snapToClosest", this.dragDirection);
    if (dragDirection === 0) return;
    //scrollY = -snapPoints[currentSlide];
    focusDragY = scrollY;
    checkEaseFactor();
    // this.currentScroll = this.scrollY;
    // this.updatePosition();
    // // // // console.log(this.scrollY);
}




updateContextualInfosThrottle = debounce((activeIndex) => {
	// // // console.log("change");
	// should better cancel debounce
	updateContextualInfos(activeIndex); // Appel de la fonction avec l'index
}, 500);

var infosSplit;
function updateContextualInfos(currentSlide) {	
    // // // console.log("test");
	if (infosSplit) hideContextualInfos();
    //if (!drag.enabled()) {
	setTimeout(() => {
        contextualInfo.innerText = currentSlideInfos[currentSlide];
        var parentSplit = new SplitText(contextualInfo, {
			type: "lines",
			linesClass: "split-parent",
        });
        infosSplit = new SplitText(contextualInfo, { type: "chars" });
        showContextualInfos();
	}, 500);
    //}
}
function hideContextualInfos() {
    if (infosSplit && infosSplit.chars)
		gsap.to(infosSplit.chars, {
			// duration: 0,
			duration: 0.3,
			ease: "cubic.inOut",
			yPercent: -100,
			stagger: 0.03,
			onComplete: () => {
			  // // console.log("complete chars");
			  // gsap.set(this.infosSplit.chars, { yPercent: 100 });
			},
		});
}
function showContextualInfos() {
    gsap.from(infosSplit.chars, {
		duration: 0.5,
		ease: "cubic.inOut",
		yPercent: 100,
		stagger: 0.03,
    });
}







function closeFocus(e) {

    removeEventsSlider();
    enableDrag();

    addMouseMoveListener();
    allowFocusListeners();

    updateContextualInfosThrottle.cancel();

    const closeTL = gsap.timeline();

    closeTL.to(xpWrapper, {
		xPercent: 0,
		duration: 1.5,
		ease: "expo.inOut",
    });
    // // console.log(this.focusWrapper.children);
    closeTL.to(focusWrapper.children, {
		x: isMobileOrTabletOrLand() ? "-100vw" : "-60vw",
        // xPercent: "-60",
        duration: 1.5,
        ease: "expo.inOut",
        onStart: () => focusCarousel.classList.add("no-transition"),
        onUpdate: () => {
			focusCarouselX = gsap.getProperty(focusInfos, "x"); // Mise à jour propre
        },
	}, 0);

	/*closeTL.to(buttonCloseFocus, {
        scale: 0,
        duration: 0.5,
        ease: "back.in",
        pointerEvents: "none",
      },
      0
    );*/

    if (isMobileOrTabletOrLand()) {
		closeTL.to(focusCTAs, {
          opacity: 0,
          duration: 0.5,
        }, 1);
		closeTL.add(() => navbarWrap.classList.remove("none"), 1);
		closeTL.to(navbarWrap,{
			opacity: 1,
			duration: 0.5,
			ease: "expo.in",
		}, 1);
	} else {
		closeTL.to(focusCTAs, {
			opacity: 0,
			pointerEvents: "none",
			duration: 0.5,
        }, 1);
    }

    closeTL.set(focusElement, { scale: 0 }, 0.9);
    closeTL.add(() => xpPlace.appendChild(focusElement), 0.9);
    closeTL.to(focusElement, { scale: 1, ease: "back.out" }, 1);
    closeTL.add(() => xpWrapper.classList.toggle("asideGrid"), 2);
    closeTL.add(() => (focusCarousel.innerHTML = ""), 1);
    closeTL.add(() => {
		hideContextualInfos();
		// Reset Carousel
		focusMarkee.innerHTML = "";
		contextualInfo.innerText = "";
		//focusedCollectionTitle.innerText = "";
		scrollY = 0;
    }, 1);

    closeTL.to([focusMarkee, focusMarkeeIndicator],{
        opacity: 0,
        duration: 0.5,
	}, 1);
    closeTL.to(focusWrapper.children, {
        x: 0,
        y: 0,
        duration: 0,
        onUpdate: () => {
			focusCarouselX = gsap.getProperty(focusInfos, "x"); 
        },
	}, "-=0");


    if (isMobileOrTabletOrLand()) {
      closeTL.set(this.viewButton, { y: 0 }, "=-1.5");
      closeTL.to(
        [this.viewButton, this.CTAWrapper, this.instructionZoomWrapper],
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          pointerEvents: "all",
          ease: "cubic.out",
        },
        "=-1.5"
      );
    } else {
      closeTL.to(
        [this.viewButton, this.CTAWrapper, this.instructionZoomWrapper],
        {
          y: 0,
          opacity: 1,
          duration: 0.5,
          pointerEvents: "all",
          ease: "cubic.inOut",
        },
        "1"
      );
    }

    closeTL.add(() => {
		xpWrapper.classList.remove("disablePointerEvents");
    }, "=-0.1");

    closeTL.add(() => {
      Array.from(buttonGroup.children).forEach((c) =>
        c.classList.add("disablePointerEvents")
      ),
        // Restart markee
        restartMarkee();
    });


    setTimeout(() => {
		focusWrapper.classList.remove("pointerAll");
    }, 500);
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
		//console.log("end", focusCarousel.getBoundingClientRect().top);
		//window.scrollBy({top:10});
		/*scrollY = -(focusCarousel.getBoundingClientRect().top);

		console.log(scrollY, lastPoint)


		if (scrollY >= (focusCarouselHeight - itemHeight)){
			console.log("a");
			focusCarousel.style.transform = `translate3d(0, ${-lastPoint}px, 0)`;

		} else {
			console.log("b");
			focusCarousel.style.transform = `translate3d(0, ${-snapPoints[currentSlide]}px, 0)`;		
		}*/
		
		//reszeadd();		
	};
	const debouncedResize = debounce(handleResize, 300);

	window.addEventListener("resize", () => {
		calculMarkeeHeight();

		updateScrollSlider();
		currentCollecItems = orderedCollections[currentCollec];
		snapPoints = currentCollecItems.map((_, i) => -(itemHeight * i));
		lastPoint = -snapPoints[snapPoints.length - 1];
		//updateMarkee();
		//console.log(itemHeight)
		console.log(focusCarousel.style.transform, lastPoint)

		//scrollY = -(focusCarousel.getBoundingClientRect().top);
		//console.log(scrollY, lastPoint)

		if (scrollY >= (focusCarouselHeight - itemHeight)){
			console.log("a");
			setTimeout(function(){
				focusCarousel.style.transform = `translate3d(0, ${-lastPoint}px, 0)`;
				console.log(focusCarousel.style.transform)
			},100);
			
			

		} else {
			console.log("b");
			focusCarousel.style.transform = `translate3d(0, ${-snapPoints[currentSlide]}px, 0)`;		
		}

		debouncedResize();

	

		
	});

	
}








function removeEventsSlider() {
    removeWheelEvent();
    // // console.log("remove");
    focusWrapper.removeEventListener("mousedown", dragMouseDown);
    focusWrapper.removeEventListener("mousemove", dragMouseMove);
    focusWrapper.removeEventListener("mouseup", dragMouseUp);
	focusWrapper.removeEventListener('mouseleave', dragMouseUp);
}



function restartMarkee() {
    // // console.log(this.raf, "raf");
    cancelAnimationFrame(this.raf);
    this.y = 0;
    this.currentScroll = 0;
    this.focusMarkeeIndicator.style.transform = `translate3d(0, ${this.y}px, 0)`;
}
  // Initialiser l'événement `wheel` pour faire défiler






















function checkEaseFactor() {
    if (itemHeight / 4 < Math.abs(currentScroll - scrollY)) {
      // this.currentEase = easeOutQuad;
      easeFactor = 0.01;
      // // // console.log("ici");
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