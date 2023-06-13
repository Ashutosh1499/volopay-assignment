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
		console.log('CSV file successfully parsed in API 4.');
	});

// API endpoint: /api/monthly_sales
app.get('/', (req, res) => {
	const { product, year } = req.query;

	// Input validation
	if (!product || !year) {
		return res.status(400).json({ error: 'Missing required parameters.' });
	}

	// Filter transactions based on product and year
	const filteredTransactions = transactions.filter(transaction => {
		const transactionYear = new Date(transaction.date).getFullYear();
		const transactionProduct = transaction.software.toLowerCase();
		return (
			transactionYear === parseInt(year) &&
			transactionProduct.toLowerCase() === product.toLowerCase()
		);
	});

	// Calculate monthly sales for the product
	const monthlySales = new Array(12).fill(0);
	filteredTransactions.forEach(transaction => {
		const transactionMonth = new Date(transaction.date).getMonth();
		const transactionQuantity = parseInt(transaction.seats);
		monthlySales[transactionMonth] += transactionQuantity;
	});

	res.json(monthlySales);
});

module.exports = app;
