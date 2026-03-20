import { supabase } from './supabaseClient'

export async function fetchProducts({ page = 1, limit = 20, category, minPrice, maxPrice, search }) {
  const offset = (page - 1) * limit;

  // Пример для Supabase:
  let query = supabase.from("products").select("*", { count: "exact" });

  if (category) query = query.eq("category", category);
  if (minPrice !== undefined) query = query.gte("price", minPrice);
  if (maxPrice !== undefined) query = query.lte("price", maxPrice);
  if (search) query = query.ilike("name", `%${search}%`);

  query = query.range(offset, offset + limit - 1);

  const { data, error, count } = await query;

  if (error) {
    console.error(error);
    return { data: [], count: 0 };
  }

  const shuffled = [...data].sort(() => Math.random() - 0.5);

  return { data: shuffled, count };
}
