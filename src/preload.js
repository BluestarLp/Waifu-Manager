const electron = require("electron");
const fs = require("fs");
const emptyDir = require("empty-dir");
const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", (event) => {
  //Variablen SemiGlobal

  const contentContainer = document.getElementById("contentContainer");

  //Menüband
  
  function SwitchMaximizedStatus() {
    document.getElementById('maximize').classList.toggle('maximized');
  }

  ipcRenderer.on('IsMaximized' , () => {
    SwitchMaximizedStatus();
    document.getElementById('maximize').querySelector('img').src = "images/unmaximized-white.png";
  })

  ipcRenderer.on('IsUnmaximized', () => {
    SwitchMaximizedStatus();
    document.getElementById('maximize').querySelector('img').src = "images/maximize-white.png";
  })

  document.getElementById("quit").addEventListener("click", () => {
    ipcRenderer.send('quit');
  });

  document.getElementById("maximize").addEventListener("click", () => {
    if (document.getElementById('maximize').classList.contains('maximized')) {
      ipcRenderer.send('unmaximize');
    } else {
      ipcRenderer.send('maximize');
    }    
  });

  document.getElementById("minimize").addEventListener("click", () => {
    ipcRenderer.send('minimize');
  });

  //Navigaton

  document.getElementById("start").addEventListener("click", () => {
    fs.readFile("src/Seiten/start.html", "utf8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
      randomWaifu();
    });
  });
  
  document.getElementById("waifuListe").addEventListener("click", () => {
    fs.readFile("src/Seiten/waifuliste.html", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let contentWrapper = document.querySelector(".contentWrapper");
      if (contentWrapper.classList.contains("waifuL")) {
        console.log("Sie sind bereits auf dieser Seite!");
      } else {
        // Neue Seite + Waifu Array
        contentContainer.innerHTML = data;
        waifuListeimport();
      }
    });
  });

  function randomWaifu() {
    function checkIfEmpty(result) {
      if (result === true) {
        document.querySelector('.sMiddle').innerHTML = '<h2>Wie es aussieht, haben Sie noch keine Waifus angelegt:</h2><button id="newWaifu" class="newWaifuPage">+</button>';
      } else {
        
        let pfad = "src/waifus/";
        let waifus = fs.readdirSync(pfad);
        let i = Math.floor(Math.random() * waifus.length);
        let waifu = pfad + waifus[i] + "/";
        
        console.log(waifu);

        let daten = fs.readFileSync(waifu + "daten.json", "utf8", (err, data) => {
          return data;
        })

        daten = JSON.parse(daten);

        let Profilbild = (daten.bild === true) ? "waifus/" + waifus[i] + "/profilbild.png" : "";
        let Vorname = daten.vorname;
        let Nachname = daten.nachname;

        document.querySelector('.sMiddle').innerHTML = `
          <div class="waifuWrapper">
              <div class="profilbild">
                <img src="images/standard-avatar.png">
                <img src="${Profilbild}">
              </div>
              <div class="information">
                <div class="name">
                  <span class="queryname">${Vorname} ${Nachname}</span>
                  <div class="">

                  </div>
                </div>
                <button id="startProfil" class="profil"><span style="display: none;">${Vorname.toLowerCase()}-${Nachname.toLowerCase()}</span>Profil</button>
              </div>
            </div>
        `;
      }
    }

    emptyDir('src/waifus', (err, result) => {
      if (err) {
        console.error(err);
      } else {
        checkIfEmpty(result);
      }
    });
   
  }

  randomWaifu();

  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("profil")) {
      showWaifu(e);
    }
  })

  function formatDate(date) {
    let datum = date;
    let erstesMinus = datum.indexOf("-");
    let zweitesMinus = datum.indexOf("-", erstesMinus + 1);
    let jahr = datum.slice(0, erstesMinus);
    let monat = datum.slice(erstesMinus + 1, zweitesMinus);
    let tag = datum.slice(zweitesMinus + 1);
    let NeuesDatum = tag + "." + monat + "." + jahr;
    console.log(NeuesDatum);
    return NeuesDatum;
  }

  function showWaifu(e) {
    let a = e.target.firstChild.innerHTML;
      let pfad = "src/waifus/" + a + "/";
      let datenDatei = fs.readFileSync(pfad + "daten.json", "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          return err;
        } else {
          return data;
        }
      });

      let daten = JSON.parse(datenDatei);

      //Variablen

      function favorit() {
        if (daten.favorit === true) {
          return "Ja";
        } else {
          return "Nein";
        }
      }

      let Profilbild = (daten.bild === true) ? "waifus/" + a + "/profilbild.png" : "";
      let Vorname = daten.vorname;
      let Nachname = daten.nachname;
      let Geburtsdatum = formatDate(daten.geburtsdatum);
      let Alter = daten.alter;
      let Augenfarbe = daten.augenfarbe;
      let Haarfarbe = daten.haarfarbe;
      let Favorit = favorit();
      let Farbe = daten.farbe;
      let Beschreibung = daten.beschreibung;
      console.log(daten);
      let inhalt = `
        <div class="contentWrapper viewWaifu" style="--akzentFarbe: var(--backgroundColor);">
          <h1>Waifu: ${Vorname} ${Nachname}</h1>
          <div class="informationContainer">
              <div class="dataContainer1">
                <div class="waifuPicture">
                  <img src="images/standard-avatar.png">
                  <img src="${Profilbild}">
                </div>
                <div class="contentLine">
                  <span>Vorname:</span><span>${Vorname}</span>
                </div>
                <hr>
                <div class="contentLine">
                  <span>Nachname:</span><span>${Nachname}</span>
                </div>
            </div>
            <div class="dataContainer2">
              <div class="contentLine">
                <span>Geburtsdatum:</span><span>${Geburtsdatum}</span>
              </div>
              <hr>
              <div class="contentLine">
                <span>Alter:</span><span>${Alter}</span>   
              </div>
              <hr>
              <div class="contentLine">
                <span>Augenfarbe:</span><span>${Augenfarbe}</span>            
              </div>
            </div>
            <div class="dataContainer3">
              <div class="contentLine">
                <span>Haarfarbe:</span><span>${Haarfarbe}</span>            
              </div>
              <hr>
              <div class="contentLine">
                <span>Favorit:</span><span>${Favorit}</span>            
              </div>
              <hr>
              <div class="contentLine">
                <span>Lieblingsfarbe:</span><span>${Farbe}</span>            
              </div>
            </div>
            
          </div> 
            <div class="beschreibung">
              <h1>Beschreibung:</h1>
              <div class="beschreibungContainer">
                ${Beschreibung}
              </div>
            </div>
        </div>
        `;
      contentContainer.innerHTML = inhalt;
      console.log(a);
  }

  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("waifuCard")) {
      showWaifu(e);
    } else {

    }
  });

  function waifuListeimport() {
    let pfad = "src/waifus/";
    let waifus = fs.readdirSync(pfad);
    document.querySelector(".favoriteContainer").innerHTML = "";
    document.querySelector(".waifuListContainer").innerHTML = "";
    for (let i = 0; i < waifus.length; i++) {
      let waifu = waifus[i];
      let neuerpfad = pfad + waifu + "/";
      let information = fs.readFileSync(neuerpfad + "daten.json","utf-8",(err, data) => {
          if (err) {
            console.error(err);
          } else {
            return data;
          }
        }
      );
      information = JSON.parse(information);
      let vorname = information.vorname;
      let nachname = information.nachname;
      let bildpfad = (information.bild === true) ? "waifus/" + waifu + "/profilbild.png" : "";
      let CardTemplate = "<div class='waifuCard'><span style='display: none;'>" + vorname.toLowerCase() +  "-" + nachname.toLowerCase() + "</span><img src='images/standard-avatar.png'>" + "<img src=" + bildpfad + ">" + "<span><span>" + vorname + " " + nachname + "</span></span></div>";
      if (information.favorit === true) {
        document.querySelector(".favoriteContainer").innerHTML += CardTemplate;
        document.querySelector(".waifuListContainer").innerHTML += CardTemplate;
      } else {
        document.querySelector(".waifuListContainer").innerHTML += CardTemplate;
      }      
    }
  }

  document.getElementById("tierListe").addEventListener("click", () => {
    fs.readFile("src/Seiten/tierliste.html", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
    });
  });
  document.getElementById("bilderGallerie").addEventListener("click", () => {
    fs.readFile("src/Seiten/bildergallerie.html", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
    });
  });

  //Aktive Seite
  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("newWaifuPage")) {
      fs.readFile("src/Seiten/addwaifu.html", "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        contentContainer.innerHTML = data;
        document.querySelector(".active").classList.remove("active");
        document.getElementById("waifuListe").classList.add("active");
      });
    }
  });

  //Add Waifu

   //ErrorHandling

  function ErrorHandling(Type, Error) {
    let GenWarnung = document.querySelector(".GenWarnung");
    switch (Type) {
      case 0: //Pflichtfelder
        GenWarnung.style.display = "block";
        GenWarnung.innerHTML += "<span>Nicht alle Pflichtfelder wurden ausgefüllt!</span>";
        contentContainer.scrollTo(0, document.querySelector('.contentWrapper').scrollHeight);
        break;
      case 1: //Ordner/Waifu existiert bereits
        GenWarnung.style.display = "block";
        GenWarnung.innerHTML += "<span>Eine Waifu unter diesem Namen existiert bereits!</span>";
        contentContainer.scrollTo(0, document.querySelector('.contentWrapper').scrollHeight);
        break;
      case 2: //Unerwartetes Problem
        GenWarnung.style.display = "block";
        GenWarnung.innerHTML += "<span>Ein unerwartetes Problem ist aufgetreten: \n ${Error}</span>";
        break;
    }
  }

  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("speichern")) {
      document.querySelector(".GenWarnung").innerHTML = "";

      //Variablen

      let vorname = document.getElementById("vorname").value;
      let nachname = document.getElementById("nachname").value;
      let geburtsdatum = document.getElementById("geburtsdatum").value;
      let alter = document.getElementById("alter").value;
      let augenfarbe = document.getElementById("augenfarbe").value;
      let haarfarbe = document.getElementById("haarfarbe").value;
      let checkBoxF = document.getElementById("accentCheckbox");
      let farbe = document.getElementById("lieblingsfarbe").value;
      let favorit = document.getElementById("favorit").checked;
      let beschreibung = document.getElementById("beschreibung").value;

      if (vorname != "" && nachname != "") {
        let obj = {
          vorname: vorname,
          nachname: nachname,
          geburtsdatum: geburtsdatum,
          alter: alter,
          augenfarbe: augenfarbe,
          haarfarbe: haarfarbe,
          farbe: farbauswahl(),
          favorit: favorit,
          beschreibung: beschreibung,
          bild: TestBild()
        };

        function farbauswahl() {
          if (checkBoxF.checked) {
            return farbe;
          } else {
            return false;
          }
        }

        console.log(obj);
        let daten = JSON.stringify(obj);
        console.log(daten);
        let folder = "src/waifus/" + obj.vorname.toLowerCase() + "-" + obj.nachname.toLowerCase();
        console.log(folder);

        if (fs.existsSync(folder)) {
          console.log("Ordner existiert bereits!");
          ErrorHandling(1);
        } else {
          fs.mkdir(folder, { recursive: true }, (err) => {
            if (err) {
              console.error(err);
            } else {
              console.log("Ordner erstellt!");
              let datenJSON = folder + "/daten.json";
              fs.writeFile(datenJSON, daten, (err) => {
                if (err) {
                  console.error(err);
                  return;
                }
              });
            }
          });
        

        //Profilbild

        let profilbild = document.querySelector(".Profilbild").src;
        let profilbildTest = profilbild.substr(profilbild.length - 10); // = index.html, da src = ""

        if (profilbildTest != "index.html") {
          console.log(profilbild);
          var bild = profilbild.replace(/^data:image\/\w+;base64,/, "");

          let bildpfad = folder + "/profilbild.png";

          fs.writeFileSync(bildpfad, bild, { encoding: "base64" }, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
          ClickWaifuList();
        } else {
          console.log("Kein Bild hinzugefügt!");
          ClickWaifuList();
        }
       }
        function TestBild() {
          let profilbild = document.querySelector(".Profilbild").src;
          let profilbildTest = profilbild.substr(profilbild.length - 10); // = index.html, da src = ""  
         
          if (profilbildTest != "index.html") {
            return true;
          } else {
            return false;
          }
        }

        function ClickWaifuList() {
          document.getElementById('waifuListe').click();
        }       
        
      } else {
        console.log("Pflichtfelder nicht ausgefüllt");
        ErrorHandling(0);
      }
    }
  });

  //WaifuListe
});
