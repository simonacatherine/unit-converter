// server.js
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
app.use(cors());
app.use(express.json());

mongoose.connect("mongodb://127.0.0.1:27017/unit_converter");

const conversionSchema = new mongoose.Schema({
  value: Number,
  fromUnit: String,
  toUnit: String,
  result: String,
});

const Conversion = mongoose.model("Conversion", conversionSchema);

app.get("/api/conversions", async (req, res) => {
  const history = await Conversion.find().sort({ _id: -1 });
  res.json(history);
});

app.post("/api/conversions", async (req, res) => {
  const { value, fromUnit, toUnit, result } = req.body;
  const newConv = new Conversion({ value, fromUnit, toUnit, result });
  await newConv.save();
  res.json({ message: "Saved!" });
});

app.delete("/api/conversions/:id", async (req, res) => {
  await Conversion.findByIdAndDelete(req.params.id);
  res.json({ message: "Deleted!" });
});

app.listen(5000, () => {
  console.log("Server running on http://localhost:5000");
});
