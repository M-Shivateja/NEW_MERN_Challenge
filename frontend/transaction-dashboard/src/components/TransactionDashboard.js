import React, { useState, useEffect } from "react";
import axios from "axios";
import Select from "react-select";
import Statistics from "./Statistics";
import BarChart from "./BarChart";
import "./TransactionDashboard.css";

const months = [
  { value: "January", label: "January" },
  { value: "February", label: "February" },
  { value: "March", label: "March" },
  { value: "April", label: "April" },
  { value: "May", label: "May" },
  { value: "June", label: "June" },
  { value: "July", label: "July" },
  { value: "August", label: "August" },
  { value: "September", label: "September" },
  { value: "October", label: "October" },
  { value: "November", label: "November" },
  { value: "December", label: "December" },
];

const TransactionDashboard = () => {
  const [transactions, setTransactions] = useState([]);
  const [search, setSearch] = useState("");
  const [month, setMonth] = useState(months[2]); // Default to March
  const [page, setPage] = useState(1);
  const [perPage] = useState(10);

  const fetchTransactions = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/transactions/list",
        {
          params: {
            search,
            month: month.value,
            page,
            perPage,
          },
        }
      );
      setTransactions(response.data.docs);
    } catch (error) {
      console.error("Error fetching transactions:", error);
    }
  };

  const fetchStatistics = async () => {
    try {
      const response = await axios.get(
        "http://localhost:3001/api/transactions/statistics",
        {
          params: { month: month.value },
        }
      );
      console.log("Statistics:", response.data);
    } catch (error) {
      console.error("Error fetching statistics:", error);
    }
  };

  useEffect(() => {
    fetchTransactions();
    fetchStatistics();
  }, [month, page, search]);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
  };

  const handleMonthChange = (selectedOption) => {
    setMonth(selectedOption);
    setPage(1); // Reset to first page when month changes
  };

  const handleNextPage = () => {
    setPage((prevPage) => prevPage + 1);
  };

  const handlePreviousPage = () => {
    setPage((prevPage) => (prevPage > 1 ? prevPage - 1 : 1));
  };

  return (
    <div className="transaction-dashboard">
      <h1>Transaction Dashboard</h1>
      <div className="controls">
        <input
          type="text"
          placeholder="Search transaction"
          value={search}
          onChange={handleSearchChange}
        />
        <Select value={month} onChange={handleMonthChange} options={months} />
      </div>
      <Statistics month={month.value} />
      <BarChart month={month.value} />
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Title</th>
            <th>Description</th>
            <th>Price</th>
            <th>Category</th>
            <th>Sold</th>
            <th>Image</th>
          </tr>
        </thead>
        <tbody>
          {transactions.map((transaction) => (
            <tr key={transaction.id}>
              <td>{transaction.id}</td>
              <td>{transaction.title}</td>
              <td>{transaction.description}</td>
              <td>{transaction.price}</td>
              <td>{transaction.category}</td>
              <td>{transaction.sold ? "Yes" : "No"}</td>
              <td>
                <img src={transaction.image} alt={transaction.title} />
              </td>
            </tr>
          ))}
        </tbody>
      </table>
      <div className="pagination">
        <button onClick={handlePreviousPage}>Previous</button>
        <span>Page No: {page}</span>
        <button onClick={handleNextPage}>Next</button>
      </div>
    </div>
  );
};

export default TransactionDashboard;
