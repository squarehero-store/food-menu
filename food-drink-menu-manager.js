window.onload = function () {
    console.info('🚀 SquareHero.store Food & Drink Menu Manager plugin loaded');

    document.body.classList.add('menu-page');

    const foodMenuMeta = document.querySelector('meta[squarehero-plugin="food-menu"]');
    const isEnabled = foodMenuMeta ? foodMenuMeta.getAttribute('enabled') === 'true' : false;

    if (isEnabled) {
        const foodMenuContainer = document.getElementById('foodMenuContainer');

        foodMenuContainer.innerHTML = `
            <div data-squarehero="restaurant-menu">
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

        const sheetUrl = foodMenuMeta.getAttribute('sheet-url');

        if (sheetUrl) {
            Papa.parse(sheetUrl, {
                download: true,
                header: true,
                complete: function (results) {
                    const rows = results.data;

                    const menuTabs = document.getElementById('menuTabs');
                    const menuItemsWrapper = document.getElementById('menuItemsWrapper');

                    const uniqueMenus = [...new Set(rows.map(row => row.Menu).filter(menu => menu.trim() !== ''))];

                    uniqueMenus.forEach((menuType, index) => {
                        const tabButton = document.createElement('button');
                        tabButton.textContent = menuType;
                        tabButton.classList.add('sh-button');
                        tabButton.onclick = function () {
                            displayMenu(menuType);
                            setActiveTab(tabButton);
                            scrollToTab(tabButton);
                        };
                        menuTabs.appendChild(tabButton);

                        if (index === 0) {
                            tabButton.classList.add('active');
                        }
                    });

                    toggleSwipeInstruction();

                    function displayMenu(menuType) {
                        menuItemsWrapper.innerHTML = '';

                        const mainCategoryTitle = document.createElement('h2');
                        mainCategoryTitle.textContent = menuType;
                        mainCategoryTitle.classList.add('menu-main-category');
                        menuItemsWrapper.appendChild(mainCategoryTitle);

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
                                const { Title, Price, Description, 'Price Description': PriceDescription, Notes } = row;

                                if (Title) {
                                    const menuItem = document.createElement('div');
                                    menuItem.classList.add('menu-item');

                                    const titlePriceContainer = document.createElement('div');
                                    titlePriceContainer.classList.add('menu-item--title');

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

                                    if (PriceDescription) {
                                        const priceDescriptionElem = document.createElement('p');
                                        priceDescriptionElem.innerHTML = PriceDescription.replace(/\n/g, '<br>');
                                        priceDescriptionElem.classList.add('menu-item--price-description');
                                        menuItem.appendChild(priceDescriptionElem);
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

                    function getQueryParam(param) {
                        const urlParams = new URLSearchParams(window.location.search);
                        return urlParams.get(param);
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

                    const defaultMenu = uniqueMenus[0];
                    const requestedMenu = getQueryParam('menu');
                    const menuToDisplay = uniqueMenus.find(menu => menu.toLowerCase() === (requestedMenu ? requestedMenu.toLowerCase() : '').toLowerCase()) || defaultMenu;

                    const tabs = menuTabs.getElementsByTagName('button');
                    for (let i = 0; i < tabs.length; i++) {
                        if (tabs[i].textContent.toLowerCase() === menuToDisplay.toLowerCase()) {
                            setActiveTab(tabs[i]);
                            scrollToTab(tabs[i]);
                        }
                    }
                    displayMenu(menuToDisplay);
                },
                error: function (error, file) {
                    console.error('Error parsing CSV:', error, file);
                }
            });
        } else {
            console.error('No sheet URL provided in the meta tag.');
        }
    }
};