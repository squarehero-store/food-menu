// ===============================================
//   ⚡ SquareHero Food & Drink Menu Manager v0.2.0 ⚡
// ===============================================

document.addEventListener("DOMContentLoaded", function() {
    // Add 'menu-page' class to the body
    document.body.classList.add('menu-page');

    // Check if the food-menu meta tag is enabled
    const foodMenuMeta = document.querySelector('meta[squarehero-plugin="food-menu"]');
    const isEnabled = foodMenuMeta ? foodMenuMeta.getAttribute('enabled') === 'true' : false;

    if (isEnabled) {
        const foodMenuContainer = document.getElementById('foodMenuContainer');

        // Create the HTML structure
        foodMenuContainer.innerHTML = `
            <div data-squarehero="restaurant-menu">
                <div class="menu-tabs" id="menuTabs"></div>
                <div class="menu-items--wrapper" id="menuItemsWrapper"></div>
            </div>
        `;

        // Get the Google Sheets URL from the meta tag
        const sheetUrl = foodMenuMeta.getAttribute('sheet-url');

        if (sheetUrl) {
            Papa.parse(sheetUrl, {
                download: true,
                header: true,
                complete: function(results) {
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
                        rows.forEach(row => {
                            if (row.Menu === menuType) {
                                const { Title, Price, Description, Notes } = row;

                                const menuItem = document.createElement('div');
                                menuItem.classList.add('menu-item');

                                const titlePriceContainer = document.createElement('div');
                                titlePriceContainer.classList.add('menu-item--title');

                                const titleElem = document.createElement('h3');
                                titleElem.textContent = Title;
                                titlePriceContainer.appendChild(titleElem);

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

                                if (Notes) {
                                    const notesElem = document.createElement('p');
                                    notesElem.textContent = Notes;
                                    notesElem.classList.add('menu-item--notes');
                                    menuItem.appendChild(notesElem);
                                }

                                menuItemsWrapper.appendChild(menuItem);
                            }
                        });
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

                    // Display the first tab by default
                    displayMenu(uniqueMenus[0]);
                },
                error: function(error, file) {
                    console.error('Error parsing CSV:', error, file);
                }
            });
        } else {
            console.error('No sheet URL provided in the meta tag.');
        }
    }
});
