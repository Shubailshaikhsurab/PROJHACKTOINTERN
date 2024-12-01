import { useState } from 'react';
import { Pie } from 'react-chartjs-2';
import axios from 'axios';
import {
  Chart as ChartJS,
  ArcElement,
  Tooltip,
  Legend,
} from 'chart.js';

// Register Chart.js components
ChartJS.register(ArcElement, Tooltip, Legend);

// Gemini API Base URL
const GEMINI_BASE_URL = 'https://api.gemini.com/v1';

// Helper Function to Fetch Data from Gemini API
const fetchGeminiData = async (endpoint) => {
  try {
    const response = await axios.get(`${GEMINI_BASE_URL}${endpoint}`);
    return response.data;
  } catch (error) {
    console.error('Error fetching data from Gemini API:', error.message);
    return null;
  }
};

function App() {
  const [jsonInput, setJsonInput] = useState('');
  const [chartData, setChartData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleFetchFromGemini = async () => {
    setLoading(true);
    setError('');
    setChartData(null);

    try {
      const geminiData = await fetchGeminiData('/trades/btcusd');

      if (!geminiData || !Array.isArray(geminiData)) {
        throw new Error('Invalid data format from Gemini API.');
      }

      const labels = geminiData.slice(0, 10).map((trade, index) => `Trade ${index + 1}`);
      const values = geminiData.slice(0, 10).map((trade) => parseFloat(trade.amount));

      const data = {
        labels,
        datasets: [
          {
            label: 'Trade Volumes',
            data: values,
            backgroundColor: generateColors(labels.length),
            hoverOffset: 4,
          },
        ],
      };

      setChartData(data);
    } catch (err) {
      setError('Failed to fetch valid data from Gemini API. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleManualInput = () => {
    try {
      // coverting from  string to JSON 
      const parsedInput = JSON.parse(jsonInput);


      //check if lables and values exist
      if (!parsedInput.labels || !parsedInput.values) {
        // checking if lenght of lables and values are same 
        if(parsedInput.labels.length !== parsedInput.values.length) {
          throw new Error("Input must include 'labels' and 'values' arrays of equal length.");
        }
      }

      const data = {
        labels: parsedInput.labels,
        datasets: [
          {
            label: 'Manual Data',
            data: parsedInput.values,
            backgroundColor: generateColors(parsedInput.labels.length)
          },
        ],
      };

      setChartData(data);
    } catch (err) {
      setError('Invalid manual input. Please provide a valid JSON structure.');
    }
  };

  const generateColors = (count) => {
    const colors = [
      '#FF6384', '#36A2EB', '#FFCE56', '#8E44AD', '#2ECC71',
      '#F39C12', '#3498DB', '#E74C3C', '#1ABC9C', '#9B59B6',
    ];
    return Array.from({ length: count }, (_, i) => colors[i % colors.length]);
  };

  const styles = {
    container: {
      display: 'flex',
      height: '100vh',
    },
    sidebar: {
      width: '300px',
      padding: '20px',
      background: '#f8f9fa',
      boxShadow: '2px 0px 10px rgba(0, 0, 0, 0.1)',
    },
    main: {
      flex: 1,
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      textAlign: 'center',
    },
    input: {
      width: '100%',
      marginBottom: '10px',
      padding: '10px',
      borderRadius: '5px',
      border: '1px solid #ccc',
    },
    button: {
      display: 'block',
      width: '100%',
      padding: '10px',
      margin: '10px 0',
      border: 'none',
      borderRadius: '5px',
      background: '#007bff',
      color: '#fff',
      cursor: 'pointer',
    },
    chartContainer: {
      width: '600px',
      background: '#fff',
      padding: '20px',
      borderRadius: '10px',
      boxShadow: '0px 4px 10px rgba(0, 0, 0, 0.1)',
    },
  };

  return (
    <div style={styles.container}>
      <div style={styles.sidebar}>
        <h2>AI Chart Generator</h2>
        <input
          type="text"
          placeholder="Enter JSON structure"
          value={jsonInput}
          onChange={(event) => setJsonInput(event.target.value)}
          style={styles.input}
        />
        <button onClick={handleManualInput} style={styles.button}>
          Use Manual Input
        </button>
        <button onClick={handleFetchFromGemini} style={{ ...styles.button, background: '#28a745' }}>
          {loading ? 'Fetching...' : 'Fetch Gemini Data'}
        </button>
        {error && <p style={{ color: 'red' }}>{error}</p>}
      </div>
      <div style={styles.main}>
        {chartData !== null ? (
          <div style={styles.chartContainer}>
            <h3>Generated Chart</h3>
            <Pie data={chartData} />
          </div>
        ) : (
          <p>Enter data to generate your chart!</p>
        )}
      </div>
    </div>
  );
}

export default App;
