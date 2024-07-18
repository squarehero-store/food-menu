// =================================================
//   ⚡ SquareHero Food & Drink Menu Manager v0.2.3 ⚡
// =================================================

window.onload = function() {
    console.log('Window loaded'); // Log to confirm window load

    // Add 'menu-page' class to the body
    document.body.classList.add('menu-page');

    // Check if the food-menu meta tag is enabled
    const foodMenuMeta = document.querySelector('meta[squarehero-plugin="food-menu"]');
    console.log('foodMenuMeta:', foodMenuMeta); // Log the meta tag

    const isEnabled = foodMenuMeta ? foodMenuMeta.getAttribute('enabled') === 'true' : false;
    console.log('isEnabled:', isEnabled); // Log if the plugin is enabled

    if (isEnabled) {
        const foodMenuContainer = document.getElementById('foodMenuContainer');
        console.log('foodMenuContainer:', foodMenuContainer); // Log the container

        // Create the HTML structure
        foodMenuContainer.innerHTML = `
            <div data-squarehero="restaurant-menu">
                <div class="menu-tabs" id="menuTabs"></div>
                <div class="menu-items--wrapper" id="menuItemsWrapper"></div>
            </div>
        `;

        // Get the Google Sheets URL from the meta tag
        const sheetUrl = foodMenuMeta.getAttribute('sheet-url');
        console.log('sheetUrl:', sheetUrl); // Log the sheet URL

        if (sheetUrl) {
            Papa.parse(sheetUrl, {
                download: true,
                header: true,
                complete: function(results) {
                    console.log('Parsed results:', results); // Log the parsed results
                    const rows = results.data;
                    const menuTabs = document.getElementById('menuTabs');
                    const menuItemsWrapper = document.getElementById('menuItemsWrapper');
                    const uniqueMenus = [...new Set(rows.map(row => row.Menu))]; // Get unique menu types

                    // Create tabs for each unique menu type
                    uniqueMenus.forEach((menuType, index) => {
                        const tabButton = document.createElement('button');
                        tabButton.textContent = menuType;
                        tabButton.onclick = function() {
                            displayMenu(menuType);
                            setActiveTab(tabButton);
                            scrollToTab(tabButton);
                        };
                        menuTabs.appendChild(tabButton);

                        // Set the first tab as active by default
                        if (index === 0) {
                            tabButton.classList.add('active');
                        }
                    });

                    // Function to display menu items based on menu type
                    function displayMenu(menuType) {
                        menuItemsWrapper.innerHTML = ''; // Clear previous menu items
                        const menuGroups = groupBySubCategory(rows.filter(row => row.Menu === menuType));

                        // Display each sub-category and its items
                        for (const [subCategory, items] of Object.entries(menuGroups)) {
                            const subCategoryContainer = document.createElement('div');
                            subCategoryContainer.classList.add('menu-items--subcategory');

                            if (subCategory !== 'Other') {
                                const subCategoryElem = document.createElement('h2');
                                subCategoryElem.textContent = subCategory;
                                subCategoryContainer.appendChild(subCategoryElem);
                            }

                            items.forEach(row => {
                                const { Title, Price, 'Price Description': PriceDescription, Description, Notes } = row;

                                const menuItem = document.createElement('div');
                                menuItem.classList.add('menu-item');

                                const titlePriceContainer = document.createElement('div');
                                titlePriceContainer.classList.add('menu-item--title');

                                const titleElem = document.createElement('h3');
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

                                const descriptionElem = document.createElement('p');
                                descriptionElem.textContent = Description || 'No description available';
                                descriptionElem.classList.add('menu-item--description');
                                menuItem.appendChild(descriptionElem);

                                if (PriceDescription) {
                                    const priceDescriptionElem = document.createElement('p');
                                    priceDescriptionElem.textContent = PriceDescription;
                                    priceDescriptionElem.classList.add('menu-item--price-description');
                                    menuItem.appendChild(priceDescriptionElem);
                                }

                                subCategoryContainer.appendChild(menuItem);
                            });

                            menuItemsWrapper.appendChild(subCategoryContainer);
                        }
                    }

                    // Function to group items by sub-category
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

                    // Set active tab class
                    function setActiveTab(tab) {
                        const tabs = menuTabs.getElementsByTagName('button');
                        for (let i = 0; i < tabs.length; i++) {
                            tabs[i].classList.remove('active');
                        }
                        tab.classList.add('active');
                    }

                    // Scroll the selected tab to 6vw from the left border
                    function scrollToTab(tab) {
                        const menuTabsRect = menuTabs.getBoundingClientRect();
                        const tabRect = tab.getBoundingClientRect();
                        const offset = 6 * window.innerWidth / 100; // 6vw in pixels

                        const scrollPosition = tabRect.left - menuTabsRect.left - offset;

                        // Calculate the maximum scroll position
                        const maxScrollPosition = menuTabs.scrollWidth - menuTabs.clientWidth;

                        // Scroll to the calculated position, but not beyond the maximum scroll position
                        menuTabs.scrollTo({
                            left: Math.min(maxScrollPosition, menuTabs.scrollLeft + scrollPosition),
                            behavior: 'smooth'
                        });
                    }

                    // Function to get the query parameter value
                    function getQueryParam(param) {
                        const urlParams = new URLSearchParams(window.location.search);
                        return urlParams.get(param);
                    }

                    // Display the default or specified tab based on URL query parameter
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
                error: function(error, file) {
                    console.error('Error parsing CSV:', error, file);
                }
            });
        } else {
            console.error('No sheet URL provided in the meta tag.');
        }
    }
};
