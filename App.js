import React, { Component } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-zoom';

class DataVisualizationTool extends Component {
  state = {
    chartData: {
      labels: [],
      datasets: [
        {
          label: 'Dataset',
          data: [],
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        },
      ],
    },
    chartOptions: {
      responsive: true,
      plugins: {
        zoom: {
          pan: {
            enabled: true,
            mode: 'x',
          },
          zoom: {
            enabled: true,
            mode: 'x',
          },
        },
      },
    },
  };

  async componentDidMount() {
    try {
      // Load data from backend
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/data`;
      const response = await axios.get(apiUrl);
      const { labels, values } = response.data;

      this.setState((prevState) => ({
        chartData: {
          ...prevState.chartData,
          labels,
          datasets: [
            {
              ...prevState.chartData.datasets[0],
              data: values,
            },
          ],
        },
      }));
    } catch (error) {
      console.error('Fetching data failed:', error);
    }
  }

  render() {
    const { chartData, chartOptions } = this.state;

    return (
      <div>
        <h2>Interactive Data Visualization</h2>
        <Bar data={chartData} options={chartOptions} />
      </div>
    );
  }
}

export default DataVisualizationTool;