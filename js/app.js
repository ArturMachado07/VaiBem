const slides =
document.querySelectorAll('.slide');

const dots = document.querySelectorAll('.dot');

let current = 0;
let sliderInterval;

function showSlide(index){

slides[current].classList.remove('active');

current = index;

slides[current].classList.add('active');
}

function nextSlide(){

showSlide((current + 1) % slides.length);
}

dots.forEach((dot, index) => {
dot.addEventListener('click', () => {
showSlide(index % slides.length);

clearInterval(sliderInterval);
sliderInterval = setInterval(nextSlide, 5000);
});
});

sliderInterval = setInterval(nextSlide,5000);
