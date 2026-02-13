Module.register("MMM-Stocks", {
	defaults: {
		smartHubUrl: "http://capaRPI5:5000",
		updateInterval: 5 * 60 * 1000,
		animationSpeed: 1000,
		showChange: true,
		showPercent: true,
		decimalSeparator: ",",
		symbolFilter: []
	},

	getStyles () {
		return ["MMM-Stocks.css"];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		this.stocks = [];
		this.loaded = false;
		this.error = null;
		this.getData();
		this.scheduleUpdate();
	},

	getData () {
		this.sendSocketNotification("GET_STOCKS", {
			url: this.config.smartHubUrl + "/stocks"
		});
	},

	scheduleUpdate () {
		setInterval(() => {
			this.getData();
		}, this.config.updateInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "STOCKS_DATA") {
			this.stocks = payload;
			this.loaded = true;
			this.error = null;
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "STOCKS_ERROR") {
			this.error = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	getTemplate () {
		return "MMM-Stocks.njk";
	},

	getTemplateData () {
		let filteredStocks = this.stocks;
		if (this.config.symbolFilter.length > 0) {
			filteredStocks = this.stocks.filter((s) =>
				this.config.symbolFilter.includes(s.symbol)
			);
		}
		return {
			config: this.config,
			stocks: filteredStocks,
			loaded: this.loaded,
			error: this.error
		};
	}
});
