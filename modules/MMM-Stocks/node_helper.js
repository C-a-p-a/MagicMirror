const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

	async socketNotificationReceived (notification, payload) {
		if (notification === "GET_STOCKS") {
			try {
				const response = await fetch(payload.url);
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();
				const stocks = Array.isArray(data) ? data : (data.stocks || []);
				this.sendSocketNotification("STOCKS_DATA", stocks);
			} catch (error) {
				Log.error(`[MMM-Stocks] Error: ${error.message}`);
				this.sendSocketNotification("STOCKS_ERROR", error.message);
			}
		}
	}
});
