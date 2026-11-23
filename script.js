const searchInput = document.getElementById("searchInput");
const filterEnBtn = document.getElementById("filterEnBtn");
const allCards = document.querySelectorAll(".manga-card");

let dangLocEN = false;   // true khi đang bật nút "Truyện EN"

// Bỏ dấu tiếng Việt để gõ "truong" vẫn ra "Trường"
function boDau(text) {
    return text
        .toLowerCase()
        .normalize("NFD")
        .replace(/[\u0300-\u036f]/g, "")
        .replace(/đ/g, "d");
}

// Hiện/ẩn truyện theo TỪ KHÓA và nút lọc EN cùng lúc
function capNhatDanhSach() {
    const keyword = boDau(searchInput.value.trim());

    allCards.forEach(function (card) {
        const ten = boDau(card.querySelector("h3").textContent);

        const khopTen = ten.includes(keyword);
        const khopNgonNgu = !dangLocEN || card.dataset.lang === "en";

        card.style.display = (khopTen && khopNgonNgu) ? "" : "none";
    });
}

// ===== Tìm kiếm: gõ chữ nào thì lọc truyện theo chữ đó =====
searchInput.addEventListener("input", capNhatDanhSach);


// ===== Nút Random =====
const randomButton = document.getElementById("randomMangaBtn");
const randomResult = document.getElementById("randomResult");

if (randomButton && randomResult) {
    randomButton.addEventListener("click", function() {

        const mangaCards = Array.from(
            document.querySelectorAll(".manga-card")
        ).filter(card => card.querySelector("a[href]"));

        if (mangaCards.length === 0) {
            alert("Chưa có truyện để random!");
            return;
        }

        let drawn = JSON.parse(
            localStorage.getItem("randomMangaDrawn") || "[]"
        );

        const limit = Math.min(10, mangaCards.length);

        if (drawn.length >= limit) {
            drawn = [];
        }

        const available = mangaCards
            .map((card, index) => index)
            .filter(index => !drawn.includes(index));

        const randomIndex = Math.floor(
            Math.random() * available.length
        );

        const selectedIndex = available[randomIndex];
        const selectedCard = mangaCards[selectedIndex];

        drawn.push(selectedIndex);

        localStorage.setItem(
            "randomMangaDrawn",
            JSON.stringify(drawn)
        );

        const link = selectedCard.querySelector("a[href]");
        const img = selectedCard.querySelector("img");
        const title = selectedCard.querySelector("h3");

        randomResult.innerHTML = `
            <a href="${link.href}">
                <img src="${img.src}" alt="${img.alt}">
            </a>
            <h3>${title.textContent}</h3>
        `;

        randomResult.style.display = "block";
    });
}


// ===== Nút lọc truyện tiếng Anh =====
filterEnBtn.addEventListener("click", function () {
    dangLocEN = !dangLocEN;   // bấm 1 lần bật, bấm lần nữa tắt
    filterEnBtn.classList.toggle("active", dangLocEN);
    capNhatDanhSach();
});


// ===== Nhận từ khóa từ trang chapter (đường link có dạng ?q=chữ) =====
const tuKhoa = new URLSearchParams(location.search).get("q");

if (tuKhoa) {
    searchInput.value = tuKhoa;
    capNhatDanhSach();
}