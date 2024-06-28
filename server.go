package main

import (
	"fmt"
	"log"
	"net/http"
	"fbstocks/stockdata"
)

func stockDataHandler(w http.ResponseWriter, r *http.Request) {
	ticker := r.URL.Query().Get("ticker")
	if ticker == "" {
		http.Error(w, "Ticker is required", http.StatusBadRequest)
		return
	}

	data, err := stockdata.GetStockDataJSON(ticker)
	if err != nil {
		http.Error(w, fmt.Sprintf("Error retrieving stock data: %v", err), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.Write([]byte(data))
}

func main() {
	http.HandleFunc("/scrape", stockDataHandler)
	log.Println("Starting server on port 8080...")
	log.Fatal(http.ListenAndServe(":8080", nil))
}

