// import { socket } from "./global.js";

// scuffed way to implement componenents in vanilla JS
class Navbar extends HTMLElement {
  constructor() {
    super();
    this.page = this.getAttribute("page");
    this.load();
  }

  async load() {
    this.innerHTML = await loader("../navbar.html");
    this.style.zIndex = "1000";
    this.style.position = "relative";
    this.addToggleBehavior();
    this.addAlertSocket();
  }

  // mobile collapseable navbar: toggle between X and hamburger icon
  addToggleBehavior() {
    const navbarToggler = this.querySelector("#navbarToggler");
    const togglerIcon = this.querySelector("#togglerIcon");

    if (navbarToggler && togglerIcon) {
      navbarToggler.addEventListener("click", () => {
        if (togglerIcon.classList.contains("fa-bars")) {
          togglerIcon.classList.remove("fa-bars");
          togglerIcon.classList.add("fa-times");
        } else {
          togglerIcon.classList.remove("fa-times");
          togglerIcon.classList.add("fa-bars");
        }
      });
    }
  }

  // alert live info at current city
  addAlertSocket() {
    socket.addEventListener("message", (event) => {
      const closeBtn = document.createElement("div");
      closeBtn.innerHTML = '<i class="fa fa-times"></i>';
      closeBtn.style.position = "absolute";
      closeBtn.style.top = "10px";
      closeBtn.style.right = "10px";
      closeBtn.addEventListener("click", () => {
        closeBtn.parentElement.remove();
      });

      const alertElement = document.createElement("div");
      alertElement.classList.add("alert", "alert-warning");
      alertElement.style.position = "relative";
      alertElement.innerHTML = event.data;
      alertElement.appendChild(closeBtn);

      document.querySelector("#alert").appendChild(alertElement);
    });
  }
}

async function loader(f) {
  const res = await fetch(f);
  if (res.ok) {
    return await res.text();
  } else {
    console.error(`Failed to fetch ${f}`);
  }
}

window.customElements.define("navbar-component", Navbar);
