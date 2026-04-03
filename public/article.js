/* ==========================================================
   ZNN – article.js | Premium BBC Edition v1.0
   ========================================================== */

document.addEventListener("DOMContentLoaded", () => {
    const API_BASE = "https://znn-zone.onrender.com";
    const FALLBACK_IMG = 'https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=1200&fit=crop';

    // DOM Elements - BBC Enhanced
    const el = {
        title: document.getElementById("artTitleV2"),
        subtitle: document.getElementById("artSubtitleV2"),
        meta: document.getElementById("artMetaV2"),
        img: document.getElementById("artImgV2"),
        body: document.getElementById("artBodyV2"),
        source: document.getElementById("artSourceV2"),
        views: document.getElementById("artViewsV2"),
        date: document.getElementById("artDateV2"),
        author: document.getElementById("artAuthorV2"),
        skeleton: document.getElementById("articleSkeleton"),
        content: document.getElementById("articleContent"),
        s2t: document.getElementById("s2t"),
        relatedGrid: document.getElementById("relatedGrid"),
        relatedSection: document.getElementById("relatedSection")
    };

    /**
     * Scroll & UI Logic
     */
    window.addEventListener("scroll", () => {
        if (el.s2t) el.s2t.classList.toggle("s2t--on", window.scrollY > 400);
    });

    if (el.s2t) el.s2t.addEventListener("click", () => window.scrollTo({ top: 0, behavior: "smooth" }));

    // Share Functionality BBC Style
    document.querySelectorAll(".share-btn-v2").forEach(btn => {
        btn.addEventListener("click", () => {
            const url = window.location.href;
            const title = el.title?.innerText || "ZNN News";
            let shareUrl = "";

            if (btn.classList.contains("twitter")) shareUrl = `https://twitter.com/intent/tweet?text=${encodeURIComponent(title)}&url=${encodeURIComponent(url)}`;
            if (btn.classList.contains("facebook")) shareUrl = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`;
            if (btn.classList.contains("whatsapp")) shareUrl = `https://api.whatsapp.com/send?text=${encodeURIComponent(title + " " + url)}`;
            if (btn.classList.contains("copy-link")) {
                navigator.clipboard.writeText(url).then(() => {
                    const icon = btn.querySelector("i");
                    icon.className = "fas fa-check";
                    setTimeout(() => icon.className = "fas fa-link", 2000);
                });
                return;
            }
            if (shareUrl) window.open(shareUrl, "_blank", "width=600,height=400");
        });
    });

    /**
     * Core Data Loading
     */
    async function loadArticle() {
        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");

        if (!id) {
            handleError("Article ID not found.");
            return;
        }

        const url = `${API_BASE}/api/news/${id}`;
        console.log("📰 Fetching article from:", url);

        try {
            const res = await fetch(url);
            const data = await res.json();
            
            console.log("✅ Article Loaded:", data);

            if (!data || !data.id) {
                handleError("Article Not Found");
                return;
            }

            renderArticle(data);
            loadRelated(data.category, data.id);

        } catch (err) {
            console.error("❌ Article Fetch Error:", err);
            handleError("Something went wrong while loading the news.");
        }
    }

    /**
     * Render Logic - BBC Editorial Style
     */
    function renderArticle(a) {
        // Toggle skeleton/content
        if (el.skeleton) el.skeleton.style.display = "none";
        if (el.content) el.content.style.display = "block";

        // Headings & Subtitles
        if (el.title) el.title.innerText = a.title || "";
        if (el.subtitle) el.subtitle.innerText = a.description || "";

        // Meta (Badges/Time)
        if (el.meta) {
            let metaHTML = "";
            if (a.is_breaking) metaHTML += '<span class="badge badge--breaking mr-2">BREAKING</span>';
            metaHTML += `<span class="bg-[#d0021b] text-white px-2 py-1 text-[10px] uppercase font-black italic tracking-widest">${esc(a.category || "NEWS")}</span>`;
            el.meta.innerHTML = metaHTML;
        }

        // Image Handling
        if (el.img) {
            el.img.src = a.image_url || a.image || FALLBACK_IMG;
            el.img.alt = a.title || "ZNN News";
            el.img.onerror = () => el.img.src = FALLBACK_IMG;
        }

        // Meta Bottom (Author/Date/Views)
        if (el.date) el.date.innerText = formatDate(a.created_at);
        if (el.author) el.author.innerText = a.author || "ZNN Editorial";
        if (el.views) el.views.innerHTML = `<i class="fas fa-eye mr-1"></i> ${formatViews(a.views || 0)} views`;

        // Content
        if (el.body) {
            let content = a.full_content || a.content || a.description || "";
            // Ensure HTML structure for readability
            if (!content.includes("<p>")) {
                content = content.split("\n\n").map(p => `<p>${p.trim()}</p>`).join("");
            }
            el.body.innerHTML = content;
        }

        // Source Footer
        if (el.source) {
            if (a.url) {
                el.source.innerHTML = `Original Source: <a href="${a.url}" target="_blank" class="text-[#d0021b] underline">${esc(a.source || "View Source")}</a>`;
            } else {
                el.source.innerText = `Published by Zone News Network (ZNN).`;
            }
        }

        // Update Page SEO
        document.title = `${a.title} | ZNN News`;
    }

    /**
     * Related Stories Section
     */
    async function loadRelated(category, excludeId) {
        if (!el.relatedGrid) return;
        try {
            const res = await fetch(`${API_BASE}/api/news`);
            const all = await res.json();
            if (!Array.isArray(all)) return;

            // Filter for same category, exclude current article
            let related = all.filter(item => item.id !== excludeId);
            if (category) related = related.filter(item => item.category === category);
            
            related = related.slice(0, 2); // Show 2 premium cards

            if (related.length > 0) {
                if (el.relatedSection) el.relatedSection.style.display = "block";
                el.relatedGrid.innerHTML = related.map(item => `
                    <div class="cursor-pointer group flex flex-col gap-4" onclick="location.href='/article.html?id=${item.id}'">
                        <div class="h-48 overflow-hidden bg-gray-100 rounded-lg">
                            <img src="${item.image_url || FALLBACK_IMG}" class="w-full h-full object-cover transition-transform group-hover:scale-105 duration-500" loading="lazy">
                        </div>
                        <div>
                            <span class="text-[10px] text-[#d0021b] font-black uppercase tracking-widest mb-1 block">${esc(item.category || "NEWS")}</span>
                            <h3 class="text-xl font-bold leading-tight group-hover:underline">${esc(item.title)}</h3>
                        </div>
                    </div>
                `).join("");
            }
        } catch (e) {
            console.error("Related Stories Load Fail:", e);
        }
    }

    /**
     * Error Handling UI
     */
    function handleError(msg) {
        if (el.skeleton) el.skeleton.style.display = "none";
        if (el.content) el.content.style.display = "block";
        if (el.title) el.title.innerText = "Article Not Found";
        if (el.subtitle) el.subtitle.innerText = msg || "The article you are looking for doesn't exist or has been removed.";
        if (el.meta) el.meta.style.display = "none";
    }

    /**
     * Formatting Utils
     */
    function esc(s) { const d = document.createElement("div"); d.textContent = s || ""; return d.innerHTML; }
    
    function formatDate(d) {
        if (!d) return "Recently Published";
        const date = new Date(d);
        return date.toLocaleDateString("en-GB", {
            day: "numeric",
            month: "long",
            year: "numeric"
        });
    }

    function formatViews(n) {
        if (n >= 1000000) return (n/1000000).toFixed(1) + 'M';
        if (n >= 1000) return (n/1000).toFixed(1) + 'K';
        return n;
    }

    // Initialize
    loadArticle();
});