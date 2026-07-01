import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv"; 
import { supabase } from "../src/supabaseClient.js";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json()); // Стандартный парсер для JSON
app.use(cors({origin: "http://localhost:5173"}));

const PORT = process.env.PORT || 4000;
const NP_URL = "https://api.novaposhta.ua/v2.0/json/";

// --- СОЗДАНИЕ ЗАКАЗА (БЕЗ ОНЛАЙН ОПЛАТЫ) ---
app.post("/api/orders", async (req, res) => {
    const { firstName, lastName, middleName, phone, address, total, items } = req.body;

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
                status: "Новий"
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
            const botToken = process.env.TELEGRAM_BOT_TOKEN;
            const chatId = process.env.TELEGRAM_CHAT_ID;

            // Красиво форматируем список товаров
            const itemsList = items.map(item => `📦 *${item.name || item.title}* — ${item.qty} шт. x ${item.price} грн`).join("\n");

            // Текст сообщения (используем Markdown для жирного шрифта)
            const telegramMessage = 
`🔔 *Нове замовлення!*

🆔 *ID замовлення:* \`${orderId}\`
👤 *Покупець:* ${fullName}
📞 *Телефон:* +${cleanedPhone}
📍 *Адреса доставки:* ${address}

🛒 *Товари:*
${itemsList}

💰 *Всього до сплати:* *${total} грн*`;

            // Шлем запрос на API Телеграма
            await fetch(`https://api.telegram.org/bot${botToken}/sendMessage`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    chat_id: chatId,
                    text: telegramMessage,
                    parse_mode: "Markdown" // Чтобы работал жирный шрифт и код
                })
            });
            
            console.log("Уведомление в Telegram успешно отправлено!");
        } catch (tgErr) {
            // Обернули в отдельный try-catch, чтобы если упадет ТГ, заказ в базе всё равно остался валидным
            console.error("Ошибка отправки в Telegram:", tgErr.message);
        }
        // ------------------------------------------

        res.json({ success: true, orderId, message: "Замовлення успішно створено!" });

    } catch (err) {
        console.error("Ошибка сохранения заказа:", err.message);
        res.status(500).json({ error: err.message });
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