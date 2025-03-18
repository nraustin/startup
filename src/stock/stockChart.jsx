import React, { useState, useEffect, useCallback} from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export function StockChart({stockSymbol, mockStockPrice}) {
    const [data, setData] = useState([]);
    const [timeframe, setTimeframe] = useState("5m");
    const [lastPrice, setLastPrice] = useState(null);
    const [marketStatus, setMarketStatus] = useState('loading');

    useEffect(() => {
        async function fetchStockData() {
            try {
                const response = await fetch(`/api/stocks/stock-data?symbol=${stockSymbol}&timeframe=${timeframe}`);
                if (!response.ok) {
                    throw new Error("Failed to fetch stock data");
                }
                const result = await response.json();
                setData(result.data);
                setMarketStatus(result.marketStatus);
                setLastPrice(result.price.toFixed(2));
            } catch (err) {
                console.error("Error fetching stock data:", err);
            }
        }

        fetchStockData();
    }, [stockSymbol, timeframe]);
 
    const setupWebSocket = useCallback(() => {
        if (timeframe !== "5m") {
            return;
        };
        const ws = new WebSocket(`wss://socket.polygon.io/stocks`);

        ws.onopen = () => {
            console.log("WebSocket connected. Subscribing to:", stockSymbol);
            ws.send(JSON.stringify({action: "subscribe", params: `T.${stockSymbol}`}));
        };
        ws.onmessage = (event) => {
            const parsedData = JSON.parse(event.data);
            const tradeData = parsedData.find(item => item.ev === "T");

            if (tradeData) {
                setLastPrice(tradeData.p);
                setData(prevData => [...prevData.slice(-50), {time: new Date().toLocaleTimeString(), price: tradeData.p }]);
            }
        };
        ws.onerror = (err) => console.error("WebSocket error:", err);
        ws.onclose = () => console.log("WebSocket closed");

        return () => ws.close();
    }, [stockSymbol, timeframe]);

    useEffect(() => {
        const cleanup = setupWebSocket();
        return cleanup;
    }, [setupWebSocket]);

    return (
        <div>
            <h3>{stockSymbol} ${lastPrice} USD</h3>
                {marketStatus.market === 'closed' && (<p>The market is currently closed. Displaying previous day's data.</p>)}
                {marketStatus.earlyHours && (<p>Pre-market</p>)}
                {marketStatus.afterHours && (<p>After-hours</p>)}
            <select onChange={(e) => setTimeframe(e.target.value)} value={timeframe}>
                <option value="5m">Live: Last 5 minutes</option>
                <option value="1d">1 Day</option>
                <option value="1w">1 Week</option>
                <option value="1m">1 Month</option>
            </select>

            <ResponsiveContainer width="100%" height={400}>
                <LineChart data={data}>
                    <XAxis dataKey="time" />
                    <YAxis domain={["auto", "auto"]} />
                    <Tooltip />
                    <Line type="monotone" dataKey="price" stroke="#82ca9d" dot={false}/>
                </LineChart>
            </ResponsiveContainer>
        </div>
    );
}