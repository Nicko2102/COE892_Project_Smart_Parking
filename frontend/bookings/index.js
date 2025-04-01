var spotId = -1;
var startTime = "";
var endTime = "";

const months = [
    "January",
    "February",
    "March",
    "April",
    "May",
    "June",
    "July",
    "August",
    "September",
    "October",
    "November",
    "December"
]

async function book(price) {
    return fetch(`http://localhost:8000/bookings`,
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                spot: spotId,
                user: 0,
                startTime: startTime,
                endTime: endTime,
                cost: price
            })
        }
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            // data.forEach((tag) => {console.log(tag)})
            console.log("Booking data returned: " + data);
            return data;
        });
}

async function getSpotInfo() {
    return fetch(`http://localhost:8000/spots/${spotId}`,
        {method: "GET"}
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            return data;
        });
}

async function confirmBooking() {
    return fetch(`http://localhost:8000/spots/${spotId}/available`,
        {
            method: "PUT",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                start: startTime,
                end: endTime
            })
        }
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            // data.forEach((tag) => {console.log(tag)})
            console.log("Booking data returned: " + data);
            return data;
        });
    
}

async function unlockSpot() {
    console.log("UNLOCK: " + spotId + " - " + startTime + " - " + endTime);
    return fetch(`http://localhost:8000/spots/${spotId}/lock`,
        {
            method: "DELETE",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                start: startTime,
                end: endTime
            })
        }
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            return data;
        });
}

async function bookSpot() {
    let info = document.getElementById("bookingStatusNotification");
    const data = await confirmBooking();
    
    if (data["free"]) {
        // book(data["price"])
        const unlockData = await unlockSpot();
        console.log("Unlock data returned: " + unlockData);
        info.style.borderColor = "#44ff44";
        info.style.backgroundColor = "#44ff4444";
        info.innerHTML = "Success! Redirecting to homepage...";
        info.style.display = "block";
    } else {
        info.style.borderColor = "#ff4444";
        info.style.backgroundColor = "#ff444444";
        info.innerHTML = "Sorry, this spot is no longer available.";
        info.style.display = "block";
    }
}

function dateToString(date) {
    // var dateStr = date.toUTCString().split(' ');
    var dateLoc = date.toLocaleString().split(' ');
    // console.log("UTCSTR " + dateStr);
    // console.log("LOCALE " + dateLoc);
    // console.log(date.getFullYear() + "  <  " + date.getUTCFullYear());
    
    
    var ret = `${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}, ${dateLoc[1].slice(0, -3)} ${dateLoc[2][0] == 'a' ? "AM" : "PM"}`;
    return ret;
}

window.onbeforeunload = function() { 
    console.log(window.location.href);
}


async function init() {
    const params = document.URL.split('?')[1].split('&');
    spotId = parseInt(params[0].split('=')[1]);
    startTime = params[1].split('=')[1].replace("%20", " ");
    endTime = params[2].split('=')[1].replace("%20", " ");
    const stt = parseInt(params[3].split('=')[1]) + 20;
    let t = document.getElementById("timer");
    t.innerHTML = stt - Math.floor(new Date().getTime() / 1000) + "s";
    
    var cd = setInterval(async function() {
        var countDown = stt - Math.floor(new Date().getTime() / 1000);
        t.innerHTML = countDown + "s";
        if (countDown <= 0) {
            clearInterval(cd);
            var ul = await unlockSpot();
            console.log(ul);
            window.location.href = `../listings/`;
        }
    }, 1000);
    console.log(spotId);
    console.log(startTime + " - " + endTime);
    var sInfo = await getSpotInfo(spotId);
    var bInfo = await confirmBooking(spotId, startTime, endTime);
    console.log(bInfo);
    let sptext = document.getElementById("spotText");
    sptext.innerHTML = `Floor: ${sInfo[1]} | Spot: ${sInfo[2]}`;
    let stext = document.getElementById("sText");
    stext.innerHTML = `From: ${dateToString(new Date(startTime))}`;
    let etext = document.getElementById("eText");
    etext.innerHTML = `To: ${dateToString(new Date(endTime))}`;
    let ctext = document.getElementById("costText");
    ctext.innerHTML = `\$${bInfo["price"].toString().indexOf('.') == -1 ? bInfo["price"].toString() + ".00" : bInfo["price"].toString().slice(0, tt.toString().indexOf('.') + 3)}`;
    
    

    
  
  
    // data["data"].forEach((e) => {
    //     // id, city, province, country, type, totalreports, status, lat, long, time
    //     // [(1, 'Hamilton', 'ON', 'Canada', 1, 3, 1, 43.2501, -79.8496, datetime.datetime(2025, 1, 24, 3, 19, 30))]
    //     // e is an array of the above
    //     const block = document.createElement("div");
    //     block.className = "report-block";
    //     block.innerHTML = `
    //         <div class="card mb-3">
    //         <div class="card-body d-flex flex-column flex-md-row">
    //         <div class="report-details mb-3 mb-md-0" style="flex: 1;">
    //         <h5 class="card-title">Report ID: ${e[0]}</h5>
    //         <p class="card-text"><strong>City:</strong> ${e[1]}</p>
    //         <p class="card-text"><strong>Province:</strong> ${e[2]}</p>
    //         <p class="card-text"><strong>Country:</strong> ${e[3]}</p>
    //         <p class="card-text"><strong>Type:</strong> ${e[4]}</p>
    //         <p class="card-text"><strong>Total Reports:</strong> ${e[6]}</p>
    //         <p class="card-text"><strong>Status:</strong> ${e[5]}</p>
    //         <p class="card-text"><strong>Time:</strong> ${new Date(e[9]).toLocaleString()}</p>
    //         </div>
    //         <div class="map-container" style="flex: 1;">
    //         <iframe
    //             width="600"
    //             height="400"
    //             frameborder="0"
    //             scrolling="no"
    //             marginheight="0"
    //             marginwidth="0"
    //             src="https://maps.google.com/maps?q=${e[7]},${e[8]}&hl=en-US&amp;z=14&amp;output=embed"
    //         >
    //         </iframe>
    //         </div>
    //         </div>
    //         </div>
    //     `;
    //     d.appendChild(block);
    // });
}

init();
  