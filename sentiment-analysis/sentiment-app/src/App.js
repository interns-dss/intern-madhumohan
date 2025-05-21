import React, { useState, useEffect } from "react";
import axios from "axios";
import {
  PieChart,
  Pie,
  Tooltip,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Legend,
  LineChart,
  Line,
} from "recharts";
import { motion } from "framer-motion";

const COLORS = { positive: "#4CAF50", negative: "#FF0000", neutral: "#FFD700" }; // Green, Red, Yellow

const Button = ({ children, onClick, className }) => (
  <motion.button
    whileHover={{
      scale: 1.1,
      boxShadow: "0px 0px 10px rgba(255, 255, 255, 0.7)",
    }}
    whileTap={{ scale: 0.95 }}
    onClick={onClick}
    className={`px-4 py-2 rounded-full font-semibold transition-all ${className}`}
  >
    {children}
  </motion.button>
);

function App() {
  const [file, setFile] = useState(null);
  const [data, setData] = useState(null);
  const [filter, setFilter] = useState("all");
  const [uploadStatus, setUploadStatus] = useState(null); // New state for upload feedback
  const [showLegend, setShowLegend] = useState(false); // New state to control legend visibility

  useEffect(() => {
    // Add chatbot script dynamically when the component loads
    const script = document.createElement("script");
    script.src = "https://udify.app/embed.min.js";
    script.id = "D4BSAycJV2vTwpJg";
    script.defer = true;
    script.onload = () => {
      console.log("Chatbot script loaded");
  
      // Set up the chatbot configuration
      window.difyChatbotConfig = {
        token: "D4BSAycJV2vTwpJg",
      };
  
      // Check if the chatbot object exists and call show method
      const checkChatbotAvailability = () => {
        if (window.difyChatbot && typeof window.difyChatbot.show === "function") {
          window.difyChatbot.show();
          console.log("Chatbot is shown.");
        } else {
          console.log("Chatbot is not available yet, retrying...");
          setTimeout(checkChatbotAvailability, 500); // Retry after 500ms
        }
      };
  
      // Try to show the chatbot once the script is loaded
      checkChatbotAvailability();
    };
  
    document.body.appendChild(script);
  
    // Cleanup the chatbot script when the component unmounts
    return () => {
      const existingScript = document.getElementById("D4BSAycJV2vTwpJg");
      if (existingScript) {
        existingScript.remove();
      }
    };
  }, []);
  

  const handleFileChange = (e) => setFile(e.target.files[0]);

  const handleUpload = async () => {
    if (!file) return alert("Please upload a CSV file");
    const formData = new FormData();
    formData.append("file", file);
    try {
      const response = await axios.post(
        "http://127.0.0.1:5000/upload",
        formData,
        {
          headers: { "Content-Type": "multipart/form-data" },
        }
      );
      setData(response.data);
      setUploadStatus({
        message: "File uploaded successfully!",
        type: "positive", // Green box
      });
      setShowLegend(true); // Show the color legend after upload
    } catch (error) {
      setUploadStatus({
        message: "Error uploading file. Please try again.",
        type: "negative", // Red box
      });
      setShowLegend(true); // Show the color legend after upload
    }
  };

  const handleClear = () => {
    setFile(null);
    setData(null);
    setUploadStatus(null); // Clear status
    setShowLegend(false); // Hide legend when file is cleared
    document.getElementById("fileInput").value = ""; // Clear file input field
  };

  const chartData = data
    ? Object.keys(data.stats).map((key) => ({
        name: key.charAt(0).toUpperCase() + key.slice(1),
        value: data.stats[key],
        color: COLORS[key] || "#8884d8",
      }))
    : [];

  const feedbackList = data?.feedback || [];
  const filteredFeedback =
    filter === "all"
      ? feedbackList
      : feedbackList.filter(
          (f) => f.Sentiment.toLowerCase() === filter.toLowerCase()
        );

  return (
    <div className="min-h-screen flex flex-col items-center p-6 bg-gradient-to-r from-pink-500 to-blue-500 text-white">
      <motion.h1
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 1 }}
        className="text-4xl font-extrabold mb-6 bg-gradient-to-r from-yellow-400 to-pink-500 text-transparent bg-clip-text"
      >
        Sentiment Analysis Dashboard
      </motion.h1>

      <div className="flex flex-col items-center gap-3 p-6 bg-gray-800 rounded-2xl shadow-2xl border-2 border-gray-700">
        <input
          id="fileInput"
          type="file"
          onChange={handleFileChange}
          className="p-2 border rounded bg-white text-black"
        />
        <div className="flex gap-3">
          <Button
            onClick={handleUpload}
            className="bg-blue-500 text-white shadow-lg"
          >
            Upload & Analyze
          </Button>
          {file && (
            <Button
              onClick={handleClear}
              className="bg-red-500 text-white shadow-lg"
            >
              Clear File
            </Button>
          )}
        </div>
      </div>

      {uploadStatus && (
        <div
          className={`mt-4 p-4 rounded-md text-white text-center ${COLORS[uploadStatus.type]}-500`}
        >
          {uploadStatus.message}
        </div>
      )}

      {showLegend && (
        <div className="absolute top-4 right-4 bg-white p-4 rounded-lg shadow-lg w-48 text-black text-sm">
          <h3 className="font-semibold mb-2">General</h3>
          <ul>
            <li className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS.positive }}
              ></span>
              Positive
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS.negative }}
              ></span>
              Negative
            </li>
            <li className="flex items-center gap-2">
              <span
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: COLORS.neutral }}
              ></span>
              Neutral
            </li>
          </ul>
        </div>
      )}

      {data && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1.5 }}
            className="mt-8 w-full grid grid-cols-1 md:grid-cols-3 gap-6"
          >
            <div className="bg-white p-6 rounded-xl shadow-lg text-black border-2 border-pink-500">
              <h2 className="text-lg font-semibold text-center">
                Sentiment Distribution
              </h2>
              <PieChart width={250} height={250}>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  innerRadius={40}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`cell-${index}`}
                      fill={COLORS[entry.name.toLowerCase()] || "#8884d8"}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-black border-2 border-blue-500">
              <h2 className="text-lg font-semibold text-center">
                Sentiment Bar Chart
              </h2>
              <BarChart width={250} height={200} data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="name" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Legend />
                <Bar dataKey="value">
                  {chartData.map((entry, index) => (
                    <Cell
                      key={`bar-cell-${index}`}
                      fill={COLORS[entry.name.toLowerCase()] || "#8884d8"}
                    />
                  ))}
                </Bar>
              </BarChart>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg text-black border-2 border-orange-500">
              <h2 className="text-lg font-semibold text-center">
                Sentiment Line Chart
              </h2>
              <LineChart width={250} height={200} data={chartData}>
                <XAxis dataKey="name" stroke="#333" />
                <YAxis stroke="#333" />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="value" stroke="#ff6384" />
              </LineChart>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 2 }}
            className="mt-6 w-full"
          >
            <h2 className="text-lg font-semibold text-white mb-3 text-center">
              Feedback List
            </h2>

            <div className="flex justify-center space-x-3 my-3">
              <Button
                onClick={() => setFilter("all")}
                className="bg-gray-500 text-white"
              >
                All
              </Button>
              <Button
                onClick={() => setFilter("positive")}
                className="bg-pink-500 text-white"
              >
                Positive
              </Button>
              <Button
                onClick={() => setFilter("negative")}
                className="bg-blue-500 text-white"
              >
                Negative
              </Button>
              <Button
                onClick={() => setFilter("neutral")}
                className="bg-orange-500 text-white"
              >
                Neutral
              </Button>
            </div>

            <table className="w-full bg-white shadow-lg rounded-lg text-black text-center text-sm">
              <thead>
                <tr className="bg-gray-300">
                  <th className="p-2">Feedback</th>
                  <th className="p-2">Sentiment</th>
                </tr>
              </thead>
              <tbody>
                {filteredFeedback.map((item, index) => (
                  <tr
                    key={index}
                    className="border-b hover:bg-gray-200 transition-all"
                  >
                    <td className="p-2">{item.comments}</td>
                    <td
                      className="p-2 font-bold text-center"
                      style={{
                        color: COLORS[item.Sentiment.toLowerCase()],
                        backgroundColor: `${
                          COLORS[item.Sentiment.toLowerCase()]
                        }30`, // Lighter background
                        borderRadius: "5px",
                        padding: "5px",
                      }}
                    >
                      {item.Sentiment}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </motion.div>
        </>
      )}

      {/* Chatbot will automatically be injected here */}
    </div>
  );
}

export default App;
