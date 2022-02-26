const fs = require("fs");
const emptyDir = require("empty-dir");
const { ipcRenderer, shell } = require("electron");
const path = require("path");
const request = require("request");
const extract = require("extract-zip");

document.addEventListener("DOMContentLoaded", (event) => {
  //Variablen SemiGlobal

  const contentContainer = document.getElementById("contentContainer");

  //Funktionen
  let einstobjekt;

  function Einstellungen() {

    if (fs.existsSync(`${__dirname}/einstellungen.json`)) {
      einstobjekt = fs.readFileSync(`${__dirname}/einstellungen.json`);
    } else {
      einstobjekt = fs.readFileSync(`${__dirname}/standard-einstellungen.json`);
    }

    einstobjekt = JSON.parse(einstobjekt);

    return einstobjekt;
  }

  Einstellungen();

  function scrollToElement(element) {
    element.scrollIntoView({block: "start", behavior: "smooth"});
  }

  function PopupEntf() {
    document.getElementById("popup").style.display = "none";
    
    let innereElemente = document.getElementById("popup").children;
    
    for (let i = 0; i < innereElemente.length; i++) {
      innereElemente[i].style.display = "none";
    }
  }

  function Loli_Alarm() {
    if (document.getElementById("alter").value < 14) {
      document.getElementById("alter").parentNode.querySelector(".warnungStyle").style.display = "block";
    }

    document.getElementById("alter").addEventListener("input", () => {
      if (document.getElementById("alter").value < 14) {
        document.getElementById("alter").parentNode.querySelector(".warnungStyle").style.display = "block";
      } else {
        document.getElementById("alter").parentNode.querySelector(".warnungStyle").style.display = "none";
      }
    })
  }

    // Alle Datein in einem Ordner

  const getAllFiles = function(dirPath, arrayOfFiles) {
    files = fs.readdirSync(dirPath)
  
    arrayOfFiles = arrayOfFiles || []
  
    files.forEach(function(file) {
      if (fs.statSync(dirPath + "/" + file).isDirectory()) {
        arrayOfFiles = getAllFiles(dirPath + "/" + file, arrayOfFiles)
      } else {
        arrayOfFiles.push(path.join(__dirname, dirPath, "/", file))
      }
    })
  
    return arrayOfFiles
  }

  // Externe Links

  document.addEventListener("click", (e) => {
    if (e.target.id === "extern") {
      let url = e.target.getAttribute("href");
      shell.openExternal(url);
    }
  })

  // Menü öffnen

  document.getElementById('settings').addEventListener('click', () => {
    document.getElementById('settingsMenu').style.display = "flex";
    document.getElementById('popup').style.display = "block";

    let objekt;

    if (fs.existsSync(`${__dirname}/einstellungen.json`)) {
      objekt = fs.readFileSync(`${__dirname}/einstellungen.json`);
    } else {
      objekt = fs.readFileSync(`${__dirname}/standard-einstellungen.json`);
    }

    objekt = JSON.parse(objekt);

    document.getElementById("autoUpdates").checked = objekt.autoUpdates;
    document.getElementById("loliAlarm").checked = objekt.loliAlarm;
    document.getElementById("gallerieseiten").value = objekt.gallerieSeiten;
  })

  document.addEventListener("click", (e) => {
    if (e.target.id === "MenuSpeichern") {
      let objekt = {
        autoUpdates: document.getElementById("autoUpdates").checked,
        loliAlarm: document.getElementById("loliAlarm").checked,
        gallerieSeiten: parseInt(document.getElementById("gallerieseiten").value)
      }

      objekt = JSON.stringify(objekt);

      fs.writeFileSync(`${__dirname}/einstellungen.json`, objekt);

      PopupEntf();

      Einstellungen();
    }
  })

  document.addEventListener("click", (e) => {
    if (e.target.id === "einstLoeschen") {
      if (fs.existsSync(`${__dirname}/einstellungen.json`)) {
        fs.unlinkSync(`${__dirname}/einstellungen.json`);
      }

      PopupEntf();

      Einstellungen();

      document.getElementById("settings").click();
    }
  })

  // Neue Version herunterladen

  let VersionDatei = JSON.parse(fs.readFileSync(`${__dirname}/Version.json`));

  if (VersionDatei.Anzeigen === true) {
    document.getElementById("popup").style.display = "block";
    document.getElementById("Versionsdetails").style.display = "flex";

    document.querySelector(".UpdateName").innerText = VersionDatei.UpdateName;
    document.querySelector(".Versionsbeschreibung").innerText = VersionDatei.Notizen;
    document.querySelector(".Version").innerText = `Version: ${VersionDatei.Version}`;

    document.addEventListener("click", (e) => {
      if (e.target.id === "VersionSchließen") {

        PopupEntf();
        
        VersionDatei.Anzeigen = false;

        fs.unlinkSync(`${__dirname}/Version.json`);
        fs.writeFileSync(`${__dirname}/Version.json`, JSON.stringify(VersionDatei));
      }
    })
  }

  const GithubUrl = `https://api.github.com/repos/BluestarLp/Waifu-Manager/releases/latest`;

  async function UpdateCheck() {
    const antwort = await fetch(GithubUrl);

    const daten = await antwort.json();

    const Version = JSON.parse(fs.readFileSync(`${__dirname}/Version.json`));

    if (daten.tag_name !== Version.Version) {
      document.getElementById("popup").style.display = "block";
      document.getElementById("meldung").style.display = "flex";
      document.getElementById("meldung").innerHTML = `
      <div style="text-align: center;">
        Es gibt eine neue Version des Waifu-Managers, wollen Sie das Programm aktualisieren?
      </div>
      <div class="meldungButtonContainer">
        <button class="standard-button" id="aktualisieren">Aktualisieren</button>
        <button class="standard-button" onclick="PopupEntf();">Abbrechen</button>
      </div>
      `;

      document.getElementById("aktualisieren").addEventListener("click", () => {
        AppAktualisieren(daten, Version);
      });
    }
  }

  if (einstobjekt.autoUpdates) {
    UpdateCheck();
  }

  document.addEventListener("click", (e) => {
    if (e.target.id === "checkForUpdate") {
      UpdateCheck();
    }
  })

  async function AppAktualisieren(daten, Version) {

      const asset = await daten.assets[0].browser_download_url;

      document.getElementById("meldung").innerHTML = `
        <label for="downloadBar" style="text-align: center;">Downloadstatus:</label>
        <progress id="downloadBar" value="0" max="100"></progress>
        <div id="downloadStatus" style="text-align: center;">0%</div>
      `;

      fs.mkdirSync(`${__dirname}/Update/Extrahiert/`, { recursive: true });

      const zipDatei = `${__dirname}/Update/${daten.assets[0].name}`;

      const req = request({
        method: "GET",
        uri: asset
      });

      let received_bytes = 0;
      let total_bytes = 0;
      let prozent = null;
      let received_mb;
      let total_mb;

      const fileStream = fs.createWriteStream(zipDatei);

      req.pipe(fileStream);

      fileStream.on("error", (err) => {
        console.error(err);
      });

      req.on("error", (err) => {
        console.error(err);
      });

      req.on('response', data => {
          total_bytes = parseInt(data.headers['content-length']);
          total_mb = total_bytes / 1000000;
      });

      req.on('data', chunk => {
          received_bytes += chunk.length;
          prozent = received_bytes * 100 / total_bytes;
          received_mb = received_bytes / 1000000;
          document.getElementById("downloadBar").value = prozent.toFixed(2);
          document.getElementById("downloadStatus").innerText = `${prozent.toFixed(2)}% | ${received_mb.toFixed(2)} MB / ${total_mb.toFixed(2)} MB`;
      });

      req.on("end", async () => {
        fileStream.close();
        document.getElementById("downloadStatus").innerText = "Dateien werden verarbeitet...";
        console.log("Download abgeschlossen");

        try {
          await extract(zipDatei, { dir: `${__dirname}/Update/Extrahiert/` });
        } catch (err) {
          console.error(err);
        }

        let dateien = await getAllFiles(`${__dirname}/Update/Extrahiert/`)

        for (let i = 0; i < dateien.length; i++) {
          let letztes = dateien[i].lastIndexOf(`${__dirname}`);
      
          let string = dateien[i].slice(letztes);
      
          dateien[i] = string;

          let stats = fs.statSync(dateien[i]);

          if (stats.isFile()) {

            let inhalt = fs.readFileSync(dateien[i]);

            let parentDirectory = path.resolve(__dirname, "..");

            let pfad = dateien[i].replace(path.join(__dirname, "Update", "Extrahiert"), parentDirectory);

            fs.writeFileSync(pfad, inhalt, { recursive: true });
          }

          
        }

        fs.rmdirSync(`${__dirname}/Update/Extrahiert/`, { recursive: true });

        fs.unlinkSync(zipDatei);

        let Versionsdetails = {
          Version: daten.tag_name,
          UpdateName: daten.name,
          Notizen: daten.body,
          Anzeigen: true
        }

        Versionsdetails = JSON.stringify(Versionsdetails);

        fs.writeFileSync(`${__dirname}/Version.json`, Versionsdetails);

        document.getElementById("downloadStatus").innerText = "Anwendung wird Neugestartet";

        PopupEntf();
        
        setTimeout(() => {
          ipcRenderer.send("Neustart");
        }, 1000);

        console.log("Aktualisierung abgeschlossen!");
      });
    

  }

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
    fs.readFile(`${__dirname}/Seiten/start.html`, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
      randomWaifu();
    });
  });
  
  document.getElementById("waifuListe").addEventListener("click", () => {
    fs.readFile(`${__dirname}/Seiten/waifuliste.html`, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }

      let contentWrapper = document.querySelector(".contentWrapper");
      if (contentWrapper.classList.contains("waifuL")) {

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
        
        let pfad = `${__dirname}/waifus/`;
        let waifus = fs.readdirSync(pfad);
        let i = Math.floor(Math.random() * waifus.length);
        let waifu = pfad + waifus[i] + "/";

        let daten = fs.readFileSync(waifu + "daten.json", "utf-8", (err, data) => {
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

    emptyDir(`${__dirname}/waifus`, (err, result) => {
      if (err) {
        console.error(err);
      } else {
        checkIfEmpty(result);
      }
    });
   
  }

  randomWaifu();

  //WaifuListe

  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("profil")) {
      showWaifu(e.target.firstChild.innerHTML);
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
    return NeuesDatum;
  }

  function showWaifu(e) {
    let a = e;
    a = a.replace("<span>",""); // Anfang span klick
    a = a.replace("</span>","");
    a = a.replace(" ", "-");
    a = a.toLowerCase();
    a = a.trim(); // Ende
      let pfad = `${__dirname}/waifus/` + a + "/";
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

      let Profilbild = (daten.bild === true) ? "waifus/" + a + "/profilbild.png" : "";
      let Vorname = daten.vorname;
      let Nachname = daten.nachname;
      let Geburtsdatum = (daten.geburtsdatum === "") ? "k. A." : formatDate(daten.geburtsdatum);
      let Alter = (daten.alter === "") ? "k. A." : daten.alter;
      let Augenfarbe = (daten.augenfarbe === "") ? "k. A." : daten.augenfarbe;
      let Haarfarbe = (daten.haarfarbe === "") ? "k. A." : daten.haarfarbe;
      let Favorit = (daten.favorit === true) ? "Ja" : "Nein";
      let Farbe = (daten.farbe === false) ? "k. A." : `<div style='background-color: ${daten.farbe}; height: 100%; width: 50%;'></div>`;
      let Beschreibung = daten.beschreibung;
      let inhalt = `
        <div class="contentWrapper viewWaifu" style="--akzentFarbe: var(--backgroundColor);">
          <div class='MeldungWaifuWrapper' style='display: none;'>
            <div class='MeldungWaifu'>
              <div class="TextMeldung">
                Sind Sie sich sicher, dass Sie diese Waifu löschen wollen?
              </div>
              <div class="ActionButtonContainer">
                <button class='standard-button' id="waifuLoeschenSicher">Löschen</button>
                <button class='standard-button' onclick="document.querySelector('.MeldungWaifuWrapper').style.display = 'none'">Abbrechen</button>
              </div>
            </div> 
          </div>
          <div class='viewWaifuHeader'>
            <h1 style='padding: 0 8rem;' class='textoverflow'>Waifu: <span class='textoverflow' style="margin-left: 0.5rem;">${Vorname} ${Nachname}</span></h1>
            <div class="waifuDropdownWrapper">
              <button class="standard-button" id="waifuDatenBearbeiten">Bearbeiten</button>
              <div class="dropdownContainer">
                <button style='--count: 1;' class="standard-button" id="bilderHinzu">Bilder hinzufügen</button>
                <button style='--count: 0;' onclick="document.querySelector('.MeldungWaifuWrapper').style.display = 'flex'" class="standard-button" id="waifuLoeschen"><span>Löschen</span><img src='images/muelleimer.png' alt='' role='none presentation'></button>
              </div>
            </div>
          </div>
          <div class="informationContainer" data-waifu-name="${Vorname.toLowerCase()}-${Nachname.toLowerCase()}">
              <div class="dataContainer1">
                <div class="waifuPicture">
                  <img src="images/standard-avatar.png">
                  <img src="${Profilbild}">
                </div>
                <div class="contentLine">
                  <span>Vorname:</span><span class='textoverflow'>${Vorname}</span>
                </div>
                <hr>
                <div class="contentLine">
                  <span>Nachname:</span><span class='textoverflow'>${Nachname}</span>
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
  }

  contentContainer.addEventListener("click", (e) => {
    if (e.target.id === "waifuLoeschenSicher") {
      let WaifuName = document.querySelector('.viewWaifuHeader').querySelector('h1').innerText.replace('Waifu:', '').trim().replace(' ', '-').toLowerCase();

      document.querySelector('.MeldungWaifu').style.display = "none";
      fs.rmdirSync(`${__dirname}/waifus/${WaifuName}/`, {recursive: true});
      
      document.getElementById('waifuListe').click();
    }
  })

  contentContainer.addEventListener("click", (e) => {
    if (e.target.id === "bilderHinzu") {
      let waifuName = document.querySelector(".informationContainer").getAttribute("data-waifu-name");
      ipcRenderer.send("DateiFenster", waifuName);
    }
  })

  ipcRenderer.on("bilderSpeichern", (e, arg) => {
    arg = JSON.parse(arg);

    let alteBilder = fs.readdirSync(`${__dirname}/waifus/${arg.waifu}/bilder/`);

    for (let i = 0; i < alteBilder.length; i++) {
      alteBilder[i] = path.basename(alteBilder[i]);
    }

    let doppeldeBilder = [];

    for (let i = 0; i < arg.filePaths.length; i++) {
      if (alteBilder.includes(path.basename(arg.filePaths[i]))) {
        doppeldeBilder.push(arg.filePaths[i]);
      } else {
        fs.copyFileSync(arg.filePaths[i], `${__dirname}/waifus/${arg.waifu}/bilder/${path.basename(arg.filePaths[i])}`);
      }
    }

    if (doppeldeBilder.length !== 0) {
      let inhaltBox = document.querySelector(".inhaltBox");
      let buttonBox = document.querySelector(".buttonBox");

      let bilderInhalt = "";

      for (let i = 0; i < doppeldeBilder.length; i++) {
        bilderInhalt += `<li style="margin: 0.5rem 0; cursor: pointer; padding-right: 1rem;" data-bilder-link="${doppeldeBilder[i]}">${doppeldeBilder[i]}<input style="margin-left: 0.5rem;" type="checkbox"></li>`;
      }

      let doppeldListe = `<h1 style="text-align: center; font-size: 1.2rem;">Welche Bilder sollen überschrieben werden?</h1><ul class="doppeldeBilder">${bilderInhalt}</ul>`;

      document.querySelector(".inhaltBox").addEventListener("click", (e) => {
        if (e.target.tagName === 'LI') {
          
        }
      })

      document.getElementById("popup").style.display = "block";
      document.getElementById("AllgMeldung").style.display = "flex";

      inhaltBox.innerHTML = "";
      buttonBox.innerHTML = "";

      inhaltBox.innerHTML = doppeldListe;
      buttonBox.innerHTML = `<button class="standard-button" id="bilderueberschreiben">Speichern</button><button class="standard-button" id="bildAbbruch">Abbrechen</button>`;
    }
  })

  document.addEventListener("click", (e) => {
    if (e.target.id === "bildAbbruch") {
      PopupEntf();
    }
  })

  document.addEventListener("click", (e) => {
    if (e.target.id === "bilderueberschreiben") {
      let bilderCheckbox = document.querySelector(".doppeldeBilder").querySelectorAll("input");

      let bilderLinks = [];

      for (let i = 0; i < bilderCheckbox.length; i++) {
        if (bilderCheckbox[i].checked) {
          bilderLinks.push(bilderCheckbox[i].parentNode.getAttribute("data-bilder-link"));
        }
      }

      let waifu = document.querySelector(".informationContainer").getAttribute("data-waifu-name");

      for (let i = 0; i < bilderLinks.length; i++) {
        fs.copyFileSync(bilderLinks[i], `${__dirname}/waifus/${waifu}/bilder/${path.basename(bilderLinks[i])}`);
      }

      PopupEntf();
    }
  })

  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("waifuCard")) {
      showWaifu(e.target.firstChild.innerHTML);
    } else if (e.target.classList.contains("profil2")) {
      showWaifu(e.target.firstChild.innerHTML);
    }
  });

  function waifuListeimport() {
    let pfad = `${__dirname}/waifus/`;
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
      let CardTemplate = "<div class='waifuCard'><span style='display: none;'>" + vorname.toLowerCase() +  "-" + nachname.toLowerCase() + "</span><img src='images/standard-avatar.png'>" + "<img src=" + bildpfad + ">" + "<span class='profil2'><span>" + vorname + " " + nachname + "</span></span></div>";
      if (information.favorit === true) {
        document.querySelector(".favoriteContainer").innerHTML += CardTemplate;
        document.querySelector(".waifuListContainer").innerHTML += CardTemplate;
      } else {
        document.querySelector(".waifuListContainer").innerHTML += CardTemplate;
      }      
    }
  }

  document.getElementById("tierListe").addEventListener("click", () => {
    fs.readFile(`${__dirname}/Seiten/tierliste.html`, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
      ImportWaifusinTierList();
    });
  });

  document.getElementById("bilderGallerie").addEventListener("click", () => {
    fs.readFile(`${__dirname}/Seiten/bildergallerie.html`, "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;

      document.getElementById("bildanzahl").value = einstobjekt.gallerieSeiten;
    });
  });

  //Aktive Seite
  contentContainer.addEventListener("click", (e) => {
    if (e.target.classList.contains("newWaifuPage")) {
      fs.readFile(`${__dirname}/Seiten/addwaifu.html`, "utf-8", (err, data) => {
        if (err) {
          console.error(err);
          return;
        }
        contentContainer.innerHTML = data;
        document.querySelector(".active").classList.remove("active");
        document.getElementById("waifuListe").classList.add("active");

        Loli_Alarm();
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
        //contentContainer.scrollTo(0, document.querySelector('.contentWrapper').scrollHeight);
        scrollToElement(GenWarnung);
        break;
      case 1: //Ordner/Waifu existiert bereits
        GenWarnung.style.display = "block";
        GenWarnung.innerHTML += "<span>Eine Waifu unter diesem Namen existiert bereits!</span>";
        scrollToElement(GenWarnung);
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
          farbe: (checkBoxF.checked === true) ? farbe : false,
          favorit: favorit,
          beschreibung: beschreibung.replaceAll("<", "&lt;").replaceAll(">", "&gt;"),
          bild: TestBild(),
          tierlist: false
        };

        let daten = JSON.stringify(obj);
        let folder = `${__dirname}/waifus/${obj.vorname.toLowerCase()}-${obj.nachname.toLowerCase()}`;

        if (document.querySelector('.speichern').classList.contains('bearbeiten') != true) {

          if (fs.existsSync(folder)) {
            ErrorHandling(1);
          } else {
            fs.mkdir(folder, { recursive: true }, (err) => {
              if (err) {
                console.error(err);
              } else {
                fs.mkdirSync(folder + "/bilder", (err) => {
                  if (err) {
                    console.error(err);
                  }
                }) 
                let datenJSON = folder + "/daten.json";
                fs.writeFileSync(datenJSON, daten, (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                });
                fs.writeFileSync(folder + "/tierliste.txt", "Offen", (err) => {
                  if (err) {
                    console.error(err);
                    return;
                  }
                })
              }
            });
          

          //Profilbild

          let profilbild = document.querySelector(".Profilbild").src;
          let profilbildTest = profilbild.substr(profilbild.length - 10); // = index.html, da src = ""

          if (profilbildTest != "index.html") {
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
            ClickWaifuList();
          }
        }
      } else {
        fs.writeFileSync(folder + "/daten.json", daten, (err) => {
          if (err) {
            console.error(err);
          }
        })

        let Profilbild = document.querySelector('.Profilbild').src;

        if (Profilbild.substr(Profilbild.length - 14) != "profilbild.png" && Profilbild.substr(Profilbild.length - 10 != "index.html")) {
          var bild = Profilbild.replace(/^data:image\/\w+;base64,/, "");

          let bildpfad = folder + "/profilbild.png";

          fs.writeFileSync(bildpfad, bild, { encoding: "base64" }, (err) => {
            if (err) {
              console.error(err);
              return;
            }
          });
        }
        ClickWaifuList();
      }

        
       // Hier
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
          setTimeout(document.getElementById('start').click(), 1000);
        }       
        
      } else {
        ErrorHandling(0);
      }
    }
  });

  // Waifu-Daten Bearbeiten 

  document.addEventListener('click', (e) => {
    if (e.target.id === "waifuDatenBearbeiten") {
      let WaifuName = document.querySelector('.viewWaifuHeader').querySelector('h1').innerText.replace('Waifu:', '').trim().replace(' ', '-').toLowerCase();
      let daten = fs.readFileSync(`${__dirname}/waifus/${WaifuName}/daten.json`).toString();
      daten = JSON.parse(daten);
      let Seite = fs.readFileSync(`${__dirname}/Seiten/addwaifu.html`).toString();

      contentContainer.innerHTML = Seite;

      document.querySelector('.Profilbild').src = (daten.bild === true) ? `waifus/${daten.vorname}-${daten.nachname}/profilbild.png` : "";

      document.getElementById("vorname").value = daten.vorname;
      document.getElementById("nachname").value = daten.nachname;
      document.getElementById("geburtsdatum").value = daten.geburtsdatum;
      document.getElementById("alter").value = daten.alter;
      document.getElementById("augenfarbe").value = daten.augenfarbe;
      document.getElementById("haarfarbe").value = daten.haarfarbe;
      document.getElementById("accentCheckbox").checked = (daten.farbe === false) ? false : true;
      document.getElementById("lieblingsfarbe").value = (daten.farbe === false) ? "" : daten.farbe;
      document.getElementById("lieblingsfarbe").style.display = (daten.farbe === false) ? "none" : "block";
      document.getElementById("favorit").checked = daten.favorit;
      document.getElementById("beschreibung").value = daten.beschreibung.replaceAll("&lt;", "<").replaceAll("&gt;", ">");

      document.querySelector('.speichern').classList.add('bearbeiten');

      Loli_Alarm();
    }
  })

  // Gallerie

  contentContainer.addEventListener("click", (e) => {
    if(e.target.classList.contains("loadimages")) {
      let zahl = document.getElementById("bildanzahl").value;
      if (zahl != 0 && zahl >= 1) {
        LoadImages(zahl);
      }   
    }
  })

  function LoadImages(bilderanzahl) {
    let waifus = fs.readdirSync(`${__dirname}/waifus/`);
    let bilder = [];
    // Bilder Array
    for (let i = 0; i < waifus.length; i++) {
      let bildordner = fs.readdirSync(`${__dirname}/waifus/${waifus[i]}/bilder/`);
      for (let x = 0; x < bildordner.length; x++) {
        let bildpfad = "waifus/" + waifus[i] + "/bilder/" + bildordner[x];
        bilder.push(bildpfad);
      }
    }

    let imageArea = document.querySelector(".imageArea");
    imageArea.innerHTML = "";
    
    let i = 0;
    let x = -4;
    let f = 0;

    let seiten = (bilder.length <= bilderanzahl) ? 1 : Math.ceil(bilder.length / bilderanzahl);
    
    let e = seiten - 1; 
    let d = bilderanzahl * e;

    let bilderErsteSeite = (bilder.length > bilderanzahl) ? bilderanzahl : bilder.length;

    for (let a = 0; a < seiten; a++) {
      
      let c = (a === e) ? bilder.length - d : bilderanzahl; //Letzte Seite
      let bilderProSeite = (seiten === 1) ? bilder.length : c; //Bilder pro Seite
      x = x + 4;
      document.querySelector('.imageArea').innerHTML += `
      <div class="bilderWrapper">
        <div class="row">
          
        </div>
        <div class="row">
          
        </div>
        <div class="row">
          
        </div>
        <div class="row">
          
        </div>
      </div>            
      `;
      
      let row = document.querySelectorAll(".row");
      
      for (let b = 0; b < bilderProSeite; b++) {
        
        if (bilderErsteSeite > f) {
          row[x].innerHTML += `<img src="${bilder[i]}" style="var('--opacity', 0)" onload="setTimeout(this.style.opacity = 1, 1000);">`;
          f++
        } else {
          row[x].innerHTML += `<img src="${bilder[i]}" style="var('--opacity', 0)">`;
        }
        
        i++
        if (x === 3 + 4 * a) {
          x = (3 + 4 * a) - 3; 
        } else {
          x++
        }
      }
      
    }

    //Seiten

    let pages = document.querySelectorAll(".bilderWrapper");
    let pageNumber = pages.length;
    let anzahlSeiten = "";

    document.querySelector(".seitenzahlen").innerHTML = "";
    if (pageNumber > 5) {

      for (let i = 0; i < 5; i++) {
        anzahlSeiten = anzahlSeiten + `<button class='standard-button seite'>${i + 1}</button>`;
      }

      document.querySelector(".seitenzahlen").innerHTML = `
      <div class="seitenContainer">
        <button class="standard-button" style='display: none;'>«</button>
        ${anzahlSeiten}
        <button class="standard-button">»</button>
      </div>
      `;
    } else {

      for (let i = 0; i < pageNumber; i++) {
        anzahlSeiten = anzahlSeiten + `<button class='standard-button seite'>${i + 1}</button>`;
      }

      document.querySelector(".seitenzahlen").innerHTML = `
      <div class="seitenContainer">
        ${anzahlSeiten}
      </div>
      `;
    }

    document.querySelectorAll('.seite')[0].classList.add("active");

    let Seitenzahl = document.querySelector(".seitenzahlen").querySelectorAll("button");

    for (let i = 0; i < Seitenzahl.length; i++) {
      Seitenzahl[i].addEventListener("click", (e) => {
        let ausgang = (e.target.classList.contains('active')) ? false : true;
        if (ausgang) {
          if (e.target.innerHTML === "«") {

            if (Seitenzahl[5].classList.contains('active')) {
              Seitenzahl[6].style.display = "block";
            }

            if (Seitenzahl[1].classList.contains('active')) {

              for (let i = 0; i < 5; i++) {
                let a = parseInt(Seitenzahl[i + 1].innerHTML) - 1;
                Seitenzahl[i + 1].innerHTML = a.toString();
              }

              Seitenwechsel(Seitenzahl[1].innerHTML);

            } else if (Seitenzahl[5].classList.contains('active')) {

              Seitenzahl[5].classList.remove('active');
              Seitenzahl[4].classList.add('active');
              Seitenwechsel(Seitenzahl[4].innerHTML);
            } else if (Seitenzahl[4].classList.contains('active')) {

              Seitenzahl[4].classList.remove('active');
              Seitenzahl[3].classList.add('active');
              Seitenwechsel(Seitenzahl[3].innerHTML);

            } else if (Seitenzahl[3].classList.contains('active')) {

              Seitenzahl[3].classList.remove('active');
              Seitenzahl[2].classList.add('active');
              Seitenwechsel(Seitenzahl[2].innerHTML);
              
            } else if (Seitenzahl[2].classList.contains('active')) {

              Seitenzahl[2].classList.remove('active');
              Seitenzahl[1].classList.add('active');
              Seitenwechsel(Seitenzahl[1].innerHTML);

            }

            if (Seitenzahl[1].innerHTML == "1" && Seitenzahl[1].classList.contains('active')) {
              Seitenzahl[0].style.display = "none";
            }
  
          } else if (e.target.innerHTML === "»") {

            if (Seitenzahl[1].classList.contains('active')) {
              Seitenzahl[0].style.display = "block";
            }

            if (Seitenzahl[5].classList.contains('active')) {
              for (let i = 0; i < 5; i++) {
  
                let a = parseInt(Seitenzahl[i + 1].innerHTML) + 1;
                Seitenzahl[i + 1].innerHTML = a.toString();
              }
  
              Seitenwechsel(Seitenzahl[5].innerHTML);
            } else if (Seitenzahl[4].classList.contains('active')) {

              Seitenzahl[4].classList.remove('active');
              Seitenzahl[5].classList.add('active');
              Seitenwechsel(Seitenzahl[5].innerHTML);

            } else if (Seitenzahl[3].classList.contains('active')) {

              Seitenzahl[3].classList.remove('active');
              Seitenzahl[4].classList.add('active');
              Seitenwechsel(Seitenzahl[4].innerHTML);

            } else if (Seitenzahl[2].classList.contains('active')) {

              Seitenzahl[2].classList.remove('active');
              Seitenzahl[3].classList.add('active');
              Seitenwechsel(Seitenzahl[3].innerHTML);
              
            } else if (Seitenzahl[1].classList.contains('active')) {

              Seitenzahl[1].classList.remove('active');
              Seitenzahl[2].classList.add('active');
              Seitenwechsel(Seitenzahl[2].innerHTML);

            }
            
             if (Seitenzahl[5].innerHTML == pageNumber.toString() && Seitenzahl[5].classList.contains('active')) {
              Seitenzahl[6].style.display = "none";
            }
            
          } else {
            if (pageNumber > 5) {
              
              if (Seitenzahl[5].innerHTML == pageNumber.toString() && Seitenzahl[5].classList.contains('active')) {
                Seitenzahl[6].style.display = "block";
              } else if (Seitenzahl[1].innerHTML == "1" && Seitenzahl[1].classList.contains('active')) {
                Seitenzahl[0].style.display = "block";
              }
            }
            

            if (e.target.innerHTML == pageNumber.toString() && pageNumber > 5) {
              
              Seitenzahl[6].style.display = "none";
            } else if (e.target.innerHTML == "1" && pageNumber > 5) {
              Seitenzahl[0].style.display = "none";
              
            }

            document.querySelector(".seitenzahlen").querySelector('.active').classList.remove('active');
            e.target.classList.add('active');
            Seitenwechsel(e.target.innerHTML);
          }
       }
        
      })
    }
  }

  // Seitenwechsel Gallerie

  function Seitenwechsel(seite) {
    document.querySelector(".imageArea").style.setProperty("--transform", ((seite - 1) * 100) * -1 + "%");    
    document.querySelector('.gallerie').scrollTop = 0;
    setTimeout(() => {
      document.querySelectorAll(".bilderWrapper")[seite - 1].style.setProperty("--opacity", "1")
    }, 1); 
  }

  //Tierliste

    //Bearbeiten
    document.addEventListener('click', (e) => {
      if (e.target.id === "tierBearbeiten") {
      let tierMenuSettings = document.getElementById('tierMenuSettings');
      tierMenuSettings.style.display = "block";
      tierMenuSettings.style.left = null;
      tierMenuSettings.style.top = "calc(var(--menuBarHeigth, 1.2rem) - 1px)";
      LoadWaifusinTierList();
      DragTierList();
      }
    })

    document.addEventListener('click', (e) => {
      if (e.target.id === "saveTierList") {
        let waifus = document.getElementById('tierMenuSettings').querySelectorAll('li');
        for (let i = 0; i < waifus.length; i++) {
          let name = waifus[i].innerText.toLowerCase().replace(' ','-');
          fs.writeFileSync(`${__dirname}/waifus/${name}/tierliste.txt`, waifus[i].parentNode.id, (err) => {
            if (err) {
              console.error(err);
            }
          })
          document.getElementById('tierMenuSettings').style.display = 'none';
          document.getElementById('tierListe').click();
        }
      }
    })

    // Drag und Drop

    function DragTierList() {
      const listItem = document.getElementById('tierMenuSettings').querySelectorAll('li');
      const list = document.getElementById('tierMenuSettings').querySelectorAll('ul');


      let draggedItem = null;

      for (let i = 0; i < listItem.length; i++) {
        let item = listItem[i];

        item.addEventListener('dragstart', () => {
          draggedItem = item;
          setTimeout(() => {
            item.style.display = 'none';
          },0)
        })

        item.addEventListener('dragend', () => {
          setTimeout(()=> {
            draggedItem.style.display = 'block';
            draggedItem = null;
          },0)
        })

        

        for (let x = 0; x < list.length; x++) {
          let listen = list[x];

          listen.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.backgroundColor = "var(--backgroundColorDark)";
          })

          listen.addEventListener('dragover', function(e) {
            e.preventDefault();
            this.style.backgroundColor = "var(--backgroundColorDark)";
          })

          listen.addEventListener('dragleave', function() {
            this.style.backgroundColor = "var(--backgroundColor)";
          })

          listen.addEventListener('drop', function() {
            this.append(draggedItem);
            this.style.backgroundColor = "var(--backgroundColor)";
          })
        }
      }
    }

    // Waifus in Liste laden

    function ImportWaifusinTierList() {
      let pfad = `${__dirname}/waifus/`;
      let waifus = fs.readdirSync(pfad);

      for (let i = 0; i < waifus.length; i++) {
        let daten = fs.readFileSync(pfad + waifus[i] + "/daten.json");

        daten = JSON.parse(daten);

        let tierListPosition = fs.readFileSync(pfad + waifus[i] + "/tierliste.txt").toString();

        let WaifuImg = (daten.bild === true) ? `<img src="waifus/${waifus[i]}/profilbild.png">` : `<img src='images/standard-avatar.png'>`;

        let waifu = `
          <div class="tierCharacterWrapper">
            <div class="WaifuName" data-waifu-name="${daten.vorname} ${daten.nachname}">
              ${WaifuImg}
            </div>
          </div>`;

        if (tierListPosition !== "Offen") {
          document.querySelector(`[data-waifu-tier=${tierListPosition}]`).innerHTML += waifu;
        }
      }
    }

    function LoadWaifusinTierList() {
      let pfad = `${__dirname}/waifus/`;
      let waifus = fs.readdirSync(pfad);

      document.querySelector('.newWaifus').innerHTML = `<ul id="Offen"></ul>`;

      document.querySelector('.tierlistWaifus').innerHTML = `
      <ul id="SS">

      </ul>
      <ul id="S">

      </ul>
      <ul id="A">

      </ul>
      <ul id="B">

      </ul>
      <ul id="C">

      </ul>
      <ul id="D">

      </ul>
      <ul id="E">

      </ul>
      <ul id="F">

      </ul>`;

      for (let i = 0; i < waifus.length; i++) {

        let Platzierung = fs.readFileSync(pfad + waifus[i] + "/tierliste.txt").toString();

        let daten = fs.readFileSync(pfad + waifus[i] + "/daten.json");

        daten = JSON.parse(daten);

        let WaifuName = `<li draggable="true" class="textoverflow">${daten.vorname} ${daten.nachname}</li>`;

        if (Platzierung === "Offen") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "SS") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "S") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "A") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "B") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "C") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "D") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "E") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        } else if (Platzierung === "F") {
          document.getElementById(Platzierung).innerHTML += WaifuName;
        }
      }
    }

});
