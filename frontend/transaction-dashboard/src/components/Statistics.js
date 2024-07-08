import React, { useState, useEffect } from "react";
import axios from "axios";

const Statistics = ({ month }) => {
  const [statistics, setStatistics] = useState(null);

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/transactions/statistics",
        {
          params: { month },
        }
      );
      setStatistics(response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchStatistics();
  }, [month]);

  if (!statistics) {
    return <p>Loading statistics...</p>;
  }

  return (
    <div>
      <h2>Statistics for {month}</h2>
      <p>Total Transactions: {statistics.totalTransactions}</p>
      <p>Total Revenue: {statistics.totalRevenue}</p>
    </div>
  );
};

export default Statistics;
