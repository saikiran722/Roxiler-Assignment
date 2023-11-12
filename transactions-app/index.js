const express = require('express');
const axios = require('axios');
const cors = require("cors");
const bodyParser = require('body-parser');

const app = express();
app.use(cors());
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

let database = [];
app.get('/initialize-database', async (req, res) => {
  try {
    const response = await axios.get('https://s3.amazonaws.com/roxiler.com/product_transaction.json');
    const seedData = response.data;
    database = seedData; 

    res.status(200).json({ message: 'Database initialized successfully' });
  } catch (error) {
    console.error('Error initializing database:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.get('/list-transactions', (req, res) => {
  const { month, search, page = 1, perPage = 10 } = req.query;
  let filteredTransactions = database; 

  
  if (month) {
    filteredTransactions = filteredTransactions.filter(transaction => {
      const transactionMonth = new Date(transaction.dateOfSale).getMonth() + 1; 
      return transactionMonth.toString() === month;
    });
  }

  if (search) {
    const searchTerm = search.toLowerCase();
    filteredTransactions = filteredTransactions.filter(transaction =>
      transaction.title.toLowerCase().includes(searchTerm) ||
      transaction.description.toLowerCase().includes(searchTerm) ||
      transaction.price.toString().includes(searchTerm)
    );
  }

  
  const startIndex = (page - 1) * perPage;
  const endIndex = startIndex + perPage;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndex);

  res.status(200).json({ message: 'List of transactions', data: paginatedTransactions });
});

app.get('/statistics', (req, res) => {
  const { month } = req.query;
  let totalSaleAmount = 0;
  let totalSoldItems = 0;
  let totalNotSoldItems = 0;

  totalSaleAmount = database.reduce((sum, transaction) => sum + transaction.price, 0);
  totalSoldItems = database.filter(transaction => transaction.sold).length;
  totalNotSoldItems = database.filter(transaction => !transaction.sold).length;

  res.status(200).json({
    message: 'Statistics',
    totalSaleAmount,
    totalSoldItems,
    totalNotSoldItems
  });
});


app.get('/bar-chart', (req, res) => {
  const { month } = req.query;

  const priceRanges = [
    { range: '0 - 100', count: 0 },
    { range: '101 - 200', count: 0 },
    { range: '201 - 300', count: 0 },
    { range: '301 - 400', count: 0 },
    { range: '401 - 500', count: 0 },
    { range: '501 - 600', count: 0 },
    { range: '601 - 700', count: 0 },
    { range: '701 - 800', count: 0 },
    { range: '801 - 900', count: 0 },
    { range: '901 - above', count: 0 },
  ];

 
  database.forEach(transaction => {
    const price = transaction.price;
    if (price <= 100) priceRanges[0].count++;
    else if (price <= 200) priceRanges[1].count++;
    else if (price <= 300) priceRanges[2].count++;
    else if (price <= 400) priceRanges[3].count++;
    else if (price <= 500) priceRanges[4].count++;
    else if (price <= 600) priceRanges[5].count++;
    else if (price <= 700) priceRanges[6].count++;
    else if (price <= 800) priceRanges[7].count++;
    else if (price <= 900) priceRanges[8].count++;
    else priceRanges[9].count++;
  });

  res.status(200).json({ message: 'Bar chart data', data: priceRanges });
});

app.get('/pie-chart', (req, res) => {
  const { month } = req.query;

  const categoryCounts = {};

  database.forEach(transaction => {
    const category = transaction.category;
    if (category) {
      categoryCounts[category] = (categoryCounts[category] || 0) + 1;
    }
  });

  const pieChartData = Object.entries(categoryCounts).map(([category, count]) => ({
    category,
    count
  }));

  res.status(200).json({ message: 'Pie chart data', data: pieChartData });
});


app.get('/combined-data', async (req, res) => {
  try {
    const initializeDatabaseResponse = await axios.get(`http://localhost:${PORT}/initialize-database`);
    const listTransactionsResponse = await axios.get(`http://localhost:${PORT}/list-transactions`);
    const statisticsResponse = await axios.get(`http://localhost:${PORT}/statistics`);

    const combinedData = {
      initializeDatabase: initializeDatabaseResponse.data,
      listTransactions: listTransactionsResponse.data,
      statistics: statisticsResponse.data
    };

    res.status(200).json({ message: 'Combined data', data: combinedData });
  } catch (error) {
    console.error('Error fetching combined data:', error);
    res.status(500).json({ error: 'Internal server error' });
  }
});

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
