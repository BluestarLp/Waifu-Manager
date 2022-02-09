const wrapper = document.getElementById('wrapper');
const contentContainer = document.getElementById('contentContainer');
const start = document.getElementById('start');
const waifuListe = document.getElementById('waifuListe');
const tierListe = document.getElementById('tierListe');
const bilderGallerie = document.getElementById('bilderGallerie');
const settings = document.getElementById('settings');
const settingsMenu = document.getElementById('settingsMenu');
const info = document.getElementById('info');
const infoMenu = document.getElementById('infoMenu');
const popup = document.getElementById('popup');

//Startseite

info.addEventListener('click', () => {
    infoMenu.style.display = "block";
    popup.style.display = "block";
})

document.querySelectorAll('#close').forEach((item) => {
    item.addEventListener('click', () => {
        settingsMenu.style.display = "none";
        infoMenu.style.display = "none";
        popup.style.display = "none";
    })
})

document.querySelectorAll('.link').forEach((item) => {
    item.addEventListener('click', (e) => {
        document.querySelector('.active').classList.remove('active');
        if (e.target.classList.contains('link')) {
            e.target.classList.add('active');
        }
    })
})

document.querySelectorAll('.link').forEach((item) => {
    item.addEventListener('mousemove',(e) => {
        let x = e.pageX - item.offsetLeft - window.scrollX;
        let y = e.pageY - item.offsetTop - window.scrollY - 30;
        item.style.setProperty('--x', x + 'px');
        item.style.setProperty('--y', y + 'px');
    })
})


