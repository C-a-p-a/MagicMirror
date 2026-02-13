Module.register("MMM-Football", {
	defaults: {
		smartHubUrl: "http://capaRPI5:5000",
		updateInterval: 5 * 60 * 1000,
		animationSpeed: 1000,
		showLeagueBadge: true
	},

	getStyles () {
		return ["MMM-Football.css"];
	},

	getScripts () {
		return ["moment.js"];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		moment.locale(config.language);
		this.matches = [];
		this.loaded = false;
		this.error = null;
		this.getData();
		this.scheduleUpdate();
	},

	getData () {
		this.sendSocketNotification("GET_FOOTBALL", {
			url: this.config.smartHubUrl + "/football"
		});
	},

	scheduleUpdate () {
		setInterval(() => {
			this.getData();
		}, this.config.updateInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "FOOTBALL_DATA") {
			this.matches = payload;
			this.loaded = true;
			this.error = null;
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "FOOTBALL_ERROR") {
			this.error = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	getTemplate () {
		return "MMM-Football.njk";
	},

	getTemplateData () {
		return {
			config: this.config,
			matches: this.matches,
			loaded: this.loaded,
			error: this.error
		};
	}
});
