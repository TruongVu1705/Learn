document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    const res = await fetch("http://localhost:3000/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      // Nếu login thành công -> chuyển tới Google Maps
      window.location.href = "https://www.google.com/maps";
    } else {
      alert(data.message || "Đăng nhập thất bại");
    }
  } catch (error) {
    alert("Không thể kết nối tới server");
    console.error(error);
  }
});
