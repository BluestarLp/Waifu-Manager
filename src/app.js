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
