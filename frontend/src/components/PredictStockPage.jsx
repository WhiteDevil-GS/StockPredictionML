import React, { useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import StockChart from "./stockChart";
import LoadingSpinner from "./loadingAnimation";
import notifyError from "./Notifications";
import { ToastContainer } from "react-toastify";

const PredictStockPage = () => {
  const [predictionData, setPredictionData] = useState([]);
  const [passedStockData, setPassedStockData] = useState([]);
  const location = useLocation();
  const { state: locationState } = location;
  const { startDate, endDate, stockSymbol, stockName } = locationState || {};
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (locationState && locationState.stockData) {
      setPassedStockData(locationState.stockData);
    }
  }, [locationState]);

  const predictStockPrice = async (startDate, endDate, stockSymbol) => {
    try {
      setLoading(true);
      const predictionResponse = await fetch(
        `http://localhost:3001/predictstock/${startDate}/${endDate}/${stockSymbol}`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stockSymbol: stockSymbol + ".NS",
            startDate: startDate,
            endDate: endDate,
          }),
        }
      );

      if (!predictionResponse.ok) {
        notifyError("Prediction failed due to some error.");
        return;
      }

      const preData = await predictionResponse.json();
      setPredictionData(preData.predictionDataInJSON);
    } catch (error) {
      console.error("Error fetching stock data:", error);
      const errorMessage =
        error.message || "An error occurred while fetching the stock data.";
      notifyError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-3xl font-semibold text-center mb-6 text-blue-700">
        Predict Stock Price for Next 30 Days
      </h2>

      <div className="flex justify-center mb-6">
        <button
          className="text-white bg-gradient-to-r from-cyan-500 to-blue-500 hover:bg-gradient-to-bl focus:ring-4 focus:outline-none focus:ring-cyan-300 dark:focus:ring-cyan-800 font-medium rounded-lg text-lg px-6 py-3"
          onClick={() => predictStockPrice(startDate, endDate, stockSymbol)}
        >
          Click to Predict
        </button>
      </div>

      <div className="text-center">
        {loading && <LoadingSpinner />}

        {!loading &&
          passedStockData.length > 0 &&
          predictionData.length > 0 && (
            <>
              <h3 className="text-2xl font-semibold mb-4 text-blue-600">
                Prediction Data for {stockName} ({stockSymbol})
              </h3>
              <StockChart
                stockData={passedStockData}
                startDate={startDate}
                endDate={endDate}
                selectedStock={stockSymbol}
                predictedData={predictionData}
              />
            </>
          )}

        {!loading &&
          predictionData.length === 0 &&
          passedStockData.length === 0 && (
            <p className="text-lg text-red-600 font-semibold">
              No prediction data available. Please try again later.
            </p>
          )}
      </div>

      <ToastContainer />
    </div>
  );
};

export default PredictStockPage;
