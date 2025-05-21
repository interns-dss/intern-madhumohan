import React, { useState } from "react";
import axios from "axios";
import { PieChart, Pie, Tooltip, Cell } from "recharts";

const COLORS = ["#00C49F", "#FFBB28", "#FF8042"];

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CSV file");

    const formData = new FormData();
    formData.append("file", file);

    try {
      const response = await axios.post("http://127.0.0.1:5000/upload", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setData(response.data);
    } catch (error) {
      alert("Error uploading file!");
    }
  };

  const chartData = data
    ? Object.keys(data.stats).map((key, index) => ({
        name: key,
        value: data.stats[key],
        color: COLORS[index % COLORS.length],
      }))
    : [];

  return (
    <div className="min-h-screen flex flex-col items-center p-8 bg-gray-100">
      <h1 className="text-2xl font-bold mb-4">Sentiment Analysis</h1>
      <input type="file" onChange={handleFileChange} className="mb-4 p-2 border rounded" />
      <button onClick={handleUpload} className="bg-blue-500 text-white px-4 py-2 rounded">
        Upload & Analyze
      </button>

      {data && (
        <div className="mt-6">
          <h2 className="text-lg font-semibold">Results:</h2>
          <PieChart width={400} height={400}>
            <Pie data={chartData} cx={200} cy={200} outerRadius={120} dataKey="value">
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={entry.color} />
              ))}
            </Pie>
            <Tooltip />
          </PieChart>
        </div>
      )}
    </div>
  );
}

export default App;