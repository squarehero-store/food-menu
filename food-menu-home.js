document.addEventListener("DOMContentLoaded", function() {
    // Check if the food-menu meta tag is enabled
    const foodMenuMeta = document.querySelector('meta[name="food-menu"]');
    const isEnabled = foodMenuMeta ? foodMenuMeta.getAttribute('enabled') === 'true' : false;

    if (isEnabled) {
        const foodMenuContainer = document.getElementById('foodMenuContainer');

        // Check if the foodMenuContainer exists
        if (foodMenuContainer) {
            // Create the HTML structure
            foodMenuContainer.innerHTML = `
                <div data-squarehero="restaurant-menu">
                    <div class="menu-tabs" id="menuTabs"></div>
                    <div class="view-menu-button">
                        <button onclick="window.location.href='/menu'">View Our Menu</button>
                    </div>
                </div>
            `;

            // Get the Google Sheets URL from the meta tag
            const metaTag = document.querySelector('meta[name="food-menu-sheet"]');
            if (!metaTag) {
                console.error('Meta tag for Google Sheets URL not found');
                return;
            }
            const sheetUrl = metaTag.getAttribute('content');

            Papa.parse(sheetUrl, {
                download: true,
                header: true,
                complete: function(results) {
                    const rows = results.data;
                    const menuTabs = document.getElementById('menuTabs');
                    const uniqueMenus = [...new Set(rows.map(row => row.Menu))]; // Get unique menu types

                    // Create tabs for each unique menu type
                    uniqueMenus.forEach(menuType => {
                        const tabButton = document.createElement('button');
                        tabButton.textContent = menuType;
                        tabButton.onclick = function() {
                            window.location.href = '/menu';
                        };
                        menuTabs.appendChild(tabButton);
                    });
                },
                error: function(error, file) {
                    console.error('Error parsing CSV:', error, file);
                }
            });
        } else {
            console.error('foodMenuContainer not found');
        }
    } else {
        console.log("Food menu is not enabled");
    }
});
