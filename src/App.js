import { Component } from 'react';
import axios from 'axios';
import './App.css'


const API_BASE_URL = 'http://localhost:3001';


class App extends Component {
  constructor(props) {
    super(props);

    this.state = {
      month: 3,
      searchText: '',
      transactions: [],
      currentPage: 1,
      statistics: {},
      barChartData: [],
    };
    this.loadTransactionsTable = this.loadTransactionsTable.bind(this);
    this.loadStatistics = this.loadStatistics.bind(this);
    this.loadBarChart = this.loadBarChart.bind(this);
    this.handleSearchChange = this.handleSearchChange.bind(this);
    this.handleMonthChange = this.handleMonthChange.bind(this);
    this.handleNextPage = this.handleNextPage.bind(this);
    this.handlePreviousPage = this.handlePreviousPage.bind(this);
  }

  componentDidMount() {
    this.loadTransactionsTable();
    this.loadStatistics();
    this.loadBarChart();
  }

  loadTransactionsTable() {
    const { month, searchText, currentPage } = this.state;

    axios.get(`${API_BASE_URL}/list-transactions?month=${month}&search=${searchText}&page=${currentPage}`)
      .then((response) => {
        this.setState({ transactions: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching transactions:', error);
      });
  }

  loadStatistics() {
    const { month } = this.state;

    axios.get(`${API_BASE_URL}/statistics?month=${month}`)
      .then((response) => {
        this.setState({ statistics: response.data });
      })
      .catch((error) => {
        console.error('Error fetching statistics:', error);
      });
  }

  loadBarChart() {
    const { month } = this.state;

    axios.get(`${API_BASE_URL}/bar-chart?month=${month}`)
      .then((response) => {
        this.setState({ barChartData: response.data.data });
      })
      .catch((error) => {
        console.error('Error fetching bar chart data:', error);
      });
  }

  handleSearchChange(e) {
    this.setState({ searchText: e.target.value });
  }

  handleMonthChange(e) {
    this.setState({ month: e.target.value });
  }

  handleNextPage() {
    this.setState((prevState) => ({ currentPage: prevState.currentPage + 1 }), this.loadTransactionsTable);
  }

  handlePreviousPage() {
    this.setState((prevState) => ({ currentPage: prevState.currentPage - 1 }), this.loadTransactionsTable);
  }

  render() {
    const { month, searchText, transactions, statistics, barChartData } = this.state;

    return (
      <div className="container mt-5">
        <h1>Transactions Dashboard</h1>
        <label htmlFor="monthSelector">Select Month:</label>
        <select id="monthSelector" value={month} onChange={this.handleMonthChange}>
          {[...Array(12).keys()].map((index) => (
            <option key={index + 1} value={index + 1}>
              {new Date(2000, index, 1).toLocaleString('en-US', { month: 'long' })}
            </option>
          ))}
        </select>

        <h2>Transactions Table</h2>
        <input type="text" placeholder="Search Transactions" value={searchText} onChange={this.handleSearchChange} />
        <button onClick={this.loadTransactionsTable}>Search</button>
        <table className="table">
          <thead>
            <tr>
              <th>Title</th>
              <th>Description</th>
              <th>Price</th>
            </tr>
          </thead>
          <tbody>
            {transactions.map((transaction) => (
              <tr key={transaction.id}>
                <td>{transaction.title}</td>
                <td>{transaction.description}</td>
                <td>{transaction.price}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={this.handlePreviousPage}>Previous</button>
        <button onClick={this.handleNextPage}>Next</button>
        <h2>Transactions Statistics</h2>
        <div className='statistics-box'>
          <p>Total Sale Amount: {statistics.totalSaleAmount}</p>
          <p>Total Sold Items: {statistics.totalSoldItems}</p>
          <p>Total Not Sold Items: {statistics.totalNotSoldItems}</p>
        </div>
        <h2>Transactions Bar Chart</h2>
        <div className= "chart-bar">
          {barChartData.map((dataPoint) => (
            <div key={dataPoint.range}>
              <p>{dataPoint.range}</p>
              <p>Number of Items: {dataPoint.count}</p>
            </div>
          ))}
        </div>
      </div>
    );
  }
}

export default App;


