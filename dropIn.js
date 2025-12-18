(function() {
    // 1. Select all channel renderer elements on the page
    const channelElements = document.querySelectorAll('ytd-channel-renderer');

    if (channelElements.length === 0) {
        console.warn("No channels found. Make sure you are on https://www.youtube.com/feed/channels and have scrolled down.");
        return;
    }

    let yamlOutput = "";
    let count = 0;

    console.log(`Found ${channelElements.length} channels. Processing...`);

    channelElements.forEach(el => {
        try {
            // Attempt to fetch the Title (Name)
            const titleEl = el.querySelector('#text');
            const name = titleEl ? titleEl.innerText.trim() : "Unknown Channel";

            // Attempt to fetch the ID (UC...)
            // We try to access the underlying Polymer/Lit data for the true ID.
            // Fallback: Scrape the href if internal data isn't accessible.
            let id = null;
           
            if (el.data && el.data.channelId) {
                id = el.data.channelId;
            } else {
                // Fallback to HREF parsing if the data property is protected/unavailable
                const link = el.querySelector('a#main-link');
                if (link) {
                    const href = link.getAttribute('href');
                    // Extract ID from /channel/UC... or keep the handle if that's all there is
                    id = href.replace(/^\/(channel\/|c\/|user\/)/, '').replace(/^\//, '');
                }
            }

            if (id) {
                // Format: - CHANNEL_ID # Channel Name
                yamlOutput += `- ${id} # ${name}\n`;
                count++;
            }
        } catch (err) {
            console.error("Error parsing a channel:", err);
        }
    });

    // 2. Output the result
    console.log(`%cSuccess! Extracted ${count} subscriptions.`, "color: green; font-size: 14px; font-weight: bold;");
    console.log("Here is your YAML list (Copy below):");
    console.log("-------------------------------------");
    console.log(yamlOutput);
    console.log("-------------------------------------");
   
    // Optional: Copy to clipboard automatically
    // copy(yamlOutput);
})();
