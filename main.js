function initialize(){
    const hamburger = document.getElementById('hamburger');
    const menu = document.getElementById('menu');
    hamburger.addEventListener('click', () => menu.classList.toggle('item-collapse-mobile'), false);
}

window.addEventListener('load', initialize, false);
