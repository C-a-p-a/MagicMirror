const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

	async socketNotificationReceived (notification, payload) {
		if (notification === "GET_NEWS") {
			try {
				const response = await fetch(payload.url);
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();
				const items = Array.isArray(data) ? data : [];
				this.sendSocketNotification("NEWS_DATA", items);
			} catch (error) {
				Log.error(`[MMM-News] Error: ${error.message}`);
				this.sendSocketNotification("NEWS_ERROR", error.message);
			}
		}
	}
});
