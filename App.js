import React, { Component } from 'react';
import axios from 'axios';
import { Bar } from 'react-chartjs-2';
import 'chartjs-plugin-zoom';

class App extends Component {
  state = {
    data: {
      labels: [],
      datasets: [
        {
          label: 'Dataset',
          data: [],
          backgroundColor: 'rgba(75,192,192,0.4)',
          borderColor: 'rgba(75,192,192,1)',
          borderWidth: 1,
        }
      ]
    },
    options: {
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
          }
        }
      }
    }
  };

  async componentDidMount() {
    try {
      const response = await axios.get(`${process.env.REACT_APP_BACKEND_URL}/data`);
      const { labels, values } = response.data;

      // Update chart data
      this.setState(prevState => ({
        data: {
          ...prevState.data,
          labels: labels,
          datasets: [
            {
              ...prevState.data.datasets[0],
              data: values
            }
          ]
        }
      }));
    } catch (error) {
          console.error('Fetching data failed:', error);
    }
  }

  render() {
    return (
      <div>
        <h2>Interactive Data Visualization</h2>
        <Bar data={this.state.data} options={this.state.options} />
      </div>
    );
  }
}

export default App;