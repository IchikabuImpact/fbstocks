package stockdata

import (
	"encoding/json"
	"fmt"
	"github.com/tebeka/selenium"
)

// StockData represents the stock data structure
type StockData struct {
	Ticker       string `json:"ticker"`
	CompanyName  string `json:"companyName"`
	CurrentPrice string `json:"currentPrice"`
	PreviousClose string `json:"previousClose"`
}

// Function to get stock data from an external API
func GetStockData(ticker string) (StockData, error) {
	const (
		chromeDriverPath  = "/usr/local/bin/chromedriver"
		seleniumURL       = "http://localhost:4444/wd/hub"
		urlGoogleFinance  = "https://www.google.com/finance/quote/%s:TYO?sa=X&ved=2ahUKEwiG1vL6yZzxAhUD4zgGHQGxD7QQ3ecFegQINRAS"
		urlKabutan        = "https://kabutan.jp/stock/?code=%s"
	)

	opts := []selenium.ServiceOption{}
	selenium.SetDebug(false)
	service, err := selenium.NewChromeDriverService(chromeDriverPath, 4444, opts...)
	if err != nil {
		return StockData{}, fmt.Errorf("error starting the ChromeDriver service: %v", err)
	}
	defer service.Stop()

	caps := selenium.Capabilities{
		"browserName": "chrome",
		"goog:chromeOptions": map[string]interface{}{
			"args": []string{"--headless", "--disable-cache"},
		},
	}

	wd, err := selenium.NewRemote(caps, seleniumURL)
	if err != nil {
		return StockData{}, fmt.Errorf("error creating new WebDriver: %v", err)
	}
	defer wd.Quit()

	// Get company name from Kabutan
	err = wd.Get(fmt.Sprintf(urlKabutan, ticker))
	if err != nil {
		return StockData{}, fmt.Errorf("error loading Kabutan page: %v", err)
	}
	companyName, err := getElementText(wd, "div.stock_summary div h3")
	if err != nil {
		return StockData{}, fmt.Errorf("error getting company name: %v", err)
	}

	// Get stock price from Google Finance
	err = wd.Get(fmt.Sprintf(urlGoogleFinance, ticker))
	if err != nil {
		return StockData{}, fmt.Errorf("error loading Google Finance page: %v", err)
	}
	currentPrice, err := getElementText(wd, ".YMlKec.fxKbKc")
	if err != nil {
		return StockData{}, fmt.Errorf("error getting current price: %v", err)
	}
	previousClose, err := getElementText(wd, "div.P6K39c")
	if err != nil {
		return StockData{}, fmt.Errorf("error getting previous close: %v", err)
	}

	return StockData{
		Ticker:       ticker,
		CompanyName:  companyName,
		CurrentPrice: currentPrice,
		PreviousClose: previousClose,
	}, nil
}

func getElementText(wd selenium.WebDriver, value string) (string, error) {
	elem, err := wd.FindElement(selenium.ByCSSSelector, value)
	if err != nil {
		return "", err
	}
	text, err := elem.Text()
	if err != nil {
		return "", err
	}
	return text, nil
}

func GetStockDataJSON(ticker string) (string, error) {
	data, err := GetStockData(ticker)
	if err != nil {
		return "", err
	}
	jsonData, err := json.Marshal(data)
	if err != nil {
		return "", err
	}
	return string(jsonData), nil
}

