document.addEventListener("DOMContentLoaded", function() {
    // Get the Google Sheets URL from the meta tag
    const metaTag = document.querySelector('meta[name="food-menu-sheet"]');
    const sheetUrl = metaTag ? metaTag.getAttribute('content') : 'https://docs.google.com/spreadsheets/d/e/2PACX-1vQBGh58iUINmX8EE-6GTcx8aCdJXWJgINskWMZwnYqowmlyeXp5-82E4iYxiq-2ehdsUFWEgXwhl-WS/pub?output=csv';

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
});
