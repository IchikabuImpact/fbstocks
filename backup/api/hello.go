/*
package main

import (
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/rpc"
)

type HelloService struct{}

func (h *HelloService) SayHello(request string, reply *string) error {
	*reply = fmt.Sprintf("Hello, %s!", request)
	return nil
}

func handleHelloService(w http.ResponseWriter, r *http.Request) {
	// CORS対応のヘッダーを追加
//	w.Header().Set("Access-Control-Allow-Origin", "*")

        w.Header().Set("Access-Control-Allow-Origin", "https://fbstocks.pinkgold.space")
        w.Header().Set("Access-Control-Allow-Methods", "POST, GET, OPTIONS")
        w.Header().Set("Access-Control-Allow-Headers", "Accept, Content-Type, Content-Length, Accept-Encoding, X-CSRF-Token, Authorization")


	// JSON-RPC の処理
	var params map[string]interface{}
	err := json.NewDecoder(r.Body).Decode(&params)
	if err != nil {
		http.Error(w, err.Error(), http.StatusBadRequest)
		return
	}

	request, ok := params["params"].([]interface{})
	if !ok {
		http.Error(w, "Invalid params", http.StatusBadRequest)
		return
	}

	var reply string
	helloService := new(HelloService)  // この行を追加
	err = helloService.SayHello(request[0].(string), &reply)  // この行を修正
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	response := map[string]interface{}{
		"id":     params["id"],
		"result": reply,
		"error":  nil,
	}

	json.NewEncoder(w).Encode(response)
}

func main() {
	helloService := new(HelloService)
	rpc.Register(helloService)

	//http.HandleFunc("/", handleHelloService)
        http.HandleFunc("/api", func(w http.ResponseWriter, r *http.Request) {
            if r.URL.Path == "/api" {
                handleHelloService(w, r)
            } else {
             http.NotFound(w, r)
            }
    })
	log.Fatal(http.ListenAndServe(":1234", nil))
}
*/