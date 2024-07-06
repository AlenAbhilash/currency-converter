const BASE_URL = "https://api.fxratesapi.com";
const dropdowns = document.querySelectorAll(".dropdown select");
const btn = document.querySelector("#result");
const fromCurr = document.querySelector(".from select");
const toCurr = document.querySelector(".to select");
const amountInput = document.querySelector(".amount input");
const msg = document.querySelector(".msg");
const charth = document.querySelector(".charth");

for (let select of dropdowns) {
    for (let currCode in countryList) {
        let newOption = document.createElement("option");
        newOption.innerText = currCode;
        newOption.value = currCode;
        if (select.name === "from" && currCode === "USD") {
            newOption.selected = "selected";
        } else if (select.name === "to" && currCode === "INR") {
            newOption.selected = "selected";
        }
        select.append(newOption);
    }
    select.addEventListener("change", (event) => {
        updateFlag(event.target);
    });
}

const updateFlag = (element) => {
    let currCode = element.value;
    let countryCode = countryList[currCode];
    let newSrc = `https://flagsapi.com/${countryCode}/flat/64.png`;
    let img = element.parentElement.querySelector("img");
    if (img) {
        img.src = newSrc;
    } else {
        img = document.createElement("img");
        img.src = newSrc;
        element.parentElement.appendChild(img);
    }
};

const fetchExchangeRate = async () => {
    let amvalue = amountInput.value;
    if (amvalue === "" || amvalue < 1) {
        amvalue = 1;
        amountInput.value = 1;
    }

    const today = new Date();
    const twoMonthsAgo = new Date(today);
    twoMonthsAgo.setMonth(twoMonthsAgo.getMonth() - 1);
    
    const startDate = twoMonthsAgo.toISOString().split('T')[0];
    const endDate = new Date(today.setDate(today.getDate() - 1)).toISOString().split('T')[0];

    const latestUrl = `${BASE_URL}/latest?base=${fromCurr.value}&symbols=${toCurr.value}`;
    const latestResponse = await fetch(latestUrl);
    const latestData = await latestResponse.json();
    const latestRate = latestData.rates[toCurr.value];

    let convertedAmount = latestRate * amvalue;
    msg.innerText = `${amvalue} ${fromCurr.value} = ${convertedAmount.toFixed(2)} ${toCurr.value}`;

    const historicalUrl = `${BASE_URL}/timeseries?base=${fromCurr.value}&symbols=${toCurr.value}&start_date=${startDate}&end_date=${endDate}`;
    const historicalResponse = await fetch(historicalUrl);
    const historicalData = await historicalResponse.json();

    let historicalRates = [];
    for (let date in historicalData.rates) {
        historicalRates.push({
            x: new Date(date).getTime(),
            y: historicalData.rates[date][toCurr.value]
        });
    }

    updateChart(historicalRates);
    charth.innerText = ` ${fromCurr.value} To ${toCurr.value} Chart`;
};


const updateChart = (historicalRates) => {
    let dataPoints = [];
    if (historicalRates.length > 0) {
        dataPoints.push({
            name: `Historical Exchange Rates (${fromCurr.value} to ${toCurr.value})`,
            data: historicalRates
        });
    }
    chart.updateSeries(dataPoints);
};

const getPastDate = (days) => {
    let date = new Date();
    date.setDate(date.getDate() - days);
    return date.toISOString().split('T')[0];
};

btn.addEventListener("click", async (evt) => {
    evt.preventDefault();
    fetchExchangeRate();
});

window.addEventListener("load", fetchExchangeRate);

var options = {
    series: [],
    chart: {
        type: 'area',
        stacked: false,
        height: 350,
        zoom: {
            type: 'x',
            enabled: true,
            autoScaleYaxis: true
        },
        toolbar: {
            autoSelected: 'zoom'
        }
    },
    dataLabels: {
        enabled: false
    },
    markers: {
        size: 0
    },
    title: {
        text: 'Foreign Currency Exchange Rates',
        align: 'left'
    },
    fill: {
        type: 'gradient',
        gradient: {
            shadeIntensity: 1,
            inverseColors: false,
            opacityFrom: 0.8,
            opacityTo: 0,
            stops: [0, 90, 100]
        }
    },
    yaxis: {
        labels: {
            formatter: function (val) {
                return val.toFixed(2);
            }
        },
        title: {
            text: 'Converted Amount'
        }
    },
    xaxis: {
        type: 'datetime',
        labels: {
            format: 'dd MMM yyyy'
        }
    },
    tooltip: {
        shared: false,
        y: {
            formatter: function (val) {
                return val.toFixed(2);
            }
        }
    }
};

var chart = new ApexCharts(document.querySelector("#chart"), options);
chart.render();
   