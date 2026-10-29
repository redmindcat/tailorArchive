    let tl = gsap.timeline();
    let jsonData;
    let imageList = [];
    let sumnailList = [];
    let currentList = [];
    let originalSearchList = [];
    let categories = {};
    let categoryList = [];
    // let fuse;
    let filterNames;
    let lastKeyboardEventTime = 0; // 마지막 키보드 이벤트 시간
    let isKeyboardNavigation = false; // 키보드 네비게이션 플래그
    let sumnailFuse;
    let imageListFuse;

    // const sumnailFuseOptions = {keys: ['sub'], includeScore: true, threshold: 0.2};
    // const imageListFuseOptions = {keys: ['tag'], includeScore: true, threshold: 0.2};
    loadJsonData();

    function loadJsonData() {
        jsonData = list;
        initializeApplication();
        buildSearchCategories();                   
        initializeSearchFunctionality();  
        // sumnailFuse = new Fuse(sumnailList, sumnailFuseOptions);
        // imageListFuse = new Fuse(imageList, imageListFuseOptions);
    }

    function initializeApplication() {
        readImageList(jsonData, './images');
        insertImageList();
    }

    function readImageList(data, currentPath) {
        for (let key in data) {
            const item = data[key];
            // 이미지 세트가 있는 경우 (set1, set2 등)
            if (item.set1) {
                processImageItems(item, key, currentPath, item.tag);
            }
            // 카테고리가 있는 경우 (하위 카테고리들)
            else if (item.category) {
                const newPath = currentPath + '/' + key;
                readImageList(item.category, newPath);
            }
        }
        
        // 최상위 카테고리 이름들을 필터 목록에 추가
        if (currentPath === './images') {
            filterNames = new Set(Object.keys(jsonData));
        }
        
        currentList = sumnailList;
        originalSearchList = [...sumnailList]; // 초기 상태 설정
    }

    function processImageItems(images, key, currentPath, tag = '') {
        let firstKey;
        let setNum = 1;
        for(firstKey in images){
            let cate = {
                name: images.name,
                images: [],
                tag: images[firstKey].tag
            }
            if(firstKey === 'name') continue;
            const set = images[firstKey].images;
            const name = images.name[1];
            if(set.length < 2) continue;
            set.forEach(image => {
                if(!image.name) return;
                const pathParts = currentPath.split('/');
                const actualFolder = pathParts[pathParts.length - 1]
                const imagePath = `${currentPath}/${name}/${image.name}`;
                const major = pathParts[pathParts.length - 2];
                const sub = name;
                if(image.thumbnail){
                    sumnailList.push({
                        path: imagePath,                    
                        filename: image.name,
                        major: major,
                        middle: actualFolder,
                        sub: sub,
                        name: images.name,
                        tagList: tag || image.tag || '',
                        setNum: setNum
                    });
                }
                cate.images.push({
                    path: imagePath,
                    filename: image.name,
                    tagList: tag || image.tag || '',
                    major: major,
                    middle: actualFolder,
                    sub: sub,
                    name: images.name,
                    sumnail: image.thumbnail || false,
                    setNum: setNum
                });
            });
            setNum++;
            imageList.push(cate);
        }
    }

    function buildSearchCategories() {
        processImageTags();                       
        processCategoryVowels();
        // 한글 정렬
        const sortedCategories = {};
        Object.keys(categories).sort((a, b) => {
            const isKoreanA = /[ㄱ-ㅎ가-힣]/.test(a);
            const isKoreanB = /[ㄱ-ㅎ가-힣]/.test(b);
            
            if (isKoreanA && !isKoreanB) return -1;
            if (!isKoreanA && isKoreanB) return 1;
            return a.localeCompare(b);
        }).forEach(key => {
            sortedCategories[key] = categories[key];
            categoryList.push({
                name: key,
                count: categories[key].count,
                items: categories[key].items
            });
        });
        categories = sortedCategories;
    }

    function processImageTags() {
        imageList.forEach(function(item) {
            if (item.tag) {
                const tagList = item.tag.includes(',') ? 
                    item.tag.split(',').map(tag => tag.trim()) : [item.tag.trim()];
                
                tagList.forEach(function(tag) {
                    //영어 제외
                    // if(/^[ㄱ-ㅎ가-힣]+$/.test(tag)){
                        if (!categories[tag]) {
                            categories[tag] = {
                                count: 0,               
                                items: []               
                            };
                        }
                        categories[tag].count++;
                        categories[tag].items.push(item);
                    // }
                });
            }
        });
    }

    function processCategoryVowels() {
        Object.keys(categories).forEach(function(category) {
            const isKorean = /[ㄱ-ㅎ가-힣]/.test(category);
            categories[category].vowel = isKorean ? decomposeKoreanText(category) : category;
        });
    }

    function insertImageList(){
        $(".imageList").empty();
        for(let i = 0; i < currentList.length; i++){
            if($(".imageList .column").length === 0 || $(".imageList .column").last().find(".item").length === 10){
                const $div = $('<div class="column"></div>');
                $(".imageList").append($div);
            }
            const item = currentList[i];
            const $div = $('<div class="item"></div>').attr("data-collection", item.name[0]).attr("data-set", item.setNum);
            $div.append(`<img src="${item.path}">`);
            $(".imageList .column").last().append($div);
        }
		for(let i = 0; i < currentList.length; i++){
            if($(".imageList .column").length === 0 || $(".imageList .column").last().find(".item").length === 10){
                const $div = $('<div class="column"></div>');
                $(".imageList").append($div);
            }
            const item = currentList[i];
            const $div = $('<div class="item"></div>').attr("data-collection", item.name[0]).attr("data-set", item.setNum);
            $div.append(`<img src="${item.path}">`);
            $(".imageList .column").last().append($div);
        }
    }

    //search
    function initializeSearchFunctionality() {
        initializeSearchInput();           
        //initializeSearchArrow();           
        //initializeSearchIcon();            
        initializeFilterIcon();            
        //initializeSearchListEvents(); // 이벤트 위임으로 한 번만 바인딩
    }

    function initializeSearchInput() {
        $('.searchBar input').on('focus', function() {
            $('.searchBar').addClass('on');
            const searchValue = $(this).val();
            if(searchValue === ''){
                $('.searchBar').addClass('on');
                showSearchSuggestions(searchValue);
                return;
            }else{
                handleSearchInputChange(searchValue);
            }
        });

        $(".searchBar input").get(0).addEventListener('keyup', function(event){
            const searchValue = $(this).val();
            const keyCode = event.code;
            if(event.key === 'Process' && (keyCode === 'ArrowUp' || keyCode === 'ArrowDown')) return;
            if(searchValue === '' && keyCode != 'Enter' && keyCode != 'ArrowUp' && keyCode != 'ArrowDown'){
                $('.searchBar').addClass('on');
                showSearchSuggestions(searchValue);
                return;
            }
            
            if(keyCode === 'Enter' || keyCode === 'ArrowUp' || keyCode === 'ArrowDown'){
                SearchSpecialKey(event);
            }else{
                handleSearchInputChange(searchValue);
            }
        });

        $('.searchBar input').on('blur', function() {
            $('.searchBar').removeClass('on');
        });
    }

    function SearchSpecialKey(event){
        let searchItemHover = $(".searchList .searchItem.hover");
        const keyCode = event.code;
        switch(keyCode){
            case 'Enter':
                if($(".searchList .searchItem.hover").length > 0){
                    performSearch($(".searchList .searchItem.hover").find("span").text());
                }else{
                    if($('.searchBar input').val() == ''){
                        performSearch('');
                    }else{
                        performSearch($('.searchBar input').val(), true);
                    }
                }
                $(event.target).blur();
                break;
            case 'ArrowUp':
                if(searchItemHover.length > 0 && searchItemHover.prev().length > 0){
                    searchItemHover.removeClass("hover").prev().addClass('hover');
                    searchItemHoverScroll(searchItemHover.prev());
                }else{
                    $(".searchList .searchItem").removeClass("hover").last().addClass('hover');
                    searchItemHoverScroll($(".searchList .searchItem").last());
                }
                searchItemHover = $(".searchList .searchItem.hover");
                // $(".searchBar input").val(searchItemHover.find("span").text());
                break;
            case 'ArrowDown':
                if(searchItemHover.length > 0 && searchItemHover.next().length > 0){
                    searchItemHover.removeClass("hover").next().addClass('hover');
                    searchItemHoverScroll(searchItemHover.next());
                }else{
                    $(".searchList .searchItem").removeClass("hover").first().addClass('hover');
                    searchItemHoverScroll($(".searchList .searchItem").first());
                }
                searchItemHover = $(".searchList .searchItem.hover");
                // $(".searchBar input").val(searchItemHover.find("span").text());
                break;
        }
    }

    function searchItemHoverScroll(hoverItem){
        const searchList = $(".searchList");
        const searchListOffsetTop = searchList.offset().top;
        const searchListHeight = searchList.height();
        const hoverItemOffsetTop = hoverItem.offset().top;
        const hoverItemHeight = hoverItem.height();
        const hoverItemOffsetBottom = hoverItemOffsetTop + hoverItemHeight;
        const searchListOffsetBottom = searchListOffsetTop + searchListHeight;
        if(hoverItemOffsetBottom > searchListOffsetBottom){
            searchList.scrollTop(searchList.scrollTop() + (hoverItemOffsetBottom - searchListOffsetBottom));
        }else if(hoverItemOffsetTop < searchListOffsetTop){
            searchList.scrollTop(searchList.scrollTop() - (searchListOffsetTop - hoverItemOffsetTop));
        }
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

    function initializeSearchListEvents() {
        $('.searchList').on('mousedown', '.searchItem', function(e) {
            e.preventDefault();
            if($(this).hasClass('allView')){
                performSearch('');
            }else{
                const text = $(this).find("span").text();
                performSearch(text);
            }
            $(".searchBar input").blur();
        });
        
        $('.searchList').on('mouseenter', '.searchItem', function(e) {
            const timeDiff = e.timeStamp - lastKeyboardEventTime;
            const isKeyboardTriggered = timeDiff < 500;
            if (!isKeyboardTriggered) {
                $(".searchList .searchItem.hover").removeClass("hover");
                $(this).addClass('hover');
            }
            
        });
        
        $('.searchList').on('mouseleave', '.searchItem', function() {
            $(this).removeClass('hover');
        });
    }

    function showSearchSuggestions(searchValue) {
        const vowel = decomposeKoreanText(searchValue);
        const $searchList = $('.searchList');
        $searchList.empty();
        
        const matchingCategories = findMatchingCategories(vowel);
        if (matchingCategories.length > 0) {
            matchingCategories.forEach((category, i) => {
                if( i == 0){
                    $searchList.append(`<div class="searchItem allView"><span>전체보기</span></div>`);
                }
                const $div = createSearchListItem(category);
                $searchList.append($div);
                
            });
        } else {
            $searchList.append(`<div class="searchItem allView"><span>전체보기</span></div>`);
        }
    }

    function createSearchListItem(category) {
        return $(`<div class="searchItem"><span>${category}</span><em>(${categories[category].count})</em></div>`);
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

    function performSearch(searchText, listAllSearch = false) {
        isLoading = false;
        currentList = [];
        if (listAllSearch) {
            $('.searchList .searchItem span').each(function() {
                const categoryText = $(this).text();
                if(categoryText === '전체보기') return;
                if (categories[categoryText]) {
                    const itemArray = categories[categoryText].items;
                    itemArray.forEach(item => {
                        const sumnail = item.images.find(image => image.sumnail === 'true');
                        currentList = currentList.concat(sumnail);
                    });
                }
            });
        } else {
            // 온전한 이름 검색
            // 기존 검색 로직 유지
            if(searchText){
                // const searching = fuse.search(searchText);
                const searching = categories[searchText];
                searching.items.forEach(function(el){
                    const sumnail = el.images.find(image => image.sumnail === 'true');
                    currentList = currentList.concat(sumnail);
                });
            }else {
                currentList = sumnailList;
            }
        }
        $('.searchBar').removeClass('on');
        $('.searchBar input').val(searchText);
        $(".imageList").empty();
        currentIndex = 0;
        // app.canvas.clearCanvas();
        // 검색 결과를 원본 검색 결과로 저장
        originalSearchList = [...sumnailList];
        
        insertImageList();
        //introAniStart();
		//xpReStart();
    }

    //filter
    function initializeFilterIcon() {
        $('.specBtn .filterIcon').on('click', function() {
            const $specBtn = $('.specBtn');
            $specBtn.toggleClass('filterActive');
        });
        const $filterList = $('.filterList');
        filterNames.forEach(function(category){
            const $li = $(`<li>${category}</li>`);
            $filterList.append($li);
        });
        $('.filterList li').on('click', function(){
            $(this).toggleClass('on');
            let $downloadBtn = $('.downloadBtn');
            if($downloadBtn.hasClass('on')){
                $downloadBtn.removeClass('on');
                $downloadBtn.find('em').text('');
            }
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
            currentList = originalSearchList.filter(function(item) {
                return selectedCategories.includes(item.path.split('/')[2]);
            });
        }
        $(".imageList").empty();
        // app.canvas.clearCanvas();
        currentIndex = 0;
        insertImageList();
        //introAniStart();
		//xpReStart();
    }

    //download
    function initializeDownloadButton() {
        $(".downloadBtn").on('click', function() {
            let selectedImages = $(".imageList .item.on");
            if(selectedImages.length === 0) return;
            
            if(selectedImages.length === 1){
                let imagePath = selectedImages.find("img").attr("src");
                let link = document.createElement('a');
                link.href = imagePath;
                link.download = imagePath.split('/').pop();
                link.click();
            }else{
                let zip = new JSZip();
                let downloadPromises = [];
                
                selectedImages.each(function() {
                    let imagePath = $(this).find("img").attr("src");
                    let imageName = imagePath.split('/').pop();
                    let promise = fetch(imagePath)
                        .then(response => response.blob())
                        .then(blob => {
                            zip.file(imageName, blob);
                        })
                        .catch(error => {
                            console.error('이미지 다운로드 실패:', imagePath, error);
                        });
                    
                    downloadPromises.push(promise);
                });
                
                Promise.all(downloadPromises).then(() => {
                    zip.generateAsync({type: "blob"}).then(function(content) {
                        let url = URL.createObjectURL(content);
                        let link = document.createElement('a');
                        link.href = url;
                        link.download = 'selected_images.zip';
                        link.click();
                        
                        setTimeout(() => {
                            URL.revokeObjectURL(url);
                        }, 100);
                    });
                });
            }
        });
    }

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

    function insertViewImage(item){
        const src = $(item).attr('src');
        const major = src.split('/')[2];
        const middle = src.split('/')[3];
        const sub = src.split('/')[4];
        const setNum = $(item).parent().attr('data-set');
        const thumbSub = list[major].category[middle].category[sub];
        const thumbList = thumbSub["set"+setNum].images;
        thumbList.forEach((el, i) => {
            //if(i === 0) return;
            const thumbSrc = `./images/${major}/${middle}/${sub}/${el.name}`;
            const thumbItem = $(`<div class="item" data-leng="${thumbSub.name[1]}" data-collection="${thumbSub.name[0]}" data-set="${setNum}" data-index="${i}"><img src="${thumbSrc}"></div>`);
            const containerItem = thumbItem.clone(true);
            $(".focusThumb").append(containerItem);
            $(".dtCarousel").append(thumbItem);
        });
    }