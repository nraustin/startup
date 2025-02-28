import React, { useState, useEffect } from "react";
import { LineChart, Line, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from "recharts";

export function StockChart({ stockSymbol }) {
    const [data, setData] = useState([]);
    const MIN_PRICE = 90;
    const MAX_PRICE = 110;

    useEffect(() => {
        const interval = setInterval(() => {
            setData((prevData) => {
                let prevPrice = prevData.length > 0 ? prevData[prevData.length- 1].price : 100;
                let change = Math.random() < 0.5 ? -1 : 1;
                let newPrice = Math.max(MIN_PRICE, Math.min(MAX_PRICE, prevPrice+change));

                let newDataPoint = { time: new Date().toLocaleTimeString(), price: newPrice };

                return [...prevData.slice(-20), newDataPoint]; 
            });
        }, 1000);

        return () => clearInterval(interval);
    }, []);

    return (
        <ResponsiveContainer width="100%" height={400}>
            <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="time" />
                <YAxis domain={[MIN_PRICE, MAX_PRICE]} />
                <Tooltip />
                <Line type="monotone" dataKey="price" stroke="#82ca9d" />
            </LineChart>
        </ResponsiveContainer>
    );
}