#!/usr/bin/env python3
import os
import sys
import io
import json
import math
import warnings
from datetime import datetime, timedelta

import numpy as np
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt

from sklearn.preprocessing import MinMaxScaler
from sklearn.metrics import mean_squared_error

# Suppress warnings and disable GPU if not used
warnings.filterwarnings("ignore")
os.environ["CUDA_VISIBLE_DEVICES"] = "-1"

# TensorFlow/Keras
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM, Input

# Ensure UTF-8 output encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# --- Parse CLI arguments ---
if len(sys.argv) < 2 or ',' not in sys.argv[1]:
    print(json.dumps({"error": "Missing or malformed arguments. Format: 'start,end,stock_symbol'"}))
    sys.exit(1)

try:
    combined_args = sys.argv[1]
    start, end, stock_symbol = combined_args.split(',')
except Exception:
    print(json.dumps({"error": "Invalid input. Expected format: 'start,end,stock_symbol'"}))
    sys.exit(1)

# --- Main prediction function ---
def predict_stock_prices(start, end, stock_symbol, ttldays=30):
    try:
        df = yf.download(stock_symbol + ".NS", start, end)
        if df.empty:
            return {"error": "No stock data found. Check symbol and date range."}
    except Exception as e:
        return {"error": str(e)}

    # Preprocess
    close_prices = df.reset_index()['Close'].values.reshape(-1, 1)
    scaler = MinMaxScaler(feature_range=(0, 1))
    scaled_data = scaler.fit_transform(close_prices)

    # Split into training and testing
    training_size = int(len(scaled_data) * 0.75)
    test_size = len(scaled_data) - training_size
    train_data = scaled_data[0:training_size]
    test_data = scaled_data[training_size:]

    def create_dataset(data, time_step=1):
        X, y = [], []
        for i in range(len(data) - time_step - 1):
            X.append(data[i:(i + time_step), 0])
            y.append(data[i + time_step, 0])
        return np.array(X), np.array(y)

    time_step = max(10, test_size - 5)
    X_train, y_train = create_dataset(train_data, time_step)
    X_test, y_test = create_dataset(test_data, time_step)

    X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

    # Build LSTM model
    model = Sequential()
    model.add(Input(shape=(time_step, 1)))
    model.add(LSTM(50, return_sequences=True))
    model.add(LSTM(50, return_sequences=True))
    model.add(LSTM(50))
    model.add(Dense(1))
    model.compile(loss="mean_squared_error", optimizer="adam")

    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=100, batch_size=32, verbose=1)

    # Predict future prices
    x_input = test_data[-time_step:].reshape(1, time_step, 1)
    predictions = []

    for _ in range(ttldays):
        yhat = model.predict(x_input, verbose=0)
        predictions.append(yhat[0, 0])
        x_input = np.append(x_input, yhat.reshape(1, 1, 1), axis=1)
        x_input = x_input[:, 1:, :]

    predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))

    # Optional: Include predicted future dates
    # end_date = pd.to_datetime(end)
    # future_dates = [(end_date + timedelta(days=i+1)).strftime("%Y-%m-%d") for i in range(ttldays)]
    # return list(zip(future_dates, predictions.flatten().tolist()))

    return predictions.flatten().tolist()

# --- Run and output result as JSON ---
result = predict_stock_prices(start, end, stock_symbol)

if isinstance(result, dict) and "error" in result:
    print(json.dumps(result))
else:
    print(json.dumps(result))
