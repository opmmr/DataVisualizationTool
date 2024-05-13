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
    selectedGraphType: 'Bar',
    availableDatasets: ['Dataset 1', 'Dataset 2'],
    selectedDataset: 'Dataset 1',
    error: null, // State property to track any errors
  };

  async componentDidMount() {
    this.fetchChartData();
  }

  fetchChartData = async () => {
    try {
      // Reset error state on new fetch attempt
      this.setState({ error: null });

      const cache = localStorage.getItem(`chartData_${this.state.selectedDataset}`);
      if (cache) {
        const { data, timestamp } = JSON.parse(cache);
        if (timestamp && (Date.now() - timestamp) < 300000) {
          this.updateChartData(data.labels, data.values);
          return;
        }
      }

      const apiUrl = `${process.env.REACT_APP_BACKEND_URL}/data/${this.state.selectedDataset}`;
      const response = await axios.get(apiUrl);
      const { labels, values } = response.data;

      this.updateChartData(labels, values);
      localStorage.setItem(`chartData_${this.state.selectedDataset}`, JSON.stringify({
        data: { labels, values },
        timestamp: Date.now(),
      }));
    } catch (error) {
      this.setState({ error: 'Error fetching chart data. Please try again later.' });
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
    this.setState({ selectedDataset: event.target.value }, this.fetchChartData);
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
    const { availableDatasets, selectedDataset, selectedGraphType, error } = this.state;

    return (
      <div>
        <h2>Interactive Data Visualization</h2>
        {error && <div style={{ color: 'red' }}>Error: {error}</div>}
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