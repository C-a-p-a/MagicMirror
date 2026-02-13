Module.register("MMM-News", {
	defaults: {
		smartHubUrl: "http://capaRPI5:5000",
		updateInterval: 5 * 60 * 1000,
		rotateInterval: 12 * 1000,
		animationSpeed: 1000,
		maxItems: 20,
		showAsList: false,
		maxListItems: 6,
		showDescription: false,
		showSource: true,
		showPublishDate: true,
		truncDescription: 150
	},

	getStyles () {
		return ["MMM-News.css"];
	},

	getScripts () {
		return ["moment.js"];
	},

	start () {
		Log.info(`Starting module: ${this.name}`);
		moment.locale(config.language);
		this.newsItems = [];
		this.activeItem = 0;
		this.loaded = false;
		this.error = null;
		this.rotateTimer = null;
		this.getData();
		this.scheduleDataFetch();
	},

	getData () {
		this.sendSocketNotification("GET_NEWS", {
			url: this.config.smartHubUrl + "/news/all"
		});
	},

	scheduleDataFetch () {
		setInterval(() => {
			this.getData();
		}, this.config.updateInterval);
	},

	socketNotificationReceived (notification, payload) {
		if (notification === "NEWS_DATA") {
			this.newsItems = payload.slice(0, this.config.maxItems);
			this.loaded = true;
			this.error = null;
			if (!this.rotateTimer) {
				this.scheduleRotation();
			}
			this.updateDom(this.config.animationSpeed);
		} else if (notification === "NEWS_ERROR") {
			this.error = payload;
			this.updateDom(this.config.animationSpeed);
		}
	},

	scheduleRotation () {
		this.rotateTimer = setInterval(() => {
			this.activeItem++;
			if (this.activeItem >= this.newsItems.length) {
				this.activeItem = 0;
			}
			this.updateDom(this.config.animationSpeed);
		}, this.config.rotateInterval);
	},

	getTemplate () {
		return "MMM-News.njk";
	},

	getTemplateData () {
		if (this.newsItems.length > 0 && this.activeItem >= this.newsItems.length) {
			this.activeItem = 0;
		}
		const currentItem = this.newsItems[this.activeItem] || null;

		const itemsWithTime = this.newsItems.map((item) => {
			return Object.assign({}, item, {
				relativeTime: moment(new Date(item.pubDate)).fromNow()
			});
		});

		return {
			config: this.config,
			loaded: this.loaded,
			error: this.error,
			currentItem: currentItem
				? Object.assign({}, currentItem, {
					relativeTime: moment(new Date(currentItem.pubDate)).fromNow()
				})
				: null,
			items: itemsWithTime
		};
	}
});
