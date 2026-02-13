Module.register("MMM-Departures", {
	defaults: {
		smartHubUrl: "http://capaRPI5:5000",
		updateInterval: 60 * 1000,
		animationSpeed: 1000,
		maxDepartures: 8,
		minutesThreshold: 3,
		urgencyMinutes: 4,
		destinationBlocklist: [
			"vadmyra", "fyllingsdalen", "løvstakk", "hesjaholtet", "skogsskiftet",
			"sletten", "fana", "nesttun", "birkelund", "støbotn", "laksevåg",
			"loddefjord", "storavatnet", "mathopen", "alvøen", "bønes", "olsvik",
			"søndre skogveien", "ravnanger terminal", "barliveien", "ågotnes terminal",
			"lyngbø", "wergeland", "straume terminal", "anglevik",
			"birkelandsskiftet", "hjelteryggen", "steinrusten", "brattholmen"
		],
		alwaysShowLines: ["3"]
	},

	getStyles () {
		return ["MMM-Departures.css", "font-awesome.css"];
	},

	getScripts () {
		return ["moment.js"];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		moment.locale(config.language);
		this.departures = [];
		this.loaded = false;
		this.error = null;
		this.sendSocketNotification("GET_DEPARTURES", {
			url: this.config.smartHubUrl + "/departures",
			destinationBlocklist: this.config.destinationBlocklist,
			alwaysShowLines: this.config.alwaysShowLines
		});
		this.scheduleUpdate();
	},

	scheduleUpdate () {
		setInterval(() => {
			this.sendSocketNotification("GET_DEPARTURES", {
				url: this.config.smartHubUrl + "/departures",
				destinationBlocklist: this.config.destinationBlocklist,
				alwaysShowLines: this.config.alwaysShowLines
			});
		}, this.config.updateInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "DEPARTURES_DATA") {
			this.departures = payload;
			this.loaded = true;
			this.error = null;
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "DEPARTURES_ERROR") {
			this.error = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	getTemplate () {
		return "MMM-Departures.njk";
	},

	getTemplateData () {
		return {
			config: this.config,
			departures: this.departures,
			loaded: this.loaded,
			error: this.error
		};
	}
});
