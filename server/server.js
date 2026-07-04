import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv"; 
import { supabase } from "../src/supabaseClient.js";
import TelegramBot from "node-telegram-bot-api";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });
const bot = new TelegramBot(process.env.TELEGRAM_BOT_TOKEN, { polling: true });

const app = express();
app.use(express.json()); 
app.use(cors({origin: "http://localhost:5173"}));

const PORT = process.env.PORT || 4000;
const NP_URL = "https://api.novaposhta.ua/v2.0/json/";

// --- СОЗДАНИЕ ЗАКАЗА (БЕЗ ОНЛАЙН ОПЛАТЫ) ---
app.post("/api/orders", async (req, res) => {
    const { firstName, lastName, middleName, phone, address, paymentType, total, items } = req.body;

    if (!firstName || !lastName || !phone || !items || items.length === 0) {
        return res.status(400).json({ error: "Не всі обов'язкові поля заповнені" });
    }

    try {
        const fullName = `${lastName} ${firstName} ${middleName}`.trim();
        const cleanedPhone = phone.replace(/\D/g, "");

        // 1. Вставляем сам заказ в таблицу `orders`
        const { data: orderData, error: orderError } = await supabase
            .from("orders")
            .insert([{
                full_name: fullName,
                phone: cleanedPhone,
                adress: address,
                total: total,
                status: "Новий",
                payment_type: paymentType
            }])
            .select()
            .single();

        if (orderError) throw orderError;
        const orderId = orderData.id;

        // 2. Формируем массив товаров для вставки в `order_items`
        const orderItemsFields = items.map(item => ({
            order_id: orderId,
            product_id: item.id,
            title: item.name || item.title,
            price: item.price,
            qty: item.qty
        }));

        // 3. Массовая вставка товаров
        const { error: itemsError } = await supabase
            .from("order_items")
            .insert(orderItemsFields);

        if (itemsError) throw itemsError;

        // --- 🚀 ОТПРАВКА УВЕДОМЛЕНИЯ В ТЕЛЕГРАМ ---
        try {
            const chatId = process.env.TELEGRAM_CHAT_ID;

            const telegramMessage = `
🔔 Нове замовлення!

🆔 ID замовлення: ${orderId}
👤 Покупець: ${fullName}
📞 Телефон: +${cleanedPhone}
📍 Адреса: ${address}
💳 Спосіб оплати: ${paymentType || "Не вказано"}
💰 Всього до сплати: ${total} грн
`;

            // Отправляем сообщение и передаем inline-кнопки
            await bot.sendMessage(chatId, telegramMessage, {
                reply_markup: {
                    inline_keyboard: [
                        [
        { text: "🟢 Оплачено", callback_data: `st_pay_${orderId}` },
        { text: "🚚 Відправлено", callback_data: `st_deliv_${orderId}` }
    ],
    [
        { text: "🔴 Скасовано", callback_data: `st_canc_${orderId}` },
        { text: "🔄 Повернення", callback_data: `st_ret_${orderId}` }
    ]
                    ]
                }
            });
            
            console.log("Уведомление с кнопками отправлено в Telegram!");
        } catch (tgErr) {
            console.error("Ошибка отправки в Telegram:", tgErr.message);
        }

        // Возвращаем успешный ответ фронтенду
        res.json({ success: true, orderId, message: "Замовлення успішно створено!" });

    } catch (err) {
        console.error("Ошибка сохранения заказа:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- ОБРАБОТКА НАЖАТИЙ НА КНОПКИ В ТГ ---
bot.on("callback_query", async (callbackQuery) => {
    const message = callbackQuery.message;
    const data = callbackQuery.data;

    if (data.startsWith("st_")) {
        const [_, newStatus, orderId] = data.split("_");

        try {
            // 1. Обновляем статус в Supabase
            const { error } = await supabase
                .from("orders")
                .update({ status: newStatus })
                .eq("id", orderId);

            if (error) throw error;

            // 2. Всплывашка в Телеге
            await bot.answerCallbackQuery(callbackQuery.id, {
                text: `Статус змінено на "${newStatus}"`,
                show_alert: false
            });

            // 3. Обновляем текст сообщения в ТГ-чате
            const updatedText = message.text + `\n\n⚡️ [Статус змінено на: ${newStatus}]`;

            await bot.editMessageText(updatedText, {
                chat_id: message.chat.id,
                message_id: message.message_id,
                reply_markup: message.reply_markup
            });

            console.log(`Статус заказа ${orderId} изменен на: ${newStatus}`);

        } catch (dbErr) {
            console.error("Ошибка обновления статуса:", dbErr.message);
            bot.answerCallbackQuery(callbackQuery.id, {
                text: "Помилка при оновленні бази даних!",
                show_alert: true
            });
        }
    }
});

// --- NOVA POSHTA: Поиск города ---
app.get("/api/np-cities", async (req, res) => {
    const cityName = req.query.name || ""; 
    
    try {
        const response = await fetch(NP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: process.env.NP_API_KEY,
                modelName: "Address",
                calledMethod: "getCities",
                methodProperties: {
                    FindByString: cityName,
                    Limit: "20"
                }
            })
        });

        const result = await response.json();
        if (!result.success) throw new Error(result.errors.join(", "));

        res.json(result.data);
    } catch (err) {
        console.error("NP Cities Error:", err.message);
        res.status(500).json({ error: err.message });
    }
});

// --- NOVA POSHTA: Список отделений ---
app.post("/api/np-warehouses", async (req, res) => {
    const { cityRef } = req.body;
    if (!cityRef) return res.status(400).json({ error: "cityRef is required" });

    try {
        const response = await fetch(NP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: process.env.NP_API_KEY,
                modelName: "AddressGeneral",
                calledMethod: "getWarehouses",
                methodProperties: { CityRef: cityRef }
            })
        });

        const result = await response.json();
        res.json(result.data);
    } catch (err) {
        res.status(500).json({ error: "Ошибка отделений" });
    }
});

// --- NOVA POSHTA: Расчет стоимости ---
app.post("/api/np-cost", async (req, res) => {
    const { cityRef, weight, cost } = req.body;
    
    try {
        const response = await fetch(NP_URL, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
                apiKey: process.env.NP_API_KEY,
                modelName: "InternetDocument",
                calledMethod: "getDocumentPrice",
                methodProperties: {
                    CitySender: process.env.NP_CITY_REF, 
                    CityRecipient: cityRef,
                    Weight: weight || 1,
                    Cost: cost || 100,
                    ServiceType: "WarehouseWarehouse",
                    CargoType: "Cargo"
                }
            })
        });

        const result = await response.json();
        
        if (result.success && result.data[0]) {
            res.json({ cost: result.data[0].Cost });
        } else {
            res.status(400).json({ error: result.errors[0] || "Ошибка расчета" });
        }
    } catch (err) {
        res.status(500).json({ error: "Server error" });
    }
});

app.listen(PORT, () => console.log(`🚀 Server flying on port ${PORT}`));