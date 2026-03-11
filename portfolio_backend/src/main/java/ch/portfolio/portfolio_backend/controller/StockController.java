package ch.portfolio.portfolio_backend.controller;

import ch.portfolio.portfolio_backend.model.StockData;
import ch.portfolio.portfolio_backend.service.StockService;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/stocks")
@CrossOrigin(origins = "http://localhost:5173")
public class StockController {

    private final StockService stockService;

    public StockController(StockService stockService) {
        this.stockService = stockService;
    }

    @GetMapping("/{symbol}")
    public StockData getStockDetails(@PathVariable String symbol) {
        return stockService.getStockData(symbol);
    }
}