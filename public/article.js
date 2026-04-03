document.addEventListener("DOMContentLoaded", () => {

  const API_BASE = "https://znn-zone.onrender.com";

  async function loadArticle() {
    const el = {
      title: document.getElementById("artTitle"),
      sub: document.getElementById("artSubtitle"),
      img: document.getElementById("artImg"),
      cat: document.getElementById("artCat"),
      content: document.getElementById("artContent")
    };

    let art = null;

    const params = new URLSearchParams(location.search);
    const articleId = params.get("id");

    // ✅ FIXED API CALL
    if (articleId) {
      try {
        console.log("📰 Loading article:", articleId);

        const API_BASE = "https://znn-zone.onrender.com";
        const res = await fetch(`${API_BASE}/api/news/${articleId}`);

        if (res.ok) {
          art = await res.json();
          console.log("✅ Loaded:", art.title);
        } else {
          console.error("❌ API error:", res.status);
        }
      } catch (e) {
        console.error("❌ Fetch error:", e);
      }
    }

    // ❌ NOT FOUND
    if (!art || art.error) {
      if (el.title) el.title.innerText = "Article Not Found";
      if (el.sub) el.sub.innerText = "This story may have been moved or removed.";
      if (el.img) el.img.style.display = "none";
      return;
    }

    // ✅ RENDER DATA
    if (el.title) el.title.innerText = art.title;
    if (el.sub) el.sub.innerText = art.description || "";

    if (el.img) {
      el.img.src = art.image_url || "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=1200";
      el.img.onerror = () => el.img.src = "https://images.unsplash.com/photo-1504711434969-e33886168d5c?w=600";
    }

    if (el.cat) el.cat.innerText = art.category || "NEWS";

    if (el.content) {
      let body = art.content || art.description || "";
      if (!body.includes("<p>")) {
        body = body.split("\n\n").map(p => `<p>${p}</p>`).join("");
      }
      el.content.innerHTML = body;
    }

    document.title = `${art.title} | ZNN`;
  }

  loadArticle();
});