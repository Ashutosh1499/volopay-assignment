const express = require('express');
const bodyParser = require('body-parser');
const fs = require('fs');
const csv = require('csv-parser');

const app = express();
app.use(bodyParser.json());

const transactions = [];

// Read and parse the CSV file
fs.createReadStream('./data/transactions.csv')
	.pipe(csv())
	.on('data', data => transactions.push(data))
	.on('end', () => {
		console.log('CSV file successfully parsed in API 3.');
	});

// API endpoint: /api/percentage_of_department_wise_sold_items
app.get('/', (req, res) => {
	const { start_date, end_date } = req.query;

	// Input validation
	console.log(start_date, end_date);
	if (!start_date || !end_date) {
		return res.status(400).json({ error: 'Missing required parameters.' });
	}

	// Convert start_date and end_date to Date objects
	const startDate = new Date(start_date);
	const endDate = new Date(end_date);

	// Filter transactions based on date range
	const filteredTransactions = transactions.filter(transaction => {
		const transactionDate = new Date(transaction.date);
		return transactionDate >= startDate && transactionDate <= endDate;
	});

	// Calculate the total number of sold items for each department
	const departmentSoldItems = {};
	filteredTransactions.forEach(transaction => {
		const { department, seats } = transaction;
		departmentSoldItems[department] = departmentSoldItems[department]
			? departmentSoldItems[department] + parseInt(seats)
			: parseInt(seats);
	});

	// Calculate the total number of sold items
	const totalSoldItems = Object.values(departmentSoldItems).reduce(
		(total, quantity) => total + quantity,
		0,
	);

	// Calculate the percentage of sold items for each department
	const departmentPercentages = {};
	Object.entries(departmentSoldItems).forEach(([department, seats]) => {
		const percentage = ((seats / totalSoldItems) * 100).toFixed(2);
		departmentPercentages[department] = `${percentage}%`;
	});

	res.json(departmentPercentages);
});

module.exports = app;
