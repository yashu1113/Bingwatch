<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Netflix-Style Slider</title>
  <style>
    body {
      margin: 0;
      font-family: Arial, sans-serif;
      background-color: #000;
      color: #fff;
    }
    .slider-container {
      position: relative;
      width: 100%;
      height: 90vh;
      overflow: hidden;
    }
    .slider-wrapper {
      display: flex;
      transition: transform 0.5s ease-in-out;
      height: 100%;
    }
    .slider-item {
      position: relative;
      flex: 0 0 100%;
      height: 100%;
    }
    .slider-item img {
      width: 100%;
      height: 100%;
      object-fit: cover;
      object-position: center;
    }
    .slider-item iframe {
      position: absolute;
      top: 0;
      left: 0;
      width: 100%;
      height: 100%;
      display: none; /* Default hidden */
    }
    .slider-item.active iframe {
      display: block; /* Show iframe only on active slider */
    }
    .controls {
      position: absolute;
      top: 50%;
      width: 100%;
      display: flex;
      justify-content: space-between;
      transform: translateY(-50%);
    }
    .control-btn {
      background-color: rgba(0, 0, 0, 0.5);
      border: none;
      color: white;
      font-size: 2rem;
      cursor: pointer;
      padding: 0.5rem 1rem;
      user-select: none;
    }
    .control-btn:hover {
      background-color: rgba(255, 255, 255, 0.5);
    }
  </style>
</head>
<body>
  <div class="slider-container">
    <div class="slider-wrapper">
      <!-- Slider Item 1 -->
      <div class="slider-item active">
        <img src="https://via.placeholder.com/1600x900" alt="Movie 1">
        <iframe src="https://www.youtube.com/embed/VIDEO_ID1?autoplay=1&mute=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>
      </div>
      <!-- Slider Item 2 -->
      <div class="slider-item">
        <img src="https://via.placeholder.com/1600x900/ff0000" alt="Movie 2">
        <iframe src="https://www.youtube.com/embed/VIDEO_ID2?autoplay=1&mute=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>
      </div>
      <!-- Slider Item 3 -->
      <div class="slider-item">
        <img src="https://via.placeholder.com/1600x900/00ff00" alt="Movie 3">
        <iframe src="https://www.youtube.com/embed/VIDEO_ID3?autoplay=1&mute=1" frameborder="0" allow="autoplay" allowfullscreen></iframe>
      </div>
    </div>
    <!-- Controls -->
    <div class="controls">
      <button class="control-btn prev">❮</button>
      <button class="control-btn next">❯</button>
    </div>
  </div>

  <script>
    const sliderWrapper = document.querySelector('.slider-wrapper');
    const sliderItems = document.querySelectorAll('.slider-item');
    const prevBtn = document.querySelector('.prev');
    const nextBtn = document.querySelector('.next');
    let currentIndex = 0;

    function updateSlider(index) {
      // Update active class
      sliderItems.forEach((item, i) => {
        item.classList.toggle('active', i === index);
      });
      // Slide the wrapper
      sliderWrapper.style.transform = `translateX(-${index * 100}%)`;
    }

    function autoplayTrailer() {
      const activeItem = sliderItems[currentIndex];
      const iframes = document.querySelectorAll('iframe');
      // Pause all trailers
      iframes.forEach(iframe => {
        iframe.src = iframe.src; // Reset iframe to stop video
      });
      // Autoplay the active trailer
      const iframe = activeItem.querySelector('iframe');
      if (iframe) {
        iframe.src = iframe.src.replace('&autoplay=0', '&autoplay=1'); // Ensure autoplay is enabled
      }
    }

    prevBtn.addEventListener('click', () => {
      currentIndex = (currentIndex - 1 + sliderItems.length) % sliderItems.length;
      updateSlider(currentIndex);
      autoplayTrailer();
    });

    nextBtn.addEventListener('click', () => {
      currentIndex = (currentIndex + 1) % sliderItems.length;
      updateSlider(currentIndex);
      autoplayTrailer();
    });

    // Auto-slide every 5 seconds
    setInterval(() => {
      nextBtn.click();
    }, 5000);

    // Autoplay the first trailer on load
    autoplayTrailer();
  </script>
</body>
</html>
