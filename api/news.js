import { createClient } from '@supabase/supabase-js';

export default async function handler(req, res) {
  const SUPABASE_URL = process.env.SUPABASE_URL || "https://ewtecgivavqerbskmund.supabase.co";
  const SUPABASE_ANON_KEY = process.env.SUPABASE_ANON_KEY || "sb_publishable_f2zyHqhgjFqKO1Kkqrfq4Q_0c73NfW3";

  const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

  const { category, id, slug } = req.query;

  try {
    let query = supabase
      .from('news')
      .select('*')
      .order('created_at', { ascending: false });

    // ✅ GET SINGLE ARTICLE BY ID
    if (id) {
      const cleanId = id.trim();

      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('id', cleanId);

      if (error) {
        console.error("Supabase Error:", error);
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      return res.status(200).json(data[0]);
    }

    // ✅ GET BY SLUG
    if (slug) {
      const { data, error } = await supabase
        .from('news')
        .select('*')
        .eq('slug', slug);

      if (error) {
        return res.status(500).json({ error: error.message });
      }

      if (!data || data.length === 0) {
        return res.status(404).json({ error: "Article not found" });
      }

      return res.status(200).json(data[0]);
    }

    // ✅ FILTER BY CATEGORY
    if (category && category !== 'all') {
      query = query.eq('category', category);
    } else {
      query = query.limit(50);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Supabase Error:", error);
      return res.status(500).json({ error: error.message });
    }

    return res.status(200).json(data);

  } catch (err) {
    console.error("API Exception:", err);
    return res.status(500).json({ error: "Internal Server Error" });
  }
}