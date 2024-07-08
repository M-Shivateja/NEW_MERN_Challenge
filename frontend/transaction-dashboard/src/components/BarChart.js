import React, { useState, useEffect } from "react";
import axios from "axios";

const BarChart = ({ month }) => {
  const [chartData, setChartData] = useState(null);

  useEffect(() => {
    const fetchChartData = async () => {
      try {
        const response = await axios.get(
          "http://localhost:3001/api/transactions/chart",
          {
            params: { month },
          }
        );
        setChartData(response.data);
      } catch (error) {
        console.error("Error fetching chart data:", error);
      }
    };

    fetchChartData();
  }, [month]);
  if (!chartData) {
    return <p>Loading chart data...</p>;
  }

  return (
    <div>
      <h2>Bar Chart for {month}</h2>
    </div>
  );
};

export default BarChart;
