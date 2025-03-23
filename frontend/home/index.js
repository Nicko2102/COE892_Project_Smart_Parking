async function getUserLocation() {
    return fetch("https://api.ipify.org?format=json")
      .then((res) => res.json())
      .then((data) => {
        return fetch(`https://api.ipapi.is?q=${data.ip}`).then((res2) => res2.json());
      });
  }
  
  async function getData(city) {
    return fetch(`http://10.0.0.206:5500/data/${city}`)
      .then((res) => res.json())
      .then((data) => {
        return data;
      });
  }
  
  async function init() {
    const userLocation = await getUserLocation();
    const city = userLocation.location.city;
    document.getElementById("city").innerText = city;
    let d = document.getElementById("latest");
  
    const data = await getData(city);
  
    data["data"].forEach((e) => {
      // id, city, province, country, type, totalreports, status, lat, long, time
      // [(1, 'Hamilton', 'ON', 'Canada', 1, 3, 1, 43.2501, -79.8496, datetime.datetime(2025, 1, 24, 3, 19, 30))]
      // e is an array of the above
      const block = document.createElement("div");
      block.className = "report-block";
      block.innerHTML = `
        <div class="card mb-3">
        <div class="card-body d-flex flex-column flex-md-row">
          <div class="report-details mb-3 mb-md-0" style="flex: 1;">
          <h5 class="card-title">Report ID: ${e[0]}</h5>
          <p class="card-text"><strong>City:</strong> ${e[1]}</p>
          <p class="card-text"><strong>Province:</strong> ${e[2]}</p>
          <p class="card-text"><strong>Country:</strong> ${e[3]}</p>
          <p class="card-text"><strong>Type:</strong> ${e[4]}</p>
          <p class="card-text"><strong>Total Reports:</strong> ${e[6]}</p>
          <p class="card-text"><strong>Status:</strong> ${e[5]}</p>
          <p class="card-text"><strong>Time:</strong> ${new Date(e[9]).toLocaleString()}</p>
          </div>
          <div class="map-container" style="flex: 1;">
          <iframe
            width="600"
            height="400"
            frameborder="0"
            scrolling="no"
            marginheight="0"
            marginwidth="0"
            src="https://maps.google.com/maps?q=${e[7]},${e[8]}&hl=en-US&amp;z=14&amp;output=embed"
          >
          </iframe>
          </div>
        </div>
        </div>
      `;
      d.appendChild(block);
    });
  }
  
  init();
  