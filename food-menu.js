document.addEventListener("DOMContentLoaded", function() {
    // Check if the food-menu meta tag is enabled
    const foodMenuMeta = document.querySelector('meta[name="food-menu"]');
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
        const metaTag = document.querySelector('meta[name="food-menu-sheet"]');
        const sheetUrl = metaTag ? metaTag.getAttribute('content') : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGh58iUINmX8EE-6GTcx8aCdJXWJgINskWMZwnYqowmlyeXp5-82E4iYxiq-2ehdsUFWEgXwhl-WS/pub?output=csv';

        const defaultPrice = '$N/A'; // Default price if not specified in the sheet

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
                            const { Title, Price, Description } = row;

                            const menuItem = document.createElement('div');
                            menuItem.classList.add('menu-item');

                            const titlePriceContainer = document.createElement('div');
                            titlePriceContainer.classList.add('menu-item--title');

                            const titleElem = document.createElement('h3');
                            titleElem.textContent = Title;
                            titlePriceContainer.appendChild(titleElem);

                            const priceElem = document.createElement('span');
                            priceElem.textContent = Price || defaultPrice;
                            priceElem.classList.add('price');
                            titlePriceContainer.appendChild(priceElem);

                            menuItem.appendChild(titlePriceContainer);

                            const descriptionElem = document.createElement('p');
                            descriptionElem.textContent = Description || 'No description available';
                            descriptionElem.classList.add('menu-item--description');
                            menuItem.appendChild(descriptionElem);

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

                // Display the first tab by default
                displayMenu(uniqueMenus[0]);
            },
            error: function(error, file) {
                console.error('Error parsing CSV:', error, file);
            }
        });
    }
});
