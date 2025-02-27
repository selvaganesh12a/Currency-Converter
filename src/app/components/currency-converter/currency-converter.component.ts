import { Component, OnInit } from '@angular/core';
import { CurrencyService } from '../../services/currency.service';
import { FormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { Chart } from 'chart.js/auto';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-currency-converter',
  standalone: true,
  imports: [FormsModule, CommonModule],
  templateUrl: './currency-converter.component.html',
  styleUrl: './currency-converter.component.scss',
})
export class CurrencyConverterComponent implements OnInit {
  amount: number = 1; 
  fromCurrency: string = 'USD';
  toCurrency: string = 'INR';
  exchangeRates: any = {};
  convertedAmount: number = 0;
  currencies: string[] = [];
  private chartInstance: Chart | undefined;

  constructor(private currencyService: CurrencyService, private http: HttpClient) {}

  ngOnInit() {
    this.fromCurrency = localStorage.getItem('fromCurrency') || 'USD';
    this.toCurrency = localStorage.getItem('toCurrency') || 'INR';
    this.amount = localStorage.getItem('amount') ? Number(localStorage.getItem('amount')) : 1;
    this.currencyService.getExchangeRates().subscribe({
      next: (data) => {
        this.exchangeRates = data.rates;
        this.currencies = Object.keys(this.exchangeRates);
      },
      error: (error) => {
        alert(error.message);
      },
    });
    this.fetchExchangeRates();
  }

  fetchExchangeRates(): void {
    const url = 'https://api.exchangerate-api.com/v4/latest/USD';
    this.http.get<any>(url).subscribe(response =>{
      const rates = response.rates;
      if(rates[this.fromCurrency] && rates[this.toCurrency]) {
      const labels = ['Base'];
      const data = [rates[this.fromCurrency],rates[this.toCurrency]];
      this.updateChart(labels, data);
      }
    });
  }
  updateChart(labels: string[], data: number[]) {
    if (this.chartInstance) {
      this.chartInstance.destroy();
    }

    const canvas = document.getElementById(
      'exchangeRateChart'
    ) as HTMLCanvasElement;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      this.chartInstance = new Chart<'line', number[], string>(ctx, {
        type: 'line',
        data: {
          labels: labels,
          datasets: [
            {
              label: this.fromCurrency,
              data: [data[0]],
              borderColor: 'blue',
              borderWidth: 2,
            },
            {
              label: this.toCurrency,
              data: [data[1]],
              borderColor: 'green',
              borderWidth: 2,
            }
          ],
        },
      });
    }
  }
  
  onCurrencyChange(): void{
    this.fetchExchangeRates();
  }

  convertCurrency() {
    const rate =
      this.exchangeRates[this.toCurrency] /
      this.exchangeRates[this.fromCurrency];
    this.convertedAmount = this.amount * rate;
    localStorage.setItem('fromCurrency', this.fromCurrency);
    localStorage.setItem('toCurrency', this.toCurrency);
    localStorage.setItem('amount', this.amount.toString());
  }

  swapCurrencies() {
    [this.fromCurrency, this.toCurrency] = [this.toCurrency, this.fromCurrency];
  }
  
}
