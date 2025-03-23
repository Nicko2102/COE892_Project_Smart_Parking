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

async function getAvailable(floor) {
    // dict = {
    //     start: "2025-03-23 11:00:00",
    //     end: "2025-03-23 13:00:00"
    // }
    return fetch(`http://localhost:8000/floors/${floor}/available`,
        {
            method: "PUT",
            headers: {'Content-Type': 'application/json'}, //'Access-Control-Allow-Origin': 'http://localhost:5500'},
            body: JSON.stringify({
                start: "2025-03-23 11:00:00",
                end: "2025-03-23 13:00:00"
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

function updateStartDate(e) {
    console.log(e.target.value);
}

function updateEndDate(e) {
    console.log(e.target.value);
}

function updateStartTime(e) {
    console.log(e.target.value);
}

function updateEndTime(e) {
    console.log(e.target.value);
}

async function init() {
    

    const userLocation = await getUserLocation();
    const city = userLocation.location.city;
    document.getElementById("city").innerText = city;
    let g = document.getElementById("mapGrid");
  
    const data = await getAvailable(0);
    const layoutInfo = await getFloorInfo(0);
    const spotsPerRow = Math.ceil(layoutInfo[1]/layoutInfo[2]);
    console.log(spotsPerRow + ", " + layoutInfo[1] + ", " + layoutInfo[2]);

    let dd = {0: "AAAA", 2: "abab", 1: "cccc"};
    console.log(Object.keys(dd).sort());

    let spotCount = 0;
    let rowCount = 0;
  
    (Object.keys(data).sort()).forEach((key) => {
      // id, city, province, country, type, totalreports, status, lat, long, time
      // [(1, 'Hamilton', 'ON', 'Canada', 1, 3, 1, 43.2501, -79.8496, datetime.datetime(2025, 1, 24, 3, 19, 30))]
      // e is an array of the above
        if (spotCount == 0) {
            rowCount++;
            const row = document.createElement("div");
            row.className = "map-row";
            row.id = `row-${rowCount}`;
            row.style.flexWrap = "wrap";
            row.style.width = "100%";
            row.style.display = "flex";
            g.appendChild(row);
        }
        const block = document.createElement("div");
        block.style.height = "300px";
        // block.style.maxWidth = "300px";
        block.style.backgroundColor = (data[key] == -1 ? "#88ff88" : "#ff8888");
        block.style.margin = "5px";
        block.style.display = "inline-block";
        block.style.flexGrow = "1";
        block.className = "spot";
        if (data[key] != -1) {
            block.className = "hoverCell";
            block.innerHTML = `
                <div class="hoverDiv">
                    ${(data[key].length)}
                </div>
            `;

        }
        let r = document.getElementById(`row-${rowCount}`);
        r.appendChild(block);
        spotCount++;
        spotCount %= spotsPerRow;
    });
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
