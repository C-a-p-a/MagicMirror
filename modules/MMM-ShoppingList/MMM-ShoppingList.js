Module.register("MMM-ShoppingList", {
	defaults: {
		smartHubUrl: "http://capaRPI5:5000",
		updateInterval: 15 * 1000,
		animationSpeed: 500,
		maxItems: 15,
		showChecked: true,
		showAddedBy: true,
		fadeChecked: true
	},

	getStyles () {
		return ["MMM-ShoppingList.css", "font-awesome.css"];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		this.items = [];
		this.lastUpdated = null;
		this.loaded = false;
		this.error = null;
		this.getData();
		this.scheduleUpdate();
	},

	getData () {
		this.sendSocketNotification("GET_SHOPPING", {
			url: this.config.smartHubUrl + "/shopping"
		});
	},

	scheduleUpdate () {
		setInterval(() => {
			this.getData();
		}, this.config.updateInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "SHOPPING_DATA") {
			this.items = payload.items || [];
			this.lastUpdated = payload.last_updated;
			this.loaded = true;
			this.error = null;
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "SHOPPING_ERROR") {
			this.error = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	getTemplate () {
		return "MMM-ShoppingList.njk";
	},

	getTemplateData () {
		const unchecked = this.items.filter((i) => !i.checked);
		const checked = this.items.filter((i) => i.checked);
		return {
			config: this.config,
			unchecked: unchecked,
			checked: checked,
			loaded: this.loaded,
			error: this.error,
			itemCount: this.items.length,
			uncheckedCount: unchecked.length
		};
	}
});
