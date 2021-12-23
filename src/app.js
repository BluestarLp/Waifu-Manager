//Neue Waifu
//Bildvorschau & Dateicheck
function previewFile() {
  var preview = document.querySelector(".Profilbild");
  var file = document.getElementById("bildauswahl").files[0];
  var reader = new FileReader();

  reader.onloadend = function () {
    preview.src = reader.result;
  };

  if (file) {
    reader.readAsDataURL(file);
  } else {
    preview.src = "";
  }
}

function validateFileType() {
  var fileName = document.getElementById("bildauswahl").value;
  var idxDot = fileName.lastIndexOf(".") + 1;
  var extFile = fileName.substr(idxDot, fileName.length).toLowerCase();
  if (extFile == "jpg" ||extFile == "jpeg" ||extFile == "png" ||extFile == "gif" ||extFile == "bmp") {
    previewFile();
    let warnung = document.querySelector(".warnung");
    if (typeof warnung != "undefined" && warnung != null) {
      warnung.remove();
    }
  } else {
    document.getElementById("bildauswahl").remove();

    let warnung = document.querySelector(".warnung");
    if (typeof warnung != "undefined" && warnung != null) {
      warnung.remove();
      document.querySelector(".bildauswahlContainer").innerHTML +=
        "<input name='neu' type='file' accept='.png,.jpg,.jpeg,.gif,.bmp' onchange='validateFileType()' id='bildauswahl'>";
      document.querySelector(".bildauswahlContainer").innerHTML +=
        "<span class='warnung' style='color: rgb(245, 89, 89); font-size: 1rem; margin-top: 0.5rem;'>Es sind nur JPG, PNG, GIF und BMP Bilddateien erlaubt!</span>";
    } else {
      document.querySelector(".bildauswahlContainer").innerHTML +=
        "<input name='neu' type='file' accept='.png,.jpg,.jpeg,.gif,.bmp' onchange='validateFileType()' id='bildauswahl'>";
      document.querySelector(".bildauswahlContainer").innerHTML +=
        "<span class='warnung' style='color: rgb(245, 89, 89); font-size: 1rem; margin-top: 0.5rem;'>Es sind nur JPG, PNG, GIF und BMP Bilddateien erlaubt!</span>";
    }
  }
}

function Checkbox() {
  let checkbox = document.getElementById("accentCheckbox");
  let farbauswahl = document.getElementById("lieblingsfarbe");

  if (checkbox.checked == true) {
    farbauswahl.style.display = "block";
  } else {
    farbauswahl.style.display = "none";
  }
}

   //Drag

function dragElement(elmnt) {
    var pos1 = 0, pos2 = 0, pos3 = 0, pos4 = 0;
    if (document.getElementById(elmnt.id + "header")) {
      // if present, the header is where you move the DIV from:
      document.getElementById(elmnt.id + "header").onmousedown = dragMouseDown;
    } else {
      // otherwise, move the DIV from anywhere inside the DIV:
      elmnt.onmousedown = dragMouseDown;
    }
    
    function dragMouseDown(e) {
      e = e || window.event;
      e.preventDefault();
      // get the mouse cursor position at startup:
      pos3 = e.clientX;
      pos4 = e.clientY;
      document.onmouseup = closeDragElement;
      // call a function whenever the cursor moves:
      document.onmousemove = elementDrag;
    }
    
    function elementDrag(e) {
      e = e || window.event;
      e.preventDefault();
      // calculate the new cursor position:
      pos1 = pos3 - e.clientX;
      pos2 = pos4 - e.clientY;
      pos3 = e.clientX;
      pos4 = e.clientY;
      // set the element's new position:
      elmnt.style.top = (elmnt.offsetTop - pos2) + "px";
      elmnt.style.left = (elmnt.offsetLeft - pos1) + "px";
    }
    
    function closeDragElement() {
        // stop moving when mouse button is released:
      document.onmouseup = null;
      document.onmousemove = null;
    }
}
  
dragElement(document.getElementById('settingsMenu'));
dragElement(document.getElementById('infoMenu'));

