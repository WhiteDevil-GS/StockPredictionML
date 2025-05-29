import React from "react";
import { Link } from "react-router-dom";

const PredictButton = ({ startDate = [], endDate = [], selectedStock = [], stockData = [] }) => {
  return (
    <div className="flex justify-center py-12"> {/* Center the button with padding */}
      <button className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
        <Link
          to="/predict"
          state={{
            stockData: stockData,
            startDate: startDate,
            endDate: endDate,
            stockSymbol: selectedStock.symbol,
            stockName: selectedStock.name
          }}
          className="w-full h-full block"
        >
          Predict My Stock
        </Link>
      </button>
    </div>
  );
};

export default PredictButton;
