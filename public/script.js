document.getElementById("loginForm").addEventListener("submit", async function (e) {
  e.preventDefault();

  const email = e.target[0].value;
  const password = e.target[1].value;

  try {
    // Dùng đường dẫn tương đối thay vì localhost
    const res = await fetch("/login", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "ngrok-skip-browser-warning": "true"
      },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json();

    if (res.ok) {
      window.location.href = "https://www.google.com/maps";
    } else {
      alert(data.message || "Đăng nhập thất bại");
    }
  } catch (error) {
    alert("Không thể kết nối tới server");
    console.error(error);
  }
});
