import React, { useEffect, useState } from "react";
import "./Page4.css";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";

function Page4() {
  const [data, setData] = useState([]);

  // Logic remains 100% untouched
  useEffect(() => {
    let count = 0;
    let currentVal = 10; // Starting point
    const MAX_LIMIT = 100;

    const interval = setInterval(() => {
      count += 1;

      setData((prevData) => {
        // Calculate a random step (e.g., 5 to 12)
        const step = 5 + Math.random() * 7;

        // Ensure the new value never exceeds 100
        const nextVal = Math.min(currentVal + step, MAX_LIMIT);

        // Update our tracker
        currentVal = nextVal;

        return [...prevData, { name: count, value: Math.round(nextVal) }];
      });

      // Stop if we hit the count limit OR the max value
      if (count >= 12 || currentVal >= MAX_LIMIT) {
        clearInterval(interval);
      }
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="page-4-container">
      <div className="p4-layout">

        {/* Left Side: The Chart */}
        <div className="chart-section retro-panel">
          <h2 className="pixel-title gold-text">EXP GROWTH SCANNER</h2>

          <div className="chart-wrapper mt-4">
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data}>
                {/* Darker grid for retro monitor feel */}
                <CartesianGrid stroke="#222" strokeDasharray="4 4" />

                {/* Custom styling injected directly into Recharts axes */}
                <XAxis
                  dataKey="name"
                  stroke="#00f0ff"
                  tick={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, fill: '#00f0ff' }}
                />
                <YAxis
                  domain={[0, 100]}
                  stroke="#00f0ff"
                  tick={{ fontFamily: '"Press Start 2P", monospace', fontSize: 8, fill: '#00f0ff' }}
                />

                {/* 8-bit styled tooltip */}
                <Tooltip
                  contentStyle={{
                    backgroundColor: '#000',
                    border: '2px solid #39ff14',
                    fontFamily: '"Press Start 2P", monospace',
                    fontSize: '10px',
                    boxShadow: '4px 4px 0px 0px rgba(0,0,0,1)'
                  }}
                  itemStyle={{ color: '#ff00ff' }}
                  labelStyle={{ color: '#fff', marginBottom: '5px' }}
                />

                {/* Sharp 'linear' lines instead of curved 'monotone' for that chunky retro feel */}
                <Line
                  type="linear"
                  dataKey="value"
                  stroke="#ff00ff"
                  strokeWidth={4}
                  dot={{ r: 4, fill: '#000', stroke: '#ff00ff', strokeWidth: 2 }}
                  activeDot={{ r: 6, fill: '#39ff14', stroke: '#fff', strokeWidth: 2 }}
                  animationDuration={500}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Right Side: The Terminal Text */}
        <div className="text-section">
          <div className="rpg-dialogue-box analysis-box">
            <h3 className="pixel-title-small blue-text blink">SYSTEM ANALYSIS</h3>

            <ul className="pixel-list mt-4">
              <li>
                <span className="green-text">&gt;</span>
                Track progress in real-time.
              </li>
              <li>
                <span className="green-text">&gt;</span>
                Watch the EXP curve rise with every cleared challenge!
              </li>
              <li>
                <span className="green-text">&gt;</span>
                Unlock maximum potential with our interactive toolkit.
              </li>
              <li>
                <span className="green-text">&gt;</span>
                Minigames and Quests guarantee a permanent stat boost!
              </li>
            </ul>
          </div>
        </div>

      </div>
    </div>
  );
}

export default Page4;