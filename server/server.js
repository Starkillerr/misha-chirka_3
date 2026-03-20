import express from "express";
import crypto from "crypto";
import fetch from "node-fetch";
import path from "path";
import { fileURLToPath } from "url";
import cors from "cors";
import dotenv from "dotenv"; 

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.join(__dirname, ".env") });

const app = express();
app.use(express.json()); // Стандартный парсер для JSON
app.use(cors({origin: "http://localhost:5173"}));

const PORT = process.env.PORT || 4000;
const NP_URL = "https://api.novaposhta.ua/v2.0/json/";

// --- LIQPAY: Создание данных для оплаты ---
app.post("/api/create-payment", (req, res) => {
    const { amount, order_id } = req.body;
    const public_key = process.env.LIQPAY_PUBLIC_KEY;
    const private_key = process.env.LIQPAY_PRIVATE_KEY;

    if (!amount || !order_id) {
        return res.status(400).json({ error: "Missing amount or order_id" });
    }

    const jsonString = JSON.stringify({
        version: "3",
        public_key,
        action: "pay",
        amount,
        currency: "UAH",
        description: `Замовлення #${order_id}`,
        order_id,
        sandbox: 1 // Убери это поле перед выходом в продакшн
    });

    const data = Buffer.from(jsonString).toString("base64");
    
    // ИСПРАВЛЕНО: Правильный алгоритм подписи для LiqPay
    const signature = crypto
        .createHash("sha1")
        .update(private_key + data + private_key)
        .digest("base64");

    res.json({ data, signature });
});

// --- NOVA POSHTA: Поиск города (теперь с фильтром) ---
app.get("/api/np-cities", async (req, res) => {
    const cityName = req.query.name || ""; // Берем из ?name=Одеса
    
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
                    CitySender: process.env.NP_CITY_REF, // Тот самый Ref из Postman
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