$(document).ready(function() {
    const CONFIG = {
        BATCH_SIZE: 35,
        ITEM_HEIGHT: 170,
        ITEM_WIDTH: 170,
        SCROLL_THRESHOLD: 100,
        LAZY_LOAD_CONFIG: {
            effect: 'fadeIn',
            effectTime: 300,
            effectSpeed: 300,
            effectEasing: 'ease',
        }
    };

    let jsonData;
    let imageList = [];
    let currentList = [];
    let originalSearchList = [];
    let currentIndex = 0;
    let batchSize = CONFIG.BATCH_SIZE;
    let isLoading = false;
    let categories = {};
    let categoryList;

    function init() {
        loadJsonData();
    }

    function loadJsonData() {
        // list.js 파일이 이미 로드되어 있으므로 직접 list 변수를 사용
        jsonData = list;
        initializeApplication();
    }

    function initializeApplication() {
        readImageList(jsonData, './images');       
        calculateBatchSize();                      
        loadNextBatch();                           
        initializeInfiniteScroll();                
        buildSearchCategories();                   
        initializeSearchFunctionality();    
    }

    function readImageList(data, currentPath) {
        for (let key in data) {
            //깊이가 다른 경우 처리하기 위해 else 제거
            if (data[key].images) {
                processImageItems(data[key].images, key, currentPath);
            }
            if (typeof data[key] === 'object' && data[key] !== null && !data[key].name) {
                const newPath = currentPath + '/' + key;
                readImageList(data[key], newPath);
            }
        }
        categoryList = new Set(Object.keys(jsonData));
        currentList = imageList;
        originalSearchList = [...imageList]; // 초기 상태 설정
    }

    function processImageItems(images, key, currentPath) {
        for (let i = 0; i < images.length; i++) {
            const imagePath = `${currentPath}/${key}/${images[i].name}`;
            imageList.push({
                path: imagePath,                    
                category: currentPath.split('/').pop() || key,  
                filename: images[i].name,           
                tagList: images[i].tag              
            });
        }
    }

    function buildSearchCategories() {
        processImageTags();                       
        processCategoryVowels();                   
    }

    function processImageTags() {
        imageList.forEach(function(item) {
            if (item.tagList) {
                const tagList = item.tagList.includes(',') ? 
                    item.tagList.split(',') : [item.tagList];
                
                tagList.forEach(function(tag) {
                    if (!categories[tag]) {
                        categories[tag] = {
                            count: 0,               
                            items: []               
                        };
                    }
                    categories[tag].count++;
                    categories[tag].items.push(item);
                });
            }
        });
    }

    function processCategoryVowels() {
        Object.keys(categories).forEach(function(category) {
            categories[category].vowel = decomposeKoreanText(category);
        });
    }

    function calculateBatchSize() {
        const $imageList = $('.imageList');
        const containerWidth = $imageList.width();
        const containerHeight = $imageList.height();
        
        const batchRow = Math.floor(containerWidth / CONFIG.ITEM_WIDTH);
        const batchCol = Math.ceil(containerHeight / CONFIG.ITEM_HEIGHT);
        batchSize = batchRow * batchCol;
    }

    function loadNextBatch() {
        if (isLoading || currentIndex >= currentList.length) return;
        isLoading = true;
        const $imageList = $('.imageList');
        const endIndex = Math.min(currentIndex + batchSize, currentList.length);
        for (let i = currentIndex; i < endIndex; i++) {
            const item = currentList[i];
            const $listItem = createImageListItem(item);
            $imageList.append($listItem);
        }
        
        currentIndex = endIndex;
        initializeLazyLoading();
    }

    function createImageListItem(item) {
        const $li = $('<div class="item"></div>');
        const $img = $('<img>', {
            'data-src': item.path,         
            'loading': 'lazy'              
        });
        $li.append($img);
        return $li;
    }

    function initializeInfiniteScroll() {
        $(".imageList").on('scroll', function() {
            if (isLoading) return;
            
            const scrollTop = $(this).scrollTop();           
            const windowHeight = $(this).height();           
            const documentHeight = $(this)[0].scrollHeight;  
            
            if (scrollTop + windowHeight >= documentHeight - CONFIG.SCROLL_THRESHOLD) {
                loadNextBatch();
            }
        });
    }

    function initializeLazyLoading() {
        $('.imageList img').each((i, el) => {
            $(el).Lazy({
                ...CONFIG.LAZY_LOAD_CONFIG,    
                afterLoad: function(el) {
                    handleImageLoad(el);
                }
            });
        });
        isLoading = false;
    }

    function handleImageLoad(img) {
        const $item = $(img).closest('.item');
        if (img.decode) {
            img.decode().then(function() {
                //$item.addClass('loaded');
				gsap.fromTo( $item,{ scale: 0, opacity: 0, }, { scale: 1, opacity: 1,ease: "back.out", duration: 0.5, stagger: 0.02,});
            });
        } else {
            //$item.addClass('loaded');
			gsap.fromTo( $item,{ scale: 0, opacity: 0, }, { scale: 1, opacity: 1,ease: "back.out", duration: 0.5, stagger: 0.02,});
        }
    }

    function initializeSearchFunctionality() {
        initializeSearchInput();           
        initializeSearchArrow();           
        initializeSearchIcon();            
        initializeFilterIcon();            
    }

    function initializeSearchInput() {
        $('.searchBar input').on('keyup', function(event) {
            const searchValue = $(this).val();
            
            if (event.originalEvent.keyCode === 13) {
                performSearch(searchValue);
            } else {
                handleSearchInputChange(searchValue);
            }
        });
    }

    function handleSearchInputChange(searchValue) {
        const $searchBar = $(".searchBar");
        
        if (searchValue.length > 0) {
            $searchBar.addClass('on');
            showSearchSuggestions(searchValue);
        } else {
            $searchBar.removeClass('on');
        }
    }

    function initializeSearchArrow() {
        $('.searchBar .arw').on('click', function() {
            $('.searchBar').toggleClass('on');
        });
    }

    function initializeSearchIcon() {
        $('.searchBar .searchIcon').on('click', function() {
            const searchValue = $('.searchBar input').val();
            performSearch(searchValue);
        });
    }

    //filter
    function initializeFilterIcon() {
        $('.specBtn .filterIcon').on('click', function() {
            const $specBtn = $('.specBtn');
            $specBtn.toggleClass('filterActive');
        });
        const $filterList = $('.filterList');
        categoryList.forEach(function(category){
            const $li = $(`<li>${category}</li>`);
            $filterList.append($li);
        });
        $('.filterList li').on('click', function(){
            $(this).toggleClass('on');
            applyCategoryFilter();
        });
    }

    function applyCategoryFilter() {
        const selectedCategories = [];
        $('.filterList li.on').each(function() {
            selectedCategories.push($(this).text());
        });
        if (selectedCategories.length === 0) {
            currentList = originalSearchList.length > 0 ? originalSearchList : imageList;
        } else {
            currentList = currentList.filter(function(item) {
                return selectedCategories.includes(item.category);
            });
        }
        $(".imageList").empty();
        currentIndex = 0;
        loadNextBatch();
        initializeLazyLoading();
    }

    //search
    function showSearchSuggestions(searchValue) {
        const vowel = decomposeKoreanText(searchValue);
        const $searchList = $('.searchList');
        
        $searchList.empty();
        
        const matchingCategories = findMatchingCategories(vowel);
        
        if (matchingCategories.length > 0) {
            matchingCategories.forEach(category => {
                const $div = createSearchListItem(category);
                $searchList.append($div);
            });
            
            bindSearchItemClickEvents();
        } else {
            $searchList.append('<div class="searchItem noResult">검색 결과가 없습니다.</div>');
        }
    }

    function findMatchingCategories(vowel) {
        const matches = [];
        Object.keys(categories).forEach(function(category) {
            const categoryVowel = categories[category].vowel.toLowerCase();
            if (categoryVowel.includes(vowel.toLowerCase())) {
                matches.push(category);
            }
        });
        return matches;
    }

    function createSearchListItem(category) {
        return $(`<div class="searchItem"><span>${category}</span><em>(${categories[category].count})</em></div>`);
    }

    function bindSearchItemClickEvents() {
        $('.searchList .searchItem').on('click', function() {
            const text = $(this).find("span").text();
            performSearch(text);
        });
    }

    function performSearch(searchText) {
        isLoading = false;
        const vowel = decomposeKoreanText(searchText);
        const names = [];
        
        $('.searchBar').removeClass('on');
        $('.searchBar input').val(searchText);
        $(".imageList").empty();
        currentIndex = 0;
        
        Object.keys(categories).forEach(function(category) {
            if (categories[category].vowel.includes(vowel)) {
                names.push(category);
            }
        });
        
        currentList = [];
        
        imageList.forEach(function(item) {
            if (item.tagList) {
                const tagList = item.tagList.includes(',') ? 
                    item.tagList.split(',') : [item.tagList];

                const hasMatchingTag = tagList.some(tag => names.includes(tag));
                if (hasMatchingTag) {
                    currentList.push(item);
                }
            }
        });
        
        // 검색 결과를 원본 검색 결과로 저장
        originalSearchList = [...currentList];
        
        loadNextBatch();
        initializeLazyLoading();
    }

    //common
    function decomposeKoreanText(text) {
        const consonants = ['ㄱ', 'ㄲ', 'ㄴ', 'ㄷ', 'ㄸ', 'ㄹ', 'ㅁ',
                           'ㅂ', 'ㅃ', 'ㅅ', 'ㅆ', 'ㅇ', 'ㅈ', 'ㅉ',
                           'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
        const vowels = ['ㅏ', 'ㅐ', 'ㅑ', 'ㅒ', 'ㅓ', 'ㅔ', 'ㅕ',
                       'ㅖ', 'ㅗ', 'ㅘ', 'ㅙ', 'ㅚ', 'ㅛ', 'ㅜ',
                       'ㅝ', 'ㅞ', 'ㅟ', 'ㅠ', 'ㅡ', 'ㅢ', 'ㅣ'];
        const finalConsonants = ['', 'ㄱ', 'ㄲ', 'ㄳ', 'ㄴ', 'ㄵ', 'ㄶ',
                                'ㄷ', 'ㄹ', 'ㄺ', 'ㄻ', 'ㄼ', 'ㄽ', 'ㄾ',
                                'ㄿ', 'ㅀ', 'ㅁ', 'ㅂ', 'ㅄ', 'ㅅ', 'ㅆ',
                                'ㅇ', 'ㅈ', 'ㅊ', 'ㅋ', 'ㅌ', 'ㅍ', 'ㅎ'];
    
        const hangulBase = 44032;  
        let result = '';
        
        for (let i = 0; i < text.length; i++) {
            let unicode = text.charCodeAt(i);
            
            if (unicode <= 12643) {
                result += text[i];
            } else {
                unicode = unicode - hangulBase;
                const consonantIndex = parseInt(unicode / 588);
                const vowelIndex = parseInt((unicode - (consonantIndex * 588)) / 28);
                const finalConsonantIndex = parseInt(unicode % 28);
                
                result += consonants[consonantIndex] + vowels[vowelIndex] + finalConsonants[finalConsonantIndex];
            }
        }
        return result;
    }

    init();
});