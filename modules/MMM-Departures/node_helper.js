const NodeHelper = require("node_helper");
const Log = require("logger");

module.exports = NodeHelper.create({
	start () {
		Log.log(`Starting node helper for: ${this.name}`);
	},

	async socketNotificationReceived (notification, payload) {
		if (notification === "GET_DEPARTURES") {
			try {
				const response = await fetch(payload.url);
				if (!response.ok) throw new Error(`HTTP ${response.status}`);
				const data = await response.json();

				const calls = data?.data?.stopPlace?.estimatedCalls || [];

				const now = new Date();
				let departures = calls.map((call) => {
					const expected = new Date(call.expectedDepartureTime);
					const aimed = new Date(call.aimedDepartureTime);
					const minutesUntil = Math.round((expected - now) / 60000);
					const delayMinutes = Math.round((expected - aimed) / 60000);
					return {
						line: call.serviceJourney?.line?.publicCode || "?",
						destination: call.destinationDisplay?.frontText || "Ukjent",
						minutesUntil: minutesUntil,
						delayMinutes: delayMinutes,
						expectedTime: call.expectedDepartureTime,
						aimedTime: call.aimedDepartureTime,
						transportMode: call.serviceJourney?.line?.transportMode || "bus"
					};
				}).filter((d) => d.minutesUntil >= 0);

				const blocklist = payload.destinationBlocklist;
				const alwaysShow = payload.alwaysShowLines;
				if (Array.isArray(blocklist) && blocklist.length > 0) {
					departures = departures.filter((d) => {
						if (Array.isArray(alwaysShow) && alwaysShow.includes(d.line)) return true;
						const dest = d.destination.toLowerCase();
						return !blocklist.some((blocked) => dest.includes(blocked.toLowerCase()));
					});
				}

				this.sendSocketNotification("DEPARTURES_DATA", departures);
			} catch (error) {
				Log.error(`[MMM-Departures] Error: ${error.message}`);
				this.sendSocketNotification("DEPARTURES_ERROR", error.message);
			}
		}
	}
});
