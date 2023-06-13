const express = require('express');
const totalItemsAPI = require('./Routes/totalItemsAPI');
const nthMostTotalItemAPI = require('./Routes/nthMostTotalItemAPI');
const percentageOfDepartmentWiseSoldItemsAPI = require('./Routes/percentageOfDepartmentWiseSoldItemsAPI');
const monthlySalesAPI = require('./Routes/monthlySalesAPI');

const app = express();

// Mount the totalItemsAPI router
app.use('/api/total_items', totalItemsAPI);

// Mount the nthMostTotalItemAPI router
app.use('/api/nth_most_total_item', nthMostTotalItemAPI);

// Mount the percentageOfDepartmentWiseSoldItemsAPI router
app.use(
	'/api/percentage_of_department_wise_sold_items',
	percentageOfDepartmentWiseSoldItemsAPI,
);

// Mount the monthlySalesAPI router
app.use('/api/monthly_sales', monthlySalesAPI);

// Start the server
app.listen(3000, () => {
	console.log('Server started on port 3000');
});
