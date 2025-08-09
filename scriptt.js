window.onload = function() {
    const images = [];
    for (let i = 1; i <= 33; i++) {
        images.push(`images/${i}.png`);
    }

    const imageContainer = document.getElementById("random-image");
    const refreshButton = document.getElementById("refresh-button");

    function showRandomImage() {
        const randomIndex = Math.floor(Math.random() * images.length);
        imageContainer.src = images[randomIndex];
        localStorage.setItem("lastImage", images[randomIndex]);
    }

    refreshButton.addEventListener("click", showRandomImage);

    const lastImage = localStorage.getItem("lastImage");
    if (lastImage) {
        imageContainer.src = lastImage;
    } else {
        showRandomImage();
    }
};
