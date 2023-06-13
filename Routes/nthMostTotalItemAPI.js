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
		console.log('CSV file successfully parsed in API 2.');
	});

// API endpoint: /api/nth_most_total_item
app.get('/', (req, res) => {
	const { item_by, start_date, end_date, n } = req.query;

	// Input validation
	if (!item_by || !start_date || !end_date || !n) {
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
	let result;
	if (item_by === 'quantity') {
		// Calculate the quantity sold for each item
		const itemQuantities = {};
		console.log('From quantity');
		filteredTransactions.forEach(transaction => {
			const { software, seats } = transaction;
			itemQuantities[software] = itemQuantities[software]
				? itemQuantities[software] + parseInt(seats)
				: parseInt(seats);
		});
		// Sort items by quantity sold in descending order
		const sortedItems = Object.entries(itemQuantities).sort(
			(a, b) => b[1] - a[1],
		);
		console.log(sortedItems);
		// Get the nth item by quantity sold
		result = sortedItems[n - 1] ? sortedItems[n - 1][0] : null;
	} else if (item_by === 'price') {
		// Calculate the total price for each item
		const itemPrices = {};
		console.log('from price');
		filteredTransactions.forEach(transaction => {
			const { software, amount } = transaction;
			const totalPrice = parseInt(amount);
			itemPrices[software] = itemPrices[software]
				? itemPrices[software] + totalPrice
				: totalPrice;
		});

		// Sort items by total price in descending order
		const sortedItems = Object.entries(itemPrices).sort((a, b) => b[1] - a[1]);
		console.log(sortedItems);
		// Get the nth item by total price
		result = sortedItems[n - 1] ? sortedItems[n - 1][0] : null;
	} else {
		return res
			.status(400)
			.json({ error: 'Invalid value for "item_by" parameter.' });
	}

	res.json({ nth_most_total_item: result });
});

module.exports = app;
