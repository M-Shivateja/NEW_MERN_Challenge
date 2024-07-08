const express = require("express");
const router = express.Router();
const transactionController = require("../controllers/transactionController");

router.get("/seed", transactionController.seedDatabase);

router.get("/list", transactionController.listTransactions);

router.get("/statistics", transactionController.getStatistics);

router.get("/bar-chart", transactionController.getBarChart);

router.get("/pie-chart", transactionController.getPieChart);

router.get("/combined", transactionController.getCombinedData);

module.exports = router;
