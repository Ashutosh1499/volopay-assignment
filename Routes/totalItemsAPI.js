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
		console.log('CSV file successfully parsed in API 1.');
	});

// API endpoint: /api/total_items
app.get('/', (req, res) => {
	const { start_date, end_date, department } = req.query;

	// Input validation
	if (!start_date || !end_date || !department) {
		return res.status(400).json({ error: 'Missing required parameters.' });
	}

	// Convert start_date and end_date to Date objects
	const startDate = new Date(start_date);
	const endDate = new Date(end_date);

	// Filter transactions based on date range and department
	const filteredTransactions = transactions.filter(transaction => {
		const transactionDate = new Date(transaction.date);
		return (
			transactionDate >= startDate &&
			transactionDate <= endDate &&
			transaction.department.toLowerCase() === department.toLowerCase()
		);
	});

	// Calculate the total number of items sold
	const totalItemsSold = filteredTransactions
		.map(eachTransaction => eachTransaction.seats)
		.reduce((total, seat) => total + parseInt(seat), 0);

	res.json({ total_items: totalItemsSold });
});

module.exports = app;
