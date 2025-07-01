(function() {
    // Check if this is a crawler or bot
    function isCrawler() {
        const userAgent = navigator.userAgent.toLowerCase();
        const crawlers = [
            'googlebot', 'bingbot', 'slurp', 'duckduckbot', 'baiduspider',
            'yandexbot', 'facebookexternalhit', 'twitterbot', 'rogerbot',
            'linkedinbot', 'embedly', 'quora link preview', 'showyoubot',
            'outbrain', 'pinterest', 'developers.google.com/+/web/snippet'
        ];
        return crawlers.some(crawler => userAgent.includes(crawler));
    }

    // Add static content for crawlers
    function addStaticMenuContent(container) {
        const staticContent = `
            <div class="static-menu-content">
                <h1>Menu</h1>
                <p>Explore our selection of food and beverages.</p>
                
                <div class="menu-section">
                    <h2>Menu Categories</h2>
                    <p>Our menu features various categories of items to choose from.</p>
                </div>
                
                <div class="menu-section">
                    <h3>Quality Food & Beverages</h3>
                    <p>Browse our complete menu selection featuring various food and drink options.</p>
                </div>
                
                <noscript>
                    <div class="noscript-menu">
                        <h3>Enable JavaScript for Full Menu</h3>
                        <p>Please enable JavaScript in your browser to view our complete interactive menu with prices and detailed descriptions.</p>
                    </div>
                </noscript>
            </div>
        `;
        
        if (container) {
            container.insertAdjacentHTML('afterbegin', staticContent);
        }
    }

    function initializeMenu() {
        console.info('🚀 SquareHero.store Food & Drink Menu Manager plugin loaded');

        document.body.classList.add('menu-page');

        const foodMenuMeta = document.querySelector('meta[squarehero-plugin="food-menu"]');
        const isEnabled = foodMenuMeta ? foodMenuMeta.getAttribute('enabled') === 'true' : false;

        // If no meta tag is found but the container exists, enable by default
        const foodMenuContainer = document.getElementById('foodMenuContainer');
        if (foodMenuContainer && !foodMenuMeta) {
            console.info('No meta tag found, but foodMenuContainer exists. Enabling menu...');
            initMenu(foodMenuContainer);
            return;
        }

        if (isEnabled && foodMenuContainer) {
            initMenu(foodMenuContainer);
        } else if (foodMenuContainer) {
            // If menu is not enabled, add static content for crawlers
            addStaticMenuContent(foodMenuContainer);
        }
    }

    function initMenu(foodMenuContainer) {
        // Set default attributes for the foodMenuContainer
        foodMenuContainer.setAttribute('data-squarehero', 'section-name');
        foodMenuContainer.setAttribute('sh-section', 'sh-menu');

        // Get the meta tag to check for style
        const foodMenuMeta = document.querySelector('meta[squarehero-plugin="food-menu"]');
        
        // Get the style from the meta tag, default to 'Modern' if not specified
        let style = 'Modern'; // Default to Modern
        if (foodMenuMeta && foodMenuMeta.hasAttribute('style')) {
            style = foodMenuMeta.getAttribute('style');
        }

        // Log the style for debugging
        console.log('Menu style:', style);

        // Check if this is a crawler and add static content first
        if (isCrawler()) {
            addStaticMenuContent(foodMenuContainer);
        }

        // Check if container already has fallback content (for SEO)
        const hasExistingContent = foodMenuContainer.innerHTML.trim() !== '';
        
        if (!hasExistingContent) {
            // Add immediate fallback content for crawlers
            foodMenuContainer.innerHTML = `
                <div data-squarehero="restaurant-menu" class="layout--${style.toLowerCase()}">
                    <div class="menu-fallback-content">
                        <h2>Menu</h2>
                        <p>Loading menu options...</p>
                        <noscript>
                            <p>Please enable JavaScript to view our interactive menu, or contact us to learn about our current offerings.</p>
                        </noscript>
                    </div>
                    <div class="sh-loading-spinner">
                        <div class="spinner"></div>
                    </div>
                    <div class="swipe-instruction-container" style="display: none;">
                        <p class="swipe-instruction">Swipe for more categories</p>
                        <svg class="swipe-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="10" fill="none" viewBox="0 0 16 10">
                            <path stroke="#000" stroke-width="2" d="m1 1 7 7 7-7"/>
                        </svg>
                    </div>
                    <div class="menu-tabs" id="menuTabs"></div>
                    <div class="menu-items--wrapper" id="menuItemsWrapper"></div>
                </div>
            `;
        } else {
            // Content exists, just add our dynamic elements
            const existingContent = foodMenuContainer.innerHTML;
            foodMenuContainer.innerHTML = `
                <div data-squarehero="restaurant-menu" class="layout--${style.toLowerCase()}">
                    ${existingContent}
                    <div class="sh-loading-spinner" style="display: none;">
                        <div class="spinner"></div>
                    </div>
                    <div class="swipe-instruction-container" style="display: none;">
                        <p class="swipe-instruction">Swipe for more categories</p>
                        <svg class="swipe-arrow" xmlns="http://www.w3.org/2000/svg" width="16" height="10" fill="none" viewBox="0 0 16 10">
                            <path stroke="#000" stroke-width="2" d="m1 1 7 7 7-7"/>
                        </svg>
                    </div>
                    <div class="menu-tabs" id="menuTabs"></div>
                    <div class="menu-items--wrapper" id="menuItemsWrapper"></div>
                </div>
            `;
        }

        const sheetUrl = foodMenuMeta ? foodMenuMeta.getAttribute('sheet-url') : null;

        if (sheetUrl) {
            processSheetData(sheetUrl);
        } else {
            console.error('No sheet URL provided in the meta tag.');
            
            // Try to find the sheet URL from a data attribute on the container
            const containerSheetUrl = foodMenuContainer.getAttribute('data-sheet-url');
            if (containerSheetUrl) {
                console.info('Found sheet URL in container data attribute');
                processSheetData(containerSheetUrl);
            } else {
                // Default to a demo sheet if nothing is found
                console.info('Using demo sheet');
                const demoSheetUrl = "https://docs.google.com/spreadsheets/d/e/2PACX-1vSS9YRIvTPo-Gd_gWj2hBJbxlrK5Z4qfZzHR2AJUlbokJlLVqSrYxU2DPr3ZgR3S0aQxITWbGUQ5fQ9/pub?output=csv";
                processSheetData(demoSheetUrl);
            }
        }
    }

    function processSheetData(sheetUrl) {
        const loadingSpinner = document.querySelector('.sh-loading-spinner');
        const menuItemsWrapper = document.getElementById('menuItemsWrapper');
        const menuTabs = document.getElementById('menuTabs');
        const fallbackContent = document.querySelector('.menu-fallback-content');

        // Show loading spinner if no existing content
        if (loadingSpinner && !fallbackContent) {
            loadingSpinner.style.display = 'block';
        }

        // Define a default menu to display if URL param is provided
        let menuToDisplay = getQueryParam('menu') || null;

        // Add immediate meta tags for better SEO while loading
        addBasicSEOMetaTags();

        Papa.parse(sheetUrl, {
            download: true,
            header: true,
            complete: function (results) {
                const rows = results.data;

                const uniqueMenus = [...new Set(rows.map(row => row.Menu).filter(menu => menu.trim() !== ''))];

                // If menuToDisplay not specified in URL, use the first menu
                if (!menuToDisplay || !uniqueMenus.includes(menuToDisplay)) {
                    menuToDisplay = uniqueMenus[0];
                }

                uniqueMenus.forEach((menuType, index) => {
                    const tabButton = document.createElement('button');
                    tabButton.textContent = menuType;
                    tabButton.classList.add('sh-button');
                    tabButton.onclick = function () {
                        menuItemsWrapper.style.opacity = '0';
                        setTimeout(() => {
                            displayMenu(menuType);
                            setActiveTab(tabButton);
                            scrollToTab(tabButton);
                            menuItemsWrapper.style.opacity = '1';
                        }, 300);
                    };
                    menuTabs.appendChild(tabButton);

                    if (index === 0) {
                        tabButton.classList.add('active');
                    }
                });

                toggleSwipeInstruction();

                function displayMenu(menuType) {
                    menuItemsWrapper.innerHTML = '';

                    // Create a wrapper for the title and description
                    const menuHeaderWrapper = document.createElement('div');
                    menuHeaderWrapper.classList.add('menu-header-wrapper');

                    const mainCategoryTitle = document.createElement('h2');
                    mainCategoryTitle.textContent = menuType;
                    mainCategoryTitle.classList.add('menu-main-category');
                    menuHeaderWrapper.appendChild(mainCategoryTitle);

                    // Find the menu description
                    const menuDescription = rows
                        .filter(row => row.Menu === menuType)
                        .find(row => row['Menu Description']?.trim() !== '')
                        ?.['Menu Description'];

                    if (menuDescription) {
                        const descriptionElem = document.createElement('p');
                        descriptionElem.textContent = menuDescription;
                        descriptionElem.classList.add('menu-description');
                        menuHeaderWrapper.appendChild(descriptionElem);
                    }

                    menuItemsWrapper.appendChild(menuHeaderWrapper);

                    const menuGroups = groupBySubCategory(rows.filter(row => row.Menu === menuType));

                    for (const [subCategory, items] of Object.entries(menuGroups)) {
                        const subCategoryContainer = document.createElement('div');
                        subCategoryContainer.classList.add('menu-items--subcategory');

                        if (subCategory !== 'Other') {
                            const subCategoryElem = document.createElement('h3');
                            subCategoryElem.textContent = subCategory;
                            subCategoryContainer.appendChild(subCategoryElem);
                        }

                        items.forEach((row) => {
                            const { Title, Price, Description, Mods, Notes } = row;

                            if (Title) {
                                const menuItem = document.createElement('div');
                                menuItem.classList.add('menu-item');

                                const titlePriceContainer = document.createElement('div');
                                titlePriceContainer.classList.add('menu-item--title');
                                if (!Price || Price.trim() === '') {
                                    titlePriceContainer.classList.add('no-price');
                                }

                                const titleElem = document.createElement('h4');
                                titleElem.textContent = Title;
                                titlePriceContainer.appendChild(titleElem);

                                if (Notes) {
                                    const notesElem = document.createElement('span');
                                    notesElem.textContent = ` (${Notes})`;
                                    notesElem.classList.add('notes');
                                    titleElem.appendChild(notesElem);
                                }

                                if (Price) {
                                    const priceElem = document.createElement('span');
                                    priceElem.textContent = Price;
                                    priceElem.classList.add('price');
                                    titlePriceContainer.appendChild(priceElem);
                                }

                                menuItem.appendChild(titlePriceContainer);

                                if (Description) {
                                    const descriptionElem = document.createElement('p');
                                    descriptionElem.innerHTML = Description.replace(/\n/g, '<br>');
                                    descriptionElem.classList.add('menu-item--description');
                                    menuItem.appendChild(descriptionElem);
                                }

                                if (Mods) {
                                    const modsElem = document.createElement('p');
                                    modsElem.innerHTML = Mods.replace(/\n/g, '<br>');
                                    modsElem.classList.add('menu-item--mods');
                                    menuItem.appendChild(modsElem);
                                }

                                subCategoryContainer.appendChild(menuItem);
                            }
                        });

                        menuItemsWrapper.appendChild(subCategoryContainer);
                    }
                }

                function groupBySubCategory(rows) {
                    return rows.reduce((acc, row) => {
                        const subCategory = row['Sub Category'] || 'Other';
                        if (!acc[subCategory]) {
                            acc[subCategory] = [];
                        }
                        acc[subCategory].push(row);
                        return acc;
                    }, {});
                }

                function setActiveTab(tab) {
                    const tabs = menuTabs.getElementsByTagName('button');
                    for (let i = 0; i < tabs.length; i++) {
                        tabs[i].classList.remove('active');
                    }
                    tab.classList.add('active');
                }

                function scrollToTab(tab) {
                    const menuTabsRect = menuTabs.getBoundingClientRect();
                    const tabRect = tab.getBoundingClientRect();
                    const offset = 6 * window.innerWidth / 100;

                    const scrollPosition = tabRect.left - menuTabsRect.left - offset;

                    const maxScrollPosition = menuTabs.scrollWidth - menuTabs.clientWidth;

                    menuTabs.scrollTo({
                        left: Math.min(maxScrollPosition, menuTabs.scrollLeft + scrollPosition),
                        behavior: 'smooth'
                    });
                }

                function isSwipeNecessary() {
                    const menuTabs = document.getElementById('menuTabs');
                    const totalTabsWidth = Array.from(menuTabs.children).reduce((total, tab) => total + tab.offsetWidth, 0);
                    return totalTabsWidth > window.innerWidth;
                }

                function toggleSwipeInstruction() {
                    const swipeInstructionContainer = document.querySelector('.swipe-instruction-container');
                    if (isSwipeNecessary()) {
                        swipeInstructionContainer.style.display = 'flex';
                    } else {
                        swipeInstructionContainer.style.display = 'none';
                    }
                }

                window.addEventListener('resize', toggleSwipeInstruction);

                function addStructuredData(rows, uniqueMenus) {
                    // Create menu items for JSON-LD
                    const menuItems = rows.filter(row => row.Title).map(item => {
                        // Format the price properly for structured data
                        let formattedPrice = item.Price ? item.Price.trim() : "";
                        
                        // For prices with slashes or multiple options, use the first price
                        if (formattedPrice.includes('/')) {
                            formattedPrice = formattedPrice.split('/')[0].trim();
                        }
                        
                        // Now extract only numbers and decimal points for the structured data
                        const numericPrice = formattedPrice.replace(/[^0-9.]/g, '');
                        
                        return {
                            "@type": "MenuItem",
                            "name": item.Title,
                            "description": item.Description || "",
                            "offers": {
                                "@type": "Offer",
                                "price": numericPrice,
                                "priceCurrency": "USD" // Change this to your currency
                            }
                        };
                    });
                    
                    const structuredData = {
                        "@context": "https://schema.org",
                        "@type": "Restaurant",
                        "menu": {
                            "@type": "Menu",
                            "hasMenuSection": uniqueMenus.map(menuType => {
                                return {
                                    "@type": "MenuSection",
                                    "name": menuType,
                                    "hasMenuItem": menuItems.filter(item => 
                                        rows.find(row => 
                                            row.Title === item.name && row.Menu === menuType
                                        )
                                    )
                                };
                            })
                        }
                    };
                    
                    const script = document.createElement('script');
                    script.type = 'application/ld+json';
                    script.text = JSON.stringify(structuredData);
                    document.head.appendChild(script);
                }

                function addSEOMetaTags(rows, uniqueMenus) {
                    const menuDescription = uniqueMenus.join(', ');
                    
                    // Create meta description if it doesn't exist
                    if (!document.querySelector('meta[name="description"]')) {
                        const metaDescription = document.createElement('meta');
                        metaDescription.name = 'description';
                        metaDescription.content = `Our menu features: ${menuDescription}. Browse our full selection of dishes and drinks.`;
                        document.head.appendChild(metaDescription);
                    }
                }

                function addBasicSEOMetaTags() {
                    // Add basic meta tags immediately for better SEO
                    if (!document.querySelector('meta[name="description"]')) {
                        const metaDescription = document.createElement('meta');
                        metaDescription.name = 'description';
                        metaDescription.content = 'Browse our menu featuring quality food and beverage options.';
                        document.head.appendChild(metaDescription);
                    }
                    
                    // Add Open Graph tags for social sharing
                    if (!document.querySelector('meta[property="og:type"]')) {
                        const ogType = document.createElement('meta');
                        ogType.setAttribute('property', 'og:type');
                        ogType.content = 'restaurant.menu';
                        document.head.appendChild(ogType);
                    }
                }

                // Add structured data and SEO meta tags
                addStructuredData(rows, uniqueMenus);
                addSEOMetaTags(rows, uniqueMenus);

                // Initial menu display
                displayMenu(menuToDisplay);
                
                // Hide fallback content and loading spinner immediately, show content
                if (fallbackContent) {
                    fallbackContent.style.display = 'none';
                }
                
                if (loadingSpinner) {
                    loadingSpinner.style.opacity = '0';
                    setTimeout(() => {
                        loadingSpinner.style.display = 'none';
                    }, 200);
                }
                
                // Show menu content immediately
                if (menuItemsWrapper) {
                    menuItemsWrapper.style.opacity = '1';
                    menuItemsWrapper.style.display = 'block';
                }
            },
            error: function (error, file) {
                console.error('Error parsing CSV:', error, file);
                
                // Hide loading spinner
                if (loadingSpinner) {
                    loadingSpinner.style.display = 'none';
                }
                
                // Show meaningful error content for crawlers
                if (menuItemsWrapper) {
                    menuItemsWrapper.innerHTML = `
                        <div class="loading-error">
                            <h2>Menu Currently Unavailable</h2>
                            <p>We're sorry, but our menu is temporarily unavailable. Please contact us to learn about our current offerings.</p>
                            <p>We feature fresh, quality dishes and a selection of beverages.</p>
                        </div>
                    `;
                    menuItemsWrapper.style.opacity = '1';
                    menuItemsWrapper.style.display = 'block';
                }
                
                // Still add basic meta tags even on error
                addBasicSEOMetaTags();
            }
        });
    }

    function getQueryParam(param) {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.get(param);
    }

    // Check if document is already loaded
    if (document.readyState === 'loading') {
        document.addEventListener('DOMContentLoaded', initializeMenu);
    } else {
        // DOMContentLoaded has already fired, run immediately
        initializeMenu();
    }
})();