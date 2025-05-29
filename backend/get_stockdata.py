#!/usr/bin/env python3
import pandas as pd
import yfinance as yf
import matplotlib.pyplot as plt
from datetime import datetime, timedelta
import numpy as np
from sklearn.preprocessing import MinMaxScaler
import sys
import io
from tensorflow.keras.models import Sequential
from tensorflow.keras.layers import Dense, LSTM
import math
from sklearn.metrics import mean_squared_error
import json

# Ensure UTF-8 output encoding
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8')

# Get input args
try:
    combined_args = sys.argv[1]
    start, end, stock_symbol = combined_args.split(',')
except:
    print(json.dumps({"error": "Invalid input. Expected format: 'start,end,stock_symbol'"}))
    sys.exit(1)

def predict_stock_prices(start, end, stock_symbol, ttldays=30):
    try:
        df = yf.download(stock_symbol + ".NS", start, end)
        if df.empty:
            raise ValueError("No stock data found. Check symbol and date range.")
    except Exception as e:
        return {"error": str(e)}

    df1 = df.reset_index()['Close']

    scaler = MinMaxScaler(feature_range=(0, 1))
    df1 = scaler.fit_transform(np.array(df1).reshape(-1, 1))

    training_size = int(len(df1) * 0.75)
    test_size = len(df1) - training_size
    train_data, test_data = df1[0:training_size, :], df1[training_size:len(df1), :1]

    def create_dataset(dataset, time_step=1):
        dataX, dataY = [], []
        for i in range(len(dataset) - time_step - 1):
            a = dataset[i:(i + time_step), 0]
            dataX.append(a)
            dataY.append(dataset[i + time_step, 0])
        return np.array(dataX), np.array(dataY)

    time_step = test_size - 5 if test_size > 5 else 10

    X_train, y_train = create_dataset(train_data, time_step)
    X_test, y_test = create_dataset(test_data, time_step)

    X_train = X_train.reshape(X_train.shape[0], X_train.shape[1], 1)
    X_test = X_test.reshape(X_test.shape[0], X_test.shape[1], 1)

    model = Sequential()
    model.add(LSTM(50, return_sequences=True, input_shape=(time_step, 1)))
    model.add(LSTM(50, return_sequences=True))
    model.add(LSTM(50))
    model.add(Dense(1))
    model.compile(loss="mean_squared_error", optimizer="adam")

    model.fit(X_train, y_train, validation_data=(X_test, y_test), epochs=100, batch_size=32, verbose=1)

    # Predict future stock prices
    x_input = test_data[-time_step:].reshape(1, time_step, 1)
    predictions = []
    for i in range(ttldays):
        yhat = model.predict(x_input, verbose=0)
        predictions.append(yhat[0, 0])
        x_input = np.append(x_input, yhat.reshape(1, 1, 1), axis=1)
        x_input = x_input[:, 1:, :]

    predictions = scaler.inverse_transform(np.array(predictions).reshape(-1, 1))
    return predictions.tolist()

# Run prediction and print result as JSON
result = predict_stock_prices(start, end, stock_symbol)

if isinstance(result, dict) and "error" in result:
    print(json.dumps(result))
else:
    print(json.dumps(result))
