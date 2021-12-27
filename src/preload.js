const fs = require("fs");
const emptyDir = require("empty-dir");
const { ipcRenderer } = require("electron");

document.addEventListener("DOMContentLoaded", (event) => {
  //Variablen SemiGlobal

  const contentContainer = document.getElementById("contentContainer");

  //Funktionen

  function scrollToElement(element) {
    element.scrollIntoView({block: "start", behavior: "smooth"});
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

  //randomWaifu();

  //WaifuListe

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
    a = a.replace("<span>",""); // Anfang span klick
    a = a.replace("</span>","");
    a = a.replace(" ", "-");
    a = a.toLowerCase();
    a = a.trim(); // Ende
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
    } else if (e.target.classList.contains("profil2")) {
      showWaifu(e);
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
    fs.readFile("src/Seiten/tierliste.html", "utf-8", (err, data) => {
      if (err) {
        console.error(err);
        return;
      }
      contentContainer.innerHTML = data;
      ImportWaifusinTierList();
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
        //contentContainer.scrollTo(0, document.querySelector('.contentWrapper').scrollHeight);
        let div = document.querySelector('.GenWarnung');
        scrollToElement(div);
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
          farbe: (checkBoxF.checked === true) ? farbe : false,
          favorit: favorit,
          beschreibung: beschreibung,
          bild: TestBild(),
          tierlist: false
        };

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
          setTimeout(document.getElementById('start').click(), 1000);
        }       
        
      } else {
        console.log("Pflichtfelder nicht ausgefüllt");
        ErrorHandling(0);
      }
    }
  });

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
    let waifus = fs.readdirSync("src/waifus/");
    let bilder = [];
    // Bilder Array
    for (let i = 0; i < waifus.length; i++) {
      let bildordner = fs.readdirSync("src/waifus/" + waifus[i] + "/bilder/");
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
    console.log(seiten);

    let bilderErsteSeite = (bilder.length > bilderanzahl) ? bilderanzahl : bilder.length;

    for (let a = 0; a < seiten; a++) {
      console.log("a = " + a);
      
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
      console.log(row);
      
      for (let b = 0; b < bilderProSeite; b++) {
        
        if (bilderErsteSeite > f) {
          row[x].innerHTML += `<img src="${bilder[i]}" style="var('--opacity', 0)" onload="setTimeout(this.style.opacity = 1, 1000);">`;
          f++
        } else {
          row[x].innerHTML += `<img src="${bilder[i]}" style="var('--opacity', 0)">`;
        }
        
        console.log(b);
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
    console.log("Anzahl Seiten: " + pageNumber);

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
      console.log("5 oder weniger Seiten!"); 

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
              console.log("Von 5 aus!");
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
    console.log(seite);
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
          fs.writeFileSync(`src/waifus/${name}/tierliste.txt`, waifus[i].parentNode.id, (err) => {
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
          console.log('START');
          setTimeout(() => {
            item.style.display = 'none';
          },0)
        })

        item.addEventListener('dragend', () => {
          console.log('ENDE');
          setTimeout(()=> {
            draggedItem.style.display = 'block';
            draggedItem = null;
          },0)
        })

        

        for (let x = 0; x < list.length; x++) {
          let listen = list[i];


          listen.addEventListener('dragover', function(e) {
            e.preventDefault();
          })

          listen.addEventListener('dragenter', function(e) {
            e.preventDefault();
            this.style.backgroundColor = "var(--backgroundColorDark)";
          })

          listen.addEventListener('dragover', function(e) {
            this.style.backgroundColor = "var(--backgroundColorDark)";
          })

          listen.addEventListener('dragleave', function(e) {
            this.style.backgroundColor = "var(--backgroundColor)";
          })

          listen.addEventListener('drop', function(e) {
            this.append(draggedItem);
            this.style.backgroundColor = "var(--backgroundColor)";
          })
        }
      }
    }

    // Load Waifus in List

    function ImportWaifusinTierList() {
      let pfad = "src/waifus/";
      let waifus = fs.readdirSync(pfad);

      for (let i = 0; i < waifus.length; i++) {
        let daten = fs.readFileSync(pfad + waifus[i] + "/daten.json");

        daten = JSON.parse(daten);

        let tierListPosition = fs.readFileSync(pfad + waifus[i] + "/tierliste.txt").toString();

        let waifu = `
          <div class="tierCharacterWrapper">
            <div class="WaifuName" data-waifu-name="${daten.vorname} ${daten.nachname}">
              <img src="waifus/${waifus[i]}/profilbild.png">
            </div>
          </div>`;

        if (tierListPosition !== "Offen") {
          document.querySelector(`[data-waifu-tier=${tierListPosition}]`).innerHTML += waifu;
        }
      }
    }

    function LoadWaifusinTierList() {
      let pfad = "src/waifus/";
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

        let WaifuName = `<li draggable="true">${daten.vorname} ${daten.nachname}</li>`;

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
