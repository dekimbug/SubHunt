
class ExpandingCircle {
    constructor(id, expansionSpeed, lastUpdate, timeLate, radius, lat, long) {
        this.id = id;
        this.expansionSpeed = expansionSpeed;
        this.lastUpdate = new Date(lastUpdate);
        this.timeLate = timeLate;
        this.radius = radius;
        this.lat = lat;
        this.long = long;

        this.drawing = null;
    }

    getCurrentRadius(time) {
        if (!time) {
            time = new Date();
        }
        var timeSinceUpdate = time.getTime() - this.lastUpdate.getTime();//miliseconds
        var totalTimeLate = (this.timeLate * 1000 + timeSinceUpdate) / 1000 / 60 / 60;//hours
        var expansion = totalTimeLate * this.expansionSpeed;//nautical miles

        return expansion + this.radius;

    }

    draw(time) {
        if (this.drawing) {
            this.erase();
        }
        var currentRadius = this.getCurrentRadius(time) * 1852;//meters
        var pos = [this.lat, this.long];
        var style = { radius: currentRadius, dashArray: '20, 10', color: "orange", fill: false }
        this.drawing = [L.circle(pos, style).addTo(map), L.circle([pos[0], pos[1] + 360], style).addTo(map), L.circle([pos[0], pos[1] - 360], style).addTo(map)];
    }

    erase() {
        for (let i = 0; i < this.drawing.length; i++) {
            map.removeLayer(this.drawing[i])
        }
        this.drawing = null;
    }
}