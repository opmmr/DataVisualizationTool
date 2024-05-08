import React, { Component } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-zoom';

class DataVisualizationTool extends Component {
  state = {
    chartConfiguration: {
      labels: [],
      datasets: [
        {
          label: 'Dataset Name',
          data: [],
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        },
      ],
    },
    chartInteractivityOptions: {
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
    this.fetchChartData();
  }

  fetchChartData = async () => {
    try {
      const cache = localStorage.getItem('chartData');
      if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        // Check if the cache is older than 5 minutes
        if (timestamp && (Date.now() - timestamp) < 300000) {
          this.updateChartData(data.labels, data.values);
          return;
        }
      }

      // Load data from backend
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/data`;
      const response = await axios.get(apiUrl);
      const { labels, values } = response.data;

      // Update chart and cache data
      this.updateChartData(labels, values);
      localStorage.setItem('chartData', JSON.stringify({
        data: { labels, values },
        timestamp: Date.now(),
      }));
    } catch (error) {
      console.error('Error fetching chart data:', error);
    }
  }

  updateChartData = (labels, values) => {
    this.setState((prevState) => ({
      chartConfiguration: {
        ...prevState.chartConfiguration,
        labels,
        datasets: [
          {
            ...prevState.chartConfiguration.datasets[0],
            data: values,
          },
        ],
      },
    }));
  }

  render() {
    const { chartConfiguration, chartInteractivityOptions } = this.state;

    return (
      <div>
        <h2>Interactive Data Visualization</h2>
        <Bar data={chartConfiguration} options={chartInteractivityOptions} />
      </div>
    );
  }
}

export default DataVisualizationTool;