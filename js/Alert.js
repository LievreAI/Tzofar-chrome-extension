class Alert {
    constructor(timestamp, cities, threatID, isDrill) {
        this.timestamp = timestamp;
        this.cities = cities;
        this.threatID = threatID;
        this.isDrill = isDrill;
    }

    getTimestamp() {
        return this.timestamp;
    }

    getCities() {
        return this.cities;
    }

    getThreatID() {
        return this.threatID;
    }
}