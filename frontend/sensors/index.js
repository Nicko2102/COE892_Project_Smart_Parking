var stDate = "";
var endDate = "";
var stTime = "";
var endTime = "";
var searchFloor = 0;

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

async function getUserLocation() {
    return fetch("https://api.ipify.org?format=json")
        .then((res) => res.json())
        .then((data) => {
            return fetch(`https://api.ipapi.is?q=${data.ip}`).then((res2) => res2.json());
        });
}

async function getFloorInfo(floor) {
    return fetch(`http://localhost:8000/floors/${floor}`,
        {method: "GET"}
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            console.log("FLOOR");
            console.log(data);
            return data;
        });
}

async function getAll(floor) {
    return fetch(`http://localhost:8000/floors/${floor}/spots`,
        {method: "GET"}
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            return data;
        });
}

async function getFloorNums() {
    return fetch(`http://localhost:8000/floors`,
        {method: "GET"}
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            console.log(data);
            return data;
        });
}



async function getAvailable(floor, timeS, timeE) {
    // dict = {
    //     start: "2025-03-23 11:00:00",
    //     end: "2025-03-23 13:00:00"
    // }
    console.log(timeS + ", " + timeE);
    
    return fetch(`http://localhost:8000/floors/${floor}/available`,
        {
            method: "PUT",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                start: timeS,
                end: timeE
            })
        }
        // headers: {'Content-Type': 'application/json', 'Access-Control-Allow-Origin': 'http://localhost:5500'}

    )
        .then((res) => res.json())
        .then((data) => {
            // data.forEach((tag) => {console.log(tag)})
            console.log(data);
            return data;
        });
}

async function addBooking(spotId, timeS, timeE) {
    return fetch(`http://localhost:8000/bookings`,
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                spot: spotId,
                user: 0,
                startTime: timeS,
                endTime: timeE
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

async function lockSpot(spotId) {
    console.log("LOCK: " + spotId + " - " + startTime + " - " + endTime);
    return fetch(`http://localhost:8000/spots/${spotId}/lock`,
        {
            method: "POST",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                start: stDate + " " + stTime,
                end: endDate + " " + endTime
            })
        }

    )
        .then((res) => res.json())
        .then((data) => {
            return data;
        });
}

async function confirmBooking(spotId) {
    console.log("ADDING BOOKING");
    const lockData = await lockSpot(spotId);
    console.log("Lock data returned: " + lockData["success"]);
    // const data = await addBooking(spotId, stDate + " " + stTime, endDate + " " + endTime)
    if (lockData["success"]) {
        window.location.href = `../bookings/?spot=${spotId}&timeStart=${stDate + " " + stTime}&timeEnd=${endDate + " " + endTime}&k=${Math.floor(new Date().getTime() / 1000)}`;
    } else {
        var n = document.getElementById("lockStatusNotification");
        n.style.borderColor = "#ff4444";
        n.style.backgroundColor = "#ff444444";
        n.innerHTML = "Another user is currently viewing this spot. Please check back in a minute or so."
        n.style.display = "block";
    }
    
        // console.log(data);
    
}

async function loadMap() {
    console.log("FLOOR");
    console.log(searchFloor);
    const data = await getAvailable(searchFloor, stDate + " " + stTime, endDate + " " + endTime);
    const layoutInfo = await getFloorInfo(searchFloor);
    const spotsPerRow = Math.ceil(layoutInfo[1]/layoutInfo[2]);
    console.log(spotsPerRow + ", " + layoutInfo[1] + ", " + layoutInfo[2]);
    let g = document.getElementById("mapGrid");

    // let dd = {0: "AAAA", 2: "abab", 1: "cccc"};
    // console.log(Object.keys(dd).sort());

    let spotCount = 0;
    let rowCount = 0;
    g.childNodes.forEach(ch => {
        g.removeChild(ch);
    });

    for (i = 0; i < g.childElementCount; i++) {
        g.removeChild(g.firstChild);
    }
  
    (Object.keys(data)).forEach((key) => {
      // id, city, province, country, type, totalreports, status, lat, long, time
      // [(1, 'Hamilton', 'ON', 'Canada', 1, 3, 1, 43.2501, -79.8496, datetime.datetime(2025, 1, 24, 3, 19, 30))]
      // e is an array of the above
        if (spotCount == 0) {
            rowCount++;
            const row = document.createElement("div");
            row.className = "map-row";
            row.id = `row-${rowCount}`;
            row.style.minWidth = "500px";
            row.style.maxWidth = "100%";
            row.style.display = "flex";
            row.style.flexWrap = "wrap";
            g.appendChild(row);
        }
        const block = document.createElement("div");
        block.style.backgroundColor = (data[key][1] == -1 ? "#88ff88" : "#ff8888");
        // block.className = "spot";
        // block.style.padding = "20px";
        block.innerHTML = `
            <div class="spotNumber">
                ${data[key][0]}
            </div>
        `;
        block.className = "hoverCell";
        if (data[key][1] != -1) {
            var inner = ""
            inner += `<div class="hoverDiv">`;
            inner += `<div class="hoverPanel">`;
            inner += `<div class="hoverText" style="font-size: 24px; padding-top: 20px;"><u>Bookings</u></div>`;
            for (i = 1; i < data[key].length; i++) {
                inner += `<div class="hoverText">
                    ${dateRangeToString(new Date(data[key][i][1]), new Date(data[key][i][2]))}
                    </div>
                `;
                console.log("BOOKED DATE: " + data[key][i][1] + " ... " + dateRangeToString(new Date(data[key][i][1]), new Date(data[key][i][2])));
            }
            inner += `</div></div>`;
            block.innerHTML += inner;
            
        } else {
            const insideblock = document.createElement("div");
            insideblock.className = "hoverDiv";
            insideblock.onclick = () => {confirmBooking(key)};
            insideblock.id = `spotBtn${key}`;
            insideblock.innerHTML += `
                <div class="hoverPanel" style="cursor: pointer;">
                    <div class="hoverText" style="font-size: 28px; padding-top: 30px;">Click here to book this spot</div>
                </div>`;
            block.appendChild(insideblock);
            // block.innerHTML += `<div class="hoverDiv">
            //     <div class="hoverPanel" name="spotBtn${key}" onclick="confirmBooking(${key})">
            //         <div class="hoverText">Book</div>
            //     </div>
            // </div>`;
            // block.innerHTML += `<a class="hoverDiv" href="../bookings/index.html?spotId=${key}">
            //     <div class="hoverPanel">
            //         <div class="hoverText">Book</div>
            //     </div>
            // </a>`;
        }
        let r = document.getElementById(`row-${rowCount}`);
        r.appendChild(block);
        spotCount++;
        spotCount %= spotsPerRow;
    });
}

function updateFloorNum(e) {
    console.log(e.target.value);
    searchFloor = e.target.value;
}

function updateStartDate(e) {
    console.log(e.target.value);
    stDate = e.target.value;
}

function updateEndDate(e) {
    console.log(e.target.value);
    endDate = e.target.value;
}

function updateStartTime(e) {
    console.log(e.target.value);
    // document.getElementById("startTime").setAttribute('value', round(e.target.value));
    e.target.value = round(e.target.value);
    stTime = round(e.target.value);
}

function updateEndTime(e) {
    console.log(e.target.value);
    // document.getElementById("endTime").setAttribute('value', round(e.target.value));
    e.target.value = round(e.target.value);
    endTime = round(e.target.value);
    // console.log("ROUNDED, " + round(e.target.value).slice(0, 5));

}

function round(str) {
    var stMin = str.split(':')[1][0];
    stMin += '0';
    return (str.split(':')[0] + ':' + stMin + ":00")
}

function dateToString(date) {
    // var dateStr = date.toUTCString().split(' ');
    var dateLoc = date.toLocaleString().split(' ');
    // console.log("UTCSTR " + dateStr);
    // console.log("LOCALE " + dateLoc);
    // console.log(date.getFullYear() + "  <  " + date.getUTCFullYear());
    
    
    var ret = `${dateLoc[1].slice(0, -3)} ${dateLoc[2][0] == 'a' ? "AM" : "PM"}, ${months[date.getMonth()]} ${date.getDate()}, ${date.getFullYear()}`;
    return ret;
}

function dateRangeToString(date1, date2) {
    console.log(" ");
    
    var ds1 = dateToString(date1);
    var ds2 = dateToString(date2);
    console.log(ds1 + "m,m " + ds2);
    if (ds1.slice(-12) == ds2.slice(-12)) {
        return `${ds1.split(',', 1)[0]} - ${ds2}`;
    } else {
        return `${ds1} - ${ds2}`;
    }
}

async function init() {
    // console.log(getFloorNums());
    var floorNums = await getFloorNums();
    var selHTML = document.getElementById("floorOpts");
    floorNums.forEach((flr) => {
        var option = document.createElement("option");
        option.value = flr;
        option.innerHTML = flr;
        selHTML.appendChild(option);
    });

    // var testdate = new Date("2025-12-31T22:00:00");
    // console.log("DATE TEST: " + dateToString(testdate));

    var today = new Date();
    var today1Hr = new Date();
    // console.log(today.toISOString());
    today.setTime(today.getTime() + (-today.getTimezoneOffset() * 60000));
    today1Hr.setTime(today1Hr.getTime() + (-today1Hr.getTimezoneOffset() * 60000) + (2*60*60*1000));
    // console.log(today.toISOString());
    // console.log(today1Hr.getTimezoneOffset());
    stDate = today.toISOString().split('T')[0];
    endDate = today1Hr.toISOString().split('T')[0];
    stTime = round(today.toISOString().split('T')[1].split('.')[0]);
    endTime = round(today1Hr.toISOString().split('T')[1].split('.')[0]);
    console.log(stDate + ", " + endDate + ", " + stTime + ", " + endTime);
    document.getElementById("startDate").setAttribute('min', stDate);
    document.getElementById("startDate").setAttribute('value', stDate);
    document.getElementById("endDate").setAttribute('min', endDate);
    document.getElementById("endDate").setAttribute('value', endDate);
    document.getElementById("startTime").setAttribute('value', stTime);
    document.getElementById("endTime").setAttribute('value', endTime);

    console.log("DATE STUFF");
    console.log(today.toUTCString() + ", " + today.toDateString().slice(4));
    console.log(today.getMonth());
    console.log(dateToString(today));
    console.log(today.toLocaleString());
    
    
    


    const userLocation = await getUserLocation();
    const city = userLocation.location.city;
    document.getElementById("city").innerText = city;
  
    // // const data = await getAvailable(0);
    // const layoutInfo = await getFloorInfo(0);
    // const spotsPerRow = Math.ceil(layoutInfo[1]/layoutInfo[2]);
    // console.log(spotsPerRow + ", " + layoutInfo[1] + ", " + layoutInfo[2]);

    // let dd = {0: "AAAA", 2: "abab", 1: "cccc"};
    // console.log(Object.keys(dd).sort());

    // let spotCount = 0;
    // let rowCount = 0;
  
    // (Object.keys(data).sort()).forEach((key) => {
    //   // id, city, province, country, type, totalreports, status, lat, long, time
    //   // [(1, 'Hamilton', 'ON', 'Canada', 1, 3, 1, 43.2501, -79.8496, datetime.datetime(2025, 1, 24, 3, 19, 30))]
    //   // e is an array of the above
    //     if (spotCount == 0) {
    //         rowCount++;
    //         const row = document.createElement("div");
    //         row.className = "map-row";
    //         row.id = `row-${rowCount}`;
    //         row.style.flexWrap = "wrap";
    //         row.style.width = "100%";
    //         row.style.display = "flex";
    //         g.appendChild(row);
    //     }
    //     const block = document.createElement("div");
    //     block.style.height = "300px";
    //     // block.style.maxWidth = "300px";
    //     block.style.backgroundColor = (data[key] == -1 ? "#88ff88" : "#ff8888");
    //     block.style.margin = "5px";
    //     block.style.display = "inline-block";
    //     block.style.flexGrow = "1";
    //     block.className = "spot";
    //     if (data[key] != -1) {
    //         block.className = "hoverCell";
    //         block.innerHTML = `
    //             <div class="hoverDiv">
    //                 ${(data[key].length)}
    //             </div>
    //         `;

    //     }
    //     let r = document.getElementById(`row-${rowCount}`);
    //     r.appendChild(block);
    //     spotCount++;
    //     spotCount %= spotsPerRow;
    // });
}
  
init();
  





// var getAll = function(floor) {
//     // return fetch(`http://127.0.0.1:8000/floors/${floor}`)
//     //     .then((res) => res.json())
//     //     .then((data) => {
//     //         print(data);
//     //         return data;
//     //     });
//     // let headers = new Headers();
//     // headers.append('Access-Control-Allow-Origin', 'http://localhost:8000');
//     // headers.append('Access-Control-Allow-Credentials', 'true');
//     $.ajax({
//         type: "GET",
//         contentType: "application/json; charset=utf-8",
//         url: `http://127.0.0.1:8000/floors/${floor}`,
//         data: "", //JSON.stringify({ int: floor}),
//         origin: 'http://127.0.0.1:5500',
//         success: function (data) {
//             $("#allSpots").empty();
    
//             // empty old translations, if any
//             // $("#suggested").empty();
    
//             // Show translations on the suggestions list
//             // var spotIds = data.getData()
//             // $.each(data.suggestions, function(i) {
//             // $("<a>", {
//             //     id: "alternative",
//             //     class: "dropdown-item",
//             //     onclick: "$('#source').val($(this).val().trim()+' ').focus(); $('#suggested').hide();",
//             //     text: data.suggestions[i],
//             //     val: data.prefix + " " + data.suggestions[i]
//             // }).appendTo("#suggested");
//             // });
//             print(data);
    
//         },
//         dataType: "json",
//     });
// }

// $(document).ready(function(){

//     getAll(0);
//     // var debounce = null;
//     // $('#source').on('keyup', function(e){
//     // e.preventDefault();

//     // caret = getCaretCoordinates(this, this.selectionEnd);

//     // $("#suggested").empty();

//     // clearTimeout(debounce);
//     // debounce = setTimeout(function(){
//     //     var source = $("#source").val();
//     //     var lastChar = source[source.length-1];

//     //     if(lastChar == " " && $("#source").val().length > 1){
//     //         complete(source);
//     //         $("#suggested").show();
//     //         console.log("working")

//     //         // reposition the list of suggestions to the cursor position
//     //         var x = $('#source').offset().left;
//     //         var y = $('#source').offset().top;
//     //         $("#suggested").css("left", caret.left + x*0.2);
            
//     //         var height = $('#container').height();
//     //         var caretPos = y + caret.height + caret.top;

//     //         if(caretPos <= (y + height)){
//     //             $("#suggested").css("top", caretPos);
//     //         }
//     //         else{
//     //             $("#suggested").css("top", y + height);
//     //         }
            
            
//     //         $("#source").on("focusout", function(){
//     //             setTimeout(function() { 
//     //             $("#suggested").hide();
//     //             }, 10);
//     //         });

//     //     }
//     // }, 200);

//     // });
//   });
