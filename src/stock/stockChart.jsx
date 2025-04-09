import React, { useState, useEffect, useRef} from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export function StockChart({stockSymbol, onPriceUpdate}) {
    const [data, setData] = useState([]);
    const wsRef = useRef(null);
    const [timeframe, setTimeframe] = useState("live");
    const [lastPrice, setLastPrice] = useState(null);
    const [marketStatus, setMarketStatus] = useState('loading');

    useEffect(() => {
        if (timeframe === "live") return;
        async function fetchStockData() {
            try {
                const response = await fetch(`/api/stocks/stock-data?symbol=${stockSymbol}&timeframe=${timeframe}`);
                const result = await response.json();
                setData(result.data);
                setMarketStatus(result.marketStatus);
                setLastPrice(result.price.toFixed(2));
                onPriceUpdate?.(result.price);
            } catch (err) {
                console.error("Error fetching stock data", err);
            }
        }

        fetchStockData();
    }, [stockSymbol, timeframe]);
 
    useEffect(() => {
        if (timeframe !== "live") return;
        async function preloadTodayData() {
            try {
              const response = await fetch(`/api/stocks/live-history?symbol=${stockSymbol}`);
              const result = await response.json();
              setData(result.data);
              setLastPrice(result.price?.toFixed(2));
              onPriceUpdate?.(result.price);
            } catch (err) {
              console.error("Error preloading day data", err);
            }
          }
        
        preloadTodayData();

        const protocol = window.location.protocol === 'https:' ? 'wss' : 'ws';
        const host = import.meta.env.DEV ? 'localhost:4000' : window.location.host;
        const ws = new WebSocket(`${protocol}://${host}/polygon`);
        wsRef.current = ws;
        ws.onopen = () => {
            ws.send(JSON.stringify({type: 'subscribe', symbol: stockSymbol}));
        };
        ws.onmessage = (event) => {
            const parsed = JSON.parse(event.data);
            if (parsed.ev === "A" && parsed.sym === stockSymbol) {
                const closePrice = parsed.c
                const barEnd = new Date(parsed.e)
                const formattedTime = barEnd.toLocaleTimeString(); 

                setData((prevData) => {
                    const newPoint = {time: formattedTime, price: closePrice};
                    const updated = [...prevData, newPoint];
                    return updated;
                });
                setLastPrice(closePrice.toFixed(2));
            }
        };
        ws.onerror = (err) => console.error("WS error:", err);
        ws.onclose = () => console.log("WS closed");

        return () => {
            if (wsRef.current) {
                wsRef.current.close();
                }
            };
    }, [stockSymbol, timeframe]);


    return (
        <div>
            <h3>{stockSymbol} ${lastPrice} USD</h3>
                {marketStatus.market === 'closed' && (<p>The market is currently closed. Displaying previous day's data.</p>)}
                {marketStatus.earlyHours && (<p>Pre-market</p>)}
                {marketStatus.afterHours && (<p>After-hours</p>)}
            <select onChange={(e) => setTimeframe(e.target.value)} value={timeframe}>
                <option value="live">Live Updates: Today</option>
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