/**
 * ZNN News – Premium Article Page Logic
 * BBC + Apple Style Redesign
 */

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://znn-zone.onrender.com";
    const FALLBACK_IMG = "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=1200&fit=crop";

    // DOM Elements (with enhanced verification)
    const elements = {
        skeleton: document.getElementById("artSkeleton"),
        content: document.getElementById("artContent"),
        error: document.getElementById("artError"),
        errorMsg: document.getElementById("errorMsg"),
        category: document.getElementById("artCategory"),
        title: document.getElementById("artTitle"),
        metaAuthor: document.getElementById("artAuthor"),
        metaDate: document.getElementById("artDate"),
        heroImg: document.getElementById("artHero"),
        body: document.getElementById("artBody"),
        relatedGrid: document.getElementById("relatedGrid"),
        relatedSection: document.getElementById("artRelated"),
        metaTitle: document.getElementById("metaTitle"),
        metaDesc: document.getElementById("metaDesc"),
        canonical: document.getElementById("canonicalLink"),
        ogTitle: document.getElementById("ogTitle"),
        ogDesc: document.getElementById("ogDesc"),
        ogImage: document.getElementById("ogImage"),
        twTitle: document.getElementById("twTitle"),
        twDesc: document.getElementById("twDesc"),
        breadcrumbs: document.getElementById("artBreadcrumbs")
    };

    // Logging verification
    console.log("ZNN: Initializing Article View...");
    Object.entries(elements).forEach(([key, el]) => {
        if (!el) console.warn(`ZNN: Missing element for ID: ${key}`);
    });

    /**
     * INITIALIZE PAGE
     */
    async function init() {
        const urlParams = new URLSearchParams(window.location.search);
        const id = urlParams.get("id");

        if (!id) {
            showError("No article ID found in the URL.");
            return;
        }

        try {
            // Fetch Article Data
            const res = await fetch(`${API_BASE}/api/news/${id}`);
            const data = await res.json();

            // Validation: if (!data || !data.id)
            if (!data || !data.id) {
                showError("The requested news story could not be found.");
                return;
            }

            // Execute SEO and Content Rendering
            renderArticle(data);
            fetchRelated(data.category, data.id);
        } catch (err) {
            console.error("ZNN Error:", err);
            showError("Failed to connect to ZNN servers. Please try again later.");
        }
    }

    /**
     * RENDER MAIN ARTICLE
     */
    function renderArticle(art) {
        console.log("ZNN: Rendering Article:", art.title);

        // Switch visibility
        if (elements.skeleton) elements.skeleton.style.display = "none";
        if (elements.content) elements.content.style.display = "block";

        // SEO & Titles
        const displayTitle = art.title || "Untitled News";
        const displayCategory = art.category || "General";
        const displayDesc = (art.description || art.content || "").substring(0, 160) + "...";
        const displayImg = art.image_url || art.image || FALLBACK_IMG;

        if (elements.metaTitle) elements.metaTitle.textContent = `${displayTitle} | ZNN News`;
        if (elements.title) elements.title.textContent = displayTitle;
        if (elements.category) elements.category.textContent = displayCategory.toUpperCase();

        // Meta Info
        if (elements.metaAuthor) elements.metaAuthor.textContent = art.author || "ZNN Editorial";
        if (elements.metaDate) elements.metaDate.textContent = formatDate(art.created_at);

        // Hero Image (Performance Optimized)
        if (elements.heroImg) {
            elements.heroImg.src = displayImg;
            elements.heroImg.alt = displayTitle;
            elements.heroImg.setAttribute("loading", "eager"); // Hero should load fast
            elements.heroImg.onerror = () => { elements.heroImg.src = FALLBACK_IMG; };
        }

        // Content Body (Handle Markdown or Newlines)
        let contentStr = art.full_content || art.content || art.description || "No content available.";
        if (!contentStr.includes("<p>")) {
            contentStr = contentStr.split("\n\n").map(p => `<p>${p.trim()}</p>`).join("");
        }
        if (elements.body) elements.body.innerHTML = contentStr;

        // --- SEO UPGRADE ---
        updateSEOContent(art, displayTitle, displayDesc, displayImg);
        renderBreadcrumbs(displayCategory, displayTitle);

        // Setup Social Share
        setupSocial(displayTitle);

        // Scroll to top
        window.scrollTo({ top: 0, behavior: "smooth" });
    }

    /**
     * UPDATE DYNAMIC SEO META & SCHEMA
     */
    function updateSEOContent(art, title, desc, img) {
        const url = window.location.href;

        // Meta Tags
        if (elements.metaDesc) elements.metaDesc.content = desc;
        if (elements.canonical) elements.canonical.href = url;
        
        // Open Graph
        if (elements.ogTitle) elements.ogTitle.content = title;
        if (elements.ogDesc) elements.ogDesc.content = desc;
        if (elements.ogImage) elements.ogImage.content = img;
        
        // Twitter
        if (elements.twTitle) elements.twTitle.content = title;
        if (elements.twDesc) elements.twDesc.content = desc;

        // JSON-LD Structured Data (NewsArticle)
        const schema = {
            "@context": "https://schema.org",
            "@type": "NewsArticle",
            "headline": title,
            "image": [img],
            "datePublished": art.created_at || new Date().toISOString(),
            "author": {
                "@type": "Organization",
                "name": "ZNN"
            },
            "publisher": {
                "@type": "Organization",
                "name": "ZNN",
                "logo": {
                    "@type": "ImageObject",
                    "url": "https://znn-zone.netlify.app/logo.png"
                }
            },
            "description": desc,
            "mainEntityOfPage": {
                "@type": "WebPage",
                "@id": url
            }
        };

        let scriptTag = document.getElementById("artSchema");
        if (!scriptTag) {
            scriptTag = document.createElement("script");
            scriptTag.id = "artSchema";
            scriptTag.type = "application/ld+json";
            document.head.appendChild(scriptTag);
        }
        scriptTag.text = JSON.stringify(schema);
    }

    /**
     * RENDER BREADCRUMBS
     */
    function renderBreadcrumbs(category, title) {
        if (!elements.breadcrumbs) return;
        
        elements.breadcrumbs.innerHTML = `
            <a href="/">Home</a>
            <span>&rsaquo;</span>
            <a href="/#${category.toLowerCase()}">${category}</a>
            <span>&rsaquo;</span>
            <div class="current">${title}</div>
        `;
    }

    /**
     * FETCH & RENDER RELATED STORIES
     */
    async function fetchRelated(category, currentId) {
        try {
            const res = await fetch(`${API_BASE}/api/news`);
            const allNews = await res.json();
            
            if (!Array.isArray(allNews)) return;

            // Filter by category, exclude current, limit to 4 (for 2x2 grid)
            const related = allNews
                .filter(item => item.id !== currentId && item.category === category)
                .slice(0, 4);

            if (related.length > 0 && elements.relatedSection && elements.relatedGrid) {
                elements.relatedSection.style.display = "block";
                elements.relatedGrid.innerHTML = related.map(item => `
                    <div class="art-related-card" onclick="window.location.href='/article.html?id=${item.id}'">
                        <img src="${item.image_url || item.image || FALLBACK_IMG}" alt="${esc(item.title)}" loading="lazy">
                        <h3>${esc(item.title)}</h3>
                    </div>
                `).join("");
            }
        } catch (err) {
            console.warn("Related stories load failed:", err);
        }
    }

    /**
     * SOCIAL SHARE LOGIC
     */
    function setupSocial(title) {
        const url = window.location.href;
        const text = encodeURIComponent(`Check out this story on ZNN: ${title}`);
        const encodedUrl = encodeURIComponent(url);

        const handlers = {
            tw: () => window.open(`https://twitter.com/intent/tweet?text=${text}&url=${encodedUrl}`, "_blank"),
            fb: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, "_blank"),
            wa: () => window.open(`https://api.whatsapp.com/send?text=${text}%20${encodedUrl}`, "_blank"),
            copy: () => {
                navigator.clipboard.writeText(url).then(() => {
                    const btn = document.querySelector(".share-copy");
                    const icon = btn.querySelector("i");
                    if (!icon) return;
                    const originalClass = icon.className;
                    icon.className = "fas fa-check";
                    btn.classList.add("copied");
                    setTimeout(() => {
                        icon.className = originalClass;
                        btn.classList.remove("copied");
                    }, 2000);
                });
            }
        };

        const btnTw = document.querySelector(".share-tw");
        const btnFb = document.querySelector(".share-fb");
        const btnWa = document.querySelector(".share-wa");
        const btnCopy = document.querySelector(".share-copy");

        if (btnTw) btnTw.onclick = handlers.tw;
        if (btnFb) btnFb.onclick = handlers.fb;
        if (btnWa) btnWa.onclick = handlers.wa;
        if (btnCopy) btnCopy.onclick = handlers.copy;
    }

    /**
     * UTILITIES
     */
    function showError(msg) {
        if (elements.skeleton) elements.skeleton.style.display = "none";
        if (elements.content) elements.content.style.display = "none";
        if (elements.error) elements.error.style.display = "block";
        if (elements.errorMsg) elements.errorMsg.textContent = msg;
    }

    function formatDate(dateStr) {
        if (!dateStr) return "Just Now";
        const date = new Date(dateStr);
        return date.toLocaleDateString("en-US", {
            month: "long",
            day: "numeric",
            year: "numeric"
        });
    }

    function esc(str) {
        const div = document.createElement("div");
        div.textContent = str || "";
        return div.innerHTML;
    }

    // RUN BOOTSTRAP
    init();
});