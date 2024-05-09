import React, { Component } from 'react';
import axios from 'axios';
import { Bar, Line } from 'react-chartjs-2';
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
    selectedGraphType: 'Bar', // Default graph type
    availableDatasets: ['Dataset 1', 'Dataset 2'], // Simulate available datasets
    selectedDataset: 'Dataset 1', // Default dataset
  };

  async componentDidMount() {
    this.fetchChartData();
  }

  fetchChartData = async () => {
    try {
      const cache = localStorage.getItem(`chartData_${this.state.selectedDataset}`);
      if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        // Check if the cache is older than 5 minutes
        if (timestamp && (Date.now() - timestamp) < 300000) {
          this.updateChartData(data.labels, data.values);
          return;
        }
      }

      // Simulated: Adjust this logic to fetch data based on the selected dataset.
      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/data/${this.state.selectedDataset}`;
      const response = await axios.get(apiUrl);
      const { labels, values } = response.data;

      // Update chart and cache data
      this.updateChartData(labels, values);
      localStorage.setItem(`chartData_${this.state.selectedDataset}`, JSON.stringify({
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

  handleGraphTypeChange = (event) => {
    this.setState({ selectedGraphType: event.target.value });
  }

  handleDatasetChange = (event) => {
    this.setState({ selectedDataset: event.target.value }, () => {
      this.fetchChartData();
    });
  }

  renderGraph() {
    const { chartConfiguration, chartInteractivityOptions, selectedGraphType } = this.state;
    switch (selectedGraphType) {
      case 'Bar':
        return <Bar data={chartConfiguration} options={chartInteractivityOptions} />;
      case 'Line':
        return <Line data={chartConfiguration} options={chartInteractivityOptions} />;
      default:
        return null;
    }
  }

  render() {
    const { availableDatasets, selectedDataset, selectedGraphType } = this.state;

    return (
      <div>
        <h2>Interactive Data Visualization</h2>
        <div>
          <label>
            Select Graph Type:
            <select value={selectedGraphType} onChange={this.handleGraphTypeChange}>
              <option value="Bar">Bar</option>
              <option value="Line">Line</option>
            </select>
          </label>
          <label>
            Select Dataset:
            <select value={selectedDataset} onChange={this.handleDatasetChange}>
              {availableDatasets.map((dataset) => (
                <option key={dataset} value={dataset}>{dataset}</option>
              ))}
            </select>
          </label>
        </div>
        {this.renderGraph()}
      </div>
    );
  }
}

export default DataVisualizationTool;