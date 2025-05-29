import React, { useState } from "react";
import { SearchableSelect, GetDataButton } from "./SearchBarSelect";
import StockChart from "./stockChart";
import LoadingSpinner from "./loadingAnimation";
import { StartDate, EndDate, getAgoDate } from "./DateInput";
import StockDataTable from "./stockDataTable";
import stockOptions from "./stockList";
import PredictButton from "./predictbutton";
import { ToastContainer /*,toast*/ } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import notifyError from "./Notifications";

const StockDataApp = () => {
  const [selectedStock, setSelectedStock] = useState(null);
  const [startDate, setStartDate] = useState(getAgoDate(1));
  const [endDate, setEndDate] = useState(getAgoDate(0));
  const [stockData, setStockData] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleSelect = (selectedOption) => {
    setSelectedStock(selectedOption);
  };

  const handleGetData = async () => {
    if (selectedStock) {
      try {
        setLoading(true); // Set loading to true before fetching data
        console.log("Fetching stock data...");

        const response = await fetch("http://localhost:3001/getStockData", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            stockSymbol: selectedStock.symbol + ".NS",
            startDate: startDate,
            endDate: endDate,
          }),
        });

        console.log("Response received:", response);

        if (response.ok) {
          const data = await response.json();
          console.log("Data received:", data);

          if (data && data.data) {
            // Assuming 'data.data' contains the required stock data
            setStockData(data.data);
            console.log("Processed stock data:", data.data);
          } else {
            console.error("Unexpected response structure:", data);
            notifyError("Unexpected response structure received.");
          }
        } else {
          if (startDate > endDate) {
            notifyError("Start date must be earlier than the end date.");
          } else {
            console.error("Failed to fetch stock data, status:", response.status);
            notifyError("Failed to fetch stock data.");
          }
        }
      } catch (error) {
        console.error("Error fetching stock data:", error);
        notifyError("An error occurred while fetching stock data.");
      } finally {
        setLoading(false);
      }
    } else {
      notifyError("Please select a stock first.");
    }
  };

  return (
    <div className="relative top-0.5 left-0.5 py-4 px-2 mx-10 min-h-screen flex flex-col pb-20"> {/* Added min-h-screen and padding bottom */}
      <div className="flex flex-col items-center space-y-6 justify-center">
        <SearchableSelect options={stockOptions} onSelect={handleSelect} />
        <div className="flex space-x-4">
          <StartDate value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          <EndDate value={endDate} onChange={(e) => setEndDate(e.target.value)} />
        </div>
        <GetDataButton onClick={handleGetData} />
      </div>

      {loading && <LoadingSpinner />}
      {!loading && stockData && (
        <>
          <StockDataTable stockData={stockData} />
          <StockChart
            stockData={stockData}
            startDate={startDate}
            endDate={endDate}
            selectedStock={selectedStock}
          />
          <div className="mt-8">
            <PredictButton
              startDate={startDate}
              endDate={endDate}
              selectedStock={selectedStock}
              stockData={stockData}
            />
          </div>
        </>
      )}

      <ToastContainer />
    </div>
  );
};

export default StockDataApp;
