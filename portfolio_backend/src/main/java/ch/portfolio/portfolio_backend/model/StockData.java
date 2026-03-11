package ch.portfolio.portfolio_backend.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import com.fasterxml.jackson.annotation.JsonIgnoreProperties;

@JsonIgnoreProperties(ignoreUnknown = true)
public class StockData {
    private String symbol;
    private String name;
    private String currency;

    // Wir sagen Jackson: Lies "close" von TwelveData, aber nenne es im Java "price"
    @JsonProperty("close")
    private String price;

    private String change;

    @JsonProperty("percent_change")
    private String percentChange;

    // Diese Annotation sorgt dafür, dass das JSON an React "price" heißt
    @JsonProperty("price")
    public String getPrice() { return price; }

    @JsonProperty("close")
    public void setPrice(String price) { this.price = price; }

    public String getSymbol() { return symbol; }
    public void setSymbol(String symbol) { this.symbol = symbol; }

    public String getName() { return name; }
    public void setName(String name) { this.name = name; }

    public String getCurrency() { return currency; }
    public void setCurrency(String currency) { this.currency = currency; }

    public String getChange() { return change; }
    public void setChange(String change) { this.change = change; }

    public String getPercentChange() { return percentChange; }
    public void setPercentChange(String percentChange) { this.percentChange = percentChange; }
}