const axios = require("axios");
const Transaction = require("../models/transaction");

exports.seedDatabase = async (req, res) => {
  try {
    const response = await axios.get(
      "https://s3.amazonaws.com/roxiler.com/product_transaction.json"
    );
    const transactions = response.data.map((transaction) => ({
      ...transaction,
      dateOfSale: isValidDate(transaction.dateOfSale)
        ? new Date(transaction.dateOfSale)
        : null,
    }));

    await Transaction.deleteMany({});
    await Transaction.insertMany(transactions);

    res.status(200).json({ message: "Database seeded successfully" });
  } catch (error) {
    res.status(500).json({ message: "Error seeding database", error });
  }
};

function isValidDate(dateString) {
  const d = new Date(dateString);
  return d instanceof Date && !isNaN(d);
}

// List transactions with search and pagination
exports.listTransactions = async (req, res) => {
  const { search = "", page = 1, perPage = 10 } = req.query;

  const query = {
    $or: [
      { title: { $regex: search, $options: "i" } },
      { description: { $regex: search, $options: "i" } },
      { price: { $regex: search, $options: "i" } },
    ],
  };

  const options = {
    page: parseInt(page),
    limit: parseInt(perPage),
  };

  try {
    const transactions = await Transaction.paginate(query, options);
    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Error fetching transactions", error });
  }
};

// Get statistics for a selected month
exports.getStatistics = async (req, res) => {
  const { month } = req.query;

  try {
    const startDate = new Date(`${month} 1, 2023`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const totalSales = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: "$price" },
          soldItems: { $sum: 1 },
          notSoldItems: { $sum: { $cond: ["$sold", 0, 1] } },
        },
      },
    ]);

    res.status(200).json(totalSales[0]);
  } catch (error) {
    res.status(500).json({ message: "Error fetching statistics", error });
  }
};

// Get bar chart data for a selected month
exports.getBarChart = async (req, res) => {
  const { month } = req.query;

  try {
    const startDate = new Date(`${month} 1, 2023`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const priceRanges = [
      { range: "0-100", min: 0, max: 100 },
      { range: "101-200", min: 101, max: 200 },
      { range: "201-300", min: 201, max: 300 },
      { range: "301-400", min: 301, max: 400 },
      { range: "401-500", min: 401, max: 500 },
      { range: "501-600", min: 501, max: 600 },
      { range: "601-700", min: 601, max: 700 },
      { range: "701-800", min: 701, max: 800 },
      { range: "801-900", min: 801, max: 900 },
      { range: "901-above", min: 901, max: Infinity },
    ];

    const barChartData = await Promise.all(
      priceRanges.map(async (range) => {
        const count = await Transaction.countDocuments({
          dateOfSale: { $gte: startDate, $lt: endDate },
          price: { $gte: range.min, $lt: range.max },
        });
        return { range: range.range, count };
      })
    );

    res.status(200).json(barChartData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching bar chart data", error });
  }
};

// Get pie chart data for a selected month
exports.getPieChart = async (req, res) => {
  const { month } = req.query;

  try {
    const startDate = new Date(`${month} 1, 2023`);
    const endDate = new Date(startDate);
    endDate.setMonth(startDate.getMonth() + 1);

    const pieChartData = await Transaction.aggregate([
      { $match: { dateOfSale: { $gte: startDate, $lt: endDate } } },
      { $group: { _id: "$category", count: { $sum: 1 } } },
      { $project: { category: "$_id", count: 1, _id: 0 } },
    ]);

    res.status(200).json(pieChartData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching pie chart data", error });
  }
};

// Combine data from other APIs
exports.getCombinedData = async (req, res) => {
  const { month, search, page, perPage } = req.query;

  try {
    const transactions = await listTransactions({
      query: { search, page, perPage },
    });
    const statistics = await getStatistics({ query: { month } });
    const barChart = await getBarChart({ query: { month } });
    const pieChart = await getPieChart({ query: { month } });

    const combinedData = {
      transactions: transactions.data,
      statistics: statistics.data,
      barChart: barChart.data,
      pieChart: pieChart.data,
    };

    res.status(200).json(combinedData);
  } catch (error) {
    res.status(500).json({ message: "Error fetching combined data", error });
  }
};
