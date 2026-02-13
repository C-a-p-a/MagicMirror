const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

	async socketNotificationReceived (notification, payload) {
		if (notification === "GET_FOOTBALL") {
			try {
				const response = await fetch(payload.url);
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();
				const matches = Array.isArray(data) ? data : (data.matches || data.events || []);
				this.sendSocketNotification("FOOTBALL_DATA", matches);
			} catch (error) {
				Log.error(`[MMM-Football] Error: ${error.message}`);
				this.sendSocketNotification("FOOTBALL_ERROR", error.message);
			}
		}
	}
});
