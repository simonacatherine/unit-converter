import { useState, useEffect } from "react";
import axios from "axios";

const conversionFactors = {
  cm: { m: 0.01, km: 0.00001, inch: 0.3937, ft: 0.0328 },
  m: { cm: 100, km: 0.001, inch: 39.37, ft: 3.281 },
  km: { cm: 100000, m: 1000, inch: 39370, ft: 3281 },
  inch: { cm: 2.54, m: 0.0254, km: 0.0000254, ft: 0.0833 },
  ft: { cm: 30.48, m: 0.3048, km: 0.0003048, inch: 12 },
};

export default function App() {
  const [conversions, setConversions] = useState([
    { fromUnit: "cm", toUnit: "m", value: "", result: "" },
  ]);
  const [showHistory, setShowHistory] = useState(false);
  const [history, setHistory] = useState([]);

  const handleInputChange = (index, field, value) => {
    const updated = [...conversions];
    updated[index][field] = value;
    setConversions(updated);
  };

  const addConversion = () => {
    setConversions([
      ...conversions,
      { fromUnit: "cm", toUnit: "m", value: "", result: "" },
    ]);
  };

  const removeConversion = (index) => {
    setConversions(conversions.filter((_, i) => i !== index));
  };

  const convertUnits = async () => {
    const updated = await Promise.all(
      conversions.map(async ({ fromUnit, toUnit, value }) => {
        if (
          !value ||
          isNaN(value) ||
          !conversionFactors[fromUnit]?.[toUnit]
        ) {
          return { fromUnit, toUnit, value, result: "Invalid" };
        }
        const result = (
          parseFloat(value) * conversionFactors[fromUnit][toUnit]
        ).toFixed(2);
        const conversion = { fromUnit, toUnit, value, result };

        try {
          await axios.post("http://localhost:5000/api/conversions", conversion);
        } catch (err) {
          console.error("Error saving:", err);
        }

        return conversion;
      })
    );
    setConversions(updated);
    fetchHistory();
  };

  const fetchHistory = async () => {
    try {
      const res = await axios.get("http://localhost:5000/api/conversions");
      setHistory(res.data.reverse());
    } catch (err) {
      console.error("Error loading history:", err);
    }
  };

  const deleteHistoryItem = async (id) => {
    await axios.delete(`http://localhost:5000/api/conversions/${id}`);
    fetchHistory();
  };

  useEffect(() => {
    fetchHistory();
  }, []);

  return (
    <div className="flex h-screen bg-gray-900 text-white">
      {/* Sidebar */}
      {showHistory && (
        <div className="w-72 bg-gray-800 border-r border-gray-700 p-4 overflow-y-auto">
          <h2 className="text-xl font-bold mb-4">hi</h2>
          {history.map((item) => (
            <div
              key={item._id}
              className="mb-3 border-b border-gray-700 pb-2 flex justify-between items-center"
            >
              <div>
                {item.value} {item.fromUnit} → {item.result} {item.toUnit}
              </div>
              <button
                onClick={() => deleteHistoryItem(item._id)}
                className="text-red-400 hover:text-red-600"
              >
                ✕
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Main UI */}
      <div className="flex-1 flex flex-col items-center justify-center p-6">
        <button
          onClick={() => setShowHistory(!showHistory)}
          className="absolute top-4 left-4 bg-purple-700 hover:bg-purple-800 px-3 py-1 rounded"
        >
          {showHistory ? "Hide History" : "Show History"}
        </button>

        <h1 className="text-3xl font-bold mb-6">Unit Converter</h1>

        {conversions.map((conversion, index) => (
          <div
            key={index}
            className="flex flex-col sm:flex-row items-center gap-2 mb-4"
          >
            <input
              type="number"
              placeholder="Value"
              value={conversion.value}
              onChange={(e) =>
                handleInputChange(index, "value", e.target.value)
              }
              className="p-2 rounded bg-gray-700"
            />
            <select
              value={conversion.fromUnit}
              onChange={(e) =>
                handleInputChange(index, "fromUnit", e.target.value)
              }
              className="p-2 rounded bg-gray-700"
            >
              {Object.keys(conversionFactors).map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
            <span>→</span>
            <select
              value={conversion.toUnit}
              onChange={(e) =>
                handleInputChange(index, "toUnit", e.target.value)
              }
              className="p-2 rounded bg-gray-700"
            >
              {Object.keys(conversionFactors).map((unit) => (
                <option key={unit}>{unit}</option>
              ))}
            </select>
            {conversions.length > 1 && (
              <button
                onClick={() => removeConversion(index)}
                className="text-red-400 hover:text-red-600 ml-2"
              >
                ✕
              </button>
            )}
            {conversion.result && (
              <div className="ml-4 text-green-400 font-medium">
                {conversion.result} {conversion.toUnit}
              </div>
            )}
          </div>
        ))}

        <div className="flex gap-4 mt-6">
          <button
            onClick={addConversion}
            className="bg-gray-700 hover:bg-gray-600 px-4 py-2 rounded"
          >
            + Add
          </button>
          <button
            onClick={convertUnits}
            className="bg-purple-600 hover:bg-purple-700 px-4 py-2 rounded"
          >
            Convert
          </button>
        </div>
      </div>
    </div>
  );
}
