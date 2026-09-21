// ==============================================================================
// Smart Lexicon AI - Content Script
// Hiển thị nút tra cứu AI nổi khi người dùng bôi đen từ vựng
// ==============================================================================

(function () {
  let floatingBtn = null;
  let currentSelectionText = "";

  function removeFloatingBtn() {
    if (floatingBtn && floatingBtn.parentNode) {
      floatingBtn.parentNode.removeChild(floatingBtn);
    }
    floatingBtn = null;
  }

  function handleSelection(e) {
    // Không xử lý nếu click trúng chính nút bấm nổi
    if (floatingBtn && floatingBtn.contains(e.target)) {
      return;
    }

    const selection = window.getSelection();
    const text = selection ? selection.toString().trim() : "";

    // Điều kiện hiển thị nút: từ 1 đến 80 ký tự, không chứa xuống dòng quá nhiều
    if (text.length >= 1 && text.length <= 80 && !text.includes("\n\n")) {
      currentSelectionText = text;

      try {
        const range = selection.getRangeAt(0);
        const rect = range.getBoundingClientRect();

        // Không hiển thị nếu selection vô hình
        if (rect.width === 0 || rect.height === 0) {
          removeFloatingBtn();
          return;
        }

        if (!floatingBtn) {
          floatingBtn = document.createElement("div");
          floatingBtn.className = "smart-lexicon-floating-bubble";
          floatingBtn.innerHTML = `
            <span class="smart-lexicon-bubble-icon">✨</span>
            <span class="smart-lexicon-bubble-text">Tra AI</span>
          `;

          floatingBtn.addEventListener("mousedown", (evt) => {
            evt.preventDefault();
            evt.stopPropagation();
            if (currentSelectionText) {
              chrome.runtime.sendMessage({
                action: "LOOKUP_WORD",
                word: currentSelectionText,
              });
              removeFloatingBtn();
            }
          });

          document.body.appendChild(floatingBtn);
        }

        // Đặt vị trí nút nổi ngay trên hoặc dưới đoạn văn bản được chọn
        const scrollX = window.pageXOffset || document.documentElement.scrollLeft;
        const scrollY = window.pageYOffset || document.documentElement.scrollTop;

        let top = rect.bottom + scrollY + 8;
        let left = rect.left + scrollX + rect.width / 2 - 36;

        // Nếu quá sát cạnh dưới màn hình, hiển thị phía trên
        if (rect.bottom + 45 > window.innerHeight) {
          top = rect.top + scrollY - 38;
        }

        floatingBtn.style.top = `${Math.max(10, top)}px`;
        floatingBtn.style.left = `${Math.max(10, left)}px`;
      } catch (err) {
        removeFloatingBtn();
      }
    } else {
      removeFloatingBtn();
    }
  }

  // Lắng nghe sự kiện nhả chuột và nhả phím
  document.addEventListener("mouseup", (e) => {
    setTimeout(() => handleSelection(e), 20);
  });

  document.addEventListener("mousedown", (e) => {
    if (floatingBtn && !floatingBtn.contains(e.target)) {
      removeFloatingBtn();
    }
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape") {
      removeFloatingBtn();
    }
  });
})();
