const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

	async socketNotificationReceived (notification, payload) {
		if (notification === "GET_SHOPPING") {
			try {
				const response = await fetch(payload.url);
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();
				this.sendSocketNotification("SHOPPING_DATA", data);
			} catch (error) {
				Log.error(`[MMM-ShoppingList] Error: ${error.message}`);
				this.sendSocketNotification("SHOPPING_ERROR", error.message);
			}
		}
	}
});
