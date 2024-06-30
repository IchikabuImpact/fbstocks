// cmd/stockdata/main.go
package main

import (
    "fmt"
    "os"
    "fbstocks/internal/stockdata"
)

func main() {
    if len(os.Args) < 2 {
        fmt.Println("Usage: stockdata <ticker>")
        return
    }
    ticker := os.Args[1]

    data, err := stockdata.GetStockDataJSON(ticker)
    if err != nil {
        fmt.Printf("Error getting stock data: %v\n", err)
        return
    }

    fmt.Println(data)
}

