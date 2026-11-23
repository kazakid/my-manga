// ============================================================
// TÌM KIẾM SỔ XUỐNG (dùng chung cho trang chủ và các trang chapter)
// - Trang chủ: đọc danh sách truyện từ các .manga-card rồi lưu vào máy
// - Trang chapter: lấy danh sách đã lưu đó ra dùng
// ============================================================
(function () {
  var o = document.getElementById("searchInput");
  if (!o) return;

  var KEY = "danhSachTruyen";

  // Bỏ dấu tiếng Việt để gõ "truong" vẫn ra "Trường"
  function boDau(t) {
    return t.toLowerCase()
            .normalize("NFD")
            .replace(/[\u0300-\u036f]/g, "")
            .replace(/đ/g, "d");
  }


  // ---------- 1. Lấy danh sách truyện ----------
  var danhSach = [];
  var cacThe = document.querySelectorAll(".manga-card");

  if (cacThe.length > 0) {
    // Đang ở trang chủ: đọc từ các thẻ truyện
    cacThe.forEach(function (the) {
      var a = the.querySelector("a[href]");
      var img = the.querySelector("img");
      var h3 = the.querySelector("h3");
      if (!a || !h3) return;            // bỏ thẻ chưa có link

      danhSach.push({
        ten: h3.textContent.trim(),
        anh: img ? img.getAttribute("src") : "",
        link: a.getAttribute("href"),
        lang: the.dataset.lang || ""
      });
    });

    try { localStorage.setItem(KEY, JSON.stringify(danhSach)); } catch (e) {}

  } else {
    // Đang ở trang chapter: lấy danh sách trang chủ đã lưu
    try { danhSach = JSON.parse(localStorage.getItem(KEY) || "[]"); }
    catch (e) { danhSach = []; }
  }


  // ---------- 2. Tạo khung sổ xuống ----------
  var khung = o.parentElement;
  if (getComputedStyle(khung).position === "static") {
    khung.style.position = "relative";
  }

  var hop = document.createElement("div");
  hop.className = "search-dropdown";
  khung.appendChild(hop);

  var viTri = -1;     // mục đang được chọn bằng phím mũi tên

  function dong() {
    hop.classList.remove("open");
    viTri = -1;
  }

  function hienThi() {
    var tuKhoa = boDau(o.value.trim());
    if (!tuKhoa) { dong(); return; }

    var ketQua = danhSach.filter(function (t) {
      return boDau(t.ten).includes(tuKhoa);
    }).slice(0, 8);                      // tối đa 8 gợi ý

    hop.innerHTML = "";
    viTri = -1;

    if (ketQua.length === 0) {
      var trong = document.createElement("div");
      trong.className = "sd-empty";
      trong.textContent = danhSach.length
        ? "Không tìm thấy truyện nào."
        : "Chưa có danh sách truyện. Hãy mở trang chủ một lần.";
      hop.appendChild(trong);
    }

    ketQua.forEach(function (t) {
      var muc = document.createElement("a");
      muc.className = "sd-item";
      muc.href = t.link;

      var anh = document.createElement("img");
      anh.src = t.anh;
      anh.alt = "";

      var chu = document.createElement("div");
      var tieuDe = document.createElement("div");
      tieuDe.className = "sd-title";
      tieuDe.textContent = t.ten;
      chu.appendChild(tieuDe);

      if (t.lang === "en") {
        var phu = document.createElement("div");
        phu.className = "sd-sub";
        phu.textContent = "Truyện tiếng Anh";
        chu.appendChild(phu);
      }

      muc.appendChild(anh);
      muc.appendChild(chu);
      hop.appendChild(muc);
    });

    // Đặt khung ngay dưới ô tìm kiếm, rộng bằng ô tìm kiếm
    hop.style.left = o.offsetLeft + "px";
    hop.style.top = (o.offsetTop + o.offsetHeight + 6) + "px";
    hop.style.width = o.offsetWidth + "px";
    hop.classList.add("open");
  }


  // ---------- 3. Sự kiện ----------
  o.addEventListener("input", hienThi);
  o.addEventListener("focus", hienThi);

  // Bấm ra ngoài thì đóng
  document.addEventListener("click", function (e) {
    if (!khung.contains(e.target)) dong();
  });

  // Phím mũi tên lên/xuống, Enter để mở, Esc để đóng
  o.addEventListener("keydown", function (e) {
    if (e.key === "Escape") { dong(); return; }
    if (!hop.classList.contains("open")) return;

    var cacMuc = hop.querySelectorAll(".sd-item");
    if (cacMuc.length === 0) return;

    if (e.key === "ArrowDown") {
      e.preventDefault();
      viTri = (viTri + 1) % cacMuc.length;
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      viTri = (viTri - 1 + cacMuc.length) % cacMuc.length;
    } else if (e.key === "Enter" && viTri >= 0) {
      e.preventDefault();
      cacMuc[viTri].click();
      return;
    } else {
      return;
    }

    cacMuc.forEach(function (m, i) {
      m.classList.toggle("active", i === viTri);
    });
  });
})();
