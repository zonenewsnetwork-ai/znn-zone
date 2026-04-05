export default async function handler(req, res) {
  const baseUrl = "https://znn-zone.netlify.app";

  const SUPABASE_URL = process.env.SUPABASE_URL;
  const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY;

  const { createClient } = require('@supabase/supabase-js');
  const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

  const { data: articles } = await supabase
    .from('news')
    .select('id, created_at')
    .order('created_at', { ascending: false });

  let urls = `
    <url>
      <loc>${baseUrl}</loc>
    </url>
  `;

  articles.forEach(article => {
    urls += `
      <url>
        <loc>${baseUrl}/article.html?id=${article.id}</loc>
        <lastmod>${article.created_at}</lastmod>
      </url>
    `;
  });

  const sitemap = `<?xml version="1.0" encoding="UTF-8"?>
  <urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
    ${urls}
  </urlset>`;

  res.setHeader('Content-Type', 'text/xml');
  res.status(200).send(sitemap);
}