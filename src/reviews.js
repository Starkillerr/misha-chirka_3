import { supabase } from './supabaseClient';



// Получаем все отзывы по продукту

export async function fetchReviews(productId) {

  if (!productId) return [];



  const { data, error } = await supabase

    .from("reviews")

    .select("*")

    .eq("product_id", productId)

    .order("created_at", { ascending: false });



  if (error) {

    console.error("Ошибка при загрузке отзывов:", error);

    return [];

  }



  return data;

}



// Добавляем новый отзыв

export async function addReview(productId, name, text) {

  if (!productId || !name.trim() || !text.trim()) return null;



  const { data, error } = await supabase

    .from("reviews")

    .insert([{ product_id: productId, name, text }])

    .select()

    .single();



  if (error) {

    console.error("Ошибка при добавлении отзыва:", error);

    return null;

  }



  return data;

}

